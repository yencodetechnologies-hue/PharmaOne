const bcrypt = require('bcryptjs')
const Employee = require('../models/Employee')

// ── Helper: parse skills ──────────────────────────────────────────────────────
function parseSkills(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean)
  if (typeof skills === 'string') return skills.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

// ── POST /employees ───────────────────────────────────────────────────────────
exports.createEmployee = async (req, res) => {
  try {
    const data = { ...req.body }

    // Check unique email
    if (data.email) {
      const existing = await Employee.findOne({ email: data.email })
      if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })
    }

    // Check unique Aadhaar
    if (data.aadharNo) {
      const existing = await Employee.findOne({ aadharNo: data.aadharNo })
      if (existing) return res.status(400).json({ success: false, message: 'Aadhaar number already registered' })
    }

    // Check unique PAN
    if (data.panCardNo) {
      const existing = await Employee.findOne({ panCardNo: data.panCardNo })
      if (existing) return res.status(400).json({ success: false, message: 'PAN number already registered' })
    }

    // Hash password
    if (data.password) data.password = await bcrypt.hash(data.password, 10)

    // Avatar from file upload (cloudinary / multer)
    if (req.file?.path) data.avatar = req.file.path

    // Normalize skills array
    data.skills = parseSkills(data.skills)

    // Remove empty branch to avoid ObjectId cast error
    if (!data.branch) delete data.branch

    // Set createdBy from auth middleware if available
    if (req.user?.name) data.createdBy = req.user.name

    // Coerce numeric fields
    if (data.basicSalary)  data.basicSalary  = Number(data.basicSalary)  || 0
    if (data.allowance)    data.allowance    = Number(data.allowance)    || 0
    if (data.incentive)    data.incentive    = Number(data.incentive)    || 0
    if (data.experience)   data.experience   = Number(data.experience)   || 0

    // Coerce boolean fields (body parsed as strings from form-data)
    const boolFields = [
      'pfApplicable','esiApplicable','sameAsPresent','isActive',
      'docAadhaarUploaded','docPanUploaded','docResumeUploaded',
      'docQualificationUploaded','docExperienceUploaded','docPhotoUploaded',
      'sendCredEmail','sendCredWhatsapp','forcePasswordChange',
      'overtimeEligible','gpsAttendance','mobilePunchIn',
    ]
    boolFields.forEach(k => {
      if (data[k] !== undefined) data[k] = data[k] === true || data[k] === 'true'
    })

    const employee = await Employee.create(data)
    res.status(201).json({ success: true, message: 'Employee created successfully', data: employee })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field'
      return res.status(400).json({ success: false, message: `Duplicate value for ${field}` })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── GET /employees ────────────────────────────────────────────────────────────
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('branch', 'branchName branchCode')
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: employees })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── GET /employees/:id ────────────────────────────────────────────────────────
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('branch', 'branchName branchCode')
      .select('-password')
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })
    res.json({ success: true, data: employee })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── PUT /employees/:id ────────────────────────────────────────────────────────
exports.updateEmployee = async (req, res) => {
  try {
    const updateData = { ...req.body }

    // Hash new password only if provided
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }

    // Avatar
    if (req.file?.path) updateData.avatar = req.file.path

    // Skills
    updateData.skills = parseSkills(updateData.skills)

    // Branch
    if (!updateData.branch) delete updateData.branch

    // updatedBy
    if (req.user?.name) updateData.updatedBy = req.user.name

    // Numeric
    if (updateData.basicSalary !== undefined) updateData.basicSalary = Number(updateData.basicSalary) || 0
    if (updateData.allowance   !== undefined) updateData.allowance   = Number(updateData.allowance)   || 0
    if (updateData.incentive   !== undefined) updateData.incentive   = Number(updateData.incentive)   || 0
    if (updateData.experience  !== undefined) updateData.experience  = Number(updateData.experience)  || 0

    // Booleans
    const boolFields = [
      'pfApplicable','esiApplicable','sameAsPresent','isActive',
      'docAadhaarUploaded','docPanUploaded','docResumeUploaded',
      'docQualificationUploaded','docExperienceUploaded','docPhotoUploaded',
      'sendCredEmail','sendCredWhatsapp','forcePasswordChange',
      'overtimeEligible','gpsAttendance','mobilePunchIn',
    ]
    boolFields.forEach(k => {
      if (updateData[k] !== undefined) updateData[k] = updateData[k] === true || updateData[k] === 'true'
    })

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })
    res.json({ success: true, message: 'Employee updated successfully', data: employee })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field'
      return res.status(400).json({ success: false, message: `Duplicate value for ${field}` })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── DELETE /employees/:id ─────────────────────────────────────────────────────
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id)
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' })
    res.json({ success: true, message: 'Employee deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}