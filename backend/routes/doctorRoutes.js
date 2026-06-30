const express = require('express')
const router = express.Router()
const { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor } = require('../controllers/doctorController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

router.route('/').get(protect, getAllDoctors).post(protect, adminOnly, upload.single('avatar'), createDoctor)
router.route('/:id').get(protect, getDoctorById).put(protect, adminOnly, upload.single('avatar'), updateDoctor).delete(protect, adminOnly, deleteDoctor)

module.exports = router
