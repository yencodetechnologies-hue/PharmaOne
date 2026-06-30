const Invoice = require('../models/Invoice')

const generateInvoiceNo = async () => {
  const count = await Invoice.countDocuments()
  return `INV-${String(count + 1).padStart(5, '0')}`
}

exports.createInvoice = async (req, res) => {
  try {
    const { companyType, client, clientName, totalAmount, paidAmount, paymentMode, transaction, comments, dueDate, branch } = req.body
    const invoiceNo = await generateInvoiceNo()
    const softCopy = req.file?.path || ''
    const invoice = await Invoice.create({ invoiceNo, companyType, client, clientName, totalAmount, paidAmount, paymentMode, transaction, comments, softCopy, dueDate, branch, createdBy: req.user._id })
    res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client', 'name surname').populate('branch', 'name').populate('createdBy', 'name').sort({ createdAt: -1 })
    res.json({ success: true, data: invoices })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client').populate('branch').populate('createdBy', 'name')
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, data: invoice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateInvoice = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (req.file) updateData.softCopy = req.file.path
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, message: 'Invoice updated successfully', data: invoice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id)
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, message: 'Invoice deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getInvoiceStats = async (req, res) => {
  try {
    const total = await Invoice.countDocuments()
    const paid = await Invoice.countDocuments({ status: 'Paid' })
    const pending = await Invoice.countDocuments({ status: 'Pending' })
    const partial = await Invoice.countDocuments({ status: 'Partial' })
    const totalRevenue = await Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }])
    res.json({ success: true, data: { total, paid, pending, partial, totalRevenue: totalRevenue[0]?.total || 0 } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
