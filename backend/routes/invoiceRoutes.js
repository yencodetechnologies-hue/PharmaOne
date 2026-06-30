const express = require('express')
const router = express.Router()
const { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, getInvoiceStats } = require('../controllers/invoiceController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

router.get('/stats', protect, getInvoiceStats)
router.route('/').get(protect, getAllInvoices).post(protect, adminOnly, upload.single('softCopy'), createInvoice)
router.route('/:id').get(protect, getInvoiceById).put(protect, adminOnly, upload.single('softCopy'), updateInvoice).delete(protect, adminOnly, deleteInvoice)

module.exports = router
