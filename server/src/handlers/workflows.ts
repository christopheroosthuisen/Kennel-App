
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { Workflow } from '../../../shared/domain';

export const listWorkflows: Handler = async (req, res) => {
  await withDb(db => {
    const workflows = db.workflows.filter(w => w.orgId === req.user!.orgId);
    sendJson(res, 200, { data: workflows });
  });
};

export const createWorkflow: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  
  await withDb(db => {
    const workflow: Workflow = {
      id: generateId('wf'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      name: body.name || 'New Workflow',
      triggerType: body.triggerType || 'Event',
      triggerConfig: body.triggerConfig || '{}',
      steps: typeof body.steps === 'string' ? body.steps : JSON.stringify(body.steps || []),
      isEnabled: body.isEnabled || false
    };
    
    db.workflows.push(workflow);
    sendJson(res, 201, { data: workflow });
  });
};

export const listRuns: Handler = async (req, res) => {
  await withDb(db => {
    const runs = db.workflowRuns
      .filter(r => r.orgId === req.user!.orgId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50); // limit 50
      
    // Enrich
    const enriched = runs.map(r => {
        const wf = db.workflows.find(w => w.id === r.workflowId);
        return { ...r, workflowName: wf?.name || 'Unknown' };
    });

    sendJson(res, 200, { data: enriched });
  });
};
