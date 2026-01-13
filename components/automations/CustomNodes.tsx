
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, MessageSquare, Clock, CheckSquare, Tag, GitBranch, PlayCircle, Mail } from 'lucide-react';
import { cn } from '../Common';
import { WorkflowData } from '../../types/automation';

const IconMap: Record<string, any> = {
  'CRM_TAG_ADDED': Tag,
  'POS_PURCHASE': Zap,
  'VACCINE_EXPIRING': Clock,
  'SEND_SMS': MessageSquare,
  'SEND_EMAIL': Mail,
  'WAIT_DELAY': Clock,
  'CREATE_TASK': CheckSquare,
  'ADD_TAG': Tag,
};

export const TriggerNode = memo(({ data, selected }: NodeProps<WorkflowData>) => {
  const Icon = IconMap[data.triggerType as string] || Zap;
  
  return (
    <div className={cn(
      "px-4 py-3 rounded-full border-2 bg-white shadow-lg flex items-center gap-3 transition-all min-w-[200px]",
      selected ? "border-primary-500 ring-2 ring-primary-200" : "border-primary-200"
    )}>
      <div className="p-2 bg-primary-100 rounded-full text-primary-600 animate-pulse">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs font-bold text-primary-600 uppercase tracking-wider">Trigger</div>
        <div className="text-sm font-semibold text-slate-800">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary-500" />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }: NodeProps<WorkflowData>) => {
  const Icon = IconMap[data.actionType as string] || PlayCircle;
  
  return (
    <div className={cn(
      "w-64 bg-white rounded-lg border shadow-sm transition-all overflow-hidden",
      selected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400" />
      
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <div className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600">
          <Icon size={16} />
        </div>
        <span className="font-semibold text-sm text-slate-700">{data.label}</span>
      </div>
      
      <div className="p-3 text-xs text-slate-500 bg-white min-h-[40px]">
        {data.config ? (
          <div className="flex flex-col gap-1">
            {Object.entries(data.config).slice(0,2).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k}:</span>
                <span className="font-mono text-slate-700 max-w-[120px] truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="italic opacity-50">Not configured</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400" />
    </div>
  );
});

export const LogicNode = memo(({ data, selected }: NodeProps<WorkflowData>) => {
  return (
    <div className="relative flex items-center justify-center">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 !-top-1" />
      
      <div className={cn(
        "w-12 h-12 rotate-45 bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-sm z-10 transition-all",
        selected && "bg-amber-200 border-amber-500"
      )}>
        <GitBranch size={20} className="-rotate-45 text-amber-700" />
      </div>
      
      <div className="absolute top-14 text-xs font-bold text-slate-500 bg-white/80 px-2 rounded backdrop-blur-sm">
        {data.label || 'Condition'}
      </div>

      {/* Logic nodes typically have two outputs: True/False */}
      <Handle id="true" type="source" position={Position.Right} className="w-3 h-3 bg-green-500 !-right-1" />
      <Handle id="false" type="source" position={Position.Left} className="w-3 h-3 bg-red-500 !-left-1" />
    </div>
  );
});
