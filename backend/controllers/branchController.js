const bcrypt = require('bcryptjs')
const Branch = require('../models/Branch')

exports.createBranch = async (req, res) => {
  try {
    const {
      branchType, branchName, branchLocation, description,
      noCabins, contactDetails, email, availability, timings, password,
    } = req.body

    let hashedPassword = ''
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const branch = await Branch.create({
      branchType: branchType || 'general',
      branchName, branchLocation,
      description: description || '',
      noCabins: noCabins || 0,
      contactDetails: contactDetails || '',
      email: email || '',
      availability: availability || {},
      timings: timings || {},
      password: hashedPassword,
    })

    res.status(201).json({ success: true, message: 'Branch created successfully', data: branch })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: branches })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).select('-password')
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
    res.json({ success: true, data: branch })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateBranch = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
    res.json({ success: true, message: 'Branch updated successfully', data: branch })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id)
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
    res.json({ success: true, message: 'Branch deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
