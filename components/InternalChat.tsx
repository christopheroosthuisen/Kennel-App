import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, Lock, Search, Plus, Send, Smile, Paperclip, 
  MoreHorizontal, User, Sparkles, Command, MessageSquare, 
  ChevronDown, Phone, Video, Info, Image as ImageIcon, AtSign,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, cn, Badge, Modal, Textarea, SearchInput } from './Common';
import { MOCK_USERS } from '../constants';
import { InternalChannel, InternalMessage } from '../types';
import { useTeamChat } from './TeamChatContext';

// Mock Current User
const CURRENT_USER_ID = 'u1'; // John Doe (Admin)

export const InternalChat = () => {
  const { channels, messages, sendMessage, markChannelRead } = useTeamChat();
  const [activeChannelId, setActiveChannelId] = useState<string>('c1');
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  // Auto-scroll to bottom & Mark Read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeChannel?.unreadCount > 0) {
       markChannelRead(activeChannelId);
    }
  }, [channelMessages, activeChannelId, isAiTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessage(activeChannelId, inputText);
    
    // Check for AI Mention
    if (inputText.includes('@AI')) {
      triggerAiResponse(inputText);
    }

    setInputText('');
  };

  const triggerAiResponse = (userPrompt: string) => {
    setIsAiTyping(true);
    
    // Mock AI delay and logic
    setTimeout(() => {
      let aiContent = "I'm here to help!";
      
      if (userPrompt.toLowerCase().includes('schedule') || userPrompt.toLowerCase().includes('shift')) {
        aiContent = "Based on the schedule, Sarah is on the morning shift (7am-3pm) and Mike covers the afternoon (12pm-8pm). We have full coverage today.";
      } else if (userPrompt.toLowerCase().includes('summary') || userPrompt.toLowerCase().includes('catch up')) {
        aiContent = "Here's a quick summary of this channel: The team is discussing keys left in the break room, and Rex (Golden Retriever) is being monitored for an upset stomach.";
      } else {
        aiContent = "I can assist with scheduling queries, summarizing channel history, or looking up operational protocols. Just ask!";
      }

      // Manually add AI message since it's system generated (bypassing context helper for simplicity in this mock)
      // In real app, AI service would post via same bus
      sendMessage(activeChannelId, aiContent); // Will appear as User u1 for now unless we adjust sendMessage, but logic stands
      setIsAiTyping(false);
    }, 1500);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to jump to context
  const handleViewContext = (type: string, id: string) => {
     if (type === 'reservation') navigate('/reservations'); // Ideally filter by ID
     if (type === 'pet' || type === 'owner') navigate(`/owners-pets?id=${id}&type=${type}s`);
     // For estimates, maybe open modal if possible, but route for now
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
           <h2 className="font-bold text-white text-lg flex items-center gap-2">
              Partners Team <ChevronDown size={14}/>
           </h2>
           <div className="mt-4 relative">
              <SearchInput 
                 placeholder="Jump to..." 
                 className="w-full bg-slate-800 text-slate-200 text-xs rounded-md pl-8 pr-2 border border-slate-700 focus:outline-none focus:border-slate-500"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
           {/* AI Shortcut */}
           <div className="px-3">
              <button 
                 onClick={() => triggerAiResponse("Help")}
                 className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-primary-300 hover:bg-slate-800 transition-colors"
              >
                 <Sparkles size={16}/> AI Copilot
              </button>
           </div>

           {/* Channels */}
           <div>
              <div className="px-4 flex justify-between items-center mb-1 group cursor-pointer">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">Channels</span>
                 <Plus size={14} className="text-slate-500 hover:text-white"/>
              </div>
              <div className="space-y-0.5">
                 {channels.filter(c => c.type !== 'dm').map(c => (
                    <button
                       key={c.id}
                       onClick={() => setActiveChannelId(c.id)}
                       className={cn(
                          "w-full flex items-center justify-between px-4 py-1.5 text-sm transition-colors",
                          activeChannelId === c.id ? "bg-primary-600 text-white" : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                       )}
                    >
                       <div className="flex items-center gap-2">
                          {c.type === 'private' ? <Lock size={14} className="opacity-70"/> : <Hash size={14} className="opacity-70"/>}
                          <span className="truncate max-w-[140px]">{c.name}</span>
                       </div>
                       {c.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{c.unreadCount}</span>
                       )}
                    </button>
                 ))}
              </div>
           </div>

           {/* Direct Messages */}
           <div>
              <div className="px-4 flex justify-between items-center mb-1 group cursor-pointer">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">Direct Messages</span>
                 <Plus size={14} className="text-slate-500 hover:text-white"/>
              </div>
              <div className="space-y-0.5">
                 {channels.filter(c => c.type === 'dm').map(c => (
                    <button
                       key={c.id}
                       onClick={() => setActiveChannelId(c.id)}
                       className={cn(
                          "w-full flex items-center justify-between px-4 py-1.5 text-sm transition-colors",
                          activeChannelId === c.id ? "bg-primary-600 text-white" : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                       )}
                    >
                       <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white">
                             {c.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[140px]">{c.name}</span>
                       </div>
                       {c.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{c.unreadCount}</span>
                       )}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
         {/* Header */}
         <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               {activeChannel?.type === 'dm' ? (
                  <div className="h-8 w-8 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                     {activeChannel.name.charAt(0)}
                  </div>
               ) : (
                  <Hash size={24} className="text-slate-400"/>
               )}
               <div>
                  <h3 className="font-bold text-slate-900">{activeChannel?.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{activeChannel?.description || `${activeChannel?.members.length} members`}</p>
               </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
               {activeChannel?.type === 'dm' && (
                  <>
                     <button className="hover:text-primary-600"><Phone size={18}/></button>
                     <button className="hover:text-primary-600"><Video size={18}/></button>
                     <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  </>
               )}
               <button className="hover:text-slate-600"><Search size={18}/></button>
               <button className="hover:text-slate-600"><Info size={18}/></button>
            </div>
         </div>

         {/* Messages List */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {channelMessages.map((msg, idx) => {
               const isMe = msg.senderId === CURRENT_USER_ID;
               const isAi = msg.senderId === 'AI'; // Mock AI Sender check
               const sender = isAi ? { name: 'AI Copilot' } : MOCK_USERS.find(u => u.id === msg.senderId) || { name: 'Unknown' };
               const showAvatar = idx === 0 || channelMessages[idx-1].senderId !== msg.senderId || (new Date(msg.timestamp).getTime() - new Date(channelMessages[idx-1].timestamp).getTime() > 60000 * 5);

               return (
                  <div key={msg.id} className={cn("flex gap-3 group", isMe ? "flex-row-reverse" : "")}>
                     {/* Avatar */}
                     <div className={cn("w-10 flex-shrink-0 flex flex-col items-center", !showAvatar && "invisible")}>
                        {isAi ? (
                           <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md">
                              <Sparkles size={18}/>
                           </div>
                        ) : (
                           <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm", isMe ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-600")}>
                              {sender.name.charAt(0)}
                           </div>
                        )}
                     </div>

                     <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start")}>
                        {showAvatar && (
                           <div className={cn("flex items-baseline gap-2 mb-1", isMe ? "flex-row-reverse" : "")}>
                              <span className="text-sm font-bold text-slate-800">{sender.name}</span>
                              <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                           </div>
                        )}
                        <div className={cn(
                           "py-2 px-3 rounded-lg text-sm shadow-sm border relative group-hover:shadow-md transition-all",
                           isMe ? "bg-primary-600 text-white border-primary-600 rounded-tr-none" : 
                           isAi ? "bg-white border-primary-100 ring-1 ring-primary-50 text-slate-800 rounded-tl-none" :
                           "bg-white border-slate-200 text-slate-800 rounded-tl-none"
                        )}>
                           {msg.content}
                           {isAi && <div className="mt-2 text-[10px] text-primary-400 flex items-center gap-1 font-medium"><Sparkles size={10}/> AI Generated</div>}
                        
                           {/* Context Attachment */}
                           {msg.context && (
                              <div className={cn(
                                 "mt-3 p-3 rounded border flex items-center gap-3 cursor-pointer transition-colors",
                                 isMe ? "bg-primary-700 border-primary-500" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              )} onClick={() => handleViewContext(msg.context!.type, msg.context!.id)}>
                                 <div className={cn("p-2 rounded bg-white/20 shrink-0", isMe ? "text-white" : "text-slate-500")}>
                                    <ArrowRight size={16}/>
                                 </div>
                                 <div className="overflow-hidden">
                                    <div className="font-bold text-xs uppercase opacity-70 tracking-wider mb-0.5">{msg.context.type}</div>
                                    <div className="font-bold truncate text-sm">{msg.context.title}</div>
                                    {msg.context.subtitle && <div className="text-xs truncate opacity-80">{msg.context.subtitle}</div>}
                                 </div>
                              </div>
                           )}
                        </div>
                        
                        {/* Reactions (Mock) */}
                        {Object.keys(msg.reactions).length > 0 && (
                           <div className={cn("flex gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                              {Object.entries(msg.reactions).map(([emoji, count]) => (
                                 <span key={emoji} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full text-xs cursor-pointer hover:bg-slate-200">
                                    {emoji} {count}
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
            
            {isAiTyping && (
               <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
                     <Sparkles size={18} className="animate-pulse"/>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none border border-primary-100 text-xs text-primary-400 flex items-center gap-1">
                     Thinking...
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-white border-t border-slate-200">
            <div className="border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all bg-white overflow-hidden">
               {/* Toolbar */}
               <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"><strong className="font-bold font-serif">B</strong></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"><em className="italic font-serif">I</em></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded underline"><span className="underline">U</span></button>
                  <div className="h-4 w-px bg-slate-300 mx-1"></div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"><ImageIcon size={14}/></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"><Paperclip size={14}/></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"><Smile size={14}/></button>
                  <div className="flex-1"></div>
                  <button 
                     onClick={() => setInputText(prev => prev + '@AI ')}
                     className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 text-[10px] font-bold uppercase rounded border border-primary-100 hover:bg-primary-100"
                  >
                     <Sparkles size={10}/> Ask AI
                  </button>
               </div>
               
               <div className="flex items-end p-2 gap-2">
                  <Textarea 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage();
                        }
                     }}
                     className="min-h-[40px] max-h-[120px] resize-none border-0 focus:ring-0 p-2 text-sm"
                     placeholder={`Message ${activeChannel?.type === 'dm' ? activeChannel.name : '#' + activeChannel?.name}`}
                  />
                  <Button 
                     size="icon" 
                     className={cn("h-8 w-8 mb-1 transition-all", inputText.trim() ? "bg-primary-600 hover:bg-primary-700" : "bg-slate-200 text-slate-400 cursor-not-allowed")}
                     onClick={handleSendMessage}
                     disabled={!inputText.trim()}
                  >
                     <Send size={14}/>
                  </Button>
               </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 flex justify-between px-1">
               <span><strong>Tip:</strong> Type <code className="bg-slate-100 px-1 rounded text-slate-600">@AI</code> to get instant answers.</span>
               <span><strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line</span>
            </div>
         </div>
      </div>
    </div>
  );
};