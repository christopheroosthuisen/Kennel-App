
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { BadRequestError, NotFoundError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { UserAccount } from '../../../shared/domain';
import { hashPassword } from '../auth';

export const listUsers: Handler = async (req, res) => {
  await withDb(db => {
    // Filter out password hashes
    const users = db.users
      .filter(u => u.orgId === req.user!.orgId)
      .map(({ passwordHash, ...u }) => u);
    sendJson(res, 200, { data: users });
  });
};

export const createUser: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { name, email, role, password }
  
  if (!body.email || !body.password || !body.name) {
    throw new BadRequestError('Missing fields');
  }

  await withDb(async (db) => {
    const existing = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) throw new BadRequestError('Email already in use');

    const hashedPassword = await hashPassword(body.password);

    const newUser: UserAccount = {
      id: generateId('u'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      name: body.name,
      email: body.email,
      role: body.role || 'Staff',
      passwordHash: hashedPassword,
      lastLoginAt: undefined
    };

    db.users.push(newUser);
    
    // Log
    db.auditLogs.push({
      id: generateId('al'),
      actorId: req.user!.id,
      action: 'user.create',
      resourceType: 'UserAccount',
      resourceId: newUser.id,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    const { passwordHash, ...safeUser } = newUser;
    sendJson(res, 201, { data: safeUser });
  });
};

export const updateUser: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);

  await withDb(db => {
    const idx = db.users.findIndex(u => u.id === id && u.orgId === req.user!.orgId);
    if (idx === -1) throw new NotFoundError();

    const updated = { ...db.users[idx], ...body, updatedAt: nowISO() };
    delete updated.password; // Don't allow password update via this generic route
    
    db.users[idx] = updated;
    const { passwordHash, ...safeUser } = updated;
    sendJson(res, 200, { data: safeUser });
  });
};
