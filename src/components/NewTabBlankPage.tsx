import React, { useState } from 'react';
import { Search, Mic, Camera, Sparkles, Grid, Globe, ArrowRight, Check, Key } from 'lucide-react';
import { PRESET_LIST } from '../data/sampleSites';

interface NewTabBlankPageProps {
  onSearch: (promptOrUrl: string) => void;
  isOpenAiAuthEnabled?: boolean;
  onToggleOpenAiAuth?: () => void;
}

export const NewTabBlankPage: React.FC<NewTabBlankPageProps> = ({
  onSearch,
  isOpenAiAuthEnabled = false,
  onToggleOpenAiAuth,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSearch(inputVal.trim());
  };

  return (
    <div className="min-h-full bg-white text-slate-800 flex flex-col justify-between select-none">
      {/* Top Header (Google Style) */}
      <header className="flex items-center justify-end p-4 text-xs text-slate-700 gap-4">
        <a href="#gmail" onClick={(e) => { e.preventDefault(); onSearch('Gmail Web Mail Client'); }} className="hover:underline">
          Gmail
        </a>
        <a href="#imagens" onClick={(e) => { e.preventDefault(); onSearch('Google Imagens - Galeria'); }} className="hover:underline">
          Imagens
        </a>

        {/* ChatGPT / OpenAI OAuth Badge */}
        <button
          onClick={onToggleOpenAiAuth}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isOpenAiAuthEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Sign in with ChatGPT (OpenAI OAuth v2)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isOpenAiAuthEnabled ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>{isOpenAiAuthEnabled ? 'ChatGPT Conectado' : 'Entrar com ChatGPT'}</span>
        </button>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Google Apps">
          <Grid className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          U
        </div>
      </header>

      {/* Main Google Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 max-w-2xl mx-auto w-full">
        {/* Google Logo */}
        <div className="mb-8 text-center select-none">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-sans">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Pesquise qualquer tema ou digite um prompt para gerar um site completo com IA
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full mb-8">
          <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-blue-500 hover:shadow-md focus-within:shadow-md rounded-full px-4 py-3 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Pesquise no Google ou digite o site que deseja criar..."
              className="w-full bg-transparent border-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <div className="flex items-center gap-2 pl-2">
              <button
                type="button"
                onClick={() => setInputVal('SaaS de Inteligência Artificial com preços')}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Pesquisa por voz"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setInputVal('Portfólio 3D para Desenvolvedor Fullstack')}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Pesquisa por imagem"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-medium text-xs px-3.5 py-1.5 rounded-full transition-all ml-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gerar</span>
              </button>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => {
              if (inputVal.trim()) onSearch(inputVal.trim());
              else onSearch('Site de busca moderno igual ao Google');
            }}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-md transition-colors"
          >
            Pesquisa Google
          </button>

          <button
            onClick={() => {
              const randomPreset = PRESET_LIST[Math.floor(Math.random() * PRESET_LIST.length)];
              onSearch(randomPreset.prompt);
            }}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-md transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Estou com sorte (Gerar Site)</span>
          </button>
        </div>

        {/* Popular Shortcuts Grid */}
        <div className="w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Atalhos Populares & Modelos IA
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {PRESET_LIST.slice(0, 4).map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSearch(preset.prompt)}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-xl transition-all group flex flex-col items-center text-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center mb-2 transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600">
                  {preset.title.split('-')[0].trim()}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {preset.url.replace('https://', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer (Google Style) */}
      <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 text-xs">
        <div className="px-6 py-3 border-b border-slate-200 text-slate-500">
          Brasil • São Paulo - Com base no seu endereço IP
        </div>
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#about" onClick={(e) => { e.preventDefault(); onSearch('Sobre a Empresa'); }} className="hover:underline">Sobre</a>
            <a href="#ads" onClick={(e) => { e.preventDefault(); onSearch('Plataforma de Anúncios Google Ads'); }} className="hover:underline">Publicidade</a>
            <a href="#business" onClick={(e) => { e.preventDefault(); onSearch('Google para Negócios'); }} className="hover:underline">Negócios</a>
            <a href="#how" onClick={(e) => { e.preventDefault(); onSearch('Como funciona a Pesquisa Google'); }} className="hover:underline">Como funciona a Pesquisa</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); onSearch('Política de Privacidade'); }} className="hover:underline">Privacidade</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); onSearch('Termos de Serviço'); }} className="hover:underline">Termos</a>
            <a href="#settings" onClick={(e) => { e.preventDefault(); onSearch('Configurações de Busca'); }} className="hover:underline">Configurações</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
