import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Lock, Mail, User as UserIcon, Building, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, organizationName);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Bot className="w-7 h-7 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-cyan-300 glow-cyan">
            CRIAR CONTA J.A.R.V.I.S.
          </h1>
          <p className="text-xs font-mono text-cyan-400/60 uppercase tracking-widest mt-1">
            ARQUITETURA MULTI-TENANT
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase">Nome Completo</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tony Stark"
                className="w-full bg-slate-950/70 border border-cyan-500/20 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="stark@starkindustries.com"
                className="w-full bg-slate-950/70 border border-cyan-500/20 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase">Nome da Organização</label>
            <div className="relative">
              <Building className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Stark Industries (Opcional)"
                className="w-full bg-slate-950/70 border border-cyan-500/20 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950/70 border border-cyan-500/20 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="font-mono text-sm">CRIANDO SISTEMA...</span>
            ) : (
              <>
                <span>REGISTRAR E CONECTAR</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Já possui registro?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Faça Login
          </Link>
        </div>
      </div>
    </div>
  );
};
