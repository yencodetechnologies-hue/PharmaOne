const express = require('express')
const router  = express.Router()
const {
  getBranchStaff, createBranchStaff, updateBranchStaff, deleteBranchStaff,
  getBranchClients, getBranchClientById, createBranchClient, updateBranchClient, deleteBranchClient,
} = require('../controllers/branchScopedController')

// These routes are open to any authenticated portal user (branch/staff)
// Add protect middleware as needed; kept minimal for flexibility

// ── Staff ──────────────────────────────────────────────────────
router.get('/staff',          getBranchStaff)
router.post('/staff',         createBranchStaff)
router.put('/staff/:id',      updateBranchStaff)
router.delete('/staff/:id',   deleteBranchStaff)

// ── Clients (Patients) ─────────────────────────────────────────
router.get('/clients',            getBranchClients)
router.get('/clients/:id',        getBranchClientById)
router.post('/clients',           createBranchClient)
router.put('/clients/:id',        updateBranchClient)
router.delete('/clients/:id',     deleteBranchClient)

module.exports = router
