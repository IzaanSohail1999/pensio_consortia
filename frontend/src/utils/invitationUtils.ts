import { Invitation } from '@/pages/api/_db/Invitation';
import dbConnect from '@/pages/api/_db/mongoConnect';

/**
 * Expires all invitations that have passed their expiration date
 * This should be called periodically or when needed
 * Also expires invitations that have been pending for more than 1 month
 */
export async function expireExpiredInvitations(): Promise<number> {
  try {
    await dbConnect();
    
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    // Expire invitations that have passed their explicit expiration date
    const expiredByDateResult = await Invitation.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      {
        $set: { status: 'expired' }
      }
    );

    // Expire invitations that have been pending for more than 1 month (regardless of expiresAt)
    const expiredByTimeResult = await Invitation.updateMany(
      {
        status: 'pending',
        createdAt: { $lt: oneMonthAgo }
      },
      {
        $set: { status: 'expired' }
      }
    );

    const totalExpired = expiredByDateResult.modifiedCount + expiredByTimeResult.modifiedCount;
    
    return totalExpired;
  } catch (error) {
    console.error('Error expiring invitations:', error);
    return 0;
  }
}

/**
 * Checks if a tenant can receive new invitations based on their current status
 * @param email - Tenant's email address
 * @returns Object with canReceiveInvitation boolean and reason if false
 */
export async function canTenantReceiveInvitation(email: string): Promise<{
  canReceiveInvitation: boolean;
  reason?: string;
  existingInvitation?: unknown;
}> {
  try {
    await dbConnect();
    
    const now = new Date();
    
    // Check for pending invitations (not expired by time)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const pendingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      createdAt: { $gt: oneMonthAgo }, // Only consider invitations created within the last month
      expiresAt: { $gt: now }
    });

    if (pendingInvitation) {
      return {
        canReceiveInvitation: false,
        reason: `Tenant already has a pending invitation for property: ${pendingInvitation.propertyName}`,
        existingInvitation: pendingInvitation
      };
    }

    // Check for accepted invitations
    const acceptedInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: 'accepted'
    });

    if (acceptedInvitation) {
      return {
        canReceiveInvitation: false,
        reason: `Tenant is already registered for property: ${acceptedInvitation.propertyName}`,
        existingInvitation: acceptedInvitation
      };
    }

    return {
      canReceiveInvitation: true
    };
  } catch (error) {
    console.error('Error checking tenant invitation status:', error);
    return {
      canReceiveInvitation: false,
      reason: 'Error checking invitation status'
    };
  }
}

/**
 * Gets all invitations for a specific email with their current status
 * @param email - Tenant's email address
 * @returns Array of invitations with status information
 */
export async function getTenantInvitationHistory(email: string): Promise<unknown[]> {
  try {
    await dbConnect();
    
    const invitations = await Invitation.find({
      email: email.toLowerCase()
    }).select('propertyName status createdAt expiresAt landlordId').sort({ createdAt: -1 });

    return invitations;
  } catch (error) {
    console.error('Error fetching tenant invitation history:', error);
    return [];
  }
}
