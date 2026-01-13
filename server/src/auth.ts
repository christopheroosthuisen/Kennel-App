
import crypto from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';

const scrypt = promisify(crypto.scrypt);
const randomBytes = promisify(crypto.randomBytes);

// In a real app, this should be in an environment variable
const SECRET = 'dev-secret-key-local-only-do-not-use-prod';

export interface AuthPayload {
  sub: string; // userId
  orgId: string;
  role: string;
  exp: number;
}

/**
 * Hash a password using scrypt with a random salt.
 * Returns "salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(':');
  if (!saltHex || !keyHex) return false;
  
  const salt = Buffer.from(saltHex, 'hex');
  const key = Buffer.from(keyHex, 'hex');
  
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(key, derivedKey);
}

// --- JWT-like Token Implementation (HMAC SHA256) ---

function base64UrlEncode(obj: any): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): any {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return JSON.parse(Buffer.from(str, 'base64').toString());
}

export function createToken(payload: Omit<AuthPayload, 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = { ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24 hours
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): AuthPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [header, payload, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  if (signature !== expectedSignature) return null;
  
  const decoded = base64UrlDecode(payload);
  if (Date.now() > decoded.exp) return null;
  
  return decoded;
}
