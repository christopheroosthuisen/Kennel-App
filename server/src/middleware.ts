
import { Handler } from './router';
import { verifyToken } from './auth';
import { UnauthorizedError } from './errors';
import { loadDb } from './db';

export function requireAuth(handler: Handler): Handler {
  return async (req, res, params) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const db = await loadDb();
    const user = db.users.find(u => u.id === payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    await handler(req, res, params);
  };
}

export function requireRole(allowedRoles: string[], handler: Handler): Handler {
  return requireAuth(async (req, res, params) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    await handler(req, res, params);
  });
}
