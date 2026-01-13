
import React, { useState } from 'react';
import { 
  GitBranch, Play, Pause, Plus, MoreHorizontal, Search, 
  Settings, Zap, CheckCircle, XCircle, Clock, AlertTriangle, 
  Box, FileJson, Lock, Eye, EyeOff, Save, ArrowRight,
  GitCommit, RefreshCw, LayoutTemplate, Copy
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Label, Tabs, Switch, cn } from './Common';
import { MOCK_WORKFLOWS, MOCK_WORKFLOW_RUNS, MOCK_TEMPLATES, MOCK_VARIABLES } from '../constants';
import { Workflow, WorkflowStep } from '../types';

// --- Sub-components ---

const WorkflowBuilder = ({ workflow, onBack }: { workflow: Workflow, onBack: () => void }) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps);
  const [env, setEnv] = useState(workflow.environment);
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
              <Zap size={12} /> Trigger: {workflow.trigger.type} ({workflow.trigger.details})
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-slate-100 rounded-lg p-1 flex mr-2">
             {['draft', 'staging', 'production'].map(e => (
               <button 
                 key={e}
                 onClick={() => setEnv(e as any)}
                 className={cn("px-3 py-1 text-xs font-medium rounded-md capitalize transition-all", env === e ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
               >
                 {e}
               </button>
             ))}
          </div>
          <Button variant="outline" onClick={() => setIsSimulateOpen(true)} className="gap-2"><Play size={14}/> Simulate</Button>
          <Button className="gap-2"><Save size={14}/> Publish</Button>
        </div>
      </div>

      {/* Visual Canvas (Simplified List View) */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
         {/* Trigger Node */}
         <div className="w-80 p-4 bg-slate-900 text-white rounded-xl shadow-lg relative group">
            <div className="flex justify-between items-center">
               <span className="font-bold text-sm">Trigger</span>
               <Settings size={14} className="opacity-50 cursor-pointer hover:opacity-100"/>
            </div>
            <div className="mt-2 text-sm font-medium flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> {workflow.trigger.details}</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
         </div>

         {steps.map((step, index) => (
           <React.Fragment key={step.id}>
             <div className="w-80 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group hover:border-primary-400 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <Badge variant="outline" className="text-[10px] uppercase">{step.type}</Badge>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Settings size={12}/></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400"><XCircle size={12}/></Button>
                   </div>
                </div>
                <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
                   {step.type === 'Delay' ? <Clock size={16} className="text-orange-500"/> : 
                    step.type === 'Condition' ? <GitBranch size={16} className="text-purple-500"/> : 
                    step.type === 'Approval' ? <CheckCircle size={16} className="text-blue-500"/> :
                    <Box size={16} className="text-slate-500"/>}
                   {step.name}
                </div>
                {index < steps.length - 1 && (
                   <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300"></div>
                )}
             </div>
             
             {/* Add Button Interstitial */}
             <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-primary-500 hover:text-white transition-colors z-10">
                <Plus size={10}/>
             </div>
           </React.Fragment>
         ))}

         <Button variant="outline" className="mt-4 border-dashed gap-2"><Plus size={14}/> Add End Step</Button>
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
                     event: "owner.created",
                     data: { id: "o1", name: "Alice", email: "alice@example.com" },
                     timestamp: new Date().toISOString()
                  }, null, 2)} />
               </div>
               <div>
                  <Label>Simulation Output</Label>
                  <div className="w-full h-64 font-mono text-xs p-3 border rounded-md bg-slate-900 text-green-400 overflow-y-auto">
                     {`> Starting simulation...
> Trigger matched: Owner Created
> Step 1 (Send Email): WOULD_SEND to alice@example.com
> Step 2 (Delay): Skipping 24h delay in dry-run
> Step 3 (Task): WOULD_CREATE task "Verify Vax"
> Simulation Complete. Success.`}
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
               <Button variant="ghost" onClick={() => setIsSimulateOpen(false)}>Close</Button>
               <Button onClick={() => {}} className="gap-2"><Play size={14}/> Run Test</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

// --- Views ---

