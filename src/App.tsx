import React, { useState, useEffect } from 'react';
import { Tab, DeviceMode, ViewMode, HistoryItem } from './types';
import { BrowserChrome } from './components/BrowserChrome';
import { BrowserViewport } from './components/BrowserViewport';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ChatGPTAuthModal } from './components/ChatGPTAuthModal';
import { SAMPLE_NOVA_AI_HTML } from './data/sampleSites';
import { openaiAuthHeaders } from '@openai-oauth/react';

function cleanHtmlOutput(raw: string): string {
  if (!raw) return '';
  let html = raw.trim();

  // If closed codeblock exists, extract content
  const codeBlockMatch = html.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    html = codeBlockMatch[1].trim();
  } else {
    // Strips unclosed opening backticks during live streaming
    html = html.replace(/^```(?:html)?\s*/i, '');
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

  if (!html.toLowerCase().includes('<html') && !html.toLowerCase().includes('<!doctype html')) {
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

export default function App() {
  // Toggle for OpenAI OAuth / ChatGPT Mode & Auth Modal
  const [isOpenAiAuthEnabled, setIsOpenAiAuthEnabled] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-5.4-mini');

  // Initialize state with default tab or blank tab
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Google',
      url: '',
      prompt: '',
      htmlCode: '',
      isLoading: false,
      loadingProgress: 0,
      loadingStatus: '',
      deviceMode: 'desktop',
      viewMode: 'preview',
      history: [],
      historyIndex: -1,
      isBookmarked: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_browser_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler histórico do localStorage:', e);
    }
    return [
      {
        id: 'hist-1',
        title: 'Nova AI - Platform SaaS',
        url: 'https://nova.ai/platform',
        prompt: 'Plataforma SaaS de Inteligência Artificial chamada Nova AI',
        timestamp: new Date().toISOString(),
        html: SAMPLE_NOVA_AI_HTML,
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_browser_history', JSON.stringify(historyList));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }
  }, [historyList]);

  // Tab Handlers
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least 1 tab open
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: 'Nova Aba',
      url: '',
      prompt: '',
      htmlCode: '',
      isLoading: false,
      loadingProgress: 0,
      loadingStatus: '',
      deviceMode: 'desktop',
      viewMode: 'preview',
      history: [],
      historyIndex: -1,
      isBookmarked: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  // Site Generation Handler via Server API
  const handleNavigate = async (tabId: string, query: string) => {
    if (!query) {
      // Clear tab or reset to home
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? { ...t, url: '', prompt: '', htmlCode: '', title: 'Nova Aba' }
            : t
        )
      );
      return;
    }

    // Process URL string formatting
    let formattedUrl = query;
    if (!query.startsWith('http://') && !query.startsWith('https://')) {
      if (query.includes('.') && !query.includes(' ')) {
        formattedUrl = `https://${query}`;
      } else {
        const cleanSlug = query
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 20);
        formattedUrl = `https://${cleanSlug}.app`;
      }
    }

    // Update tab to loading state
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              url: formattedUrl,
              prompt: query,
              isLoading: true,
              loadingProgress: 20,
              loadingStatus: isOpenAiAuthEnabled
                ? 'Conectando ao ChatGPT (OpenAI OAuth) para gerar o site...'
                : 'Enviando requisição para a Inteligência Artificial...',
            }
          : t
      )
    );

    // Simulate progress updates
    const interval = setInterval(() => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== tabId || !t.isLoading) return t;
          let newProgress = t.loadingProgress + 15;
          let newStatus = t.loadingStatus;

          if (newProgress > 30 && newProgress <= 50) {
            newStatus = 'Estruturando HTML5 e componentes responsivos...';
          } else if (newProgress > 50 && newProgress <= 75) {
            newStatus = 'Aplicando estilos modernos com Tailwind CSS...';
          } else if (newProgress > 75 && newProgress < 95) {
            newStatus = 'Adicionando interações em JavaScript...';
          }

          return {
            ...t,
            loadingProgress: Math.min(newProgress, 90),
            loadingStatus: newStatus,
          };
        })
      );
    }, 600);

    try {
      let authHeaders = {};
      try {
        authHeaders = await openaiAuthHeaders();
      } catch (e) {
        console.warn('Cabeçalhos OAuth OpenAI indisponíveis no momento, prosseguindo com requisição padrão:', e);
      }

      const response = await fetch('/api/generate-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          prompt: query,
          url: formattedUrl,
          useChatGPT: isOpenAiAuthEnabled,
          model: selectedModel,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const textBody = await response.text();
        let errJson: any = null;
        try {
          errJson = JSON.parse(textBody);
        } catch (_) {
          // textBody is plain text or HTML
        }

        console.error('❌ [Resposta HTTP com Erro]:', {
          status: response.status,
          statusText: response.statusText,
          body: textBody,
        });

        let errMsg = errJson?.error;
        if (!errMsg) {
          if (response.status === 504) {
            errMsg = `HTTP 504 Gateway Timeout: A conexão com o servidor de IA expirou (Timeout). O modelo da OpenAI demorou mais que o limite do servidor para gerar a resposta. Recomendamos tentar novamente com o modelo 'gpt-5.4-mini' ou simplificar o pedido.`;
          } else if (response.status === 502) {
            errMsg = `HTTP 502 Bad Gateway: O servidor intermediário falhou ao comunicar com a API do ChatGPT. Tente novamente em instantes.`;
          } else if (response.status === 401) {
            errMsg = errJson?.error || `HTTP 401 Não Autorizado: Por favor, reconecte sua conta do ChatGPT usando o botão 'Sign in with ChatGPT'.`;
          } else {
            errMsg = textBody.length < 300 && textBody.trim() ? textBody : `Erro no servidor (HTTP ${response.status}: ${response.statusText || 'Timeout / Indisponível'}).`;
          }
        }
        throw new Error(errMsg);
      }

      const contentType = response.headers.get('content-type') || '';
      let rawOutput = '';

      if (contentType.includes('application/json')) {
        const jsonBody = await response.json();
        rawOutput = jsonBody.html || '';
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunkCount = 0;

        console.log(`🚀 [ChatGPT API] Conexão iniciada! Transmitindo resposta em tempo real para a aba ${tabId}...`);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            rawOutput += chunk;
            chunkCount++;

            console.log(`📦 [Chunk #${chunkCount}]:`, chunk);
            console.log(`📄 [HTML Acumulado (${rawOutput.length} chars)]`);

            const liveHtml = cleanHtmlOutput(rawOutput);

            // Render live preview chunk by chunk
            setTabs((prev) =>
              prev.map((t) =>
                t.id === tabId
                  ? {
                      ...t,
                      htmlCode: liveHtml,
                      isLoading: false,
                      isStreaming: true,
                      loadingStatus: `Gerando em tempo real (${rawOutput.length} caracteres)...`,
                    }
                  : t
              )
            );
          }
          console.log(`✅ [ChatGPT Stream Concluído] Chunks: ${chunkCount}, Total: ${rawOutput.length} caracteres.`);
          console.log(`🔥 [Código HTML Final Gerado]:\n`, rawOutput);
        } catch (streamReadErr: any) {
          console.error('⚠️ [Erro ao ler transmissão]:', streamReadErr);
          if (!rawOutput) {
            throw streamReadErr;
          }
          console.warn('⚠️ [Stream Interrompida] Mantendo o HTML visual gerado parcialmente.');
        }
      } else {
        rawOutput = await response.text();
        console.log(`📄 [Resposta Texto Direta]:\n`, rawOutput);
      }

      const generatedHtml = cleanHtmlOutput(rawOutput);
      if (!generatedHtml) {
        throw new Error('Nenhum código HTML válido foi gerado.');
      }

      // Extract a clean title from HTML <title> tag if available
      let siteTitle = query;
      const titleMatch = generatedHtml.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        siteTitle = titleMatch[1].trim();
      }

      // Update tab with result
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== tabId) return t;

          const newHistoryStep = {
            url: formattedUrl,
            title: siteTitle,
            html: generatedHtml,
            prompt: query,
          };

          const updatedHistory = [...t.history.slice(0, t.historyIndex + 1), newHistoryStep];

          return {
            ...t,
            title: siteTitle,
            url: formattedUrl,
            prompt: query,
            htmlCode: generatedHtml,
            isLoading: false,
            isStreaming: false,
            loadingProgress: 100,
            loadingStatus: 'Pronto',
            history: updatedHistory,
            historyIndex: updatedHistory.length - 1,
          };
        })
      );

      // Save to global history
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        title: siteTitle,
        url: formattedUrl,
        prompt: query,
        timestamp: new Date().toISOString(),
        html: generatedHtml,
      };

      setHistoryList((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
    } catch (error: any) {
      clearInterval(interval);
      console.error('❌ [Erro ao conectar à API de geração de IA]:', error);

      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== tabId) return t;

          // Keep partial HTML if it was already stream-rendered
          if (t.htmlCode && t.htmlCode.length > 50) {
            return {
              ...t,
              isLoading: false,
              isStreaming: false,
              loadingStatus: `Aviso: ${error.message || 'Stream interrompida'}`,
            };
          }

          const errorHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro de Conexão com IA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6 font-sans">
  <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
    <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl">
      <i class="fa-solid fa-triangle-exclamation"></i>
    </div>
    <h2 class="text-xl font-bold text-white">Falha ao Conectar com a IA</h2>
    <div class="text-xs text-rose-300 font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-700 text-left overflow-x-auto leading-relaxed max-h-48">
      ${error.message || 'Erro de comunicação com o servidor de IA.'}
    </div>
    <p class="text-[11px] text-slate-400">
      Verifique o Console do Navegador (F12) para inspecionar os detalhes da conexão e o log da IA.
    </p>
    <div class="pt-2 flex flex-col gap-2">
      <button onclick="window.location.reload()" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20">
        Tentar Novamente
      </button>
    </div>
  </div>
</body>
</html>`;

          return {
            ...t,
            isLoading: false,
            isStreaming: false,
            htmlCode: errorHtml,
            loadingStatus: 'Erro',
          };
        })
      );
    }
  };

  // Refine Site Handler
  const handleRefineSite = async (tabId: string, refinementPrompt: string) => {
    const currentTab = tabs.find((t) => t.id === tabId);
    if (!currentTab || !currentTab.htmlCode) return;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              isLoading: true,
              loadingProgress: 40,
              loadingStatus: `Aplicando refinamento: "${refinementPrompt}"...`,
            }
          : t
      )
    );

    try {
      let authHeaders = {};
      try {
        authHeaders = await openaiAuthHeaders();
      } catch (e) {
        console.warn('Cabeçalhos OAuth OpenAI indisponíveis no momento:', e);
      }

      const response = await fetch('/api/refine-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          currentCode: currentTab.htmlCode,
          refinement: refinementPrompt,
          useChatGPT: isOpenAiAuthEnabled,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const textBody = await response.text();
        let errJson: any = null;
        try {
          errJson = JSON.parse(textBody);
        } catch (_) {
          // textBody is plain text or HTML
        }

        console.error('❌ [Resposta HTTP com Erro no Refinamento]:', {
          status: response.status,
          statusText: response.statusText,
          body: textBody,
        });

        let errMsg = errJson?.error;
        if (!errMsg) {
          if (response.status === 504) {
            errMsg = `HTTP 504 Gateway Timeout: A conexão expirou ao refinar o site. O modelo demorou mais que o limite do servidor. Tente simplificar a solicitação de alteração.`;
          } else if (response.status === 502) {
            errMsg = `HTTP 502 Bad Gateway: O servidor intermediário falhou ao comunicar com a API do ChatGPT.`;
          } else if (response.status === 401) {
            errMsg = errJson?.error || `HTTP 401 Não Autorizado: Por favor, reconecte sua conta do ChatGPT.`;
          } else {
            errMsg = textBody.length < 300 && textBody.trim() ? textBody : `Erro no servidor ao refinar (HTTP ${response.status}).`;
          }
        }
        throw new Error(errMsg);
      }

      const contentType = response.headers.get('content-type') || '';
      let rawOutput = '';

      if (contentType.includes('application/json')) {
        const jsonBody = await response.json();
        rawOutput = jsonBody.html || '';
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunkCount = 0;

        console.log(`🚀 [ChatGPT Refinement API] Conexão estabelecida! Refinando e transmitindo em tempo real para a aba ${tabId}...`);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            rawOutput += chunk;
            chunkCount++;

            console.log(`📦 [Refinement Chunk #${chunkCount}]:`, chunk);
            console.log(`📄 [Refinement HTML Acumulado (${rawOutput.length} chars)]`);

            const liveHtml = cleanHtmlOutput(rawOutput);

            setTabs((prev) =>
              prev.map((t) =>
                t.id === tabId
                  ? {
                      ...t,
                      htmlCode: liveHtml,
                      isLoading: false,
                      isStreaming: true,
                      loadingStatus: `Refinando em tempo real (${rawOutput.length} caracteres)...`,
                    }
                  : t
              )
            );
          }
          console.log(`✅ [ChatGPT Refinement Stream Concluído] Chunks: ${chunkCount}, Total: ${rawOutput.length} caracteres.`);
        } catch (streamReadErr: any) {
          console.error('⚠️ [Erro na Leitura do Refinamento]:', streamReadErr);
          if (!rawOutput) {
            throw streamReadErr;
          }
        }
      } else {
        rawOutput = await response.text();
        console.log(`📄 [Refinement Texto Direto]:\n`, rawOutput);
      }

      const updatedHtml = cleanHtmlOutput(rawOutput);
      if (!updatedHtml) {
        throw new Error('Nenhum código HTML válido foi gerado no refinamento.');
      }

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                htmlCode: updatedHtml,
                isLoading: false,
                isStreaming: false,
                loadingProgress: 100,
                loadingStatus: 'Refinado com sucesso',
              }
            : t
        )
      );
    } catch (error: any) {
      console.error('Erro ao refinar site:', error);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? { ...t, isLoading: false, loadingStatus: 'Erro no refinamento' }
            : t
        )
      );
    }
  };

  // Navigation History (Back / Forward / Refresh)
  const handleBack = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId || t.historyIndex <= 0) return t;
        const prevIndex = t.historyIndex - 1;
        const step = t.history[prevIndex];
        return {
          ...t,
          historyIndex: prevIndex,
          url: step.url,
          title: step.title,
          htmlCode: step.html,
          prompt: step.prompt,
        };
      })
    );
  };

  const handleForward = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId || t.historyIndex >= t.history.length - 1) return t;
        const nextIndex = t.historyIndex + 1;
        const step = t.history[nextIndex];
        return {
          ...t,
          historyIndex: nextIndex,
          url: step.url,
          title: step.title,
          htmlCode: step.html,
          prompt: step.prompt,
        };
      })
    );
  };

  const handleRefresh = (tabId: string) => {
    const currentTab = tabs.find((t) => t.id === tabId);
    if (currentTab && currentTab.prompt) {
      handleNavigate(tabId, currentTab.prompt);
    }
  };

  // Manual Code Application
  const handleApplyManualCode = (tabId: string, newCode: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, htmlCode: newCode } : t))
    );
  };

  // Controls for device mode and view mode
  const handleChangeDeviceMode = (tabId: string, mode: DeviceMode) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, deviceMode: mode } : t))
    );
  };

  const handleChangeViewMode = (tabId: string, mode: ViewMode) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, viewMode: mode } : t))
    );
  };

  const handleToggleBookmark = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, isBookmarked: !t.isBookmarked } : t))
    );
  };

  // Download HTML file
  const handleDownloadHtml = (tab: Tab) => {
    if (!tab.htmlCode) return;
    const blob = new Blob([tab.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = (tab.title || 'site-gerado')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') + '.html';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Open history item in current or new tab
  const handleOpenHistoryItem = (item: HistoryItem) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab && (!activeTab.htmlCode || activeTab.url === '')) {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                title: item.title,
                url: item.url,
                prompt: item.prompt,
                htmlCode: item.html,
              }
            : t
        )
      );
    } else {
      const newTabId = `tab-${Date.now()}`;
      const newTab: Tab = {
        id: newTabId,
        title: item.title,
        url: item.url,
        prompt: item.prompt,
        htmlCode: item.html,
        isLoading: false,
        loadingProgress: 100,
        loadingStatus: 'Pronto',
        deviceMode: 'desktop',
        viewMode: 'preview',
        history: [
          {
            url: item.url,
            title: item.title,
            html: item.html,
            prompt: item.prompt,
          },
        ],
        historyIndex: 0,
        isBookmarked: false,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTabId);
    }
  };

  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Browser Chrome Header */}
      <BrowserChrome
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onToggleBookmark={handleToggleBookmark}
        onChangeDeviceMode={handleChangeDeviceMode}
        onChangeViewMode={handleChangeViewMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onDownloadHtml={handleDownloadHtml}
        isOpenAiAuthEnabled={isOpenAiAuthEnabled}
        onToggleOpenAiAuth={() => setIsAuthModalOpen(true)}
        selectedModel={selectedModel}
        onChangeModel={setSelectedModel}
      />

      {/* Browser Main Viewport */}
      <BrowserViewport
        tab={currentTab}
        onNavigate={handleNavigate}
        onRefineSite={handleRefineSite}
        onApplyManualCode={handleApplyManualCode}
        onDownloadHtml={handleDownloadHtml}
        isOpenAiAuthEnabled={isOpenAiAuthEnabled}
        onToggleOpenAiAuth={() => setIsAuthModalOpen(true)}
      />

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyList}
        onOpenHistoryItem={handleOpenHistoryItem}
        onClearHistory={() => {
          setHistoryList([]);
          localStorage.removeItem('ai_browser_history');
        }}
      />

      {/* ChatGPT / OpenAI OAuth Authentication Modal */}
      <ChatGPTAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthStateChange={() => setIsOpenAiAuthEnabled(true)}
      />
    </div>
  );
}
