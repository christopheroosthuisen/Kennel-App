
import { IncomingMessage, ServerResponse } from 'http';
import { HttpError } from './errors';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Relaxed for local dev
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function setCors(res: ServerResponse) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

export function sendJson(res: ServerResponse, status: number, data: any) {
  setCors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, error: any) {
  setCors(res);
  console.error('[API Error]', error);

  if (error instanceof HttpError) {
    sendJson(res, error.statusCode, {
      error: { code: error.code, message: error.message }
    });
  } else if (error.name === 'ValidationError') {
    sendJson(res, 400, {
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  } else {
    sendJson(res, 500, {
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
    });
  }
}

export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new HttpError(400, 'Invalid JSON body', 'INVALID_JSON'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}
