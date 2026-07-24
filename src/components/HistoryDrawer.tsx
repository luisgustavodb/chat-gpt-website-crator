import React, { useState } from 'react';
import { History, X, Globe, Sparkles, Trash2, ArrowUpRight, Search } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  onOpenHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onOpenHistoryItem,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredItems = historyItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Histórico de Navegação</h2>
              <p className="text-[11px] text-slate-500">Sites e páginas gerados por IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no histórico..."
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {historyItems.length > 0 && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
              <span>{filteredItems.length} sites salvos</span>
              <button
                onClick={onClearHistory}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline font-medium"
              >
                <Trash2 className="w-3 h-3" /> Limpar Histórico
              </button>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Globe className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">Nenhum site no histórico ainda.</p>
              <p className="text-[11px] text-slate-400">Gere novos sites usando a barra de busca do navegador!</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onOpenHistoryItem(item);
                  onClose();
                }}
                className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{item.url}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  "{item.prompt}"
                </p>

                <div className="mt-2 text-[10px] text-slate-400 flex justify-end font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
