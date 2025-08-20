import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../_db/mongoConnect';
import { User } from '../../_db/User';
import { withAuth } from '@/middleware/auth';

interface GetUserByEmailRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

async function getUserByEmailHandler(req: GetUserByEmailRequest, res: NextApiResponse) {
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

    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    await dbConnect();
    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('_id email fullName username role createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user by email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
}

export default withAuth(getUserByEmailHandler);
