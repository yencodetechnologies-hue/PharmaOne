const mongoose = require('mongoose')

const auditorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNo: { type: String },
    qualification: { type: String },
    firmName: { type: String },
    gstNo: { type: String },
    address: { type: String },
    auditType: {
      type: String,
      enum: ['Internal', 'External', 'Tax', 'Compliance'],
      default: 'Internal',
    },
    assignedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Auditor', auditorSchema)
