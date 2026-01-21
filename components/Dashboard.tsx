import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, CheckCircle, Clock, AlertTriangle, 
  MoreHorizontal, LogIn, LogOut, 
  Settings, Edit2, Eye, EyeOff,
  FileText, Shield, DollarSign, Mail, ExternalLink, Utensils, Dog, 
  Megaphone, CalendarPlus, FileBarChart, ClipboardList, Activity,
  ArrowUp, ArrowDown, Check, RefreshCw, ChevronUp, ChevronDown, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, cn, Modal, Label, Input, BulkActionBar, StatCard, SearchInput, useClickOutside, Select } from './Common';
import { EditReservationModal, EditPetModal, EditOwnerModal, AddServiceModal, CheckOutModal, QuickLodgingModal, QuickTagModal, LodgingManager, ServiceManager } from './EditModals';
import { RunCardModal } from './RunCard';
import { EstimateModal } from './EstimateModal';
import { useCommunication } from './Messaging';
import { ReservationStatus, ServiceType } from '../types';
import { useData } from './DataContext';

type ColumnId = 'select' | 'pet' | 'owner' | 'service' | 'timeline' | 'details' | 'balance' | 'actions';

interface ColumnDef {
  id: ColumnId;
  label: string;
  visible: boolean;
}

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
  'Note': { icon: <FileText size={12}/>, color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200', title: 'Note' },
};

