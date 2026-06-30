const express = require('express')
const router = express.Router()
const { multiLogin } = require('../controllers/multiAuthController')

// POST /api/multi-auth/login  { email, password, role }
router.post('/login', multiLogin)

module.exports = router
