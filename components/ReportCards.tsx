import React, { useState } from 'react';
import { Camera, Send, Smile, Frown, Meh, Utensils, CheckCircle, FileText, Plus } from 'lucide-react';
import { Card, Button, Badge, Input, cn, Modal, Label, Select, Textarea } from './Common';
import { MOCK_REPORT_CARDS, MOCK_PETS } from '../constants';
import { ReportCard } from '../types';

export const ReportCards = () => {
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Feed */}
      <div className="w-1/3 flex flex-col gap-4">
         <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-900">Today's Reports</h1>
             <Button size="icon" onClick={() => setIsNewOpen(true)} title="New Report Card"><Plus size={18}/></Button>
         </div>
         <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {MOCK_REPORT_CARDS.map(card => {
               const pet = MOCK_PETS.find(p => p.id === card.petId);
               return (
                  <Card 
                    key={card.id} 
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary-400 transition-all",
                      selectedCard?.id === card.id ? "border-primary-500 ring-1 ring-primary-500" : ""
                    )}
                    onClick={() => setSelectedCard(card)}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <img src={pet?.photoUrl} className="h-10 w-10 rounded-full object-cover" alt="" />
                           <div>
                              <div className="font-bold text-slate-900">{pet?.name}</div>
                              <Badge variant={card.status === 'Sent' ? 'success' : 'warning'}>{card.status}</Badge>
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-2">{card.notes}</p>
                  </Card>
               );
            })}
         </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
         {selectedCard ? (
            <Card className="h-full flex flex-col">
               <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                  <h2 className="font-bold text-lg text-slate-800">Editing Report for {MOCK_PETS.find(p => p.id === selectedCard.petId)?.name}</h2>
                  <Button size="sm" className="gap-2 bg-indigo-600 text-white"><Send size={14}/> Send to Owner</Button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto space-y-8">
                  {/* Mood Section */}
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Mood</label>
                     <div className="flex gap-4">
                        {['Happy', 'Energetic', 'Shy', 'Tired'].map(m => (
                           <button 
                              key={m}
                              className={cn(
                                 "flex-1 py-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                                 selectedCard.mood === m ? "bg-primary-50 border-primary-500 text-primary-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                              )}
                           >
                              <Smile size={24}/>
                              <span className="text-sm font-medium">{m}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Eating Section */}
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Eating</label>
                     <div className="flex gap-4">
                        {['All', 'Some', 'None'].map(e => (
                           <button 
                              key={e}
                              className={cn(
                                 "flex-1 py-3 rounded-md border text-sm font-medium transition-all",
                                 selectedCard.eating === e ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-slate-200 text-slate-600"
                              )}
                           >
                              {e}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Activities</label>
                     <div className="flex flex-wrap gap-2">
                        {['Ball Fetch', 'Group Play', 'Nap', 'Cuddles', 'Walk', 'Pool'].map(act => (
                           <button 
                              key={act}
                              className={cn(
                                 "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                                 selectedCard.activities.includes(act) ? "bg-indigo-100 border-indigo-200 text-indigo-800" : "bg-slate-50 border-slate-200 text-slate-600"
                              )}
                           >
                              {act}
                           </button>
                        ))}
                     </div>
                  </div>

                   {/* Photos */}
                   <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Photos/Video</label>
                     <div className="flex gap-4">
                        <div className="h-32 w-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-primary-400 hover:text-primary-500 transition-colors">
                           <Camera size={24}/>
                           <span className="text-xs mt-2">Add Photo</span>
                        </div>
                        {/* Placeholder for uploaded image */}
                        <div className="h-32 w-32 bg-slate-200 rounded-lg overflow-hidden relative group">
                           <img src="https://picsum.photos/200/200?random=1" className="h-full w-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs cursor-pointer">Remove</div>
                        </div>
                     </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Note to Parent</label>
                     <textarea 
                        className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                        defaultValue={selectedCard.notes}
                     />
                  </div>
               </div>
            </Card>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
               <FileText size={48} className="mb-4 opacity-30" />
               <p>Select a report card to edit</p>
            </div>
         )}
      </div>

      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="New Report Card">
         <div className="space-y-4">
            <div>
               <Label>Select Pet</Label>
               <Select>
                  {MOCK_PETS.map(p => <option key={p.id}>{p.name}</option>)}
               </Select>
            </div>
            <div>
               <Label>Date</Label>
               <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
             <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={() => setIsNewOpen(false)}>Cancel</Button>
               <Button onClick={() => setIsNewOpen(false)}>Create</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};