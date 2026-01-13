
import React, { useState } from 'react';
import { Camera, Send, Smile, Frown, Meh, Utensils, CheckCircle, FileText, Plus, Mic, Video } from 'lucide-react';
import { Card, Button, Badge, Input, cn, Modal, Label, Select, Textarea } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { uploadFile } from '../utils/files';
import { ReportCard } from '../../shared/domain';
import { AudioRecorder } from '../utils/audio';
import { transcribeAudio, analyzeVideo } from '../services/ai';

export const ReportCards = () => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newCardData, setNewCardData] = useState({ petId: '', date: new Date().toISOString().split('T')[0] });

  const { data: cards = [], refetch } = useApiQuery('report-cards', () => api.listReportCards());
  const { data: pets = [] } = useApiQuery('pets', () => api.getPets());

  const selectedCard = cards.find(c => c.id === selectedCardId);

  const handleCreate = async () => {
    if (!newCardData.petId) return;
    const res = await api.createReportCard(newCardData);
    setIsNewOpen(false);
    setSelectedCardId(res.data.id);
    refetch();
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Feed */}
      <div className="w-1/3 flex flex-col gap-4">
         <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-900">Today's Reports</h1>
             <Button size="icon" onClick={() => setIsNewOpen(true)} title="New Report Card"><Plus size={18}/></Button>
         </div>
         <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {cards.map(card => {
               const pet = pets.find(p => p.id === card.petId);
               return (
                  <Card 
                    key={card.id} 
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary-400 transition-all",
                      selectedCardId === card.id ? "border-primary-500 ring-1 ring-primary-500" : ""
                    )}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                              {pet?.name[0]}
                           </div>
                           <div>
                              <div className="font-bold text-slate-900">{pet?.name}</div>
                              <Badge variant={card.status === 'Sent' ? 'success' : 'warning'}>{card.status}</Badge>
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-2">{card.notes || 'No notes yet...'}</p>
                  </Card>
               );
            })}
         </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
         {selectedCard ? (
            <ReportCardEditor card={selectedCard} onUpdate={refetch} pets={pets} />
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
               <Select value={newCardData.petId} onChange={e => setNewCardData({...newCardData, petId: e.target.value})}>
                  <option value="">Choose Pet...</option>
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </Select>
            </div>
            <div>
               <Label>Date</Label>
               <Input type="date" value={newCardData.date} onChange={e => setNewCardData({...newCardData, date: e.target.value})} />
            </div>
             <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={() => setIsNewOpen(false)}>Cancel</Button>
               <Button onClick={handleCreate}>Create</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

const ReportCardEditor = ({ card, onUpdate, pets }: { card: ReportCard, onUpdate: () => void, pets: any[] }) => {
   const [notes, setNotes] = useState(card.notes);
   const { data: media = [], refetch: refetchMedia } = useApiQuery(`rc-media-${card.id}`, () => api.getReportCardMedia(card.id));
   
   const [isRecording, setIsRecording] = useState(false);
   const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
   const [isProcessingVideo, setIsProcessingVideo] = useState(false);

   const handleSave = async (updates: Partial<ReportCard>) => {
      await api.updateReportCard(card.id, updates);
      onUpdate();
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      
      // Video Analysis Hook
      if (file.type.startsWith('video/')) {
         setIsProcessingVideo(true);
         try {
            const summary = await analyzeVideo(file);
            setNotes(prev => (prev ? prev + '\n\n' : '') + `[Video Analysis]: ${summary}`);
            handleSave({ notes: (notes ? notes + '\n\n' : '') + `[Video Analysis]: ${summary}` });
         } catch(e) { console.error(e); }
         setIsProcessingVideo(false);
      }

      try {
         const uploaded = await uploadFile(file);
         await api.addReportCardMedia(card.id, uploaded.id);
         refetchMedia();
      } catch (e) {
         alert('Upload failed');
      }
   };

   const toggleRecording = async () => {
      if (isRecording) {
         setIsRecording(false);
         if (recorder) {
            const base64 = await recorder.stop();
            const text = await transcribeAudio(base64);
            setNotes(prev => (prev ? prev + ' ' : '') + text);
            handleSave({ notes: (notes ? notes + ' ' : '') + text });
            setRecorder(null);
         }
      } else {
         const newRecorder = new AudioRecorder();
         await newRecorder.start();
         setRecorder(newRecorder);
         setIsRecording(true);
      }
   };

   return (
      <Card className="h-full flex flex-col">
         <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
            <h2 className="font-bold text-lg text-slate-800">Editing Report for {pets.find(p => p.id === card.petId)?.name}</h2>
            <Button size="sm" className="gap-2 bg-indigo-600 text-white" onClick={() => handleSave({ status: 'Sent' })}>
               <Send size={14}/> Send to Owner
            </Button>
         </div>
         
         <div className="p-6 flex-1 overflow-y-auto space-y-8">
            {/* Mood */}
            <div className="space-y-3">
               <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Mood</label>
               <div className="flex gap-4">
                  {['Happy', 'Energetic', 'Shy', 'Tired'].map(m => (
                     <button 
                        key={m}
                        onClick={() => handleSave({ mood: m })}
                        className={cn(
                           "flex-1 py-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                           card.mood === m ? "bg-primary-50 border-primary-500 text-primary-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        )}
                     >
                        <Smile size={24}/>
                        <span className="text-sm font-medium">{m}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Activities */}
            <div className="space-y-3">
               <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Activities</label>
               <div className="flex flex-wrap gap-2">
                  {['Ball Fetch', 'Group Play', 'Nap', 'Cuddles', 'Walk', 'Pool'].map(act => {
                     const active = card.activities.includes(act);
                     return (
                        <button 
                           key={act}
                           onClick={() => {
                              const newActs = active ? card.activities.filter(a => a !== act) : [...card.activities, act];
                              handleSave({ activities: newActs });
                           }}
                           className={cn(
                              "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                              active ? "bg-indigo-100 border-indigo-200 text-indigo-800" : "bg-slate-50 border-slate-200 text-slate-600"
                           )}
                        >
                           {act}
                        </button>
                     );
                  })}
               </div>
            </div>

             {/* Photos */}
             <div className="space-y-3">
               <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Photos/Video</label>
               {isProcessingVideo && <Badge variant="warning" className="mb-2">Analyzing Video Content...</Badge>}
               <div className="flex gap-4 overflow-x-auto pb-2">
                  <div className="relative h-32 w-32 shrink-0">
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} accept="image/*,video/*" />
                     <div className="h-full w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-primary-400 hover:text-primary-500 transition-colors">
                        <Camera size={24}/>
                        <span className="text-xs mt-2">Add Media</span>
                     </div>
                  </div>
                  {media.map((m: any) => (
                     <div key={m.id} className="h-32 w-32 shrink-0 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 relative">
                        {m.file?.mimeType.startsWith('video') ? (
                           <div className="w-full h-full flex items-center justify-center bg-black">
                              <Video className="text-white"/>
                           </div>
                        ) : (
                           <img src={m.url} className="h-full w-full object-cover" alt="" />
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Note to Parent</label>
                  <Button 
                     size="sm" 
                     variant={isRecording ? 'danger' : 'outline'} 
                     className="gap-2 h-7 text-xs" 
                     onClick={toggleRecording}
                  >
                     <Mic size={12} className={isRecording ? "animate-pulse" : ""}/> {isRecording ? 'Stop Dictation' : 'Dictate'}
                  </Button>
               </div>
               <textarea 
                  className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={() => handleSave({ notes })}
                  placeholder="Type or dictate daily notes..."
               />
            </div>
         </div>
      </Card>
   );
};
