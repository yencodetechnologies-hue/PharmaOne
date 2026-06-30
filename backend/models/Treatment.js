const mongoose = require('mongoose')

const materialRowSchema = new mongoose.Schema({
  materialName: { type: String, default: '' },
  qty:          { type: Number, default: 1 },
  unit:         { type: String, default: 'Nos' },
  estCost:      { type: Number, default: 0 },
}, { _id: false })

const doctorConfigSchema = new mongoose.Schema({
  doctorId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName:       { type: String, default: '' },
  consultationFee:  { type: Number, default: 0 },
  treatmentFee:     { type: Number, default: 0 },
  commissionPercent:{ type: Number, default: 0 },
}, { _id: false })

const treatmentSchema = new mongoose.Schema({
  treatmentCode:      { type: String, default: '' },
  treatmentName:      { type: String, required: true },
  treatmentCategory:  { type: String, default: '' },
  department:         { type: String, default: '' },
  description:        { type: String, default: '' },
  durationMinutes:    { type: Number, default: 0 },
  numberOfSessions:   { type: Number, default: 1 },
  treatmentCost:      { type: Number, default: 0 },
  discountAllowed:    { type: Boolean, default: false },
  gstApplicable:      { type: Boolean, default: false },
  gstPercentage:      { type: Number, default: 0 },
  doctorRequired:     { type: Boolean, default: true },
  assistantRequired:  { type: Boolean, default: false },
  materialRequired:   { type: Boolean, default: false },
  consentFormRequired:{ type: Boolean, default: false },
  beforePhotoRequired:{ type: Boolean, default: false },
  afterPhotoRequired: { type: Boolean, default: false },
  followUpRequired:   { type: Boolean, default: false },
  followUpDays:       { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },

  // Step 4 — Material Mapping
  materials:          { type: [materialRowSchema], default: [] },

  // Step 5 — Doctor Configuration
  doctorConfigs:      { type: [doctorConfigSchema], default: [] },

  // Step 6 — Package
  includeInPackage:   { type: Boolean, default: false },
  packageName:        { type: String, default: '' },
  packageId:          { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPackage' },
}, { timestamps: true })

// Virtual: total cost including GST (per session basis handled in UI)
treatmentSchema.virtual('totalCostWithGst').get(function () {
  const base = this.treatmentCost || 0
  const gst = this.gstApplicable ? (base * (this.gstPercentage || 0)) / 100 : 0
  return Math.round(base + gst)
})
treatmentSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Treatment', treatmentSchema)