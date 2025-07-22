import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Admin } from '../_db/Admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password, username, fullName } = req.body;
  if (!email || !password || !username || !fullName) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  await dbConnect();
  const emailExists = await Admin.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: 'Email is already registered' });
  }
  const usernameExists = await Admin.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: 'Username is already taken' });
  }
  const admin = new Admin({ email, username, fullName, password });
  await admin.save();
  return res.status(201).json({ message: 'Admin registered successfully' });
} 