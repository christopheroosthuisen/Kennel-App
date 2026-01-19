
import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Globe, Stethoscope, Plus, Search, 
  MoreHorizontal, AlertCircle, CheckCircle, Zap, ShieldAlert, FileText,
  User, Dog, ExternalLink, Filter, Trash2, Edit2
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal, Label, Switch, Select, BulkActionBar, cn } from './Common';
import { MOCK_VET_CLINICS, MOCK_VETERINARIANS, MOCK_PETS } from '../constants';
import { VetClinic, Veterinarian } from '../types';

export const Veterinarians = () => {
  const [clinics, setClinics] = useState<VetClinic[]>(MOCK_VET_CLINICS);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [isAddClinicOpen, setIsAddClinicOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived Data
  const filteredClinics = clinics.filter(vc => {
    if (!vc) return false;
    const nameMatch = vc.name ? vc.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const addrMatch = vc.address ? vc.address.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return nameMatch || addrMatch;
  });

  const handleAddClinic = (newClinic: VetClinic) => {
    setClinics(prev => [...prev, newClinic]);
    setSelectedClinicId(newClinic.id);
    setIsAddClinicOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200">
           <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Stethoscope className="text-primary-600"/> Vet Directory
           </h1>
           <div className="flex gap-2">
              <div className="relative flex-1">
                 <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <Input 
                    placeholder="Search clinics..." 
                    className="pl-8 h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button size="icon" className="h-9 w-9" onClick={() => setIsAddClinicOpen(true)} title="Add Clinic"><Plus size={16}/></Button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           <div className="divide-y divide-slate-100">
              {filteredClinics.map(clinic => {
                 if (!clinic) return null;
                 const vetCount = MOCK_VETERINARIANS.filter(v => v?.clinicId === clinic.id).length;
                 const petCount = MOCK_PETS.filter(p => p?.vetClinicId === clinic.id).length;
                 
                 return (
                    <div 
                       key={clinic.id} 
                       onClick={() => setSelectedClinicId(clinic.id)}
                       className={cn(
                          "p-4 cursor-pointer hover:bg-slate-50 transition-colors group border-l-4",
                          selectedClinicId === clinic.id ? "bg-slate-50 border-l-primary-500" : "border-l-transparent"
                       )}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-800 text-sm">{clinic.name}</h3>
                          {clinic.emergency && <Badge variant="danger" className="text-[10px] py-0 px-1">24/7</Badge>}
                       </div>
                       <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                          <MapPin size={10}/> {clinic.address.split(',')[0]}
                       </div>
                       <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><User size={10}/> {vetCount} Vets</span>
                          <span className="flex items-center gap-1"><Dog size={10}/> {petCount} Clients</span>
                          {clinic.autoRequestRecords && (
                             <span className="flex items-center gap-1 text-green-600"><Zap size={10}/> Auto-Recs</span>
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
         {selectedClinicId ? (
            <ClinicDetail clinicId={selectedClinicId} clinics={clinics} />
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Building2 size={32} className="opacity-20"/>
               </div>
               <p>Select a clinic to view details, staff, and automations.</p>
            </div>
         )}
      </div>

      <AddVetClinicModal isOpen={isAddClinicOpen} onClose={() => setIsAddClinicOpen(false)} onSave={handleAddClinic} />
    </div>
  );
};

const ClinicDetail = ({ clinicId, clinics }: { clinicId: string, clinics: VetClinic[] }) => {
   const clinic = clinics.find(c => c?.id === clinicId);
   const [doctors, setDoctors] = useState<Veterinarian[]>(MOCK_VETERINARIANS.filter(v => v.clinicId === clinicId));
   const linkedPets = MOCK_PETS.filter(p => p?.vetClinicId === clinicId);
   const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

   // Update doctors when switching clinics
   React.useEffect(() => {
      setDoctors(MOCK_VETERINARIANS.filter(v => v.clinicId === clinicId));
   }, [clinicId]);

   const handleAddDoctor = (doc: Veterinarian) => {
      setDoctors(prev => [...prev, doc]);
      setIsAddDoctorOpen(false);
   };

   if (!clinic) return null;

   return (
      <div className="flex flex-col h-full animate-in fade-in duration-200">
         {/* Header */}
         <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-2xl font-bold text-primary-600 shadow-sm">
                     {clinic.name.charAt(0)}
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {clinic.name}
                        {clinic.emergency && <Badge variant="danger">Emergency</Badge>}
                     </h1>
                     <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14}/> {clinic.address}</span>
                        {clinic.website && <span className="flex items-center gap-1 text-primary-600 hover:underline cursor-pointer"><Globe size={14}/> {clinic.website}</span>}
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" className="gap-2"><Edit2 size={16}/> Edit</Button>
                  <Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
               <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Contact</div>
                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {clinic.phone}</div>
                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2 mt-1"><Mail size={14} className="text-slate-400"/> {clinic.email || '--'}</div>
               </div>
               <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Automation Status</div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-800">Records Request</span>
                     <Switch checked={clinic.autoRequestRecords} onCheckedChange={()=>{}} />
                  </div>
                  {clinic.lastRecordRequest && <div className="text-[10px] text-slate-400 mt-1">Last run: {clinic.lastRecordRequest}</div>}
               </div>
               <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Affiliated Pets</div>
                  <div className="text-2xl font-bold text-slate-800">{linkedPets.length}</div>
               </div>
            </div>
         </div>

         {/* Body Content */}
         <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Doctors Section */}
            <div>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <Stethoscope size={18}/> Veterinarians
                  </h3>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsAddDoctorOpen(true)}><Plus size={14}/> Add Doctor</Button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc, idx) => (
                     <Card key={doc.id || idx} className="p-3 flex justify-between items-center hover:border-primary-300 transition-colors group">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {doc.name.split(' ').pop()?.charAt(0)}
                           </div>
                           <div>
                              <div className="font-bold text-slate-900">{doc.name}</div>
                              <div className="text-xs text-slate-500">{doc.specialty || 'General Practice'}</div>
                           </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8"><Phone size={14}/></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8"><Mail size={14}/></Button>
                        </div>
                     </Card>
                  ))}
                  {doctors.length === 0 && <div className="col-span-2 text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">No specific doctors listed.</div>}
               </div>
            </div>

            {/* Linked Pets Section */}
            <div>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <Dog size={18}/> Active Patients
                  </h3>
                  <Button size="sm" variant="ghost" className="text-slate-500">View All</Button>
               </div>
               
               <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                           <th className="px-4 py-2">Pet</th>
                           <th className="px-4 py-2">Breed</th>
                           <th className="px-4 py-2">Vaccine Status</th>
                           <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {linkedPets.map(pet => (
                           <tr key={pet.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium text-slate-900">{pet.name}</td>
                              <td className="px-4 py-2 text-slate-500">{pet.breed}</td>
                              <td className="px-4 py-2">
                                 <Badge variant={pet.vaccineStatus === 'Valid' ? 'success' : pet.vaccineStatus === 'Expiring' ? 'warning' : 'danger'}>
                                    {pet.vaccineStatus}
                                 </Badge>
                              </td>
                              <td className="px-4 py-2 text-right">
                                 <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-blue-600 hover:text-blue-800"><FileText size={12}/> Request Records</Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Add Doctor Modal */}
         <AddDoctorModal isOpen={isAddDoctorOpen} onClose={() => setIsAddDoctorOpen(false)} onSave={handleAddDoctor} clinicId={clinicId} />
      </div>
   );
};

const AddVetClinicModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (clinic: VetClinic) => void }) => {
   const [name, setName] = useState('');
   const [address, setAddress] = useState('');
   const [phone, setPhone] = useState('');
   const [email, setEmail] = useState('');
   const [duplicates, setDuplicates] = useState<VetClinic[]>([]);

   // Smart Duplicate Check
   const handleNameChange = (val: string) => {
      setName(val);
      if (val.length > 3) {
         const matches = MOCK_VET_CLINICS.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
         setDuplicates(matches);
      } else {
         setDuplicates([]);
      }
   };

   const handleSave = () => {
      const newClinic: VetClinic = {
         id: `vc-${Date.now()}`,
         name,
         address,
         phone,
         email,
         emergency: false,
         tags: ['New'],
         autoRequestRecords: false
      };
      onSave(newClinic);
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Add Veterinary Clinic" size="md">
         <div className="space-y-4">
            <div className="relative">
               <Label>Clinic Name</Label>
               <Input 
                  value={name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="e.g. Pet Health Center"
                  autoFocus
               />
               {/* Duplicate Warning */}
               {duplicates.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg z-50 overflow-hidden">
                     <div className="bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 border-b border-amber-100 flex items-center gap-2">
                        <AlertCircle size={12}/> Possible Duplicates Found
                     </div>
                     {duplicates.map(d => (
                        <div key={d.id} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0" onClick={() => alert(`Redirecting to ${d.name}...`)}>
                           <div className="font-bold text-sm text-slate-800">{d.name}</div>
                           <div className="text-xs text-slate-500">{d.address}</div>
                        </div>
                     ))}
                     <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                        If none match, continue creating.
                     </div>
                  </div>
               )}
            </div>

            <div>
               <Label>Address</Label>
               <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St..."/>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div><Label>Main Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) ..."/></div>
               <div><Label>Records Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="records@..."/></div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
               <Zap className="text-blue-600 mt-0.5" size={18}/>
               <div>
                  <h4 className="font-bold text-blue-900 text-sm">Automated Records Request</h4>
                  <p className="text-xs text-blue-700 mt-1">If an email is provided, the system will automatically email this clinic for vaccination records when a pet is added.</p>
               </div>
               <Switch checked={true} onCheckedChange={()=>{}} />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={onClose}>Cancel</Button>
               <Button onClick={handleSave} disabled={!name}>Create Clinic</Button>
            </div>
         </div>
      </Modal>
   );
};

const AddDoctorModal = ({ isOpen, onClose, onSave, clinicId }: { isOpen: boolean, onClose: () => void, onSave: (doc: Veterinarian) => void, clinicId: string }) => {
   const [name, setName] = useState('');
   const [specialty, setSpecialty] = useState('General Practice');
   const [email, setEmail] = useState('');
   const [phone, setPhone] = useState('');

   const handleSave = () => {
      const newDoc: Veterinarian = {
         id: `dr-${Date.now()}`,
         clinicId,
         name,
         specialty,
         email,
         phone
      };
      onSave(newDoc);
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Add Veterinarian" size="sm">
         <div className="space-y-4">
            <div>
               <Label>Doctor Name</Label>
               <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Jane Smith"/>
            </div>
            <div>
               <Label>Specialty</Label>
               <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  <option>General Practice</option>
                  <option>Surgery</option>
                  <option>Dermatology</option>
                  <option>Emergency</option>
               </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Direct Email (Optional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@clinic.com"/></div>
               <div><Label>Direct Phone (Optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ext. 204"/></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={onClose}>Cancel</Button>
               <Button onClick={handleSave} disabled={!name}>Add Doctor</Button>
            </div>
         </div>
      </Modal>
   );
};
