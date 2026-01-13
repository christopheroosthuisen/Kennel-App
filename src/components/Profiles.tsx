
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Phone, Mail, MapPin, Dog, Plus, AlertTriangle, Syringe, 
  LayoutGrid, List as ListIcon, MoreHorizontal, FileText, Download, Upload, Trash2,
  Paperclip, Send
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Input, Tabs, Badge, cn, Modal, Label, Textarea, Select, BulkActionBar, SortableHeader } from './Common';
import { EditOwnerModal, EditPetModal } from './EditModals';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { uploadFile } from '../utils/files';
import { useEventStream } from '../hooks/useEventStream';
import { Owner, Pet, MessageThread, Message } from '../../shared/domain';

// Hook to debounce search input
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Profiles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'owners';
  const viewMode = searchParams.get('view') || 'grid';
  const search = searchParams.get('search') || '';
  const debouncedSearch = useDebounce(search, 500);
  const selectedId = searchParams.get('id');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isNewOwnerOpen, setIsNewOwnerOpen] = useState(false);
  const [isNewPetOpen, setIsNewPetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc' | 'desc'}>({ key: 'name', dir: 'asc' });

  // Fetch Data
  const { data: owners = [], refetch: refetchOwners } = useApiQuery('owners', 
    () => api.getOwners({ search: debouncedSearch }), 
    [debouncedSearch]
  );
  
  const { data: pets = [], refetch: refetchPets } = useApiQuery('pets', 
    () => api.getPets({ search: debouncedSearch }), 
    [debouncedSearch]
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      // Basic sorting logic
      const aVal = (a.name || a.firstName || '') as string;
      const bVal = (b.name || b.firstName || '') as string;
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedOwners = getSortedData(owners);
  const sortedPets = getSortedData(pets);

  const selectAll = () => {
    if (activeTab === 'owners') setSelectedIds(owners.map((o: any) => o.id));
    else setSelectedIds(pets.map((p: any) => p.id));
  };

  if (selectedId) {
    if (activeTab === 'owners') return <OwnerDetail id={selectedId} onBack={() => updateParams({ id: null })} />;
    return <PetDetail id={selectedId} onBack={() => updateParams({ id: null })} />;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Directory</h1>
          <div className="flex gap-2">
             <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                <Button 
                  size="icon" 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  className={cn("h-8 w-8", viewMode === 'grid' && "bg-white shadow-sm")}
                  onClick={() => updateParams({ view: 'grid' })}
                >
                   <LayoutGrid size={16}/>
                </Button>
                <Button 
                  size="icon" 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  className={cn("h-8 w-8", viewMode === 'list' && "bg-white shadow-sm")}
                  onClick={() => updateParams({ view: 'list' })}
                >
                   <ListIcon size={16}/>
                </Button>
             </div>
             <Button 
               className="gap-2"
               onClick={() => activeTab === 'owners' ? setIsNewOwnerOpen(true) : setIsNewPetOpen(true)}
             >
               <Plus size={16}/> New {activeTab === 'owners' ? 'Owner' : 'Pet'}
             </Button>
          </div>
       </div>

       <Tabs 
         activeTab={activeTab} 
         onChange={(id) => { updateParams({ type: id }); setSelectedIds([]); }} 
         tabs={[
           { id: 'owners', label: 'Owners', count: owners.length },
           { id: 'pets', label: 'Pets', count: pets.length }
         ]} 
       />

       <div className="flex justify-between items-center gap-4">
          <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder={`Search ${activeTab}...`} 
                className="pl-9" 
                value={search} 
                onChange={(e) => updateParams({ search: e.target.value })} 
              />
          </div>
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
       </div>

       {viewMode === 'grid' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'owners' ? (
               sortedOwners.map((owner: any) => (
                 <div key={owner.id} className="relative group">
                   <input 
                     type="checkbox" 
                     className="absolute top-4 right-4 z-10 h-5 w-5 rounded border-slate-300 cursor-pointer"
                     checked={selectedIds.includes(owner.id)}
                     onChange={() => toggleSelect(owner.id)}
                   />
                   <Card 
                      className={cn("p-4 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 h-full border-2", selectedIds.includes(owner.id) ? "border-primary-500 bg-primary-50" : "border-transparent")}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: owner.id });
                      }}
                   >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{owner.firstName} {owner.lastName}</div>
                        <Badge variant={owner.balance > 0 ? 'warning' : 'success'}>${(owner.balance / 100).toFixed(2)}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Phone size={14}/> {owner.phone}</div>
                        <div className="flex items-center gap-2"><Mail size={14}/> {owner.email}</div>
                      </div>
                   </Card>
                 </div>
               ))
            ) : (
               sortedPets.map((pet: any) => (
                 <div key={pet.id} className="relative group">
                   <input 
                     type="checkbox" 
                     className="absolute top-4 right-4 z-10 h-5 w-5 rounded border-slate-300 cursor-pointer"
                     checked={selectedIds.includes(pet.id)}
                     onChange={() => toggleSelect(pet.id)}
                   />
                   <Card 
                      className={cn("p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 h-full border-2", selectedIds.includes(pet.id) ? "border-primary-500 bg-primary-50" : "border-transparent")}
                      onClick={(e) => {
                         if ((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: pet.id });
                      }}
                    >
                      <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                        {pet.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{pet.name}</div>
                        <div className="text-sm text-slate-500">{pet.breed}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant={pet.vaccineStatus === 'Valid' ? 'success' : 'danger'}>{pet.vaccineStatus}</Badge>
                        </div>
                      </div>
                   </Card>
                 </div>
               ))
            )}
         </div>
       ) : (
         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3 w-12"><input type="checkbox" onClick={selectAll} className="rounded border-slate-300"/></th>
                     <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                     {activeTab === 'owners' ? (
                        <>
                           <SortableHeader label="Contact" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                           <SortableHeader label="Balance" sortKey="balance" currentSort={sortConfig} onSort={handleSort} />
                        </>
                     ) : (
                        <>
                           <SortableHeader label="Breed" sortKey="breed" currentSort={sortConfig} onSort={handleSort} />
                           <SortableHeader label="Vaccines" sortKey="vaccineStatus" currentSort={sortConfig} onSort={handleSort} />
                        </>
                     )}
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                  {activeTab === 'owners' ? sortedOwners.map((owner: any) => (
                     <tr key={owner.id} className="hover:bg-slate-50 cursor-pointer" onClick={(e) => { if((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: owner.id }) }}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(owner.id)} onChange={() => toggleSelect(owner.id)} className="rounded border-slate-300"/></td>
                        <td className="px-6 py-4 font-medium text-slate-900">{owner.firstName} {owner.lastName}</td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col text-xs text-slate-600">
                              <span>{owner.email}</span>
                              <span>{owner.phone}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn("font-bold", owner.balance > 0 ? "text-red-600" : "text-green-600")}>
                              ${(owner.balance / 100).toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right"><Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button></td>
                     </tr>
                  )) : sortedPets.map((pet: any) => (
                     <tr key={pet.id} className="hover:bg-slate-50 cursor-pointer" onClick={(e) => { if((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: pet.id }) }}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(pet.id)} onChange={() => toggleSelect(pet.id)} className="rounded border-slate-300"/></td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-900">{pet.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{pet.breed}</td>
                        <td className="px-6 py-4">
                           <Badge variant={pet.vaccineStatus === 'Valid' ? 'success' : pet.vaccineStatus === 'Expiring' ? 'warning' : 'danger'}>
                              {pet.vaccineStatus}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right"><Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
       )}

       <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} />

       {/* Edit Modals */}
       {isNewOwnerOpen && (
         <EditOwnerModal 
           isOpen={true} 
           onClose={() => { setIsNewOwnerOpen(false); refetchOwners(); }} 
           id="new" // Use "new" to trigger create mode in modal
         />
       )}
       {isNewPetOpen && (
         <EditPetModal 
           isOpen={true} 
           onClose={() => { setIsNewPetOpen(false); refetchPets(); }} 
           id="new" 
         />
       )}
    </div>
  );
};

