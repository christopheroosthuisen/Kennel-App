
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Phone, Mail, MapPin, Dog, Plus, AlertTriangle, Syringe, 
  LayoutGrid, List as ListIcon, MoreHorizontal, FileText, Download, Upload, Trash2,
  Paperclip, Send, Camera, Sparkles, Image as ImageIcon, Video, Map, DollarSign, Calendar, File
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Input, Tabs, Badge, cn, Modal, Label, Textarea, Select, BulkActionBar, SortableHeader, Avatar } from './Common';
import { EditOwnerModal, EditPetModal } from './EditModals';
import { NewReservationModal, SendEstimateModal } from './QuickActionModals';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { uploadFile, fileToBase64 } from '../utils/files';
import { chatWithGemini, generatePetAvatar, editImage, animatePetPhoto, analyzeDocument } from '../services/ai';
import { CRMCommunicationHub } from './CRMCommunicationHub';

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
                      <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <Avatar url={pet.photoUrl} name={pet.name} className="h-full w-full text-lg" />
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
            <div className="p-4 text-center text-slate-400">Switch to Grid for best experience</div>
         </Card>
       )}

       <BulkActionBar count={selectedIds.length} onClear={() => setSelectedIds([])} />

       {/* Edit Modals */}
       {isNewOwnerOpen && (
         <EditOwnerModal 
           isOpen={true} 
           onClose={() => { setIsNewOwnerOpen(false); refetchOwners(); }} 
           id="new" 
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

const OwnerDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { data: owner } = useApiQuery(`owner-${id}`, () => api.getOwner(id));
  const { data: pets = [] } = useApiQuery(`pets-${id}`, () => api.getPets({ ownerId: id }));
  const { data: agreements = [], refetch: refetchAgreements } = useApiQuery(`agr-${id}`, () => api.listAgreements(id));
  const { data: files = [], refetch: refetchFiles } = useApiQuery(`files-${id}`, () => api.listAttachments('Owner', id));
  const { data: invoices = [] } = useApiQuery(`inv-${id}`, () => api.listOwnerInvoices(id));

  const [isVerifyingAddr, setIsVerifyingAddr] = useState(false);
  const [tab, setTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<'reservation' | 'estimate' | null>(null);

  if (!owner) return <div>Loading...</div>;

  const verifyAddress = async () => {
    setIsVerifyingAddr(true);
    try {
      const res = await chatWithGemini([], `Is the address "${owner.address}" valid and residential?`, 'maps');
      alert(`Maps Grounding Check:\n${res.text}`);
    } catch(e) { 
      alert('Verification failed. Check API configuration.'); 
    }
    setIsVerifyingAddr(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      const file = await uploadFile(e.target.files[0]);
      await api.createAttachment({
        entityType: 'Owner',
        entityId: id,
        fileId: file.id,
        label: 'Uploaded Doc'
      });
      refetchFiles();
    } catch(e) { alert('Upload failed'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
           <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden shrink-0">
                 <Avatar name={`${owner.firstName} ${owner.lastName}`} className="h-full w-full text-xl bg-primary-100 text-primary-600" />
              </div>
              <div>
                 <h1 className="text-3xl font-bold text-slate-900">{owner.firstName} {owner.lastName}</h1>
                 <div className="flex gap-4 text-slate-600 mt-2 text-sm">
                    <span className="flex items-center gap-1"><Phone size={14}/> {owner.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={14}/> {owner.email}</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14}/> {owner.address || 'No address'}
                      {owner.address && (
                        <button onClick={verifyAddress} className="ml-2 text-xs text-blue-600 hover:underline flex items-center gap-1" disabled={isVerifyingAddr}>
                          {isVerifyingAddr ? <Sparkles size={10} className="animate-spin"/> : <Map size={10}/>} Verify
                        </button>
                      )}
                    </span>
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
                 <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveActionModal('estimate')}><DollarSign size={14}/> Send Estimate</Button>
                 <Button size="sm" className="gap-2" onClick={() => setActiveActionModal('reservation')}><Calendar size={14}/> New Reservation</Button>
              </div>
           </div>
        </div>
      </Card>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[
          {id: 'overview', label: 'Overview'}, 
          {id: 'comm', label: 'Communications'},
          {id: 'agreements', label: 'Agreements', count: agreements.length},
          {id: 'files', label: 'Files', count: files.length},
          {id: 'invoices', label: 'Invoices', count: invoices.length},
        ]} 
      />
      
      {tab === 'overview' && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
               <Card className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2"><Dog size={18}/> Household Pets</h3>
                  {pets.map((pet: any) => (
                    <div key={pet.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border border-transparent hover:border-slate-100">
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                        <Avatar url={pet.photoUrl} name={pet.name} className="h-full w-full" />
                      </div>
                      <div>
                         <div className="font-semibold text-slate-800 group-hover:text-primary-600">{pet.name}</div>
                         <div className="text-xs text-slate-500">{pet.breed}</div>
                      </div>
                    </div>
                  ))}
               </Card>
            </div>
            <div className="md:col-span-2">
               <CRMCommunicationHub ownerId={id} />
            </div>
         </div>
      )}

      {tab === 'comm' && (
         <div className="max-w-4xl mx-auto">
            <CRMCommunicationHub ownerId={id} />
         </div>
      )}

      {tab === 'agreements' && (
         <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Signed Agreements</h3>
               <Button size="sm" variant="outline"><Plus size={14}/> Send New</Button>
            </div>
            {agreements.length > 0 ? (
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                     <tr><th className="p-3">Name</th><th className="p-3">Signed Date</th><th className="p-3">Status</th></tr>
                  </thead>
                  <tbody>
                     {agreements.map((a: any) => (
                        <tr key={a.id} className="border-b border-slate-50">
                           <td className="p-3 font-medium">{a.name}</td>
                           <td className="p-3">{new Date(a.signedAt).toLocaleDateString()}</td>
                           <td className="p-3"><Badge variant="success">{a.status}</Badge></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <div className="p-8 text-center text-slate-400">No agreements found.</div>
            )}
         </Card>
      )}

      {tab === 'files' && (
         <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Files & Attachments</h3>
               <div className="relative">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                  <Button size="sm" variant="outline" className="gap-2"><Upload size={14}/> Upload File</Button>
               </div>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
               {files.map((f: any) => (
                  <a href={`/api/files/${f.file.id}/download`} target="_blank" rel="noreferrer" key={f.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex flex-col items-center text-center gap-2">
                     <FileText size={24} className="text-slate-400"/>
                     <div className="text-sm font-medium text-slate-700 truncate w-full">{f.file.originalName}</div>
                     <div className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</div>
                  </a>
               ))}
               {files.length === 0 && <div className="col-span-full text-center text-slate-400 p-4">No files uploaded.</div>}
            </div>
         </Card>
      )}

      {tab === 'invoices' && (
         <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr><th className="p-3">Invoice #</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Balance</th><th className="p-3">Status</th></tr>
               </thead>
               <tbody>
                  {invoices.map((inv: any) => (
                     <tr key={inv.id} className="border-b border-slate-50">
                        <td className="p-3 font-mono">#{inv.id.slice(-6)}</td>
                        <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">${(inv.total / 100).toFixed(2)}</td>
                        <td className="p-3">${(inv.balanceDue / 100).toFixed(2)}</td>
                        <td className="p-3"><Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                     </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No invoices found.</td></tr>}
               </tbody>
            </table>
         </Card>
      )}

      {isEditOpen && <EditOwnerModal isOpen={true} onClose={() => setIsEditOpen(false)} id={owner.id} />}
      
      {activeActionModal === 'reservation' && (
        <NewReservationModal 
          isOpen={true} 
          onClose={() => setActiveActionModal(null)} 
          ownerId={id} 
        />
      )}
      
      {activeActionModal === 'estimate' && (
        <SendEstimateModal 
          isOpen={true} 
          onClose={() => setActiveActionModal(null)} 
          ownerId={id} 
        />
      )}
    </div>
  );
};

const PetDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { data: pet, refetch } = useApiQuery(`pet-${id}`, () => api.getPet(id));
  const [tab, setTab] = useState('care');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  if (!pet) return <div>Loading...</div>;

  const handleGenerateAvatar = async () => {
    setIsGeneratingImg(true);
    try {
      const base64 = await generatePetAvatar(pet.breed, pet.color || 'mixed');
      if (base64) {
        await api.updatePet(pet.id, { photoUrl: base64 });
        refetch();
      } else {
        alert('Image generation failed (No data returned).');
      }
    } catch(e) { 
      console.error(e);
      alert('Failed to generate image. Ensure you are using a paid API key for Imagen.'); 
    }
    setIsGeneratingImg(false);
  };

  const handleEditImage = async () => {
    if (!pet.photoUrl || !editPrompt) return;
    setIsEditingImg(true);
    try {
      const base64Input = pet.photoUrl.includes(',') ? pet.photoUrl.split(',')[1] : pet.photoUrl;
      const result = await editImage(base64Input, editPrompt);
      if (result) {
        await api.updatePet(pet.id, { photoUrl: result });
        refetch();
        setEditPrompt('');
      } else {
        alert('Edit returned no result.');
      }
    } catch(e) { 
      console.error(e);
      alert('Failed to edit image.'); 
    }
    setIsEditingImg(false);
  };

  const handleAnimate = async () => {
    if (!pet.photoUrl) return;
    setIsAnimating(true);
    try {
      const base64Input = pet.photoUrl.includes(',') ? pet.photoUrl.split(',')[1] : pet.photoUrl;
      const videoUrl = await animatePetPhoto(base64Input);
      if (videoUrl) {
        window.open(videoUrl, '_blank');
      } else {
        alert('No video URL returned. Verify Veo API Key access.');
      }
    } catch(e) { 
      console.error(e);
      alert('Failed to animate. Veo models require a paid billing project.'); 
    }
    setIsAnimating(false);
  };

  const handleDocAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const base64 = await fileToBase64(file);
    try {
      const jsonStr = await analyzeDocument(base64);
      alert(`Vaccination Analysis Result:\n${jsonStr}`);
    } catch(e) { 
      alert('Document analysis failed. Ensure the file is an image of a document.'); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Pet Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
         <div className="relative group w-48 shrink-0">
            <div className="h-48 w-48 rounded-lg bg-slate-200 overflow-hidden border border-slate-300">
               <Avatar url={pet.photoUrl} name={pet.name} className="w-full h-full text-4xl" />
               {!pet.photoUrl && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Button size="sm" variant="ghost" onClick={handleGenerateAvatar} disabled={isGeneratingImg} className="text-xs pointer-events-auto mt-16 bg-white/80">
                       {isGeneratingImg ? <Sparkles size={12} className="animate-spin"/> : <Sparkles size={12}/>} Generate AI
                    </Button>
                 </div>
               )}
            </div>
            
            {/* Image Actions */}
            {pet.photoUrl && (
              <div className="mt-2 space-y-2">
                 <div className="flex gap-1">
                    <Input 
                      placeholder="e.g. Add hat" 
                      value={editPrompt} 
                      onChange={e => setEditPrompt(e.target.value)} 
                      className="h-8 text-xs"
                    />
                    <Button size="icon" className="h-8 w-8" onClick={handleEditImage} disabled={isEditingImg} title="Edit Image">
                       <Sparkles size={14} className={isEditingImg ? "animate-spin" : ""}/>
                    </Button>
                 </div>
                 <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-2" onClick={handleAnimate} disabled={isAnimating}>
                    <Video size={14} className={isAnimating ? "animate-pulse" : ""}/> Animate (Veo)
                 </Button>
              </div>
            )}
         </div>

         <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {pet.name} 
                    {pet.gender === 'M' ? <span className="text-blue-500 text-xl" title="Male">♂</span> : <span className="text-pink-500 text-xl" title="Female">♀</span>}
                  </h1>
                  <p className="text-slate-500 text-lg">{pet.breed} • {pet.weightLbs} lbs</p>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
               </div>
            </div>

            <div className="mt-6">
               <Label>Upload Vaccination Record (AI Analyze)</Label>
               <div className="flex gap-2">
                  <input type="file" onChange={handleDocAnalysis} className="text-xs" accept="image/*" />
               </div>
            </div>
         </div>
      </div>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[{id: 'care', label: 'Care Profile'}]} 
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
