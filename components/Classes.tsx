
import React, { useState } from 'react';
import { 
  GraduationCap, Calendar, Users, Plus, Search, Filter, 
  ChevronRight, MoreHorizontal, CheckCircle, Clock, 
  DollarSign, Edit2, Trash2, User, Dog
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, cn, Modal, Label, Tabs } from './Common';
import { MOCK_CLASS_SESSIONS, MOCK_CLASS_TYPES, MOCK_CLASS_ENROLLMENTS, MOCK_PETS, MOCK_OWNERS, MOCK_USERS } from '../constants';
import { ClassSession, ClassEnrollment } from '../types';

export const Classes = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);

  // Derived Data
  const upcomingSessions = MOCK_CLASS_SESSIONS.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
      {/* Sidebar / List View */}
      <div className="w-96 flex flex-col bg-white border-r border-slate-200">
         <div className="p-4 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
               <GraduationCap className="text-primary-600"/> Group Classes
            </h1>
            <div className="flex gap-2 mb-4">
               <Button 
                  variant={activeTab === 'schedule' ? 'secondary' : 'ghost'} 
                  className="flex-1 text-xs"
                  onClick={() => { setActiveTab('schedule'); setSelectedSessionId(null); }}
               >
                  Schedule
               </Button>
               <Button 
                  variant={activeTab === 'config' ? 'secondary' : 'ghost'} 
                  className="flex-1 text-xs"
                  onClick={() => { setActiveTab('config'); setSelectedSessionId(null); }}
               >
                  Config
               </Button>
            </div>
            
            {activeTab === 'schedule' && (
               <div className="flex gap-2">
                  <div className="relative flex-1">
                     <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                     <Input placeholder="Search classes..." className="pl-8 h-9 text-xs"/>
                  </div>
                  <Button size="icon" className="h-9 w-9" onClick={() => setIsNewClassOpen(true)}><Plus size={16}/></Button>
               </div>
            )}
         </div>

         <div className="flex-1 overflow-y-auto">
            {activeTab === 'schedule' ? (
               <div className="divide-y divide-slate-100">
                  {upcomingSessions.map(session => {
                     const type = MOCK_CLASS_TYPES.find(t => t.id === session.classTypeId);
                     const instructor = MOCK_USERS.find(u => u.id === session.instructorId);
                     const enrolledCount = MOCK_CLASS_ENROLLMENTS.filter(e => e.sessionId === session.id && e.status === 'Enrolled').length;
                     const isFull = enrolledCount >= session.capacity;
                     
                     return (
                        <div 
                           key={session.id} 
                           onClick={() => setSelectedSessionId(session.id)}
                           className={cn(
                              "p-4 cursor-pointer hover:bg-slate-50 transition-colors group border-l-4",
                              selectedSessionId === session.id ? "bg-slate-50 border-l-primary-500" : "border-l-transparent"
                           )}
                        >
                           <div className="flex justify-between items-start mb-1">
                              <Badge variant="outline" className={cn("text-[10px] py-0", type?.color)}>{type?.name}</Badge>
                              <span className="text-xs text-slate-400">{new Date(session.startTime).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                           </div>
                           <h3 className="font-bold text-slate-800 text-sm mb-1">{new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</h3>
                           <div className="flex justify-between items-end">
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                 <User size={12}/> {instructor?.name.split(' ')[0]}
                              </div>
                              <div className={cn("text-xs font-bold", isFull ? "text-red-500" : "text-green-600")}>
                                 {enrolledCount} / {session.capacity}
                              </div>
                           </div>
                           {/* Capacity Bar */}
                           <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                              <div className={cn("h-full", isFull ? "bg-red-500" : "bg-green-500")} style={{ width: `${(enrolledCount / session.capacity) * 100}%` }}></div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="p-4 space-y-3">
                  {MOCK_CLASS_TYPES.map(type => (
                     <Card key={type.id} className="p-3 border-l-4" style={{ borderLeftColor: type.color.includes('pink') ? '#ec4899' : '#3b82f6' }}>
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-slate-800 text-sm">{type.name}</h3>
                           <Badge variant="outline">${type.defaultPrice}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{type.description}</p>
                        <div className="flex gap-2 mt-2 text-[10px] text-slate-400">
                           <span>Cap: {type.defaultCapacity}</span>
                           <span>•</span>
                           <span>{type.creditCost} Credit</span>
                        </div>
                     </Card>
                  ))}
                  <Button variant="outline" className="w-full border-dashed text-slate-400 hover:text-slate-600 gap-2"><Plus size={14}/> Create New Class Type</Button>
               </div>
            )}
         </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
         {selectedSessionId ? (
            <ClassDetail sessionId={selectedSessionId} />
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap size={32} className="opacity-20"/>
               </div>
               <p>Select a class session to view details or manage roster.</p>
            </div>
         )}
      </div>

      {/* New Class Modal */}
      <Modal isOpen={isNewClassOpen} onClose={() => setIsNewClassOpen(false)} title="Schedule Class" size="md">
         <div className="space-y-4">
            <div>
               <Label>Class Type</Label>
               <Select>
                  {MOCK_CLASS_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Date</Label><Input type="date"/></div>
               <div><Label>Time</Label><Input type="time"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Instructor</Label><Select><option>Sarah Smith</option><option>John Doe</option></Select></div>
               <div><Label>Capacity</Label><Input type="number" defaultValue={8}/></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={() => setIsNewClassOpen(false)}>Cancel</Button>
               <Button onClick={() => setIsNewClassOpen(false)}>Schedule Class</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

const ClassDetail = ({ sessionId }: { sessionId: string }) => {
   const session = MOCK_CLASS_SESSIONS.find(s => s.id === sessionId);
   const type = MOCK_CLASS_TYPES.find(t => t.id === session?.classTypeId);
   const instructor = MOCK_USERS.find(u => u.id === session?.instructorId);
   const enrollments = MOCK_CLASS_ENROLLMENTS.filter(e => e.sessionId === sessionId);
   
   const [isAddPetOpen, setIsAddPetOpen] = useState(false);

   if (!session || !type) return null;

   return (
      <div className="flex flex-col h-full">
         {/* Header */}
         <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-2xl font-bold text-slate-900">{type.name}</h2>
                     <Badge variant="outline" className={type.color}>{session.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                     <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(session.startTime).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><Clock size={14}/> {new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ({session.durationMinutes}m)</span>
                     <span className="flex items-center gap-1"><User size={14}/> {instructor?.name}</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</div>
                  <div className="text-2xl font-bold text-slate-900">{enrollments.filter(e => e.status === 'Enrolled').length} <span className="text-slate-400 text-lg">/ {session.capacity}</span></div>
               </div>
            </div>
            
            <div className="flex gap-2">
               <Button className="gap-2" onClick={() => setIsAddPetOpen(true)}><Plus size={16}/> Add Pet</Button>
               <Button variant="outline" className="gap-2"><DollarSign size={16}/> Drop-In Charge</Button>
               <Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button>
            </div>
         </div>

         {/* Roster Table */}
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-3 w-10"></th>
                     <th className="px-6 py-3">Pet / Owner</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3">Payment</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {enrollments.map(enrollment => {
                     const pet = MOCK_PETS.find(p => p.id === enrollment.petId);
                     const owner = MOCK_OWNERS.find(o => o.id === enrollment.ownerId);
                     return (
                        <tr key={enrollment.id} className="hover:bg-slate-50 group">
                           <td className="px-6 py-4">
                              <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors", enrollment.checkedIn ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-green-500")}>
                                 {enrollment.checkedIn && <CheckCircle size={10}/>}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                                    <img src={pet?.photoUrl} className="h-full w-full object-cover"/>
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-900">{pet?.name}</div>
                                    <div className="text-xs text-slate-500">{owner?.name}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <Badge variant={enrollment.status === 'Enrolled' ? 'success' : enrollment.status === 'Waitlist' ? 'warning' : 'default'}>
                                 {enrollment.status}
                              </Badge>
                           </td>
                           <td className="px-6 py-4 text-slate-600 text-xs">
                              {enrollment.paymentMethod}
                           </td>
                           <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-50"><Trash2 size={14}/></Button>
                           </td>
                        </tr>
                     );
                  })}
                  {enrollments.length === 0 && (
                     <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">No enrollments yet.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Add Pet Modal */}
         <Modal isOpen={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} title={`Enroll in ${type.name}`} size="md">
            <div className="space-y-4">
               <div>
                  <Label>Search Pet or Owner</Label>
                  <div className="relative">
                     <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                     <Input placeholder="Type name..." className="pl-9"/>
                  </div>
               </div>
               
               <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {/* Mock Search Result */}
                  <div className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">B</div>
                        <div>
                           <div className="font-bold text-sm">Bella (Labrador)</div>
                           <div className="text-xs text-slate-500">Owner: Alice Johnson</div>
                        </div>
                     </div>
                     <Badge variant="outline">Has Package (2 credits left)</Badge>
                  </div>
               </div>

               <div>
                  <Label>Payment Method</Label>
                  <Select>
                     <option>Use Package Credit (1 Credit)</option>
                     <option>Charge Account ($35.00)</option>
                     <option>Single Class Drop-In ($40.00)</option>
                  </Select>
               </div>

               <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                  <Button variant="ghost" onClick={() => setIsAddPetOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsAddPetOpen(false)}>Enroll Pet</Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};
