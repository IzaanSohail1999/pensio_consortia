import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { User } from '../_db/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  if (typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }
  await dbConnect();
  if (req.method === 'GET') {
    const user = await User.findOne({ username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } else if (req.method === 'PUT') {
    const { email, fullName, password, role } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    const { password: pw, ...userData } = user.toObject();
    return res.status(200).json({ message: 'User updated successfully', user: userData });
  } else if (req.method === 'DELETE') {
    const user = await User.findOneAndDelete({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User deleted successfully' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 