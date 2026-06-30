const bcrypt = require('bcryptjs')
const Host = require('../models/Host')

exports.createHost = async (req, res) => {
  try {
    const { name, mobileNo, email, password, gender, dob, address, branch, isActive } = req.body

    const existing = await Host.findOne({ email })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const host = await Host.create({
      name, mobileNo, email,
      password: hashedPassword,
      gender, dob, address, branch,
      isActive: isActive !== undefined ? isActive : true,
    })

    const result = host.toObject()
    delete result.password

    res.status(201).json({ success: true, message: 'Host created successfully', data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await Host.find()
      .populate('branch', 'branchName branchLocation')
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: hosts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getHostById = async (req, res) => {
  try {
    const host = await Host.findById(req.params.id)
      .populate('branch', 'branchName branchLocation')
      .select('-password')
    if (!host) return res.status(404).json({ success: false, message: 'Host not found' })
    res.json({ success: true, data: host })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateHost = async (req, res) => {
  try {
    const updateData = { ...req.body }

    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }

    const host = await Host.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!host) return res.status(404).json({ success: false, message: 'Host not found' })
    res.json({ success: true, message: 'Host updated successfully', data: host })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteHost = async (req, res) => {
  try {
    const host = await Host.findByIdAndDelete(req.params.id)
    if (!host) return res.status(404).json({ success: false, message: 'Host not found' })
    res.json({ success: true, message: 'Host deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
