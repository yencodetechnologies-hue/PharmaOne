const bcrypt = require('bcryptjs')
const generateToken = require('../utils/generateToken')

// Models
const SuperAdmin = require('../models/SuperAdmin')
const Host       = require('../models/Host')
const Branch     = require('../models/Branch')
const Employee   = require('../models/Employee')
const Client     = require('../models/Client')
const Doctor     = require('../models/Doctor')
const Vendor     = require('../models/Vendor')
const Auditor    = require('../models/Auditor')

/**
 * POST /api/multi-auth/login
 * Body: { email, password, role }
 * role: 'superadmin' | 'host' | 'branch' | 'staff' | 'client' | 'doctor' | 'vendor' | 'auditor'
 */
exports.multiLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password and role are required' })
    }

    let user = null
    let userData = {}

    switch (role) {
      case 'superadmin': {
        user = await SuperAdmin.findOne({ email })
        if (!user) return res.status(404).json({ success: false, message: 'SuperAdmin not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.name, email: user.email, role: 'superadmin' }
        break
      }
      case 'host': {
        user = await Host.findOne({ email }).populate('branch', 'branchName branchLocation')
        if (!user) return res.status(404).json({ success: false, message: 'Host not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.name, email: user.email, role: 'host', branch: user.branch }
        break
      }
      case 'branch': {
        // Branch logs in by email stored on branch doc
        const branch = await Branch.findOne({ email })
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
        // Branch password is its contactDetails hash — we compare directly
        // Branches use a shared password set via superadmin; stored as plain or hashed
        // Try plain compare first, then bcrypt
        let ok = false
        if (branch.password) {
          ok = branch.password === password
          if (!ok) {
            try { ok = await bcrypt.compare(password, branch.password) } catch {}
          }
        }
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: branch._id, name: branch.branchName, email: branch.email, role: 'branch', branchId: branch._id }
        break
      }
      case 'staff': {
        user = await Employee.findOne({ email }).populate('branch', 'branchName')
        if (!user) return res.status(404).json({ success: false, message: 'Staff not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.name, email: user.email, role: 'staff', designation: user.designation, branch: user.branch }
        break
      }
      case 'client': {
        user = await Client.findOne({ email }).populate('branch', 'branchName')
        if (!user) return res.status(404).json({ success: false, message: 'Client not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: `${user.name} ${user.surname}`, email: user.email, role: 'client', branch: user.branch }
        break
      }
      case 'doctor': {
        user = await Doctor.findOne({ email }).populate('branch', 'branchName')
        if (!user) return res.status(404).json({ success: false, message: 'Doctor not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.name, email: user.email, role: 'doctor', specialization: user.specialization, branch: user.branch }
        break
      }
      case 'vendor': {
        user = await Vendor.findOne({ email })
        if (!user) return res.status(404).json({ success: false, message: 'Vendor not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.distributorName, email: user.email, role: 'vendor', distributorCode: user.distributorCode }
        break
      }
      case 'auditor': {
        user = await Auditor.findOne({ email })
        if (!user) return res.status(404).json({ success: false, message: 'Auditor not found' })
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' })
        userData = { _id: user._id, name: user.name, email: user.email, role: 'auditor', auditType: user.auditType }
        break
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const token = generateToken(user._id)
    res.json({ success: true, token, user: userData })
  } catch (error) {
    console.error('multiLogin error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
