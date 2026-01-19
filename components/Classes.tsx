
import React, { useState } from 'react';
import { 
  GraduationCap, Calendar, Users, Plus, Search, Filter, 
  ChevronRight, MoreHorizontal, CheckCircle, Clock, 
  DollarSign, Edit2, Trash2, User, Dog, Settings
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
                     const type = MOCK_CLASS_TYPES.find(t => t?.id === session.classTypeId);
                     const instructor = MOCK_USERS.find(u => u?.id === session.instructorId);
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
                              <h3 className="font-bold text-slate-800 text-sm">{type?.name || 'Unknown Class'}</h3>
                              {isFull && <Badge variant="warning" className="text-[10px] py-0 px-1">Full</Badge>}
                           </div>
                           <div className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                              <Calendar size={12}/> 
                              {new Date(session.startTime).toLocaleDateString()} @ {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                 <User size={10}/> {instructor?.name || 'TBD'}
                              </div>
                              <div className="text-[10px] font-bold text-slate-600">
                                 {enrolledCount} / {session.capacity} Enrolled
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="divide-y divide-slate-100">
                  {MOCK_CLASS_TYPES.map(type => (
                     <div key={type.id} className="p-4 hover:bg-slate-50 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                           <h3 className="font-bold text-slate-800 text-sm">{type.name}</h3>
                           <Badge variant="outline">${type.defaultPrice}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{type.description}</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Main Detail View */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
         {selectedSessionId && activeTab === 'schedule' ? (
            <ClassSessionDetail sessionId={selectedSessionId} />
         ) : activeTab === 'config' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <Settings size={48} className="mb-4 opacity-20"/>
               <p>Select a class type to configure or add new.</p>
               <Button className="mt-4 gap-2" variant="outline"><Plus size={16}/> Create Class Type</Button>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap size={32} className="opacity-20"/>
               </div>
               <p>Select a class session to view roster.</p>
            </div>
         )}
      </div>

      <NewClassModal isOpen={isNewClassOpen} onClose={() => setIsNewClassOpen(false)} />
    </div>
  );
};

const ClassSessionDetail = ({ sessionId }: { sessionId: string }) => {
   const session = MOCK_CLASS_SESSIONS.find(s => s.id === sessionId);
   const type = MOCK_CLASS_TYPES.find(t => t.id === session?.classTypeId);
   const instructor = MOCK_USERS.find(u => u.id === session?.instructorId);
   const enrollments = MOCK_CLASS_ENROLLMENTS.filter(e => e.sessionId === sessionId);

   if (!session || !type) return null;

   return (
      <div className="flex flex-col h-full">
         <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">{type.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                     <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(session.startTime).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><Clock size={14}/> {new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ({session.durationMinutes}m)</span>
                     <span className="flex items-center gap-1"><User size={14}/> {instructor?.name}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" className="gap-2"><Edit2 size={16}/> Edit</Button>
                  <Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="flex-1 bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Enrollment</span>
                  <span className="font-bold text-lg text-slate-900">{enrollments.length} <span className="text-slate-400 text-sm font-normal">/ {session.capacity}</span></span>
               </div>
               <div className="flex-1 bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                  <Badge variant={session.status === 'Scheduled' ? 'info' : session.status === 'Completed' ? 'success' : 'default'}>{session.status}</Badge>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left text-sm">
               <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-3">Pet</th>
                     <th className="px-6 py-3">Owner</th>
                     <th className="px-6 py-3">Payment</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {enrollments.map(enrollment => {
                     const pet = MOCK_PETS.find(p => p?.id === enrollment.petId);
                     const owner = MOCK_OWNERS.find(o => o?.id === enrollment.ownerId);
                     
                     return (
                        <tr key={enrollment.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <img src={pet?.photoUrl} className="h-8 w-8 rounded-full object-cover" alt="" />
                                 <span className="font-medium text-slate-900">{pet?.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-slate-600">{owner?.name}</td>
                           <td className="px-6 py-4">
                              <Badge variant="outline" className="text-[10px]">{enrollment.paymentMethod}</Badge>
                           </td>
                           <td className="px-6 py-4">
                              <Badge variant={enrollment.checkedIn ? 'success' : enrollment.status === 'Enrolled' ? 'info' : 'default'}>
                                 {enrollment.checkedIn ? 'Checked In' : enrollment.status}
                              </Badge>
                           </td>
                           <td className="px-6 py-4 text-right">
                              {!enrollment.checkedIn && (
                                 <Button size="sm" variant="outline" className="h-7 text-xs">Check In</Button>
                              )}
                           </td>
                        </tr>
                     );
                  })}
                  {enrollments.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                           No enrollments yet.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button className="gap-2"><Plus size={16}/> Enroll Student</Button>
         </div>
      </div>
   );
};

const NewClassModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Schedule Class Session">
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
               <div><Label>Instructor</Label><Select>{MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></div>
               <div><Label>Capacity</Label><Input type="number" defaultValue={6}/></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={onClose}>Cancel</Button>
               <Button onClick={() => { alert('Class Scheduled'); onClose(); }}>Schedule</Button>
            </div>
         </div>
      </Modal>
   );
};