// --- Messaging Component ---

const MessagingPanel = ({ ownerId }: { ownerId: string }) => {
  const { data: threads = [], refetch: refetchThreads } = useApiQuery(`threads-${ownerId}`, () => api.listThreads(ownerId));
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  // Auto-select first thread
  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) setSelectedThreadId(threads[0].id);
  }, [threads]);

  const handleCreateThread = async () => {
    if (!newSubject) return;
    const res = await api.createThread(ownerId, newSubject);
    setNewSubject('');
    setIsNewThreadOpen(false);
    refetchThreads();
    setSelectedThreadId(res.data.id);
  };

  return (
    <Card className="h-[500px] flex overflow-hidden">
      {/* Thread List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center">
           <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Threads</h3>
           <Button size="icon" variant="ghost" onClick={() => setIsNewThreadOpen(true)}><Plus size={16}/></Button>
        </div>
        <div className="flex-1 overflow-y-auto">
           {threads.map(t => (
              <div 
                key={t.id} 
                className={cn("p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-100", selectedThreadId === t.id && "bg-white border-l-4 border-l-primary-500 shadow-sm")}
                onClick={() => setSelectedThreadId(t.id)}
              >
                 <div className="font-medium text-slate-900 text-sm truncate">{t.subject}</div>
                 <div className="text-xs text-slate-500 flex justify-between mt-1">
                    <span>{new Date(t.lastMessageAt).toLocaleDateString()}</span>
                    <Badge variant={t.status === 'Open' ? 'success' : 'default'} className="py-0 px-1 text-[10px]">{t.status}</Badge>
                 </div>
              </div>
           ))}
           {threads.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">No conversations.</div>}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 bg-white">
         {selectedThreadId ? <ThreadView threadId={selectedThreadId} /> : (
            <div className="h-full flex items-center justify-center text-slate-400">Select a conversation</div>
         )}
      </div>

      <Modal isOpen={isNewThreadOpen} onClose={() => setIsNewThreadOpen(false)} title="New Conversation" size="sm">
         <div className="space-y-4">
            <div>
               <Label>Subject</Label>
               <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Reservation Inquiry" />
            </div>
            <div className="flex justify-end pt-2">
               <Button onClick={handleCreateThread} disabled={!newSubject}>Start Thread</Button>
            </div>
         </div>
      </Modal>
    </Card>
  );
};

const ThreadView = ({ threadId }: { threadId: string }) => {
  const { data: messages = [], refetch } = useApiQuery(`msgs-${threadId}`, () => api.listMessages(threadId), [threadId]);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live updates
  useEventStream((event) => {
    if (event.type === 'message' && event.payload.threadId === threadId) {
      refetch();
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim()) return;
    await api.createMessage(threadId, body);
    setBody('');
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map(m => (
             <div key={m.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                   {m.authorName[0]}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-800">{m.authorName}</span>
                      <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                   </div>
                   <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-br-lg rounded-bl-lg rounded-tr-lg border border-slate-100">
                      {m.body}
                   </div>
                </div>
             </div>
          ))}
          <div ref={bottomRef} />
       </div>
       <div className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
          <Input value={body} onChange={e => setBody(e.target.value)} placeholder="Type an internal note..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <Button size="icon" onClick={handleSend} disabled={!body.trim()}><Send size={16}/></Button>
       </div>
    </div>
  );
};

// --- Details Components ---

const OwnerDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { data: owner } = useApiQuery(`owner-${id}`, () => api.getOwner(id));
  const { data: pets = [] } = useApiQuery(`pets-${id}`, () => api.getPets({ ownerId: id }));
  const { data: invoices = [] } = useApiQuery(`inv-${id}`, () => api.listOwnerInvoices(id));
  const { data: files = [], refetch: refetchFiles } = useApiQuery(`files-${id}`, () => api.listAttachments('Owner', id));
  const { data: agreements = [], refetch: refetchAgreements } = useApiQuery(`agreements-${id}`, () => api.listAgreements(id));

  const [tab, setTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!owner) return <div>Loading...</div>;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'agreement') => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    try {
      const uploaded = await uploadFile(file);
      if (type === 'file') {
        await api.createAttachment({ entityType: 'Owner', entityId: id, fileId: uploaded.id, label: file.name });
        refetchFiles();
      } else {
        await api.createAgreement(id, { name: file.name, fileId: uploaded.id });
        refetchAgreements();
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
           <div className="flex gap-4">
              <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
                 {owner.firstName[0]}{owner.lastName[0]}
              </div>
              <div>
                 <h1 className="text-3xl font-bold text-slate-900">{owner.firstName} {owner.lastName}</h1>
                 <div className="flex gap-4 text-slate-600 mt-2 text-sm">
                    <span className="flex items-center gap-1"><Phone size={14}/> {owner.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={14}/> {owner.email}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {owner.address || 'No address'}</span>
                 </div>
              </div>
           </div>
           <div className="text-right space-y-2">
              <div className="text-sm text-slate-500">Account Balance</div>
              <div className={cn("text-3xl font-bold", owner.balance > 0 ? "text-red-600" : "text-green-600")}>
                 ${(owner.balance / 100).toFixed(2)}
              </div>
              <div className="flex gap-2 justify-end">
                 <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
                 <Button size="sm">Make Payment</Button>
              </div>
           </div>
        </div>
      </Card>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[
          {id: 'overview', label: 'Overview'}, 
          {id: 'invoices', label: 'Financials'},
          {id: 'files', label: 'Files', count: files.length},
          {id: 'agreements', label: 'Agreements', count: agreements.length},
          {id: 'comm', label: 'Communications'}
        ]} 
      />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
             <Card className="p-4 space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2"><Dog size={18}/> Household Pets</h3>
               {pets.map((pet: any) => (
                 <div key={pet.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border border-transparent hover:border-slate-100">
                   <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      {pet.name[0]}
                   </div>
                   <div>
                      <div className="font-semibold text-slate-800 group-hover:text-primary-600">{pet.name}</div>
                      <div className="text-xs text-slate-500">{pet.breed}</div>
                   </div>
                 </div>
               ))}
               <Button variant="ghost" size="sm" className="w-full text-primary-600"><Plus size={14}/> Add Pet</Button>
             </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
             <Card className="p-4 space-y-3">
                <h3 className="font-bold text-slate-800">Internal Notes</h3>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-sm text-yellow-900">
                  {owner.notes || "No notes available."}
                </div>
             </Card>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
         <div className="space-y-4">
            <Card className="overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-500">
                     <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-right">Balance</th>
                        <th className="p-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {invoices.map((inv: any) => (
                        <tr key={inv.id}>
                           <td className="p-4 font-mono">{inv.id.slice(-6)}</td>
                           <td className="p-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                           <td className="p-4"><Badge>{inv.status}</Badge></td>
                           <td className="p-4 text-right">${(inv.total / 100).toFixed(2)}</td>
                           <td className="p-4 text-right font-bold">${(inv.balanceDue / 100).toFixed(2)}</td>
                           <td className="p-4 text-right">
                              <Button size="sm" variant="ghost" className="gap-2"><Download size={14}/> PDF</Button>
                           </td>
                        </tr>
                     ))}
                     {invoices.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">No invoices found.</td></tr>
                     )}
                  </tbody>
               </table>
            </Card>
         </div>
      )}

      {tab === 'files' && (
        <Card className="p-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Attachments</h3>
              <div className="relative">
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'file')} />
                 <Button size="sm" className="gap-2"><Upload size={14}/> Upload File</Button>
              </div>
           </div>
           <div className="grid grid-cols-1 gap-2">
              {files.map((f: any) => (
                 <div key={f.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                       <FileText size={18} className="text-slate-400"/>
                       <span className="font-medium text-sm text-slate-700">{f.label || f.file?.originalName}</span>
                    </div>
                    <a href={f.file?.publicUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-xs hover:underline">Download</a>
                 </div>
              ))}
              {files.length === 0 && <div className="text-slate-400 text-sm text-center py-8">No files uploaded.</div>}
           </div>
        </Card>
      )}

      {tab === 'agreements' && (
        <Card className="p-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Agreements</h3>
              <div className="relative">
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'agreement')} />
                 <Button size="sm" className="gap-2"><Plus size={14}/> New Agreement</Button>
              </div>
           </div>
           <div className="grid grid-cols-1 gap-2">
              {agreements.map((a: any) => (
                 <div key={a.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                       <FileText size={18} className="text-slate-400"/>
                       <div>
                          <div className="font-medium text-sm text-slate-700">{a.name}</div>
                          <div className="text-xs text-slate-500">Signed: {new Date(a.signedAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                    <Badge variant="success">Signed</Badge>
                 </div>
              ))}
              {agreements.length === 0 && <div className="text-slate-400 text-sm text-center py-8">No agreements found.</div>}
           </div>
        </Card>
      )}

      {tab === 'comm' && <MessagingPanel ownerId={owner.id} />}

      {isEditOpen && <EditOwnerModal isOpen={true} onClose={() => setIsEditOpen(false)} id={owner.id} />}
    </div>
  );
};

const PetDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { data: pet } = useApiQuery(`pet-${id}`, () => api.getPet(id));
  const [tab, setTab] = useState('care');
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!pet) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Pet Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
         <div className="h-32 w-32 rounded-lg bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400">
            {pet.name[0]}
         </div>
         <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {pet.name} 
                    {pet.gender === 'M' ? <span className="text-blue-500 text-xl" title="Male">♂</span> : <span className="text-pink-500 text-xl" title="Female">♀</span>}
                  </h1>
                  <p className="text-slate-500 text-lg">{pet.breed} • {pet.weightLbs} lbs</p>
                  
                  <div className="flex gap-2 mt-2">
                     <Badge variant={pet.fixed ? 'success' : 'warning'}>{pet.fixed ? 'Fixed' : 'Intact'}</Badge>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Vaccines</div>
                  <div className={cn("font-semibold mt-1 flex items-center gap-1", pet.vaccineStatus === 'Valid' ? "text-green-600" : "text-red-600")}>
                    <Syringe size={14}/> {pet.vaccineStatus}
                  </div>
               </div>
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Microchip</div>
                  <div className="font-semibold mt-1 text-slate-800 truncate">{pet.microchip || 'N/A'}</div>
               </div>
            </div>
         </div>
      </div>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[
           {id: 'care', label: 'Care Profile'}
        ]} 
      />

      {tab === 'care' && (
         <div className="grid grid-cols-1 gap-6">
            <Card className="p-4">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Feeding Instructions</h3>
               <div className="bg-orange-50 p-4 rounded-md border border-orange-100 text-orange-900 leading-relaxed whitespace-pre-line">
                  {pet.feedingInstructions || 'None'}
               </div>
            </Card>
         </div>
      )}

      {isEditOpen && <EditPetModal isOpen={true} onClose={() => setIsEditOpen(false)} id={pet.id} />}
    </div>
  );
};
