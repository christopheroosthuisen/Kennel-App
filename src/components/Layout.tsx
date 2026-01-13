
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, Search, ShoppingCart, HelpCircle, User, LayoutDashboard, 
  Calendar, Dog, CreditCard, FileText, Settings, ChevronLeft, ChevronRight, 
  Sparkles, X, Plus, LogOut, Command, GitBranch, Mic, Send, MapPin, Globe, BrainCircuit, Zap, Link as LinkIcon, Volume2, StopCircle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, Button, Input, Badge, Select } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useEventStream } from '../hooks/useEventStream';
import { chatWithGemini, connectLiveSession } from '../services/ai';
import { LiveServerMessage } from '@google/genai';
import { PetDetailDrawer } from './PetDetailDrawer';

const NavItem = ({ icon: Icon, label, path, collapsed, active }: { icon: any, label: string, path: string, collapsed: boolean, active: boolean }) => (
  <Link 
    to={path}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
      active ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} className={cn("min-w-[20px]", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
    {!collapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
  </Link>
);

// Helper for Audio Decode/Play
const AudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const initContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playChunk = async (base64Audio: string) => {
    initContext();
    const ctx = audioContextRef.current!;
    
    // Resume if suspended
    if (ctx.state === 'suspended') await ctx.resume();

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    const dataInt16 = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) float32Data[i] = dataInt16[i] / 32768.0;

    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    // Schedule next chunk
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  return { playChunk, stop: () => audioContextRef.current?.close() };
};

export const AppLayout = ({ children, showAI, toggleAI }: { children?: React.ReactNode, showAI: boolean, toggleAI: () => void }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Chat State
  const [chatHistory, setChatHistory] = useState<{role: string, parts: any[], grounding?: any}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState<'standard' | 'thinking' | 'search' | 'maps'>('standard');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Mode State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlayer = useRef(AudioPlayer());

  // Notification count
  const { data: notifications = [], refetch: refetchNotifs } = useApiQuery('unread-notifs', () => api.listNotifications({ unreadOnly: true }));
  useEventStream((e) => {
     if (e.type === 'notification') refetchNotifs();
  });

  const unreadCount = notifications.length;

  // Pet Drawer State
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const { data: pets = [], refetch: refetchPets } = useApiQuery('layout-pets', () => api.getPets());
  const selectedPet = pets.find(p => p.id === selectedPetId);

  useEffect(() => {
    if (showAI && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, showAI]);

  // Quick Nav Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickNavOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', parts: [{ text: chatInput }] };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await chatWithGemini(chatHistory.map(h => ({ role: h.role, parts: h.parts })), chatInput, chatMode);
      
      const modelMsg = { 
        role: 'model', 
        parts: [{ text: response.text }],
        grounding: response.grounding
      };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error processing that request." }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = e.currentTarget.value;
      setQuickNavOpen(false);
      navigate(`/owners-pets?search=${term}`);
    }
  };

  // --- Live API Handlers ---

  const startLiveSession = async () => {
    if (isLiveActive) return;
    setIsLiveActive(true);
    setLiveStatus('connecting');

    try {
      // Input Audio Context (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = connectLiveSession(
        (msg: LiveServerMessage) => {
          // Handle incoming audio
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            audioPlayer.current.playChunk(audioData);
          }
          // Handle Turn Complete (optional: show transcript)
        },
        () => setLiveStatus('connected'),
        () => { setLiveStatus('disconnected'); setIsLiveActive(false); },
        (err) => { console.error("Live Error", err); setLiveStatus('disconnected'); setIsLiveActive(false); }
      );

      liveSessionRef.current = sessionPromise;

      // Send Input Audio
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Base64 Encode
        let binary = '';
        const bytes = new Uint8Array(pcmData.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
        const base64Audio = btoa(binary);

        sessionPromise.then(session => {
          session.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Audio
            }
          });
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

    } catch (e) {
      console.error("Failed to start live session", e);
      setIsLiveActive(false);
      setLiveStatus('disconnected');
    }
  };

  const stopLiveSession = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Note: session.close() logic depends on SDK implementation, assuming implicit close on component unmount or reload for now
    setIsLiveActive(false);
    setLiveStatus('disconnected');
    window.location.reload(); // Hard reset to clear audio buffers/sockets for demo stability
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Reservations', path: '/reservations' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CreditCard, label: 'Point of Sale', path: '/pos' },
    { icon: Dog, label: 'Owners & Pets', path: '/owners-pets' },
    { icon: GitBranch, label: 'Automations', path: '/automations' },
    { icon: FileText, label: 'Report Cards', path: '/report-cards' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Admin', path: '/admin' },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-20",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-xl overflow-hidden">
             <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center shrink-0">
               <Dog size={20} className="text-white" />
             </div>
             {!collapsed && <span className="truncate">Partners</span>}
            </div>
        </div>

        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <React.Fragment key={item.path}>
              <NavItem 
                {...item} 
                collapsed={collapsed} 
                active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))} 
              />
            </React.Fragment>
          ))}

          {/* Recent Pets Section (Trigger for Drawer) */}
          {!collapsed && (
            <div className="mt-8">
              <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Checked In Pets</div>
              <div className="space-y-1">
                {pets.slice(0, 4).map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-slate-800 text-left group"
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-primary-500 transition-all">
                        <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                      </div>
                      {(pet.tags || []).length > 0 && <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-slate-300 group-hover:text-white truncate">{pet.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{pet.breed}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-2 border-t border-slate-800">
           <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
           >
             {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header 
          className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10"
          onDoubleClick={() => setQuickNavOpen(true)}
        >
           {/* Left: Location & Search */}
           <div className="flex items-center gap-6 flex-1">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer hover:text-primary-600">
                  Downtown Facility <ChevronRight size={14}/>
                </span>
             </div>
             <div 
                className="relative w-96 group"
                onClick={() => setQuickNavOpen(true)}
             >
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
               <input 
                 readOnly
                 placeholder="Search owners, pets, reservations... (Cmd+K)" 
                 className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 cursor-text hover:bg-slate-200 transition-colors"
               />
             </div>
           </div>

           {/* Right: Actions */}
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" title="Help"><HelpCircle size={20} /></Button>
             
             {/* Cart Button */}
             <Button 
                variant="ghost" size="icon" title="POS Cart" className="relative"
                onClick={() => navigate('/pos')}
             >
                <ShoppingCart size={20} />
             </Button>

             {/* Notification Button */}
             <Button 
                variant="ghost" size="icon" title="Notifications" className="relative"
                onClick={() => navigate('/notifications')}
             >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
             </Button>
             
             <div className="h-6 w-px bg-slate-200 mx-2" />

             <Button 
                onClick={toggleAI}
                className={cn(
                  "gap-2 border transition-all",
                  showAI ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                )}
             >
               <Sparkles size={16} className={showAI ? "fill-indigo-300 text-indigo-600" : "text-slate-400"} />
               <span className="hidden sm:inline font-medium">AI Copilot</span>
             </Button>

             <div className="ml-2 flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer">
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  JD
                </div>
             </div>
           </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50 relative">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>

        {/* Pet Detail Drawer */}
        <PetDetailDrawer 
          isOpen={!!selectedPetId} 
          onClose={() => setSelectedPetId(null)} 
          pet={selectedPet}
          onUpdate={refetchPets}
        />
      </div>

      {/* AI Assistant Panel (Right Side) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-200 flex flex-col",
        showAI ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Sparkles size={18} className="text-indigo-600 fill-indigo-200" />
            <span>AI Copilot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAI}><X size={18} /></Button>
        </div>
        
        {isLiveActive ? (
          // Live Mode UI
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-slate-900 pointer-events-none"></div>
             
             <div className={cn("relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500", liveStatus === 'connected' ? "bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] animate-pulse" : "bg-slate-700")}>
                <Mic size={48} className="text-white"/>
             </div>
             
             <h3 className="mt-8 text-xl font-bold relative z-10">
               {liveStatus === 'connecting' ? 'Connecting...' : liveStatus === 'connected' ? 'Listening...' : 'Disconnected'}
             </h3>
             <p className="text-slate-400 mt-2 text-sm relative z-10 text-center max-w-xs">
                Speak naturally. Gemini Live is processing your audio in real-time.
             </p>

             <Button 
               variant="danger" 
               className="mt-12 rounded-full px-8 h-12 gap-2 relative z-10"
               onClick={stopLiveSession}
             >
               <StopCircle size={20}/> End Session
             </Button>
          </div>
        ) : (
          // Chat Mode UI
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
              {chatHistory.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-8 space-y-2">
                  <p>How can I help you today?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className="cursor-pointer" onClick={() => setChatInput("Summarize today's check-ins")}>Summarize Check-ins</Badge>
                    <Badge className="cursor-pointer" onClick={() => { setChatMode('thinking'); setChatInput("Plan staff schedule for holiday week"); }}>Plan Holidays (Thinking)</Badge>
                    <Badge className="cursor-pointer" onClick={() => { setChatMode('search'); setChatInput("Current dog flu outbreaks in Phoenix"); }}>Search News</Badge>
                  </div>
                </div>
              )}
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 text-sm rounded-lg shadow-sm whitespace-pre-wrap",
                    msg.role === 'user' ? "bg-primary-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                  )}>
                    {msg.parts[0].text}
                  </div>
                  
                  {/* Render Grounding Sources */}
                  {msg.grounding?.groundingChunks && (
                    <div className="mt-2 max-w-[85%] bg-slate-100 p-2 rounded-md text-xs border border-slate-200">
                       <span className="font-bold text-slate-500 uppercase tracking-wider mb-1 block">Sources</span>
                       <div className="space-y-1">
                          {msg.grounding.groundingChunks.map((chunk: any, idx: number) => (
                             <div key={idx}>
                                {chunk.web?.uri && (
                                   <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline truncate">
                                      <LinkIcon size={10}/> {chunk.web.title || chunk.web.uri}
                                   </a>
                                )}
                                {chunk.maps?.placeAnswerSources?.map((place: any, pIdx: number) => (
                                   <div key={pIdx} className="text-slate-600 flex items-center gap-1">
                                      <MapPin size={10}/> {place.reviewSnippets?.[0]?.text || "Map Result"}
                                   </div>
                                ))}
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                  <button 
                    onClick={() => setChatMode('standard')}
                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded border", chatMode === 'standard' ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-500")}
                  >
                    <Zap size={12}/> Standard
                  </button>
                  <button 
                    onClick={() => setChatMode('thinking')}
                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded border", chatMode === 'thinking' ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-500")}
                  >
                    <BrainCircuit size={12}/> Thinking
                  </button>
                  <button 
                    onClick={() => setChatMode('search')}
                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded border", chatMode === 'search' ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-500")}
                  >
                    <Globe size={12}/> Search
                  </button>
                  <button 
                    onClick={() => setChatMode('maps')}
                    className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded border", chatMode === 'maps' ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-slate-200 text-slate-500")}
                  >
                    <MapPin size={12}/> Maps
                  </button>
              </div>

              <div className="flex gap-2">
                <Input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                  placeholder={`Ask Gemini (${chatMode})...`}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleChatSubmit} disabled={!chatInput.trim() || isTyping}>
                  <Send size={16}/>
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Live Voice Mode" 
                  className="text-red-500 hover:bg-red-50"
                  onClick={startLiveSession}
                >
                  <Mic size={18}/>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Nav Overlay */}
      {quickNavOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQuickNavOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-100 flex items-center gap-3">
               <Search className="text-slate-400" />
               <input 
                 autoFocus
                 placeholder="Go to page or search database..." 
                 className="flex-1 text-lg font-medium placeholder:text-slate-400 outline-none"
                 onKeyDown={handleSearch}
               />
               <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">ESC</span>
             </div>
             <div className="p-2 max-h-[60vh] overflow-y-auto">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
                <div className="space-y-1">
                   {[
                     { label: 'New Reservation', icon: Calendar, shortcut: 'N', action: () => navigate('/reservations') },
                     { label: 'Quick Check-In', icon: LogOut, shortcut: 'C', rotate: 180, action: () => navigate('/') },
                     { label: 'Take Payment', icon: CreditCard, shortcut: 'P', action: () => navigate('/pos') },
                   ].map((action, i) => (
                     <div 
                        key={i} 
                        onClick={() => { action.action(); setQuickNavOpen(false); }}
                        className="flex items-center justify-between px-3 py-3 hover:bg-primary-50 hover:text-primary-700 rounded-md cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <action.icon size={18} className={cn("text-slate-500 group-hover:text-primary-600", action.rotate && "rotate-180")} />
                          <span className="font-medium text-slate-700 group-hover:text-primary-800">{action.label}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono group-hover:text-primary-400">Cmd+{action.shortcut}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
