const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' })
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }
}

exports.adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Admin access only' })
  }
}

exports.superadminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Superadmin access only' })
  }
}

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized`,
      })
    }
    next()
  }
}
