import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { openaiCredentials } from "@openai-oauth/react/server";
import { streamText } from "ai";

export const maxDuration = 60;
export const config = {
  maxDuration: 60,
};

function getWebHeaders(req: any): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    }
  }
  return headers;
}

const INSTRUCAO_SISTEMA_REFINAR_SITE = `Você é um desenvolvedor frontend especialista. O usuário já possui um site gerado em HTML e deseja aplicar uma alteração ou melhoria específica.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML atualizado completo da página.
2. NUNCA adicione saudações, explicações, notas ou conversas antes ou depois do código.
3. Comece exatamente com <!DOCTYPE html> e termine com </html>.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { currentCode, refinement, model } = req.body || {};

    if (!currentCode || !refinement) {
      return res.status(400).json({ error: 'Código atual e refinamento são obrigatórios.' });
    }

    const selectedModel = ['gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-5.4-mini'].includes(model)
      ? model
      : 'gpt-5.4-mini';

    const fullPrompt = `${INSTRUCAO_SISTEMA_REFINAR_SITE}

CÓDIGO HTML ATUAL DO SITE:
\`\`\`html
${currentCode}
\`\`\`

SOLICITAÇÃO DE ALTERAÇÃO/MELHORIA DO USUÁRIO:
"${refinement}"`;

    let openai;
    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      openai = createOpenAIOAuth(credentials);
    } catch (chatGptError: any) {
      console.error('Erro de autenticação no ChatGPT ao refinar:', chatGptError);
      return res.status(401).json({
        error: 'Autenticação do ChatGPT necessária. Conecte sua conta do ChatGPT usando o botão "Sign in with ChatGPT". ' + (chatGptError?.message || ''),
      });
    }

    try {
      const result = streamText({
        model: openai(selectedModel),
        prompt: fullPrompt,
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (typeof (res as any).flushHeaders === 'function') {
        (res as any).flushHeaders();
      }

      for await (const chunk of result.textStream) {
        res.write(chunk);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
      return res.end();
    } catch (streamErr: any) {
      console.error('Erro no refinamento via IA:', streamErr);
      if (!res.headersSent) {
        return res.status(401).json({
          error: 'Erro ao refinar o site via ChatGPT: ' + (streamErr?.message || ''),
        });
      }
      return res.end();
    }
  } catch (error: any) {
    console.error('Erro na Vercel API handler refine-site:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'Ocorreu um erro ao refinar o site.',
      });
    }
    return res.end();
  }
}

