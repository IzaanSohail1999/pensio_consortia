import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Property } from '../_db/Property';
import { withAuth } from '@/middleware/auth';
import { logger } from '@/utils/logger';

interface LandlordPropertiesRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function getLandlordPropertiesHandler(req: LandlordPropertiesRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can view their properties' 
      });
    }

    await dbConnect();

    // Get all properties for this landlord
    const properties = await Property.find({ landlordId: req.user.id })
      .sort({ createdAt: -1 }); // Most recent first

    logger.info(`Retrieved ${properties.length} properties for landlord: ${req.user.id}`, 'PROPERTY_LANDLORD', { 
      landlordId: req.user.id, 
      propertyCount: properties.length 
    });

    return res.status(200).json({
      success: true,
      data: properties
    });

  } catch (error) {
    logger.error('Error retrieving landlord properties', 'PROPERTY_LANDLORD', { 
      landlordId: req.user?.id 
    }, error instanceof Error ? error : new Error(String(error)));
    
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve properties'
    });
  }
}

export default withAuth(getLandlordPropertiesHandler);
