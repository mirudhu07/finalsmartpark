import mongoose, { Schema } from 'mongoose';

export interface IVehicle {
  userId: mongoose.Types.ObjectId;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: 'car' | 'suv' | 'motorcycle' | 'ev' | 'van';
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    licensePlate: { type: String, required: true, trim: true, uppercase: true, index: true },
    color: { type: String, required: true },
    type: { type: String, enum: ['car', 'suv', 'motorcycle', 'ev', 'van'], default: 'car' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
