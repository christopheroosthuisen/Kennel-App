
import { Node, Edge } from '@xyflow/react';

export type TriggerType = 'CRM_TAG_ADDED' | 'POS_PURCHASE' | 'VACCINE_EXPIRING' | 'RESERVATION_COMPLETED';
export type ActionType = 'SEND_SMS' | 'SEND_EMAIL' | 'WAIT_DELAY' | 'CREATE_TASK' | 'ADD_TAG';
export type NodeType = 'trigger' | 'action' | 'logic';

export interface WorkflowData extends Record<string, unknown> {
  label?: string;
  config?: any;
  triggerType?: TriggerType;
  actionType?: ActionType;
}

export type WorkflowNode = Node<WorkflowData>;
export type WorkflowEdge = Edge;

export interface WorkflowDefinition {
  id: string;
  name: string;
  isActive: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  trigger: TriggerType;
  stats: {
    runs: number;
    completed: number;
    failed: number;
  };
}

// Runtime Types
export interface WorkflowContext {
  ownerId?: string;
  petId?: string;
  orderId?: string;
  data: Record<string, any>;
}

export interface Enrollment {
  id: string;
  workflowId: string;
  workflowName: string;
  ownerId: string;
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  currentNodeId: string;
  nextRunAt?: string; // ISO Date for delays
  context: WorkflowContext;
}
