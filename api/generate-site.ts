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

const INSTRUCAO_SISTEMA_CRIAR_SITE = `Você é um desenvolvedor frontend mestre e designer UI/UX de nível mundial.
Sua tarefa é criar um site COMPLETO, moderno, altamente responsivo, bonito e interativo em um ÚNICO arquivo HTML autônomo baseado no pedido do usuário.

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
   - INTERATIVIDADE: Inclua JavaScript funcional com botões interativos, estatísticas temáticas, modais e filtros alinhados ao conceito.`;

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  const reqId = Math.random().toString(36).substring(2, 9);
  console.log(`\n==================================================`);
  console.log(`[VERCEL API - ${new Date().toISOString()}] 🚀 [Req #${reqId}] Nova solicitação POST em /api/generate-site`);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt, url, model } = req.body || {};
    const query = prompt || url;
    console.log(`[VERCEL API - ${new Date().toISOString()}] 📝 [Req #${reqId}] Parâmetros recebidos:`, {
      query: query ? `${query.substring(0, 80)}... (${query.length} chars)` : null,
      model: model || 'padrão (gpt-5.4-mini)',
      hasAuthorizationHeader: !!req.headers.authorization,
      hasCookieHeader: !!req.headers.cookie,
    });

    if (!query || typeof query !== 'string' || !query.trim()) {
      console.warn(`[VERCEL API - ${new Date().toISOString()}] ⚠️ [Req #${reqId}] Prompt ausente ou inválido.`);
      return res.status(400).json({ error: 'O parâmetro de busca ou prompt é obrigatório.' });
    }

    const selectedModel = ['gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-5.4-mini'].includes(model)
      ? model
      : 'gpt-5.4-mini';

    console.log(`[VERCEL API - ${new Date().toISOString()}] 🤖 [Req #${reqId}] Modelo selecionado: "${selectedModel}"`);

    const fullPrompt = `${INSTRUCAO_SISTEMA_CRIAR_SITE}

INSTRUÇÕES DO PEDIDO DO USUÁRIO:
Gere um site completo, moderno e totalmente funcional em HTML5/Tailwind CSS para o seguinte pedido ou URL: "${query}". Crie uma experiência interativa rica. Retorne ESTRITAMENTE O CÓDIGO HTML sem qualquer texto explicativo ou introduções.`;

    let openai;
    const authStartTime = Date.now();
    console.log(`[VERCEL API - ${new Date().toISOString()}] 🔑 [Req #${reqId}] Obtendo credenciais OAuth do ChatGPT...`);
    try {
      const webHeaders = getWebHeaders(req);
      const credentials = openaiCredentials(webHeaders);
      openai = createOpenAIOAuth(credentials);
      console.log(`[VERCEL API - ${new Date().toISOString()}] ✅ [Req #${reqId}] Credenciais validadas em ${Date.now() - authStartTime}ms.`);
    } catch (chatGptError: any) {
      console.error(`[VERCEL API - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro no ChatGPT OAuth (${Date.now() - authStartTime}ms):`, chatGptError);
      return res.status(401).json({
        error: 'Autenticação do ChatGPT necessária. Conecte sua conta do ChatGPT usando o botão "Sign in with ChatGPT". ' + (chatGptError?.message || ''),
      });
    }

    try {
      const streamStartTime = Date.now();
      console.log(`[VERCEL API - ${new Date().toISOString()}] ⚡ [Req #${reqId}] Iniciando streamText() com ${selectedModel}...`);

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
          console.log(`[VERCEL API - ${new Date().toISOString()}] 🌊 [Req #${reqId}] Primeiro chunk recebido da IA! TTFB: ${firstChunkTime - streamStartTime}ms`);
        }

        chunkCount++;
        totalBytes += chunk.length;
        res.write(chunk);

        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }

        if (chunkCount % 20 === 0) {
          console.log(`[VERCEL API - ${new Date().toISOString()}] 📊 [Req #${reqId}] Transmitindo... Chunks: ${chunkCount}, Total: ${totalBytes} bytes (${((Date.now() - streamStartTime) / 1000).toFixed(1)}s decorridos)`);
        }
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[VERCEL API - ${new Date().toISOString()}] 🎉 [Req #${reqId}] Sucesso! Chunks: ${chunkCount}, Bytes: ${totalBytes}, Duração: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log(`==================================================\n`);
      return res.end();
    } catch (streamErr: any) {
      console.error(`[VERCEL API - ${new Date().toISOString()}] 💥 [Req #${reqId}] Erro no stream do ChatGPT (${Date.now() - startTime}ms):`, {
        name: streamErr?.name,
        message: streamErr?.message,
        status: streamErr?.status,
        code: streamErr?.code,
      });

      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Erro ao gerar o site via ChatGPT: ' + (streamErr?.message || streamErr?.toString() || 'Timeout na API de IA'),
        });
      } else {
        res.write(`\n\n<!-- ERRO STREAMING: ${streamErr?.message || 'Interrompido'} -->`);
      }
      return res.end();
    }
  } catch (error: any) {
    console.error(`[VERCEL API - ${new Date().toISOString()}] ❌ [Req #${reqId}] Erro geral handler generate-site (${Date.now() - startTime}ms):`, error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'Ocorreu um erro ao gerar o site.',
      });
    }
    return res.end();
  }
}

