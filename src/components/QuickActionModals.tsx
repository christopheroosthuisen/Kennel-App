
import React, { useState } from 'react';
import { Modal, Button, Input, Label, cn, Select } from './Common';
import { Calendar, Check, DollarSign, Mail, MessageSquare, Plus, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
}

export const NewReservationModal = ({ isOpen, onClose, ownerId }: QuickActionModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [dates, setDates] = useState({ startAt: '', endAt: '' });
  const [serviceType, setServiceType] = useState<string>('Boarding');
  
  const { data: pets = [] } = useApiQuery(`owner-pets-${ownerId}`, async () => {
    const res = await api.getPets({ ownerId });
    return res;
  }, [ownerId]);

  const togglePet = (id: string) => {
    if (selectedPetIds.includes(id)) {
      setSelectedPetIds(selectedPetIds.filter(p => p !== id));
    } else {
      setSelectedPetIds([...selectedPetIds, id]);
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      // Create a reservation for each selected pet
      for (const petId of selectedPetIds) {
        await api.createReservation({
          ownerId,
          petId,
          startAt: new Date(dates.startAt).toISOString(),
          endAt: new Date(dates.endAt).toISOString(),
          type: serviceType,
          status: 'Requested'
        });
      }
      alert('Reservation(s) created successfully!');
      onClose();
    } catch (e) {
      alert('Failed to create reservation.');
    }
  };

  // Mock calculation
  const nights = dates.startAt && dates.endAt 
    ? Math.ceil((new Date(dates.endAt).getTime() - new Date(dates.startAt).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  const rate = serviceType === 'Boarding' ? 55 : serviceType === 'Daycare' ? 35 : 85;
  const total = Math.max(0, nights) * rate * selectedPetIds.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Reservation" size="lg">
      <div className="flex flex-col h-[500px]">
        {/* Progress Stepper */}
        <div className="flex justify-between items-center px-8 mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10" />
          {['Pets', 'Dates', 'Service', 'Review'].map((label, i) => {
            const stepNum = i + 1;
            const isActive = step >= stepNum;
            return (
              <div key={label} className="flex flex-col items-center bg-white px-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all mb-1",
                  isActive ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {step > stepNum ? <Check size={16} /> : stepNum}
                </div>
                <span className={cn("text-xs font-medium", isActive ? "text-primary-700" : "text-slate-400")}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Select Pets</Label>
              <div className="grid grid-cols-1 gap-3">
                {pets.map(pet => (
                  <div 
                    key={pet.id} 
                    onClick={() => togglePet(pet.id)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      selectedPetIds.includes(pet.id) ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500" : "border-slate-200"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {pet.photoUrl ? <img src={pet.photoUrl} className="w-full h-full object-cover" alt="" /> : <span className="font-bold text-slate-500">{pet.name[0]}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{pet.name}</div>
                      <div className="text-xs text-slate-500">{pet.breed}</div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", selectedPetIds.includes(pet.id) ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300")}>
                      {selectedPetIds.includes(pet.id) && <Check size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3 mb-4">
                <Calendar className="text-primary-600" />
                <span className="text-sm text-slate-600">Standard check-in time is <strong>3:00 PM</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Check In</Label>
                  <Input type="datetime-local" value={dates.startAt} onChange={e => setDates({ ...dates, startAt: e.target.value })} />
                </div>
                <div>
                  <Label>Check Out</Label>
                  <Input type="datetime-local" value={dates.endAt} onChange={e => setDates({ ...dates, endAt: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Service Type</Label>
              <div className="grid grid-cols-2 gap-4">
                {['Boarding', 'Daycare', 'Grooming', 'Training'].map(type => (
                  <div 
                    key={type}
                    onClick={() => setServiceType(type)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer text-center hover:bg-slate-50 transition-all",
                      serviceType === type ? "border-primary-600 bg-primary-50 text-primary-700 font-bold" : "border-slate-200 text-slate-600"
                    )}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Reservation Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service</span>
                    <span className="font-medium">{serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dates</span>
                    <span className="font-medium">
                      {dates.startAt ? new Date(dates.startAt).toLocaleDateString() : '--'} - {dates.endAt ? new Date(dates.endAt).toLocaleDateString() : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pets ({selectedPetIds.length})</span>
                    <span className="font-medium">{pets.filter(p => selectedPetIds.includes(p.id)).map(p => p.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 text-lg font-bold text-slate-900">
                    <span>Estimated Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-slate-400">
                By confirming, you agree to the service terms. Availability is not guaranteed until confirmed.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-100 mt-auto">
          <Button variant="ghost" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={(step === 1 && !selectedPetIds.length) || (step === 2 && (!dates.startAt || !dates.endAt))}>
              Next Step <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export const SendEstimateModal = ({ isOpen, onClose, ownerId }: QuickActionModalProps) => {
  const [items, setItems] = useState<{ id: number, desc: string, price: number }[]>([
    { id: 1, desc: 'Boarding (5 nights)', price: 275 },
    { id: 2, desc: 'Exit Bath', price: 45 }
  ]);
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'both'>('email');

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', price: 0 }]);
  };

  const updateItem = (id: number, field: 'desc' | 'price', value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handleSend = () => {
    // In real app: API call to create estimate and trigger notification
    alert(`Estimate for $${total} sent via ${sendMethod}!`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Build & Send Estimate" size="md">
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          <div>
            <Label>Line Items</Label>
            <div className="space-y-2 mt-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <Input 
                    placeholder="Description" 
                    value={item.desc} 
                    onChange={e => updateItem(item.id, 'desc', e.target.value)}
                    className="flex-1"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-2 text-slate-400 text-sm">$</span>
                    <Input 
                      type="number" 
                      value={item.price} 
                      onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))}
                      className="pl-5 text-right"
                    />
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addItem} className="text-primary-600 gap-1 mt-2">
                <Plus size={14} /> Add Line Item
              </Button>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 py-4 border-t border-b border-slate-100 bg-slate-50 -mx-6 px-6">
            <span className="text-sm font-bold text-slate-500 uppercase">Total Estimate</span>
            <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>

          <div>
            <Label>Delivery Method</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <button 
                onClick={() => setSendMethod('email')}
                className={cn("flex flex-col items-center justify-center p-3 rounded-lg border transition-all", sendMethod === 'email' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50")}
              >
                <Mail size={20} className="mb-1" />
                <span className="text-xs font-bold">Email</span>
              </button>
              <button 
                onClick={() => setSendMethod('sms')}
                className={cn("flex flex-col items-center justify-center p-3 rounded-lg border transition-all", sendMethod === 'sms' ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 hover:bg-slate-50")}
              >
                <MessageSquare size={20} className="mb-1" />
                <span className="text-xs font-bold">SMS</span>
              </button>
              <button 
                onClick={() => setSendMethod('both')}
                className={cn("flex flex-col items-center justify-center p-3 rounded-lg border transition-all", sendMethod === 'both' ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 hover:bg-slate-50")}
              >
                <div className="flex gap-1 mb-1"><Mail size={16}/><MessageSquare size={16}/></div>
                <span className="text-xs font-bold">Both</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} className="gap-2">
            <DollarSign size={16} /> Send Quote
          </Button>
        </div>
      </div>
    </Modal>
  );
};
