
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, CheckCircle, Clock, AlertTriangle, 
  MoreHorizontal, Plus, LogIn, LogOut, Printer, Filter, Search, Check, ThumbsUp, ThumbsDown,
  Settings, MessageSquare, CreditCard, Edit2, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical,
  FileText, Syringe, Shield, DollarSign, Mail, Phone, ExternalLink, Trash2, Utensils, Dog, User, 
  Scissors, Zap, Link as LinkIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, cn, Modal, Label, Input, Select, BulkActionBar } from './Common';
import { EditReservationModal, EditPetModal, EditOwnerModal, AddServiceModal } from './EditModals';
import { RunCardModal } from './RunCard';
import { ReservationStatus } from '../../shared/domain';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

type ColumnId = 'select' | 'pet' | 'owner' | 'service' | 'timeline' | 'details' | 'balance' | 'actions';

interface ColumnDef {
  id: ColumnId;
  label: string;
  visible: boolean;
}

// Configuration for icons/tags associated with pets and owners
const ICON_MAP: Record<string, { icon: React.ReactNode, color: string, title: string, border?: string }> = {
  'Meds': { icon: '💊', color: 'bg-red-50 text-red-700', border: 'border-red-200', title: 'Has Medications' },
  'Aggressive': { icon: '🛑', color: 'bg-red-100 text-red-800', border: 'border-red-300', title: 'Aggressive / Caution' },
  'Separation Anxiety': { icon: '🥺', color: 'bg-orange-50 text-orange-700', border: 'border-orange-200', title: 'Separation Anxiety' },
  'VIP': { icon: '👑', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200', title: 'VIP Client' },
  'Late Pickup': { icon: <Clock size={12}/>, color: 'bg-blue-50 text-blue-700', border: 'border-blue-200', title: 'History of Late Pickups' },
  'Trusted': { icon: <Shield size={12}/>, color: 'bg-green-50 text-green-700', border: 'border-green-200', title: 'Trusted Client' },
  'Playgroup': { icon: '🎾', color: 'bg-green-50 text-green-700', border: 'border-green-200', title: 'Playgroup Approved' },
  'Not Fixed': { icon: '⚠️', color: 'bg-amber-50 text-amber-700', border: 'border-amber-200', title: 'Intact' },
  'Special Diet': { icon: <Utensils size={12}/>, color: 'bg-orange-50 text-orange-700', border: 'border-orange-200', title: 'Special Diet' },
  'Puppy': { icon: '🐾', color: 'bg-pink-50 text-pink-700', border: 'border-pink-200', title: 'Puppy' },
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'notices' | 'expected' | 'going_home' | 'checked_in' | 'unconfirmed'>('checked_in');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  
  // Edit Modals State
  const [activeModal, setActiveModal] = useState<{ type: 'reservation' | 'pet' | 'owner' | 'service', id: string } | null>(null);
  
  // Run Card State
  const [runCardReservationId, setRunCardReservationId] = useState<string | null>(null);

  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // API Query
  const { data: reservations = [], refetch: refetchReservations } = useApiQuery('dashboard-reservations', 
    () => api.getReservations({}) // Load all for now
  );
  
  const { data: owners = [] } = useApiQuery('dashboard-owners', () => api.getOwners());
  const { data: pets = [] } = useApiQuery('dashboard-pets', () => api.getPets());

  // Default Columns Configuration
  const [columns, setColumns] = useState<ColumnDef[]>([
    { id: 'select', label: '', visible: true },
    { id: 'pet', label: 'Pet & Tags', visible: true },
    { id: 'owner', label: 'Owner', visible: true },
    { id: 'service', label: 'Service', visible: true },
    { id: 'timeline', label: 'Timeline', visible: true },
    { id: 'details', label: 'Details', visible: true },
    { id: 'balance', label: 'Balance', visible: true },
    { id: 'actions', label: 'Actions', visible: true },
  ]);

  const navigate = useNavigate();

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

  // Filtering Logic
  const getReservationsByTab = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch(activeTab) {
      case 'checked_in': 
        return reservations.filter(r => r.status === 'CheckedIn');
      case 'expected': 
        return reservations.filter(r => 
          (r.status === 'Requested' || r.status === 'Confirmed') && 
          r.startAt.startsWith(today)
        );
      case 'going_home': 
        return reservations.filter(r => 
          r.status === 'CheckedIn' && 
          r.endAt.startsWith(today)
        );
      case 'unconfirmed': 
        return reservations.filter(r => r.status === 'Requested');
      default: return [];
    }
  };

  const currentList = getReservationsByTab();

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newCols = [...columns];
    if (direction === 'up' && index > 0) {
      [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]];
    } else if (direction === 'down' && index < newCols.length - 1) {
      [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
    }
    setColumns(newCols);
  };

  const toggleColumnVisibility = (id: ColumnId) => {
    setColumns(prev => prev.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
  };

  const handleStatusAction = async (id: string, action: 'confirm' | 'check-in' | 'check-out') => {
    try {
      if (action === 'confirm') await api.confirmReservation(id);
      if (action === 'check-in') await api.checkInReservation(id);
      if (action === 'check-out') await api.checkOutReservation(id);
      refetchReservations();
      setActiveActionMenu(null);
    } catch (e) {
      alert('Action failed');
    }
  };

  const renderIcons = (pet: any, owner: any) => {
    if (!pet || !owner) return null;
    const tags = [...(pet.tags || []), ...(owner.tags || [])]; 
    if (!pet.fixed) tags.push('Not Fixed');
    
    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {pet.vaccineStatus === 'Valid' && (
           <div title="Vaccines Valid" className="h-5 w-5 flex items-center justify-center bg-green-50 text-green-600 rounded border border-green-200 cursor-help transition-transform hover:scale-110"><CheckCircle size={12}/></div>
        )}
        {pet.vaccineStatus === 'Expiring' && (
           <div title="Vaccines Expiring Soon" className="h-5 w-5 flex items-center justify-center bg-yellow-50 text-yellow-600 rounded border border-yellow-200 cursor-help transition-transform hover:scale-110"><Clock size={12}/></div>
        )}
        {pet.vaccineStatus === 'Expired' && (
           <div title="Vaccines Expired" className="h-5 w-5 flex items-center justify-center bg-red-50 text-red-600 rounded border border-red-200 cursor-help transition-transform hover:scale-110"><AlertTriangle size={12}/></div>
        )}

        {tags.map((tag, idx) => {
          const config = ICON_MAP[tag];
          if (!config) return null;
          return (
             <div key={`${tag}-${idx}`} title={config.title} className={cn("h-5 w-5 flex items-center justify-center rounded border cursor-help text-xs font-normal transition-transform hover:scale-110", config.color, config.border || 'border-transparent')}>
                {config.icon}
             </div>
          );
        })}
      </div>
    );
  };

  const StatWidget = ({ title, count, icon: Icon, color, subtext }: { title: string, count: number, icon: any, color: string, subtext?: string }) => (
    <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: color }}>
       <div className="flex justify-between items-start">
         <div>
           <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
           <h3 className="text-2xl font-bold text-slate-800 mt-1">{count}</h3>
         </div>
         <div className="p-2 rounded-full bg-slate-50">
           <Icon size={20} className="text-slate-400" />
         </div>
       </div>
       {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </Card>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Top Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Primary Action Widget */}
        <div className="lg:col-span-1 flex flex-col gap-2">
           <Button 
             className="h-full flex flex-col items-center justify-center gap-2 py-4 shadow-md bg-primary-600 hover:bg-primary-700 border-none group"
             onClick={() => setIsCheckInOpen(true)}
           >
              <LogIn size={28} className="group-hover:scale-110 transition-transform"/>
              <span className="text-lg font-bold">Quick Check-In</span>
           </Button>
        </div>
        
        <StatWidget 
          title="In House" 
          count={reservations.filter(r => r.status === 'CheckedIn').length} 
          icon={Users} 
          color="#3b82f6" 
          subtext="Total checked in" 
        />
        <StatWidget 
          title="Arriving" 
          count={reservations.filter(r => (r.status === 'Confirmed' || r.status === 'Requested') && r.startAt.startsWith(new Date().toISOString().split('T')[0])).length} 
          icon={Calendar} 
          color="#eab308" 
          subtext="Expected today" 
        />
        <StatWidget 
          title="Departing" 
          count={reservations.filter(r => r.status === 'CheckedIn' && r.endAt.startsWith(new Date().toISOString().split('T')[0])).length} 
          icon={LogOut} 
          color="#22c55e" 
          subtext="Going home today" 
        />
        
        {/* Weather/Shortcuts */}
        <Card className="p-4 flex flex-col gap-2 justify-center bg-gradient-to-br from-indigo-50 to-white">
           <div className="flex items-center gap-3">
              <div className="text-3xl">☀️</div>
              <div>
                <div className="font-bold text-slate-800">72°F</div>
                <div className="text-xs text-slate-500">Sunny, Clear</div>
              </div>
           </div>
           <div className="h-px bg-indigo-100 my-1"></div>
           <div className="flex gap-2">
             <Button size="sm" variant="outline" className="text-xs w-full bg-white hover:bg-indigo-50" onClick={() => navigate('/report-cards')}>Run Cards</Button>
             <Button size="sm" variant="outline" className="text-xs w-full bg-white hover:bg-indigo-50" onClick={() => navigate('/calendar')}>Facility Map</Button>
           </div>
        </Card>
      </div>

      {/* Main Tabbed Content */}
      <Card className="overflow-visible border shadow-sm flex flex-col min-h-[500px]">
         {/* Tabs Header */}
         <div className="border-b border-slate-200 bg-white px-4 pt-4 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
            <div className="flex space-x-6 overflow-x-auto no-scrollbar">
              {[
                { id: 'notices', label: 'Notices', count: 0, color: 'text-red-600 bg-red-50' },
                { id: 'expected', label: 'Expected', count: reservations.filter(r => (r.status === 'Requested' || r.status === 'Confirmed') && r.startAt.startsWith(new Date().toISOString().split('T')[0])).length },
                { id: 'going_home', label: 'Going Home', count: reservations.filter(r => r.status === 'CheckedIn' && r.endAt.startsWith(new Date().toISOString().split('T')[0])).length },
                { id: 'checked_in', label: 'Checked In', count: reservations.filter(r => r.status === 'CheckedIn').length },
                { id: 'unconfirmed', label: 'Unconfirmed', count: reservations.filter(r => r.status === 'Requested').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedIds([]); }}
                  className={cn(
                    "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "border-primary-600 text-primary-600" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                       tab.color ? tab.color : (activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-600")
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="pb-2 hidden md:flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   placeholder="Filter list..." 
                   className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 outline-none w-48 transition-all focus:w-64"
                 />
               </div>
               <Button variant="outline" size="sm" className="h-8 gap-2">
                 <Filter size={14} />
                 Filters
               </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600" onClick={() => setIsColumnConfigOpen(true)} title="Configure Columns">
                 <Settings size={16} />
               </Button>
            </div>
         </div>

         {/* Tab Content */}
         <div className="flex-1 bg-white">
            {activeTab === 'notices' ? (
              <div className="p-8 text-center text-slate-500">
                <div className="max-w-md mx-auto space-y-4 text-left">
                   <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/10">
                      <div className="flex items-start gap-3">
                         <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                         <div>
                           <h4 className="font-bold text-red-900 text-sm">Staff Meeting Today</h4>
                           <p className="text-sm text-red-800 mt-1">All hands meeting at 2:00 PM in the break room. Pizza provided.</p>
                           <p className="text-xs text-red-600 mt-2 font-medium">Posted by Sarah J. • 1 hour ago</p>
                         </div>
                      </div>
                   </Card>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-20 text-xs font-semibold text-slate-500 uppercase tracking-wider shadow-sm">
                  <tr>
                    {columns.filter(c => c.visible).map(col => {
                      if (col.id === 'select') {
                        return (
                          <th key={col.id} className="px-6 py-3 border-b border-slate-200 w-12 bg-slate-50">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </th>
                        );
                      }
                      if (col.id === 'actions') {
                        return <th key={col.id} className="px-6 py-3 border-b border-slate-200 text-right bg-slate-50 w-24">{col.label}</th>;
                      }
                      return (
                        <th key={col.id} className="px-6 py-3 border-b border-slate-200 bg-slate-50">
                          {col.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentList.length > 0 ? currentList.map((res) => {
                    const pet = pets.find(p => p.id === res.petId);
                    const owner = owners.find(o => o.id === res.ownerId);
                    
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors group">
                        {columns.filter(c => c.visible).map(col => {
                          switch (col.id) {
                            case 'select':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 cursor-pointer mt-1" 
                                    checked={selectedIds.includes(res.id)}
                                    onChange={() => toggleSelect(res.id)}
                                  />
                                </td>
                              );
                            case 'pet':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <Link 
                                    to={`/owners-pets?id=${pet?.id}&type=pets`}
                                    className="font-bold text-slate-800 flex items-center gap-2 hover:text-primary-600 hover:underline text-base"
                                  >
                                    {pet?.name}
                                    {pet?.gender === 'M' ? <span className="text-blue-400 text-xs font-normal opacity-70">♂</span> : <span className="text-pink-400 text-xs font-normal opacity-70">♀</span>}
                                    <span className="text-xs text-slate-400 font-normal">({pet?.breed})</span>
                                  </Link>
                                  {/* Enhanced Visual Icons */}
                                  {renderIcons(pet, owner)}
                                </td>
                              );
                            case 'owner':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <Link 
                                    to={`/owners-pets?id=${owner?.id}&type=owners`}
                                    className="font-medium text-slate-900 hover:text-primary-600 hover:underline block"
                                  >
                                    {owner?.firstName} {owner?.lastName}
                                  </Link>
                                  <div className="flex gap-2 mt-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-primary-600 hover:bg-slate-100" title="Copy Email">
                                      <Mail size={12}/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-primary-600 hover:bg-slate-100" title="Copy Phone">
                                      <Phone size={12}/>
                                    </Button>
                                  </div>
                                </td>
                              );
                            case 'service':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <div className="font-semibold text-slate-800">{res.type}</div>
                                </td>
                              );
                            case 'timeline':
                              return (
                                <td key={col.id} className="px-6 py-4 text-sm text-slate-600 align-top">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                       <Badge variant="outline" className="text-[9px] w-12 justify-center bg-slate-50">Start</Badge>
                                       <span className="font-medium text-xs">{new Date(res.startAt).toLocaleDateString()}</span>
                                       <span className="text-xs text-slate-400">{new Date(res.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Badge variant="outline" className="text-[9px] w-12 justify-center bg-slate-50">End</Badge>
                                       <span className="font-medium text-xs">{new Date(res.endAt).toLocaleDateString()}</span>
                                       <span className="text-xs text-slate-400">{new Date(res.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                  </div>
                                </td>
                              );
                            case 'details':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap gap-1">
                                       {res.isPreChecked && <Badge variant="success" className="gap-1"><CheckCircle size={8}/> Pre-Checked</Badge>}
                                       {!res.isPreChecked && <span className="text-xs text-slate-300 italic">None</span>}
                                    </div>
                                  </div>
                                </td>
                              );
                            case 'balance':
                              return (
                                <td key={col.id} className="px-6 py-4 align-top">
                                  <span className={cn("text-xs font-bold px-2 py-1 rounded border", (owner?.balance || 0) > 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100")}>
                                    ${((owner?.balance || 0) / 100).toFixed(2)}
                                  </span>
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={col.id} className="px-6 py-4 text-right align-top relative">
                                   <div>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className={cn("h-8 w-8 hover:bg-slate-100 transition-colors", activeActionMenu === res.id && "bg-slate-100 text-primary-600 ring-2 ring-primary-100")}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveActionMenu(activeActionMenu === res.id ? null : res.id);
                                        }}
                                      >
                                         <MoreHorizontal size={16} />
                                      </Button>

                                      {/* Dropdown Menu */}
                                      {activeActionMenu === res.id && (
                                         <div 
                                            ref={actionMenuRef}
                                            className="absolute right-10 top-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden flex flex-col"
                                          >
                                            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                               <div className="text-xs font-bold text-slate-500 uppercase">Reservation</div>
                                               <Badge variant="outline" className="bg-white text-[10px]">{res.status}</Badge>
                                            </div>
                                            
                                            <div className="p-1 space-y-0.5">
                                               {(res.status === 'Requested' || res.status === 'Confirmed') && (
                                                 <button 
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 rounded flex items-center gap-3 transition-colors text-slate-700"
                                                    onClick={() => handleStatusAction(res.id, res.status === 'Requested' ? 'confirm' : 'check-in')}
                                                 >
                                                    <LogIn size={16} className="text-green-500"/> 
                                                    <span className="font-medium">{res.status === 'Requested' ? 'Confirm' : 'Check In'}</span>
                                                 </button>
                                               )}
                                               {res.status === 'CheckedIn' && (
                                                  <button 
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 rounded flex items-center gap-3 transition-colors text-slate-700"
                                                    onClick={() => handleStatusAction(res.id, 'check-out')}
                                                  >
                                                     <LogOut size={16} className="text-amber-500"/> 
                                                     <span className="font-medium">Check Out</span>
                                                  </button>
                                               )}
                                               
                                               <button 
                                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700"
                                                  onClick={() => { setActiveModal({ type: 'reservation', id: res.id }); setActiveActionMenu(null); }}
                                               >
                                                  <Edit2 size={16} className="text-slate-400"/> Edit Details
                                               </button>
                                               <button 
                                                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700 transition-colors"
                                                  onClick={() => { setRunCardReservationId(res.id); setActiveActionMenu(null); }}
                                                >
                                                    <FileText size={16} className="text-slate-400"/> Run Card
                                                </button>
                                            </div>
                                         </div>
                                      )}
                                   </div>
                                </td>
                              );
                            default:
                              return <td key={col.id}></td>;
                          }
                        })}
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={columns.filter(c => c.visible).length} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <Calendar className="text-slate-300" size={24} />
                          </div>
                          <p>No reservations found in this view.</p>
                          <Button size="sm" variant="outline">Clear Filters</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
         </div>
         
         <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} />
      </Card>

      {/* Quick Check-In Modal */}
      <Modal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} title="Quick Check-In" size="md">
         <div className="space-y-4">
            <div>
              <Label>Search Expected Pets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input placeholder="Type pet name..." className="pl-9" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
               {reservations.filter(r => r.status === 'Confirmed' && r.startAt.startsWith(new Date().toISOString().split('T')[0])).map(r => {
                 const pet = pets.find(p => p.id === r.petId);
                 return (
                   <div key={r.id} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{pet?.name[0]}</div>
                         <span className="font-medium text-slate-800">{pet?.name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleStatusAction(r.id, 'check-in')}>Check In</Button>
                   </div>
                 )
               })}
            </div>
         </div>
      </Modal>

      {/* Edit Modals */}
      {activeModal?.type === 'reservation' && (
        <EditReservationModal 
          isOpen={true} 
          onClose={() => { setActiveModal(null); refetchReservations(); }} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'pet' && (
        <EditPetModal 
          isOpen={true} 
          onClose={() => { setActiveModal(null); /* refetchPets() in future */ }} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'owner' && (
        <EditOwnerModal 
          isOpen={true} 
          onClose={() => { setActiveModal(null); /* refetchOwners() in future */ }} 
          id={activeModal.id} 
        />
      )}
      {activeModal?.type === 'service' && (
        <AddServiceModal 
          isOpen={true} 
          onClose={() => { setActiveModal(null); refetchReservations(); }} 
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
    </div>
  );
};
