const express = require('express')
const router = express.Router()
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

// GET all / POST create
router.route('/')
  .get(protect, getAllEmployees)
  .post(protect, adminOnly, upload.single('avatar'), createEmployee)

// GET by id / PUT update / DELETE
router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, adminOnly, upload.single('avatar'), updateEmployee)
  .delete(protect, adminOnly, deleteEmployee)

module.exports = router