import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';
import { soundManager } from '../lib/sound';

export interface Reminder {
  id: string;
  title: string;
  message?: string;
  remindAt: string;
  status: 'PENDING' | 'SENT' | 'CANCELLED';
  createdAt: string;
}

interface RemindersWidgetProps {
  onClose?: () => void;
  refreshTrigger?: number;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ refreshTrigger }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/reminders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReminders(data);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar lembretes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    soundManager.playClickSound();
    try {
      const res = await fetchWithAuth(`/reminders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error('Erro ao deletar lembrete:', e);
    }
  };

  const formatReminderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Hoje às ${timeStr}`;
    } else if (isTomorrow) {
      return `Amanhã às ${timeStr}`;
    } else {
      return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${timeStr}`;
    }
  };

  return (
    <div className="w-full glass-panel hud-frame rounded-2xl p-4 border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_25px_rgba(0,240,255,0.15)] mb-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 shadow-[0_0_10px_#00F0FF]">
            <Bell className="w-4 h-4 text-[#00F0FF] animate-pulse" />
          </div>
          <div>
            <h3 className="font-orbitron text-xs font-bold tracking-widest text-cyan-300 uppercase glow-cyan">
              PAINEL DE LEMBRETES NEURAIS
            </h3>
            <span className="text-[9px] font-tech text-cyan-400/60 uppercase tracking-wider block">
              {reminders.filter((r) => r.status === 'PENDING').length} PENDENTE(S) AGENDADO(S)
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClickSound();
            fetchReminders();
          }}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer disabled:opacity-50"
          title="Atualizar lembretes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Reminders List Feed */}
      {loading && reminders.length === 0 ? (
        <div className="py-6 text-center text-xs font-tech text-cyan-400/70 animate-pulse">
          Carregando lembretes do banco de dados...
        </div>
      ) : reminders.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs font-tech flex flex-col items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-500/40" />
          <span>Nenhum lembrete agendado no momento. Peça ao J.A.R.V.I.S. por voz ou chat para criar um!</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {reminders.map((reminder) => {
            const isPending = reminder.status === 'PENDING';
            return (
              <div
                key={reminder.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isPending
                    ? 'bg-slate-900/80 border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {isPending ? (
                    <Clock className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {reminder.title}
                    </p>
                    <span className="text-[10px] font-tech text-cyan-400/80 flex items-center gap-1 mt-0.5">
                      {formatReminderDate(reminder.remindAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-tech px-2 py-0.5 rounded-full border font-bold uppercase ${
                      isPending
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_#00F0FF]'
                        : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    }`}
                  >
                    {isPending ? 'PENDENTE' : 'ENVIADO'}
                  </span>

                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 transition-colors cursor-pointer"
                    title="Excluir lembrete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
