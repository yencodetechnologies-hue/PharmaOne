const mongoose = require('mongoose')

const superAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    permissions: {
      manageAdmins: { type: Boolean, default: true },
      manageBranches: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      manageSettings: { type: Boolean, default: true },
      manageAuditors: { type: Boolean, default: true },
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('SuperAdmin', superAdminSchema)
