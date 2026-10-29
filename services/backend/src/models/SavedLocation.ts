import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedLocation extends Document {
  userId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  facilityName: string;
  floor: string;
  zone: string;
  bay: string;
  pillarReference?: string;
  note?: string;
  photoUrl?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  parkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedLocationSchema = new Schema<ISavedLocation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
    facilityName: { type: String, required: true },
    floor: { type: String, required: true },
    zone: { type: String, required: true },
    bay: { type: String, required: true },
    pillarReference: { type: String },
    note: { type: String },
    photoUrl: { type: String },
    gpsCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    parkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedLocation = mongoose.model<ISavedLocation>('SavedLocation', SavedLocationSchema);
