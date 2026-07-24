import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Lock,
  Plus,
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Home,
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  Eye,
  Columns,
  Download,
  Star,
  History,
  Sparkles,
  Search,
  Check,
  Wand2
} from 'lucide-react';
import { Tab, DeviceMode, ViewMode } from '../types';
import { PRESET_LIST } from '../data/sampleSites';

interface BrowserChromeProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onNavigate: (tabId: string, urlOrPrompt: string) => void;
  onBack: (tabId: string) => void;
  onForward: (tabId: string) => void;
  onRefresh: (tabId: string) => void;
  onToggleBookmark: (tabId: string) => void;
  onChangeDeviceMode: (tabId: string, mode: DeviceMode) => void;
  onChangeViewMode: (tabId: string, mode: ViewMode) => void;
  onOpenHistory: () => void;
  onDownloadHtml: (tab: Tab) => void;
  isOpenAiAuthEnabled?: boolean;
  onToggleOpenAiAuth?: () => void;
  selectedModel?: string;
  onChangeModel?: (model: string) => void;
}

export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onChangeDeviceMode,
  onChangeViewMode,
  onOpenHistory,
  onDownloadHtml,
  isOpenAiAuthEnabled = false,
  onToggleOpenAiAuth,
  selectedModel = 'gpt-5.4-mini',
  onChangeModel,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [addressInput, setAddressInput] = useState(activeTab?.url || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync address bar input when activeTab changes
  useEffect(() => {
    if (activeTab) {
      setAddressInput(activeTab.url || activeTab.prompt || '');
    }
  }, [activeTabId, activeTab?.url, activeTab?.prompt]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    setIsDropdownOpen(false);
    onNavigate(activeTab.id, addressInput.trim());
  };

  const handleSelectPreset = (presetPrompt: string) => {
    setAddressInput(presetPrompt);
    setIsDropdownOpen(false);
    onNavigate(activeTab.id, presetPrompt);
  };

  const canGoBack = activeTab ? activeTab.historyIndex > 0 : false;
  const canGoForward = activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false;

  return (
    <div className="bg-slate-100 border-b border-slate-200 flex flex-col select-none text-slate-800 font-sans shadow-sm">
      {/* Tab Bar & Window Controls (Google Chrome Light Style) */}
      <div className="flex items-center px-3 pt-2 pb-0 gap-2 overflow-x-auto no-scrollbar bg-slate-200/90 border-b border-slate-300/70">
        {/* Window controls (Mac style dots) */}
        <div className="flex items-center space-x-2 mr-2 pl-1">
          <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600/30"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600/30"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600/30"></div>
        </div>

        {/* Tabs List */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-medium cursor-pointer transition-all duration-150 min-w-[130px] max-w-[220px] ${
                  isActive
                    ? 'bg-white text-slate-900 border-t-2 border-t-blue-500 shadow-sm border-x border-slate-300/80 font-semibold'
                    : 'bg-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-300/60 border-transparent'
                }`}
              >
                {/* Tab Icon / Favicon / Spinner */}
                {tab.isLoading ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                )}

                {/* Tab Title */}
                <span className="truncate flex-1">
                  {tab.title || (tab.isLoading ? 'Gerando site...' : 'Nova Aba')}
                </span>

                {/* Close Tab Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Fechar aba"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-300/80 rounded-lg transition-colors ml-1"
            title="Abrir nova aba"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Top Right Extra Tools */}
        <div className="flex items-center gap-2 pl-2 pb-1">
          {/* Model Selector Dropdown */}
          {onChangeModel && (
            <select
              value={selectedModel}
              onChange={(e) => onChangeModel(e.target.value)}
              className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer hover:bg-slate-50 transition-colors"
              title="Selecione o modelo do ChatGPT"
            >
              <option value="gpt-5.4-mini">gpt-5.4-mini (Recomendado/Rápido)</option>
              <option value="gpt-5.5">gpt-5.5</option>
              <option value="gpt-5.6-terra">gpt-5.6-terra</option>
              <option value="gpt-5.6-luna">gpt-5.6-luna</option>
            </select>
          )}

          {/* OpenAI OAuth / ChatGPT Badge */}
          {onToggleOpenAiAuth && (
            <button
              onClick={onToggleOpenAiAuth}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isOpenAiAuthEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Alternar entre Gemini e ChatGPT (OpenAI OAuth)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isOpenAiAuthEnabled ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">
                {isOpenAiAuthEnabled ? 'ChatGPT Conectado' : 'Conectar ChatGPT'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-300/80 bg-white border border-slate-300 transition-colors shadow-2xs"
            title="Histórico de sites gerados"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Histórico</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Toolbar & Address Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onBack(activeTab.id)}
            disabled={!canGoBack}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoBack
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Voltar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onForward(activeTab.id)}
            disabled={!canGoForward}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoForward
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Avançar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onRefresh(activeTab.id)}
            className="p-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
            title="Recarregar"
          >
            <RotateCw className={`w-3.5 h-3.5 ${activeTab?.isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate(activeTab.id, '')}
            className="p-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
            title="Página Inicial do Google"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar / Prompt Search Bar */}
        <div className="relative flex-1" ref={dropdownRef}>
          <form onSubmit={handleSubmit} className="relative flex items-center">
            {/* Left Lock / Sparkle Icon */}
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {activeTab?.isLoading ? (
                <Wand2 className="w-4 h-4 text-blue-600 animate-pulse" />
              ) : activeTab?.url ? (
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Pesquise ou digite o site para a IA criar (ex: 'SaaS de IA', 'Portfólio 3D')"
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-full pl-9 pr-24 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
            />

            {/* Right Action Icons inside Address Bar */}
            <div className="absolute right-2 flex items-center gap-1">
              {addressInput && (
                <button
                  type="button"
                  onClick={() => setAddressInput('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
                  title="Limpar"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <button
                type="submit"
                disabled={activeTab?.isLoading || !addressInput.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium shadow-xs transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden md:inline">Gerar</span>
              </button>
            </div>
          </form>

          {/* Search Bar Suggestions / Presets Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                  Sugestões Rápidas de Sites
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  {isOpenAiAuthEnabled ? 'ChatGPT / OpenAI OAuth' : 'Google Gemini AI'}
                </span>
              </div>

              <div className="p-1">
                {PRESET_LIST.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.prompt)}
                    className="w-full text-left p-2.5 hover:bg-blue-50/60 rounded-xl flex items-start gap-3 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{preset.url}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewport & Inspector Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Device Viewport Selector */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              onClick={() => onChangeDeviceMode(activeTab.id, 'desktop')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab?.deviceMode === 'desktop'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visão Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeDeviceMode(activeTab.id, 'tablet')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab?.deviceMode === 'tablet'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visão Tablet"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeDeviceMode(activeTab.id, 'mobile')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab?.deviceMode === 'mobile'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visão Celular"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle (Preview / Split / Code) */}
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              onClick={() => onChangeViewMode(activeTab.id, 'preview')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab?.viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização do Site"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Preview</span>
            </button>

            <button
              onClick={() => onChangeViewMode(activeTab.id, 'split')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab?.viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Lado a Lado (Site + Código)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Split</span>
            </button>

            <button
              onClick={() => onChangeViewMode(activeTab.id, 'code')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab?.viewMode === 'code'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Inspecionar Código HTML"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Código</span>
            </button>
          </div>

          {/* Download Code Button */}
          <button
            onClick={() => onDownloadHtml(activeTab)}
            disabled={!activeTab?.htmlCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium transition-colors border border-slate-200 shadow-2xs"
            title="Baixar Arquivo HTML"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Baixar</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center px-4 py-1 bg-slate-50 border-b border-slate-200/80 gap-2 overflow-x-auto text-[11px] text-slate-500">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Atalhos:
        </span>
        {PRESET_LIST.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.prompt)}
            className="px-2 py-0.5 rounded hover:bg-slate-200/70 hover:text-slate-800 transition-colors shrink-0 flex items-center gap-1"
          >
            <span className="font-medium">{preset.title.split('-')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
