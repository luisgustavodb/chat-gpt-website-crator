import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// System instruction for initial site generation
const GENERATE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no prompt ou URL do usuário.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML completo da página.
2. NUNCA adicione saudações, introduções, comentários explicativos, notas, frases de efeito ou conversas.
3. O resultado deve conter APENAS o código HTML puro, começando com <!DOCTYPE html> e terminando com </html>.

REGRAS DE DESIGN E ESTRUTURA:
- Inclua o CDN do Tailwind CSS no head: <script src="https://cdn.tailwindcss.com"></script>
- Inclua ícones do FontAwesome 6 CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
- Inclua Google Fonts no head ('Plus Jakarta Sans', 'Inter', 'Outfit', etc.).
- Design extremamente rico e sofisticado com Navbar, Hero, Recursos, Depoimentos, Preços, FAQ e Footer.
- ADICIONE JAVASCRIPT INTERATIVO REAL (Toggle de Tema, Modais, Accordions, Toasts).
`;

// System instruction for refining an existing site
const REFINE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend especialista. O usuário já tem um site gerado em HTML e deseja aplicar uma alteração ou melhoria específica.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML atualizado completo da página.
2. NUNCA adicione saudações, explicações, notas ou conversas antes ou depois do código.
3. Comece exatamente com <!DOCTYPE html> e termine com </html>.
`;

// Helper to extract clean HTML without commentary or markdown code blocks
function cleanHtmlOutput(raw: string): string {
  if (!raw) return "";
  let html = raw.trim();

  // Extract content inside ```html ... ``` if present
  const codeBlockMatch = html.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    html = codeBlockMatch[1].trim();
  }

  // Remove any text preceding <!DOCTYPE html> or <html>
  const doctypeIndex = html.search(/<!DOCTYPE\s+html/i);
  if (doctypeIndex !== -1) {
    html = html.substring(doctypeIndex);
  } else {
    const htmlTagIndex = html.search(/<html/i);
    if (htmlTagIndex !== -1) {
      html = html.substring(htmlTagIndex);
    }
  }

  // Remove any text following </html>
  const closeHtmlIndex = html.search(/<\/html>/i);
  if (closeHtmlIndex !== -1) {
    html = html.substring(0, closeHtmlIndex + 7);
  }

  // Fallback: If no html wrapper tag exists, wrap the content cleanly
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

// API endpoint to generate a site EXCLUSIVELY via ChatGPT
app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt, url } = req.body;
    const query = prompt || url;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "O parâmetro de busca ou prompt é obrigatório." });
    }

    const fullUserPrompt = `${GENERATE_SITE_SYSTEM_PROMPT}\n\nINSTRUÇÕES DA SOLICITAÇÃO DO USUÁRIO:\nGere um site completo, moderno e funcional em HTML5 para: "${query}". Crie uma experiência rica, interativa com JavaScript funcional e Tailwind CSS. Retorne ESTRITAMENTE O CÓDIGO HTML sem qualquer texto de explicação.`;

    try {
      const openai = createOpenAIOAuth(req.headers as any);
      const result = await generateText({
        model: openai("gpt-4o"),
        prompt: fullUserPrompt,
      });

      const rawOutput = result.text || "";
      const htmlCode = cleanHtmlOutput(rawOutput);

      res.json({
        success: true,
        query,
        html: htmlCode,
        generatedAt: new Date().toISOString(),
      });
    } catch (chatGptErr: any) {
      console.error("Erro no ChatGPT / OpenAI OAuth:", chatGptErr);
      return res.status(401).json({
        error: "Autenticação do ChatGPT necessária. Por favor, conecte sua conta do ChatGPT clicando no botão 'Sign in with ChatGPT'. " + (chatGptErr?.message || ""),
      });
    }
  } catch (error: any) {
    console.error("Erro ao gerar site:", error);
    res.status(500).json({
      error: error?.message || "Ocorreu um erro interno ao gerar o site.",
    });
  }
});

// API endpoint to refine an existing site EXCLUSIVELY via ChatGPT
app.post("/api/refine-site", async (req, res) => {
  try {
    const { currentCode, refinement } = req.body;

    if (!currentCode || !refinement) {
      return res.status(400).json({ error: "Código atual e refinamento são obrigatórios." });
    }

    const userContent = `CÓDIGO HTML ATUAL:
\`\`\`html
${currentCode}
\`\`\`

SOLICITAÇÃO DE ALTERAÇÃO DO USUÁRIO:
"${refinement}"`;

    const fullUserPrompt = `${REFINE_SITE_SYSTEM_PROMPT}\n\n${userContent}`;

    try {
      const openai = createOpenAIOAuth(req.headers as any);
      const result = await generateText({
        model: openai("gpt-4o"),
        prompt: fullUserPrompt,
      });

      const rawOutput = result.text || "";
      const htmlCode = cleanHtmlOutput(rawOutput);

      res.json({
        success: true,
        html: htmlCode,
        updatedAt: new Date().toISOString(),
      });
    } catch (chatGptErr: any) {
      console.error("Erro no ChatGPT / OpenAI OAuth no refinamento:", chatGptErr);
      return res.status(401).json({
        error: "Autenticação do ChatGPT necessária. Por favor, conecte sua conta do ChatGPT clicando no botão 'Sign in with ChatGPT'. " + (chatGptErr?.message || ""),
      });
    }
  } catch (error: any) {
    console.error("Erro ao refinamento do site:", error);
    res.status(500).json({
      error: error?.message || "Ocorreu um erro ao aplicar as alterações no site.",
    });
  }
});

// Preset templates for instant preview
app.get("/api/presets", (req, res) => {
  res.json([
    {
      id: "saas-landing",
      title: "Nova AI - Platform SaaS",
      url: "https://nova.ai/platform",
      description: "Landing page futurista para plataforma de Inteligência Artificial com preços, gráficos e depoimentos.",
      prompt: "Plataforma SaaS de Inteligência Artificial chamada Nova AI com dashboard interativo, tabela de preços e depoimentos.",
    },
    {
      id: "apple-watch",
      title: "Apple - Watch Ultra Studio",
      url: "https://apple.com/watch-ultra",
      description: "Vitrine de produto premium inspirada na Apple com seções imersivas, especificações e seletor de modelos.",
      prompt: "Site oficial no estilo Apple para o Apple Watch Ultra com design escuro de luxo, animações e especificações técnicas.",
    },
    {
      id: "dev-portfolio",
      title: "Lucas Silva - Fullstack Developer",
      url: "https://lucassilva.dev",
      description: "Portfólio moderno de desenvolvedor com filtro de projetos, skills interativas e modo escuro.",
      prompt: "Portfólio de engenheiro de software fullstack com lista de projetos filtrável, contatos, formulário e efeito matriz no fundo.",
    },
    {
      id: "analytics-dashboard",
      title: "MetricPulse - Dashboard Analytics",
      url: "https://metricpulse.io/dashboard",
      description: "Painel de controle financeiro e métricas em tempo real com gráficos, cartões de KPI e tabelas.",
      prompt: "Dashboard analítico responsivo para métricas SaaS com gráficos interativos Canvas, tabela de clientes e alertas.",
    },
    {
      id: "gourmet-restaurant",
      title: "Bistro L'Étoile - Gastronomia",
      url: "https://bistroletoile.com.br",
      description: "Site para restaurante gourmet com cardápio digital interativo, galeria de pratos e reservas online.",
      prompt: "Site elegante para restaurante francês gourmet com menu com abas de pratos, galeria de fotos e modal de reservas.",
    },
  ]);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor do Gerador de Sites em execução na porta ${PORT}`);
  });
}

startServer();
