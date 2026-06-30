const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const hostSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male','Female','Other'], default: 'Male' },
  dob: { type: Date },
  address: { type: String, default: '' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
module.exports = mongoose.model('Host', hostSchema)
