const fs = require('fs');
const path = require('path');
const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);

    if (req.file) {
      // Corrected field name
      invoice.screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await invoice.save();
    res.status(201).json({ success: true, message: 'Invoice submitted successfully', data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get Single Invoice by ID
exports.getOneInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update Invoice by ID
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // If new file uploaded and old file exists, delete the old file
    if (req.file && invoice.screenshotUrl) {
      const baseUrl = `${req.protocol}://${req.get('host')}/`;
      const relativePath = invoice.screenshotUrl.replace(baseUrl, ''); // e.g. uploads/oldfile.png
      const fullPath = path.join(__dirname, '..', relativePath);

      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error('❌ Error deleting old file:', err);
          else console.log('✅ Old file deleted:', fullPath);
        });
      } else {
        console.warn('⚠️ Old file not found at path:', fullPath);
      }
    }

    // Prepare updated data
    const updateData = { ...req.body };

    // If new file uploaded, update the screenshotUrl field
    if (req.file) {
      updateData.screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ success: true, message: 'Invoice updated', data: updatedInvoice });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete Invoice by ID
exports.deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, message: 'Invoice deleted', data: deletedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
