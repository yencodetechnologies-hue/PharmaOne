const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName: { type: String },
  orderDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending','Approved','Delivered','Cancelled'], default: 'Pending' },
  items: [{
    materialName: String, brand: String,
    qty: Number, price: Number
  }],
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
module.exports = mongoose.model('Order', orderSchema)
