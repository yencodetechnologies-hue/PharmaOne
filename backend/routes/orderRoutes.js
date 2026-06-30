const express = require('express')
const router = express.Router()
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getAllOrders)
  .post(protect, adminOnly, createOrder)

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, adminOnly, updateOrder)
  .delete(protect, adminOnly, deleteOrder)

module.exports = router
