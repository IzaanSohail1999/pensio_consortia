import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { Invitation } from '../../_db/Invitation';
import { withAuth } from '@/middleware/auth';

interface GetAcceptedInvitationsRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function getAcceptedInvitationsHandler(req: GetAcceptedInvitationsRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can view tenant invitations'
      });
    }

    await dbConnect();

    // Get all accepted invitations for this landlord
    const acceptedInvitations = await Invitation.find({
      landlordId: req.user.id,
      status: 'accepted'
    }).select('email propertyId propertyName createdAt').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: acceptedInvitations
    });

  } catch (error) {
    console.error('Error fetching accepted invitations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch accepted invitations'
    });
  }
}

export default withAuth(getAcceptedInvitationsHandler);