export const Dashboard = () => {
  const { reservations, pets, owners, notifications, updateReservation } = useData();
  const [activeTab, setActiveTab] = useState<'notices' | 'expected' | 'going_home' | 'checked_in' | 'unconfirmed'>('checked_in');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [quickCheckInSearch, setQuickCheckInSearch] = useState('');
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  
  // Edit Modals State
  const [activeModal, setActiveModal] = useState<{ type: 'reservation' | 'pet' | 'owner' | 'service' | 'checkout' | 'lodging' | 'tag', id: string } | null>(null);
  
  const [runCardReservationId, setRunCardReservationId] = useState<string | null>(null);
  const [estimateReservationId, setEstimateReservationId] = useState<string | null>(null);

  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const { openCompose } = useCommunication();
  const navigate = useNavigate();

  // Use the new custom hook
  useClickOutside(actionMenuRef, () => setActiveActionMenu(null));

  // Default Columns
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

  const getReservationsByTab = () => {
    switch(activeTab) {
      case 'checked_in': return reservations.filter(r => r.status === ReservationStatus.CheckedIn);
      case 'expected': return reservations.filter(r => r.status === ReservationStatus.Expected);
      case 'going_home': return reservations.filter(r => r.status === ReservationStatus.CheckedOut);
      case 'unconfirmed': return reservations.filter(r => r.status === ReservationStatus.Unconfirmed);
      default: return [];
    }
  };

  const currentList = getReservationsByTab();

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleColumnVisibility = (id: ColumnId) => {
    setColumns(prev => prev.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      setColumns(newColumns);
    }
  };

  const handleCheckIn = (id: string) => {
    updateReservation(id, { status: ReservationStatus.CheckedIn });
    alert('Pet Checked In Successfully!');
    setIsCheckInOpen(false);
  };

  const renderIcons = (pet: any, owner: any) => {
    if (!pet || !owner) return null;
    const rawTags = [...(pet.alerts || []), ...(owner.tags || [])];
    if (!pet.fixed) rawTags.push('Not Fixed');
    if (pet.feedingInstructions && pet.feedingInstructions.length > 50) rawTags.push('Special Diet');

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
        {rawTags.map((tagString, idx) => {
          const [key, note] = tagString.includes(':') ? tagString.split(':') : [tagString, null];
          const config = ICON_MAP[key as keyof typeof ICON_MAP];
          if (!config) return null;
          const tooltip = note ? `${config.title}: ${note}` : config.title;
          return (
             <div key={`${tagString}-${idx}`} title={tooltip} className={cn("h-5 w-5 flex items-center justify-center rounded border cursor-help text-xs font-normal transition-transform hover:scale-110", config.color, config.border || 'border-transparent')}>
                {config.icon}
             </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-24 relative">
      {/* Top Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-2">
           <Button 
             className="h-full flex flex-col items-center justify-center gap-2 py-4 shadow-md bg-primary-600 hover:bg-primary-700 border-none group"
             onClick={() => setIsCheckInOpen(true)}
           >
              <LogIn size={28} className="group-hover:scale-110 transition-transform"/>
              <span className="text-lg font-bold">Quick Check-In</span>
           </Button>
        </div>
        <StatCard title="In House" count={reservations.filter(r=>r.status===ReservationStatus.CheckedIn).length} icon={Users} color="#3b82f6" subtext="Active Guests" />
        <StatCard title="Arriving" count={reservations.filter(r=>r.status===ReservationStatus.Expected).length} icon={Calendar} color="#eab308" subtext="Expected Today" />
        <StatCard title="Departing" count={reservations.filter(r=>r.status===ReservationStatus.CheckedOut).length} icon={LogOut} color="#22c55e" subtext="Checked Out" />
        
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

      {/* Main Content Area */}
      <div className="space-y-6">
         {/* Operational Shortcuts */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
               { title: "Send Blast", sub: "New SMS Campaign", icon: Megaphone, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-500", link: "/marketing?action=new-sms" },
               { title: "Add Shift", sub: "Manage Schedule", icon: CalendarPlus, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-500", link: "/team?action=add-shift" },
               { title: "EOD Report", sub: "Financial Summary", icon: FileBarChart, color: "text-green-600", bg: "bg-green-100", border: "border-green-500", link: "/reports?reportId=fin_eod" },
               { title: "Care Board", sub: "Log Feed/Meds", icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-500", link: "/care" },
            ].map((item, i) => (
               <Card 
                  key={i}
                  className={cn("p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-all group border-l-4", item.border)}
                  onClick={() => navigate(item.link)}
               >
                  <div className={cn("p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all", item.bg, item.color)}>
                     <item.icon size={18}/>
                  </div>
                  <div>
                     <div className="font-bold text-sm text-slate-800">{item.title}</div>
                     <div className="text-xs text-slate-500">{item.sub}</div>
                  </div>
               </Card>
            ))}
         </div>

         <Card className="overflow-visible border shadow-sm flex flex-col min-h-[500px]">
            {/* Tab Header */}
            <div className="border-b border-slate-200 bg-white px-4 pt-4 flex items-center justify-between sticky top-0 z-10 rounded-t-lg">
               <div className="flex space-x-6 overflow-x-auto no-scrollbar">
                 {[
                   { id: 'notices', label: 'Notices', count: 2, color: 'text-red-600 bg-red-50' },
                   { id: 'expected', label: 'Expected', count: reservations.filter(r=>r.status===ReservationStatus.Expected).length },
                   { id: 'going_home', label: 'Going Home', count: reservations.filter(r=>r.status===ReservationStatus.CheckedOut).length },
                   { id: 'checked_in', label: 'Checked In', count: reservations.filter(r=>r.status===ReservationStatus.CheckedIn).length },
                   { id: 'unconfirmed', label: 'Unconfirmed', count: reservations.filter(r=>r.status===ReservationStatus.Unconfirmed).length },
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary-600" onClick={() => setIsColumnConfigOpen(true)} title="Configure Columns">
                    <Settings size={16} />
                  </Button>
               </div>
            </div>

            {/* Table Content */}
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
                         if (col.id === 'select') return <th key={col.id} className="px-6 py-3 border-b border-slate-200 w-12 bg-slate-50"><input type="checkbox" className="rounded border-slate-300" /></th>;
                         if (col.id === 'actions') return <th key={col.id} className="px-6 py-3 border-b border-slate-200 text-right bg-slate-50 w-24">{col.label}</th>;
                         return <th key={col.id} className="px-6 py-3 border-b border-slate-200 bg-slate-50">{col.label}</th>;
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
                                 return <td key={col.id} className="px-6 py-4 align-top"><input type="checkbox" className="rounded border-slate-300 cursor-pointer mt-1" checked={selectedIds.includes(res.id)} onChange={() => toggleSelect(res.id)}/></td>;
                               case 'pet':
                                 return (
                                   <td key={col.id} className="px-6 py-4 align-top">
                                     <div className="flex items-center gap-2">
                                       <Link to={`/owners-pets?id=${pet?.id}&type=pets`} className="font-bold text-slate-800 hover:text-primary-600 hover:underline text-base">{pet?.name}</Link>
                                       <span className="text-xs text-slate-400 font-normal">({pet?.breed})</span>
                                     </div>
                                     {renderIcons(pet, owner)}
                                   </td>
                                 );
                               case 'owner':
                                 return (
                                   <td key={col.id} className="px-6 py-4 align-top">
                                     <Link to={`/owners-pets?id=${owner?.id}&type=owners`} className="font-medium text-slate-900 hover:text-primary-600 hover:underline block">{owner?.name}</Link>
                                   </td>
                                 );
                               case 'service':
                                 return <td key={col.id} className="px-6 py-4 align-top"><div className="font-semibold text-slate-800">{res.type}</div>{res.lodging && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ExternalLink size={10}/> {res.lodging}</div>}</td>;
                               case 'timeline':
                                 return <td key={col.id} className="px-6 py-4 text-sm text-slate-600 align-top"><div className="flex flex-col gap-1.5"><div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] w-12 justify-center bg-slate-50">Start</Badge><span className="font-medium text-xs">{new Date(res.checkIn).toLocaleDateString()}</span></div><div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] w-12 justify-center bg-slate-50">End</Badge><span className="font-medium text-xs">{new Date(res.checkOut).toLocaleDateString()}</span></div></div></td>;
                               case 'details':
                                 return <td key={col.id} className="px-6 py-4 align-top"><div className="flex flex-col gap-1"><div className="flex flex-wrap gap-1">{res.services.map(s => <Badge key={s} variant="outline" className="bg-white">{s}</Badge>)}{res.isPreChecked && <Badge variant="success" className="gap-1"><CheckCircle size={8}/> Pre-Checked</Badge>}</div></div></td>;
                               case 'balance':
                                 return <td key={col.id} className="px-6 py-4 align-top"><span className={cn("text-xs font-bold px-2 py-1 rounded border", (owner?.balance || 0) > 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100")}>${owner?.balance.toFixed(2)}</span></td>;
                               case 'actions':
                                 return (
                                   <td key={col.id} className="px-6 py-4 text-right align-top relative">
                                      <div>
                                         <Button size="icon" variant="ghost" className={cn("h-8 w-8 hover:bg-slate-100 transition-colors", activeActionMenu === res.id && "bg-slate-100 text-primary-600 ring-2 ring-primary-100")} onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === res.id ? null : res.id); }}><MoreHorizontal size={16} /></Button>
                                         {activeActionMenu === res.id && (
                                            <div ref={actionMenuRef} className="absolute right-10 top-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden flex flex-col text-left">
                                               <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><div className="text-xs font-bold text-slate-500 uppercase">Reservation #{res.id}</div><Badge variant="outline" className="bg-white text-[10px]">{res.status}</Badge></div>
                                               <div className="p-1 space-y-0.5">
                                                  {res.status === ReservationStatus.Expected && <button className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 rounded flex items-center gap-3 transition-colors text-slate-700" onClick={() => { updateReservation(res.id, { status: ReservationStatus.CheckedIn }); setActiveActionMenu(null); }}><LogIn size={16} className="text-green-500"/><span className="font-medium">Check In</span></button>}
                                                  {res.status === ReservationStatus.CheckedIn && <button className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 rounded flex items-center gap-3 transition-colors text-slate-700" onClick={() => { setActiveModal({ type: 'checkout', id: res.id }); setActiveActionMenu(null); }}><LogOut size={16} className="text-amber-500"/><span className="font-medium">Check Out</span></button>}
                                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setEstimateReservationId(res.id); setActiveActionMenu(null); }}><DollarSign size={16} className="text-slate-400"/> View Estimate</button>
                                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setRunCardReservationId(res.id); setActiveActionMenu(null); }}><FileText size={16} className="text-slate-400"/> Run Card</button>
                                               </div>
                                               <div className="h-px bg-slate-100 my-1"/>
                                               <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage</div>
                                               <div className="p-1 space-y-0.5">
                                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setActiveModal({ type: 'reservation', id: res.id }); setActiveActionMenu(null); }}><Edit2 size={16} className="text-slate-400"/> Edit Reservation</button>
                                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded flex items-center gap-3 text-slate-700" onClick={() => { setActiveModal({ type: 'pet', id: pet?.id || '' }); setActiveActionMenu(null); }}><Dog size={16} className="text-slate-400"/> Edit Pet</button>
                                               </div>
                                            </div>
                                         )}
                                      </div>
                                   </td>
                                 );
                               default: return <td key={col.id}></td>;
                             }
                           })}
                         </tr>
                       );
                     }) : (
                       <tr><td colSpan={columns.filter(c => c.visible).length} className="px-6 py-12 text-center text-slate-400">No reservations found in this view.</td></tr>
                     )}
                   </tbody>
                 </table>
               )}
            </div>
            <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} actions={<><Button size="sm" variant="ghost" className="text-blue-200 hover:bg-slate-800 hover:text-blue-100 gap-2" onClick={() => setIsBulkStatusOpen(true)}><RefreshCw size={14}/> Change Status</Button></>}/>
         </Card>
      </div>

      {/* Floating Live Activity Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end gap-3">
            {isActivityExpanded && (
                <Card className="w-80 max-h-[500px] flex flex-col bg-white shadow-2xl border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-lg">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <Activity size={16} className="text-primary-500"/> Live Activity
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200 rounded-full" onClick={() => setIsActivityExpanded(false)}>
                            <X size={14}/>
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5 p-0">
                        {notifications.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No recent activity</div>}
                        {notifications.slice(0, 10).map((note) => (
                            <div key={note.id} className="flex gap-3 p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-default">
                                <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", 
                                    note.type === 'success' ? 'bg-green-500' : 
                                    note.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                )}></div>
                                <div>
                                    <p className="text-slate-800 text-xs font-medium leading-tight mb-0.5">{note.title}</p>
                                    <span className="text-[10px] text-slate-400 block">{new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-lg">
                        <Link to="/notifications" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">View Full History</Link>
                    </div>
                </Card>
            )}

            <button 
                onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-3 shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
            >
                <div className="relative">
                    <Activity size={20} className="group-hover:text-primary-400 transition-colors"/>
                    {notifications.some(n=>!n.read) && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    )}
                </div>
                {!isActivityExpanded && (
                    <span className="font-bold text-sm pr-1">Activity</span>
                )}
                {isActivityExpanded ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
            </button>
        </div>
      </div>

      {/* Quick Check-In Modal */}
      <Modal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} title="Quick Check-In" size="md">
         <div className="space-y-4">
            <div>
              <Label>Search Expected Pets</Label>
              <SearchInput 
                value={quickCheckInSearch} 
                onChange={(e) => setQuickCheckInSearch(e.target.value)} 
                placeholder="Type pet name..."
              />
            </div>
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
               {reservations.filter(r => r.status === ReservationStatus.Expected && pets.find(p => p.id === r.petId)?.name.toLowerCase().includes(quickCheckInSearch.toLowerCase())).map(r => {
                 const pet = pets.find(p => p?.id === r.petId);
                 return (
                   <div key={r.id} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <img src={pet?.photoUrl} className="h-8 w-8 rounded-full" />
                         <span className="font-medium text-slate-800">{pet?.name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleCheckIn(r.id)}>Check In</Button>
                   </div>
                 )
               })}
            </div>
         </div>
      </Modal>

      {/* Column Config Modal */}
      <Modal isOpen={isColumnConfigOpen} onClose={() => setIsColumnConfigOpen(false)} title="Configure Columns" size="sm">
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-4">Toggle visibility and reorder columns for the dashboard table.</p>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {columns.map((col, index) => (
              <div key={col.id} className="flex items-center justify-between p-2 border border-slate-100 rounded bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5 text-slate-300 cursor-grab active:cursor-grabbing">
                    <button onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="hover:text-slate-600 disabled:opacity-30"><ArrowUp size={12}/></button>
                    <button onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1} className="hover:text-slate-600 disabled:opacity-30"><ArrowDown size={12}/></button>
                  </div>
                  <span className={cn("text-sm font-medium", !col.visible && "text-slate-400")}>{col.label || (col.id === 'select' ? 'Selection Checkbox' : col.id)}</span>
                </div>
                <button onClick={() => toggleColumnVisibility(col.id)} className={cn("text-slate-400 hover:text-primary-600", col.visible && "text-primary-600")}>{col.visible ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end"><Button onClick={() => setIsColumnConfigOpen(false)}>Done</Button></div>
        </div>
      </Modal>

      {/* Edit Modals */}
      {activeModal?.type === 'reservation' && <EditReservationModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'pet' && <EditPetModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'owner' && <EditOwnerModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'service' && <AddServiceModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'checkout' && <CheckOutModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'lodging' && <QuickLodgingModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}
      {activeModal?.type === 'tag' && <QuickTagModal isOpen={true} onClose={() => setActiveModal(null)} id={activeModal.id} />}

      {runCardReservationId && <RunCardModal isOpen={true} onClose={() => setRunCardReservationId(null)} reservationId={runCardReservationId} />}
      {estimateReservationId && <EstimateModal isOpen={true} onClose={() => setEstimateReservationId(null)} reservationId={estimateReservationId} />}
    </div>
  );
};