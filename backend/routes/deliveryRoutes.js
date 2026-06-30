const express = require('express')
const router = express.Router()
const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} = require('../controllers/deliveryController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getAllDeliveries)
  .post(protect, adminOnly, createDelivery)

router.route('/:id')
  .get(protect, getDeliveryById)
  .put(protect, adminOnly, updateDelivery)
  .delete(protect, adminOnly, deleteDelivery)

module.exports = router
