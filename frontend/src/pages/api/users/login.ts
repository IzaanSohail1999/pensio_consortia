import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { User } from '../_db/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { username, password } = req.body;
  await dbConnect();
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password' });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullName: user.fullName
    },
  });
} 