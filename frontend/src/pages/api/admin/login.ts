import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Admin } from '../_db/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { username, password } = req.body;
  await dbConnect();
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(400).json({ message: 'Admin not found' });
  }
  const isMatch = await admin.matchPassword(password);
  console.log('admin found: ', isMatch)
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password' });
  }
  const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    admin: {
      email: admin.email,
      username: admin.username,
      fullName: admin.fullName,
    },
  });
} 