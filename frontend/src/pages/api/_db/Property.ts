import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProperty extends Document {
  landlordId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial' | 'studio';
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  monthlyRent: number;
  securityDeposit: number;

  description: string;
  amenities: string[];
  utilities: string[];
  parking: string;
  petPolicy: 'allowed' | 'not-allowed' | 'case-by-case';
  smokingPolicy: 'allowed' | 'not-allowed' | 'outdoor-only';
  status: 'available' | 'rented' | 'maintenance' | 'unavailable';
  
  // Tenant information
  tenantId?: mongoose.Types.ObjectId;
  tenantEmail?: string;
  tenantName?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  landlordId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  city: { 
    type: String, 
    required: true, 
    trim: true 
  },
  state: { 
    type: String, 
    required: true, 
    trim: true 
  },
  zipCode: { 
    type: String, 
    required: true, 
    trim: true 
  },
  country: { 
    type: String, 
    required: true,
    trim: true 
  },
  propertyType: { 
    type: String, 
    enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial', 'studio'],
    required: true 
  },
  bedrooms: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  bathrooms: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  squareFootage: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  monthlyRent: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  securityDeposit: { 
    type: Number, 
    required: true, 
    min: 0 
  },

  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  amenities: [{ 
    type: String, 
    trim: true 
  }],
  utilities: [{ 
    type: String, 
    trim: true 
  }],
  parking: { 
    type: String, 
    required: true, 
    trim: true 
  },
  petPolicy: { 
    type: String, 
    enum: ['allowed', 'not-allowed', 'case-by-case'],
    default: 'not-allowed' 
  },
  smokingPolicy: { 
    type: String, 
    enum: ['allowed', 'not-allowed', 'outdoor-only'],
    default: 'not-allowed' 
  },
  status: { 
    type: String, 
    enum: ['available', 'rented', 'maintenance', 'unavailable'],
    default: 'available' 
  },
  
  // Tenant information
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tenantEmail: {
    type: String,
    trim: true,
    default: null
  },
  tenantName: {
    type: String,
    trim: true,
    default: null
  }
}, { 
  timestamps: true 
});

// Pre-save middleware to remove any availableFrom field that might be sent
PropertySchema.pre('save', function(next) {
  if (this.isModified('availableFrom')) {
    delete (this as unknown as Record<string, unknown>).availableFrom;
  }
  next();
});

export const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
