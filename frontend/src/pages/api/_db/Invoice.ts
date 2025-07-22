import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvoice extends Document {
  email: string;
  firstName: string;
  lastName: string;
  cellNumber: string;
  phantomWallet: string;
  rentAddress: string;
  rentAmount: number;
  leaseTerm: string;
  landlordFirstName: string;
  landlordLastName: string;
  landlordCompany: string;
  screenshotUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
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
  screenshotUrl: String,
}, { timestamps: true });

export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema); 