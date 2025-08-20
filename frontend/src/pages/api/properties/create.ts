import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Property } from '../_db/Property';
import { User } from '../_db/User';
import { withAuth } from '@/middleware/auth';
import { validateCommonFields } from '@/utils/validation';
import { logger } from '@/utils/logger';

interface CreatePropertyRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function createPropertyHandler(req: CreatePropertyRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can create properties' 
      });
    }

    // Validate input
    const validation = validateCommonFields(req, ['name', 'address', 'city', 'state', 'zipCode', 'country', 'propertyType', 'bedrooms', 'bathrooms', 'squareFootage', 'monthlyRent', 'securityDeposit', 'description', 'parking']);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { 
      name, address, city, state, zipCode, country, 
      propertyType, bedrooms, bathrooms, squareFootage, monthlyRent, 
      securityDeposit, description, amenities = [], 
      utilities = [], parking, petPolicy = 'not-allowed', 
      smokingPolicy = 'not-allowed', status = 'available' 
    } = validation.sanitizedData;

    // Type guard for required fields
    if (typeof name !== 'string' || typeof address !== 'string' || typeof city !== 'string' || 
        typeof state !== 'string' || typeof zipCode !== 'string' || typeof country !== 'string' || typeof propertyType !== 'string' ||
        typeof bedrooms !== 'number' || typeof bathrooms !== 'number' || typeof squareFootage !== 'number' ||
        typeof monthlyRent !== 'number' || typeof securityDeposit !== 'number' || 
        typeof description !== 'string' || typeof parking !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data types' 
      });
    }

    await dbConnect();

    // Create the property
    const property = new Property({
      landlordId: req.user.id,
      name,
      address,
      city,
      state,
      zipCode,
      country,
      propertyType,
      bedrooms,
      bathrooms,
      squareFootage,
      monthlyRent,
      securityDeposit,

      description,
      amenities: Array.isArray(amenities) ? amenities : [],
      utilities: Array.isArray(utilities) ? utilities : [],
      parking,
      petPolicy,
      smokingPolicy,
      status
    });

    const savedProperty = await property.save();

    // Update user's properties array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { properties: savedProperty._id } }
    );

    logger.info(`Property created successfully: ${savedProperty._id}`, 'PROPERTY_CREATE', { 
      landlordId: req.user.id, 
      propertyId: savedProperty._id 
    });

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: savedProperty
    });

  } catch (error) {
    logger.error('Error creating property', 'PROPERTY_CREATE', { 
      landlordId: req.user?.id 
    }, error instanceof Error ? error : new Error(String(error)));
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create property'
    });
  }
}

export default withAuth(createPropertyHandler);
