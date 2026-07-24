import { GoogleGenAI } from "@google/genai";
import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { generateText } from "ai";

const GENERATE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no prompt ou URL do usuário.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML completo da página.
2. NUNCA adicione saudações, introduções, comentários explicativos, notas, frases de efeito ou conversas.
3. O resultado deve conter APENAS o código HTML puro, começando com <!DOCTYPE html> e terminando com </html>.
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

  if (!html.toLowerCase().includes("<html") && !html.toLowerCase().includes("<!doctype html")) {
    html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <title>Site Gerado por IA</title>
</head>
<body class="bg-slate-50 text-slate-900 font-sans">
  ${html}
</body>
</html>`;
  }

  return html;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt, url, useChatGPT } = req.body || {};
    const query = prompt || url;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'O parâmetro de busca ou prompt é obrigatório.' });
    }

    let rawOutput = '';

    if (useChatGPT) {
      try {
        const openai = createOpenAIOAuth(req.headers as any);
        const fullUserPrompt = `${GENERATE_SITE_SYSTEM_PROMPT}\n\nINSTRUÇÕES DA SOLICITAÇÃO:\nGere um site completo e funcional em HTML5 para o seguinte pedido ou URL: "${query}". Crie uma experiência rica, interativa, com JavaScript funcional e design moderno em Tailwind CSS. Retorne ESTRITAMENTE O CÓDIGO HTML sem saudações ou texto antes/depois.`;

        const result = await generateText({
          model: openai('gpt-4o'),
          prompt: fullUserPrompt,
        });
        rawOutput = result.text || '';
      } catch (oauthErr: any) {
        console.warn('OAuth ChatGPT falhou na Vercel API:', oauthErr?.message);
      }
    }

    if (!rawOutput) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Chave de API GEMINI_API_KEY não encontrada no servidor. Configure a chave para usar a IA.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${GENERATE_SITE_SYSTEM_PROMPT}\n\nSOLICITAÇÃO DO USUÁRIO:\nGere um site completo e funcional para o seguinte pedido ou URL: "${query}". Crie uma experiência rica, interativa, com JavaScript funcional e design moderno em Tailwind CSS. Retorne APENAS o código HTML.`,
        config: {
          systemInstruction: GENERATE_SITE_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      rawOutput = response.text || '';
    }

    const htmlCode = cleanHtmlOutput(rawOutput);

    return res.status(200).json({
      success: true,
      query,
      html: htmlCode,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na Vercel API handler generate-site:', error);
    return res.status(500).json({
      error: error?.message || 'Ocorreu um erro ao gerar o site.',
    });
  }
}
