
import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Mail, MessageSquare, StickyNote, Clock, Send, 
  Paperclip, Mic, Pause, Play, AlertCircle, Pin, Reply, 
  MoreHorizontal, Check, User, ArrowRight, X
} from 'lucide-react';
import { Card, Button, Textarea, Badge, Select, cn, Input } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useEventStream } from '../hooks/useEventStream';
import { Message, MessageThread } from '../../shared/domain';

// --- Types ---

type ActivityType = 'NOTE' | 'SMS' | 'EMAIL' | 'CALL' | 'SYSTEM';

// --- Components ---

export const CRMCommunicationHub = ({ ownerId }: { ownerId: string }) => {
  const [activeTab, setActiveTab] = useState<ActivityType>('NOTE');
  const [text, setText] = useState('');
  
  // Data Fetching
  const { data: threads = [], refetch: refetchThreads } = useApiQuery(`threads-${ownerId}`, () => api.listThreads(ownerId));
  
  // Aggregate messages from all threads into a timeline
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  
  // Helper to fetch all messages from all threads (simple implementation)
  const loadAllMessages = async () => {
    if (!threads.length) return;
    const promises = threads.map(t => api.listMessages(t.id));
    const results = await Promise.all(promises);
    const msgs = results.flatMap(r => r.data);
    msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
    setAllMessages(msgs);
  };

  useEffect(() => {
    loadAllMessages();
  }, [threads]);

  // Real-time updates
  useEventStream((event) => {
    if (event.type === 'message') {
      loadAllMessages(); // Refresh on new message
    }
  });
  
  // Call Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // SMS State
  const MAX_SMS_CHARS = 160;

  // --- Handlers ---

  const toggleTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    // 1. Find or create appropriate thread based on type
    let targetThread = threads.find(t => t.subject === activeTab);
    
    if (!targetThread) {
      const res = await api.createThread(ownerId, activeTab); // Create thread named "NOTE", "SMS", etc.
      targetThread = res.data;
      refetchThreads();
    }

    // 2. Prepare Body (add context if Call)
    let body = text;
    if (activeTab === 'CALL') {
      body = `[Duration: ${formatTime(timerSeconds)}] ${text}`;
    }

    // 3. Send
    await api.createMessage(targetThread.id, body);

    setText('');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Optimistic or wait for stream
    loadAllMessages();
  };

  // --- Render Helpers ---

  const getIcon = (type: string) => {
    // Heuristic: Thread subject or message content tags determine icon
    if (type.includes('NOTE')) return StickyNote;
    if (type.includes('SMS')) return MessageSquare;
    if (type.includes('EMAIL')) return Mail;
    if (type.includes('CALL')) return Phone;
    return MoreHorizontal;
  };

  // Determine type from thread subject
  const getTypeFromThread = (threadId: string) => {
    const t = threads.find(th => th.id === threadId);
    return t ? t.subject : 'NOTE';
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      
      {/* 1. Composer Area */}
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          {[
            { id: 'NOTE', label: 'Internal Note', icon: StickyNote },
            { id: 'SMS', label: 'SMS', icon: MessageSquare },
            { id: 'EMAIL', label: 'Email', icon: Mail },
            { id: 'CALL', label: 'Log Call', icon: Phone },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActivityType)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wide transition-all border-b-2",
                activeTab === tab.id 
                  ? "bg-white border-primary-500 text-primary-700 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          
          {/* Header Controls (Context specific) */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50 bg-slate-50/50 rounded-t-lg">
             <div className="flex items-center gap-2 text-xs text-slate-500">
                {activeTab === 'CALL' && (
                   <div className="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      <Clock size={12} className="text-indigo-600"/>
                      <span className="font-mono font-medium text-indigo-900">{formatTime(timerSeconds)}</span>
                      <button 
                        onClick={toggleTimer}
                        className={cn("w-5 h-5 flex items-center justify-center rounded-full transition-colors", isTimerRunning ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200")}
                      >
                        {isTimerRunning ? <Pause size={10}/> : <Play size={10} className="ml-0.5"/>}
                      </button>
                   </div>
                )}
                {activeTab === 'SMS' && (
                   <Select className="h-7 text-xs w-40 bg-white border-slate-200">
                      <option>Select Template...</option>
                      <option>Appointment Reminder</option>
                      <option>Ready for Pickup</option>
                      <option>Vaccine Request</option>
                   </Select>
                )}
                {activeTab === 'EMAIL' && (
                   <Input placeholder="Subject: " className="h-7 text-xs w-64 border-none bg-transparent focus:ring-0 px-0 font-bold" />
                )}
             </div>
             
             {activeTab === 'SMS' && (
               <div className={cn("text-[10px] font-medium", text.length > MAX_SMS_CHARS ? "text-red-500" : "text-slate-400")}>
                 {text.length} / {MAX_SMS_CHARS}
               </div>
             )}
          </div>

          <Textarea 
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              activeTab === 'NOTE' ? "Add an internal note..." :
              activeTab === 'SMS' ? "Type a message..." :
              activeTab === 'EMAIL' ? "Write your email..." : "Log call details..."
            }
            className="border-none focus:ring-0 min-h-[100px] resize-none text-sm p-3"
          />
          
          <div className="flex justify-between items-center px-3 py-2 border-t border-slate-100">
             <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><Paperclip size={16}/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><Mic size={16}/></Button>
             </div>
             <Button onClick={handlePost} size="sm" className="gap-2 h-8 px-4 bg-slate-900 text-white hover:bg-slate-800">
               {activeTab === 'NOTE' || activeTab === 'CALL' ? 'Post Activity' : 'Send'} <Send size={12}/>
             </Button>
          </div>
        </div>
      </div>

      {/* 2. Timeline Feed */}
      <div className="flex-1 overflow-y-auto p-6 bg-white relative">
         <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100 z-0"></div>
         
         <div className="space-y-8 relative z-10">
            {allMessages.length > 0 ? allMessages.map((msg) => {
               const type = getTypeFromThread(msg.threadId);
               const Icon = getIcon(type);
               const isSystem = type === 'SYSTEM';
               
               return (
                  <div key={msg.id} className="group relative pl-12">
                     {/* Timeline Node */}
                     <div className={cn(
                        "absolute left-[1.65rem] top-0 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-white",
                        type === 'SYSTEM' ? "bg-red-500" :
                        type === 'CALL' ? "bg-indigo-500" :
                        type === 'SMS' ? "bg-green-500" :
                        type === 'EMAIL' ? "bg-blue-500" : "bg-amber-400"
                     )}>
                        <Icon size={14} />
                     </div>

                     {/* Content Card */}
                     <div className={cn(
                        "rounded-lg border p-4 transition-all hover:shadow-md",
                        "border-slate-100 bg-white"
                     )}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">
                                 {isSystem ? 'System Alert' : msg.authorName}
                              </span>
                              {msg.direction && (
                                 <Badge variant="outline" className="text-[10px] py-0 h-5 px-1.5 bg-white text-slate-500">
                                    <ArrowRight size={8} className="mr-1"/> {msg.direction}
                                 </Badge>
                              )}
                           </div>
                           <span className="text-xs text-slate-400">
                             {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </span>
                        </div>

                        {/* Body */}
                        <div className={cn("text-sm leading-relaxed", isSystem ? "text-red-800 font-medium" : "text-slate-600")}>
                           {msg.body}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-slate-400 hover:text-amber-600">
                              <Pin size={12}/> Pin
                           </Button>
                           {!isSystem && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-slate-400 hover:text-blue-600" onClick={() => { setActiveTab(type as any); setText(`Replying to: "${msg.body.substring(0, 20)}..."\n`); }}>
                                 <Reply size={12}/> Reply
                              </Button>
                           )}
                        </div>
                     </div>
                  </div>
               );
            }) : (
              <div className="text-center text-slate-400 py-10">
                 No history yet. Start by adding a note.
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
