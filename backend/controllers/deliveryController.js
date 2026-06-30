const Delivery = require('../models/Delivery')

exports.createDelivery = async (req, res) => {
  try {
    const {
      salutation, patientName, clientId, phone, alternativePhone,
      guardianRelation, guardianName, address, pincode, city, state,
      sourceOfReference, deliveryDate, deliveryStatus, notes, branch,
    } = req.body

    const delivery = await Delivery.create({
      salutation: salutation || 'Mr',
      patientName,
      clientId: clientId || undefined,
      phone,
      alternativePhone: alternativePhone || '',
      guardianRelation: guardianRelation || 'Father',
      guardianName: guardianName || '',
      address,
      pincode: pincode || '',
      city: city || '',
      state: state || '',
      sourceOfReference: sourceOfReference || 'Walkin',
      deliveryDate: deliveryDate || undefined,
      deliveryStatus: deliveryStatus || 'Pending',
      notes: notes || '',
      branch: branch || undefined,
      createdBy: req.user._id,
    })

    res.status(201).json({ success: true, message: 'Delivery created successfully', data: delivery })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('clientId', 'name surname')
      .populate('branch', 'branchName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: deliveries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('clientId', 'name surname')
      .populate('branch', 'branchName')
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, data: delivery })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, message: 'Delivery updated successfully', data: delivery })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id)
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, message: 'Delivery deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
