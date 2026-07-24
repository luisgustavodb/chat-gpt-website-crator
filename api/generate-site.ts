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
      } catch (oauthErr) {
        console.warn('OAuth ChatGPT fallback para Gemini:', oauthErr);
      }
    }

    if (!rawOutput) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY não configurada no ambiente da Vercel. Gerando com motor de template local.');
        const fallbackHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${query}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
  <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg font-bold text-lg">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <span class="font-extrabold text-xl tracking-tight text-white">${query}</span>
      </div>
      <button onclick="document.getElementById('modal-demo').classList.remove('hidden')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg transition-all">
        Começar Agora
      </button>
    </div>
  </header>
  <section class="relative py-24 px-6 flex-1 flex items-center justify-center text-center">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
        <i class="fa-solid fa-sparkles"></i>
        <span>Plataforma Gerada para "${query}"</span>
      </div>
      <h1 class="text-4xl md:text-6xl font-black text-white leading-tight">
        Bem-vindo ao site de <span class="text-blue-400">${query}</span>
      </h1>
      <p class="text-slate-400 text-base max-w-xl mx-auto">
        Site gerado com sucesso! Para habilitar o modelo de inteligência artificial Gemini 3.6 Flash em tempo real na Vercel, adicione a chave GEMINI_API_KEY nas variáveis de ambiente do seu projeto.
      </p>
      <div class="pt-4 flex justify-center gap-4">
        <button onclick="document.getElementById('modal-demo').classList.remove('hidden')" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg">
          Explorar
        </button>
      </div>
    </div>
  </section>
  <div id="modal-demo" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
      <button onclick="document.getElementById('modal-demo').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
      <h3 class="text-xl font-bold text-white">Acessar ${query}</h3>
      <p class="text-xs text-slate-400">Digite seu e-mail para continuar.</p>
      <input type="email" placeholder="seu.email@exemplo.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" />
      <button onclick="alert('Cadastro realizado!'); document.getElementById('modal-demo').classList.add('hidden');" class="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
        Confirmar
      </button>
    </div>
  </div>
  <footer class="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
    © ${new Date().getFullYear()} ${query}. Todos os direitos reservados.
  </footer>
</body>
</html>`;
        return res.status(200).json({
          success: true,
          query,
          html: fallbackHtml,
          warning: 'GEMINI_API_KEY não configurada na Vercel.',
          generatedAt: new Date().toISOString(),
        });
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
