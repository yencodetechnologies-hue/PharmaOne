const bcrypt = require('bcryptjs')
const Client = require('../models/Client')

exports.createClient = async (req, res) => {
  try {
    const {
      name, surname, age, gender, referenceNo, email, password,
      patientEnquiryDate, patientAppointmentDate, treatmentDetails,
      procedureMaterial, doctorName, doctorId, branch
    } = req.body

    const existing = await Client.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const xray = req.files?.xray?.[0]?.path || ''
    const communicationAudio = req.files?.communicationAudio?.[0]?.path || ''
    const communicationVideo = req.files?.communicationVideo?.[0]?.path || ''

    const client = await Client.create({
      name, surname, age, gender, referenceNo, email,
      password: hashedPassword, xray, communicationAudio, communicationVideo,
      patientEnquiryDate, patientAppointmentDate, treatmentDetails,
      procedureMaterial, doctorName, doctorId, branch
    })

    res.status(201).json({ success: true, message: 'Client created successfully', data: client })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate('doctorId', 'name').populate('branch', 'name').sort({ createdAt: -1 })
    res.json({ success: true, data: clients })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('doctorId').populate('branch')
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, data: client })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateClient = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }
    if (req.files?.xray?.[0]) updateData.xray = req.files.xray[0].path
    if (req.files?.communicationAudio?.[0]) updateData.communicationAudio = req.files.communicationAudio[0].path
    if (req.files?.communicationVideo?.[0]) updateData.communicationVideo = req.files.communicationVideo[0].path

    const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, message: 'Client updated successfully', data: client })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' })
    res.json({ success: true, message: 'Client deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
