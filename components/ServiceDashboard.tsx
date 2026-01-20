
import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, Filter, Clock, Calendar, Search, AlertTriangle, 
  Dog, User, MoreHorizontal, CheckCircle, Circle, Play,
  Scissors, Zap, Pill, Award, LayoutList, Kanban, ChevronRight
} from 'lucide-react';
import { Card, Button, Badge, cn, Select, Modal, Label, Textarea, Input } from './Common';
import { MOCK_USERS } from '../constants';
import { ServiceTask, ServiceDepartment, ReservationStatus, ServiceType } from '../types';
import { useData } from './DataContext';

export const ServiceDashboard = () => {
  const { reservations, pets } = useData();
  const [viewMode, setViewMode] = useState<'timeline' | 'board'>('board');
  const [selectedDept, setSelectedDept] = useState<ServiceDepartment | 'All'>('All');
  const [assignedUser, setAssignedUser] = useState<string>('all'); // 'all' or user ID
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);

  // Dynamic Task Generation
  const serviceTasks = useMemo(() => {
    const tasks: ServiceTask[] = [];
    const now = new Date(); // In a real app, this would be based on the reservation dates

    reservations.forEach(res => {
      // Only generate for checked-in or expected
      if (res.status !== ReservationStatus.CheckedIn && res.status !== ReservationStatus.Expected) return;

      const pet = pets.find(p => p.id === res.petId);
      
      // 1. Core Service Task
      if (res.type === ServiceType.Grooming) {
        tasks.push({
          id: `t-${res.id}-main`,
          reservationId: res.id,
          petId: res.petId,
          department: 'Grooming',
          name: 'Full Groom',
          status: 'In Progress',
          scheduledTime: new Date(new Date().setHours(10, 0)).toISOString(), // Mock time
          durationMinutes: 90,
          assignedTo: 'u2'
        });
      }

      // 2. Training Program Tasks
      if (res.type === ServiceType.Training || pet?.activeProgram) {
         tasks.push({
          id: `t-${res.id}-train`,
          reservationId: res.id,
          petId: res.petId,
          department: 'Training',
          name: pet?.activeProgram ? `Program Session: ${pet.activeProgram}` : 'Obedience 1-on-1',
          programName: pet?.activeProgram,
          status: 'Pending',
          scheduledTime: new Date(new Date().setHours(14, 0)).toISOString(),
          durationMinutes: 45,
          assignedTo: 'u3'
        });
      }

      // 3. Add-on Services Exploded into Tasks
      res.services.forEach((svc, i) => {
        let dept: ServiceDepartment = 'Enrichment';
        if (svc.includes('Bath') || svc.includes('Nail')) dept = 'Grooming';
        if (svc.includes('Walk') || svc.includes('Play')) dept = 'Enrichment';
        if (svc.includes('Med')) dept = 'Medical';

        tasks.push({
          id: `t-${res.id}-${i}`,
          reservationId: res.id,
          petId: res.petId,
          department: dept,
          name: svc,
          status: i % 2 === 0 ? 'Completed' : 'Pending', // Random status for demo
          scheduledTime: new Date(new Date().setHours(9 + i, 30)).toISOString(),
          durationMinutes: 15,
          assignedTo: 'u1'
        });
      });
    });

    return tasks.sort((a,b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [reservations, pets]);

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return serviceTasks.filter(task => {
      const pet = pets.find(p => p.id === task.petId);
      const matchesSearch = !search || 
         task.name.toLowerCase().includes(search.toLowerCase()) || 
         pet?.name.toLowerCase().includes(search.toLowerCase());
      const matchesDept = selectedDept === 'All' || task.department === selectedDept;
      const matchesUser = assignedUser === 'all' || task.assignedTo === assignedUser;

      return matchesSearch && matchesDept && matchesUser;
    });
  }, [serviceTasks, search, selectedDept, assignedUser, pets]);

  // Derived Stats
  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'Pending').length,
    completed: filteredTasks.filter(t => t.status === 'Completed').length,
    programs: filteredTasks.filter(t => t.programName).length
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-4 animate-in fade-in duration-300">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="text-primary-600"/> Service Dashboard
             </h1>
             <p className="text-slate-500 text-sm">Manage grooming, training, and enrichment tasks.</p>
          </div>
          
          <div className="flex gap-2 items-center">
             <div className="bg-slate-100 p-1 rounded-lg flex">
                <button 
                   onClick={() => setViewMode('board')} 
                   className={cn("p-2 rounded-md transition-all", viewMode === 'board' ? "bg-white shadow text-primary-700" : "text-slate-500 hover:text-slate-700")}
                   title="Department Board"
                >
                   <Kanban size={18}/>
                </button>
                <button 
                   onClick={() => setViewMode('timeline')} 
                   className={cn("p-2 rounded-md transition-all", viewMode === 'timeline' ? "bg-white shadow text-primary-700" : "text-slate-500 hover:text-slate-700")}
                   title="Timeline View"
                >
                   <LayoutList size={18}/>
                </button>
             </div>
             
             <Select 
                className="w-48" 
                value={assignedUser} 
                onChange={(e) => setAssignedUser(e.target.value)}
             >
                <option value="all">All Staff</option>
                {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </Select>
          </div>
       </div>

       {/* Stats Bar */}
       <div className="grid grid-cols-4 gap-4">
          <Card className="p-3 flex items-center justify-between bg-blue-50 border-blue-100">
             <div className="text-sm font-bold text-blue-800">Total Tasks</div>
             <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </Card>
          <Card className="p-3 flex items-center justify-between bg-amber-50 border-amber-100">
             <div className="text-sm font-bold text-amber-800">Pending</div>
             <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
          </Card>
          <Card className="p-3 flex items-center justify-between bg-purple-50 border-purple-100">
             <div className="text-sm font-bold text-purple-800">Training Sessions</div>
             <div className="text-2xl font-bold text-purple-900">{stats.programs}</div>
          </Card>
          <Card className="p-3 flex items-center justify-between bg-green-50 border-green-100">
             <div className="text-sm font-bold text-green-800">Completed</div>
             <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </Card>
       </div>

       {/* Filter Toolbar */}
       <div className="flex gap-4 items-center">
          <div className="flex gap-2">
             {['All', 'Grooming', 'Training', 'Enrichment', 'Medical'].map(dept => (
                <button
                   key={dept}
                   onClick={() => setSelectedDept(dept as any)}
                   className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                      selectedDept === dept 
                         ? "bg-slate-800 text-white border-slate-800" 
                         : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                   )}
                >
                   {dept}
                </button>
             ))}
          </div>
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
             <Input 
                placeholder="Search tasks or pets..." 
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
          </div>
       </div>

       {/* Main View Area */}
       <div className="flex-1 overflow-hidden">
          {viewMode === 'board' ? (
             <DepartmentBoard tasks={filteredTasks} onTaskClick={setSelectedTask} pets={pets} />
          ) : (
             <TaskTimeline tasks={filteredTasks} onTaskClick={setSelectedTask} pets={pets} />
          )}
       </div>

       {/* Task Detail Modal */}
       <ServiceTaskModal task={selectedTask} onClose={() => setSelectedTask(null)} pets={pets} />
    </div>
  );
};

