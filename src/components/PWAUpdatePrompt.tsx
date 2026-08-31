import React, { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Sparkles } from 'lucide-react';

export const PWAUpdatePrompt: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        // Checar por atualizações no servidor a cada 20s e ao focar/reabrir o app
        const checkUpdate = async () => {
          if (!navigator.onLine) return;
          try {
            // Bypass HTTP cache para garantir que pega o sw.js atualizado do servidor
            await fetch(swScriptUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
            await registration.update();
          } catch (e) {
            console.debug('Erro na checagem de SW:', e);
          }
        };

        const interval = setInterval(checkUpdate, 20000);
        window.addEventListener('focus', checkUpdate);
        window.addEventListener('online', checkUpdate);
      }
    },
    onRegisterError(error: any) {
      console.error('PWA SW Register Error:', error);
    },
  });

  const handleReload = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            window.location.reload();
          },
          { once: true }
        );
      }

      await updateServiceWorker(true);

      // Fallback de segurança caso controllerchange não dispare em até 600ms
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e) {
      console.error('Erro ao atualizar PWA:', e);
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[9999] flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/40 bg-[#0A1220]/95 p-4 text-slate-100 shadow-[0_0_35px_rgba(0,240,255,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col text-sm">
          <span className="font-bold text-cyan-300 glow-cyan">Nova versão do J.A.R.V.I.S.! 🎉</span>
          <span className="text-slate-400 text-xs">Uma atualização do sistema foi encontrada.</span>
        </div>
      </div>
      <button
        onClick={handleReload}
        disabled={isUpdating}
        className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
        <span>{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
      </button>
    </div>
  );
};
