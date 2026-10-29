import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['driver', 'operator', 'admin']).default('driver'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  licensePlate: z.string().min(2, 'License plate is required').toUpperCase(),
  color: z.string().min(1, 'Color is required'),
  type: z.enum(['car', 'suv', 'motorcycle', 'ev', 'van']),
  isDefault: z.boolean().default(false),
});

export const savedVehicleLocationSchema = z.object({
  facilityId: z.string().min(1),
  facilityName: z.string().min(1),
  floor: z.string().min(1),
  zone: z.string().min(1),
  bay: z.string().min(1),
  pillarReference: z.string().optional(),
  note: z.string().optional(),
  photoUrl: z.string().optional(),
  gpsCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const reservationCreateSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  zoneId: z.string().optional(),
  spaceId: z.string().optional(),
  vehiclePlate: z.string().min(2, 'Vehicle plate is required'),
  startTime: z.string().datetime('Start time must be ISO format'),
  endTime: z.string().datetime('End time must be ISO format'),
});

export const facilityCreateSchema = z.object({
  name: z.string().min(2, 'Facility name is required'),
  address: z.string().min(5, 'Address is required'),
  campusOrBuilding: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  entranceCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  totalCapacity: z.number().int().positive('Capacity must be positive'),
  hourlyRateCents: z.number().int().nonnegative('Hourly rate cannot be negative'),
  currency: z.string().default('USD'),
  amenities: z.array(z.string()).default([]),
});

export const predictRequestSchema = z.object({
  facilityId: z.string(),
  facilityCapacity: z.number().int().positive(),
  currentOccupancy: z.number().int().nonnegative(),
  horizonsMinutes: z.array(z.number().int().positive()).default([15, 30, 45, 60]),
  timestamp: z.string().optional(),
});
