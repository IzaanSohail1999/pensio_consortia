import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  username?: string; // Add username field
  propertyId: mongoose.Types.ObjectId;
  propertyName: string;
  landlordId: mongoose.Types.ObjectId;
  invitationCode: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    trim: true
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyName: {
    type: String,
    required: true,
    trim: true
  },
  landlordId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitationCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
InvitationSchema.index({ email: 1, propertyId: 1 });
InvitationSchema.index({ invitationCode: 1 });
InvitationSchema.index({ expiresAt: 1 });
InvitationSchema.index({ status: 1 });

// Compound index to ensure only one active invitation per property
InvitationSchema.index({ propertyId: 1, status: 1 });

export const Invitation: Model<IInvitation> = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);
