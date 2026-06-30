const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Medicine', 'Equipment', 'Staff', 'Utilities', 'Rent', 'Marketing', 'Other'],
    },
    description: { type: String },
    date: { type: Date, default: Date.now },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'],
    },
    receipt: { type: String, default: '' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Expense', expenseSchema)
