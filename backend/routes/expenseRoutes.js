const express = require('express')
const router = express.Router()
const { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseStats } = require('../controllers/expenseController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

router.get('/stats', protect, getExpenseStats)
router.route('/').get(protect, getAllExpenses).post(protect, adminOnly, upload.single('receipt'), createExpense)
router.route('/:id').get(protect, getExpenseById).put(protect, adminOnly, upload.single('receipt'), updateExpense).delete(protect, adminOnly, deleteExpense)

module.exports = router
