const mongoose = require('mongoose')
const daySchema = {
  open:  { type: String, default: '09:00' },
  close: { type: String, default: '18:00' },
}
const branchSchema = new mongoose.Schema({
  // Basic
  branchCode:   { type: String, default: '' },
  branchName:   { type: String, required: true },
  branchType:   { type: String, enum: ['Main Branch','Franchise','Clinic','Pharmacy'], default: 'Main Branch' },
  status:       { type: String, enum: ['Active','Inactive'], default: 'Active' },
  branchLogo:   { type: String, default: '' },
  description:  { type: String, default: '' },
  // Contact
  contactPerson:   { type: String, default: '' },
  mobileNumber:    { type: String, default: '' },
  alternateMobile: { type: String, default: '' },
  landlineNumber:  { type: String, default: '' },
  email:           { type: String, default: '' },
  alternateEmail:  { type: String, default: '' },
  website:         { type: String, default: '' },
  // Address
  addressLine1:   { type: String, default: '' },
  addressLine2:   { type: String, default: '' },
  area:           { type: String, default: '' },
  city:           { type: String, default: '' },
  district:       { type: String, default: '' },
  state:          { type: String, default: '' },
  country:        { type: String, default: 'India' },
  pincode:        { type: String, default: '' },
  googleMapLink:  { type: String, default: '' },
  latitude:       { type: Number, default: 0 },
  longitude:      { type: Number, default: 0 },
  // Operations
  openingTime:           { type: String, default: '09:00' },
  closingTime:           { type: String, default: '21:00' },
  workingDays:           [{ type: String }],
  weeklyOff:             { type: String, default: 'Sunday' },
  emergencyService:      { type: Boolean, default: false },
  service24x7:           { type: Boolean, default: false },
  // Facility
  totalFloors:           { type: Number, default: 0 },
  totalCabins:           { type: Number, default: 0 },
  totalConsultationRooms:{ type: Number, default: 0 },
  totalDoctors:          { type: Number, default: 0 },
  waitingHallCapacity:   { type: Number, default: 0 },
  pharmacyAvailable:     { type: Boolean, default: false },
  laboratoryAvailable:   { type: Boolean, default: false },
  xrayAvailable:         { type: Boolean, default: false },
  scanAvailable:         { type: Boolean, default: false },
  otAvailable:           { type: Boolean, default: false },
  // Financial
  gstNumber:             { type: String, default: '' },
  panNumber:             { type: String, default: '' },
  registrationNumber:    { type: String, default: '' },
  bankName:              { type: String, default: '' },
  accountNumber:         { type: String, default: '' },
  ifscCode:              { type: String, default: '' },
  upiId:                 { type: String, default: '' },
  // Prefixes
  branchPrefix:    { type: String, default: '' },
  invoicePrefix:   { type: String, default: 'INV-' },
  patientPrefix:   { type: String, default: 'PAT-' },
  appointmentPrefix:{ type: String, default: 'APT-' },
  estimationPrefix:{ type: String, default: 'EST-' },
  defaultCurrency: { type: String, default: 'INR' },
  timeZone:        { type: String, default: 'Asia/Kolkata' },
  // Staff counts
  receptionistCount: { type: Number, default: 0 },
  doctorCount:       { type: Number, default: 0 },
  staffCount:        { type: Number, default: 0 },
  // Portal login
  password: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
module.exports = mongoose.model('Branch', branchSchema)
