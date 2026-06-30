const express = require('express')
const router = express.Router()
const {
  createHost,
  getAllHosts,
  getHostById,
  updateHost,
  deleteHost,
} = require('../controllers/hostController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getAllHosts)
  .post(protect, adminOnly, createHost)

router.route('/:id')
  .get(protect, getHostById)
  .put(protect, adminOnly, updateHost)
  .delete(protect, adminOnly, deleteHost)

module.exports = router
