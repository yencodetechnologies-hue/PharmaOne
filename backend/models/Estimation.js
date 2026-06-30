const mongoose = require('mongoose')
const estimationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientName: { type: String },
  estimationDate: { type: Date },
  status: { type: String, enum: ['Draft','Sent','Approved','Rejected'], default: 'Draft' },
  procedures: [{
    treatmentProcedure: String,
    treatmentPrice: Number
  }],
  totalAmount: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
module.exports = mongoose.model('Estimation', estimationSchema)
