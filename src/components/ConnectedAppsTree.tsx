import React from 'react';
import { Calendar, MessageSquare, Workflow, Globe, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface IntegrationNode {
  name: string;
  provider: string;
  icon: React.ComponentType<any>;
  status: 'CONNECTED' | 'DISCONNECTED' | 'NOT_CONFIGURED';
  color: string;
}

interface ConnectedAppsTreeProps {
  integrations?: any[];
}

export const ConnectedAppsTree: React.FC<ConnectedAppsTreeProps> = ({ integrations = [] }) => {
  const getStatus = (provider: string): 'CONNECTED' | 'DISCONNECTED' | 'NOT_CONFIGURED' => {
    const found = integrations.find((i) => i.provider?.toLowerCase() === provider.toLowerCase());
    if (found) return found.status as any;
    return provider === 'n8n' ? 'NOT_CONFIGURED' : 'DISCONNECTED';
  };

  const nodes: IntegrationNode[] = [
    {
      name: 'Google',
      provider: 'google',
      icon: Calendar,
      status: getStatus('google'),
      color: '#4285F4',
    },
    {
      name: 'WhatsApp',
      provider: 'whatsapp',
      icon: MessageSquare,
      status: getStatus('whatsapp'),
      color: '#25D366',
    },
    {
      name: 'n8n',
      provider: 'n8n',
      icon: Workflow,
      status: getStatus('n8n'),
      color: '#FF6D5A',
    },
    {
      name: 'Vercel',
      provider: 'vercel',
      icon: Globe,
      status: getStatus('vercel'),
      color: '#00F0FF',
    },
  ];

  return (
    <div className="w-full glass-panel hud-frame rounded-xl p-2.5 sm:p-3 border border-cyan-500/30 my-2 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Subtle Section Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-[#E024AF] animate-pulse" />
          <span className="font-orbitron text-xs font-bold text-cyan-300 tracking-wider">
            SERVIÇOS CONECTADOS:
          </span>
        </div>

        {/* Compact Horizontal Nodes Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isConnected = node.status === 'CONNECTED';
            return (
              <div
                key={index}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
                  isConnected
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/60 border-cyan-500/20 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: node.color }} />
                <span className="font-rajdhani font-semibold text-xs truncate">{node.name}</span>
                {isConnected ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />
                ) : (
                  <XCircle className="w-3 h-3 text-slate-500 shrink-0 ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
