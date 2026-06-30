const express = require('express')
const router = express.Router()
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getAllTransactions)
  .post(protect, adminOnly, createTransaction)

router.route('/:id')
  .get(protect, getTransactionById)
  .put(protect, adminOnly, updateTransaction)
  .delete(protect, adminOnly, deleteTransaction)

module.exports = router
