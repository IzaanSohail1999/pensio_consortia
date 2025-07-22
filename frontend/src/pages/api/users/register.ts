import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { User } from '../_db/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, fullName, username, password, role } = req.body;
  if (!email || !fullName || !username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  await dbConnect();
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
  return res.status(201).json({ message: 'User registered successfully' });
} 