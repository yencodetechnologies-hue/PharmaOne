const express = require('express')
const router = express.Router()
const { createAuditor, getAllAuditors, getAuditorById, updateAuditor, deleteAuditor } = require('../controllers/auditorController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/').get(protect, getAllAuditors).post(protect, adminOnly, createAuditor)
router.route('/:id').get(protect, getAuditorById).put(protect, adminOnly, updateAuditor).delete(protect, adminOnly, deleteAuditor)

module.exports = router
