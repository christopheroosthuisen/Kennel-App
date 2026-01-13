
import { Handler } from '../router';
import { sendJson } from '../http';
import { withDb } from '../db';

export const listAuditLogs: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');

  await withDb(db => {
    let logs = db.auditLogs.filter(l => l.orgId === req.user!.orgId);
    
    if (entityType) logs = logs.filter(l => l.resourceType === entityType);
    if (entityId) logs = logs.filter(l => l.resourceId === entityId);
    
    // Newest first
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    logs = logs.slice(0, limit);
    
    // Enrich actor name? We only store ID usually, but UI can resolve or we can join here.
    // For simplicity, we just return logs. UI can resolve users if needed or just show ID.
    const enriched = logs.map(l => {
       const user = db.users.find(u => u.id === l.actorId);
       return { ...l, actorName: user?.name || 'System' };
    });

    sendJson(res, 200, { data: enriched });
  });
};
