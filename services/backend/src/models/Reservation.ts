import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  bookingReference: string;
  userId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  facilityName: string;
  zoneName?: string;
  vehiclePlate: string;
  startTime: Date;
  endTime: Date;
  totalPriceCents: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    facilityName: { type: String, required: true },
    zoneName: { type: String },
    vehiclePlate: { type: String, required: true, uppercase: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    totalPriceCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired'],
      default: 'confirmed',
      index: true,
    },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

ReservationSchema.index({ facilityId: 1, status: 1, startTime: 1, endTime: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);