// --- Sub-Components ---

const DepartmentBoard = ({ tasks, onTaskClick, pets }: { tasks: ServiceTask[], onTaskClick: (t: ServiceTask) => void, pets: any[] }) => {
   const departments: { id: ServiceDepartment, icon: any, color: string }[] = [
      { id: 'Training', icon: Award, color: 'bg-purple-100 text-purple-700' },
      { id: 'Grooming', icon: Scissors, color: 'bg-pink-100 text-pink-700' },
      { id: 'Enrichment', icon: Zap, color: 'bg-orange-100 text-orange-700' },
      { id: 'Medical', icon: Pill, color: 'bg-red-100 text-red-700' },
   ];

   return (
      <div className="flex h-full gap-4 overflow-x-auto pb-2">
         {departments.map(dept => {
            const deptTasks = tasks.filter(t => t.department === dept.id);
            return (
               <div key={dept.id} className="min-w-[320px] flex-1 flex flex-col bg-slate-50 rounded-xl border border-slate-200 h-full">
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                     <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md", dept.color)}>
                           <dept.icon size={16}/>
                        </div>
                        <span className="font-bold text-slate-700">{dept.id}</span>
                     </div>
                     <Badge variant="outline">{deptTasks.length}</Badge>
                  </div>
                  
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                     {deptTasks.length > 0 ? deptTasks.map(task => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} pets={pets} />
                     )) : (
                        <div className="text-center py-10 text-slate-400 text-sm italic">
                           No tasks
                        </div>
                     )}
                  </div>
               </div>
            )
         })}
      </div>
   );
};

