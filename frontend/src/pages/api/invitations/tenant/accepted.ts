import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { Invitation } from '../../_db/Invitation';
import { User } from '../../_db/User';
import { withAuth } from '@/middleware/auth';

interface GetTenantInvitationsRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
    email?: string;
  };
}

async function getTenantInvitationsHandler(req: GetTenantInvitationsRequest, res: NextApiResponse) {
  
  // Simple test response to verify the endpoint is working
  if (req.query.test === 'true') {
    return res.status(200).json({ 
      success: true, 
      message: 'API endpoint is working',
      timestamp: new Date().toISOString()
    });
  }
  
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

    // Check if user is a tenant
    if (req.user?.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can access this endpoint'
      });
    }

    await dbConnect();
    
    // First, get the user's email from the database using their ID
    const user = await User.findById(req.user.id).select('email');
    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        message: 'User email not found'
      });
    }
        
    // Get accepted invitations for this specific tenant
    const acceptedInvitations = await Invitation.find({
      email: user.email,
      status: 'accepted'
    }).select('email propertyId propertyName createdAt landlordId').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: acceptedInvitations
    });

  } catch (error) {
    console.error('Error fetching tenant invitations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invitations'
    });
  }
}

export default withAuth(getTenantInvitationsHandler);
