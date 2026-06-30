const Transaction = require('../models/Transaction')

exports.createTransaction = async (req, res) => {
  try {
    const { rollType, staffName, amount, transactionDate, paymentMode, referenceNo, notes, branch } = req.body

    const transaction = await Transaction.create({
      rollType, staffName, amount, transactionDate, paymentMode,
      referenceNo: referenceNo || '',
      notes: notes || '',
      branch: branch || undefined,
      createdBy: req.user._id,
    })

    res.status(201).json({ success: true, message: 'Transaction created successfully', data: transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('branch', 'branchName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: transactions })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('branch', 'branchName')
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, data: transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, message: 'Transaction updated successfully', data: transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id)
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
