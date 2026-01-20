

import React, { useState, useEffect } from 'react';
import { 
  Camera, Send, Smile, Frown, Meh, Utensils, CheckCircle, FileText, Plus, 
  Sparkles, Zap, Brain, Video, Music, Dumbbell, Award, Share2, 
  ChevronRight, Filter, CheckSquare, Wand2, Calendar, GripVertical, 
  MoreHorizontal, PlayCircle, Image as ImageIcon, Trash2, MessageCircle
} from 'lucide-react';
import { Card, Button, Badge, Input, cn, Modal, Label, Select, Textarea, Tabs, Switch, BulkActionBar } from './Common';
import { MOCK_REPORT_CARDS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_SERVICE_CONFIGS } from '../constants';
import { ReportCard, ReservationStatus, ServiceType } from '../types';

// --- Configuration & Types ---

const ACTIVITY_TAGS = [
  { id: 'group_play', label: 'Group Play', icon: '🎾', color: 'bg-green-100 text-green-700' },
  { id: 'fetch', label: 'Ball Fetch', icon: '⚾', color: 'bg-blue-100 text-blue-700' },
  { id: 'cuddles', label: 'Cuddle Time', icon: '❤️', color: 'bg-red-100 text-red-700' },
  { id: 'pool', label: 'Pool Party', icon: '💦', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'nap', label: 'Power Nap', icon: '😴', color: 'bg-purple-100 text-purple-700' },
  { id: 'walk', label: 'Nature Walk', icon: '🌲', color: 'bg-emerald-100 text-emerald-700' },
];

const BEHAVIOR_TAGS = [
  { id: 'sit', label: 'Sit', category: 'Training' },
  { id: 'stay', label: 'Stay', category: 'Training' },
  { id: 'recall', label: 'Recall', category: 'Training' },
  { id: 'leash', label: 'Leash Walking', category: 'Training' },
  { id: 'social', label: 'Good Greeting', category: 'Manners' },
  { id: 'quiet', label: 'Quiet in Kennel', category: 'Manners' },
];

const MOODS = [
  { id: 'Happy', icon: Smile, color: 'text-green-500' },
  { id: 'Energetic', icon: Zap, color: 'text-yellow-500' },
  { id: 'Chill', icon: Meh, color: 'text-blue-500' },
  { id: 'Shy', icon: Frown, color: 'text-purple-500' },
  { id: 'Affectionate', icon: '<3', color: 'text-red-500' }, // Using string for simple icon replacement
];

// --- Mock Data Extension ---
// Generate mock Pupdates for all checked-in dogs
const generatePupdates = (): ReportCard[] => {
  return MOCK_RESERVATIONS
    .filter(r => r.status === ReservationStatus.CheckedIn || r.status === ReservationStatus.CheckedOut)
    .map(r => {
      // Find existing or create new
      const existing = MOCK_REPORT_CARDS.find(rc => rc.reservationId === r.id);
      if (existing) return existing;
      
      return {
        id: `rc-${r.id}`,
        reservationId: r.id,
        petId: r.petId,
        date: new Date().toISOString().split('T')[0],
        status: 'To Do',
        mood: [],
        activities: [],
        behaviorsWorkedOn: [],
        eating: 'All',
        potty: ['Pee', 'Poop'],
        notes: '',
        staffId: 's1',
        media: [],
        servicesCompleted: r.services // Link services from reservation
      };
    });
};

const ALL_PUPDATES = generatePupdates();

// --- Components ---

