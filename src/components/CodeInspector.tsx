import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, FileCode2 } from 'lucide-react';

interface CodeInspectorProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
  onApplyChanges?: (newCode: string) => void;
  onDownload?: () => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  code,
  onCodeChange,
  onApplyChanges,
  onDownload,
}) => {
  const [editableCode, setEditableCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = editableCode.split('\n');

  return (
    <div className="h-full flex flex-col bg-white font-mono text-xs text-slate-800 border-l border-slate-200">
      {/* Code Inspector Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 select-none">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-900 font-sans">index.html</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-sans">
            {lines.length} linhas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isEditing ? 'Modo Visualização' : 'Editar Código'}
          </button>

          {isEditing && onApplyChanges && (
            <button
              onClick={() => onApplyChanges(editableCode)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-medium transition-colors shadow-xs"
            >
              Aplicar
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-sans font-medium transition-colors border border-slate-200"
            title="Copiar código HTML"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-medium transition-colors shadow-xs"
              title="Baixar código HTML"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Editor / Line Numbers Body */}
      <div className="flex-1 overflow-auto p-4 leading-relaxed font-mono selection:bg-blue-100 selection:text-blue-900 bg-slate-50/50">
        {isEditing ? (
          <textarea
            value={editableCode}
            onChange={(e) => {
              setEditableCode(e.target.value);
              if (onCodeChange) onCodeChange(e.target.value);
            }}
            className="w-full h-full bg-white text-slate-900 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 p-3 resize-none leading-relaxed"
            spellCheck={false}
          />
        ) : (
          <div className="table w-full">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-100 transition-colors">
                <span className="table-cell text-right pr-4 text-slate-400 select-none w-12 text-[11px]">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre text-slate-800">
                  {line || ' '}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
