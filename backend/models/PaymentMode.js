const mongoose = require('mongoose')

const paymentModeSchema = new mongoose.Schema({
  // Basic
  paymentModeId:   { type: String, default: '' },     // PMT-016 auto
  modeName:        { type: String, required: true, unique: true },
  paymentType:     { type: String, enum: ['Cash','Digital / UPI','Card','Bank Transfer','Cheque','Demand Draft','Wallet','Insurance','Credit Billing',''], default: '' },
  description:     { type: String, default: '' },
  status:          { type: String, enum: ['Active','Inactive'], default: 'Active' },
  isActive:        { type: Boolean, default: true },

  // Bank & UPI
  accountName:     { type: String, default: '' },
  accountNumber:   { type: String, default: '' },
  bankName:        { type: String, default: '' },
  bankBranchName:  { type: String, default: '' },
  ifscCode:        { type: String, default: '' },
  upiId:           { type: String, default: '' },
  qrCodeImage:     { type: String, default: '' },

  // Configuration
  transactionCharges: { type: Number, default: 0 },
  dailyLimit:          { type: Number, default: 0 },
  allowRefund:         { type: Boolean, default: true },
  isDefault:           { type: Boolean, default: false },

  // Multi-branch
  branch:            { type: String, default: 'All Branches' },
  collectionAccount: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('PaymentMode', paymentModeSchema)
