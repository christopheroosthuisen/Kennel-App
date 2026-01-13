
import React, { useState } from 'react';
import { 
  GitBranch, Play, Pause, Plus, MoreHorizontal, Search, 
  Settings, Zap, CheckCircle, XCircle, Clock, AlertTriangle, 
  Box, FileJson, Lock, Eye, EyeOff, Save, ArrowRight,
  GitCommit, RefreshCw, LayoutTemplate, Copy
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Label, Tabs, Switch, cn } from './Common';
import { Workflow, WorkflowStep } from '../../shared/domain';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

// --- Sub-components ---

const WorkflowBuilder = ({ workflow, onBack }: { workflow: Workflow, onBack: () => void }) => {
  // Parse steps if they are a string (as stored in DB), or default to empty array
  const initialSteps: WorkflowStep[] = typeof workflow.steps === 'string' 
    ? JSON.parse(workflow.steps || '[]') 
    : (workflow.steps || []);

  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [env, setEnv] = useState('production'); // simplified
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Builder Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">← Back</Button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {workflow.name}
              <Badge variant="outline">{env.toUpperCase()}</Badge>
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Zap size={12} /> Trigger: {workflow.triggerType}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setIsSimulateOpen(true)} className="gap-2"><Play size={14}/> Simulate</Button>
          <Button className="gap-2"><Save size={14}/> Publish</Button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
         {/* Trigger Node */}
         <div className="w-80 p-4 bg-slate-900 text-white rounded-xl shadow-lg relative group">
            <div className="flex justify-between items-center">
               <span className="font-bold text-sm">Trigger</span>
               <Settings size={14} className="opacity-50 cursor-pointer hover:opacity-100"/>
            </div>
            <div className="mt-2 text-sm font-medium flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> {workflow.triggerType}</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
         </div>

         {steps.map((step, index) => (
           <React.Fragment key={index}>
             <div className="w-80 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group hover:border-primary-400 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <Badge variant="outline" className="text-[10px] uppercase">{step.type}</Badge>
                </div>
                <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
                   <Box size={16} className="text-slate-500"/>
                   {step.name}
                </div>
                {index < steps.length - 1 && (
                   <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
                )}
             </div>
             <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-primary-500 hover:text-white transition-colors z-10">
                <Plus size={10}/>
             </div>
           </React.Fragment>
         ))}

         <Button variant="outline" className="mt-4 border-dashed gap-2"><Plus size={14}/> Add Step</Button>
      </div>

      {/* Simulation Modal */}
      <Modal isOpen={isSimulateOpen} onClose={() => setIsSimulateOpen(false)} title="Simulate Workflow" size="lg">
         <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
               Test this workflow safely. No external emails or messages will be sent.
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>Mock Trigger Data (JSON)</Label>
                  <textarea className="w-full h-64 font-mono text-xs p-3 border rounded-md bg-slate-50" defaultValue={JSON.stringify({
                     event: "test",
                     timestamp: new Date().toISOString()
                  }, null, 2)} />
               </div>
               <div>
                  <Label>Simulation Output</Label>
                  <div className="w-full h-64 font-mono text-xs p-3 border rounded-md bg-slate-900 text-green-400 overflow-y-auto">
                     {`> Starting simulation...
> Trigger matched
> Done.`}
                  </div>
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

// --- Views ---

const WorkflowsList = ({ onSelect }: { onSelect: (w: Workflow) => void }) => {
  const { data: workflows = [] } = useApiQuery('workflows', api.listWorkflows);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
     await api.createWorkflow({ name: newName, triggerType: 'Event' });
     setIsNewOpen(false);
     window.location.reload(); // simple refresh
  };

  return (
  <div className="space-y-4 animate-in fade-in duration-300">
     <div className="flex justify-between items-center">
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <Input placeholder="Search workflows..." className="pl-9" />
        </div>
        <Button className="gap-2" onClick={() => setIsNewOpen(true)}><Plus size={16}/> New Workflow</Button>
     </div>

     <div className="grid grid-cols-1 gap-4">
        {workflows.map(wf => (
           <Card key={wf.id} className="p-4 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer" onClick={() => onSelect(wf)}>
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-full", wf.isEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                    <GitCommit size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">{wf.name}</h3>
                    <p className="text-sm text-slate-500">{wf.triggerType}</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <Badge variant={wf.isEnabled ? 'success' : 'default'} className="capitalize w-20 justify-center">
                    {wf.isEnabled ? 'Active' : 'Draft'}
                 </Badge>
              </div>
           </Card>
        ))}
     </div>

     <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Create Workflow">
        <div className="space-y-4">
           <div><Label>Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
           <Button className="w-full" onClick={handleCreate}>Create</Button>
        </div>
     </Modal>
  </div>
  );
};

const RunsHistory = () => {
  const { data: runs = [] } = useApiQuery('runs', api.listWorkflowRuns);

  return (
  <div className="space-y-4 animate-in fade-in duration-300">
     <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
              <tr>
                 <th className="px-6 py-3">Run ID</th>
                 <th className="px-6 py-3">Workflow</th>
                 <th className="px-6 py-3">Started</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {runs.map(run => (
                 <tr key={run.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">#{run.id.slice(-6)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{run.workflowName}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(run.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <Badge variant={
                          run.status === 'Completed' ? 'success' : 
                          run.status === 'Failed' ? 'danger' : 'info'
                       }>
                          {run.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm">Log</Button>
                    </td>
                 </tr>
              ))}
              {runs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No runs found.</td></tr>}
           </tbody>
        </table>
     </Card>
  </div>
  );
};

export const Automations = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  if (selectedWorkflow) {
    return <WorkflowBuilder workflow={selectedWorkflow} onBack={() => setSelectedWorkflow(null)} />;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
         <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
         <p className="text-slate-500">Manage workflows, triggers, and integrations.</p>
      </div>

      <div className="flex-1 flex flex-col">
         <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab}
            tabs={[
               { id: 'workflows', label: 'Workflows' },
               { id: 'runs', label: 'Run History' },
            ]}
         />
         
         <div className="flex-1 overflow-y-auto pt-6">
            {activeTab === 'workflows' && <WorkflowsList onSelect={setSelectedWorkflow} />}
            {activeTab === 'runs' && <RunsHistory />}
         </div>
      </div>
    </div>
  );
};
