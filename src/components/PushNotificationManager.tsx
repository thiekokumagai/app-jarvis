import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { fetchWithAuth } from '../lib/api';
import { Bell, Sparkles, X } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationManager: React.FC = () => {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const { needRefresh } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        setSwRegistration(r);
      }
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      if (!('Notification' in window)) {
        return;
      }
      const permission = await Notification.requestPermission();
      setShowBanner(false);
      if (permission === 'granted') {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn('VITE_VAPID_PUBLIC_KEY não configurada no .env.');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Envia para o backend se disponível
        await fetchWithAuth('/users/web-push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
      }
    } catch (error) {
      console.error('Erro ao ativar notificações push:', error);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (swRegistration && Notification.permission === 'default') {
      setShowBanner(true);
    } else if (swRegistration && Notification.permission === 'granted') {
      registrationCheck(swRegistration);
    }
  }, [swRegistration]);

  const registrationCheck = async (registration: ServiceWorkerRegistration) => {
    try {
      const sub = await registration.pushManager.getSubscription();
      if (!sub) {
        subscribeToPush(registration);
      } else {
        await fetchWithAuth('/users/web-push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!showBanner || !swRegistration) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-cyan-500/40 bg-[#0A1220] p-6 text-slate-100 shadow-[0_0_50px_rgba(0,240,255,0.3)] relative">
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Bell className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-cyan-300 glow-cyan">Notificações do J.A.R.V.I.S.</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
            Ative as notificações para receber alertas em tempo real de compromissos, tarefas e atualizações do assistente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs cursor-pointer transition-all"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={() => subscribeToPush(swRegistration)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ativar Notificações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
