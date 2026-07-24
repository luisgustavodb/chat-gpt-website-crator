import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createOpenAIOAuth } from "@openai-oauth/ai-sdk";
import { openaiCredentials } from "@openai-oauth/react/server";
import { generateText, streamText } from "ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to convert Express headers to Web Headers
function getWebHeaders(req: express.Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  }
  return headers;
}

// System instruction for initial site generation
const GENERATE_SITE_SYSTEM_PROMPT = `
Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no prompt ou URL do usuário.

REGRAS DE RETORNO E FORMATO (EXTREMAMENTE CRÍTICO):
1. Retorne ESTRITAMENTE E EXCLUSIVAMENTE o código HTML completo da página.
2. NUNCA adicione saudações, introduções, comentários explicativos, notas, frases de efeito ou conversas.
3. O resultado deve conter APENAS o código HTML puro, começando com <!DOCTYPE html> e terminando com </html>.

CRIATIVIDADE TEMÁTICA E ADAPTAÇÃO TOTAL BASEADA NO NOME (CRÍTICO):
1. Se o pedido do usuário ou URL contiver um nome específico, composto ou temático (por exemplo: "youtube.heaven", "twitter.hell", "facebook.mars", "spotify.underwater", "instagram.cyberpunk", "netflix.steampunk", "reddit.greece", etc.):
   - NÃO CRIE APENAS UM CLONE OU CÓPIA PADRÃO DO SITE BASE!
   - REINVENTE TOTALMENTE A APLICAÇÃO PARA INTEGRAR O TEMA DO NOME EM TODOS OS DETALHES DA INTERFACE!
2. Adapte minuciosamente TODOS os aspectos:
   - TERMOS, BOTÕES E MÉTRICAS: Em vez de botões e termos comuns (como "Likes", "Inscrições", "Seguidores", "Compartilhar", "Preço"), adapte para o tema do nome. Exemplo no 'youtube.heaven': em vez de "Likes" use "Asas" ou "Aureolas", em vez de "Inscritos" use "Anjos" ou "Devotos", em vez de "Inscrever-se" use "Abençoar".
   - CONTEÚDO E NOMBRES DE USUÁRIOS: Todos os criadores, posts, títulos de vídeos, cards, avatares e comentários devem ser fiéis ao tema (ex: canais como "Anjo Gabriel", "SerafimLogs", vídeos sobre "Como tocar harpa celestial", "Tour pelos Portões de Pérola").
   - VISUAL E PALETA DE CORES: Cores, tipografia, ícones e atmosfera devem ser 100% imersivos (ex: dourado/branco/azul-nuvem para heaven, neon escuro para cyberpunk, vermelho/fogo para hell, etc.).
   - INTERATIVIDADE: Inclua JavaScript funcional com botões interativos, estatísticas temáticas, modais e filtros alinhados ao conceito.

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

ADAPTAÇÃO TEMÁTICA AO REFINAR:
- Mantenha a identidade visual, vocabulário e elementos criativos adaptados ao tema do site.
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
  const startTime = Date.now();
  const reqId = Math.random().toString(36).substring(2, 9);
  console.log(`\n==================================================`);
  console.log(`[SERVIDO - ${new Date().toISOString()}] 🚀 [Req #${reqId}] Nova solicitação POST em /api/generate-site`);

  try {
    const { prompt, url, model } = req.body || {};
    const query = prompt || url;
    console.log(`[SERVIDO - ${new Date().toISOString()}] 📝 [Req #${reqId}] Parâmetros recebidos:`, {
      query: query ? `${query.substring(0, 80)}... (${query.length} chars)` : null,
      model: model || 'padrão (gpt-5.4-mini)',
      hasAuthorizationHeader: !!req.headers.authorization,
      hasCookieHeader: !!req.headers.cookie,
    });

    if (!query || typeof query !== "string" || !query.trim()) {
      console.warn(`[SERVIDO - ${new Date().toISOString()}] ⚠️ [Req #${reqId}] Prompt ausente ou inválido.`);
      return res.status(400).json({ error: "O parâmetro de busca ou prompt é obrigatório." });
    }

    const selectedModel = ["gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.4-mini"].includes(model)
      ? model
      : "gpt-5.4-mini";

    console.log(`[SERVIDO - ${new Date().toISOString()}] 🤖 [Req #${reqId}] Modelo selecionado: "${selectedModel}"`);

    const fullUserPrompt = `${GENERATE_SITE_SYSTEM_PROMPT}\n\nINSTRUÇÕES DA SOLICITAÇÃO DO USUÁRIO:\nGere um site completo, moderno e funcional em HTML5 para: "${query}". Crie uma experiência rica, interativa com JavaScript funcional e Tailwind CSS. Retorne ESTRITAMENTE O CÓDIGO HTML sem qualquer texto de explicação.`;

    let openai;
    const authStartTime = Date.now();
    console.log(`[SERVIDO - ${new Date().toISOString()}] 🔑 [Req #${reqId}] Extraindo credenciais OAuth do ChatGPT...`);
    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      openai = createOpenAIOAuth(credentials);
      console.log(`[SERVIDO - ${new Date().toISOString()}] ✅ [Req #${reqId}] Credenciais OAuth validadas em ${Date.now() - authStartTime}ms.`);
    } catch (chatGptErr: any) {
      console.error(`[SERVIDO - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro no ChatGPT / OpenAI OAuth (${Date.now() - authStartTime}ms):`, chatGptErr);
      return res.status(401).json({
        error: "Autenticação do ChatGPT necessária. Por favor, conecte sua conta do ChatGPT clicando no botão 'Sign in with ChatGPT'. " + (chatGptErr?.message || ""),
      });
    }

    try {
      const streamStartTime = Date.now();
      console.log(`[SERVIDO - ${new Date().toISOString()}] ⚡ [Req #${reqId}] Chamando streamText() para o modelo ${selectedModel}...`);

      const result = streamText({
        model: openai(selectedModel),
        prompt: fullUserPrompt,
      });

      // Envia os cabeçalhos imediatamente para evitar timeout de 504 no Gateway/Vercel/Nginx
      console.log(`[SERVIDO - ${new Date().toISOString()}] 📡 [Req #${reqId}] Enviando cabeçalhos HTTP 200 OK para manter conexão viva...`);
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      });

      if (typeof (res as any).flushHeaders === "function") {
        (res as any).flushHeaders();
      }

      let chunkCount = 0;
      let totalBytes = 0;
      let firstChunkTime: number | null = null;

      for await (const chunk of result.textStream) {
        if (chunkCount === 0) {
          firstChunkTime = Date.now();
          console.log(`[SERVIDO - ${new Date().toISOString()}] 🌊 [Req #${reqId}] Primeiro chunk recebido da IA! Tempo até o 1º byte (TTFB): ${firstChunkTime - streamStartTime}ms`);
        }

        chunkCount++;
        totalBytes += chunk.length;
        res.write(chunk);

        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }

        if (chunkCount % 20 === 0) {
          console.log(`[SERVIDO - ${new Date().toISOString()}] 📊 [Req #${reqId}] Transmitindo... Chunks: ${chunkCount}, Total acumuado: ${totalBytes} bytes (${((Date.now() - streamStartTime) / 1000).toFixed(1)}s decorridos)`);
        }
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[SERVIDO - ${new Date().toISOString()}] 🎉 [Req #${reqId}] Geração finalizada com sucesso! Total de chunks: ${chunkCount}, Total bytes: ${totalBytes}, Tempo total: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log(`==================================================\n`);
      return res.end();
    } catch (streamErr: any) {
      console.error(`[SERVIDO - ${new Date().toISOString()}] 💥 [Req #${reqId}] Erro durante a transmissão do ChatGPT (${Date.now() - startTime}ms):`, {
        name: streamErr?.name,
        message: streamErr?.message,
        status: streamErr?.status,
        code: streamErr?.code,
        stack: streamErr?.stack,
      });

      if (!res.headersSent) {
        return res.status(500).json({
          error: "Erro na geração do ChatGPT: " + (streamErr?.message || streamErr?.toString() || "Timeout ou erro no modelo."),
        });
      } else {
        res.write(`\n\n<!-- ERRO DURANTE A TRANSMISSÃO: ${streamErr?.message || 'Conexão interrompida'} -->`);
      }
      return res.end();
    }
  } catch (error: any) {
    console.error(`[SERVIDO - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro geral em /api/generate-site (${Date.now() - startTime}ms):`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message || "Ocorreu um erro interno ao gerar o site.",
      });
    } else {
      res.end();
    }
  }
});

