
import React, { useState, createContext, useContext, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, Send, Paperclip, X, Search, 
  Filter, MoreHorizontal, Check, Clock, User, ChevronRight 
} from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, Badge, cn, Tabs } from './Common';
import { MOCK_OWNERS, MOCK_EMAIL_TEMPLATES, MOCK_MESSAGES } from '../constants';
import { Message } from '../types';

// --- Context & Types ---

export interface ComposeOptions {
  recipientId?: string;
  recipientName?: string;
  type?: 'Email' | 'SMS';
  context?: string; // e.g., "Reservation #123"
}

interface CommunicationContextType {
  openCompose: (options?: ComposeOptions) => void;
  closeCompose: () => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

// --- Communication Modal (The Popup) ---

const CommunicationModal = ({ isOpen, onClose, initialData }: { isOpen: boolean, onClose: () => void, initialData?: ComposeOptions }) => {
  const [activeTab, setActiveTab] = useState<'Email' | 'SMS'>(initialData?.type || 'Email');
  const [recipient, setRecipient] = useState(initialData?.recipientName || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('');

  // Reset state when opening new
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialData?.type || 'Email');
      setRecipient(initialData?.recipientName || '');
      setSubject('');
      setBody('');
      setTemplate('');
    }
  }, [isOpen, initialData]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value;
    setTemplate(tmplId);
    const selected = MOCK_EMAIL_TEMPLATES.find(t => t.id === tmplId);
    if (selected) {
      setSubject(selected.subject);
      setBody(selected.body);
    }
  };

  const insertVariable = (variable: string) => {
    setBody(prev => prev + ` {${variable}} `);
  };

  const handleSend = () => {
    // In a real app, API call here
    alert(`Sent ${activeTab} to ${recipient}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Message" size="lg">
      <div className="flex flex-col h-[500px]">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4 -mx-6 px-6">
          <button 
            className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'Email' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700")}
            onClick={() => setActiveTab('Email')}
          >
            <Mail size={16}/> Email
          </button>
          <button 
            className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'SMS' ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700")}
            onClick={() => setActiveTab('SMS')}
          >
            <MessageSquare size={16}/> SMS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Recipient */}
          <div className="flex gap-4">
             <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">To</label>
                <div className="relative">
                   <Input 
                      value={recipient} 
                      onChange={(e) => setRecipient(e.target.value)} 
                      placeholder="Search Client..." 
                      className="pl-8"
                   />
                   <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                </div>
             </div>
             {activeTab === 'Email' && (
                <div className="w-1/3">
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">From</label>
                   <Select>
                      <option>General Info</option>
                      <option>Billing</option>
                      <option>Staff</option>
                   </Select>
                </div>
             )}
          </div>

          {/* Template Selector */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
             <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Load Template:</span>
             <Select className="h-8 text-sm bg-white" value={template} onChange={handleTemplateChange}>
                <option value="">-- Select --</option>
                {MOCK_EMAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </Select>
          </div>

          {/* Email Subject */}
          {activeTab === 'Email' && (
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line..."/>
             </div>
          )}

          {/* Body */}
          <div className="flex-1 flex flex-col">
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex justify-between">
                <span>Message Body</span>
                <span className={cn("text-[10px]", body.length > 160 && activeTab === 'SMS' ? "text-red-500" : "text-slate-400")}>
                   {body.length} chars {activeTab === 'SMS' && '(160 limit suggested)'}
                </span>
             </label>
             <Textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                className="flex-1 font-mono text-sm resize-none" 
                placeholder={activeTab === 'Email' ? "Type your email here..." : "Type your text message..."}
             />
             
             {/* Variable Injectors */}
             <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {['owner_name', 'pet_name', 'check_in', 'check_out', 'company_name'].map(v => (
                   <button 
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 font-mono border border-slate-200 whitespace-nowrap transition-colors"
                   >
                      {`{${v}}`}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-2">
           <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 gap-2">
              <Paperclip size={16}/> Attach File
           </Button>
           <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSend} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                 <Send size={16}/> Send {activeTab}
              </Button>
           </div>
        </div>
      </div>
    </Modal>
  );
};

// --- Provider Component ---

export const CommunicationProvider = ({ children }: { children?: React.ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ComposeOptions | undefined>(undefined);

  const openCompose = (options?: ComposeOptions) => {
    setModalData(options);
    setModalOpen(true);
  };

  const closeCompose = () => {
    setModalOpen(false);
    setModalData(undefined);
  };

  return (
    <CommunicationContext.Provider value={{ openCompose, closeCompose }}>
      {children}
      <CommunicationModal isOpen={modalOpen} onClose={closeCompose} initialData={modalData} />
    </CommunicationContext.Provider>
  );
};

// --- Full Messages Page (Inbox) ---

export const MessagesPage = () => {
  const { openCompose } = useCommunication();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>('o1'); // Default select first
  const [filter, setFilter] = useState('All');

  // Derive conversation list from messages
  // In a real app, this would be a distinct API endpoint
  const conversations = MOCK_OWNERS.map(owner => {
     const msgs = MOCK_MESSAGES.filter(m => m.ownerId === owner.id);
     const lastMsg = msgs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
     return {
        owner,
        lastMessage: lastMsg,
        count: msgs.length
     };
  }).filter(c => c.count > 0 || c.owner.id === 'o1'); // Show active or mocked

  const currentMessages = MOCK_MESSAGES.filter(m => m.ownerId === selectedOwnerId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const selectedOwner = MOCK_OWNERS.find(o => o.id === selectedOwnerId);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
       {/* Sidebar List */}
       <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
             <h2 className="font-bold text-lg text-slate-900 mb-4">Messages</h2>
             <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <Input placeholder="Search name or message..." className="pl-9 bg-slate-50"/>
             </div>
             <div className="flex gap-2">
                <select className="flex-1 text-xs border-slate-200 rounded-md py-1.5 px-2 bg-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
                   <option>All Messages</option>
                   <option>Unread</option>
                   <option>SMS Only</option>
                   <option>Email Only</option>
                </select>
                <Button size="icon" className="h-8 w-8" onClick={() => openCompose()}><Send size={14}/></Button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {conversations.map(conv => (
                <div 
                   key={conv.owner.id} 
                   onClick={() => setSelectedOwnerId(conv.owner.id)}
                   className={cn(
                      "p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group",
                      selectedOwnerId === conv.owner.id ? "bg-white border-l-4 border-l-primary-600 shadow-sm" : "bg-transparent border-l-4 border-l-transparent"
                   )}
                >
                   <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm">{conv.owner.name}</span>
                      {conv.lastMessage && <span className="text-[10px] text-slate-400">{new Date(conv.lastMessage.timestamp).toLocaleDateString()}</span>}
                   </div>
                   <div className="text-xs text-slate-500 line-clamp-2">
                      {conv.lastMessage ? (
                         <span className={cn(conv.lastMessage.status === 'Read' ? "text-slate-500" : "font-bold text-slate-800")}>
                            {conv.lastMessage.direction === 'Outbound' && <span className="italic text-slate-400">You: </span>}
                            {conv.lastMessage.body}
                         </span>
                      ) : <span className="italic">No messages yet</span>}
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 flex flex-col bg-white">
          {selectedOwner ? (
             <>
                {/* Header */}
                <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-slate-50/50">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                         {selectedOwner.name.charAt(0)}
                      </div>
                      <div>
                         <div className="font-bold text-slate-900">{selectedOwner.name}</div>
                         <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{selectedOwner.phone}</span>
                            <span>•</span>
                            <span>{selectedOwner.email}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openCompose({ recipientId: selectedOwner.id, recipientName: selectedOwner.name, type: 'SMS' })}>SMS</Button>
                      <Button variant="outline" size="sm" onClick={() => openCompose({ recipientId: selectedOwner.id, recipientName: selectedOwner.name, type: 'Email' })}>Email</Button>
                      <Button variant="ghost" size="icon"><MoreHorizontal size={18}/></Button>
                   </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                   {currentMessages.length === 0 ? (
                      <div className="text-center text-slate-400 mt-20">
                         <MessageSquare size={48} className="mx-auto mb-4 opacity-20"/>
                         <p>No messages in this thread.</p>
                         <Button variant="ghost" className="mt-2 text-primary-600" onClick={() => openCompose({ recipientId: selectedOwner.id, recipientName: selectedOwner.name })}>Start Conversation</Button>
                      </div>
                   ) : (
                      currentMessages.map(msg => (
                         <div key={msg.id} className={cn("flex flex-col max-w-2xl", msg.direction === 'Outbound' ? "ml-auto items-end" : "mr-auto items-start")}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.sender} • {msg.type}</span>
                               <span className="text-[10px] text-slate-300">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={cn(
                               "p-4 rounded-xl text-sm shadow-sm border",
                               msg.direction === 'Outbound' 
                                  ? "bg-primary-600 text-white border-primary-600 rounded-tr-none" 
                                  : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                            )}>
                               {msg.subject && <div className="font-bold mb-1 border-b border-white/20 pb-1">{msg.subject}</div>}
                               <p className="leading-relaxed">{msg.body}</p>
                            </div>
                            {msg.direction === 'Outbound' && (
                               <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  {msg.status === 'Read' ? <span className="text-blue-400 flex items-center gap-0.5"><Check size={10}/> Read</span> : msg.status}
                               </div>
                            )}
                         </div>
                      ))
                   )}
                </div>

                {/* Quick Reply */}
                <div className="p-4 bg-white border-t border-slate-200">
                   <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-400"><Paperclip size={18}/></Button>
                      <Input placeholder="Type a message..." className="flex-1"/>
                      <Button size="icon" className="bg-primary-600 hover:bg-primary-700"><Send size={16}/></Button>
                   </div>
                </div>
             </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare size={48} className="mb-4 opacity-20"/>
                <p>Select a conversation to view details</p>
             </div>
          )}
       </div>
    </div>
  );
};
