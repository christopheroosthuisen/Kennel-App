
import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Plus, MoreHorizontal, Check, User, Dog, 
  ChevronLeft, ChevronRight, Clock, AlertCircle, Edit2, DollarSign, Trash2, 
  Mail, MessageSquare, Printer, FileText, LogOut, RefreshCw, XCircle, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, Modal, Label, cn, SortableHeader, BulkActionBar } from './Common';
import { EditReservationModal, EditPetModal, EditOwnerModal, AddServiceModal, LodgingManager, ServiceManager, CheckOutModal } from './EditModals';
import { RunCardModal } from './RunCard';
import { EstimateModal } from './EstimateModal';
import { useCommunication } from './Messaging';
import { useTeamChat } from './TeamChatContext';
import { MOCK_RESERVATIONS, MOCK_PETS, MOCK_OWNERS } from '../constants';
import { ReservationStatus, ServiceType } from '../types';

export const Reservations = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc' | 'desc'}>({ key: 'date', dir: 'asc' });
  
  // Edit Modals State
  const [activeModal, setActiveModal] = useState<{ type: 'reservation' | 'pet' | 'owner' | 'service' | 'checkout', id: string } | null>(null);
  
  // Run Card & Estimate State
  const [runCardReservationId, setRunCardReservationId] = useState<string | null>(null);
  const [estimateReservationId, setEstimateReservationId] = useState<string | null>(null);

  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const { openCompose } = useCommunication();
  const { openDiscuss } = useTeamChat();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeActionMenu && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeActionMenu]);

  const filteredReservations = MOCK_RESERVATIONS.filter(r => {
    const pet = MOCK_PETS.find(p => p.id === r.petId);
    const owner = MOCK_OWNERS.find(o => o.id === r.ownerId);
    const term = search.toLowerCase();
    
    const searchMatch = 
      r.id.toLowerCase().includes(term) ||
      pet?.name.toLowerCase().includes(term) || 
      owner?.name.toLowerCase().includes(term);
      
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCancelReservation = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation? This action cannot be undone.")) {
      // Logic to cancel would go here
      alert(`Reservation #${id} has been cancelled.`);
      setActiveActionMenu(null);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    alert(`Successfully updated ${selectedIds.length} reservations to '${status}'`);
    setIsBulkStatusOpen(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-500">Manage bookings, requests, and waitlists.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsFilterModalOpen(true)}><Filter size={16} /> Filter</Button>
          <Button onClick={() => setIsNewModalOpen(true)} className="gap-2"><Plus size={16} /> New Reservation</Button>
        </div>
      </div>

      <Card className="flex flex-col mb-20">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by ID, pet, or owner..." 
              className="pl-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select 
            className="w-40" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {Object.values(ReservationStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <SortableHeader label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Pet" sortKey="petName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Owner" sortKey="ownerName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Type" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Dates" sortKey="date" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                <th className="px-6 py-3 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map(res => {
                const pet = MOCK_PETS.find(p => p.id === res.petId);
                const owner = MOCK_OWNERS.find(o => o.id === res.ownerId);
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 cursor-pointer mt-1"
                        checked={selectedIds.includes(res.id)}
                        onChange={() => toggleSelect(res.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 align-top">#{res.id}</td>
                    
                    {/* Pet Column */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           <img src={pet?.photoUrl} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div>
                          <Link 
                            to={`/owners-pets?id=${pet?.id}&type=pets`} 
                            className="font-medium text-slate-900 hover:text-primary-600 hover:underline block"
                          >
                            {pet?.name}
                          </Link>
                          <span className="text-xs text-slate-500">{pet?.breed}</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner Column */}
                    <td className="px-6 py-4 align-top">
                       <Link 
                          to={`/owners-pets?id=${owner?.id}&type=owners`}
                          className="font-medium text-slate-900 hover:text-primary-600 hover:underline block"
                       >
                         {owner?.name}
                       </Link>
                       <div className="text-xs text-slate-500 mt-0.5">{owner?.phone}</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{res.type}</span>
                        {res.services.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                             {res.services.slice(0, 2).map(s => <Badge key={s} variant="outline" className="bg-white text-[10px] py-0">{s}</Badge>)}
                             {res.services.length > 2 && <span className="text-[10px] text-slate-400">+{res.services.length - 2} more</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {new Date(res.checkIn).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><ChevronRight size={12} /> {new Date(res.checkOut).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Badge variant={
                        res.status === 'Checked In' ? 'success' : 
                        res.status === 'Confirmed' ? 'info' : 
                        res.status === 'Cancelled' ? 'danger' : 'default'
                      }>
                        {res.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right align-top relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={cn("hover:bg-slate-100", activeActionMenu === res.id && "bg-slate-100 text-primary-600")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenu(activeActionMenu === res.id ? null : res.id);
                        }}
                      >
                          <MoreHorizontal size={16} />
                      </Button>
                      
                      {activeActionMenu === res.id && (
                         <div 
                            ref={actionMenuRef}
                            className="absolute right-10 top-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col text-left overflow-hidden"
                         >
                            <div className="p-2 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                               Actions
                               <span className="text-[10px] font-normal text-slate-400">#{res.id}</span>
                            </div>
                            <div className="p-1 space-y-0.5">
                               {res.status === ReservationStatus.CheckedIn && (
                                  <button 
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 rounded flex items-center gap-3 transition-colors text-slate-700"
                                    onClick={() => { setActiveModal({ type: 'checkout', id: res.id }); setActiveActionMenu(null); }}
                                  >
                                     <LogOut size={16} className="text-amber-500"/> 
                                     <span className="font-medium">Check Out</span>
                                  </button>
                               )}
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                   onClick={() => { setEstimateReservationId(res.id); setActiveActionMenu(null); }}
                                >
                                    <DollarSign size={16} className="text-slate-400"/> View Estimate
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'reservation', id: res.id }); setActiveActionMenu(null); }}
                                >
                                    <Edit2 size={16} className="text-slate-400"/> Edit Reservation
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'service', id: res.id }); setActiveActionMenu(null); }}
                                >
                                    <Plus size={16} className="text-slate-400"/> Add Service/Add-on
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setRunCardReservationId(res.id); setActiveActionMenu(null); }}
                                >
                                    <FileText size={16} className="text-slate-400"/> Run Card
                                </button>
                            </div>
                            <div className="h-px bg-slate-100 my-1"/>
                            <div className="p-1 space-y-0.5">
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { 
                                     openDiscuss({ 
                                        type: 'reservation', 
                                        id: res.id, 
                                        title: `Reservation #${res.id} - ${pet?.name}`, 
                                        subtitle: `Owner: ${owner?.name}` 
                                     });
                                     setActiveActionMenu(null); 
                                  }}
                                >
                                    <MessageCircle size={16} className="text-indigo-500"/> Discuss in Team Chat
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'pet', id: pet?.id || '' }); setActiveActionMenu(null); }}
                                >
                                    <Dog size={16} className="text-slate-400"/> Edit Pet
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'owner', id: owner?.id || '' }); setActiveActionMenu(null); }}
                                >
                                    <User size={16} className="text-slate-400"/> Edit Owner
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                   onClick={() => { 
                                      openCompose({ recipientId: owner?.id, recipientName: owner?.name, type: 'SMS', context: `Reservation #${res.id}` });
                                      setActiveActionMenu(null);
                                   }}
                                >
                                    <MessageSquare size={16} className="text-slate-400"/> Message Parent
                                </button>
                            </div>
                            <div className="h-px bg-slate-100 my-1"/>
                            <div className="p-1">
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded flex items-center gap-3 transition-colors"
                                  onClick={() => handleCancelReservation(res.id)}
                                >
                                    <Trash2 size={16}/> Cancel Reservation
                                </button>
                            </div>
                         </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <BulkActionBar 
           count={selectedIds.length} 
           onClear={() => setSelectedIds([])}
           actions={
              <>
                 <Button 
                    size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2" 
                    onClick={() => openCompose({ recipientName: `${selectedIds.length} Selected Owners`, type: 'Email' })}
                 >
                    <Mail size={14}/> Email Selected
                 </Button>
                 <Button 
                    size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2" 
                    onClick={() => openCompose({ recipientName: `${selectedIds.length} Selected Owners`, type: 'SMS' })}
                 >
                    <MessageSquare size={14}/> SMS Selected
                 </Button>
                 <div className="h-4 w-px bg-slate-700/50 mx-1"></div>
                 <Button 
                    size="sm" variant="ghost" className="text-blue-200 hover:bg-slate-800 hover:text-blue-100 gap-2"
                    onClick={() => setIsBulkStatusOpen(true)}
                 >
                    <RefreshCw size={14}/> Change Status
                 </Button>
              </>
           }
        />
      </Card>

      <NewReservationModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />

      {/* Advanced Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Advanced Filters" size="md">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Date Range Start</Label><Input type="date" /></div>
               <div><Label>Date Range End</Label><Input type="date" /></div>
            </div>
            <div>
               <Label>Service Type</Label>
               <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.values(ServiceType).map(t => (
                     <label key={t} className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" className="rounded border-slate-300 text-primary-600"/> {t}
                     </label>
                  ))}
               </div>
            </div>
            <div>
               <Label>Reservation Status</Label>
               <Select className="mt-1">
                  <option>All Statuses</option>
                  {Object.values(ReservationStatus).map(s => <option key={s}>{s}</option>)}
               </Select>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setIsFilterModalOpen(false)}>Clear All</Button>
               <Button onClick={() => setIsFilterModalOpen(false)}>Apply Filters</Button>
            </div>
         </div>
      </Modal>

      {/* Bulk Status Modal */}
      <Modal isOpen={isBulkStatusOpen} onClose={() => setIsBulkStatusOpen(false)} title="Bulk Status Change" size="sm">
         <div className="space-y-4">
            <p className="text-sm text-slate-600">
               Update status for <strong>{selectedIds.length}</strong> selected reservations.
            </p>
            <div>
               <Label>New Status</Label>
               <Select id="bulk-status-select" className="mt-1">
                  {Object.values(ReservationStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </Select>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={() => setIsBulkStatusOpen(false)}>Cancel</Button>
               <Button onClick={() => {
                  const select = document.getElementById('bulk-status-select') as HTMLSelectElement;
                  handleBulkStatusChange(select.value);
               }}>Update All</Button>
            </div>
         </div>
      </Modal>

      {/* Edit Modals */}
      {activeModal?.type === 'reservation' && (
        <EditReservationModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'pet' && (
        <EditPetModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'owner' && (
        <EditOwnerModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'service' && (
        <AddServiceModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'checkout' && (
        <CheckOutModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          id={activeModal.id} 
        />
      )}

      {/* Run Card Modal */}
      {runCardReservationId && (
        <RunCardModal 
          isOpen={true} 
          onClose={() => setRunCardReservationId(null)} 
          reservationId={runCardReservationId} 
        />
      )}

      {/* Estimate Modal */}
      {estimateReservationId && (
        <EstimateModal
          isOpen={true}
          onClose={() => setEstimateReservationId(null)}
          reservationId={estimateReservationId}
        />
      )}
    </div>
  );
};

const NewReservationModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  
  // State for modules
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [lodging, setLodging] = useState('');
  const [services, setServices] = useState<string[]>([]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Reservation" size="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {['Owner', 'Pet', 'Lodging', 'Services', 'Review'].map((label, i) => (
            <div key={label} className={cn("flex flex-col items-center gap-2 relative z-10", step > i + 1 ? "text-primary-600" : step === i + 1 ? "text-primary-700 font-bold" : "text-slate-400")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                step > i + 1 ? "bg-primary-600 text-white" : 
                step === i + 1 ? "bg-primary-600 text-white ring-4 ring-primary-100" : "bg-slate-100 text-slate-500"
              )}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className="text-xs">{label}</span>
            </div>
          ))}
          {/* Progress Bar Line */}
          <div className="absolute left-0 right-0 top-9 h-0.5 bg-slate-100 -z-0 mx-10" />
        </div>
      </div>

      <div className="min-h-[300px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label>Select Owner</Label>
            <Select onChange={(e) => setSelectedOwner(e.target.value)} value={selectedOwner}>
              <option value="">-- Choose Owner --</option>
              {MOCK_OWNERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
            <div className="flex justify-end mt-4">
              <Button onClick={nextStep} disabled={!selectedOwner}>Next</Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label>Select Pet</Label>
            <Select onChange={(e) => setSelectedPet(e.target.value)} value={selectedPet}>
              <option value="">-- Choose Pet --</option>
              {MOCK_PETS.filter(p => p.ownerId === selectedOwner).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!selectedPet}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-2 gap-4">
               <div><Label>Check In</Label><Input type="datetime-local" onChange={e => setDates({...dates, checkIn: e.target.value})} /></div>
               <div><Label>Check Out</Label><Input type="datetime-local" onChange={e => setDates({...dates, checkOut: e.target.value})} /></div>
             </div>
             <LodgingManager checkIn={dates.checkIn} checkOut={dates.checkOut} currentLodging={lodging} onChange={setLodging} />
             <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </div>
        )}

        {step === 4 && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <ServiceManager selectedServices={services} onChange={setServices} />
              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
           </div>
        )}

        {step === 5 && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Ready to Book!</h3>
              <p className="text-slate-500">Confirm details for {MOCK_PETS.find(p=>p.id===selectedPet)?.name}</p>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">Confirm Booking</Button>
              </div>
           </div>
        )}
      </div>
    </Modal>
  );
};
