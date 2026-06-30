const Order = require('../models/Order')

exports.createOrder = async (req, res) => {
  try {
    const { vendorId, vendorName, orderDate, status, notes } = req.body

    // items may arrive as JSON string from frontend
    let items = req.body.items
    if (typeof items === 'string') {
      try { items = JSON.parse(items) } catch { items = [] }
    }
    if (!Array.isArray(items)) items = []

    const order = await Order.create({
      vendorId: vendorId || undefined,
      vendorName: vendorName || '',
      orderDate,
      status: status || 'Pending',
      items,
      notes: notes || '',
      createdBy: req.user._id,
    })

    res.status(201).json({ success: true, message: 'Order created successfully', data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('vendorId', 'distributorName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vendorId', 'distributorName')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateOrder = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (updateData.items && typeof updateData.items === 'string') {
      try { updateData.items = JSON.parse(updateData.items) } catch { delete updateData.items }
    }
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, message: 'Order updated successfully', data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
