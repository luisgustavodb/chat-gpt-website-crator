import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada nos segredos.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// System instruction for initial site generation
const GENERATE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no prompt ou URL do usuário.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML completo da página.
2. NUNCA adicione saudações, introduções, comentários explicativos, notas, frases de efeito ou conversas (ex: NÃO escreva "Aqui está seu site", "Espero que goste", "Com certeza!", etc).
3. O resultado deve conter APENAS o código HTML puro (pode estar envolvido em bloco \`\`\`html ... \`\`\`), começando com <!DOCTYPE html> e terminando com </html>.

REGRAS DE DESIGN E ESTRUTURA:
- Inclua o CDN do Tailwind CSS no head: <script src="https://cdn.tailwindcss.com"></script>
- Inclua ícones do FontAwesome 6 CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
- Inclua Google Fonts no head ('Plus Jakarta Sans', 'Inter', 'Outfit', etc.).
- Design extremamente rico e sofisticado:
   * Navbar fixa e responsiva com logo e menu.
   * Hero section impactante com call-to-action e imagens.
   * Recursos/Features com cards interativos.
   * Depoimentos/Social Proof com avatares.
   * Tabela de Preços com toggle mensal/anual se aplicável.
   * Seção de Perguntas Frequentes (FAQ) sanfonada/accordion funcional.
   * Formulário de contato com validação e toast de sucesso em JS.
   * Footer rico com links e redes sociais.
- Use imagens de alta qualidade do Unsplash relevantes (ex: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80, etc).
- ADICIONE JAVASCRIPT INTERATIVO REAL:
   * Toggle de Tema Claro/Escuro funcional.
   * Modais funcionais (ex: clique em "Começar Agora" abre modal).
   * Menu mobile hambúrguer funcional.
   * FAQ sanfonado (accordion) que expande/recolhe ao clicar.
   * Toasts/notificações no JS quando o usuário interage.
- Se o usuário digitar uma URL (ex: stripe.com, apple.com, github.com), recrie uma versão espetacular e moderna inspirada nesse serviço.
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

  return html;
}

// API endpoint to generate a site
app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt, url, useChatGPT } = req.body;
    const query = prompt || url;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "O parâmetro de busca ou prompt é obrigatório." });
    }

    let rawOutput = "";

    // If ChatGPT / OpenAI OAuth is requested and headers are present
    if (useChatGPT) {
      try {
        const openai = createOpenAIOAuth(req.headers as any);
        const result = await generateText({
          model: openai("gpt-4o"),
          system: GENERATE_SITE_SYSTEM_PROMPT,
          prompt: `Gere um site completo e funcional para o seguinte pedido ou URL: "${query}". Crie uma experiência rica, interativa, com JavaScript funcional e design moderno em Tailwind CSS.`,
        });
        rawOutput = result.text || "";
      } catch (oauthErr) {
        console.warn("OAuth ChatGPT não autenticado no servidor, usando Gemini como fallback:", oauthErr);
      }
    }

    // Fallback to Gemini if ChatGPT was not used or didn't return text
    if (!rawOutput) {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Gere um site completo e funcional para o seguinte pedido ou URL: "${query}". Crie uma experiência rica, interativa, com JavaScript funcional e design moderno em Tailwind CSS.`,
        config: {
          systemInstruction: GENERATE_SITE_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      rawOutput = response.text || "";
    }

    const htmlCode = cleanHtmlOutput(rawOutput);

    res.json({
      success: true,
      query,
      html: htmlCode,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao gerar site:", error);
    res.status(500).json({
      error: error?.message || "Ocorreu um erro interno ao gerar o site.",
    });
  }
});

// API endpoint to refine an existing site
app.post("/api/refine-site", async (req, res) => {
  try {
    const { currentCode, refinement, useChatGPT } = req.body;

    if (!currentCode || !refinement) {
      return res.status(400).json({ error: "Código atual e refinamento são obrigatórios." });
    }

    const userContent = `CÓDIGO HTML ATUAL:
\`\`\`html
${currentCode}
\`\`\`

SOLICITAÇÃO DE ALTERAÇÃO DO USUÁRIO:
"${refinement}"`;

    let rawOutput = "";

    if (useChatGPT) {
      try {
        const openai = createOpenAIOAuth(req.headers as any);
        const result = await generateText({
          model: openai("gpt-4o"),
          system: REFINE_SITE_SYSTEM_PROMPT,
          prompt: userContent,
        });
        rawOutput = result.text || "";
      } catch (oauthErr) {
        console.warn("OAuth ChatGPT refinamento fallback para Gemini:", oauthErr);
      }
    }

    if (!rawOutput) {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userContent,
        config: {
          systemInstruction: REFINE_SITE_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      rawOutput = response.text || "";
    }

    const htmlCode = cleanHtmlOutput(rawOutput);

    res.json({
      success: true,
      html: htmlCode,
      updatedAt: new Date().toISOString(),
    });
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
