import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building, ShieldCheck, Key, Database, Cpu } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const primaryOrg = user?.organizations?.[0]?.organization;
  const userRole = user?.organizations?.[0]?.role || 'OWNER';

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-2xl font-bold text-cyan-300 glow-cyan">Configurações do Sistema</h1>
        <p className="text-xs font-mono text-cyan-400/60 mt-1">
          PERFIL DE USUÁRIO, MULTI-TENANT E SEGURANÇA DA CONTA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-3 text-cyan-300 border-b border-cyan-500/20 pb-3">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg">Dados do Operador</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">Nome</span>
              <span className="font-medium text-slate-100">{user?.name}</span>
            </div>
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">E-mail</span>
              <span className="font-medium text-slate-100">{user?.email}</span>
            </div>
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">ID de Operador (UUID)</span>
              <span className="font-mono text-xs text-cyan-400/80 bg-slate-950 px-2 py-1 rounded border border-cyan-500/20 block mt-1 break-all">
                {user?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Organization / Tenant Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-3 text-cyan-300 border-b border-cyan-500/20 pb-3">
            <Building className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg">Organização (Tenant)</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">Nome da Organização</span>
              <span className="font-medium text-slate-100">{primaryOrg?.name || 'Organização Padrão'}</span>
            </div>
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">Nível de Acesso</span>
              <span className="inline-block mt-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                {userRole}
              </span>
            </div>
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase">ID da Organização</span>
              <span className="font-mono text-xs text-cyan-400/80 bg-slate-950 px-2 py-1 rounded border border-cyan-500/20 block mt-1 break-all">
                {primaryOrg?.id || 'Multi-tenant Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & System Status Info */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-3 text-cyan-300 border-b border-cyan-500/20 pb-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-lg">Segurança e Criptografia do Backend</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Key className="w-4 h-4" />
              <span>TOKEN ENCRYPTION</span>
            </div>
            <p className="text-slate-400">AES-256-CBC habilitado via EncryptionService com a chave ENCRYPTION_KEY.</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Database className="w-4 h-4" />
              <span>ISOLAMENTO PRISMA</span>
            </div>
            <p className="text-slate-400">Filtro rigoroso por userId em todas as consultas SQL/ORM do banco.</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Cpu className="w-4 h-4" />
              <span>TOOL REGISTRY ENGINE</span>
            </div>
            <p className="text-slate-400">Tool Calling dinâmico com auditoria em tempo real na tabela ToolExecution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
