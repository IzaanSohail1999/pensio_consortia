import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Invitation } from '../_db/Invitation';
import { User } from '../_db/User';
import { withAuth } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { sendEmail, generateInvitationEmail } from '@/utils/emailService';
import crypto from 'crypto';

interface SendInvitationRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function sendInvitationHandler(req: SendInvitationRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if user is a landlord
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can send invitations' 
      });
    }

    const { email, propertyId, propertyName } = req.body;

    // Validate required fields
    if (!email || !propertyId || !propertyName) {
      return res.status(400).json({
        success: false,
        message: 'Email, property ID, and property name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    await dbConnect();

    // COMPREHENSIVE VALIDATION: Check tenant invitation status across ALL properties
    const now = new Date();
    
    // 1. Check if tenant already has a PENDING invitation from ANY property (not expired by time)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const existingPendingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      createdAt: { $gt: oneMonthAgo }, // Only consider invitations created within the last month
      expiresAt: { $gt: now }
    });

    if (existingPendingInvitation) {
      return res.status(400).json({
        success: false,
        message: `Tenant already has a pending invitation for property: ${existingPendingInvitation.propertyName}. Cannot send another invitation until the current one is resolved.`
      });
    }

    // 2. Check if tenant already has an ACCEPTED invitation from ANY property
    const existingAcceptedInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: 'accepted'
    });

    if (existingAcceptedInvitation) {
      return res.status(400).json({
        success: false,
        message: `Tenant is already registered for property: ${existingAcceptedInvitation.propertyName}. Cannot send invitations to tenants who are already renting a property.`
      });
    }

    // 3. Check if there's already an active invitation for this specific property (limit to one tenant per property)
    const existingPropertyInvitation = await Invitation.findOne({
      propertyId,
      status: { $in: ['pending', 'accepted'] },
      expiresAt: { $gt: now }
    });

    if (existingPropertyInvitation) {
      return res.status(400).json({
        success: false,
        message: 'This property already has an active invitation. Only one tenant can be invited per property.'
      });
    }

    // Generate unique invitation code (6 characters)
    const invitationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create the invitation
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const invitation = new Invitation({
      email: email.toLowerCase(),
      propertyId,
      propertyName,
      landlordId: req.user.id,
      invitationCode,
      expiresAt
    });

    const savedInvitation = await invitation.save();

    // Get landlord name for the email
    const landlord = await User.findById(req.user.id);
    const landlordName = landlord?.fullName || 'Landlord';

    // Send invitation email
    const emailData = generateInvitationEmail(
      email.toLowerCase(),
      propertyName,
      invitationCode,
      landlordName
    );

    const emailSent = await sendEmail(emailData);

    if (!emailSent) {
      // If email fails, delete the invitation and return error
      await Invitation.findByIdAndDelete(savedInvitation._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email. Please try again.'
      });
    }

    logger.info(`Invitation created and email sent: ${savedInvitation._id}`, 'INVITATION_CREATE', {
      landlordId: req.user.id,
      propertyId,
      email: email.toLowerCase(),
      invitationCode
    });

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: savedInvitation._id,
        invitationCode: savedInvitation.invitationCode,
        expiresAt: savedInvitation.expiresAt
      }
    });

  } catch (error) {
    logger.error('Error sending invitation', 'INVITATION_CREATE', { 
      landlordId: req.user?.id 
    }, error instanceof Error ? error : new Error(String(error)));
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
}

export default withAuth(sendInvitationHandler);