// API endpoint to refine an existing site EXCLUSIVELY via ChatGPT
app.post("/api/refine-site", async (req, res) => {
  try {
    const { currentCode, refinement, model } = req.body;

    if (!currentCode || !refinement) {
      return res.status(400).json({ error: "Código atual e refinamento são obrigatórios." });
    }

    const selectedModel = ["gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.4-mini"].includes(model)
      ? model
      : "gpt-5.4-mini";

    const userContent = `CÓDIGO HTML ATUAL:
\`\`\`html
${currentCode}
\`\`\`

SOLICITAÇÃO DE ALTERAÇÃO DO USUÁRIO:
"${refinement}"`;

    const fullUserPrompt = `${REFINE_SITE_SYSTEM_PROMPT}\n\n${userContent}`;

    let openai;
    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      openai = createOpenAIOAuth(credentials);
    } catch (chatGptErr: any) {
      console.error("Erro no ChatGPT / OpenAI OAuth no refinamento:", chatGptErr);
      return res.status(401).json({
        error: "Autenticação do ChatGPT necessária. Por favor, conecte sua conta do ChatGPT clicando no botão 'Sign in with ChatGPT'. " + (chatGptErr?.message || ""),
      });
    }

    try {
      const result = streamText({
        model: openai(selectedModel),
        prompt: fullUserPrompt,
      });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (typeof (res as any).flushHeaders === "function") {
        (res as any).flushHeaders();
      }

      for await (const chunk of result.textStream) {
        res.write(chunk);
        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }
      }
      return res.end();
    } catch (streamErr: any) {
      console.error("Erro no streaming do ChatGPT ao refinar:", streamErr);
      if (!res.headersSent) {
        return res.status(401).json({
          error: "Erro no refinamento do ChatGPT: " + (streamErr?.message || ""),
        });
      }
      return res.end();
    }
  } catch (error: any) {
    console.error("Erro ao refinamento do site:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message || "Ocorreu um erro ao aplicar as alterações no site.",
      });
    } else {
      res.end();
    }
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
