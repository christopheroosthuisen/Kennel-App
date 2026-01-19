
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Label, Select, Textarea, Badge, Switch, cn, Tabs } from './Common';
import { MOCK_RESERVATIONS, MOCK_PETS, MOCK_OWNERS, MOCK_SERVICE_CONFIGS, MOCK_UNITS } from '../constants';
import { ReservationStatus, ServiceType } from '../types';
import { 
  Calendar, User, Dog, AlertTriangle, Syringe, Sparkles, Check, 
  BedDouble, Clock, DollarSign, Trash2, Plus, ArrowRight, LayoutGrid,
  LogOut, CreditCard, X, Info
} from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string; // The ID of the entity being edited
}

// --- Reusable Sub-Modules ---

export const LodgingManager = ({ 
  checkIn, 
  checkOut, 
  currentLodging, 
  onChange 
}: { 
  checkIn: string, 
  checkOut: string, 
  currentLodging?: string, 
  onChange: (val: any) => void 
}) => {
  // Mocking split stay capability by managing an array of segments
  const [segments, setSegments] = useState([
    { id: 1, startDate: checkIn.split('T')[0], endDate: checkOut.split('T')[0], unit: currentLodging || '' }
  ]);

  const availableUnits = MOCK_UNITS.filter(u => u.status === 'Active');

  const splitSegment = (index: number) => {
    const segment = segments[index];
    // Logic to split dates would go here. For UI demo, we just duplicate the row essentially
    const newSegment = { ...segment, id: Date.now(), startDate: segment.startDate, endDate: segment.endDate, unit: '' };
    const newSegments = [...segments];
    newSegments.splice(index + 1, 0, newSegment);
    setSegments(newSegments);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, field: string, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
    // In a real app, we'd consolidate this back to the parent
    onChange(newSegments[0].unit); // Simple prop up for now
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Room Assignments</h4>
        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => splitSegment(segments.length - 1)}>
          <Plus size={12}/> Split Stay
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 py-2 px-3">
          <div className="col-span-3">Start Date</div>
          <div className="col-span-1 flex justify-center"><ArrowRight size={12}/></div>
          <div className="col-span-3">End Date</div>
          <div className="col-span-4">Unit Assignment</div>
          <div className="col-span-1"></div>
        </div>
        
        {segments.map((seg, idx) => (
          <div key={seg.id} className="grid grid-cols-12 gap-2 p-2 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div className="col-span-3">
              <Input 
                type="date" 
                value={seg.startDate} 
                onChange={(e) => updateSegment(idx, 'startDate', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-1 flex justify-center text-slate-400">
              <ArrowRight size={14}/>
            </div>
            <div className="col-span-3">
              <Input 
                type="date" 
                value={seg.endDate} 
                onChange={(e) => updateSegment(idx, 'endDate', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-4">
              <Select 
                value={seg.unit} 
                onChange={(e) => updateSegment(idx, 'unit', e.target.value)}
                className="h-8 text-xs"
              >
                <option value="">Unassigned</option>
                {availableUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.size})</option>
                ))}
              </Select>
            </div>
            <div className="col-span-1 flex justify-center">
              {segments.length > 1 && (
                <button onClick={() => removeSegment(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-md flex items-center gap-2 border border-blue-100">
        <Clock size={14}/>
        <span>Total Duration: <strong>{Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</strong></span>
      </div>
    </div>
  );
};

export const ServiceManager = ({ 
  selectedServices, 
  onChange 
}: { 
  selectedServices: string[], 
  onChange: (services: string[]) => void 
}) => {
  const toggleService = (name: string) => {
    if (selectedServices.includes(name)) {
      onChange(selectedServices.filter(s => s !== name));
    } else {
      onChange([...selectedServices, name]);
    }
  };

  const categories = ['Grooming', 'Enrichment', 'Exercise', 'Health'];

  return (
    <div className="space-y-6">
      {categories.map(cat => {
        // Filter config items by cat in a real app, mocking for now based on existing list in modal
        const catItems = [
           { name: 'Exit Bath', price: 30, category: 'Grooming' },
           { name: 'Nail Trim', price: 15, category: 'Grooming' },
           { name: 'Nature Walk', price: 20, category: 'Exercise' },
           { name: 'Group Play', price: 15, category: 'Exercise' },
           { name: 'Treat Puzzle', price: 10, category: 'Enrichment' },
           { name: 'Bedtime Cuddle', price: 12, category: 'Enrichment' },
           { name: 'Medication Admin', price: 5, category: 'Health' },
        ].filter(i => i.category === cat);

        if (catItems.length === 0) return null;

        return (
          <div key={cat}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">{cat}</h4>
            <div className="grid grid-cols-1 gap-2">
              {catItems.map(item => {
                const isSelected = selectedServices.includes(item.name);
                return (
                  <div 
                    key={item.name} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                      isSelected ? "bg-primary-50 border-primary-200 ring-1 ring-primary-200" : "bg-white border-slate-200 hover:border-primary-300"
                    )}
                    onClick={() => toggleService(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-slate-300"
                      )}>
                        {isSelected && <Check size={12}/>}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select className="h-7 text-xs w-24 bg-white border-slate-300">
                          <option>Once</option>
                          <option>Daily</option>
                          <option>Every Other Day</option>
                        </Select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  );
};

// --- New Functionality Modals ---

export const CheckOutModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const reservation = MOCK_RESERVATIONS.find(r => r.id === id);
  const pet = MOCK_PETS.find(p => p.id === reservation?.petId);
  const owner = MOCK_OWNERS.find(o => o.id === reservation?.ownerId);

  // Mock balance check
  const balance = owner?.balance || 0;
  const isBalancePaid = balance <= 0;

  if (!reservation || !pet || !owner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Check Out" size="md">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-4">
           <div className="h-12 w-12 bg-white rounded-full border border-slate-200 overflow-hidden shrink-0">
              <img src={pet.photoUrl} className="w-full h-full object-cover" alt={pet.name} />
           </div>
           <div className="flex-1">
              <h3 className="font-bold text-slate-900">{pet.name}</h3>
              <p className="text-sm text-slate-500">{owner.name}</p>
              <div className="mt-2 text-xs flex items-center gap-3">
                 <span className="flex items-center gap-1"><Calendar size={12}/> In: {new Date(reservation.checkIn).toLocaleDateString()}</span>
                 <span className="flex items-center gap-1 text-amber-600"><LogOut size={12}/> Out: Today</span>
              </div>
           </div>
        </div>

        {/* Balance Check */}
        <div className={cn("p-4 rounded-lg border flex justify-between items-center", isBalancePaid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
           <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", isBalancePaid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                 <DollarSign size={20}/>
              </div>
              <div>
                 <div className={cn("font-bold", isBalancePaid ? "text-green-800" : "text-red-800")}>
                    {isBalancePaid ? "Balance Settled" : "Outstanding Balance"}
                 </div>
                 <div className="text-xs text-slate-600">
                    {isBalancePaid ? "All invoices paid." : `Client owes $${balance.toFixed(2)}`}
                 </div>
              </div>
           </div>
           {!isBalancePaid && (
              <Button size="sm" variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50">
                 <CreditCard size={14} className="mr-2"/> Take Payment
              </Button>
           )}
        </div>

        {/* Belongings Check */}
        <div>
           <Label>Items Returning Home</Label>
           <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2 p-2 border rounded-md hover:bg-slate-50 cursor-pointer">
                 <input type="checkbox" className="rounded border-slate-300 text-primary-600" />
                 <span className="text-sm text-slate-700">Medications Returned</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-md hover:bg-slate-50 cursor-pointer">
                 <input type="checkbox" className="rounded border-slate-300 text-primary-600" />
                 <span className="text-sm text-slate-700">Food / Treats Returned</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-md hover:bg-slate-50 cursor-pointer">
                 <input type="checkbox" className="rounded border-slate-300 text-primary-600" />
                 <span className="text-sm text-slate-700">Toys / Bedding ({reservation.notes ? 'See Notes' : 'None listed'})</span>
              </label>
           </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-100 mt-2">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button 
              onClick={() => { alert(`Checked out ${pet.name}!`); onClose(); }} 
              className={cn("gap-2", isBalancePaid ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700")}
           >
              <LogOut size={16}/> Confirm Check Out
           </Button>
        </div>
      </div>
    </Modal>
  );
};

export const QuickLodgingModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const reservation = MOCK_RESERVATIONS.find(r => r.id === id);
  const pet = MOCK_PETS.find(p => p.id === reservation?.petId);
  const [selectedUnit, setSelectedUnit] = useState(reservation?.lodging || '');

  const availableUnits = MOCK_UNITS.filter(u => u.status === 'Active');

  if (!reservation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Lodging Unit" size="sm">
       <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden">
                <img src={pet?.photoUrl} alt="" className="w-full h-full object-cover"/>
             </div>
             <div>
                <div className="font-bold text-slate-800">{pet?.name}</div>
                <div className="text-xs text-slate-500">Currently in: {reservation.lodging || 'Unassigned'}</div>
             </div>
          </div>

          <div>
             <Label>Move to Unit</Label>
             <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} autoFocus>
                <option value="">-- Unassigned --</option>
                {availableUnits.map(u => (
                   <option key={u.id} value={u.id}>
                      {u.name} ({u.size}) - {u.type}
                   </option>
                ))}
             </Select>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800 flex gap-2">
             <Info size={16} className="shrink-0"/>
             <span>This will update the unit for the remainder of the stay starting today.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
             <Button variant="ghost" onClick={onClose}>Cancel</Button>
             <Button onClick={() => { alert(`Moved ${pet?.name} to ${selectedUnit}`); onClose(); }}>Update Location</Button>
          </div>
       </div>
    </Modal>
  );
};

export const QuickTagModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const pet = MOCK_PETS.find(p => p.id === id);
  const [selectedTag, setSelectedTag] = useState('Note');
  const [note, setNote] = useState('');

  // Define available tags
  const TAG_OPTIONS = [
     'Meds', 'Aggressive', 'Separation Anxiety', 'VIP', 'Late Pickup', 'Trusted', 
     'Playgroup', 'Not Fixed', 'Special Diet', 'Puppy', 'Note'
  ];

  if (!pet) return null;

  const handleAdd = () => {
     // Logic to add tag would go here
     // We are simulating adding a tag string potentially with a note "Tag:Note"
     alert(`Added tag: ${selectedTag} with note: ${note}`);
     onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Tag/Note for ${pet.name}`} size="sm">
       <div className="space-y-4">
          <div>
             <Label>Tag Type</Label>
             <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {TAG_OPTIONS.map(tag => (
                   <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                         "px-3 py-2 text-xs font-medium rounded border text-left transition-all",
                         selectedTag === tag 
                            ? "bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                   >
                      {tag}
                   </button>
                ))}
             </div>
          </div>

          <div>
             <Label>Note (Optional)</Label>
             <Textarea 
                placeholder="e.g., Insulin 2x daily, Fear of storms..." 
                className="h-20"
                value={note}
                onChange={(e) => setNote(e.target.value)}
             />
             <div className="text-[10px] text-slate-400 mt-1 text-right">Visible on dashboard hover</div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
             <Button variant="ghost" onClick={onClose}>Cancel</Button>
             <Button onClick={handleAdd}>Save Tag</Button>
          </div>
       </div>
    </Modal>
  );
};

// --- Main Edit Modal ---

export const EditReservationModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const reservation = MOCK_RESERVATIONS.find(r => r.id === id);
  const pet = MOCK_PETS.find(p => p.id === reservation?.petId);
  const owner = MOCK_OWNERS.find(o => o.id === reservation?.ownerId);
  
  const [activeTab, setActiveTab] = useState('general');
  // Local state for edits
  const [checkIn, setCheckIn] = useState(reservation?.checkIn || '');
  const [checkOut, setCheckOut] = useState(reservation?.checkOut || '');
  const [lodging, setLodging] = useState(reservation?.lodging || '');
  const [services, setServices] = useState<string[]>(reservation?.services || []);

  if (!reservation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Reservation #${reservation.id}`} size="lg">
      <div className="flex flex-col h-[600px]">
        {/* Header Summary */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 border-b border-slate-200 -mx-6 -mt-6 mb-4">
           <div className="h-12 w-12 bg-white rounded-full border border-slate-200 p-1">
              <img src={pet?.photoUrl} className="w-full h-full object-cover rounded-full" alt={pet?.name} />
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               {pet?.name} <span className="text-slate-400 font-normal">({pet?.breed})</span>
             </h2>
             <div className="text-sm text-slate-500 flex items-center gap-2">
               <User size={12}/> {owner?.name} • <Badge variant="outline" className="bg-white">{reservation.type}</Badge>
             </div>
           </div>
           <div className="ml-auto flex gap-2">
              <Badge variant={reservation.status === 'Checked In' ? 'success' : 'default'} className="text-sm px-3 py-1">
                {reservation.status}
              </Badge>
           </div>
        </div>

        {/* Tabs */}
        <div className="-mx-6 px-6 border-b border-slate-200 mb-6">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={[
              { id: 'general', label: 'General' },
              { id: 'lodging', label: 'Lodging & Units' },
              { id: 'services', label: 'Services & Add-ons' },
              { id: 'financials', label: 'Financials' },
            ]}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Check In Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={checkIn} 
                    onChange={(e) => setCheckIn(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>Check Out Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={checkOut} 
                    onChange={(e) => setCheckOut(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select defaultValue={reservation.type}>
                    {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Reservation Status</Label>
                  <Select defaultValue={reservation.status}>
                    {Object.values(ReservationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <Label>Internal Notes</Label>
                <Textarea defaultValue={reservation.notes} placeholder="Special handling, belongings, etc..." className="h-32" />
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex gap-3">
                 <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                 <div>
                    <h4 className="font-bold text-yellow-800 text-sm">Pet Alerts</h4>
                    <div className="flex gap-2 mt-1 flex-wrap">
                       {pet?.alerts.map(a => <Badge key={a} variant="warning" className="bg-white">{a}</Badge>)}
                       <Badge variant={pet?.vaccineStatus === 'Valid' ? 'success' : 'danger'} className="bg-white">Vaccines: {pet?.vaccineStatus}</Badge>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'lodging' && (
            <LodgingManager 
              checkIn={checkIn} 
              checkOut={checkOut} 
              currentLodging={lodging}
              onChange={setLodging}
            />
          )}

          {activeTab === 'services' && (
            <ServiceManager 
              selectedServices={services} 
              onChange={setServices}
            />
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-800">Estimated Charges</h3>
                     <Badge variant="success">Paid: $0.00</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span>Boarding (5 nights @ $55)</span>
                        <span className="font-mono">$275.00</span>
                     </div>
                     {services.map(s => (
                        <div key={s} className="flex justify-between text-slate-600">
                           <span>{s}</span>
                           <span className="font-mono">$--.--</span>
                        </div>
                     ))}
                     <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                        <span>Total Due</span>
                        <span>$350.00</span>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full gap-2"><DollarSign size={16}/> View Full Invoice</Button>
                  <Button variant="outline" className="w-full gap-2"><DollarSign size={16}/> Take Deposit</Button>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
           <Button variant="danger" size="sm" className="gap-2"><Trash2 size={14}/> Cancel</Button>
           <div className="flex gap-2">
             <Button variant="ghost" onClick={onClose}>Close</Button>
             <Button onClick={() => { alert('Changes saved!'); onClose(); }} className="gap-2"><Check size={16}/> Save Changes</Button>
           </div>
        </div>
      </div>
    </Modal>
  );
};

// --- Re-export other modals with minor improvements ---

export const EditPetModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const pet = MOCK_PETS.find(p => p.id === id);
  if (!pet) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Pet: ${pet.name}`} size="lg">
       <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
             <img src={pet.photoUrl} className="h-16 w-16 rounded-full object-cover border border-slate-200" alt={pet.name} />
             <Button variant="outline" size="sm">Change Photo</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input defaultValue={pet.name}/></div>
            <div><Label>Breed</Label><Input defaultValue={pet.breed}/></div>
            <div><Label>Weight (lbs)</Label><Input type="number" defaultValue={pet.weight}/></div>
            <div><Label>Color</Label><Input defaultValue={pet.color}/></div>
            <div><Label>Gender</Label><Select defaultValue={pet.gender}><option value="M">Male</option><option value="F">Female</option></Select></div>
            <div><Label>Fixed</Label><Select defaultValue={pet.fixed ? 'Yes' : 'No'}><option value="Yes">Yes</option><option value="No">No</option></Select></div>
            <div><Label>Birth Date</Label><Input type="date" defaultValue={pet.dob.split('T')[0]}/></div>
            <div><Label>Microchip</Label><Input defaultValue={pet.microchip}/></div>
          </div>
          
          <div className="border-t border-slate-100 pt-4">
            <Label>Feeding Instructions</Label>
            <div className="relative mt-1">
               <Textarea defaultValue={pet.feedingInstructions} className="pr-24"/>
               <Button variant="ghost" size="sm" className="absolute right-2 top-2 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100" title="Format with AI">
                  <Sparkles size={14} className="mr-1"/> AI Format
               </Button>
            </div>
          </div>

          <div>
             <Label>Medical Alerts & Behavior</Label>
             <div className="flex gap-2 mb-2 flex-wrap">
                {['Aggressive', 'Meds', 'Separation Anxiety', 'Escape Artist'].map(tag => (
                   <label key={tag} className={cn("px-3 py-1 rounded-full border text-xs font-medium cursor-pointer transition-colors select-none", pet.alerts.includes(tag) ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300")}>
                      <input type="checkbox" className="hidden" defaultChecked={pet.alerts.includes(tag)} />
                      {tag}
                   </label>
                ))}
             </div>
             <Textarea defaultValue={pet.behaviorNotes} placeholder="Detailed notes..." />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
             <Button variant="ghost" onClick={onClose}>Cancel</Button>
             <Button onClick={() => { alert('Pet updated!'); onClose(); }}>Save Profile</Button>
          </div>
       </div>
    </Modal>
  );
};

export const EditOwnerModal = ({ isOpen, onClose, id }: BaseModalProps) => {
  const owner = MOCK_OWNERS.find(o => o.id === id);
  if (!owner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Owner: ${owner.name}`} size="lg">
       <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div><Label>Full Name</Label><Input defaultValue={owner.name}/></div>
             <div><Label>Email</Label><Input defaultValue={owner.email}/></div>
             <div><Label>Phone</Label><Input defaultValue={owner.phone}/></div>
             <div><Label>Alt. Phone</Label><Input placeholder="Work / Spouse"/></div>
             <div className="col-span-2"><Label>Address</Label><Input defaultValue={owner.address}/></div>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-100">
             <h4 className="font-bold text-sm text-slate-800 mb-3">Emergency Contact</h4>
             <div className="grid grid-cols-3 gap-3">
                <div><Label>Name</Label><Input defaultValue={owner.emergencyContact?.name}/></div>
                <div><Label>Relation</Label><Input defaultValue={owner.emergencyContact?.relation}/></div>
                <div><Label>Phone</Label><Input defaultValue={owner.emergencyContact?.phone}/></div>
             </div>
          </div>

          <div>
             <Label>Administrative Notes</Label>
             <Textarea defaultValue={owner.notes} className="h-20" placeholder="Gate codes, authorized pickups, etc."/>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
             <Button variant="ghost" onClick={onClose}>Cancel</Button>
             <Button onClick={() => { alert('Owner updated!'); onClose(); }}>Save Changes</Button>
          </div>
       </div>
    </Modal>
  );
};

export const AddServiceModal = ({ isOpen, onClose, id }: BaseModalProps) => {
   const reservation = MOCK_RESERVATIONS.find(r => r.id === id);
   const pet = MOCK_PETS.find(p => p.id === reservation?.petId);
   
   const [selectedServices, setSelectedServices] = useState<string[]>(reservation?.services || []);

   if (!reservation) return null;

   return (
     <Modal isOpen={isOpen} onClose={onClose} title="Manage Services & Add-ons" size="md">
        <div className="space-y-6">
           <div className="text-sm text-slate-600">
              Adding services for <span className="font-bold text-slate-900">{pet?.name}</span>'s {reservation.type} stay.
           </div>

           <ServiceManager selectedServices={selectedServices} onChange={setSelectedServices} />

           <div className="bg-slate-50 p-4 rounded flex justify-between items-center border border-slate-200">
               <span className="text-sm font-medium text-slate-600">Estimated Total Add-ons</span>
               <span className="text-lg font-bold text-slate-900">$45.00</span>
           </div>

           <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
             <Button variant="ghost" onClick={onClose}>Cancel</Button>
             <Button onClick={() => { alert('Services updated!'); onClose(); }}>Update Reservation</Button>
           </div>
        </div>
     </Modal>
   );
};
