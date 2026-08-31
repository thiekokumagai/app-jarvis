import React, { useState, useEffect, useRef } from 'react';
import { ArcReactorMic, VoiceState } from '../components/ArcReactorMic';
import { fetchWithAuth } from '../lib/api';
import { Send, Bot, User as UserIcon, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

export const Assistant: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [executedTools, setExecutedTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceState]);

  // Handle Microphone Permission via Web Media API
  const handleMicClick = async () => {
    if (voiceState === 'idle') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
        setVoiceState('listening');

        // Simulate listening window (in future stage connected to OpenAI WebRTC/Realtime)
        setTimeout(() => {
          // Stop stream tracks
          stream.getTracks().forEach((t) => t.stop());
          
          // Trigger a sample prompt if user hasn't typed
          const samplePrompts = [
            'Agende uma reunião amanhã às 14h com o João',
            'Quais compromissos eu tenho hoje?',
            'Procure o contato do Carlos',
            'Mande um WhatsApp para o Carlos dizendo que vou chegar às 15h',
          ];
          const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          sendMessage(randomPrompt);
        }, 3500);
      } catch (err) {
        console.error('Microphone permission denied', err);
        alert('Permissão de microfone negada ou indisponível no navegador.');
        setVoiceState('idle');
      }
    } else if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message locally right away
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setVoiceState('processing');
    setLoading(true);

    try {
      const res = await fetchWithAuth('/assistant/process', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          conversationId: conversationId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setExecutedTools(data.executedTools || []);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.assistantResponse,
        };

        setVoiceState('speaking');
        setMessages((prev) => [...prev, assistantMsg]);

        // Reset to idle after assistant speaks
        setTimeout(() => {
          setVoiceState('idle');
        }, 3000);
      } else {
        throw new Error('Falha ao processar mensagem no assistente');
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu uma falha ao conectar aos meus sistemas centrais.' },
      ]);
      setVoiceState('idle');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Agende uma reunião amanhã às 14h com o João',
    'Quais compromissos eu tenho hoje?',
    'Procure o contato do Carlos',
    'Mande um WhatsApp para o Carlos dizendo que vou chegar às 15h',
  ];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-2 space-y-6">
      {/* Central Arc Reactor Mic Visualizer */}
      <ArcReactorMic
        state={voiceState}
        onClick={handleMicClick}
        hasPermission={hasMicPermission}
      />

      {/* Quick Test Commands Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-2">
        <span className="text-xs font-mono text-cyan-400/70 uppercase w-full text-center mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Comandos de Teste (Tool Calling):
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="text-xs bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Executed Tools Telemetry HUD */}
      {executedTools.length > 0 && (
        <div className="glass-panel rounded-xl p-3 border border-cyan-500/30 bg-cyan-950/20 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>FERRAMENTAS EXECUTADAS (TOOL CALLING MOCK):</span>
          </div>
          <div className="space-y-1 pl-6">
            {executedTools.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-cyan-400 font-bold">{t.tool}</span>
                <span className="text-slate-400">- {JSON.stringify(t.result?.message || t.result)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation History Feed */}
      <div className="flex-1 glass-panel rounded-2xl p-4 sm:p-6 border border-cyan-500/20 max-h-[380px] overflow-y-auto space-y-4">
        <div className="text-xs font-mono text-cyan-400/50 uppercase tracking-widest text-center border-b border-cyan-500/10 pb-2">
          HISTÓRICO DA CONVERSA
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm font-mono">
            Nenhuma mensagem na sessão atual. Fale ou digite um comando acima.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-slate-950 font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/90 border border-cyan-500/30 text-slate-100 rounded-tl-none font-sans whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-400/40 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-sky-300" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Text Prompt Fallback Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(inputMessage);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite um comando para o J.A.R.V.I.S..."
          className="flex-1 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
