const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
  // 1. Basic Information
  doctorId:          { type: String, default: '' },
  doctorCode:        { type: String, default: '' },
  name:              { type: String, required: true },
  displayName:       { type: String, default: '' },
  firstName:         { type: String, default: '' },
  lastName:          { type: String, default: '' },
  gender:            { type: String, enum: ['Male','Female','Other'], default: 'Male' },
  dob:               { type: Date },
  bloodGroup:        { type: String, default: '' },
  maritalStatus:     { type: String, default: '' },
  avatar:            { type: String, default: '' },

  // 2. Professional Information
  qualification:           { type: String, default: '' },
  additionalQualification: { type: String, default: '' },
  specialization:          { type: String, required: true },
  subSpecialization:       { type: String, default: '' },
  registrationNo:          { type: String, default: '' },
  medicalCouncilNo:        { type: String, default: '' },
  licenseNo:               { type: String, required: true, unique: true },
  experience:              { type: Number, default: 0 },
  consultationFee:         { type: Number, default: 0 },
  followUpFee:             { type: Number, default: 0 },
  emergencyFee:            { type: Number, default: 0 },

  // 3. Contact Information
  phone:             { type: String, required: true },
  alternateMobile:   { type: String, default: '' },
  email:             { type: String, required: true, unique: true },
  alternateEmail:    { type: String, default: '' },
  emergencyContact:  { type: String, default: '' },

  // 4. Address Information
  addressLine1:      { type: String, default: '' },
  addressLine2:      { type: String, default: '' },
  city:              { type: String, default: '' },
  state:             { type: String, default: '' },
  country:           { type: String, default: 'India' },
  pincode:           { type: String, default: '' },

  // 5. Branch Information
  branch:            { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  department:        { type: String, default: '' },
  cabinNumber:       { type: String, default: '' },
  employeeType:      { type: String, enum: ['Full Time','Visiting','Part Time','Contract'], default: 'Full Time' },
  joiningDate:       { type: Date },
  relievingDate:     { type: Date },
  status:            { type: String, enum: ['Active','Inactive','On Leave'], default: 'Active' },

  // 6. Schedule Information
  availableDays:         [{ type: String }],
  morningFromTime:       { type: String, default: '' },
  morningToTime:         { type: String, default: '' },
  eveningFromTime:       { type: String, default: '' },
  eveningToTime:         { type: String, default: '' },
  maxAppointmentsPerDay: { type: Number, default: 0 },
  onlineConsultation:    { type: Boolean, default: false },
  slotDuration:          { type: Number, default: 15 },

  // 7. Financial Information
  salaryType:        { type: String, enum: ['Fixed','Percentage'], default: 'Fixed' },
  salaryAmount:      { type: Number, default: 0 },
  revenueShare:      { type: Number, default: 0 },
  bankName:          { type: String, default: '' },
  bankAccountNo:     { type: String, default: '' },
  bankIfscCode:      { type: String, default: '' },
  upiId:             { type: String, default: '' },

  // 8. Documents
  aadharNo:          { type: String, default: '' },
  panCardNo:         { type: String, default: '' },
  registrationCertificate: { type: String, default: '' },
  degreeCertificate: { type: String, default: '' },
  medicalLicenseCopy:{ type: String, default: '' },
  signature:         { type: String, default: '' },
  idCardCopy:        { type: String, default: '' },

  // 9. Login Information
  username:          { type: String, default: '' },
  password:          { type: String, required: true },
  loginStatus:       { type: String, enum: ['Active','Blocked'], default: 'Active' },
  lastLogin:         { type: Date },
  sendCredentialsEmail:    { type: Boolean, default: true },
  sendCredentialsWhatsapp: { type: Boolean, default: false },
  forcePasswordChange:     { type: Boolean, default: true },

  // 10. PharmaOne Specific
  treatmentSpeciality: [{ type: String }],
  procedureList:       [{ type: String }],
  xrayAccess:          { type: Boolean, default: false },
  audioNotesAccess:    { type: Boolean, default: false },
  videoNotesAccess:    { type: Boolean, default: false },
  prescriptionTemplate:{ type: String, default: '' },
  referralCommission:  { type: Number, default: 0 },

  bio:               { type: String, default: '' },
  remarks:           { type: String, default: '' },
  isActive:          { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Doctor', doctorSchema)