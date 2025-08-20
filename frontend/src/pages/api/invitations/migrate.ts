import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Invitation } from '../_db/Invitation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    // Find all invitations that still have the old isUsed field
    const oldInvitations = await Invitation.find({ isUsed: { $exists: true } });
    

    let updatedCount = 0;
    const errors = [];

          for (const invitation of oldInvitations) {
        try {
          // Determine the new status based on old isUsed field
          let newStatus = 'pending';
          // Type assertion to access legacy field
          const legacyInvitation = invitation as { isUsed?: boolean };
          if (legacyInvitation.isUsed === true) {
            newStatus = 'accepted';
          } else if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            newStatus = 'expired';
          }

        // Update the invitation with new schema
        await Invitation.findByIdAndUpdate(invitation._id, {
          $set: { status: newStatus },
          $unset: { isUsed: "" }
        });

        updatedCount++;
      } catch (error) {
        console.error(`Error updating invitation ${invitation._id}:`, error);
        errors.push(invitation._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Migration completed. Updated ${updatedCount} invitations.`,
      data: {
        totalFound: oldInvitations.length,
        updatedCount,
        errors: errors.length
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Migration failed'
    });
  }
}
