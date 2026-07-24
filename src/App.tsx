import React, { useState, useEffect } from 'react';
import { Tab, DeviceMode, ViewMode, HistoryItem } from './types';
import { BrowserChrome } from './components/BrowserChrome';
import { BrowserViewport } from './components/BrowserViewport';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ChatGPTAuthModal } from './components/ChatGPTAuthModal';
import { SAMPLE_NOVA_AI_HTML } from './data/sampleSites';
import { openaiAuthHeaders } from '@openai-oauth/react';

export default function App() {
  // Toggle for OpenAI OAuth / ChatGPT Mode & Auth Modal
  const [isOpenAiAuthEnabled, setIsOpenAiAuthEnabled] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
      const authHeaders = await openaiAuthHeaders();
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
        }),
      });

      clearInterval(interval);

      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(rawText || 'Resposta do servidor indisponível em formato JSON.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar o site.');
      }

      const generatedHtml = data.html || '';

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
      console.error('Erro ao gerar site:', error);

      // Fallback error screen HTML
      const errorHtml = `
        <div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #ffffff; color: #0f172a; text-align: center; padding: 2rem;">
          <h2 style="color: #e11d48; font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800;">Erro na Geração do Site</h2>
          <p style="color: #64748b; font-size: 0.9rem; max-width: 500px; margin: 0 auto 1.5rem auto;">
            ${error.message || 'Não foi possível gerar o site no momento.'}
          </p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 9999px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">Tentar Novamente</button>
        </div>
      `;

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                isLoading: false,
                htmlCode: errorHtml,
                loadingStatus: 'Erro',
              }
            : t
        )
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
      const authHeaders = await openaiAuthHeaders();
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
        }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(rawText || 'Resposta do servidor indisponível em formato JSON.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao refinar o site.');
      }

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                htmlCode: data.html,
                isLoading: false,
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
