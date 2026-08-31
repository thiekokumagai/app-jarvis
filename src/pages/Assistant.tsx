import React, { useState, useEffect, useRef } from 'react';
import { VoiceState } from '../components/CyberLlamaAvatar';
import { ConnectedAppsTree } from '../components/ConnectedAppsTree';
import { RemindersWidget } from '../components/RemindersWidget';
import { NeuralParticleOrb } from '../components/NeuralParticleOrb';
import { LeftTelemetryPanel, RightTelemetryPanel } from '../components/SciFiTelemetryPanels';
import { fetchWithAuth } from '../lib/api';
import { soundManager } from '../lib/sound';
import { Send, Bot, User as UserIcon, Sparkles, Terminal, CheckCircle2, Cpu, Flame, HardDrive, Wifi, Network, ChevronDown, ChevronUp, Mic, MessageSquare, Bell, Radio, Lock, Globe } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export const Assistant: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [executedTools, setExecutedTools] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [showTree, setShowTree] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showChatConsole, setShowChatConsole] = useState(false);
  const [remindersRefreshTrigger, setRemindersRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live Digital Clock
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(timer);
  }, [messages, voiceState, showChatConsole]);

  useEffect(() => {
    fetchIntegrations();
    fetchActiveConversation();
  }, []);

  const fetchActiveConversation = async () => {
    try {
      const res = await fetchWithAuth('/conversations/active');
      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) setConversationId(data.conversationId);
        if (Array.isArray(data.messages)) {
          const loadedMessages: ChatMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : getFormattedTimestamp(),
          }));
          setMessages(loadedMessages);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar histórico de conversas:', e);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetchWithAuth('/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const isContinuousRef = useRef<boolean>(true);
  const isUserStoppedRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    isContinuousRef.current = continuousMode;
  }, [continuousMode]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    isUserStoppedRef.current = false;
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch (e) {} }

    try {
      soundManager.playClickSound();
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognitionRef.current = recognition;
      transcriptRef.current = '';

      recognition.onstart = () => {
        setHasMicPermission(true);
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) transcriptRef.current = currentTranscript;
      };

      recognition.onend = () => {
        const textToSend = transcriptRef.current.trim();
        transcriptRef.current = '';
        if (textToSend) {
          setVoiceState('idle');
          sendMessage(textToSend);
        } else if (isContinuousRef.current && !isUserStoppedRef.current) {
          setTimeout(() => {
            if (isContinuousRef.current && !isUserStoppedRef.current) {
              startListening();
            } else {
              setVoiceState('idle');
            }
          }, 350);
        } else {
          setVoiceState('idle');
        }
      };
      recognition.start();
    } catch (err) {
      setVoiceState('idle');
    }
  };

  const stopListening = () => {
    isUserStoppedRef.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    setVoiceState('idle');
  };

  const handleMicClick = () => {
    if (voiceState === 'listening' || voiceState === 'speaking') stopListening();
    else startListening();
  };

  const getFormattedTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    soundManager.playClickSound();

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: getFormattedTimestamp() };
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
          userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          userLocalTimeStr: new Date().toLocaleString('pt-BR'),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        const toolsArr = data.executedTools || [];
        setExecutedTools(toolsArr);
        if (toolsArr.some((t: any) => t.tool === 'reminder.create' || t.tool === 'reminder.delete')) {
          setRemindersRefreshTrigger((prev) => prev + 1);
        }

        const assistantMsg: ChatMessage = { role: 'assistant', content: data.assistantResponse, timestamp: getFormattedTimestamp() };
        setVoiceState('speaking');
        setMessages((prev) => [...prev, assistantMsg]);

        const durationMs = Math.max(2500, data.assistantResponse.length * 65);
        let completed = false;

        const stopSpeaking = () => {
          if (!completed) {
            completed = true;
            setVoiceState('idle');
            if (isContinuousRef.current && !isUserStoppedRef.current) {
              setTimeout(() => {
                if (isContinuousRef.current && !isUserStoppedRef.current) startListening();
              }, 400);
            }
          }
        };

        soundManager.speakJarvis(data.assistantResponse, stopSpeaking);
        setTimeout(stopSpeaking, durationMs);
      } else {
        throw new Error('Falha ao processar mensagem');
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erro de conexão.', timestamp: getFormattedTimestamp() }]);
      setVoiceState('idle');
    } finally {
      setLoading(false);
    }
  };

  const latestMessage = messages[messages.length - 1];

  const getOrbStateText = () => {
    switch (voiceState) {
      case 'listening': return 'O U V I N D O . . .';
      case 'processing': return 'P R O C E S S A N D O . . .';
      case 'speaking': return 'F A L A N D O . . .';
      case 'idle':
      default: return 'S I S T E M A  P R O N T O';
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full py-1 space-y-3 font-tech select-none">
      <div className="flex items-center justify-between glass-panel hud-frame px-4 py-2 rounded-2xl border border-cyan-500/30 bg-slate-950/90 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="flex items-center gap-3">
          <span className="font-orbitron font-black text-sm sm:text-base tracking-widest text-cyan-300 glow-cyan uppercase">
            GENOS · ASSISTENTE DE IA
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SISTEMA ONLINE
          </span>
          <span className="hidden sm:flex items-center gap-1 text-cyan-400/80">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>VOICE LINK</span>
          </span>
          <span className="text-cyan-200 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {currentTime || '10:36:21'}
          </span>
        </div>
      </div>

      {showTree && <ConnectedAppsTree integrations={integrations} />}
      {showReminders && <RemindersWidget refreshTrigger={remindersRefreshTrigger} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
        <div className="hidden lg:block lg:col-span-3">
          <LeftTelemetryPanel state={voiceState} />
        </div>

        <div className="lg:col-span-6 glass-panel hud-frame rounded-2xl p-4 border border-cyan-500/30 flex flex-col items-center justify-between bg-slate-950/80 shadow-[0_0_40px_rgba(0,240,255,0.12)] relative min-h-[460px]">
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />

          <div className="flex items-center gap-2 flex-wrap justify-center z-20">
            <button onClick={() => { soundManager.playClickSound(); setShowReminders(!showReminders); }} className={`text-[10px] font-orbitron font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${showReminders ? 'bg-cyan-950 border-[#00F0FF] text-cyan-300 shadow-[0_0_12px_#00F0FF]' : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'}`}>
              <Bell className="w-3 h-3 text-[#00F0FF]" />
              <span>{showReminders ? 'OCULTAR LEMBRETES' : 'LEMBRETES'}</span>
            </button>
            <button onClick={() => { soundManager.playClickSound(); setShowChatConsole(!showChatConsole); }} className={`text-[10px] font-orbitron font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${showChatConsole ? 'bg-cyan-950 border-[#00F0FF] text-cyan-300 shadow-[0_0_12px_#00F0FF]' : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'}`}>
              <MessageSquare className="w-3 h-3 text-[#00F0FF]" />
              <span>{showChatConsole ? 'OCULTAR CONSOLE' : `CONSOLE CHAT (${messages.length})`}</span>
            </button>
            <button onClick={() => { soundManager.playClickSound(); setShowTree(!showTree); }} className="text-[10px] font-orbitron font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer">
              <Network className="w-3 h-3 text-[#E024AF]" />
              <span>{showTree ? 'OCULTAR SERVIÇOS' : 'SERVIÇOS'}</span>
            </button>
            <button onClick={() => { soundManager.playClickSound(); setContinuousMode(!continuousMode); }} className={`text-[10px] font-orbitron font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${continuousMode ? 'bg-pink-950/80 border-[#FF007A] text-pink-300 shadow-[0_0_12px_rgba(255,0,122,0.4)]' : 'bg-slate-950/80 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${continuousMode ? 'bg-[#FF007A] animate-ping' : 'bg-slate-600'}`} />
              <span>{continuousMode ? 'MÃOS-LIVRES: ATIVO' : 'MÃOS-LIVRES: DESATIVADO'}</span>
            </button>
          </div>

          <div className="text-center my-2 z-10">
            <span className="font-orbitron font-bold text-base sm:text-lg tracking-[0.3em] text-cyan-300 uppercase glow-cyan">{getOrbStateText()}</span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center relative my-1">
            <NeuralParticleOrb state={voiceState} onClick={handleMicClick} />
            {latestMessage && (
              <div className="absolute bottom-2 max-w-md bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md px-4 py-2 rounded-2xl text-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <span className="text-[9px] font-tech text-cyan-400/70 block uppercase font-bold mb-0.5">{latestMessage.role === 'user' ? 'USER SAYS:' : 'JARVIS REPLIES:'}</span>
                <p className="text-xs font-sans text-slate-200 leading-snug line-clamp-2">"{latestMessage.content}"</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center z-20 my-2">
            <button onClick={handleMicClick} className={`w-16 h-16 rounded-full glass-panel border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${voiceState === 'listening' ? 'border-[#E024AF] shadow-[0_0_35px_#E024AF] scale-110 ring-4 ring-pink-500/40' : voiceState === 'speaking' ? 'border-[#00F0FF] shadow-[0_0_35px_#00F0FF] animate-pulse ring-4 ring-cyan-400/40' : 'border-cyan-500/50 hover:border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.4)]'}`}>
              <Mic className={`w-7 h-7 ${voiceState === 'listening' ? 'text-[#E024AF] animate-bounce' : voiceState === 'speaking' ? 'text-[#00F0FF] animate-pulse' : 'text-cyan-300'}`} />
            </button>
          </div>

          {showChatConsole && (
            <div className="w-full mt-3 glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-slate-950/95 space-y-3 z-30 max-h-80 overflow-y-auto">
              <div className="text-xs font-orbitron tracking-widest text-cyan-400 uppercase text-center border-b border-cyan-500/20 pb-2">CONSOLE DE COMANDOS COMPLETO</div>
              <div ref={chatContainerRef} className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm rounded-xl px-3 py-2 text-xs break-words ${msg.role === 'user' ? 'bg-slate-900 border-l-2 border-l-cyan-400 text-slate-100' : 'bg-slate-950 border-l-2 border-l-pink-500 text-slate-100'}`}>
                      <div className="flex justify-between gap-2 text-[9px] text-cyan-400/60 mb-1">
                        <span className="font-bold">{msg.role === 'user' ? 'USER' : 'JARVIS'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }} className="flex gap-2 pt-2 border-t border-cyan-500/20">
                <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Digite um comando..." className="flex-1 bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-300" />
                <button type="submit" disabled={loading || !inputMessage.trim()} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer disabled:opacity-50"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:col-span-3">
          <RightTelemetryPanel state={voiceState} />
        </div>
      </div>

      <div className="flex items-center justify-between glass-panel hud-frame px-4 py-2 rounded-2xl border border-cyan-500/30 bg-slate-950/90 shadow-[0_0_20px_rgba(0,240,255,0.1)] text-[10px] font-mono text-cyan-400/70">
        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-cyan-400" /> 24°C · SÃO PAULO, BR</span>
        <div className="flex items-center gap-6 bg-slate-900/90 px-4 py-1.5 rounded-full border border-cyan-500/30">
          <Bot className="w-4 h-4 text-cyan-300 cursor-pointer" />
          <Radio className="w-4 h-4 text-cyan-400 cursor-pointer" />
          <Cpu className="w-4 h-4 text-cyan-400 cursor-pointer" />
          <Sparkles className="w-4 h-4 text-pink-400 cursor-pointer" />
        </div>
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Lock className="w-3.5 h-3.5" /> ENCRYPTION AES-256</span>
      </div>
    </div>
  );
};
