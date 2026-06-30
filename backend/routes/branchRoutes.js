const express = require('express')
const router = express.Router()
const { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch } = require('../controllers/branchController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.route('/').get(protect, getAllBranches).post(protect, adminOnly, createBranch)
router.route('/:id').get(protect, getBranchById).put(protect, adminOnly, updateBranch).delete(protect, adminOnly, deleteBranch)

module.exports = router
