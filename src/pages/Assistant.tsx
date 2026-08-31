import React, { useState, useEffect, useRef } from 'react';
import { CyberLlamaAvatar, VoiceState } from '../components/CyberLlamaAvatar';
import { ConnectedAppsTree } from '../components/ConnectedAppsTree';
import { fetchWithAuth } from '../lib/api';
import { soundManager } from '../lib/sound';
import { Send, Bot, User as UserIcon, Sparkles, Terminal, CheckCircle2, Cpu, Flame, HardDrive, Wifi, Network, ChevronDown, ChevronUp, Mic, MessageSquare } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'avatar' | 'chat'>('avatar');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [messages, voiceState, mobileTab]);

  useEffect(() => {
    fetchIntegrations();
    fetchActiveConversation();
  }, []);

  const fetchActiveConversation = async () => {
    try {
      const res = await fetchWithAuth('/conversations/active');
      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        if (Array.isArray(data.messages)) {
          const loadedMessages: ChatMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
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

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz nativo. Por favor, utilize o Google Chrome, Microsoft Edge ou Safari.');
      return;
    }

    isUserStoppedRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

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
        if (currentTranscript.trim()) {
          transcriptRef.current = currentTranscript;
          setInputMessage(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Evento de erro no reconhecimento de voz:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
          isUserStoppedRef.current = true;
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        const textToSend = transcriptRef.current.trim();
        transcriptRef.current = '';

        if (textToSend) {
          setVoiceState('idle');
          sendMessage(textToSend);
        } else if (isContinuousRef.current && !isUserStoppedRef.current) {
          // Restart with fresh SpeechRecognition instance after silence or pause
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
      console.error('Erro ao acessar o microfone:', err);
      setVoiceState('idle');
    }
  };

  const stopListening = () => {
    isUserStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceState('idle');
  };

  const handleMicClick = () => {
    if (voiceState === 'listening' || voiceState === 'speaking') {
      stopListening();
    } else {
      startListening();
    }
  };

  const getFormattedTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    soundManager.playClickSound();

    // Add user message locally right away
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: getFormattedTimestamp(),
    };
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
          timestamp: getFormattedTimestamp(),
        };

        setVoiceState('speaking');
        setMessages((prev) => [...prev, assistantMsg]);

        // Calculate speech duration based on response length
        const durationMs = Math.max(2500, data.assistantResponse.length * 65);
        let completed = false;

        const stopSpeaking = () => {
          if (!completed) {
            completed = true;
            setVoiceState('idle');
            // Auto restart listening after JARVIS finishes speaking if continuous mode is enabled!
            if (isContinuousRef.current && !isUserStoppedRef.current) {
              setTimeout(() => {
                if (isContinuousRef.current && !isUserStoppedRef.current) {
                  startListening();
                }
              }, 400);
            }
          }
        };

        // Speak out assistant response using Web Speech Synthesis
        soundManager.speakJarvis(data.assistantResponse, stopSpeaking);

        // Fallback timer based on actual text length
        setTimeout(stopSpeaking, durationMs);
      } else {
        throw new Error('Falha ao processar mensagem no assistente');
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu uma falha ao conectar aos meus sistemas centrais.',
          timestamp: getFormattedTimestamp(),
        },
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
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full py-1 space-y-3 sm:space-y-4">
      {/* Sci-Fi System Status Telemetry HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-tech">
        <div className="glass-panel hud-frame p-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="block text-[8px] sm:text-[10px] text-cyan-400/60 uppercase">CPU LOAD</span>
            <span className="text-cyan-300 font-bold text-[11px] sm:text-xs">14.2% / 3.8 GHz</span>
          </div>
        </div>

        <div className="glass-panel hud-frame p-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="block text-[8px] sm:text-[10px] text-amber-400/60 uppercase">CORE TEMP</span>
            <span className="text-amber-300 font-bold text-[11px] sm:text-xs">36.5°C OPTIMAL</span>
          </div>
        </div>

        <div className="glass-panel hud-frame p-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="block text-[8px] sm:text-[10px] text-sky-400/60 uppercase">MEMORY LOAD</span>
            <span className="text-sky-300 font-bold text-[11px] sm:text-xs">2.1 / 16 GB</span>
          </div>
        </div>

        <div className="glass-panel hud-frame p-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="block text-[8px] sm:text-[10px] text-emerald-400/60 uppercase">AI STREAM</span>
            <span className="text-emerald-300 font-bold text-[11px] sm:text-xs">LATENCY 12ms</span>
          </div>
        </div>
      </div>

      {/* MOBILE SEGMENTED VIEW SWITCHER (TABS FOR SMALL SCREENS) */}
      <div className="lg:hidden flex rounded-xl glass-panel p-1 border border-cyan-500/30 bg-slate-950/80">
        <button
          onClick={() => {
            soundManager.playClickSound();
            setMobileTab('avatar');
          }}
          className={`flex-1 py-2 rounded-lg font-rajdhani font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'avatar'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-slate-100 shadow-[0_0_15px_#FF007A]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>AVATAR DE VOZ</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClickSound();
            setMobileTab('chat');
          }}
          className={`flex-1 py-2 rounded-lg font-rajdhani font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'chat'
              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-slate-950 shadow-[0_0_15px_#00F0FF]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>CONSOLE CHAT ({messages.length})</span>
        </button>
      </div>

      {/* Subtle Connected Apps Node Tree Component */}
      {showTree && <ConnectedAppsTree integrations={integrations} />}

      {/* SIDE-BY-SIDE DASHBOARD GRID (DESKTOP) & TOUCH TABS (MOBILE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 items-stretch">
        {/* LEFT COLUMN: CYBER LLAMA AVATAR & QUICK COMMANDS */}
        <div
          className={`lg:col-span-5 glass-panel hud-frame rounded-2xl p-3.5 sm:p-5 border border-cyan-500/30 flex-col items-center justify-between shadow-[0_0_35px_rgba(0,240,255,0.1)] relative ${
            mobileTab === 'avatar' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
            <button
              onClick={() => {
                soundManager.playClickSound();
                setShowTree(!showTree);
              }}
              className="text-[11px] font-rajdhani font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            >
              <Network className="w-3.5 h-3.5 text-[#E024AF]" />
              <span>{showTree ? 'OCULTAR SERVIÇOS' : 'EXIBIR SERVIÇOS'}</span>
              {showTree ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                const nextMode = !continuousMode;
                setContinuousMode(nextMode);
                if (!nextMode && (voiceState === 'listening' || voiceState === 'speaking')) {
                  stopListening();
                } else if (nextMode && voiceState === 'idle') {
                  startListening();
                }
              }}
              className={`text-[11px] font-rajdhani font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                continuousMode
                  ? 'bg-pink-950/80 border-[#FF007A] text-pink-300 shadow-[0_0_12px_rgba(255,0,122,0.4)]'
                  : 'bg-slate-950/80 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${continuousMode ? 'bg-[#FF007A] animate-ping' : 'bg-slate-600'}`} />
              <span>{continuousMode ? 'MÃOS-LIVRES: ATIVO' : 'MÃOS-LIVRES: DESATIVADO'}</span>
            </button>
          </div>

          {/* Large Cyber Llama Avatar with Parallax & Mouth Animation */}
          <CyberLlamaAvatar
            state={voiceState}
            onClick={handleMicClick}
            hasPermission={hasMicPermission}
            isContinuous={continuousMode}
          />

          {/* Quick Test Commands Bar */}
          <div className="w-full mt-3 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-tech text-cyan-400/80 uppercase w-full text-center block flex items-center justify-center gap-1 tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              COMANDOS DE ATALHO RÁPIDO:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="text-left text-[11px] font-rajdhani font-semibold bg-slate-950/80 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-300 text-cyan-200 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 truncate active:scale-95"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT FEED & TELEMETRY TERMINAL */}
        <div
          className={`lg:col-span-7 flex-col justify-between h-full min-h-[440px] lg:min-h-[540px] space-y-3 ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Executed Tools Telemetry HUD */}
          {executedTools.length > 0 && (
            <div className="glass-panel hud-frame rounded-xl p-3 border border-cyan-500/40 bg-cyan-950/50 text-xs font-tech shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                <Terminal className="w-4 h-4 text-[#E024AF]" />
                <span>FERRAMENTAS EXECUTADAS EM TEMPO REAL:</span>
              </div>
              <div className="space-y-1 pl-4">
                {executedTools.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-cyan-400 font-bold uppercase">{t.tool}</span>
                    <span className="text-slate-400 truncate">- {JSON.stringify(t.result?.message || t.result)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cyberpunk Sci-Fi Chat Feed */}
          <div ref={chatContainerRef} className="flex-1 glass-panel hud-frame rounded-2xl p-3.5 sm:p-5 border border-cyan-500/30 min-h-[340px] max-h-[440px] overflow-y-auto overflow-x-hidden space-y-3 shadow-[0_0_35px_rgba(0,240,255,0.15)] relative">
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div className="text-xs font-orbitron tracking-widest text-cyan-400/80 uppercase text-center border-b border-cyan-500/15 pb-2 flex items-center justify-center gap-2">
              <span>CONSOLE DE COMANDOS J.A.R.V.I.S.</span>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-14 text-slate-500 text-xs font-tech flex flex-col items-center gap-2">
                <Bot className="w-9 h-9 text-cyan-500/50 animate-pulse" />
                <span className="tracking-wider">Sistemas neurais online. Fale ao microfone ou digite um comando abaixo...</span>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-[#E024AF] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(224,36,175,0.4)]">
                        <Bot className="w-4 h-4 text-[#00F0FF]" />
                      </div>
                    )}
                    <div
                      className={`max-w-md rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed break-words overflow-hidden ${
                        isUser
                          ? 'bg-slate-950/90 border-l-4 border-l-[#00F0FF] border border-cyan-500/40 text-slate-100 font-sans rounded-tr-none shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-950/95 border-l-4 border-l-[#E024AF] border border-purple-500/40 text-slate-100 font-sans rounded-tl-none shadow-[0_0_15px_rgba(224,36,175,0.2)]'
                      }`}
                    >
                      {/* Cyberpunk HUD Message Tag Header */}
                      <div className="flex items-center justify-between gap-3 text-[9px] font-tech text-cyan-400/60 border-b border-slate-800 pb-1 mb-1.5">
                        <span className={isUser ? 'text-cyan-400 font-bold' : 'text-[#E024AF] font-bold'}>
                          {isUser ? 'USER // AUTH' : 'JARVIS // CORE'}
                        </span>
                        <span className="text-slate-500">{msg.timestamp || getFormattedTimestamp()}</span>
                      </div>

                      <p className="whitespace-pre-line break-words">{msg.content}</p>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-[#00F0FF] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                        <UserIcon className="w-4 h-4 text-cyan-300" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Touch-Optimized Text Prompt Input Form with Floating Quick Mic Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputMessage);
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite um comando para o J.A.R.V.I.S..."
              className="flex-1 bg-slate-950/95 border border-cyan-500/50 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans text-xs sm:text-sm shadow-[inset_0_0_15px_rgba(0,240,255,0.1)]"
            />
            {/* Quick Mic Button for Mobile Input */}
            <button
              type="button"
              onClick={handleMicClick}
              title="Falar por voz"
              className="lg:hidden p-3.5 rounded-xl bg-pink-950/80 border border-pink-500/50 text-pink-300 hover:text-pink-100 transition-all cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-[#00F0FF] to-[#E024AF] hover:opacity-90 text-slate-950 font-bold px-4 sm:px-6 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(224,36,175,0.5)] flex items-center justify-center cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
