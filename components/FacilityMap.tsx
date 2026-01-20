
import React, { useState } from 'react';
import { useData } from './DataContext';
import { MOCK_UNITS } from '../constants';
import { Card, Badge, cn, Button, Modal } from './Common';
import { BedDouble, Dog, AlertTriangle, Check, User, Calendar } from 'lucide-react';
import { ReservationStatus, KennelUnit } from '../types';
import { useNavigate } from 'react-router-dom';

interface UnitCardProps {
  unit: KennelUnit;
  onSelect: (id: string) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onSelect }) => {
  const { reservations, pets } = useData();
  
  // Helper to find occupant
  const getOccupant = (unitId: string) => {
    const today = new Date();
    return reservations.find(r => 
      r.lodging === unitId && 
      r.status === ReservationStatus.CheckedIn &&
      new Date(r.checkIn) <= today && 
      new Date(r.checkOut) >= today
    );
  };

  const reservation = getOccupant(unit.id);
  const pet = reservation ? pets.find(p => p.id === reservation.petId) : null;
  const isOccupied = !!pet;
  const isMaintenance = unit.status === 'Maintenance';

  return (
    <div 
      onClick={() => onSelect(unit.id)}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between h-32 group",
        isMaintenance ? "bg-slate-100 border-slate-200 border-dashed" :
        isOccupied ? "bg-white border-primary-200 hover:border-primary-400" :
        "bg-white border-green-100 hover:border-green-400"
      )}
    >
      <div className="flex justify-between items-start">
         <span className={cn("text-xs font-bold uppercase", isOccupied ? "text-primary-600" : "text-slate-400")}>
            {unit.name}
         </span>
         {isMaintenance ? <Badge variant="warning" className="py-0 text-[9px]">Maint</Badge> : 
          isOccupied ? <Badge variant="info" className="py-0 text-[9px]">Occ</Badge> : 
          <Badge variant="success" className="py-0 text-[9px]">Vacant</Badge>
         }
      </div>

      {isOccupied && pet ? (
         <div className="mt-2 text-center">
            <div className="font-bold text-slate-900 text-lg truncate">{pet.name}</div>
            <div className="text-xs text-slate-500 truncate">{pet.breed}</div>
            {pet.alerts.length > 0 && (
               <div className="absolute top-2 right-2 text-red-500 animate-pulse">
                  <AlertTriangle size={14}/>
               </div>
            )}
         </div>
      ) : isMaintenance ? (
         <div className="flex flex-col items-center justify-center text-slate-400 h-full pb-4">
            <AlertTriangle size={24} className="mb-1 opacity-50"/>
            <span className="text-xs">Offline</span>
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center text-green-200 h-full pb-4 group-hover:text-green-400 transition-colors">
            <BedDouble size={24}/>
            <span className="text-xs font-bold mt-1">Free</span>
         </div>
      )}
    </div>
  );
};

export const FacilityMap = () => {
  const { reservations, pets, owners } = useData();
  const navigate = useNavigate();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Group units by type
  const runs = MOCK_UNITS.filter(u => u.type === 'Run');
  const suites = MOCK_UNITS.filter(u => u.type === 'Suite');
  const cages = MOCK_UNITS.filter(u => u.type === 'Cage');

  // Helper to find occupant specifically for the modal detail
  const getOccupantForModal = (unitId: string) => {
    const today = new Date();
    return reservations.find(r => 
      r.lodging === unitId && 
      r.status === ReservationStatus.CheckedIn &&
      new Date(r.checkIn) <= today && 
      new Date(r.checkOut) >= today
    );
  };

  const selectedUnit = MOCK_UNITS.find(u => u.id === selectedUnitId);
  const activeRes = selectedUnitId ? getOccupantForModal(selectedUnitId) : null;
  const activePet = activeRes ? pets.find(p => p.id === activeRes.petId) : null;
  const activeOwner = activeRes ? owners.find(o => o.id === activeRes.ownerId) : null;

  return (
    <div className="space-y-8 p-6 pb-20">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">Facility Map</h1>
             <p className="text-slate-500 text-sm">Real-time occupancy view.</p>
          </div>
          <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></div>Vacant</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-2 border-primary-200"></div>Occupied</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 border-dashed"></div>Maintenance</div>
          </div>
       </div>

       <div className="space-y-6">
          <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Dog size={16}/> Luxury Suites</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {suites.map(u => <UnitCard key={u.id} unit={u} onSelect={setSelectedUnitId} />)}
             </div>
          </section>

          <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><BedDouble size={16}/> Standard Runs</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {runs.map(u => <UnitCard key={u.id} unit={u} onSelect={setSelectedUnitId} />)}
             </div>
          </section>

          <section>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Check size={16}/> Holding Cages</h3>
             <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {cages.map(u => <UnitCard key={u.id} unit={u} onSelect={setSelectedUnitId} />)}
             </div>
          </section>
       </div>

       {/* Detail Modal */}
       <Modal isOpen={!!selectedUnit} onClose={() => setSelectedUnitId(null)} title={selectedUnit?.name || 'Unit Details'} size="sm">
          {activePet ? (
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <img src={activePet.photoUrl} className="h-16 w-16 rounded-full object-cover border-2 border-primary-100" />
                   <div>
                      <h3 className="font-bold text-lg text-slate-900">{activePet.name}</h3>
                      <div className="text-sm text-slate-500">{activePet.breed}</div>
                   </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-sm">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Owner</span>
                      <span className="font-medium">{activeOwner?.name}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Departing</span>
                      <span className="font-medium text-amber-600">{activeRes?.checkOut ? new Date(activeRes.checkOut).toLocaleDateString() : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <Badge variant="success">Checked In</Badge>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" onClick={() => navigate(`/owners-pets?id=${activePet.id}&type=pets`)}>View Profile</Button>
                   <Button onClick={() => navigate('/reservations')}>Manage Booking</Button>
                </div>
             </div>
          ) : (
             <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                   <Check size={32}/>
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">Unit is Vacant</h3>
                   <p className="text-sm text-slate-500">Ready for assignment.</p>
                </div>
                <Button className="w-full" onClick={() => navigate('/reservations')}>Assign Reservation</Button>
             </div>
          )}
       </Modal>
    </div>
  );
};