const WorkflowsList = ({ onSelect }: { onSelect: (w: Workflow) => void }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
     <div className="flex justify-between items-center">
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <Input placeholder="Search workflows..." className="pl-9" />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><GitBranch size={16}/> Tags</Button>
           <Button className="gap-2"><Plus size={16}/> New Workflow</Button>
        </div>
     </div>

     <div className="grid grid-cols-1 gap-4">
        {MOCK_WORKFLOWS.map(wf => (
           <Card key={wf.id} className="p-4 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer" onClick={() => onSelect(wf)}>
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-full", wf.isEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                    <GitCommit size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">{wf.name}</h3>
                    <p className="text-sm text-slate-500">{wf.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                       <span>{wf.steps.length} steps</span>
                       <span>•</span>
                       <span>Updated {wf.lastEdited}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                    <div className="text-xs font-bold uppercase text-slate-400">Success Rate</div>
                    <div className={cn("font-bold", wf.stats.successRate > 90 ? "text-green-600" : "text-red-500")}>{wf.stats.successRate}%</div>
                 </div>
                 <div className="text-right hidden md:block">
                    <div className="text-xs font-bold uppercase text-slate-400">24h Runs</div>
                    <div className="font-bold text-slate-800">{wf.stats.runsLast24h}</div>
                 </div>
                 <Badge variant={wf.environment === 'production' ? 'success' : wf.environment === 'staging' ? 'warning' : 'default'} className="capitalize w-20 justify-center">
                    {wf.environment}
                 </Badge>
                 <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal size={16}/></Button>
              </div>
           </Card>
        ))}
     </div>
  </div>
);

const RunsHistory = () => (
  <div className="space-y-4 animate-in fade-in duration-300">
     <div className="flex gap-2 mb-4">
        <Select className="w-40"><option>All Statuses</option><option>Failed</option><option>Running</option></Select>
        <Select className="w-40"><option>All Workflows</option></Select>
        <Button variant="ghost" size="icon"><RefreshCw size={16}/></Button>
     </div>
     <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
              <tr>
                 <th className="px-6 py-3">Run ID</th>
                 <th className="px-6 py-3">Workflow</th>
                 <th className="px-6 py-3">Started</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3">Current Step</th>
                 <th className="px-6 py-3 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {MOCK_WORKFLOW_RUNS.map(run => (
                 <tr key={run.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">#{run.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{run.workflowName}</td>
                    <td className="px-6 py-4 text-slate-600">{run.startedAt}</td>
                    <td className="px-6 py-4">
                       <Badge variant={
                          run.status === 'Completed' ? 'success' : 
                          run.status === 'Failed' ? 'danger' : 
                          run.status === 'Waiting for Approval' ? 'warning' : 'info'
                       }>
                          {run.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{run.currentStep || '-'}</td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm">Log</Button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     </Card>
  </div>
);

const TemplatesLibrary = () => (
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {MOCK_TEMPLATES.map(t => (
         <Card key={t.id} className="flex flex-col p-6 hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-primary-500">
            <div className="mb-4">
               <Badge variant="outline" className="mb-2">{t.category}</Badge>
               <h3 className="font-bold text-lg text-slate-900">{t.name}</h3>
               <p className="text-sm text-slate-500 mt-2">{t.description}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
               <span>{t.difficulty} • {t.stepsCount} steps</span>
               <Button size="sm" variant="secondary" className="gap-2"><Copy size={12}/> Use</Button>
            </div>
         </Card>
      ))}
   </div>
);

const VariablesManager = () => {
   const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

   const toggleSecret = (id: string) => {
      setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-lg font-bold text-slate-900">Global Variables & Secrets</h3>
               <p className="text-slate-500 text-sm">Manage environment variables accessible by all workflows.</p>
            </div>
            <Button className="gap-2"><Plus size={16}/> Add Variable</Button>
         </div>

         <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                     <th className="px-6 py-3">Key</th>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Value</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {MOCK_VARIABLES.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-medium text-slate-700">{v.key}</td>
                        <td className="px-6 py-4"><Badge variant="outline">{v.type}</Badge></td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                           {v.isEncrypted ? (
                              <div className="flex items-center gap-2">
                                 {showSecrets[v.id] ? v.value : '••••••••••••••••'}
                                 <button onClick={() => toggleSecret(v.id)} className="text-slate-400 hover:text-slate-600">
                                    {showSecrets[v.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                                 </button>
                              </div>
                           ) : v.value}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

// --- Main Component ---

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
               { id: 'workflows', label: 'Workflows', count: MOCK_WORKFLOWS.length },
               { id: 'runs', label: 'Run History' },
               { id: 'templates', label: 'Templates' },
               { id: 'variables', label: 'Variables & Secrets' }
            ]}
         />
         
         <div className="flex-1 overflow-y-auto pt-6">
            {activeTab === 'workflows' && <WorkflowsList onSelect={setSelectedWorkflow} />}
            {activeTab === 'runs' && <RunsHistory />}
            {activeTab === 'templates' && <TemplatesLibrary />}
            {activeTab === 'variables' && <VariablesManager />}
         </div>
      </div>
    </div>
  );
};
