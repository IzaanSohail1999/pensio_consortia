import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Property } from '../_db/Property';
import { withAuth } from '@/middleware/auth';

interface GetPropertyByIdRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function getPropertyByIdHandler(req: GetPropertyByIdRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    await dbConnect();
    
    // Find property by ID
    const property = await Property.findById(id).select('_id name address city state zipCode propertyType monthlyRent status bedrooms bathrooms squareFootage securityDeposit country');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Error fetching property by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property details'
    });
  }
}

export default withAuth(getPropertyByIdHandler);
