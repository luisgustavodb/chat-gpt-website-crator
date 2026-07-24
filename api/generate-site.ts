import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { openaiCredentials } from "@openai-oauth/react/server";
import { generateText } from "ai";

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

const INSTRUCAO_SISTEMA_CRIAR_SITE = `Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no pedido do usuário.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML completo da página.
2. NUNCA adicione saudações, introduções, comentários explicativos, notas, frases de efeito ou conversas.
3. O resultado deve conter APENAS o código HTML puro, começando com <!DOCTYPE html> e terminando com </html>.`;

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
    const { prompt, url } = req.body || {};
    const query = prompt || url;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'O parâmetro de busca ou prompt é obrigatório.' });
    }

    // Coloca as instruções sempre ANTES na mensagem do prompt (sem usar campo de sistema)
    const fullPrompt = `${INSTRUCAO_SISTEMA_CRIAR_SITE}

INSTRUÇÕES DO PEDIDO DO USUÁRIO:
Gere um site completo, moderno e totalmente funcional em HTML5/Tailwind CSS para o seguinte pedido ou URL: "${query}". Crie uma experiência interativa rica. Retorne ESTRITAMENTE O CÓDIGO HTML sem qualquer texto explicativo ou introduções.`;

    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      const openai = createOpenAIOAuth(credentials);

      const result = await generateText({
        model: openai('gpt-5.4-mini'),
        prompt: fullPrompt,
      });

      const rawOutput = result.text || '';
      const htmlCode = cleanHtmlOutput(rawOutput);

      return res.status(200).json({
        success: true,
        query,
        html: htmlCode,
        generatedAt: new Date().toISOString(),
      });
    } catch (chatGptError: any) {
      console.error('Erro de autenticação/geração no ChatGPT:', chatGptError);
      return res.status(401).json({
        error: 'Autenticação do ChatGPT necessária. Conecte sua conta do ChatGPT usando o botão "Sign in with ChatGPT". ' + (chatGptError?.message || ''),
      });
    }
  } catch (error: any) {
    console.error('Erro na Vercel API handler generate-site:', error);
    return res.status(500).json({
      error: error?.message || 'Ocorreu um erro ao gerar o site.',
    });
  }
}
