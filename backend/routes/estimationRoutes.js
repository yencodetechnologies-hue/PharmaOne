const express = require('express')
const router = express.Router()
const {
  createEstimation,
  getAllEstimations,
  getEstimationById,
  updateEstimation,
  deleteEstimation,
} = require('../controllers/estimationController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getAllEstimations)
  .post(protect, adminOnly, createEstimation)

router.route('/:id')
  .get(protect, getEstimationById)
  .put(protect, adminOnly, updateEstimation)
  .delete(protect, adminOnly, deleteEstimation)

module.exports = router
