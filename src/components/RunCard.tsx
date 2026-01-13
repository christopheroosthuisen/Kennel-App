
import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Phone, AlertTriangle, Info, MapPin, Calendar, Activity, Utensils, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { Modal, Button, Badge, cn, Textarea, Input, Label } from './Common';
import { Medication, Reservation } from '../../shared/domain';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

interface RunCardProps {
  reservationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RunCardModal = ({ reservationId, isOpen, onClose }: RunCardProps) => {
  const { data: reservation } = useApiQuery(`rc-res-${reservationId}`, () => api.getReservation(reservationId));
  // In a real optimized app, we'd fetch these efficiently or have them in context
  const { data: pets = [] } = useApiQuery('rc-pets', () => api.getPets());
  const { data: owners = [] } = useApiQuery('rc-owners', () => api.getOwners());

  const pet = pets.find(p => p.id === reservation?.petId);
  const owner = owners.find(o => o.id === reservation?.ownerId);

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    weight: 0,
    feedingInstructions: '',
    behaviorNotes: '',
    reservationNotes: '',
    medications: [] as Medication[]
  });

  useEffect(() => {
    if (pet && reservation) {
      setEditedData({
        weight: pet.weightLbs || 0,
        feedingInstructions: pet.feedingInstructions || '',
        behaviorNotes: pet.behaviorNotes || '',
        reservationNotes: reservation.notes || '',
        medications: pet.medications ? [...pet.medications] : []
      });
    }
  }, [pet, reservation]);

  if (!reservation || !pet || !owner) return null;

  // Calculate Age
  const birthDate = pet.dob ? new Date(pet.dob) : new Date();
  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }

  const handlePrint = () => {
    setIsEditing(false);
    setTimeout(() => window.print(), 100);
  };

  const handleSave = () => {
    // In a real app, this would API call to update Pet and Reservation
    setIsEditing(false);
  };

  const updateMed = (index: number, field: keyof Medication, value: any) => {
    const newMeds = [...editedData.medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setEditedData({ ...editedData, medications: newMeds });
  };

  const removeMed = (index: number) => {
    const newMeds = editedData.medications.filter((_, i) => i !== index);
    setEditedData({ ...editedData, medications: newMeds });
  };

  const addMed = () => {
    const newMed: Medication = {
      id: `new-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      active: true
    };
    setEditedData({ ...editedData, medications: [...editedData.medications, newMed] });
  };

  const petTags = pet.tags || [];
  const hasAggression = petTags.some(a => a.toLowerCase().includes('aggressive') || a.toLowerCase().includes('caution'));
  const hasMeds = editedData.medications.length > 0;
  const isEscapeArtist = petTags.some(a => a.toLowerCase().includes('escape'));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run Card Preview" size="xl">
      <div className="flex flex-col h-full">
        {/* Toolbar - Hidden when printing */}
        <div className="flex justify-between items-center mb-4 print:hidden bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-4">
             <p className="text-sm text-slate-500">Previewing Run Card for <strong>{pet.name}</strong></p>
             <div className="h-4 w-px bg-slate-300"></div>
             {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                   <Edit2 size={14}/> Edit Details
                </Button>
             ) : (
                <div className="flex gap-2">
                   <Button variant="primary" size="sm" onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700 border-none">
                      <Save size={14}/> Save Changes
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
             )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} className="gap-2"><Printer size={16}/> Print Card</Button>
          </div>
        </div>

        {/* Printable Area - Fixed Aspect Ratio for Letter Paper */}
        <div className="bg-white border border-slate-200 shadow-lg mx-auto print:shadow-none print:border-0 print:m-0 w-[8.5in] min-h-[11in] relative overflow-hidden text-slate-900 print:text-black">
          
          {/* Top Header Section */}
          <div className="p-6 border-b-2 border-slate-800 flex gap-6">
            {/* Core Info */}
            <div className="flex-1">
               <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-6xl font-black uppercase tracking-tight leading-none mb-1">{pet.name}</h1>
                    <h2 className="text-3xl font-light text-slate-600 uppercase">{owner.lastName}</h2>
                  </div>
                  <div className="text-right">
                     <div className="text-4xl font-bold bg-slate-900 text-white px-4 py-2 rounded-sm inline-block mb-2">
                       {/* Simplified unit display */}
                       {/* In real implementation, derive from segments */}
                       UNASSIGNED
                     </div>
                     <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{reservation.type}</div>
                  </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                     <Calendar size={18} className="text-slate-400"/> 
                     <div>
                        <span className="block text-xs uppercase font-bold text-slate-400">Check In</span>
                        <span className="font-bold text-lg">{new Date(reservation.startAt).toLocaleDateString()}</span>
                        <span className="text-slate-500 ml-1">{new Date(reservation.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={18} className="text-slate-400"/> 
                     <div>
                        <span className="block text-xs uppercase font-bold text-slate-400">Check Out</span>
                        <span className="font-bold text-lg">{new Date(reservation.endAt).toLocaleDateString()}</span>
                        <span className="text-slate-500 ml-1">{new Date(reservation.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Alert Bar */}
          <div className={cn(
            "flex items-center gap-6 px-6 py-3 border-b-2 border-slate-800 font-bold uppercase tracking-wider text-sm print:bg-opacity-20 -webkit-print-color-adjust-exact",
            hasAggression ? "bg-red-100 text-red-700" : "bg-green-50 text-green-800"
          )}>
             {hasAggression ? (
               <>
                 <AlertTriangle size={20} className="fill-red-700 text-white"/>
                 <span>Caution: Known Aggression / Reactive</span>
               </>
             ) : (
               <>
                 <Activity size={20} className="fill-green-700 text-white"/>
                 <span>Good to Grab / Friendly</span>
               </>
             )}
             {hasMeds && <span className="ml-auto flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-red-200 text-red-600"><Activity size={14}/> Has Medications</span>}
             {isEscapeArtist && <span className="ml-2 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-orange-200 text-orange-600"><AlertTriangle size={14}/> Flight Risk</span>}
          </div>

          {/* Two Column Details */}
          <div className="flex flex-1">
             {/* Left Column: Stats */}
             <div className="w-1/2 p-6 border-r border-slate-200 space-y-6">
                
                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Pet Statistics</h3>
                   <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-slate-500">Breed:</span> <span className="font-bold">{pet.breed}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500">Sex:</span> <span className="font-bold">{pet.gender === 'M' ? 'Male' : 'Female'} / {pet.fixed ? 'Altered' : 'Intact'}</span></li>
                      <li className="flex justify-between"><span className="text-slate-500">Age:</span> <span className="font-bold">{ageYears} yrs, {ageMonths} mos</span></li>
                      <li className="flex justify-between items-center">
                         <span className="text-slate-500">Weight:</span> 
                         {isEditing ? (
                            <Input 
                               type="number" 
                               value={editedData.weight} 
                               onChange={(e) => setEditedData({...editedData, weight: parseFloat(e.target.value)})}
                               className="h-6 w-20 text-right font-bold py-0" 
                            />
                         ) : (
                            <span className="font-bold">{editedData.weight} lbs</span>
                         )}
                      </li>
                      <li className="flex justify-between"><span className="text-slate-500">Color:</span> <span className="font-bold">{pet.color || 'N/A'}</span></li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Contact Info</h3>
                   <div className="space-y-2 text-sm">
                      <div>
                         <span className="block font-bold">{owner.firstName} {owner.lastName}</span>
                         <span className="flex items-center gap-2 mt-0.5"><Phone size={14}/> {owner.phone}</span>
                      </div>
                      {owner.emergencyContactName && (
                        <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                           <span className="text-xs text-slate-500 uppercase block mb-1">Emergency Contact</span>
                           <span className="block font-bold">{owner.emergencyContactName}</span>
                           <span className="block">{owner.emergencyContactPhone}</span>
                        </div>
                      )}
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Veterinarian</h3>
                   <div className="text-sm font-medium">{pet.vetName}</div>
                </section>
             </div>

             {/* Right Column: Behavior & Notes */}
             <div className="w-1/2 p-6 space-y-6">
                <section>
                   <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-1">
                      <h3 className="text-xs font-bold uppercase text-slate-400">"Baggage" & Behavior</h3>
                   </div>
                   <div className="space-y-4 text-sm">
                      <div>
                         <span className="font-bold text-slate-700 block mb-1">Temperament / Notes:</span>
                         {isEditing ? (
                            <Textarea 
                               value={editedData.behaviorNotes}
                               onChange={(e) => setEditedData({...editedData, behaviorNotes: e.target.value})}
                               className="text-sm min-h-[80px]"
                            />
                         ) : (
                            <span>{editedData.behaviorNotes || "Standard friendly behavior."}</span>
                         )}
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Notes</h3>
                   {isEditing ? (
                      <Textarea 
                         value={editedData.reservationNotes}
                         onChange={(e) => setEditedData({...editedData, reservationNotes: e.target.value})}
                         className="text-sm bg-yellow-50 border-yellow-200"
                      />
                   ) : (
                      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded min-h-[100px] text-sm text-slate-800">
                         {editedData.reservationNotes ? editedData.reservationNotes : <span className="text-slate-400 italic">No reservation notes.</span>}
                      </div>
                   )}
                </section>

                {(isEditing || (editedData.medications && editedData.medications.length > 0)) && (
                   <section>
                      <div className="flex justify-between items-center mb-2 border-b border-red-100 pb-1">
                         <h3 className="text-xs font-bold uppercase text-red-500 flex items-center gap-1"><Activity size={14}/> Medications</h3>
                         {isEditing && <Button size="sm" variant="ghost" className="h-6 text-red-600" onClick={addMed}><Plus size={12}/> Add</Button>}
                      </div>
                      
                      <ul className="text-sm space-y-2">
                         {editedData.medications.map((med, i) => (
                            <li key={i} className="bg-red-50 p-2 rounded border border-red-100 relative group">
                               {isEditing ? (
                                  <div className="space-y-2">
                                     <div className="flex gap-2">
                                        <Input placeholder="Med Name" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} className="h-7 text-xs bg-white" />
                                        <Input placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} className="h-7 text-xs w-24 bg-white" />
                                     </div>
                                     <div className="flex gap-2">
                                        <Input placeholder="Freq" value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} className="h-7 text-xs w-32 bg-white" />
                                        <Input placeholder="Instructions" value={med.instructions} onChange={(e) => updateMed(i, 'instructions', e.target.value)} className="h-7 text-xs bg-white" />
                                     </div>
                                     <button onClick={() => removeMed(i)} className="absolute top-1 right-1 text-red-400 hover:text-red-700 bg-white rounded-full p-0.5"><X size={12}/></button>
                                  </div>
                               ) : (
                                  <>
                                     <div className="font-bold text-red-900">{med.name} - {med.dosage}</div>
                                     <div className="text-red-700">{med.frequency} • {med.instructions}</div>
                                  </>
                               )}
                            </li>
                         ))}
                         {editedData.medications.length === 0 && isEditing && <div className="text-xs text-slate-400 italic text-center p-2">No medications listed. Add one if needed.</div>}
                      </ul>
                   </section>
                )}
             </div>
          </div>

          {/* Diet Section - Bottom Full Width */}
          <div className="border-t-2 border-slate-800 mt-auto">
             <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2">
                <Utensils size={18} className="text-slate-600"/>
                <h3 className="font-bold text-slate-800 uppercase text-sm">Diet & Feeding Instructions</h3>
             </div>
             <div className="p-6 pt-4">
                <div className="text-sm font-medium text-slate-700 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                   <span className="font-bold text-slate-900 mr-2">General:</span> 
                   {isEditing ? (
                      <Input 
                         value={editedData.feedingInstructions} 
                         onChange={(e) => setEditedData({...editedData, feedingInstructions: e.target.value})}
                         className="inline-block w-full mt-1 bg-white" 
                      />
                   ) : (
                      <span>{editedData.feedingInstructions}</span>
                   )}
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-900 text-white text-[10px] flex justify-between items-center print:bg-white print:text-slate-400 print:border-t print:border-slate-200">
             <span>Printed: {new Date().toLocaleString()}</span>
             <span>Run Card {reservation.id} • Page 1 of 1</span>
          </div>

        </div>
      </div>
    </Modal>
  );
};
