import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Admin } from '../_db/Admin';
import jwt from 'jsonwebtoken';
import { withStrictRateLimit } from '@/middleware/rateLimit';
import { validateSigninFields } from '@/utils/validation';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate input with relaxed password requirements for signin
    const validation = validateSigninFields(req, ['username', 'password']);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { username, password } = validation.sanitizedData;

    // Type guard to ensure password is a string
    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid password format' });
    }

    await dbConnect();
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ username: admin.username }, JWT_SECRET as string, { expiresIn: '7d' });
    
    return res.json({
      token,
      admin: {
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
      },
    });
  } catch (error) {
    console.error('[ADMIN LOGIN] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Apply rate limiting (5 requests per 15 minutes)
export default withStrictRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })(loginHandler); 