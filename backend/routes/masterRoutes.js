const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const Category    = require('../models/Category')
const Brand       = require('../models/Brand')
const PaymentMode = require('../models/PaymentMode')
const Product     = require('../models/Product')
const Treatment   = require('../models/Treatment')

const makeCtrl = require('../controllers/masterController')

function makeRouter(Model) {
  const router = express.Router()
  const ctrl = makeCtrl(Model)
  router.get('/',       protect, ctrl.getAll)
  router.get('/:id',    protect, ctrl.getById)
  router.post('/',      protect, adminOnly, ctrl.create)
  router.put('/:id',    protect, adminOnly, ctrl.update)
  router.delete('/:id', protect, adminOnly, ctrl.remove)
  return router
}

module.exports = {
  categoryRouter:    makeRouter(Category),
  brandRouter:       makeRouter(Brand),
  paymentModeRouter: makeRouter(PaymentMode),
  productRouter:     makeRouter(Product),
  treatmentRouter:   makeRouter(Treatment),
}
