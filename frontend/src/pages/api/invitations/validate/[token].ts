import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { Invitation } from '../../_db/Invitation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invitation code is required'
      });
    }

    await dbConnect();

    // Find the invitation by code
    const invitation = await Invitation.findOne({
      invitationCode: token.toUpperCase(),
      status: 'pending'
    }).populate('propertyId', 'name address city state zipCode propertyType bedrooms bathrooms squareFootage monthlyRent');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation code'
      });
    }

    // Check if invitation has expired and update status if needed
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    // Check if invitation has passed its explicit expiration date
    if (invitation.expiresAt && invitation.expiresAt < now) {
      // Update invitation status to expired
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
      
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired. Please contact the landlord for a new invitation.',
        data: {
          invitationId: invitation._id,
          email: invitation.email,
          property: invitation.propertyId,
          expiresAt: invitation.expiresAt,
          status: 'expired'
        }
      });
    }
    
    // Check if invitation has been pending for more than 1 month
    if (invitation.createdAt && invitation.createdAt < oneMonthAgo) {
      // Update invitation status to expired
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
      
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired after 1 month of pending status. Please contact the landlord for a new invitation.',
        data: {
          invitationId: invitation._id,
          email: invitation.email,
          property: invitation.propertyId,
          createdAt: invitation.createdAt,
          status: 'expired'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation code is valid',
      data: {
        invitationId: invitation._id,
        email: invitation.email,
        property: invitation.propertyId,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Error validating invitation:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to validate invitation'
    });
  }
}
