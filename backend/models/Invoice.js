const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    companyType: {
      type: String,
      enum: ['Pvt Ltd', 'LLP', 'Proprietorship', 'Partnership', 'Other'],
      required: true,
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'],
    },
    transaction: { type: String, default: '' },
    balanceAmount: { type: Number, default: 0 },
    softCopy: { type: String, default: '' },
    comments: { type: String, default: '' },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Partial', 'Overdue'],
      default: 'Pending',
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

invoiceSchema.pre('save', function (next) {
  this.balanceAmount = this.totalAmount - this.paidAmount
  if (this.balanceAmount <= 0) this.status = 'Paid'
  else if (this.paidAmount > 0) this.status = 'Partial'
  next()
})

module.exports = mongoose.model('Invoice', invoiceSchema)