const TaskTimeline = ({ tasks, onTaskClick, pets }: { tasks: ServiceTask[], onTaskClick: (t: ServiceTask) => void, pets: any[] }) => {
   // Group by hour
   const grouped = useMemo(() => {
      const groups: Record<string, ServiceTask[]> = {};
      tasks.forEach(t => {
         const hour = new Date(t.scheduledTime).getHours();
         const key = `${hour}:00`;
         if (!groups[key]) groups[key] = [];
         groups[key].push(t);
      });
      return groups;
   }, [tasks]);

   const hours = Object.keys(grouped).sort((a,b) => parseInt(a) - parseInt(b));

   return (
      <Card className="h-full overflow-y-auto p-6">
         <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
            {hours.map(hour => (
               <div key={hour} className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-200 border-2 border-white"></div>
                  <h3 className="font-bold text-slate-500 mb-4">{hour}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {grouped[hour].map(task => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} pets={pets} />
                     ))}
                  </div>
               </div>
            ))}
            {hours.length === 0 && (
               <div className="pl-8 text-slate-400 italic">No tasks scheduled for this filter.</div>
            )}
         </div>
      </Card>
   );
};

interface TaskCardProps {
  task: ServiceTask;
  onClick: () => void;
  pets: any[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, pets }) => {
   const pet = pets.find(p => p.id === task.petId);
   const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
   
   const hasAlerts = pet?.alerts && pet.alerts.length > 0;

   return (
      <div 
         onClick={onClick}
         className={cn(
            "bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden",
            task.status === 'Completed' ? "border-green-200 opacity-70" : "border-slate-200 hover:border-primary-300",
            task.programName ? "border-l-4 border-l-purple-500" : ""
         )}
      >
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <img src={pet?.photoUrl} className="h-10 w-10 rounded-full object-cover bg-slate-100" alt=""/>
                  {hasAlerts && (
                     <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-white" title="Has Alerts">
                        <AlertTriangle size={10}/>
                     </div>
                  )}
               </div>
               <div>
                  <div className="font-bold text-slate-800 text-sm">{pet?.name}</div>
                  <div className="text-xs text-slate-500">{pet?.breed}</div>
               </div>
            </div>
            {task.status === 'Completed' ? (
               <CheckCircle size={18} className="text-green-500"/>
            ) : (
               <Circle size={18} className="text-slate-300 group-hover:text-primary-400"/>
            )}
         </div>

         <div className="space-y-1">
            <div className="font-semibold text-sm text-slate-900 leading-tight">{task.name}</div>
            {task.programName && (
               <div className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded w-fit font-medium">
                  {task.programName}
               </div>
            )}
         </div>

         <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1">
               <Clock size={12}/> {new Date(task.scheduledTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </div>
            {assignee && (
               <div className="flex items-center gap-1" title={`Assigned to ${assignee.name}`}>
                  <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-600">
                     {assignee.name.charAt(0)}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

const ServiceTaskModal = ({ task, onClose, pets }: { task: ServiceTask | null, onClose: () => void, pets: any[] }) => {
   const { owners } = useData();
   if (!task) return null;
   const pet = pets.find(p => p.id === task.petId);
   const owner = owners.find(o => o.id === pet?.ownerId);

   return (
      <Modal isOpen={!!task} onClose={onClose} title="Service Details">
         <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
               <img src={pet?.photoUrl} className="h-16 w-16 rounded-lg object-cover" alt=""/>
               <div>
                  <h3 className="font-bold text-lg text-slate-900">{pet?.name}</h3>
                  <div className="text-sm text-slate-600">{pet?.breed} • {pet?.gender}</div>
                  <div className="flex gap-2 mt-2">
                     {pet?.alerts.map(a => <Badge key={a} variant="danger">{a}</Badge>)}
                     <Badge variant="outline">Owner: {owner?.name}</Badge>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <Label>Service Task</Label>
                  <div className="font-bold text-xl text-slate-800">{task.name}</div>
                  <div className="flex gap-2 text-sm text-slate-500 mt-1">
                     <span className="bg-slate-100 px-2 py-0.5 rounded">{task.department}</span>
                     {task.programName && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">{task.programName}</span>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label>Status</Label>
                     <Select defaultValue={task.status}>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Skipped</option>
                     </Select>
                  </div>
                  <div>
                     <Label>Assigned To</Label>
                     <Select defaultValue={task.assignedTo || ''}>
                        <option value="">Unassigned</option>
                        {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                     </Select>
                  </div>
               </div>

               <div>
                  <Label>Completion Notes / Behavior Log</Label>
                  <Textarea placeholder="How did the session go? Any behavioral notes?" className="h-32"/>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
               <Button variant="ghost" onClick={onClose}>Close</Button>
               <Button onClick={() => { alert('Task Updated'); onClose(); }} className="gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle size={16}/> Complete Task
               </Button>
            </div>
         </div>
      </Modal>
   );
};
