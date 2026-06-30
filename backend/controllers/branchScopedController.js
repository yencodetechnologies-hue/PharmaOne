/**
 * branchScopedController.js
 * Controllers used by branch and staff portals to manage staff & clients
 * scoped to a specific branch.
 */
const bcrypt    = require('bcryptjs')
const Employee  = require('../models/Employee')
const Client    = require('../models/Client')

// ──────────────────────────────────────────────
//  STAFF (Employee) — Branch Scoped
// ──────────────────────────────────────────────

/** GET /api/branch-portal/staff?branchId=xxx  */
exports.getBranchStaff = async (req, res) => {
  try {
    const { branchId } = req.query
    const filter = branchId ? { branch: branchId } : {}
    const staff = await Employee.find(filter)
      .populate('branch', 'branchName')
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** POST /api/branch-portal/staff */
exports.createBranchStaff = async (req, res) => {
  try {
    const { name, phone, aadharNo, panCardNo, address, email, password,
            communicationAddress, presentAddress, licenseNo, salary,
            idCardNo, designation, department, joiningDate, branch } = req.body

    const existing = await Employee.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const employee = await Employee.create({
      name, phone, aadharNo, panCardNo, address,
      email, password: hashed,
      communicationAddress, presentAddress, licenseNo,
      salary, idCardNo, designation, department, joiningDate, branch,
    })

    const result = employee.toObject()
    delete result.password
    res.status(201).json({ success: true, message: 'Staff created', data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** PUT /api/branch-portal/staff/:id */
exports.updateBranchStaff = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    const emp = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!emp) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, message: 'Staff updated', data: emp })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** DELETE /api/branch-portal/staff/:id */
exports.deleteBranchStaff = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id)
    if (!emp) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, message: 'Staff deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ──────────────────────────────────────────────
//  CLIENTS (Patients) — Branch & Staff Scoped
// ──────────────────────────────────────────────

/** GET /api/branch-portal/clients?branchId=xxx */
exports.getBranchClients = async (req, res) => {
  try {
    const { branchId } = req.query
    const filter = branchId ? { branch: branchId } : {}
    const clients = await Client.find(filter)
      .populate('branch', 'branchName')
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: clients })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** GET /api/branch-portal/clients/:id */
exports.getBranchClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('branch', 'branchName').select('-password')
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, data: client })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** POST /api/branch-portal/clients */
exports.createBranchClient = async (req, res) => {
  try {
    const { name, surname, age, gender, referenceNo, email, password,
            patientEnquiryDate, patientAppointmentDate, treatmentDetails,
            procedureMaterial, doctorName, doctorId, branch } = req.body

    const existing = await Client.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const client = await Client.create({
      name, surname, age, gender, referenceNo, email, password: hashed,
      patientEnquiryDate, patientAppointmentDate, treatmentDetails,
      procedureMaterial, doctorName, doctorId, branch,
    })

    const result = client.toObject()
    delete result.password
    res.status(201).json({ success: true, message: 'Client created', data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** PUT /api/branch-portal/clients/:id */
exports.updateBranchClient = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, message: 'Client updated', data: client })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** DELETE /api/branch-portal/clients/:id */
exports.deleteBranchClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, message: 'Client deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
