
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Clock, CheckSquare, Settings, Plus, 
  ChevronLeft, ChevronRight, User, MoreHorizontal, Filter,
  Play, Square, AlertTriangle, Briefcase, LayoutList, Kanban,
  CheckCircle, Circle, Save, RefreshCw
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, cn, Modal, Label, Tabs, Switch, Textarea } from './Common';
import { MOCK_USERS } from '../constants';

// --- Types ---

type Role = 'Manager' | 'Kennel Tech' | 'Front Desk' | 'Trainer' | 'Groomer';

interface Shift {
  id: string;
  userId: string;
  start: Date;
  end: Date;
  role: Role;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  role: Role;
  status: 'To Do' | 'In Progress' | 'Done';
  assigneeId?: string; // Optional specific assignee
  dueDate?: string;
}

interface StaffRatio {
  serviceType: string;
  ratio: number; // e.g., 15 dogs per 1 staff
  currentCount: number; // Mocked current dog count
}

// --- Mock Data ---

const ROLES: Role[] = ['Manager', 'Kennel Tech', 'Front Desk', 'Trainer', 'Groomer'];

const MOCK_SHIFTS: Shift[] = [
  { id: 's1', userId: 'u1', start: new Date(new Date().setHours(8, 0)), end: new Date(new Date().setHours(16, 0)), role: 'Manager', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  { id: 's2', userId: 'u2', start: new Date(new Date().setHours(7, 0)), end: new Date(new Date().setHours(15, 0)), role: 'Kennel Tech', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  { id: 's3', userId: 'u3', start: new Date(new Date().setHours(12, 0)), end: new Date(new Date().setHours(20, 0)), role: 'Kennel Tech', color: 'bg-blue-100 border-blue-200 text-blue-800' },
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Morning Feeding', role: 'Kennel Tech', status: 'Done', assigneeId: 'u2' },
  { id: 't2', title: 'Clean Play Yard 1', role: 'Kennel Tech', status: 'In Progress', assigneeId: 'u2' },
  { id: 't3', title: 'Check Voicemails', role: 'Front Desk', status: 'To Do' },
  { id: 't4', title: 'Inventory Count', role: 'Manager', status: 'To Do', assigneeId: 'u1' },
  { id: 't5', title: 'Afternoon Meds', role: 'Kennel Tech', status: 'To Do' },
];

// --- Sub-Components ---

const TimeClock = () => {
  const [status, setStatus] = useState<'in' | 'out'>('out');
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: any;
    if (status === 'in' && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    if (status === 'out') {
      setStatus('in');
      setStartTime(new Date());
    } else {
      setStatus('out');
      setStartTime(null);
      // Logic to save shift would go here
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in duration-300">
       <div className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
       </div>
       <div className="text-6xl font-mono font-bold text-slate-900 mb-8 tabular-nums">
          {new Date().toLocaleTimeString()}
       </div>

       <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md text-center">
          <div className="mb-6">
             <div className="h-20 w-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-slate-600">
                JD
             </div>
             <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
             <p className="text-slate-500">Manager</p>
          </div>

          {status === 'in' && (
             <div className="mb-6">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Current Session</div>
                <div className="text-4xl font-mono font-bold text-green-600">{formatTime(elapsed)}</div>
                <div className="text-xs text-slate-400 mt-2">Started at {startTime?.toLocaleTimeString()}</div>
             </div>
          )}

          <button 
             onClick={handleToggle}
             className={cn(
                "w-full h-16 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3",
                status === 'out' 
                   ? "bg-green-500 hover:bg-green-600 text-white" 
                   : "bg-red-500 hover:bg-red-600 text-white"
             )}
          >
             {status === 'out' ? <Play size={24} fill="currentColor" /> : <Square size={24} fill="currentColor" />}
             {status === 'out' ? "Clock In" : "Clock Out"}
          </button>
       </div>

       <div className="mt-8 max-w-md w-full">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Activity</h4>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
             {[1,2,3].map(i => (
                <div key={i} className="flex justify-between p-3 border-b border-slate-100 last:border-0 text-sm">
                   <span className="text-slate-600">Oct {25-i}</span>
                   <span className="font-mono">08:00 AM - 04:30 PM</span>
                   <span className="font-bold text-slate-800">8.5h</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const SmartScheduler = ({ ratios }: { ratios: StaffRatio[] }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Generate Week Days
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i + (weekOffset * 7));
    return d;
  });

  // Calculate Coverage vs Ratios
  const staffNeeded = ratios.reduce((acc, curr) => acc + Math.ceil(curr.currentCount / curr.ratio), 0);
  const staffScheduled = shifts.length; // Simplified for demo
  const coveragePercent = Math.min(100, Math.round((staffScheduled / staffNeeded) * 100));

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
       {/* Toolbar */}
       <div className="flex justify-between items-center mb-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-slate-100 rounded-md p-1">
                <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}><ChevronLeft size={16}/></Button>
                <span className="px-3 font-medium text-sm w-32 text-center">
                   {days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}><ChevronRight size={16}/></Button>
             </div>
             <Button variant="outline" className="gap-2"><RefreshCw size={14}/> Auto-Schedule</Button>
          </div>

          <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Coverage</span>
                <div className="flex items-center gap-2">
                   <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", coveragePercent < 80 ? "bg-red-500" : "bg-green-500")} 
                        style={{ width: `${coveragePercent}%` }}
                      />
                   </div>
                   <span className={cn("text-sm font-bold", coveragePercent < 80 ? "text-red-600" : "text-green-600")}>{coveragePercent}%</span>
                </div>
             </div>
             <div className="h-8 w-px bg-slate-200"></div>
             <Button onClick={() => setIsShiftModalOpen(true)} className="gap-2"><Plus size={16}/> Add Shift</Button>
          </div>
       </div>

       {/* Schedule Grid */}
       <Card className="flex-1 overflow-auto border-slate-300 shadow-inner bg-slate-50">
          <div className="min-w-[1000px]">
             {/* Header */}
             <div className="grid grid-cols-8 sticky top-0 z-10 bg-white shadow-sm">
                <div className="p-3 border-b border-r border-slate-200 font-bold text-slate-500 text-xs uppercase bg-slate-50 flex items-center">Employee</div>
                {days.map(d => (
                   <div key={d.toISOString()} className={cn("p-2 border-b border-r border-slate-200 text-center", d.toDateString() === new Date().toDateString() ? "bg-blue-50" : "")}>
                      <div className="font-bold text-slate-700">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                      <div className="text-xs text-slate-500">{d.getDate()}</div>
                   </div>
                ))}
             </div>

             {/* Rows */}
             {MOCK_USERS.map(user => (
                <div key={user.id} className="grid grid-cols-8 bg-white hover:bg-slate-50 transition-colors">
                   <div className="p-3 border-b border-r border-slate-200 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                         <div className="font-bold text-sm text-slate-800">{user.name}</div>
                         <div className="text-[10px] text-slate-500">{user.role}</div>
                      </div>
                   </div>
                   
                   {days.map(day => {
                      const userShift = shifts.find(s => 
                         s.userId === user.id && 
                         s.start.toDateString() === day.toDateString()
                      );

                      return (
                         <div key={day.toISOString()} className="p-1 border-b border-r border-slate-100 h-16 relative">
                            {userShift ? (
                               <div className={cn("w-full h-full rounded p-1.5 text-xs border shadow-sm cursor-pointer hover:brightness-95 transition-all", userShift.color)}>
                                  <div className="font-bold">{userShift.start.getHours()}:00 - {userShift.end.getHours()}:00</div>
                                  <div className="opacity-80 truncate">{userShift.role}</div>
                               </div>
                            ) : (
                               <div className="w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer">
                                  <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-primary-100 hover:text-primary-600 transition-colors">
                                     <Plus size={14}/>
                                  </div>
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             ))}
             
             {/* Totals Row */}
             <div className="grid grid-cols-8 bg-slate-50 border-t border-slate-200">
                <div className="p-3 font-bold text-xs text-slate-500 text-right uppercase">Total Hrs</div>
                {days.map(d => (
                   <div key={d.toISOString()} className="p-3 text-center text-xs font-mono text-slate-600">
                      {Math.floor(Math.random() * 20 + 10)}h
                   </div>
                ))}
             </div>
          </div>
       </Card>

       <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Add Shift">
          <div className="space-y-4">
             <div>
                <Label>Staff Member</Label>
                <Select>
                   {MOCK_USERS.map(u => <option key={u.id}>{u.name}</option>)}
                </Select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><Label>Date</Label><Input type="date" /></div>
                <div><Label>Role</Label><Select>{ROLES.map(r => <option key={r}>{r}</option>)}</Select></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="time" defaultValue="08:00" /></div>
                <div><Label>End Time</Label><Input type="time" defaultValue="16:00" /></div>
             </div>
             <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                <Button variant="ghost" onClick={() => setIsShiftModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsShiftModalOpen(false)}>Save Shift</Button>
             </div>
          </div>
       </Modal>
    </div>
  );
};

const TaskBoard = () => {
   const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
   const [filterRole, setFilterRole] = useState<string>('All');

   const filteredTasks = filterRole === 'All' ? tasks : tasks.filter(t => t.role === filterRole);

   const columns = [
      { id: 'To Do', color: 'bg-slate-100 border-slate-200' },
      { id: 'In Progress', color: 'bg-blue-50 border-blue-100' },
      { id: 'Done', color: 'bg-green-50 border-green-100' }
   ];

   return (
      <div className="h-full flex flex-col animate-in fade-in duration-300">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600">Filter by Role:</span>
               <Select 
                  className="w-40 h-8 text-xs" 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
               >
                  <option value="All">All Roles</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
               </Select>
            </div>
            <Button className="gap-2"><Plus size={16}/> New Task</Button>
         </div>

         <div className="flex-1 overflow-x-auto">
            <div className="flex h-full gap-4 min-w-[800px]">
               {columns.map(col => (
                  <div key={col.id} className="flex-1 flex flex-col bg-slate-50/50 rounded-lg border border-slate-200 h-full">
                     <div className={cn("p-3 font-bold text-sm text-slate-700 uppercase tracking-wider border-b", col.color)}>
                        {col.id} <span className="text-slate-400 ml-1">({filteredTasks.filter(t => t.status === col.id).length})</span>
                     </div>
                     <div className="p-3 space-y-3 overflow-y-auto flex-1">
                        {filteredTasks.filter(t => t.status === col.id).map(task => (
                           <Card key={task.id} className="p-3 hover:shadow-md cursor-grab active:cursor-grabbing border-l-4 border-l-primary-500">
                              <div className="flex justify-between items-start mb-1">
                                 <Badge variant="outline" className="text-[10px] py-0">{task.role}</Badge>
                                 <MoreHorizontal size={14} className="text-slate-400 cursor-pointer hover:text-slate-600"/>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-2">{task.title}</h4>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                 <div className="flex -space-x-2">
                                    {task.assigneeId ? (
                                       <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-white" title={MOCK_USERS.find(u=>u.id===task.assigneeId)?.name}>
                                          {MOCK_USERS.find(u=>u.id===task.assigneeId)?.name.charAt(0)}
                                       </div>
                                    ) : (
                                       <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] border border-white border-dashed">?</div>
                                    )}
                                 </div>
                                 <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock size={10}/> Today
                                 </div>
                              </div>
                           </Card>
                        ))}
                        <Button variant="ghost" className="w-full text-slate-400 border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-600">+ Add</Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

// --- Main Team Management Component ---

export const TeamManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'schedule';
  
  // Read-only ratios for the scheduler visualization
  const ratios: StaffRatio[] = [
    { serviceType: 'Daycare', ratio: 15, currentCount: 42 },
    { serviceType: 'Boarding', ratio: 20, currentCount: 28 },
    { serviceType: 'Training', ratio: 8, currentCount: 12 },
  ];

  const setTab = (tab: string) => {
     setSearchParams({ tab });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
       <div className="w-64 shrink-0 flex flex-col gap-2">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">Team & Staff</h1>
             <p className="text-slate-500 text-sm">Manage shifts, tasks, and tracking.</p>
          </div>

          <div className="space-y-1 mt-4">
             <button 
                onClick={() => setTab('schedule')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeTab === 'schedule' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
             >
                <Calendar size={18}/> Schedule
             </button>
             <button 
                onClick={() => setTab('tasks')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeTab === 'tasks' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
             >
                <CheckSquare size={18}/> Task Board
             </button>
             <button 
                onClick={() => setTab('clock')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeTab === 'clock' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
             >
                <Clock size={18}/> Time Clock
             </button>
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-200">
             <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <Settings size={16}/> Configure Ratios
             </Link>
          </div>
       </div>

       <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {activeTab === 'schedule' && <SmartScheduler ratios={ratios} />}
          {activeTab === 'tasks' && <TaskBoard />}
          {activeTab === 'clock' && <TimeClock />}
       </div>
    </div>
  );
};
