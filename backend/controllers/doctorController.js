const bcrypt = require('bcryptjs')
const Doctor = require('../models/Doctor')

exports.createDoctor = async (req, res) => {
  try {
    const body = { ...req.body }
    const existing = await Doctor.findOne({ email: body.email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })
    body.password = await bcrypt.hash(body.password, 10)
    if (req.file) body.avatar = req.file.path
    if (body.firstName && !body.name) body.name = `${body.firstName} ${body.lastName || ''}`.trim()
    if (!body.displayName) body.displayName = `Dr. ${body.name}`
    // Parse JSON arrays if sent as strings
    if (typeof body.availableDays === 'string') {
      try { body.availableDays = JSON.parse(body.availableDays) } catch { body.availableDays = [] }
    }
    if (typeof body.treatmentSpeciality === 'string') {
      try { body.treatmentSpeciality = JSON.parse(body.treatmentSpeciality) } catch { body.treatmentSpeciality = [] }
    }
    if (typeof body.procedureList === 'string') {
      try { body.procedureList = JSON.parse(body.procedureList) } catch { body.procedureList = [] }
    }
    const doctor = await Doctor.create(body)
    const result = doctor.toObject(); delete result.password
    res.status(201).json({ success: true, message: 'Doctor created successfully', data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('branch', 'branchName branchLocation')
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: doctors })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('branch').select('-password')
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
    res.json({ success: true, data: doctor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateDoctor = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    if (req.file) updateData.avatar = req.file.path
    if (updateData.firstName) {
      updateData.name = `${updateData.firstName} ${updateData.lastName || ''}`.trim()
    }
    if (typeof updateData.availableDays === 'string') {
      try { updateData.availableDays = JSON.parse(updateData.availableDays) } catch { updateData.availableDays = [] }
    }
    if (typeof updateData.treatmentSpeciality === 'string') {
      try { updateData.treatmentSpeciality = JSON.parse(updateData.treatmentSpeciality) } catch { updateData.treatmentSpeciality = [] }
    }
    if (typeof updateData.procedureList === 'string') {
      try { updateData.procedureList = JSON.parse(updateData.procedureList) } catch { updateData.procedureList = [] }
    }
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
    res.json({ success: true, message: 'Doctor updated successfully', data: doctor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id)
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
    res.json({ success: true, message: 'Doctor deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
