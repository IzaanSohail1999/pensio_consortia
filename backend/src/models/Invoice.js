// models/Invoice.ts
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  cellNumber: String,
  phantomWallet: String,
  rentAddress: String,
  rentAmount: Number,
  leaseTerm: String,
  landlordFirstName: String,
  landlordLastName: String,
  landlordCompany: String,
  screenshotUrl: String, // Path or URL to uploaded screenshot
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);