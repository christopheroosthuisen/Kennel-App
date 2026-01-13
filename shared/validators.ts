
import { ID, MoneyCents, ISODate } from './domain';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function assertString(val: any, fieldName: string): asserts val is string {
  if (typeof val !== 'string' || val.trim() === '') {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
}

export function assertOptionalString(val: any, fieldName: string): asserts val is string | undefined {
  if (val !== undefined && val !== null && typeof val !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }
}

export function assertNumber(val: any, fieldName: string): asserts val is number {
  if (typeof val !== 'number' || isNaN(val)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }
}

export function assertMoneyCents(val: any, fieldName: string): asserts val is MoneyCents {
  assertNumber(val, fieldName);
  if (!Number.isInteger(val)) {
    throw new ValidationError(`${fieldName} must be an integer (cents)`);
  }
}

export function assertISODate(val: any, fieldName: string): asserts val is ISODate {
  assertString(val, fieldName);
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid ISO date string`);
  }
}

export function assertOneOf<T extends string>(val: any, allowed: T[], fieldName: string): asserts val is T {
  if (!allowed.includes(val)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowed.join(', ')}`);
  }
}

// --- Entity Validators ---

export function validateOwnerPayload(payload: any) {
  assertString(payload.firstName, 'firstName');
  assertString(payload.lastName, 'lastName');
  assertString(payload.email, 'email');
  assertString(payload.phone, 'phone');
  assertOptionalString(payload.address, 'address');
  assertOptionalString(payload.notes, 'notes');
}

export function validatePetPayload(payload: any) {
  assertString(payload.ownerId, 'ownerId');
  assertString(payload.name, 'name');
  assertString(payload.breed, 'breed');
  assertOneOf(payload.gender, ['M', 'F'], 'gender');
  if (payload.weightLbs !== undefined) assertNumber(payload.weightLbs, 'weightLbs');
}

export function validateUnitPayload(payload: any) {
  assertString(payload.name, 'name');
  assertOneOf(payload.type, ['Run', 'Suite', 'Cage', 'Playroom'], 'type');
  assertOneOf(payload.size, ['S', 'M', 'L', 'XL'], 'size');
}

export function validateCatalogItemPayload(payload: any) {
  assertString(payload.name, 'name');
  assertOneOf(payload.type, ['Service', 'Retail', 'AddOn'], 'type');
  assertMoneyCents(payload.basePrice, 'basePrice');
}
