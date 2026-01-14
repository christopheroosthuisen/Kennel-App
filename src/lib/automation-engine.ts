
import { WorkflowDefinition, TriggerType, WorkflowContext, Enrollment } from '../types/automation';
import { api } from '../api/api'; 

// --- MOCK STORAGE FOR DEMO ---
let activeEnrollments: Enrollment[] = [];

// --- HELPER FUNCTIONS ---

const getWorkflows = async (): Promise<WorkflowDefinition[]> => {
  // In real app, fetch from DB
  const { data } = await api.listWorkflows();
  return data.map((w: any) => ({
    id: w.id,
    name: w.name,
    isActive: w.isEnabled,
    trigger: w.triggerType as TriggerType,
    nodes: typeof w.steps === 'string' ? JSON.parse(w.steps) : w.steps || [],
    edges: typeof w.edges === 'string' ? JSON.parse(w.edges) : [],
    stats: { runs: 0, completed: 0, failed: 0 }
  }));
};

// --- ENGINE CORE ---

export const AutomationEngine = {
  
  /**
   * Entry point: Trigger an event in the system
   */
  async triggerEvent(type: TriggerType, context: WorkflowContext) {
    console.log(`[Automation] Event Triggered: ${type}`, context);
    
    const workflows = await getWorkflows();
    const matchingWorkflows = workflows.filter(w => w.isActive && w.trigger === type);

    for (const workflow of matchingWorkflows) {
      await this.enroll(workflow, context);
    }
  },

  /**
   * Enroll a user/entity into a workflow
   */
  async enroll(workflow: WorkflowDefinition, context: WorkflowContext) {
    const startNode = workflow.nodes.find(n => n.type === 'trigger');
    if (!startNode) return;

    if (workflow.trigger === 'POS_PURCHASE') {
      const minAmount = startNode.data.config?.minAmount || 0;
      if ((context.data.amount || 0) < minAmount) {
        console.log(`[Automation] Skipped: Amount ${context.data.amount} < ${minAmount}`);
        return;
      }
    }

    const enrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      ownerId: context.ownerId || 'system',
      status: 'RUNNING',
      currentNodeId: startNode.id,
      context
    };

    activeEnrollments.push(enrollment);
    console.log(`[Automation] Enrolled in "${workflow.name}"`);
    
    await this.processEnrollment(enrollment, workflow);
  },

  /**
   * Process the queue recursively
   */
  async processEnrollment(enrollment: Enrollment, workflow: WorkflowDefinition) {
    const currentNode = workflow.nodes.find(n => n.id === enrollment.currentNodeId);
    if (!currentNode) {
      this.completeEnrollment(enrollment, 'COMPLETED');
      return;
    }

    if (currentNode.type === 'action') {
      try {
        await this.executeAction(currentNode, enrollment.context);
      } catch (e) {
        console.error(`[Automation] Action Failed:`, e);
        this.completeEnrollment(enrollment, 'FAILED');
        return;
      }
    }

    if (currentNode.data.actionType === 'WAIT_DELAY') {
      const duration = (currentNode.data.config?.duration || 1) as number;
      const unit = currentNode.data.config?.unit || 'hours';
      
      let ms = duration * 1000;
      if (unit === 'minutes') ms *= 60;
      if (unit === 'hours') ms *= 3600;
      if (unit === 'days') ms *= 86400;

      enrollment.status = 'WAITING';
      enrollment.nextRunAt = new Date(Date.now() + ms).toISOString();
      console.log(`[Automation] Paused for ${duration} ${unit}`);
      return; 
    }

    const edges = workflow.edges || [];
    const nextEdge = edges.find(e => e.source === currentNode.id);

    if (nextEdge) {
      enrollment.currentNodeId = nextEdge.target;
      setTimeout(() => this.processEnrollment(enrollment, workflow), 500); 
    } else {
      this.completeEnrollment(enrollment, 'COMPLETED');
    }
  },

  async executeAction(node: any, context: WorkflowContext) {
    const type = node.data.actionType;
    console.log(`[Automation] Executing Action: ${type}`, node.data.config);

    if (type === 'SEND_SMS') {
      await new Promise(r => setTimeout(r, 200)); 
    }
    
    if (type === 'CREATE_TASK') {
      await new Promise(r => setTimeout(r, 200));
    }
  },

  completeEnrollment(enrollment: Enrollment, status: 'COMPLETED' | 'FAILED') {
    enrollment.status = status;
    console.log(`[Automation] Workflow ${status}: ${enrollment.id}`);
  },

  getActiveEnrollments(ownerId?: string) {
    if (ownerId) return activeEnrollments.filter(e => e.ownerId === ownerId);
    return activeEnrollments;
  },

  stopEnrollment(id: string) {
    activeEnrollments = activeEnrollments.filter(e => e.id !== id);
  }
};
