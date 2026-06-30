const mongoose = require('mongoose')
const transactionSchema = new mongoose.Schema({
  rollType: { type: String, required: true },
  staffName: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionDate: { type: Date, required: true },
  paymentMode: { type: String, enum: ['Reference Mode','Cash','Card','UPI','Net Banking','Cheque'], required: true },
  referenceNo: { type: String, default: '' },
  notes: { type: String, default: '' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
module.exports = mongoose.model('Transaction', transactionSchema)
