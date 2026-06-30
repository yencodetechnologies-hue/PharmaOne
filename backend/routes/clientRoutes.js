const express = require('express')
const router = express.Router()
const { createClient, getAllClients, getClientById, updateClient, deleteClient } = require('../controllers/clientController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

const uploadFields = upload.fields([
  { name: 'xray', maxCount: 1 },
  { name: 'communicationAudio', maxCount: 1 },
  { name: 'communicationVideo', maxCount: 1 },
])

router.route('/').get(protect, getAllClients).post(protect, adminOnly, uploadFields, createClient)
router.route('/:id').get(protect, getClientById).put(protect, adminOnly, uploadFields, updateClient).delete(protect, adminOnly, deleteClient)

module.exports = router
