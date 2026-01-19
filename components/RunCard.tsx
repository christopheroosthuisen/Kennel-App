
import React, { useRef } from 'react';
import { X, Printer, Phone, AlertTriangle, Info, MapPin, Calendar, Activity, Utensils } from 'lucide-react';
import { Modal, Button, Badge, cn } from './Common';
import { MOCK_RESERVATIONS, MOCK_PETS, MOCK_OWNERS } from '../constants';
import { ReservationStatus } from '../types';

interface RunCardProps {
  reservationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RunCardModal = ({ reservationId, isOpen, onClose }: RunCardProps) => {
  const reservation = MOCK_RESERVATIONS.find(r => r?.id === reservationId);
  const pet = MOCK_PETS.find(p => p?.id === reservation?.petId);
  const owner = MOCK_OWNERS.find(o => o?.id === reservation?.ownerId);

  if (!reservation || !pet || !owner) return null;

  // Calculate Age
  const birthDate = new Date(pet.dob);
  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }

  const handlePrint = () => {
    window.print();
  };

  // Determine Alert Level
  const hasAggression = pet.alerts.some(a => a.toLowerCase().includes('aggressive') || a.toLowerCase().includes('caution'));
  const hasMeds = pet.alerts.some(a => a.toLowerCase().includes('meds'));
  const isEscapeArtist = pet.alerts.some(a => a.toLowerCase().includes('escape'));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run Card Preview" size="xl">
      <div className="flex flex-col h-full">
        {/* Toolbar - Hidden when printing */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <p className="text-sm text-slate-500">Previewing Run Card for <strong>{pet.name}</strong></p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} className="gap-2"><Printer size={16}/> Print Card</Button>
          </div>
        </div>

        {/* Printable Area - Fixed Aspect Ratio for Letter Paper */}
        <div className="bg-white border border-slate-200 shadow-lg mx-auto print:shadow-none print:border-0 print:m-0 w-[8.5in] min-h-[11in] relative overflow-hidden text-slate-900 print:text-black">
          
          {/* Top Header Section */}
          <div className="p-6 border-b-2 border-slate-800 flex gap-6">
            {/* Photo */}
            <div className="w-48 h-48 shrink-0 border-2 border-slate-300 bg-slate-100 rounded-md overflow-hidden relative">
               <img src={pet.photoUrl} className="w-full h-full object-cover" alt={pet.name} />
            </div>

            {/* Core Info */}
            <div className="flex-1">
               <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-6xl font-black uppercase tracking-tight leading-none mb-1">{pet.name}</h1>
                    <h2 className="text-3xl font-light text-slate-600 uppercase">{owner.name.split(' ').pop()}</h2>
                  </div>
                  <div className="text-right">
                     <div className="text-4xl font-bold bg-slate-900 text-white px-4 py-2 rounded-sm inline-block mb-2">
                       {reservation.lodging || "UNASSIGNED"}
                     </div>
                     <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{reservation.type}</div>
                  </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                     <Calendar size={18} className="text-slate-400"/> 
                     <div>
                        <span className="block text-xs uppercase font-bold text-slate-400">Check In</span>
                        <span className="font-bold text-lg">{new Date(reservation.checkIn).toLocaleDateString()}</span>
                        <span className="text-slate-500 ml-1">{new Date(reservation.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={18} className="text-slate-400"/> 
                     <div>
                        <span className="block text-xs uppercase font-bold text-slate-400">Check Out</span>
                        <span className="font-bold text-lg">{new Date(reservation.checkOut).toLocaleDateString()}</span>
                        <span className="text-slate-500 ml-1">{new Date(reservation.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
                      <li className="flex justify-between"><span className="text-slate-500">Weight:</span> <span className="font-bold">{pet.weight} lbs</span></li>
                      <li className="flex justify-between"><span className="text-slate-500">Color:</span> <span className="font-bold">{pet.color || 'N/A'}</span></li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Contact Info</h3>
                   <div className="space-y-2 text-sm">
                      <div>
                         <span className="block font-bold">{owner.name}</span>
                         <span className="flex items-center gap-2 mt-0.5"><Phone size={14}/> {owner.phone}</span>
                      </div>
                      {owner.emergencyContact && (
                        <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                           <span className="text-xs text-slate-500 uppercase block mb-1">Emergency Contact</span>
                           <span className="block font-bold">{owner.emergencyContact.name} ({owner.emergencyContact.relation})</span>
                           <span className="block">{owner.emergencyContact.phone}</span>
                        </div>
                      )}
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Veterinarian</h3>
                   <div className="text-sm font-medium">{pet.vet}</div>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Services & Add-ons</h3>
                   <div className="flex flex-wrap gap-1">
                      {reservation.services.map(s => (
                         <span key={s} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200">{s}</span>
                      ))}
                      {reservation.services.length === 0 && <span className="text-sm text-slate-400 italic">No add-ons selected</span>}
                   </div>
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
                         <span className="font-bold text-slate-700 block">Temperament:</span>
                         <span>{pet.behaviorNotes || "Standard friendly behavior."}</span>
                      </div>
                      <div>
                         <span className="font-bold text-slate-700 block">Triggers / Fears:</span>
                         <span>Thunderstorms, Vacuums</span>
                      </div>
                      <div>
                         <span className="font-bold text-slate-700 block">Occupation / Habits:</span>
                         <span>Loves fetch, Ball obsessed</span>
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Notes</h3>
                   <div className="bg-yellow-50 border border-yellow-100 p-3 rounded min-h-[100px] text-sm text-slate-800">
                      {reservation.notes ? reservation.notes : <span className="text-slate-400 italic">No reservation notes.</span>}
                   </div>
                </section>

                {pet.medications && pet.medications.length > 0 && (
                   <section>
                      <h3 className="text-xs font-bold uppercase text-red-500 mb-2 border-b border-red-100 pb-1 flex items-center gap-1"><Activity size={14}/> Medications</h3>
                      <ul className="text-sm space-y-2">
                         {pet.medications.map((med, i) => (
                            <li key={i} className="bg-red-50 p-2 rounded border border-red-100">
                               <div className="font-bold text-red-900">{med.name} - {med.dosage}</div>
                               <div className="text-red-700">{med.frequency} • {med.instructions}</div>
                            </li>
                         ))}
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
                   <span className="font-bold text-slate-900">General:</span> {pet.feedingInstructions}
                </div>

                <div className="w-full border border-slate-300 rounded-sm overflow-hidden">
                   <div className="grid grid-cols-4 bg-slate-200 text-center text-xs font-bold uppercase py-2 border-b border-slate-300 text-slate-600">
                      <div>Morning (AM)</div>
                      <div>Noon (Mid)</div>
                      <div>Evening (PM)</div>
                      <div>Bedtime</div>
                   </div>
                   <div className="grid grid-cols-4 text-center divide-x divide-slate-300 min-h-[80px]">
                      <div className="p-2 flex flex-col justify-center">
                         <span className="text-lg font-bold">1 Cup</span>
                         <span className="text-xs text-slate-500">Dry Kibble</span>
                      </div>
                      <div className="p-2 flex flex-col justify-center bg-slate-50">
                         <span className="text-slate-400 text-xs italic">--</span>
                      </div>
                      <div className="p-2 flex flex-col justify-center">
                         <span className="text-lg font-bold">1 Cup</span>
                         <span className="text-xs text-slate-500">+ Meds</span>
                      </div>
                      <div className="p-2 flex flex-col justify-center bg-slate-50">
                         <span className="text-sm font-medium">1 Treat</span>
                      </div>
                   </div>
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
