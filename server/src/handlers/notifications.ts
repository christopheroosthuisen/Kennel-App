
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { NotificationComment } from '../../../shared/domain';
import { eventBus } from '../event-bus';

export const listNotifications: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '50');

  await withDb(db => {
    let list = db.notifications.filter(n => n.orgId === req.user!.orgId);
    
    if (unreadOnly) {
      list = list.filter(n => !n.readByUserIds.includes(req.user!.id));
    }
    
    // Sort by newest
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    list = list.slice(0, limit);

    // Enrich with comment count? For now raw list.
    sendJson(res, 200, { data: list });
  });
};

export const markAsRead: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const n = db.notifications.find(n => n.id === id);
    if (!n) throw new NotFoundError();
    
    if (!n.readByUserIds.includes(req.user!.id)) {
      n.readByUserIds.push(req.user!.id);
      n.updatedAt = nowISO();
    }
    
    sendJson(res, 200, { data: n });
  });
};

export const markAsUnread: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const n = db.notifications.find(n => n.id === id);
    if (!n) throw new NotFoundError();
    
    n.readByUserIds = n.readByUserIds.filter(uid => uid !== req.user!.id);
    n.updatedAt = nowISO();
    
    sendJson(res, 200, { data: n });
  });
};

export const listComments: Handler = async (req, res, params) => {
  const { id } = params; // Notification ID
  await withDb(db => {
    const comments = db.notificationComments
      .filter(c => c.notificationId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    sendJson(res, 200, { data: comments });
  });
};

export const createComment: Handler = async (req, res, params) => {
  const { id } = params; // Notification ID
  const body = await parseJsonBody(req); // { text }
  
  if (!body.text) throw new BadRequestError('Text required');

  await withDb(db => {
    const notif = db.notifications.find(n => n.id === id);
    if (!notif) throw new NotFoundError();

    const comment: NotificationComment = {
      id: generateId('nc'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      notificationId: id,
      userId: req.user!.id,
      userName: req.user!.name,
      text: body.text
    };

    db.notificationComments.push(comment);
    
    // Unread for others? For simplicity, we just add the comment.
    // Real logic might mark notification unread for everyone else.
    
    eventBus.publish('notification', { action: 'comment', notificationId: id, comment });
    
    sendJson(res, 201, { data: comment });
  });
};
