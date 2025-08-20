import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { expireExpiredInvitations } from '@/utils/invitationUtils';

interface ExpireInvitationsRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function expireInvitationsHandler(req: ExpireInvitationsRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Only landlords and admins can expire invitations
    if (req.user?.role !== 'landlord' && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords and admins can expire invitations' 
      });
    }

    // Expire all expired invitations
    const expiredCount = await expireExpiredInvitations();

    return res.status(200).json({
      success: true,
      message: `Successfully expired ${expiredCount} invitations`,
      data: {
        expiredCount
      }
    });

  } catch (error) {
    console.error('Error expiring invitations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to expire invitations'
    });
  }
}

export default withAuth(expireInvitationsHandler);
