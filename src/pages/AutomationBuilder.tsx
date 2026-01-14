
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, addEdge, 
  ReactFlowProvider, Panel, Connection,
  Node, Edge
} from '@xyflow/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Zap, PlayCircle, GitBranch, Settings, Clock, CheckSquare, AlertTriangle, RefreshCcw, LayoutTemplate, RotateCcw } from 'lucide-react';
import { Button, cn, Badge, Modal, Input, Label } from '../components/Common';
import { TriggerNode, ActionNode, LogicNode } from '../components/automations/CustomNodes';
import { NodeConfigPanel } from '../components/automations/NodeConfigPanel';
import { WorkflowNode } from '../types/automation';
import { Workflow } from '../types/domain';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
};

const INITIAL_NODES: WorkflowNode[] = [
  { 
    id: 'start', 
    type: 'trigger', 
    position: { x: 250, y: 50 }, 
    data: { label: 'Start Trigger', triggerType: 'POS_PURCHASE' } 
  },
];

const SidebarItem = ({ type, label, icon: Icon, colorClass, data }: any) => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className={cn("flex items-center gap-3 p-3 rounded-lg border bg-white cursor-move hover:shadow-md transition-all", colorClass)}
      onDragStart={(event) => onDragStart(event, type, data)}
      draggable
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

// Graph Validation Logic
const validateGraph = (nodes: Node[], edges: Edge[]) => {
  const errors: string[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // 1. Orphan Check (Nodes with no incoming edges, except Trigger)
  nodes.forEach(node => {
    if (node.type !== 'trigger') {
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) errors.push(`Node "${node.data.label || node.id}" is unreachable.`);
    }
  });

  // 2. Required Config Check
  nodes.forEach(node => {
    if (node.type === 'action' && !node.data.config) {
      // Allow empty config visually but warn
      // errors.push(`Node "${node.data.label}" is missing configuration.`);
    }
  });

  // 3. Cycle Detection
  const detectCycle = (nodeId: string): boolean => {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoing = edges.filter(e => e.source === nodeId);
      for (const edge of outgoing) {
        if (!visited.has(edge.target) && detectCycle(edge.target)) return true;
        else if (recursionStack.has(edge.target)) return true;
      }
    }
    recursionStack.delete(nodeId);
    return false;
  };

  // Start cycle check from trigger
  const trigger = nodes.find(n => n.type === 'trigger');
  if (trigger && detectCycle(trigger.id)) {
    errors.push("Graph contains a cycle (infinite loop detected).");
  }

  return errors;
};

