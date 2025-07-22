import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Invoice } from '../_db/Invoice';
import { IncomingForm, Fields, Files, File } from 'formidable';
// import fs from 'fs';
// import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  await dbConnect();
  // const form = new IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });
  const form = new IncomingForm({ keepExtensions: true }); // uploadDir commented out
  form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
    (async () => {
      if (err) {
        console.error('File upload error:', err);
        res.status(500).json({ success: false, message: 'File upload error', error: err.message });
        return;
      }
      try {
        // Convert all fields to string (first value) if they are arrays
        const invoiceData: Record<string, string | number | undefined> = {};
        for (const key in fields) {
          invoiceData[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
        }
        // if (files.screenshot && Array.isArray(files.screenshot)) {
        //   invoiceData.screenshotUrl = `/uploads/${path.basename(files.screenshot[0].filepath)}`;
        // } else if (files.screenshot) {
        //   invoiceData.screenshotUrl = `/uploads/${path.basename((files.screenshot as File).filepath)}`;
        // }
        // Do NOT process or save screenshot/image (code commented out)
        if (invoiceData.rentAmount) invoiceData.rentAmount = Number(invoiceData.rentAmount);
        const invoice = new Invoice(invoiceData);
        await invoice.save();
        res.status(201).json({ success: true, message: 'Invoice submitted successfully', data: invoice });
      } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
      }
    })();
  });
} 