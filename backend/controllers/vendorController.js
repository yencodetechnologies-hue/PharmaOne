const bcrypt  = require('bcryptjs')
const Vendor  = require('../models/Vendor')

// Auto-generate vendor ID
const genVendorId = async () => {
  const count = await Vendor.countDocuments()
  return `VEN-${String(count + 1).padStart(4, '0')}`
}

exports.createVendor = async (req, res) => {
  try {
    const body = { ...req.body }

    // Check unique email
    if (await Vendor.findOne({ email: body.email }))
      return res.status(400).json({ success: false, message: 'Email already exists' })

    // Check unique distributorCode
    if (body.distributorCode && await Vendor.findOne({ distributorCode: body.distributorCode }))
      return res.status(400).json({ success: false, message: 'Distributor code already exists' })

    body.vendorId     = await genVendorId()
    body.password     = await bcrypt.hash(body.password || 'Vendor@123', 10)
    body.isActive     = body.status === 'Active'
    body.outstandingBalance = parseFloat(body.openingBalance) || 0

    // Parse arrays if sent as JSON strings
    ;['productCategories','brandNames','productsSupplied'].forEach(k => {
      if (typeof body[k] === 'string') {
        try { body[k] = JSON.parse(body[k]) } catch { body[k] = [] }
      }
    })

    const vendor = await Vendor.create(body)
    const result = vendor.toObject(); delete result.password
    res.status(201).json({ success: true, message: 'Vendor created successfully', data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: vendors })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-password')
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })
    res.json({ success: true, data: vendor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    if (updateData.status) updateData.isActive = updateData.status === 'Active'

    ;['productCategories','brandNames','productsSupplied'].forEach(k => {
      if (typeof updateData[k] === 'string') {
        try { updateData[k] = JSON.parse(updateData[k]) } catch { updateData[k] = [] }
      }
    })

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password')
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })
    res.json({ success: true, message: 'Vendor updated successfully', data: vendor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id)
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })
    res.json({ success: true, message: 'Vendor deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
