const mongoose = require('mongoose')

const BRAND_TYPES = ['Medicine', 'Medical Equipment', 'Consumable', 'Procedure Material']

const brandSchema = new mongoose.Schema({
  brandCode:        { type: String, default: '' },         // auto e.g. BR-0037
  brandName:        { type: String, required: true },
  brandShortName:   { type: String, default: '' },
  brandType:        { type: String, enum: [...BRAND_TYPES, ''], default: '' },
  displayOrder:     { type: Number, default: 1 },

  // Company Information
  manufacturer:     { type: String, default: '' },          // Manufacturer Name *
  companyName:       { type: String, default: '' },          // parent company
  vendor:           { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  countryOfOrigin:  { type: String, default: 'India' },

  // Contact Information
  contactPerson:    { type: String, default: '' },
  mobileNumber:     { type: String, default: '' },
  email:            { type: String, default: '' },
  website:          { type: String, default: '' },

  // Financial Information
  gstApplicable:    { type: Boolean, default: true },
  gstPercentage:    { type: Number, default: null },
  defaultMarginPercent: { type: Number, default: 0 },
  commissionPercent:    { type: Number, default: 0 },

  description:      { type: String, default: '' },
  remarks:          { type: String, default: '' },

  // Audit
  createdBy:        { type: String, default: '' },
  modifiedBy:       { type: String, default: '' },

  isActive:         { type: Boolean, default: true },
}, { timestamps: true })

brandSchema.index({ brandType: 1 })

module.exports = mongoose.model('Brand', brandSchema)
module.exports.BRAND_TYPES = BRAND_TYPES