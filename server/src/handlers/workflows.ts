
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { Workflow } from '../../../shared/domain';
import { NotFoundError } from '../errors';

export const listWorkflows: Handler = async (req, res) => {
  await withDb(db => {
    const workflows = db.workflows.filter(w => w.orgId === req.user!.orgId);
    sendJson(res, 200, { data: workflows });
  });
};

export const getWorkflow: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const workflow = db.workflows.find(w => w.id === id && w.orgId === req.user!.orgId);
    if (!workflow) throw new NotFoundError('Workflow not found');
    sendJson(res, 200, { data: workflow });
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
      edges: typeof body.edges === 'string' ? body.edges : JSON.stringify(body.edges || []),
      isEnabled: body.isEnabled || false
    };
    
    db.workflows.push(workflow);
    sendJson(res, 201, { data: workflow });
  });
};

export const updateWorkflow: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);

  await withDb(db => {
    const idx = db.workflows.findIndex(w => w.id === id && w.orgId === req.user!.orgId);
    if (idx === -1) throw new NotFoundError('Workflow not found');

    const updated = {
      ...db.workflows[idx],
      ...body,
      updatedAt: nowISO()
    };

    // Ensure serialization if object passed
    if (body.steps && typeof body.steps !== 'string') {
      updated.steps = JSON.stringify(body.steps);
    }
    if (body.edges && typeof body.edges !== 'string') {
      updated.edges = JSON.stringify(body.edges);
    }

    db.workflows[idx] = updated;
    sendJson(res, 200, { data: updated });
  });
};

export const listRuns: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const workflowId = url.searchParams.get('workflowId');

  await withDb(db => {
    let runs = db.workflowRuns
      .filter(r => r.orgId === req.user!.orgId);
      
    if (workflowId) {
      runs = runs.filter(r => r.workflowId === workflowId);
    }

    runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    
    // Enrich
    const enriched = runs.slice(0, 50).map(r => {
        const wf = db.workflows.find(w => w.id === r.workflowId);
        return { ...r, workflowName: wf?.name || 'Unknown' };
    });

    sendJson(res, 200, { data: enriched });
  });
};
