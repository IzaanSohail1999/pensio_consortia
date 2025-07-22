import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import { Invoice } from '../_db/Invoice';
import { IncomingForm, Fields } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
  }
  await dbConnect();
  if (req.method === 'GET') {
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.status(200).json({ success: true, data: invoice });
  } else if (req.method === 'PUT') {
    // const form = new IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });
    const form = new IncomingForm({ keepExtensions: true }); // uploadDir commented out
    form.parse(req, (err: Error | null, fields: Fields/*, files: Files*/) => {
      (async () => {
        if (err) {
          res.status(500).json({ success: false, message: 'File upload error', error: err.message });
          return;
        }
        try {
          const invoice = await Invoice.findById(id);
          if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
          // If new file uploaded and old file exists, delete the old file
          // if (files.screenshot && invoice.screenshotUrl) {
          //   const oldPath = path.join(process.cwd(), 'public', invoice.screenshotUrl);
          //   if (fs.existsSync(oldPath)) {
          //     fs.unlinkSync(oldPath);
          //   }
          // }
          // Convert all fields to string (first value) if they are arrays
          const updateData: Record<string, string | number | undefined> = {};
          for (const key in fields) {
            updateData[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          }
          // if (files.screenshot && Array.isArray(files.screenshot)) {
          //   updateData.screenshotUrl = `/uploads/${path.basename(files.screenshot[0].filepath)}`;
          // } else if (files.screenshot) {
          //   updateData.screenshotUrl = `/uploads/${path.basename((files.screenshot as File).filepath)}`;
          // }
          // Do NOT process or save screenshot/image (code commented out)
          if (updateData.rentAmount) updateData.rentAmount = Number(updateData.rentAmount);
          const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true });
          res.status(200).json({ success: true, message: 'Invoice updated', data: updatedInvoice });
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
        }
      })();
    });
  } else if (req.method === 'DELETE') {
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    // Optionally delete the screenshot file
    if (deletedInvoice.screenshotUrl) {
      const filePath = path.join(process.cwd(), 'public', deletedInvoice.screenshotUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return res.status(200).json({ success: true, message: 'Invoice deleted', data: deletedInvoice });
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 