import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { User } from '../_db/User';
import { Invitation } from '../_db/Invitation';
import { Property } from '../_db/Property';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { email, fullName, username, password, role, invitationCode } = req.body;
  
  if (!email || !fullName || !username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // For tenants, invitation code is required
  if (role === 'tenant' && !invitationCode) {
    return res.status(400).json({ message: 'Invitation code is required for tenant registration' });
  }

  await dbConnect();

  // If registering as tenant, validate invitation code and check for existing registrations
  if (role === 'tenant') {
    // Check if tenant already has an accepted invitation from ANY property
    const existingAcceptedInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: 'accepted'
    });

    if (existingAcceptedInvitation) {
      return res.status(400).json({ 
        message: `You are already registered for property: ${existingAcceptedInvitation.propertyName}. Cannot register for multiple properties.` 
      });
    }

    // Validate the invitation code
    const invitation = await Invitation.findOne({
      invitationCode: invitationCode.toUpperCase(),
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation code' });
    }
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  const user = new User({ email, fullName, username, password, role });
  await user.save();

  // If tenant registration was successful, link tenant to property and mark invitation as accepted
  if (role === 'tenant' && invitationCode) {
    // Find the invitation again to get property details
    const invitation = await Invitation.findOne({
      invitationCode: invitationCode.toUpperCase(),
      email: email.toLowerCase()
    });

    if (invitation) {
      // Update invitation status
      await Invitation.findOneAndUpdate(
        { invitationCode: invitationCode.toUpperCase() },
        { 
          status: 'accepted',
          username: username
        }
      );

      // Link tenant to property
      await Property.findByIdAndUpdate(
        invitation.propertyId,
        {
          tenantId: user._id,
          tenantEmail: email.toLowerCase(),
          tenantName: fullName,
          status: 'rented'
        }
      );
    }
  }

  return res.status(201).json({ message: 'User registered successfully' });
} 