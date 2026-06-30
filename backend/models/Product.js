const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  productCode:      { type: String, default: '' },
  barcode:          { type: String, default: '' },
  productName:      { type: String, required: true },
  genericName:      { type: String, default: '' },
  brandName:        { type: String, default: '' },
  category:         { type: String, default: '' },
  subCategory:      { type: String, default: '' },
  manufacturerName: { type: String, default: '' },
  vendorName:       { type: String, default: '' },
  productType:      { type: String, enum: ['Medicine','Surgical','Consumable','Equipment','Other'], default: 'Medicine' },
  // Medicine details
  composition:      { type: String, default: '' },
  strength:         { type: String, default: '' },
  dosageForm:       { type: String, enum: ['Tablet','Capsule','Syrup','Injection','Cream','Ointment','Drops','Other'], default: 'Tablet' },
  packSize:         { type: String, default: '' },
  hsnCode:          { type: String, default: '' },
  scheduleType:     { type: String, enum: ['H','H1','X','OTC',''], default: '' },
  storageCondition: { type: String, default: '' },
  // Pricing
  purchasePrice:    { type: Number, default: 0 },
  landingCost:      { type: Number, default: 0 },
  mrp:              { type: Number, default: 0 },
  sellingPrice:     { type: Number, default: 0 },
  marginPercent:    { type: Number, default: 0 },
  discountPercent:  { type: Number, default: 0 },
  gstPercent:       { type: Number, default: 0 },
  cgstPercent:      { type: Number, default: 0 },
  sgstPercent:      { type: Number, default: 0 },
  igstPercent:      { type: Number, default: 0 },
  // Stock
  openingStock:     { type: Number, default: 0 },
  currentStock:     { type: Number, default: 0 },
  minStockLevel:    { type: Number, default: 0 },
  maxStockLevel:    { type: Number, default: 0 },
  reorderLevel:     { type: Number, default: 0 },
  reorderQty:       { type: Number, default: 0 },
  unitOfMeasure:    { type: String, enum: ['Nos','Box','Strip','Bottle','Kg','Gram','Litre','Pack','Other'], default: 'Nos' },
  // Batch
  batchNumber:      { type: String, default: '' },
  manufacturingDate:{ type: Date },
  expiryDate:       { type: Date },
  shelfLife:        { type: String, default: '' },
  // Vendor
  preferredVendor:  { type: String, default: '' },
  vendorProductCode:{ type: String, default: '' },
  lastPurchasePrice:{ type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  // Extras
  description:      { type: String, default: '' },
  usageInstructions:{ type: String, default: '' },
  sideEffects:      { type: String, default: '' },
  notes:            { type: String, default: '' },
  productImage:     { type: String, default: '' },
  isActive:         { type: Boolean, default: true },
  // inside productSchema, near batchNumber:
serialNumber:     { type: String, default: '' },
// lastPurchaseDate already exists in your model — good, keep it.

// also add doc/image fields used by Step 7:
productBrochure:     { type: String, default: '' },
productCertificate:  { type: String, default: '' },
drugLicenseCopy:     { type: String, default: '' },
}, { timestamps: true })
module.exports = mongoose.model('Product', productSchema)
