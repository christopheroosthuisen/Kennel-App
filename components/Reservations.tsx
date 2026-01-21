import React, { useState, useRef } from 'react';
import { 
  Calendar, Filter, Plus, MoreHorizontal, User, Dog, 
  ChevronRight, Edit2, DollarSign, Trash2, 
  Mail, FileText, LogOut, RefreshCw, MessageCircle, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Select, Badge, Modal, Label, cn, SortableHeader, BulkActionBar, SearchInput, useClickOutside, Input } from './Common';
import { EditReservationModal, EditPetModal, EditOwnerModal, AddServiceModal, LodgingManager, ServiceManager, CheckOutModal, NewReservationModal } from './EditModals';
import { RunCardModal } from './RunCard';
import { EstimateModal } from './EstimateModal';
import { useCommunication } from './Messaging';
import { useTeamChat } from './TeamChatContext';
import { useData } from './DataContext';
import { ReservationStatus, ServiceType } from '../types';

export const Reservations = () => {
  const { reservations, pets, owners, addReservation, updateReservation, deleteReservation } = useData();
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
  
  // Use custom hook
  useClickOutside(actionMenuRef, () => setActiveActionMenu(null));

  const filteredReservations = reservations.filter(r => {
    const pet = pets.find(p => p.id === r.petId);
    const owner = owners.find(o => o.id === r.ownerId);
    const term = search.toLowerCase();
    
    const searchMatch = 
      r.id.toLowerCase().includes(term) ||
      pet?.name.toLowerCase().includes(term) || 
      owner?.name.toLowerCase().includes(term);
      
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const petA = pets.find(p => p.id === a.petId);
    const petB = pets.find(p => p.id === b.petId);
    const ownerA = owners.find(o => o.id === a.ownerId);
    const ownerB = owners.find(o => o.id === b.ownerId);

    let valA: any = '';
    let valB: any = '';

    switch (sortConfig.key) {
      case 'id': valA = a.id; valB = b.id; break;
      case 'petName': valA = petA?.name || ''; valB = petB?.name || ''; break;
      case 'ownerName': valA = ownerA?.name || ''; valB = ownerB?.name || ''; break;
      case 'type': valA = a.type; valB = b.type; break;
      case 'date': valA = new Date(a.checkIn).getTime(); valB = new Date(b.checkIn).getTime(); break;
      case 'status': valA = a.status; valB = b.status; break;
      default: return 0;
    }

    if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
    return 0;
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
      deleteReservation(id);
      setActiveActionMenu(null);
    }
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
          <div className="flex-1 max-w-md">
            <SearchInput 
              placeholder="Search by ID, pet, or owner..." 
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
              {sortedReservations.map(res => {
                const pet = pets.find(p => p.id === res.petId);
                const owner = owners.find(o => o.id === res.ownerId);
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
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           <img src={pet?.photoUrl} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div>
                          <Link to={`/owners-pets?id=${pet?.id}&type=pets`} className="font-medium text-slate-900 hover:text-primary-600 hover:underline block">{pet?.name}</Link>
                          <span className="text-xs text-slate-500">{pet?.breed}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                       <Link to={`/owners-pets?id=${owner?.id}&type=owners`} className="font-medium text-slate-900 hover:text-primary-600 hover:underline block">{owner?.name}</Link>
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
                      <Badge variant={res.status === 'Checked In' ? 'success' : res.status === 'Confirmed' ? 'info' : res.status === 'Cancelled' ? 'danger' : 'default'}>{res.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right align-top relative">
                      <Button variant="ghost" size="icon" className={cn("hover:bg-slate-100", activeActionMenu === res.id && "bg-slate-100 text-primary-600")} onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === res.id ? null : res.id); }}>
                          <MoreHorizontal size={16} />
                      </Button>
                      {activeActionMenu === res.id && (
                         <div ref={actionMenuRef} className="absolute right-10 top-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col text-left overflow-hidden">
                            <div className="p-2 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">Actions <span className="text-[10px] font-normal text-slate-400">#{res.id}</span></div>
                            <div className="p-1 space-y-0.5">
                               {res.status === ReservationStatus.CheckedIn && <button className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 rounded flex items-center gap-3 transition-colors text-slate-700" onClick={() => { setActiveModal({ type: 'checkout', id: res.id }); setActiveActionMenu(null); }}><LogOut size={16} className="text-amber-500"/><span className="font-medium">Check Out</span></button>}
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setEstimateReservationId(res.id); setActiveActionMenu(null); }}><DollarSign size={16} className="text-slate-400"/> View Estimate</button>
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setActiveModal({ type: 'reservation', id: res.id }); setActiveActionMenu(null); }}><Edit2 size={16} className="text-slate-400"/> Edit Reservation</button>
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setActiveModal({ type: 'service', id: res.id }); setActiveActionMenu(null); }}><Plus size={16} className="text-slate-400"/> Add Service</button>
                            </div>
                            <div className="h-px bg-slate-100 my-1"/>
                            <div className="p-1"><button className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded flex items-center gap-3 transition-colors" onClick={() => handleCancelReservation(res.id)}><Trash2 size={16}/> Cancel</button></div>
                         </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} actions={<><Button size="sm" variant="ghost" className="text-blue-200 hover:bg-slate-800 hover:text-blue-100 gap-2" onClick={() => setIsBulkStatusOpen(true)}><RefreshCw size={14}/> Change Status</Button></>}/>
      </Card>

      <NewReservationModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      {/* Filters & Bulk Status Modals omitted for brevity - logic would use same patterns */}
      
      {/* Edit Modals */}
      {activeModal?.type === 'reservation' && <EditReservationModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'pet' && <EditPetModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'owner' && <EditOwnerModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'service' && <AddServiceModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'checkout' && <CheckOutModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {runCardReservationId && <RunCardModal isOpen={true} onClose={() => setRunCardReservationId(null)} reservationId={runCardReservationId} />}
      {estimateReservationId && <EstimateModal isOpen={true} onClose={() => setEstimateReservationId(null)} reservationId={estimateReservationId} />}
    </div>
  );
};