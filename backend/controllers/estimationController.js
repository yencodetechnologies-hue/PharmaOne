const Estimation = require('../models/Estimation')

exports.createEstimation = async (req, res) => {
  try {
    const { clientId, clientName, estimationDate, status, totalAmount, notes } = req.body

    let procedures = req.body.procedures
    if (typeof procedures === 'string') {
      try { procedures = JSON.parse(procedures) } catch { procedures = [] }
    }
    if (!Array.isArray(procedures)) procedures = []

    const estimation = await Estimation.create({
      clientId: clientId || undefined,
      clientName: clientName || '',
      estimationDate: estimationDate || undefined,
      status: status || 'Draft',
      procedures,
      totalAmount: totalAmount || 0,
      notes: notes || '',
      createdBy: req.user._id,
    })

    res.status(201).json({ success: true, message: 'Estimation created successfully', data: estimation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.find()
      .populate('clientId', 'name surname')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: estimations })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getEstimationById = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id).populate('clientId', 'name surname')
    if (!estimation) return res.status(404).json({ success: false, message: 'Estimation not found' })
    res.json({ success: true, data: estimation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateEstimation = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.procedures && typeof updateData.procedures === 'string') {
      try { updateData.procedures = JSON.parse(updateData.procedures) } catch { delete updateData.procedures }
    }
    const estimation = await Estimation.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    if (!estimation) return res.status(404).json({ success: false, message: 'Estimation not found' })
    res.json({ success: true, message: 'Estimation updated successfully', data: estimation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findByIdAndDelete(req.params.id)
    if (!estimation) return res.status(404).json({ success: false, message: 'Estimation not found' })
    res.json({ success: true, message: 'Estimation deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
