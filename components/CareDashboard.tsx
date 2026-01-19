
import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, Utensils, Pill, CheckCircle, Circle, AlertTriangle, 
  MapPin, Clock, Printer, Sparkles, Filter, ChevronDown, Check,
  ArrowRight, LayoutGrid, List
} from 'lucide-react';
import { Card, Button, Badge, cn, Select } from './Common';
import { MOCK_CARE_TASKS, MOCK_PETS } from '../constants';
import { CareTask } from '../types';

export const CareDashboard = () => {
  const [currentShift, setCurrentShift] = useState<'AM' | 'Noon' | 'PM'>('AM');
  const [activeTab, setActiveTab] = useState<'feeding' | 'medication'>('feeding');
  const [viewMode, setViewMode] = useState<'prep' | 'distribution'>('prep');
  const [tasks, setTasks] = useState<CareTask[]>(MOCK_CARE_TASKS);

  // Derived State
  const filteredTasks = tasks.filter(t => t.shift === currentShift && (activeTab === 'feeding' ? t.type === 'Feeding' : t.type === 'Medication'));
  
  const stats = useMemo(() => {
     const total = filteredTasks.length;
     const completed = filteredTasks.filter(t => t.status === 'Completed').length;
     const prepared = filteredTasks.filter(t => t.status === 'Prepared').length;
     return { total, completed, prepared, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [filteredTasks]);

  // Actions
  const handleStatusChange = (taskId: string, newStatus: CareTask['status']) => {
     setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined } : t));
  };

  const handleBatchAction = (status: CareTask['status']) => {
     setTasks(prev => prev.map(t => {
        if (t.shift === currentShift && t.type === (activeTab === 'feeding' ? 'Feeding' : 'Medication') && t.status !== 'Completed') {
           return { ...t, status };
        }
        return t;
     }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-6">
       {/* Top Header & Stats */}
       <div className="flex justify-between items-end">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="text-red-500" size={28}/> Care Dashboard
             </h1>
             <p className="text-slate-500 mt-1">Manage feeding and medication schedules.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
             <div className="px-4 border-r border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-bold text-slate-900">{stats.percent}%</span>
                   <span className="text-xs text-slate-500">done</span>
                </div>
             </div>
             <div className="flex gap-1 p-1 bg-slate-100 rounded-md">
                {['AM', 'Noon', 'PM'].map(shift => (
                   <button
                      key={shift}
                      onClick={() => setCurrentShift(shift as any)}
                      className={cn(
                         "px-4 py-1.5 text-sm font-medium rounded transition-all",
                         currentShift === shift ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                   >
                      {shift}
                   </button>
                ))}
             </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
          <div className="flex gap-4">
             <div className="flex">
                <button 
                   onClick={() => setActiveTab('feeding')}
                   className={cn(
                      "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                      activeTab === 'feeding' ? "border-primary-600 text-primary-700 bg-primary-50" : "border-transparent text-slate-500 hover:bg-slate-50"
                   )}
                >
                   <Utensils size={16}/> Feeding
                </button>
                <button 
                   onClick={() => setActiveTab('medication')}
                   className={cn(
                      "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                      activeTab === 'medication' ? "border-red-500 text-red-700 bg-red-50" : "border-transparent text-slate-500 hover:bg-slate-50"
                   )}
                >
                   <Pill size={16}/> Medication
                </button>
             </div>
             <div className="w-px bg-slate-200 my-2"></div>
             <div className="flex items-center gap-2 px-2">
                <button 
                   onClick={() => setViewMode('prep')} 
                   className={cn("p-1.5 rounded", viewMode === 'prep' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                   title="Prep View"
                >
                   <LayoutGrid size={18}/>
                </button>
                <button 
                   onClick={() => setViewMode('distribution')} 
                   className={cn("p-1.5 rounded", viewMode === 'distribution' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                   title="Distribution View"
                >
                   <List size={18}/>
                </button>
             </div>
          </div>

          <div className="flex gap-2">
             <Button variant="ghost" size="sm" className="gap-2 text-indigo-600 hover:bg-indigo-50"><Sparkles size={14}/> AI Sort</Button>
             <Button variant="outline" size="sm" className="gap-2"><Printer size={14}/> Print Sheet</Button>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto">
          {viewMode === 'prep' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Group by Status for Prep View */}
                {['Pending', 'Prepared', 'Completed'].map(statusGroup => {
                   const groupTasks = filteredTasks.filter(t => 
                      statusGroup === 'Pending' ? t.status === 'Pending' : 
                      statusGroup === 'Prepared' ? t.status === 'Prepared' :
                      t.status === 'Completed' || t.status === 'Skipped'
                   );

                   return (
                      <div key={statusGroup} className="flex flex-col gap-3">
                         <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">{statusGroup} ({groupTasks.length})</h3>
                            {statusGroup === 'Pending' && groupTasks.length > 0 && (
                               <button onClick={() => handleBatchAction('Prepared')} className="text-[10px] text-primary-600 hover:underline">Mark All Prepared</button>
                            )}
                         </div>
                         
                         {groupTasks.map(task => (
                            <CareCard key={task.id} task={task} onStatusChange={handleStatusChange} viewMode="prep" />
                         ))}
                         
                         {groupTasks.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-lg text-slate-300 text-sm">
                               No {statusGroup.toLowerCase()} tasks
                            </div>
                         )}
                      </div>
                   )
                })}
             </div>
          ) : (
             <div className="space-y-2 max-w-4xl mx-auto">
                {/* Sorted by Location for Distribution */}
                {filteredTasks.sort((a,b) => a.unit.localeCompare(b.unit)).map(task => (
                   <CareCard key={task.id} task={task} onStatusChange={handleStatusChange} viewMode="distribution" />
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

const CareCard = ({ task, onStatusChange, viewMode }: { task: CareTask, onStatusChange: (id: string, status: CareTask['status']) => void, viewMode: 'prep' | 'distribution' }) => {
   const pet = MOCK_PETS.find(p => p.id === task.petId);
   
   // Card Colors based on type/warning
   const borderClass = task.warning ? "border-l-4 border-l-red-500" : task.type === 'Medication' ? "border-l-4 border-l-purple-500" : "border-l-4 border-l-green-500";
   
   if (viewMode === 'distribution') {
      return (
         <div className={cn("bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all", borderClass, task.status === 'Completed' && "opacity-60 bg-slate-50")}>
            <div className="flex items-center gap-4">
               <div className="w-16 font-bold text-slate-700 text-lg">{task.unit}</div>
               <div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden">
                  <img src={pet?.photoUrl} className="w-full h-full object-cover" alt="" />
               </div>
               <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                     {pet?.name}
                     {task.warning && <AlertTriangle size={14} className="text-red-500"/>}
                  </div>
                  <div className="text-sm text-slate-600">{task.description}</div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               {task.instructions && <div className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-100 max-w-[200px] truncate">{task.instructions}</div>}
               
               {task.status === 'Completed' ? (
                  <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                     <CheckCircle size={16}/> Done
                  </div>
               ) : (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(task.id, 'Completed')}>
                     Mark Given
                  </Button>
               )}
            </div>
         </div>
      )
   }

   // Prep View Card
   return (
      <Card className={cn("p-4 transition-all hover:shadow-md", borderClass, task.status === 'Completed' && "opacity-60")}>
         <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
               <img src={pet?.photoUrl} className="h-10 w-10 rounded-full object-cover bg-slate-100" alt="" />
               <div>
                  <div className="font-bold text-slate-900 text-sm">{pet?.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {task.unit}</div>
               </div>
            </div>
            {task.status === 'Pending' && <Badge variant="outline" className="bg-slate-50">To Prep</Badge>}
            {task.status === 'Prepared' && <Badge variant="info">Ready</Badge>}
            {task.status === 'Completed' && <Badge variant="success">Done</Badge>}
         </div>

         <div className="bg-slate-50 p-3 rounded border border-slate-100 mb-4">
            <div className="font-bold text-slate-800 text-lg">{task.description}</div>
            {task.instructions && <div className="text-xs text-amber-700 mt-1 font-medium flex items-start gap-1"><AlertTriangle size={10} className="mt-0.5"/> {task.instructions}</div>}
         </div>

         <div className="flex gap-2">
            {task.status === 'Pending' && (
               <Button size="sm" variant="outline" className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50" onClick={() => onStatusChange(task.id, 'Prepared')}>
                  Mark Prepared
               </Button>
            )}
            {task.status === 'Prepared' && (
               <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(task.id, 'Completed')}>
                  Mark Distributed
               </Button>
            )}
            {task.status === 'Completed' && (
               <Button size="sm" variant="ghost" className="flex-1 text-slate-400" onClick={() => onStatusChange(task.id, 'Pending')}>
                  Undo
               </Button>
            )}
         </div>
      </Card>
   );
};