export const ReportCards = () => {
  const [pupdates, setPupdates] = useState<ReportCard[]>(ALL_PUPDATES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'To Do' | 'Draft' | 'Sent'>('To Do');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPupdate = pupdates.find(p => p.id === selectedId);
  const filteredList = pupdates.filter(p => {
    const pet = MOCK_PETS.find(pet => pet.id === p.petId);
    const matchesSearch = pet?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdate = (id: string, updates: Partial<ReportCard>) => {
    setPupdates(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleBulkUpdate = (updates: Partial<ReportCard>) => {
    setPupdates(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, ...updates, status: 'Draft' } : p));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* 1. Left Sidebar: Queue */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
            <FileText className="text-primary-600"/> Pupdates
          </h1>
          
          <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
            {['To Do', 'Draft', 'Sent'].map(s => (
              <button
                key={s}
                onClick={() => { setFilter(s as any); setSelectedId(null); setSelectedIds([]); }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {s} ({pupdates.filter(p => p.status === s).length})
              </button>
            ))}
          </div>

          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input 
              placeholder="Search pets..." 
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredList.map(card => {
            const pet = MOCK_PETS.find(p => p.id === card.petId);
            return (
              <div 
                key={card.id} 
                onClick={(e) => {
                   if((e.target as HTMLElement).tagName !== 'INPUT') setSelectedId(card.id);
                }}
                className={cn(
                  "p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-all group relative",
                  selectedId === card.id ? "bg-white border-l-4 border-l-primary-500 shadow-sm z-10" : "bg-transparent border-l-4 border-l-transparent",
                  selectedIds.includes(card.id) ? "bg-blue-50/50" : ""
                )}
              >
                <div className="flex items-start gap-3">
                   <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 cursor-pointer"
                        checked={selectedIds.includes(card.id)}
                        onChange={() => toggleSelect(card.id)}
                      />
                   </div>
                   <img src={pet?.photoUrl} className="h-10 w-10 rounded-full object-cover bg-slate-200 shrink-0" alt="" />
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                         <div className="font-bold text-slate-900 truncate">{pet?.name}</div>
                         <span className="text-[10px] text-slate-400 whitespace-nowrap">{card.media.length} 📷</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{pet?.breed}</div>
                      {/* Status Indicators */}
                      <div className="flex gap-1 mt-1.5">
                         {card.mood.length > 0 && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-yellow-50 text-yellow-700 border-yellow-200">Mood</Badge>}
                         {card.notes && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-green-50 text-green-700 border-green-200">Text</Badge>}
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Editor Area (Conditional Render: Bulk vs Single) */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
         {selectedIds.length > 0 ? (
            <BulkEditor 
               count={selectedIds.length} 
               onCancel={() => setSelectedIds([])}
               onSave={handleBulkUpdate}
            />
         ) : selectedPupdate ? (
            <PupdateEditor 
               pupdate={selectedPupdate} 
               onChange={(updates) => handleUpdate(selectedPupdate.id, updates)}
            />
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <FileText size={40} className="opacity-20 text-slate-900" />
               </div>
               <h3 className="text-lg font-medium text-slate-700">Select a Pet to Pupdate</h3>
               <p className="text-sm">Choose a dog from the list or select multiple for bulk actions.</p>
            </div>
         )}
      </div>
    </div>
  );
};

// --- Single Editor Component ---

const PupdateEditor = ({ pupdate, onChange }: { pupdate: ReportCard, onChange: (u: Partial<ReportCard>) => void }) => {
  const pet = MOCK_PETS.find(p => p.id === pupdate.petId);
  const reservation = MOCK_RESERVATIONS.find(r => r.id === pupdate.reservationId);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock AI Generation
  const generateNarrative = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const activities = pupdate.activities.join(', ');
      const moods = pupdate.mood.join(', ');
      const services = pupdate.servicesCompleted?.join(' and ') || '';
      
      const prompt = `Write a cute update from ${pet?.name}'s perspective. They did ${activities}, felt ${moods}, and had ${services}.`;
      
      // Simulating AI response based on inputs
      const intros = ["Guess what!", "Best day ever!", "Hi family!", "Tail wags!"];
      const activityText = pupdate.activities.includes('Pool Party') ? "I made a huge splash in the pool!" : "I ran so fast with my friends.";
      const serviceText = services ? `I also got some pampering with ${services}.` : "";
      const outro = "Can't wait to tell you more. Love, " + pet?.name;
      
      const narrative = `${intros[Math.floor(Math.random()*intros.length)]} Today was amazing. ${activityText} ${serviceText} I was feeling super ${moods.toLowerCase()} today. ${outro}`;
      
      onChange({ notes: narrative });
      setIsGenerating(false);
    }, 1500);
  };

  if (!pet) return null;

  return (
    <div className="flex flex-col h-full">
       {/* Header */}
       <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200">
                <img src={pet.photoUrl} className="w-full h-full object-cover" alt=""/>
             </div>
             <div>
                <h2 className="font-bold text-slate-900 text-lg leading-none">{pet.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                   <span>{pet.breed}</span>
                   <span>•</span>
                   <span>{reservation?.type}</span>
                   {pet.activeProgram && <Badge variant="info" className="py-0 text-[10px] h-4">{pet.activeProgram}</Badge>}
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
             <Select 
               value={pupdate.status} 
               onChange={(e) => onChange({ status: e.target.value as any })}
               className="h-8 text-xs font-medium w-32"
             >
                <option>To Do</option>
                <option>Draft</option>
                <option>Sent</option>
             </Select>
             <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 h-9"><Send size={14}/> Send Pupdate</Button>
          </div>
       </div>

       {/* Scrollable Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Media Section */}
          <section>
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                   <Camera size={16} className="text-primary-500"/> Capture the Moment
                </h3>
                <span className="text-xs text-slate-400">Drag & drop photos/videos</span>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {pupdate.media.map((m) => (
                   <div key={m.id} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm">
                      <img src={m.url} className="w-full h-full object-cover" alt=""/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button className="text-white hover:text-red-400"><Trash2 size={18}/></button>
                      </div>
                      {m.type === 'video' && <div className="absolute bottom-2 left-2 text-white"><PlayCircle size={16}/></div>}
                   </div>
                ))}
                {/* Upload Placeholder */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all">
                   <Plus size={24} className="mb-1"/>
                   <span className="text-xs font-medium">Add Media</span>
                </div>
             </div>
          </section>

          {/* 2. Activities & Behaviors */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="p-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                   <Dumbbell size={16} className="text-orange-500"/> Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                   {ACTIVITY_TAGS.map(tag => {
                      const isActive = pupdate.activities.includes(tag.label);
                      return (
                         <button 
                           key={tag.id}
                           onClick={() => {
                              const newActs = isActive ? pupdate.activities.filter(a => a !== tag.label) : [...pupdate.activities, tag.label];
                              onChange({ activities: newActs });
                           }}
                           className={cn(
                              "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5",
                              isActive ? tag.color + " border-transparent shadow-sm ring-1 ring-black/5" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                           )}
                         >
                            <span>{tag.icon}</span> {tag.label}
                         </button>
                      );
                   })}
                </div>
             </Card>

             <Card className="p-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                   <Brain size={16} className="text-purple-500"/> Training & Behavior
                </h3>
                <div className="flex flex-wrap gap-2">
                   {BEHAVIOR_TAGS.map(tag => {
                      const isActive = pupdate.behaviorsWorkedOn?.includes(tag.label);
                      return (
                         <button 
                           key={tag.id}
                           onClick={() => {
                              const newBehav = isActive ? (pupdate.behaviorsWorkedOn || []).filter(b => b !== tag.label) : [...(pupdate.behaviorsWorkedOn || []), tag.label];
                              onChange({ behaviorsWorkedOn: newBehav });
                           }}
                           className={cn(
                              "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                              isActive ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                           )}
                         >
                            {tag.label}
                         </button>
                      );
                   })}
                </div>
                {/* Recommendation from Plan */}
                {pet.activeProgram && (
                   <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Plan Recommendation: {pet.activeProgram}</div>
                      <div className="flex gap-2">
                         <Badge variant="outline" className="border-dashed border-indigo-300 text-indigo-600 bg-indigo-50 cursor-pointer">+ Add "Leash Manners"</Badge>
                         <Badge variant="outline" className="border-dashed border-indigo-300 text-indigo-600 bg-indigo-50 cursor-pointer">+ Add "Sit Stay"</Badge>
                      </div>
                   </div>
                )}
             </Card>
          </section>

          {/* 3. Mood & Health */}
          <section className="bg-white p-4 rounded-lg border border-slate-200">
             <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Today's Mood</h3>
                   <div className="flex gap-2">
                      {MOODS.map(m => {
                         const isActive = pupdate.mood.includes(m.id);
                         const Icon = m.icon === '<3' ? () => <span>❤️</span> : m.icon;
                         return (
                            <button 
                               key={m.id}
                               onClick={() => {
                                  const newMood = isActive ? pupdate.mood.filter(mo => mo !== m.id) : [...pupdate.mood, m.id];
                                  onChange({ mood: newMood });
                               }}
                               className={cn(
                                  "flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all",
                                  isActive ? `bg-slate-800 text-white border-slate-800` : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                               )}
                            >
                               <Icon size={20} className={cn(isActive ? "text-white" : m.color)} />
                               <span className="text-[10px] font-bold">{m.id}</span>
                            </button>
                         );
                      })}
                   </div>
                </div>
                <div className="w-px bg-slate-100 hidden md:block"></div>
                <div className="w-64 space-y-4">
                   <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                         <span>Appetite</span>
                         <span className="text-slate-800">{pupdate.eating}</span>
                      </div>
                      <div className="flex bg-slate-100 rounded p-1">
                         {['None', 'Some', 'Most', 'All'].map(lvl => (
                            <button 
                              key={lvl} 
                              onClick={() => onChange({ eating: lvl as any })}
                              className={cn("flex-1 text-[10px] font-bold py-1 rounded transition-colors", pupdate.eating === lvl ? "bg-white shadow text-green-600" : "text-slate-400 hover:text-slate-600")}
                            >
                               {lvl}
                            </button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                         <span>Potty</span>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => onChange({ potty: pupdate.potty.includes('Pee') ? pupdate.potty.filter(p=>p!=='Pee') : [...pupdate.potty, 'Pee'] })}
                           className={cn("flex-1 py-1.5 text-xs font-bold border rounded", pupdate.potty.includes('Pee') ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "bg-white border-slate-200 text-slate-400")}
                         >
                            Pee
                         </button>
                         <button 
                           onClick={() => onChange({ potty: pupdate.potty.includes('Poop') ? pupdate.potty.filter(p=>p!=='Poop') : [...pupdate.potty, 'Poop'] })}
                           className={cn("flex-1 py-1.5 text-xs font-bold border rounded", pupdate.potty.includes('Poop') ? "bg-amber-50 border-amber-400 text-amber-800" : "bg-white border-slate-200 text-slate-400")}
                         >
                            Poop
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 4. Context & Narrative */}
          <section>
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                   <MessageCircle size={16} className="text-indigo-500"/> Pupdate Narrative
                </h3>
                {/* Service Chips */}
                {pupdate.servicesCompleted && pupdate.servicesCompleted.length > 0 && (
                   <div className="flex gap-2">
                      {pupdate.servicesCompleted.map(svc => (
                         <Badge key={svc} variant="info" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                            <CheckCircle size={10}/> {svc} Completed
                         </Badge>
                      ))}
                   </div>
                )}
             </div>
             
             <div className="relative">
                <Textarea 
                   value={pupdate.notes}
                   onChange={(e) => onChange({ notes: e.target.value })}
                   placeholder="Write a message from the dog..." 
                   className="min-h-[140px] pr-32 leading-relaxed text-slate-700"
                />
                
                {/* AI Generator Button Overlay */}
                <div className="absolute bottom-3 right-3">
                   <Button 
                     onClick={generateNarrative}
                     disabled={isGenerating}
                     className={cn("gap-2 shadow-lg transition-all", isGenerating ? "w-32" : "w-auto")}
                     variant="secondary" // Use secondary to stand out against white bg
                     style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none' }}
                   >
                      {isGenerating ? (
                         <>Generating...</>
                      ) : (
                         <><Wand2 size={16}/> Magic Write</>
                      )}
                   </Button>
                </div>
             </div>
             <p className="text-xs text-slate-400 mt-2 text-right">
                AI uses selected activities, mood, and completed services to draft the message.
             </p>
          </section>
       </div>
    </div>
  );
};

// --- Bulk Editor Component ---

const BulkEditor = ({ count, onCancel, onSave }: { count: number, onCancel: () => void, onSave: (updates: Partial<ReportCard>) => void }) => {
   const [activities, setActivities] = useState<string[]>([]);
   const [mood, setMood] = useState<string[]>([]);
   
   return (
      <div className="flex flex-col h-full bg-slate-50">
         <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8">
            <div className="text-center">
               <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 text-primary-600">
                  <CheckSquare size={32}/>
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Bulk Edit {count} Pupdates</h2>
               <p className="text-slate-500 mt-2">Apply shared activities and generate unique narratives for each.</p>
            </div>

            <Card className="w-full max-w-2xl p-6">
               <div className="space-y-6">
                  <div>
                     <Label className="mb-3 block">What did the group do?</Label>
                     <div className="flex flex-wrap gap-2">
                        {ACTIVITY_TAGS.map(tag => (
                           <button 
                              key={tag.id}
                              onClick={() => {
                                 const isActive = activities.includes(tag.label);
                                 setActivities(prev => isActive ? prev.filter(a => a !== tag.label) : [...prev, tag.label]);
                              }}
                              className={cn(
                                 "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                                 activities.includes(tag.label) ? tag.color + " border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-600"
                              )}
                           >
                              {tag.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <Label className="mb-3 block">Overall Mood</Label>
                     <div className="flex gap-4">
                        {MOODS.slice(0, 3).map(m => ( // Show first 3 for bulk
                           <button 
                              key={m.id}
                              onClick={() => {
                                 const isActive = mood.includes(m.id);
                                 setMood(prev => isActive ? prev.filter(mo => mo !== m.id) : [...prev, m.id]);
                              }}
                              className={cn(
                                 "flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all",
                                 mood.includes(m.id) ? `bg-slate-800 text-white border-slate-800` : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              )}
                           >
                              <m.icon size={20} className={cn(mood.includes(m.id) ? "text-white" : m.color)} />
                              <span className="text-xs font-bold">{m.id}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center px-8 shrink-0">
            <span className="text-sm text-slate-500">{count} dogs selected</span>
            <div className="flex gap-3">
               <Button variant="ghost" onClick={onCancel}>Cancel</Button>
               <Button 
                  onClick={() => onSave({ activities, mood })} 
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg"
               >
                  <Wand2 size={16}/> Apply & Auto-Generate
               </Button>
            </div>
         </div>
      </div>
   );
};
