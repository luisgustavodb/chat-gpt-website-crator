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

REGRAS DE CÓDIGO IMPORTANTES:
1. Retorne APENAS o código HTML do site (pode estar envolvido em bloco markdown \`\`\`html ... \`\`\` se necessário, mas o código deve ser HTML válido e completo).
2. Inclua o CDN do Tailwind CSS no head: <script src="https://cdn.tailwindcss.com"></script>
3. Inclua ícones do FontAwesome CDN ou Lucide (via FontAwesome 6 CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />)
4. Inclua Google Fonts elegantes como 'Plus Jakarta Sans', 'Inter' ou 'Outfit' no head.
5. Torne o design extremamente sofisticado:
   - Cores equilibradas, tipografia marcante, sombras suaves, bordas elegantes.
   - Navegação completa (Navbar fixa ou moderna, Hero section impactante, Recursos/Features com cards interativos, Depoimentos/Social Proof, Tabela de Preços com toggle mensal/anual se aplicável, Seção de Perguntas Frequentes (FAQ) sanfonada/accordion funcional, Formulário de contato com validação e toast de sucesso em JS, Footer rico).
   - Use imagens reais e de alta qualidade do Unsplash com assuntos relevantes (ex: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80, etc.).
6. ADICIONE JAVASCRIPT INTERATIVO REAL:
   - Toggle de Tema Claro/Escuro funcional.
   - Modais funcionais (ex: clique em "Começar Agora" ou "Login" abre modal).
   - Menu mobile hambúrguer funcional.
   - FAQ sanfonado (accordion) que expande/recolhe ao clicar.
   - Efeitos de hover, animações CSS suaves e interações reais.
   - Toasts/notificações no JS quando o usuário clica em botões.
7. Se o usuário digitar uma URL (ex: stripe.com, apple.com, airbnb.com, github.com), recrie uma versão espetacular, inspirada e moderna desse serviço/empresa!
8. O código deve ser 100% autônomo, sem dependências externas locais que possam falhar.
`;

// System instruction for refining an existing site
const REFINE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend especialista. O usuário já tem um site gerado em HTML e deseja aplicar uma alteração ou melhoria específica.

Instruções:
1. Analise o código HTML existente fornecido.
2. Aplique as modificações solicitadas pelo usuário (ex: adicionar modo escuro, mudar cores para verde esmeralda, adicionar um formulário de newsletter, adicionar nova seção de preços, etc.).
3. Mantenha toda a estrutura, conteúdo e estilização existente que não precisem ser alterados.
4. Retorne APENAS o código HTML atualizado completo.
`;

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
          model: openai("gpt-5.4-mini"),
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

    // Clean up markdown code block delimiters if present
    let htmlCode = rawOutput.trim();
    if (htmlCode.startsWith("```html")) {
      htmlCode = htmlCode.replace(/^```html\s*/i, "").replace(/\s*```$/, "");
    } else if (htmlCode.startsWith("```")) {
      htmlCode = htmlCode.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

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

SOLICITAÇÃO DE ALTERAÇÃO/REFINAMENTO DO USUÁRIO:
"${refinement}"

Por favor, modifique o código HTML e retorne o arquivo atualizado completo.`;

    let rawOutput = "";

    if (useChatGPT) {
      try {
        const openai = createOpenAIOAuth(req.headers as any);
        const result = await generateText({
          model: openai("gpt-5.4-mini"),
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

    let htmlCode = rawOutput.trim();
    if (htmlCode.startsWith("```html")) {
      htmlCode = htmlCode.replace(/^```html\s*/i, "").replace(/\s*```$/, "");
    } else if (htmlCode.startsWith("```")) {
      htmlCode = htmlCode.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

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
