// routes/productRoutes.js
const express = require('express')
const multer = require('multer')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const ctrl = require('../controllers/masterController')(require('../models/Product'))

const upload = multer({ dest: 'uploads/products/' }) // or your S3/cloud storage setup
const fields = upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'productBrochure', maxCount: 1 },
  { name: 'productCertificate', maxCount: 1 },
  { name: 'drugLicenseCopy', maxCount: 1 },
])

const router = express.Router()
router.get('/',       protect, ctrl.getAll)
router.get('/:id',    protect, ctrl.getById)
router.post('/',      protect, adminOnly, fields, ctrl.create)
router.put('/:id',    protect, adminOnly, fields, ctrl.update)
router.delete('/:id', protect, adminOnly, ctrl.remove)

module.exports = router