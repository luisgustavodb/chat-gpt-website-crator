import { GoogleGenAI } from "@google/genai";
import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { generateText } from "ai";

const REFINE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend especialista. O usuário já tem um site gerado em HTML e deseja aplicar uma alteração ou melhoria específica.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML atualizado completo da página.
2. NUNCA adicione saudações, explicações, notas ou conversas antes ou depois do código.
3. Comece exatamente com <!DOCTYPE html> e termine com </html>.
`;

function cleanHtmlOutput(raw: string): string {
  if (!raw) return "";
  let html = raw.trim();

  const codeBlockMatch = html.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    html = codeBlockMatch[1].trim();
  }

  const doctypeIndex = html.search(/<!DOCTYPE\s+html/i);
  if (doctypeIndex !== -1) {
    html = html.substring(doctypeIndex);
  } else {
    const htmlTagIndex = html.search(/<html/i);
    if (htmlTagIndex !== -1) {
      html = html.substring(htmlTagIndex);
    }
  }

  const closeHtmlIndex = html.search(/<\/html>/i);
  if (closeHtmlIndex !== -1) {
    html = html.substring(0, closeHtmlIndex + 7);
  }

  return html;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { currentCode, refinement, useChatGPT } = req.body || {};

    if (!currentCode || !refinement) {
      return res.status(400).json({ error: 'Código atual e refinamento são obrigatórios.' });
    }

    const userContent = `CÓDIGO HTML ATUAL:
\`\`\`html
${currentCode}
\`\`\`

SOLICITAÇÃO DE ALTERAÇÃO DO USUÁRIO:
"${refinement}"`;

    let rawOutput = '';

    if (useChatGPT) {
      try {
        const openai = createOpenAIOAuth(req.headers as any);
        const fullUserPrompt = `${REFINE_SITE_SYSTEM_PROMPT}\n\n${userContent}`;
        const result = await generateText({
          model: openai('gpt-4o'),
          prompt: fullUserPrompt,
        });
        rawOutput = result.text || '';
      } catch (oauthErr) {
        console.warn('OAuth ChatGPT refinamento fallback para Gemini:', oauthErr);
      }
    }

    if (!rawOutput) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userContent,
        config: {
          systemInstruction: REFINE_SITE_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      rawOutput = response.text || '';
    }

    const htmlCode = cleanHtmlOutput(rawOutput);

    return res.status(200).json({
      success: true,
      html: htmlCode,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na Vercel API handler refine-site:', error);
    return res.status(500).json({
      error: error?.message || 'Ocorreu um erro ao refinar o site.',
    });
  }
}
