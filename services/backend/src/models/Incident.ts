import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  facilityId: mongoose.Types.ObjectId;
  facilityName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  reportedBy: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    facilityName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open', index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedAt: { type: Date },
    resolutionNote: { type: String },
  },
  { timestamps: true }
);

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
