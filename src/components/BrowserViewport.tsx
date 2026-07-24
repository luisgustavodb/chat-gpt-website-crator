import React, { useState } from 'react';
import { Tab } from '../types';
import { CodeInspector } from './CodeInspector';
import { NewTabBlankPage } from './NewTabBlankPage';
import { Sparkles, Wand2, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface BrowserViewportProps {
  tab: Tab;
  onNavigate: (tabId: string, query: string) => void;
  onRefineSite: (tabId: string, prompt: string) => void;
  onApplyManualCode: (tabId: string, code: string) => void;
  onDownloadHtml: (tab: Tab) => void;
  isOpenAiAuthEnabled?: boolean;
  onToggleOpenAiAuth?: () => void;
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  tab,
  onNavigate,
  onRefineSite,
  onApplyManualCode,
  onDownloadHtml,
  isOpenAiAuthEnabled,
  onToggleOpenAiAuth,
}) => {
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // If tab has no prompt, url, or htmlCode, show the NewTab home page
  if (!tab.url && !tab.prompt && !tab.htmlCode && !tab.isLoading) {
    return (
      <NewTabBlankPage
        onSearch={(query) => onNavigate(tab.id, query)}
        isOpenAiAuthEnabled={isOpenAiAuthEnabled}
        onToggleOpenAiAuth={onToggleOpenAiAuth}
      />
    );
  }

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || isRefining) return;
    const promptText = refinementInput.trim();
    setRefinementInput('');
    setIsRefining(true);
    await onRefineSite(tab.id, promptText);
    setIsRefining(false);
  };

  // Determine viewport width style based on deviceMode
  const getDeviceFrameStyle = () => {
    switch (tab.deviceMode) {
      case 'mobile':
        return 'w-[375px] h-[667px] my-auto rounded-3xl border-[8px] border-slate-700 shadow-xl overflow-hidden bg-white';
      case 'tablet':
        return 'w-[768px] h-[90%] my-auto rounded-2xl border-[6px] border-slate-700 shadow-xl overflow-hidden bg-white';
      case 'desktop':
      default:
        return 'w-full h-full bg-white';
    }
  };

  return (
    <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
      {/* Loading Screen Overlay (Only before initial HTML begins streaming) */}
      {tab.isLoading && !tab.htmlCode ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/95 backdrop-blur-md relative z-20">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-0.5 shadow-xl shadow-blue-500/20 animate-pulse">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Gerando o site para você
          </h3>

          <p className="text-xs text-blue-700 font-medium mb-6 max-w-md bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
            {tab.loadingStatus || 'Conectando ao ChatGPT e preparando a geração...'}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-slate-100 border border-slate-200 rounded-full h-2.5 overflow-hidden mb-6">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(15, tab.loadingProgress)}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> HTML5 Limpo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tailwind CSS
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Interatividade
            </span>
          </div>
        </div>
      ) : (
        /* Viewport Main Container */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Live Streaming Indicator Badge */}
          {tab.isStreaming && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Gerando site em tempo real via ChatGPT...</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700 font-mono font-bold tracking-wider">
                AO VIVO
              </span>
            </div>
          )}
          {/* View Mode: Split or Code Only */}
          {(tab.viewMode === 'code' || tab.viewMode === 'split') && (
            <div
              className={`${
                tab.viewMode === 'split' ? 'w-1/2' : 'w-full'
              } h-full z-10 transition-all duration-200`}
            >
              <CodeInspector
                code={tab.htmlCode}
                onApplyChanges={(newCode) => onApplyManualCode(tab.id, newCode)}
                onDownload={() => onDownloadHtml(tab)}
              />
            </div>
          )}

          {/* View Mode: Preview or Split */}
          {(tab.viewMode === 'preview' || tab.viewMode === 'split') && (
            <div
              className={`${
                tab.viewMode === 'split' ? 'w-1/2 border-l border-slate-200' : 'w-full'
              } h-full flex items-center justify-center bg-slate-100 p-2 overflow-auto relative`}
            >
              <div className={`transition-all duration-300 ${getDeviceFrameStyle()}`}>
                <iframe
                  title={tab.title || 'Live Preview'}
                  srcDoc={tab.htmlCode}
                  sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                  className="w-full h-full bg-white border-none"
                />
              </div>
            </div>
          )}

          {/* Floating AI Refinement Bar at bottom of viewport */}
          {tab.htmlCode && !tab.isLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[90%]">
              <form
                onSubmit={handleRefineSubmit}
                className="flex items-center bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-1.5 shadow-xl"
              >
                <div className="p-2 text-blue-600 pl-3">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Pedir alteração na IA (ex: 'Mude a cor para azul', 'Adicione mais depoimentos')..."
                  disabled={isRefining}
                  className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none px-2 py-1.5"
                />
                <button
                  type="submit"
                  disabled={!refinementInput.trim() || isRefining}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
                >
                  {isRefining ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Refinar</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
