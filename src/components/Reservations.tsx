
import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Plus, MoreHorizontal, Check, User, Dog, 
  ChevronLeft, ChevronRight, Clock, AlertCircle, Edit2, DollarSign, Trash2, 
  Mail, MessageSquare, Printer, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, Modal, Label, cn, SortableHeader, BulkActionBar } from './Common';
import { EditReservationModal, LodgingManager, ServiceManager } from './EditModals';
import { EstimateModal } from './EstimateModal';
import { ReservationStatus } from '../../shared/domain';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

export const Reservations = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc' | 'desc'}>({ key: 'date', dir: 'asc' });
  const [activeModal, setActiveModal] = useState<{ type: 'reservation' | 'estimate', id: string, estId?: string } | null>(null);
  
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Data Fetching
  const { data: reservations = [], refetch } = useApiQuery('reservations-list', 
    () => api.getReservations({ search: search !== '' ? search : undefined, status: filterStatus !== 'all' ? filterStatus : undefined }),
    [search, filterStatus]
  );
  
  // Load helpers
  const { data: pets = [] } = useApiQuery('res-list-pets', () => api.getPets());
  const { data: owners = [] } = useApiQuery('res-list-owners', () => api.getOwners());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeActionMenu && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeActionMenu]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-500">Manage bookings, requests, and waitlists.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Filter size={16} /> Filter</Button>
          <Button onClick={() => setIsNewModalOpen(true)} className="gap-2"><Plus size={16} /> New Reservation</Button>
        </div>
      </div>

      <Card className="flex flex-col">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by pet or owner..." 
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
            <option value="Requested">Requested</option>
            <option value="Confirmed">Confirmed</option>
            <option value="CheckedIn">Checked In</option>
            <option value="CheckedOut">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <SortableHeader label="Pet" sortKey="petName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Owner" sortKey="ownerName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Type" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Dates" sortKey="date" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                <th className="px-6 py-3 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map(res => {
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
                    
                    {/* Pet Column */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           {/* Placeholder avatar */}
                           <div className="text-xs font-bold text-slate-500">{pet?.name.charAt(0)}</div>
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
                         {owner?.firstName} {owner?.lastName}
                       </Link>
                       <div className="text-xs text-slate-500 mt-0.5">{owner?.phone}</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{res.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {new Date(res.startAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><ChevronRight size={12} /> {new Date(res.endAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Badge variant={
                        res.status === 'CheckedIn' ? 'success' : 
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
                            <div className="p-1 space-y-0.5">
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'estimate', id: res.id, estId: res.estimateId }); setActiveActionMenu(null); }}
                                >
                                    <DollarSign size={16} className="text-green-600"/> View Estimate
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                  onClick={() => { setActiveModal({ type: 'reservation', id: res.id }); setActiveActionMenu(null); }}
                                >
                                    <Edit2 size={16} className="text-slate-400"/> Edit Reservation
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
        
        <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} />
      </Card>

      <NewReservationModal isOpen={isNewModalOpen} onClose={() => { setIsNewModalOpen(false); refetch(); }} />

      {activeModal?.type === 'reservation' && (
        <EditReservationModal 
          isOpen={true} 
          onClose={() => { setActiveModal(null); refetch(); }} 
          id={activeModal.id} 
        />
      )}

      {activeModal?.type === 'estimate' && (
        <EstimateModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          reservationId={activeModal.id}
          estimateId={activeModal.estId}
        />
      )}
    </div>
  );
};

const NewReservationModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  // Simplified for now, just creating a stub to verify API
  const [petId, setPetId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  
  const { data: owners = [] } = useApiQuery('new-res-owners', () => api.getOwners());
  const { data: pets = [] } = useApiQuery('new-res-pets', () => api.getPets());

  const handleCreate = async () => {
    if (!petId || !ownerId || !startAt || !endAt) return;
    await api.createReservation({
      petId, ownerId, startAt: new Date(startAt).toISOString(), endAt: new Date(endAt).toISOString(), type: 'Boarding'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Reservation" size="md">
      <div className="space-y-4">
        <div>
          <Label>Owner</Label>
          <Select value={ownerId} onChange={e => setOwnerId(e.target.value)}>
            <option value="">Select Owner</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}
          </Select>
        </div>
        <div>
          <Label>Pet</Label>
          <Select value={petId} onChange={e => setPetId(e.target.value)}>
            <option value="">Select Pet</option>
            {pets.filter(p => !ownerId || p.ownerId === ownerId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Check In</Label><Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} /></div>
          <div><Label>Check Out</Label><Input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} /></div>
        </div>
        <Button className="w-full mt-4" onClick={handleCreate}>Create Reservation</Button>
      </div>
    </Modal>
  );
};
