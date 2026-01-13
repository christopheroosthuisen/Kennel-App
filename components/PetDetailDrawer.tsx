
import React from 'react';
import { X, AlertTriangle, Upload, FileText, Scissors, Droplet, Activity, Calendar, Scale, Dna, ShieldAlert, CheckCircle } from 'lucide-react';
import { Pet, Vaccine } from '../types';
import { Button, Badge, cn, Card } from './Common';

interface PetDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | undefined;
}

export const PetDetailDrawer = ({ isOpen, onClose, pet }: PetDetailDrawerProps) => {
  if (!pet) return null;

  const isAggressive = pet.alerts.some(a => a.toLowerCase().includes('aggressive') || a.toLowerCase().includes('biter'));
  const age = new Date().getFullYear() - new Date(pet.dob).getFullYear();

  // Helper to determine vaccine row status
  const getVaccineStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-red-50 hover:bg-red-100', text: 'text-red-700', label: 'Expired', dot: 'bg-red-500' };
    if (diffDays < 30) return { color: 'bg-yellow-50 hover:bg-yellow-100', text: 'text-yellow-700', label: 'Expiring Soon', dot: 'bg-yellow-500' };
    return { color: 'bg-white hover:bg-slate-50', text: 'text-slate-700', label: 'Valid', dot: 'bg-green-500' };
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-xl bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header / Hero */}
        <div className="relative h-64 shrink-0 bg-slate-900">
          <img 
            src={pet.photoUrl} 
            alt={pet.name} 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X size={24} />
          </Button>

          <div className="absolute bottom-0 left-0 w-full p-6">
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {pet.name}
              {pet.gender === 'M' ? <span className="text-blue-400 text-2xl">♂</span> : <span className="text-pink-400 text-2xl">♀</span>}
            </h1>
            <p className="text-slate-300 font-medium text-lg">{pet.breed}</p>
          </div>

          {/* Warning Banner */}
          {isAggressive && (
            <div className="absolute top-0 left-0 w-full bg-red-600/90 text-white px-6 py-3 flex items-center justify-center gap-2 font-bold uppercase tracking-widest shadow-lg animate-pulse">
              <ShieldAlert size={20} />
              Warning: Aggressive / Biter
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Vitals Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-3 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase mb-1">Age</span>
              <span className="text-xl font-bold text-slate-800">{age} <span className="text-xs text-slate-500 font-normal">yrs</span></span>
            </Card>
            <Card className="p-3 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase mb-1">Weight</span>
              <span className="text-xl font-bold text-slate-800">{pet.weight} <span className="text-xs text-slate-500 font-normal">lbs</span></span>
            </Card>
            <Card className="p-3 col-span-2 flex flex-col justify-center px-4 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase mb-1">Microchip</span>
              <span className="text-lg font-mono font-medium text-slate-800 tracking-tight truncate">{pet.microchip || 'N/A'}</span>
            </Card>
          </div>

          {/* Medical Dashboard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="text-blue-500" size={20} /> Medical Dashboard
              </h3>
              <Button size="sm" variant="outline" className="gap-2 text-xs h-8">
                <Upload size={12} /> Upload Record
              </Button>
            </div>
            
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Vaccine</th>
                      <th className="px-4 py-3">Administered</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pet.vaccines && pet.vaccines.length > 0 ? pet.vaccines.map((vax) => {
                      const status = getVaccineStatus(vax.dateExpires);
                      return (
                        <tr key={vax.id} className={cn("transition-colors", status.color)}>
                          <td className="px-4 py-3 font-medium text-slate-900">{vax.name}</td>
                          <td className="px-4 py-3 text-slate-600">{new Date(vax.dateAdministered).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-mono text-slate-700">{new Date(vax.dateExpires).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold", status.text, "bg-white/50 border border-black/5")}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">No vaccination records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Grooming & Handling */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Scissors className="text-purple-500" size={20} /> Grooming & Handling
            </h3>
            <Card className="p-0 border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Scissors size={12}/> Blade Settings
                  </div>
                  <div className="text-slate-800 font-medium">
                    {pet.grooming?.bladeSetting || '#7F Body, #10 Belly'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Droplet size={12}/> Shampoo
                  </div>
                  <div className="text-slate-800 font-medium">
                    {pet.grooming?.shampoo || 'Oatmeal Sensitive'}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Handling Notes</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {pet.grooming?.handlingNotes || pet.behaviorNotes || "No specific handling notes. Standard care applies."}
                </p>
              </div>
            </Card>
          </section>

          {/* Quick Actions Footer Space */}
          <div className="h-12" /> 
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3 shrink-0">
          <Button variant="outline" className="flex-1 gap-2 border-slate-300">
            <FileText size={16} /> Full Profile
          </Button>
          <Button className="flex-1 gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Calendar size={16} /> Book Now
          </Button>
        </div>
      </div>
    </>
  );
};
