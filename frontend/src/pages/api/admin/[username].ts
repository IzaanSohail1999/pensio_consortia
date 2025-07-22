import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Admin } from '../_db/Admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  if (typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }
  await dbConnect();
  if (req.method === 'GET') {
    const admin = await Admin.findOne({ username }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    return res.status(200).json(admin);
  } else if (req.method === 'PUT') {
    const { email, fullName, password } = req.body;
    console.log("Details: ", email, fullName, password)
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (email) admin.email = email;
    if (fullName) admin.fullName = fullName;
    if (password) admin.password = password;
    await admin.save();
    const { password: pw, ...adminData } = admin.toObject();
    return res.status(200).json({ message: 'Admin updated successfully', admin: adminData });
  } else if (req.method === 'DELETE') {
    const admin = await Admin.findOneAndDelete({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    return res.status(200).json({ message: 'Admin deleted successfully' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 