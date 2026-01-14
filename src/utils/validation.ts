
import { z } from 'zod';

export const OwnerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const PetSchema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  name: z.string().min(1, "Pet name is required"),
  breed: z.string().min(1, "Breed is required"),
  weightLbs: z.number().min(0, "Weight must be positive").optional(),
  gender: z.enum(['M', 'F']),
  fixed: z.boolean().default(false),
  dob: z.string().optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  feedingInstructions: z.string().optional(),
  behaviorNotes: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const ReservationSchema = z.object({
  petId: z.string().min(1, "Pet is required"),
  ownerId: z.string().min(1, "Owner is required"),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  type: z.string().default("Boarding"),
  notes: z.string().optional(),
});

export const UnitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['Run', 'Suite', 'Cage', 'Playroom']),
  size: z.enum(['S', 'M', 'L', 'XL']),
});

export const CatalogItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['Service', 'Retail', 'AddOn']),
  basePrice: z.number().min(0, "Price must be positive"), // In cents or dollars depending on input, converted later
  category: z.string().min(1, "Category is required"),
});
