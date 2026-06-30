/**
 * Generic CRUD factory for simple master tables
 * Usage: const ctrl = require('./masterController')(Model)
 */
module.exports = (Model) => ({
  getAll: async (req, res) => {
    try {
      const data = await Model.find().sort({ createdAt: -1 })
      res.json({ success: true, data })
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  },
  getById: async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id)
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, data: doc })
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  },
  create: async (req, res) => {
    try {
      const doc = await Model.create(req.body)
      res.status(201).json({ success: true, message: 'Created successfully', data: doc })
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  },
  update: async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Updated successfully', data: doc })
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  },
  remove: async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id)
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Deleted successfully' })
    } catch (e) { res.status(500).json({ success: false, message: e.message }) }
  },
})
