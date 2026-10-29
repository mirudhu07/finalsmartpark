import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'driver' | 'operator' | 'admin';
  phone?: string;
  preferences: {
    notificationsEnabled: boolean;
    evOnly: boolean;
    preferredPaymentMethod?: string;
  };
  savedFacilities: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['driver', 'operator', 'admin'], default: 'driver', index: true },
    phone: { type: String },
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      evOnly: { type: Boolean, default: false },
      preferredPaymentMethod: { type: String, default: 'card' },
    },
    savedFacilities: [{ type: Schema.Types.ObjectId, ref: 'Facility' }],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
