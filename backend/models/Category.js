const mongoose = require('mongoose')

const CATEGORY_TYPES = ['Medicine', 'Treatment', 'Procedure', 'Material', 'Service', 'Lab Test', 'Income', 'Expense']

const categorySchema = new mongoose.Schema({
  categoryCode:     { type: String, default: '' },         // auto e.g. CAT-049
  categoryName:     { type: String, required: true },
  categoryType:     { type: String, enum: CATEGORY_TYPES, default: '' }, // Medicine/Treatment/...
  parentCategory:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  branch:           { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  displayOrder:     { type: Number, default: 1 },
  description:      { type: String, default: '' },

  // GST & Compliance
  gstPercentage:    { type: Number, default: null },
  hsnCode:          { type: String, default: '' },
  isTaxable:        { type: Boolean, default: true },

  // Icon & Color
  icon:             { type: String, default: '' },          // icon key/emoji
  color:            { type: String, default: '#0D6EAC' },   // hex
  categoryImage:    { type: String, default: '' },          // uploaded image URL/path

  // Audit (createdBy/modifiedBy as text/refs; dates come from timestamps)
  createdBy:        { type: String, default: '' },
  modifiedBy:        { type: String, default: '' },
  remarks:          { type: String, default: '' },

  isActive:         { type: Boolean, default: true },
}, { timestamps: true })

categorySchema.index({ categoryType: 1 })
categorySchema.index({ parentCategory: 1 })

module.exports = mongoose.model('Category', categorySchema)
module.exports.CATEGORY_TYPES = CATEGORY_TYPES