import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { Invitation } from '../../_db/Invitation';
import { withAuth } from '@/middleware/auth';
import { sendEmail, generateCancellationEmail } from '@/utils/emailService';

interface CancelInvitationRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function cancelInvitationHandler(req: CancelInvitationRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can cancel invitations'
      });
    }

    const { invitationId } = req.query;

    if (!invitationId || typeof invitationId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invitation ID is required'
      });
    }

    await dbConnect();

    // Find the invitation and verify ownership
    const invitation = await Invitation.findOne({
      _id: invitationId,
      landlordId: req.user.id,
      status: 'pending' // Only allow cancellation of pending invitations
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or cannot be cancelled'
      });
    }

    // Update invitation status to cancelled
    invitation.status = 'cancelled';
    await invitation.save();

    // Send cancellation email
    const emailData = generateCancellationEmail(
      invitation.email,
      invitation.propertyName
    );

    const emailSent = await sendEmail(emailData);

    if (!emailSent) {
      console.warn('Failed to send cancellation email, but invitation was cancelled');
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully',
      data: {
        invitationId: invitation._id,
        status: invitation.status
      }
    });

  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel invitation'
    });
  }
}

export default withAuth(cancelInvitationHandler);
