const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
  // ── Basic ────────────────────────────────────────────────────────────────────
  employeeId:       { type: String, default: '' },          // display id e.g. EMP-0043
  employeeCode:     { type: String, default: '' },
  firstName:        { type: String, required: true },
  lastName:         { type: String, default: '' },
  name:             { type: String, required: true },       // full name (firstName + lastName)
  gender:           { type: String, enum: ['Male','Female','Other',''], default: '' },
  dob:              { type: Date },
  bloodGroup:       { type: String, default: '' },
  maritalStatus:    { type: String, default: '' },
  phone:            { type: String, required: true },
  alternateMobile:  { type: String, default: '' },
  email:            { type: String, required: true, unique: true },
  avatar:           { type: String, default: '' },

  // ── Employment ───────────────────────────────────────────────────────────────
  branch:           { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  department:       { type: String, default: '' },
  designation:      { type: String, default: '' },
  employeeType:     { type: String, enum: ['Full Time','Part Time','Contract',''], default: '' },
  joiningDate:      { type: Date },
  probationEndDate: { type: Date },
  reportingManager: { type: String, default: '' },
  shift:            { type: String, default: '' },          // employment shift (from Employment step)
  status:           { type: String, enum: ['Active','Inactive'], default: 'Active' },

  // ── Identity Documents ───────────────────────────────────────────────────────
  aadharNo:       { type: String, required: true, unique: true },
  panCardNo:      { type: String, required: true, unique: true },
  drivingLicense: { type: String, default: '' },
  passportNo:     { type: String, default: '' },
  idCardNo:       { type: String, default: '' },

  // ── Document Collection Status ───────────────────────────────────────────────
  docAadhaarUploaded:        { type: Boolean, default: false },
  docPanUploaded:            { type: Boolean, default: false },
  docResumeUploaded:         { type: Boolean, default: false },
  docQualificationUploaded:  { type: Boolean, default: false },
  docExperienceUploaded:     { type: Boolean, default: false },
  docPhotoUploaded:          { type: Boolean, default: false },

  // ── Address ──────────────────────────────────────────────────────────────────
  sameAsPresent:    { type: Boolean, default: false },
  // Present
  presentDoorNo:    { type: String, default: '' },
  presentStreet:    { type: String, default: '' },
  presentArea:      { type: String, default: '' },
  presentCity:      { type: String, default: '' },
  presentState:     { type: String, default: '' },
  presentPincode:   { type: String, default: '' },
  // Permanent
  permanentDoorNo:  { type: String, default: '' },
  permanentStreet:  { type: String, default: '' },
  permanentArea:    { type: String, default: '' },
  permanentCity:    { type: String, default: '' },
  permanentState:   { type: String, default: '' },
  permanentPincode: { type: String, default: '' },

  // ── Professional ─────────────────────────────────────────────────────────────
  qualification:  { type: String, default: '' },
  experience:     { type: Number, default: 0 },
  licenseNo:      { type: String, default: '' },
  registrationNo: { type: String, default: '' },
  specialization: { type: String, default: '' },
  skills:         [{ type: String }],

  // ── Salary ───────────────────────────────────────────────────────────────────
  salaryType:          { type: String, enum: ['Monthly','Daily'], default: 'Monthly' },
  basicSalary:         { type: Number, default: 0 },
  allowance:           { type: Number, default: 0 },
  incentive:           { type: Number, default: 0 },
  salaryEffectiveDate: { type: Date },
  pfApplicable:        { type: Boolean, default: true },
  esiApplicable:       { type: Boolean, default: true },

  // ── Bank ─────────────────────────────────────────────────────────────────────
  bankName:            { type: String, default: '' },
  bankBranchName:      { type: String, default: '' },
  bankAccountHolder:   { type: String, default: '' },
  bankAccountNo:       { type: String, default: '' },
  bankIfscCode:        { type: String, default: '' },
  upiId:               { type: String, default: '' },

  // ── Emergency Contact ────────────────────────────────────────────────────────
  emergencyContactName: { type: String, default: '' },
  emergencyRelationship:{ type: String, default: '' },
  emergencyPhone:       { type: String, default: '' },
  emergencyAltPhone:    { type: String, default: '' },      // alternate emergency number (from design)

  // ── Login & Access ───────────────────────────────────────────────────────────
  username:             { type: String, default: '' },
  password:             { type: String, required: true },
  role:                 { type: String, enum: ['Admin','Doctor','Receptionist','Pharmacist','Nurse','Accountant','Store Keeper','Other',''], default: '' },
  loginStatus:          { type: String, enum: ['Active','Inactive','Blocked'], default: 'Active' },
  sendCredEmail:        { type: Boolean, default: true },
  sendCredWhatsapp:     { type: Boolean, default: false },
  forcePasswordChange:  { type: Boolean, default: true },
  lastLogin:            { type: Date },

  // ── Attendance ───────────────────────────────────────────────────────────────
  biometricId:      { type: String, default: '' },
  shift2:           { type: String, default: '' },          // attendance shift (from Attendance step)
  weeklyOff:        { type: String, default: '' },
  overtimeEligible: { type: Boolean, default: false },
  gpsAttendance:    { type: Boolean, default: false },
  mobilePunchIn:    { type: Boolean, default: true },
  attendancePercent:{ type: Number, default: 0 },

  // ── System ───────────────────────────────────────────────────────────────────
  remarks:   { type: String, default: '' },
  createdBy: { type: String, default: '' },
  updatedBy: { type: String, default: '' },
  isActive:  { type: Boolean, default: true },

}, { timestamps: true })

module.exports = mongoose.model('Employee', employeeSchema)