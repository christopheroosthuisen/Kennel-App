
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { MessageThread, Message } from '../../../shared/domain';
import { eventBus } from '../event-bus';

export const listThreads: Handler = async (req, res, params) => {
  const { id } = params; // Owner ID
  await withDb(db => {
    const threads = db.messageThreads
      .filter(t => t.ownerId === id)
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    sendJson(res, 200, { data: threads });
  });
};

export const createThread: Handler = async (req, res, params) => {
  const { id } = params; // Owner ID
  const body = await parseJsonBody(req); // { subject }
  
  await withDb(db => {
    const thread: MessageThread = {
      id: generateId('th'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      ownerId: id,
      subject: body.subject,
      status: 'Open',
      lastMessageAt: nowISO()
    };
    
    db.messageThreads.push(thread);
    sendJson(res, 201, { data: thread });
  });
};

export const listMessages: Handler = async (req, res, params) => {
  const { id } = params; // Thread ID
  await withDb(db => {
    const messages = db.messages
      .filter(m => m.threadId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    sendJson(res, 200, { data: messages });
  });
};

export const createMessage: Handler = async (req, res, params) => {
  const { id } = params; // Thread ID
  const body = await parseJsonBody(req); // { body }
  
  if (!body.body) throw new BadRequestError('Body required');

  await withDb(db => {
    const thread = db.messageThreads.find(t => t.id === id);
    if (!thread) throw new NotFoundError('Thread not found');

    const message: Message = {
      id: generateId('msg'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      threadId: id,
      authorId: req.user!.id,
      authorName: req.user!.name,
      body: body.body,
      direction: 'Internal'
    };

    db.messages.push(message);
    
    // Update thread timestamp
    thread.lastMessageAt = nowISO();
    thread.updatedAt = nowISO();

    eventBus.publish('message', { threadId: id, message });

    sendJson(res, 201, { data: message });
  });
};
