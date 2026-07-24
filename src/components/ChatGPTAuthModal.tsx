import React from 'react';
import { SignInWithChatGPT, useSignInWithChatGPT } from '@openai-oauth/react';
import { X, Sparkles, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, LogOut } from 'lucide-react';

interface ChatGPTAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthStateChange?: (session: any) => void;
}

export const ChatGPTAuthModal: React.FC<ChatGPTAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthStateChange,
}) => {
  const loginState = useSignInWithChatGPT();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800 font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              OpenAI OAuth v2
            </span>
          </div>

          <h3 className="text-xl font-bold">Entrar com ChatGPT</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Conecte sua conta ChatGPT para usar os modelos mais recentes da OpenAI (GPT-5.6, GPT-Image-2) diretamente no navegador.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          {loginState.status === 'signed-in' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Conta ChatGPT Conectada</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Suas credenciais OAuth estão ativas. Agora a IA gerará sites usando sua conta do ChatGPT.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={loginState.logout}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar Conta</span>
                  </button>
                </div>
              </div>
            </div>
          ) : loginState.status === 'needs-extension' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Extensão Necessária para Autenticação</h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Para autenticação segura do ChatGPT em aplicativos web hospedados, é necessária a extensão oficial <b>Sign in with ChatGPT</b> para Chrome ou Firefox.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {loginState.installUrl && (
                  <a
                    href={loginState.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    <span>Instalar Extensão</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={loginState.login}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={loginState.reset}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600 leading-relaxed">
                Clique no botão abaixo para iniciar o fluxo oficial de login do ChatGPT via <b>OpenAI OAuth</b>.
              </p>

              {/* Prebuilt Sign in with ChatGPT button from @openai-oauth/react */}
              <div className="flex justify-center py-2">
                <SignInWithChatGPT
                  onSuccess={(session) => {
                    if (onAuthStateChange) onAuthStateChange(session);
                  }}
                  onError={(err) => console.error('Erro OAuth ChatGPT:', err)}
                  onStateChange={(state) => console.log('Estado OAuth ChatGPT:', state)}
                />
              </div>

              {/* Secondary Custom Login Button */}
              <div>
                <button
                  onClick={loginState.login}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Iniciar Login com ChatGPT (OpenAI OAuth)</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Credenciais armazenadas com segurança no navegador via IndexedDB & WebCrypto. Sem compartilhamento de chaves.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
