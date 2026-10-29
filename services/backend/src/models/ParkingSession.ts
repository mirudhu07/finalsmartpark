import mongoose, { Schema, Document } from 'mongoose';

export interface IParkingSession extends Document {
  userId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  facilityName: string;
  vehiclePlate: string;
  entryTime: Date;
  exitTime?: Date;
  durationMinutes?: number;
  amountDueCents: number;
  isPaid: boolean;
  paymentReference?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSessionSchema = new Schema<IParkingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    facilityName: { type: String, required: true },
    vehiclePlate: { type: String, required: true, uppercase: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    durationMinutes: { type: Number },
    amountDueCents: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentReference: { type: String },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

export const ParkingSession = mongoose.model<IParkingSession>('ParkingSession', ParkingSessionSchema);
