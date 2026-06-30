const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  // ── 1. Basic Info ──────────────────────────────────────────────
  vendorId:        { type: String, default: '' },          // auto VEN-XXXX
  vendorCode:      { type: String, default: '' },          // VEN-CHN-025
  distributorName: { type: String, required: true },       // Vendor Name (full)
  contactPerson:   { type: String, default: '' },
  vendorType:      { type: String, enum: ['Distributor','Manufacturer','Supplier'], default: 'Distributor' },
  status:          { type: String, enum: ['Active','Inactive'], default: 'Active' },
  isActive:        { type: Boolean, default: true },

  // ── 2. Contact ─────────────────────────────────────────────────
  phone:            { type: String, required: true },
  alternateMobile:  { type: String, default: '' },
  landlineNumber:   { type: String, default: '' },
  email:            { type: String, required: true, unique: true },
  alternativeEmail: { type: String, default: '' },
  website:          { type: String, default: '' },

  // ── 3. Address ─────────────────────────────────────────────────
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String, default: '' },
  area:         { type: String, default: '' },
  city:         { type: String, default: '' },
  district:     { type: String, default: '' },
  state:        { type: String, default: '' },
  country:      { type: String, default: 'India' },
  pincode:      { type: String, default: '' },

  // ── 4. Business Info ───────────────────────────────────────────
  distributorCode: { type: String, required: true, unique: true }, // kept for compat
  gstNo:           { type: String, required: true },
  panNumber:       { type: String, default: '' },
  drugLicense:     { type: String, default: '' },
  fssaiNumber:     { type: String, default: '' },
  msmeNumber:      { type: String, default: '' },
  cinNumber:       { type: String, default: '' },

  // ── 5. Bank Details ────────────────────────────────────────────
  bankName:       { type: String, default: '' },
  bankBranchName: { type: String, default: '' },
  accountHolder:  { type: String, default: '' },
  accountNumber:  { type: String, default: '' },
  ifscCode:       { type: String, default: '' },
  upiId:          { type: String, default: '' },

  // ── 6. Purchase Info ───────────────────────────────────────────
  creditDays:       { type: Number, default: 0 },
  creditLimit:      { type: Number, default: 0 },
  openingBalance:   { type: Number, default: 0 },
  outstandingBalance:{ type: Number, default: 0 },
  preferredVendor:  { type: Boolean, default: false },
  minimumOrderValue:{ type: Number, default: 0 },
  supplyArea:       { type: String, default: '' },

  // ── 7. Products ────────────────────────────────────────────────
  productCategories: [{ type: String }],
  brandNames:        [{ type: String }],
  productsSupplied:  [{ type: String }],
  products: [{
    serialNo:    { type: String },
    productName: { type: String },
    withGST:     { type: Number },
    withoutGST:  { type: Number },
    mrp:         { type: Number },
    margin:      { type: Number },
    sellingPrice:{ type: Number },
  }],

  // ── 8. Documents ───────────────────────────────────────────────
  gstCertificate:  { type: String, default: '' },
  panCardCopy:     { type: String, default: '' },
  drugLicenseCopy: { type: String, default: '' },
  cancelledCheque: { type: String, default: '' },
  agreementCopy:   { type: String, default: '' },
  otherCertificates:{ type: String, default: '' },

  // ── 9. Communication ───────────────────────────────────────────
  lastPurchaseDate: { type: Date },
  lastContactDate:  { type: Date },
  notes:    { type: String, default: '' },
  comments: { type: String, default: '' },

  // ── 10. Audit & Alerts ─────────────────────────────────────────
  alertPurchase:    { type: Boolean, default: true },
  alertBalance:     { type: Boolean, default: true },
  alertLicenseExpiry:{ type: Boolean, default: true },

  // ── Login ──────────────────────────────────────────────────────
  password: { type: String, required: true },

  // legacy field kept for compat
  distributorAddress: { type: String, default: '' },
  bankDetails: {
    branch:        { type: String },
    accountNumber: { type: String },
    ifscCode:      { type: String },
    upiId:         { type: String },
  },
}, { timestamps: true })

module.exports = mongoose.model('Vendor', vendorSchema)
