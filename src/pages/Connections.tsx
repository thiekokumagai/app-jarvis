import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Calendar, MessageSquare, Workflow, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface IntegrationItem {
  id: string | null;
  provider: string;
  status: string;
  expiresAt?: string | null;
  metadata?: any;
}

export const Connections: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggleGoogle = async (isCurrentlyConnected: boolean) => {
    setActionLoading('google');
    try {
      const endpoint = isCurrentlyConnected ? '/integrations/google/disconnect' : '/integrations/google/connect';
      const res = await fetchWithAuth(endpoint, { method: 'POST' });
      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleWhatsApp = async (isCurrentlyConnected: boolean) => {
    setActionLoading('whatsapp');
    try {
      const endpoint = isCurrentlyConnected ? '/integrations/whatsapp/disconnect' : '/integrations/whatsapp/connect';
      const res = await fetchWithAuth(endpoint, { method: 'POST' });
      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getIntegration = (provider: string) => {
    return integrations.find((i) => i.provider.toLowerCase() === provider.toLowerCase());
  };

  const googleInt = getIntegration('google');
  const isGoogleConnected = googleInt?.status === 'CONNECTED';

  const whatsappInt = getIntegration('whatsapp');
  const isWhatsAppConnected = whatsappInt?.status === 'CONNECTED';

  const n8nInt = getIntegration('n8n');

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-300 glow-cyan">Conexões de Integração</h1>
          <p className="text-xs font-mono text-cyan-400/60 mt-1">
            CONECTORES DE SERVIÇO E SERVIDORES EXTERNOS
          </p>
        </div>
        <button
          onClick={fetchIntegrations}
          className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Card */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-400/40 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                  isGoogleConnected
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {isGoogleConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Google Workspace</h3>
              <p className="text-xs text-slate-400 mt-1">
                Integração com Google Calendar (Agendamentos) e Google Contacts (Agenda telefônica).
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/10">
            <button
              onClick={() => handleToggleGoogle(isGoogleConnected)}
              disabled={actionLoading === 'google'}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isGoogleConnected
                  ? 'bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              }`}
            >
              {actionLoading === 'google' ? (
                <span className="font-mono text-xs animate-pulse">PROCESSANDO...</span>
              ) : isGoogleConnected ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Desconectar</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Conectar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                  isWhatsAppConnected
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {isWhatsAppConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">WhatsApp API</h3>
              <p className="text-xs text-slate-400 mt-1">
                Envio automático de mensagens de voz e texto via assistente para contatos.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/10">
            <button
              onClick={() => handleToggleWhatsApp(isWhatsAppConnected)}
              disabled={actionLoading === 'whatsapp'}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isWhatsAppConnected
                  ? 'bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {actionLoading === 'whatsapp' ? (
                <span className="font-mono text-xs animate-pulse">PROCESSANDO...</span>
              ) : isWhatsAppConnected ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Desconectar</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Conectar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* n8n Card */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-400/40 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full border bg-slate-900 border-slate-700 text-slate-400">
                Não configurado
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">n8n Automation</h3>
              <p className="text-xs text-slate-400 mt-1">
                Automações de fluxos complexos via Webhooks (`N8N_WEBHOOK_URL`).
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/10">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400/80 bg-amber-950/30 py-2.5 px-3 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Configure em .env</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
