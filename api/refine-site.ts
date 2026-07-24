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
3. Comece exatamente com <!DOCTYPE html> e termine com </html>.

ADAPTAÇÃO TEMÁTICA AO REFINAR:
- Mantenha e aprofunde a identidade visual, vocabulário e elementos criativos adaptados ao tema do site.`;

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  const reqId = Math.random().toString(36).substring(2, 9);
  console.log(`\n==================================================`);
  console.log(`[VERCEL API - ${new Date().toISOString()}] 🚀 [Req #${reqId}] Nova solicitação POST em /api/refine-site`);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { currentCode, refinement, model } = req.body || {};
    console.log(`[VERCEL API - ${new Date().toISOString()}] 📝 [Req #${reqId}] Refinamento solicitado:`, {
      refinement: refinement ? `${refinement.substring(0, 80)}...` : null,
      codeLength: currentCode ? currentCode.length : 0,
      model: model || 'padrão (gpt-5.4-mini)',
    });

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
    const authStartTime = Date.now();
    console.log(`[VERCEL API - ${new Date().toISOString()}] 🔑 [Req #${reqId}] Obtendo credenciais OAuth do ChatGPT para refinamento...`);
    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      openai = createOpenAIOAuth(credentials);
      console.log(`[VERCEL API - ${new Date().toISOString()}] ✅ [Req #${reqId}] Credenciais validadas em ${Date.now() - authStartTime}ms.`);
    } catch (chatGptError: any) {
      console.error(`[VERCEL API - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro no ChatGPT OAuth ao refinar (${Date.now() - authStartTime}ms):`, chatGptError);
      return res.status(401).json({
        error: 'Autenticação do ChatGPT necessária. Conecte sua conta do ChatGPT usando o botão "Sign in with ChatGPT". ' + (chatGptError?.message || ''),
      });
    }

    try {
      const streamStartTime = Date.now();
      console.log(`[VERCEL API - ${new Date().toISOString()}] ⚡ [Req #${reqId}] Chamando streamText() para refinamento com ${selectedModel}...`);

      const result = streamText({
        model: openai(selectedModel),
        prompt: fullPrompt,
      });

      console.log(`[VERCEL API - ${new Date().toISOString()}] 📡 [Req #${reqId}] Flusando cabeçalhos HTTP 200 OK para evitar 504 Gateway Timeout...`);
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      });

      if (typeof (res as any).flushHeaders === 'function') {
        (res as any).flushHeaders();
      }

      let chunkCount = 0;
      let totalBytes = 0;
      let firstChunkTime: number | null = null;

      for await (const chunk of result.textStream) {
        if (chunkCount === 0) {
          firstChunkTime = Date.now();
          console.log(`[VERCEL API - ${new Date().toISOString()}] 🌊 [Req #${reqId}] Primeiro chunk do refinamento recebido! TTFB: ${firstChunkTime - streamStartTime}ms`);
        }

        chunkCount++;
        totalBytes += chunk.length;
        res.write(chunk);

        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }

        if (chunkCount % 20 === 0) {
          console.log(`[VERCEL API - ${new Date().toISOString()}] 📊 [Req #${reqId}] Refinando... Chunks: ${chunkCount}, Total: ${totalBytes} bytes (${((Date.now() - streamStartTime) / 1000).toFixed(1)}s decorridos)`);
        }
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[VERCEL API - ${new Date().toISOString()}] 🎉 [Req #${reqId}] Refinamento concluído com sucesso! Chunks: ${chunkCount}, Bytes: ${totalBytes}, Tempo: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log(`==================================================\n`);
      return res.end();
    } catch (streamErr: any) {
      console.error(`[VERCEL API - ${new Date().toISOString()}] 💥 [Req #${reqId}] Erro no stream de refinamento (${Date.now() - startTime}ms):`, {
        name: streamErr?.name,
        message: streamErr?.message,
        status: streamErr?.status,
        code: streamErr?.code,
      });

      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Erro ao refinar o site via ChatGPT: ' + (streamErr?.message || streamErr?.toString() || 'Timeout na API de IA'),
        });
      } else {
        res.write(`\n\n<!-- ERRO STREAMING REFINAMENTO: ${streamErr?.message || 'Interrompido'} -->`);
      }
      return res.end();
    }
  } catch (error: any) {
    console.error(`[VERCEL API - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro geral handler refine-site (${Date.now() - startTime}ms):`, error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'Ocorreu um erro ao refinar o site.',
      });
    }
    return res.end();
  }
}

