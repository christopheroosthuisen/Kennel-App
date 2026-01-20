
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InternalChannel, InternalMessage, InternalMessageContext } from '../types';
import { MOCK_CHANNELS, MOCK_INTERNAL_MESSAGES } from '../constants';
import { Modal, Label, Select, Textarea, Button } from './Common';
import { Hash, Lock, Send, Link as LinkIcon } from 'lucide-react';

interface TeamChatContextType {
  channels: InternalChannel[];
  messages: InternalMessage[];
  sendMessage: (channelId: string, content: string, context?: InternalMessageContext) => void;
  openDiscuss: (context: InternalMessageContext) => void;
  markChannelRead: (channelId: string) => void;
}

const TeamChatContext = createContext<TeamChatContextType | undefined>(undefined);

export const useTeamChat = () => {
  const context = useContext(TeamChatContext);
  if (!context) {
    throw new Error('useTeamChat must be used within a TeamChatProvider');
  }
  return context;
};

// --- Mock Current User ---
const CURRENT_USER_ID = 'u1'; 

export const TeamChatProvider = ({ children }: { children?: ReactNode }) => {
  const [channels, setChannels] = useState<InternalChannel[]>(MOCK_CHANNELS);
  const [messages, setMessages] = useState<InternalMessage[]>(MOCK_INTERNAL_MESSAGES);
  
  // Modal State
  const [isDiscussOpen, setIsDiscussOpen] = useState(false);
  const [discussContext, setDiscussContext] = useState<InternalMessageContext | null>(null);
  
  // Safe initialization: Check if channels exist before accessing [0].id to prevent crash
  const [discussChannel, setDiscussChannel] = useState(MOCK_CHANNELS?.[0]?.id || '');
  const [discussMessage, setDiscussMessage] = useState('');

  const sendMessage = (channelId: string, content: string, context?: InternalMessageContext) => {
    const newMessage: InternalMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: CURRENT_USER_ID,
      content,
      timestamp: new Date().toISOString(),
      reactions: {},
      context
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Move channel to top or increment unread (mock logic)
    setChannels(prev => prev.map(c => {
       if (c.id === channelId) {
          return { ...c, unreadCount: c.id !== 'c1' ? c.unreadCount + 1 : 0 }; // Assume we are reading general
       }
       return c;
    }));
  };

  const markChannelRead = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c));
  };

  const openDiscuss = (context: InternalMessageContext) => {
    setDiscussContext(context);
    setDiscussMessage(`Regarding ${context.type}: ${context.title}...`);
    // Ensure we have a valid channel selected if state was empty
    if (!discussChannel && channels.length > 0) {
      setDiscussChannel(channels[0].id);
    }
    setIsDiscussOpen(true);
  };

  const handleDiscussSubmit = () => {
    if (discussContext && discussChannel) {
      sendMessage(discussChannel, discussMessage, discussContext);
      setIsDiscussOpen(false);
      setDiscussMessage('');
      setDiscussContext(null);
    }
  };

  return (
    <TeamChatContext.Provider value={{ channels, messages, sendMessage, openDiscuss, markChannelRead }}>
      {children}
      
      {/* Discussion Modal */}
      <Modal isOpen={isDiscussOpen} onClose={() => setIsDiscussOpen(false)} title="Discuss with Team" size="md">
         <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-3">
               <div className="bg-white p-2 rounded border border-indigo-100 shrink-0 text-indigo-600">
                  <LinkIcon size={16}/>
               </div>
               <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-indigo-900 truncate">{discussContext?.title}</h4>
                  <p className="text-xs text-indigo-700 truncate">{discussContext?.subtitle}</p>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 mt-1 block">{discussContext?.type}</span>
               </div>
            </div>

            <div>
               <Label>Select Channel</Label>
               <Select value={discussChannel} onChange={(e) => setDiscussChannel(e.target.value)}>
                  {channels.map(c => (
                     <option key={c.id} value={c.id}>
                        {c.type === 'dm' ? '@' : '#'}{c.name}
                     </option>
                  ))}
               </Select>
            </div>

            <div>
               <Label>Message</Label>
               <Textarea 
                  value={discussMessage} 
                  onChange={(e) => setDiscussMessage(e.target.value)} 
                  className="h-32"
                  placeholder="What would you like to discuss?"
               />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setIsDiscussOpen(false)}>Cancel</Button>
               <Button onClick={handleDiscussSubmit} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Send size={14}/> Post to Chat
               </Button>
            </div>
         </div>
      </Modal>
    </TeamChatContext.Provider>
  );
};
