
import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, addEdge, 
  ReactFlowProvider, Panel, Connection
} from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Zap, PlayCircle, GitBranch, Settings, Clock, CheckSquare } from 'lucide-react';
import { Button, cn } from '../components/Common';
import { TriggerNode, ActionNode, LogicNode } from '../components/automations/CustomNodes';
import { NodeConfigPanel } from '../components/automations/NodeConfigPanel';
import { WorkflowNode } from '../../types/automation';
import { api } from '../api/api';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
};

const initialNodes: WorkflowNode[] = [
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

export const AutomationBuilder = () => {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);

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
    const flow = rfInstance.toObject();
    const triggerNode = nodes.find(n => n.type === 'trigger');
    
    await api.createWorkflow({
      name: 'New Automation ' + new Date().toLocaleTimeString(),
      triggerType: (triggerNode?.data.triggerType as string) || 'MANUAL',
      steps: flow.nodes as any,
      isEnabled: true
    });
    
    alert('Workflow Saved!');
    navigate('/automations');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/automations')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Automation Builder</h1>
            <p className="text-xs text-slate-500">Draft Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Settings size={16}/> Settings</Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveWorkflow}>
            <Save size={16} /> Save & Publish
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-6 overflow-y-auto z-10 shadow-inner">
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
            <Panel position="top-center" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs font-medium text-slate-500">
              Drag nodes from sidebar to canvas
            </Panel>
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
    </div>
  );
};

export default AutomationBuilder;
