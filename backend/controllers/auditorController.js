const bcrypt = require('bcryptjs')
const Auditor = require('../models/Auditor')

exports.createAuditor = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNo, qualification, firmName, gstNo, address, auditType, assignedBranches } = req.body
    const existing = await Auditor.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const auditor = await Auditor.create({ name, email, password: hashedPassword, phone, licenseNo, qualification, firmName, gstNo, address, auditType, assignedBranches })
    res.status(201).json({ success: true, message: 'Auditor created successfully', data: auditor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllAuditors = async (req, res) => {
  try {
    const auditors = await Auditor.find().populate('assignedBranches', 'name').select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: auditors })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAuditorById = async (req, res) => {
  try {
    const auditor = await Auditor.findById(req.params.id).populate('assignedBranches').select('-password')
    if (!auditor) return res.status(404).json({ success: false, message: 'Auditor not found' })
    res.json({ success: true, data: auditor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateAuditor = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password) updateData.password = await bcrypt.hash(updateData.password, 10)
    const auditor = await Auditor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!auditor) return res.status(404).json({ success: false, message: 'Auditor not found' })
    res.json({ success: true, message: 'Auditor updated successfully', data: auditor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteAuditor = async (req, res) => {
  try {
    const auditor = await Auditor.findByIdAndDelete(req.params.id)
    if (!auditor) return res.status(404).json({ success: false, message: 'Auditor not found' })
    res.json({ success: true, message: 'Auditor deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
