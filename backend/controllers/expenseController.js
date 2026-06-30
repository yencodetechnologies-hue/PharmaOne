const Expense = require('../models/Expense')

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, paymentMode, branch } = req.body
    const receipt = req.file?.path || ''
    const expense = await Expense.create({ title, amount, category, description, date, paymentMode, receipt, branch, createdBy: req.user._id })
    res.status(201).json({ success: true, message: 'Expense created successfully', data: expense })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('branch', 'name').populate('createdBy', 'name').sort({ createdAt: -1 })
    res.json({ success: true, data: expenses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('branch').populate('createdBy', 'name')
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' })
    res.json({ success: true, data: expense })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateExpense = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (req.file) updateData.receipt = req.file.path
    const expense = await Expense.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' })
    res.json({ success: true, message: 'Expense updated successfully', data: expense })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' })
    res.json({ success: true, message: 'Expense deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getExpenseStats = async (req, res) => {
  try {
    const totalExpense = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    const byCategory = await Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' } } }])
    res.json({ success: true, data: { totalExpense: totalExpense[0]?.total || 0, byCategory } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