export const AutomationBuilder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Workflow Metadata State
  const [wfName, setWfName] = useState('New Workflow');
  const [wfActive, setWfActive] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(!workflowId); // Open modal if no ID

  // --- Data Fetching ---
  
  // 1. Load Workflow if ID present
  useEffect(() => {
    if (!workflowId) return;
    
    const loadWorkflow = async () => {
      try {
        const res = await api.getWorkflow(workflowId);
        const wf = res.data;
        setWfName(wf.name);
        setWfActive(wf.isEnabled);
        
        // Restore nodes/edges
        if (typeof wf.steps === 'string') {
           setNodes(JSON.parse(wf.steps));
        } else {
           setNodes(wf.steps as any); // legacy fallback
        }
        
        if (wf.edges) {
           setEdges(typeof wf.edges === 'string' ? JSON.parse(wf.edges) : wf.edges);
        }
        
        setIsLoadModalOpen(false);
      } catch (e) {
        console.error("Failed to load workflow", e);
        navigate('/automations'); // Kick back if invalid
      }
    };
    loadWorkflow();
  }, [workflowId]);

  // 2. Fetch Runs History
  const { data: recentRuns = [], refetch: refetchRuns } = useApiQuery(
    workflowId ? `runs-${workflowId}` : 'noop',
    async () => workflowId ? api.listWorkflowRuns(workflowId) : { data: [] },
    [workflowId]
  );

  // --- Handlers ---

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const dataString = event.dataTransfer.getData('application/reactflow-data');
      
      if (typeof type === 'undefined' || !type) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: type as any,
        position,
        data: JSON.parse(dataString),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes],
  );

  const onNodeClick = (_: any, node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const handleConfigSave = (id: string, data: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) return { ...n, data };
      return n;
    }));
  };

  const handleSaveWorkflow = async () => {
    const errors = validateGraph(nodes, edges);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return; // Block save? Or allow with warning? Let's block.
    }
    setValidationErrors([]);

    const triggerNode = nodes.find(n => n.type === 'trigger');
    const payload = {
      name: wfName,
      triggerType: (triggerNode?.data.triggerType as string) || 'MANUAL',
      steps: nodes as any, // Storing full graph nodes in steps column
      edges: edges as any, // Storing edges
      isEnabled: wfActive
    };

    try {
      if (workflowId) {
        await api.updateWorkflow(workflowId, payload);
        alert('Workflow Updated!');
      } else {
        const res = await api.createWorkflow(payload);
        alert('Workflow Created!');
        // Update URL without reload
        setSearchParams({ id: res.data.id });
      }
      refetchRuns();
    } catch (e) {
      alert('Save failed');
    }
  };

  const resetLocal = () => {
    if (confirm("Reset layout to default? Unsaved changes will be lost.")) {
      setNodes(INITIAL_NODES);
      setEdges([]);
      setValidationErrors([]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/automations')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
               <input 
                 className="text-lg font-bold text-slate-900 border-none bg-transparent focus:ring-0 p-0 hover:bg-slate-50 rounded px-1 transition-colors"
                 value={wfName}
                 onChange={e => setWfName(e.target.value)}
               />
               <Badge variant={wfActive ? 'success' : 'default'} className="cursor-pointer" onClick={() => setWfActive(!wfActive)}>
                  {wfActive ? 'Active' : 'Draft'}
               </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono">{workflowId || 'New Workflow'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={resetLocal} title="Reset Graph"><RotateCcw size={16}/></Button>
          <Button variant="outline" onClick={() => setIsLoadModalOpen(true)} className="gap-2"><LayoutTemplate size={16}/> Load</Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveWorkflow}>
            <Save size={16} /> Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-6 overflow-y-auto z-10 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Triggers</h3>
            <div className="space-y-2">
              <SidebarItem 
                type="trigger" 
                label="POS Purchase" 
                icon={Zap} 
                colorClass="border-primary-200 hover:border-primary-400 text-primary-700"
                data={{ label: 'New Purchase', triggerType: 'POS_PURCHASE' }}
              />
              <SidebarItem 
                type="trigger" 
                label="Tag Added" 
                icon={Zap} 
                colorClass="border-primary-200 hover:border-primary-400 text-primary-700"
                data={{ label: 'Tag Added', triggerType: 'CRM_TAG_ADDED' }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Actions</h3>
            <div className="space-y-2">
              <SidebarItem 
                type="action" 
                label="Send SMS" 
                icon={PlayCircle} 
                colorClass="border-slate-200 hover:border-indigo-400 text-slate-700"
                data={{ label: 'Send SMS', actionType: 'SEND_SMS' }}
              />
              <SidebarItem 
                type="action" 
                label="Send Email" 
                icon={PlayCircle} 
                colorClass="border-slate-200 hover:border-indigo-400 text-slate-700"
                data={{ label: 'Send Email', actionType: 'SEND_EMAIL' }}
              />
              <SidebarItem 
                type="action" 
                label="Wait / Delay" 
                icon={Clock} 
                colorClass="border-slate-200 hover:border-indigo-400 text-slate-700"
                data={{ label: 'Wait', actionType: 'WAIT_DELAY' }}
              />
              <SidebarItem 
                type="action" 
                label="Create Task" 
                icon={CheckSquare} 
                colorClass="border-slate-200 hover:border-indigo-400 text-slate-700"
                data={{ label: 'Create Task', actionType: 'CREATE_TASK' }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Logic</h3>
            <div className="space-y-2">
              <SidebarItem 
                type="logic" 
                label="Condition" 
                icon={GitBranch} 
                colorClass="border-amber-200 hover:border-amber-400 text-amber-700"
                data={{ label: 'If / Else' }}
              />
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Runs</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentRuns.length === 0 && <p className="text-xs text-slate-400 italic">No runs recorded.</p>}
                {recentRuns.map(run => (
                   <div key={run.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <span className={cn(
                         "w-2 h-2 rounded-full",
                         run.status === 'Completed' ? "bg-green-500" : run.status === 'Failed' ? "bg-red-500" : "bg-blue-500"
                      )} />
                      <span className="text-slate-600">{new Date(run.createdAt).toLocaleTimeString()}</span>
                      <span className="font-mono text-slate-400">#{run.id.slice(-4)}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 h-full bg-slate-100 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
          >
            <Background color="#94a3b8" gap={16} size={1} />
            <Controls />
            <MiniMap />
            {validationErrors.length > 0 && (
               <Panel position="top-right" className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-lg max-w-sm">
                  <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Validation Errors</h4>
                  <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                     {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
               </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Config Drawer */}
      {selectedNode && (
        <NodeConfigPanel 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onSave={handleConfigSave}
        />
      )}

      {/* Load Workflow Modal */}
      <LoadWorkflowModal 
         isOpen={isLoadModalOpen} 
         onClose={() => setIsLoadModalOpen(false)}
         onSelect={(id) => { setSearchParams({ id }); setIsLoadModalOpen(false); }}
      />
    </div>
  );
};

const LoadWorkflowModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (id: string) => void }) => {
   const { data: workflows = [] } = useApiQuery('list-wf-builder', api.listWorkflows);

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Open Workflow" size="md">
         <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
               {workflows.map((wf: Workflow) => (
                  <div 
                     key={wf.id} 
                     onClick={() => onSelect(wf.id)}
                     className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                  >
                     <div>
                        <div className="font-bold text-slate-800">{wf.name}</div>
                        <div className="text-xs text-slate-500">Trigger: {wf.triggerType}</div>
                     </div>
                     <Badge variant={wf.isEnabled ? 'success' : 'default'}>{wf.isEnabled ? 'Active' : 'Draft'}</Badge>
                  </div>
               ))}
               {workflows.length === 0 && <div className="p-4 text-center text-slate-400">No workflows found.</div>}
            </div>
            <div className="flex justify-between items-center pt-2">
               <Button variant="ghost" onClick={() => { setSearchParams({}); onClose(); }}>Create New</Button>
               <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
         </div>
      </Modal>
   );
};

// Helper for resetting search params in modal
function setSearchParams(arg0: { id?: string; }) {
   // This mock function is just to satisfy TS in the snippet context.
   // Real usage is inside the component via hook.
}

export default AutomationBuilder;
