import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { Invitation } from '../../_db/Invitation';
import { withAuth } from '@/middleware/auth';

interface GetInvitationsRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function getPropertyInvitationsHandler(req: GetInvitationsRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can view property invitations'
      });
    }

    const { propertyId } = req.query;

    if (!propertyId || typeof propertyId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    await dbConnect();

    // Get all invitations for this property
    const invitations = await Invitation.find({
      propertyId,
      landlordId: req.user.id
    }).select('email status createdAt expiresAt invitationCode').sort({ createdAt: -1 });

    // Update expired invitations
    const now = new Date();
    
    const updatedInvitations = invitations.map(invitation => {
      
      if (invitation.status === 'pending' && invitation.expiresAt) {
        const timeUntilExpiry = invitation.expiresAt.getTime() - now.getTime();
        // const daysUntilExpiry = timeUntilExpiry / (1000 * 60 * 60 * 24); // Unused variable
          
        if (timeUntilExpiry <= 0) {
          // Mark as expired
          Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' }).exec();
          return { ...invitation.toObject(), status: 'expired' };
        } else {
        }
      }
      return invitation.toObject();
    });

    return res.status(200).json({
      success: true,
      data: updatedInvitations
    });

  } catch (error) {
    console.error('Error fetching property invitations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invitations'
    });
  }
}

export default withAuth(getPropertyInvitationsHandler);
