import mongoose, { Schema, Document } from 'mongoose';

export interface IZone {
  name: string;
  floor: string;
  totalSpaces: number;
  occupiedSpaces: number;
  type: 'standard' | 'ev' | 'accessible' | 'vip' | 'motorcycle';
  hourlyRate: number; // in cents
}

export interface IFacility extends Document {
  name: string;
  address: string;
  campusOrBuilding?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  entranceCoordinates: {
    latitude: number;
    longitude: number;
  };
  totalCapacity: number;
  currentOccupancy: number;
  hourlyRateCents: number;
  currency: string;
  status: 'open' | 'closed' | 'full' | 'maintenance';
  amenities: string[];
  zones: IZone[];
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZone>({
  name: { type: String, required: true },
  floor: { type: String, required: true },
  totalSpaces: { type: Number, required: true, min: 1 },
  occupiedSpaces: { type: Number, default: 0, min: 0 },
  type: { type: String, enum: ['standard', 'ev', 'accessible', 'vip', 'motorcycle'], default: 'standard' },
  hourlyRate: { type: Number, required: true, min: 0 },
});

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    campusOrBuilding: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    entranceCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    totalCapacity: { type: Number, required: true, min: 1 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    hourlyRateCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['open', 'closed', 'full', 'maintenance'], default: 'open', index: true },
    amenities: [{ type: String }],
    zones: [ZoneSchema],
    isDemoData: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FacilitySchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);
