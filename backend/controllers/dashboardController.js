const Client = require('../models/Client')
const Doctor = require('../models/Doctor')
const Employee = require('../models/Employee')
const Vendor = require('../models/Vendor')
const Invoice = require('../models/Invoice')
const Expense = require('../models/Expense')
const Branch = require('../models/Branch')

exports.getDashboardStats = async (req, res) => {
  try {
    const [clients, doctors, employees, vendors, invoices, expenses, branches] = await Promise.all([
      Client.countDocuments(),
      Doctor.countDocuments(),
      Employee.countDocuments(),
      Vendor.countDocuments(),
      Invoice.countDocuments(),
      Expense.countDocuments(),
      Branch.countDocuments(),
    ])

    const totalRevenue = await Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }])
    const totalExpenses = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])

    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5).populate('client', 'name surname').select('invoiceNo totalAmount paidAmount status createdAt')
    const recentClients = await Client.find().sort({ createdAt: -1 }).limit(5).select('name surname email gender createdAt')

    const monthlyRevenue = await Invoice.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          total: { $sum: '$paidAmount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ])

    res.json({
      success: true,
      data: {
        counts: { clients, doctors, employees, vendors, invoices, expenses, branches },
        financials: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalExpenses: totalExpenses[0]?.total || 0,
          netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        },
        recentInvoices,
        recentClients,
        monthlyRevenue,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
