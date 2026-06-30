const express = require('express')
const router = express.Router()
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor } = require('../controllers/vendorController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

router.route('/').get(protect, getAllVendors).post(protect, adminOnly, upload.single('drugLicense'), createVendor)
router.route('/:id').get(protect, getVendorById).put(protect, adminOnly, upload.single('drugLicense'), updateVendor).delete(protect, adminOnly, deleteVendor)

module.exports = router
