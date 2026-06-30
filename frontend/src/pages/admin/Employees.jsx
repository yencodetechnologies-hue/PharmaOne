import { useState, useMemo } from 'react'
import { useEmployees, useSaveEmployee, useDeleteEmployee, useBranches } from '../../hooks/useAdminMutations'

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const DEPARTMENTS = [
  'Reception','Pharmacy','Nursing','Accounts','ER','ICU','OPD','Store','Admin',
  'Laboratory','Radiology','Physiotherapy','Dental','Dietetics','Other',
]
const DESIGNATIONS = [
  'Head Receptionist','Senior Pharmacist','Staff Nurse','Accountant',
  'Ward Boy','Store Keeper','Lab Technician','Radiologist','Physiotherapist',
  'Dental Assistant','Dietitian','Supervisor','Manager','Other',
]
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const RELATIONSHIPS = ['Spouse','Parent','Sibling','Child','Friend','Other']
const SHIFT_TIMINGS = ['Morning','Evening','Night','Rotational']

const TABS = [
  { id:0, icon:'fa-id-card',      label:'Basic Info',       sub:'Identity & photo'     },
  { id:1, icon:'fa-briefcase',    label:'Employment',       sub:'Role & department'    },
  { id:2, icon:'fa-file-alt',     label:'Documents',        sub:'ID & certificates'    },
  { id:3, icon:'fa-home',         label:'Address',          sub:'Present & permanent'  },
  { id:4, icon:'fa-graduation-cap',label:'Professional',    sub:'Skills & license'     },
  { id:5, icon:'fa-rupee-sign',   label:'Salary',           sub:'Pay structure'        },
  { id:6, icon:'fa-university',   label:'Bank Details',     sub:'Account & UPI'        },
  { id:7, icon:'fa-ambulance',    label:'Emergency',        sub:'Emergency contact'    },
  { id:8, icon:'fa-user-lock',    label:'Login & Access',   sub:'Portal credentials'  },
  { id:9, icon:'fa-hand-paper',   label:'Attendance',       sub:'Biometric & shift'   },
  { id:10,icon:'fa-cog',          label:'System & Remarks', sub:'Audit & notes'       },
]
const REVIEW_STEP = { id:11, label:'Review', sub:'Confirm & save' }

const DOC_TYPES = [
  { k:'docAadhaarUploaded',      label:'Aadhaar Copy',               icon:'fa-id-card',       hint:'PDF / JPG · Max 2MB'  },
  { k:'docPanUploaded',          label:'PAN Copy',                   icon:'fa-file-invoice',  hint:'PDF / JPG · Max 2MB'  },
  { k:'docResumeUploaded',       label:'Resume / CV',                icon:'fa-file-alt',      hint:'PDF · Max 5MB'        },
  { k:'docQualificationUploaded',label:'Qualification Certificates', icon:'fa-graduation-cap',hint:'PDF / JPG · Max 10MB' },
  { k:'docExperienceUploaded',   label:'Experience Certificates',    icon:'fa-briefcase',     hint:'PDF / JPG · Max 10MB' },
  { k:'docPhotoUploaded',        label:'Passport Photo',             icon:'fa-user',          hint:'JPG · Max 1MB'        },
]

const initForm = {
  employeeId:'', employeeCode:'', firstName:'', lastName:'', name:'', gender:'Male',
  dob:'', bloodGroup:'', maritalStatus:'', phone:'', alternateMobile:'', email:'',
  branch:'', department:'', designation:'', employeeType:'Full Time',
  joiningDate:'', probationEndDate:'', reportingManager:'', shift:'', status:'Active',
  aadharNo:'', panCardNo:'', drivingLicense:'', passportNo:'', idCardNo:'',
  docAadhaarUploaded:false, docPanUploaded:false, docResumeUploaded:false,
  docQualificationUploaded:false, docExperienceUploaded:false, docPhotoUploaded:false,
  presentDoorNo:'', presentStreet:'', presentArea:'', presentCity:'', presentState:'', presentPincode:'',
  permanentDoorNo:'', permanentStreet:'', permanentArea:'', permanentCity:'', permanentState:'', permanentPincode:'',
  sameAsPresent:false,
  qualification:'', experience:'', licenseNo:'', registrationNo:'', specialization:'', skills:[],
  basicSalary:'', allowance:'', incentive:'', pfApplicable:true, esiApplicable:true,
  salaryType:'Monthly', salaryEffectiveDate:'',
  bankName:'', bankAccountHolder:'', bankAccountNo:'', bankIfscCode:'', bankBranchName:'', upiId:'',
  emergencyContactName:'', emergencyRelationship:'', emergencyPhone:'', emergencyAltPhone:'',
  username:'', password:'', role:'', loginStatus:'Active', lastLogin:'',
  sendCredEmail:true, sendCredWhatsapp:false, forcePasswordChange:true,
  biometricId:'', shiftTiming:'', weeklyOff:'', availableDays:[],
  overtimeEligible:false, gpsAttendance:false, mobilePunchIn:true,
  remarks:'', isActive:true,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return ''
  const today = new Date(), birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : ''
}

const LOGO_COLORS = ['', 'green', 'purple', 'orange', '']
const getLogoColor = i => LOGO_COLORS[i % LOGO_COLORS.length] || ''
const getInitials = name =>
  (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0,2).toUpperCase() || 'ST'

// ── Main Component ────────────────────────────────────────────────────────────

export default function Employees() {
  const [search, setSearch]           = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterDept, setFilterDept]   = useState('')
  const [filterType, setFilterType]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDrawer, setShowDrawer]   = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(initForm)
  const [deleteId, setDeleteId]       = useState(null)
  const [tab, setTab]                 = useState(0)
  const [skillInput, setSkillInput]   = useState('')

  const { data = [], isLoading } = useEmployees()
  const { data: branches = [] }  = useBranches()
  const saveMut   = useSaveEmployee()
  const deleteMut = useDeleteEmployee()

  const age = useMemo(() => calcAge(form.dob), [form.dob])

  const F   = k => ({ value: form[k] ?? '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = d => set('availableDays', (form.availableDays||[]).includes(d)
    ? (form.availableDays||[]).filter(x => x !== d)
    : [...(form.availableDays||[]), d])

  // Skills chip-select helpers
  const addSkill = () => {
    const v = skillInput.trim()
    if (!v) return
    if (!(form.skills||[]).includes(v)) set('skills', [...(form.skills||[]), v])
    setSkillInput('')
  }
  const removeSkill = s => set('skills', (form.skills||[]).filter(x => x !== s))
  const onSkillKeyDown = e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill() }
  }

  const openCreate = () => {
    setEditing(null)
    const seq = String(data.length + 1).padStart(4, '0')
    setForm({ ...initForm, employeeId: `EMP-${seq}` })
    setSkillInput('')
    setTab(0); setShowDrawer(true)
  }
  const openEdit = e => {
    setEditing(e._id)
    setForm({
      ...initForm, ...e,
      dob:               e.dob?.slice(0,10) || '',
      joiningDate:       e.joiningDate?.slice(0,10) || '',
      probationEndDate:  e.probationEndDate?.slice(0,10) || '',
      salaryEffectiveDate: e.salaryEffectiveDate?.slice(0,10) || '',
      branch:            e.branch?._id || e.branch || '',
      skills:            Array.isArray(e.skills) ? e.skills : (e.skills ? String(e.skills).split(',').map(s => s.trim()).filter(Boolean) : []),
      availableDays:     Array.isArray(e.availableDays) ? e.availableDays : [],
      password: '',
    })
    setSkillInput('')
    setTab(0); setShowDrawer(true)
  }

  const handleSubmit = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim() || form.name
    saveMut.mutate(
      { id: editing, data: { ...form, name: fullName } },
      { onSuccess: () => { setShowDrawer(false); setEditing(null) } }
    )
  }

  // Stats
  const totalActive   = data.filter(d => d.status === 'Active' || d.isActive).length
  const totalFullTime = data.filter(d => d.employeeType === 'Full Time').length
  const totalContract = data.filter(d => d.employeeType === 'Contract').length
  const totalInactive = data.filter(d => d.status === 'Inactive' || (!d.isActive && d.status !== 'Active')).length

  // Filters
  const filtered = data.filter(e => {
    const q = search.toLowerCase()
    const matchQ      = !q || `${e.name} ${e.firstName} ${e.email} ${e.designation} ${e.employeeId} ${e.phone}`.toLowerCase().includes(q)
    const matchBranch = !filterBranch || (e.branch?._id || e.branch) === filterBranch
    const matchDept   = !filterDept   || e.department === filterDept
    const matchType   = !filterType   || e.employeeType === filterType
    const matchStatus = !filterStatus || (e.status || 'Active') === filterStatus
    return matchQ && matchBranch && matchDept && matchType && matchStatus
  })

  const uniqueDepts = [...new Set(data.map(e => e.department).filter(Boolean))]

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="topbar-breadcrumb" style={{ marginBottom: 4 }}>
            <a href="/dashboard">Dashboard</a>
            <span className="sep"> &rsaquo; </span>
            <a>Masters</a>
            <span className="sep"> &rsaquo; </span>
            <span className="current">Staff Master</span>
          </div>
          <h2>Staff Master</h2>
          <p>Manage all staff members — roles, attendance, salary, and access rights</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><i className="fas fa-download" /> Export</button>
          <button className="btn btn-outline"><i className="fas fa-print" /> Print</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus" /> Add Staff</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-users" /></div>
          <div><div className="stat-value">{data.length}</div><div className="stat-label">Total Staff</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-check-circle" /></div>
          <div><div className="stat-value">{totalActive}</div><div className="stat-label">Active</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-briefcase" /></div>
          <div><div className="stat-value">{totalFullTime}</div><div className="stat-label">Full Time</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><i className="fas fa-file-contract" /></div>
          <div><div className="stat-value">{totalContract}</div><div className="stat-label">Contract</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><i className="fas fa-ban" /></div>
          <div><div className="stat-value">{totalInactive}</div><div className="stat-label">Inactive</div></div>
        </div>
      </div>

      {/* ── List Panel ── */}
      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si"><i className="fas fa-search" /></span>
            <input placeholder="Search by name, ID, mobile…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.branchCode} – {b.branchName}</option>)}
          </select>
          <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {uniqueDepts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Full Time</option><option>Part Time</option><option>Contract</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option>
          </select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong></div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="loading"><div className="spinner" /> Loading staff...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fas fa-users" /></div>
              <h3>No staff found</h3>
              <p>Click "Add Staff" to register your first staff member</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Staff Member</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Mobile</th>
                  <th>Branch</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Shift</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const fullName = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || '?'
                  const isActive = e.status === 'Active' || e.isActive
                  return (
                    <tr key={e._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          <div className={`entity-logo ${getLogoColor(i)}`}>
                            {getInitials(fullName)}
                          </div>
                          <div>
                            <strong>{fullName}</strong>
                            <small>
                              {e.gender || ''}{e.gender && calcAge(e.dob) ? ' · ' : ''}{calcAge(e.dob) ? `${calcAge(e.dob)} yrs` : ''}
                            </small>
                            <div style={{ fontSize:10, background:'var(--primary-light)', color:'var(--primary)', padding:'1px 6px', borderRadius:4, fontWeight:700, display:'inline-block', marginTop:2 }}>
                              {e.employeeId || `EMP-${e._id?.slice(-4).toUpperCase()}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:12 }}>{e.designation || '—'}</td>
                      <td>
                        {e.department
                          ? <span className="badge badge-blue">{e.department}</span>
                          : <span style={{ color:'var(--text-light)' }}>—</span>}
                      </td>
                      <td style={{ fontSize:12 }}>{e.phone || '—'}</td>
                      <td style={{ fontSize:12 }}>
                        {e.branch?.branchCode ? `${e.branch.branchCode} – ${e.branch.branchName}` : (e.branch?.branchName || '—')}
                      </td>
                      <td>
                        <span className={`badge ${e.employeeType === 'Full Time' ? 'badge-blue' : 'badge-orange'}`}>
                          {e.employeeType || 'Full Time'}
                        </span>
                      </td>
                      <td style={{ fontWeight:700, color:'var(--text-dark)', fontSize:13 }}>
                        {e.basicSalary ? `₹${Number(e.basicSalary).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ fontSize:12 }}>{e.shift || '—'}</td>
                      <td style={{ fontSize:12 }}>
                        {e.joiningDate ? new Date(e.joiningDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                          {e.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="Edit" onClick={() => openEdit(e)}><i className="fas fa-edit" /></button>
                          <button className="act-btn danger" title="Delete" onClick={() => setDeleteId(e._id)}><i className="fas fa-trash" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-pagination">
          <div className="pagination-info">Showing 1–{filtered.length} of {filtered.length} staff</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'var(--text-light)' }}>Rows:</span>
            <select className="filter-select" style={{ padding:'5px 10px', fontSize:12 }}>
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
          <div className="pagination-btns">
            <button className="pg-btn"><i className="fas fa-chevron-left" /></button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn"><i className="fas fa-chevron-right" /></button>
          </div>
        </div>
      </div>

      {/* ── DRAWER ── */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDrawer(false) }}>
          <div className="drawer drawer-wide">

            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="dh-icon"><i className="fas fa-users" /></div>
              <div style={{ flex:1 }}>
                <h3>{editing ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                <p>Complete all {TABS.length} sections to {editing ? 'update the' : 'register a new'} staff member</p>
              </div>
              <span className="dh-badge">{tab === REVIEW_STEP.id ? 'Review' : `Step ${tab + 1} / ${TABS.length}`}</span>
              <button className="drawer-close" onClick={() => setShowDrawer(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body-wrap">

              {/* Step Sidebar */}
              <div className="drawer-steps">
                {TABS.map(t => (
                  <div
                    key={t.id}
                    className={`step-nav-item${tab === t.id ? ' active' : ''}${tab > t.id ? ' done' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <div className="step-num">
                      {tab > t.id ? <i className="fas fa-check" /> : t.id + 1}
                    </div>
                    <div className="step-nav-text">
                      <strong>{t.label}</strong>
                      <span>{t.sub}</span>
                    </div>
                  </div>
                ))}
                <div
                  className={`step-nav-item review-step${tab === REVIEW_STEP.id ? ' active' : ''}`}
                  onClick={() => setTab(REVIEW_STEP.id)}
                >
                  <div className="step-num" style={{ background: tab === REVIEW_STEP.id ? 'var(--primary)' : 'var(--accent-light)', color: tab === REVIEW_STEP.id ? '#fff' : 'var(--accent)' }}>
                    <i className="fas fa-check" />
                  </div>
                  <div className="step-nav-text">
                    <strong>{REVIEW_STEP.label}</strong>
                    <span>{REVIEW_STEP.sub}</span>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="drawer-content">

                {/* ── 1. Basic Info ── */}
                {tab === 0 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-id-card" /></div>
                      <div><h4>Basic Information</h4><p>Staff member's identity, personal details</p></div>
                    </div>

                    <div style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:18 }}>
                      <div style={{
                        width:80, height:80, borderRadius:18, flexShrink:0,
                        background:'linear-gradient(135deg,var(--primary),#3498DB)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:28, fontWeight:800, color:'#fff', fontFamily:'var(--font-head)',
                      }}>
                        {getInitials(`${form.firstName} ${form.lastName}`)}
                      </div>
                      <div>
                        <h5 style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Profile Photo</h5>
                        <p style={{ fontSize:12, color:'var(--text-light)', marginBottom:8 }}>
                          Clear passport-size photo · JPG / PNG · Max 2MB · 300×300px
                        </p>
                        <button className="btn btn-outline" style={{ fontSize:12, padding:'6px 14px' }}>
                          <i className="fas fa-upload" /> Choose Photo
                        </button>
                      </div>
                    </div>

                    <div className="form-grid form-grid-3">
                      <div className="form-group">
                        <label>Employee ID <span className="req">*</span></label>
                        <input {...F('employeeId')} readOnly placeholder="Auto-generated" />
                      </div>
                      <div className="form-group">
                        <label>Employee Code</label>
                        <input {...F('employeeCode')} placeholder="e.g. CHN-EMP-043" />
                      </div>
                      <div className="form-group">
                        <label>Status <span className="req">*</span></label>
                        <select {...F('status')}>
                          <option>Active</option><option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>First Name <span className="req">*</span></label>
                        <input
                          value={form.firstName}
                          onChange={e => { const v = e.target.value; setForm(f => ({ ...f, firstName:v, name:`${v} ${f.lastName}`.trim() })) }}
                          placeholder="First name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name <span className="req">*</span></label>
                        <input
                          value={form.lastName}
                          onChange={e => { const v = e.target.value; setForm(f => ({ ...f, lastName:v, name:`${f.firstName} ${v}`.trim() })) }}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Gender <span className="req">*</span></label>
                        <select {...F('gender')}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Date of Birth <span className="req">*</span></label>
                        <input {...F('dob')} type="date" />
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Age</label>
                        <input value={age ? `${age} years` : ''} readOnly placeholder="Auto calculated" />
                      </div>
                      <div className="form-group">
                        <label>Blood Group</label>
                        <select {...F('bloodGroup')}>
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Marital Status</label>
                        <select {...F('maritalStatus')}>
                          <option value="">Select</option>
                          <option>Single</option><option>Married</option>
                          <option>Divorced</option><option>Widowed</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Mobile Number <span className="req">*</span></label>
                        <div className="input-prefix">
                          <span className="pre-tag">+91</span>
                          <input {...F('phone')} placeholder="9876543210" />
                        </div>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Alternate Mobile</label>
                        <div className="input-prefix">
                          <span className="pre-tag">+91</span>
                          <input {...F('alternateMobile')} placeholder="Optional" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input {...F('email')} type="email" placeholder="staff@pharmaone.in" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── 2. Employment ── */}
                {tab === 1 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-briefcase" /></div>
                      <div><h4>Employment Details</h4><p>Job role, department, and employment information</p></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Branch</label>
                        <select value={form.branch} onChange={e => set('branch', e.target.value)}>
                          <option value="">Select Branch</option>
                          {branches.map(b => <option key={b._id} value={b._id}>{b.branchCode} – {b.branchName}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Department <span className="req">*</span></label>
                        <select {...F('department')}>
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Designation</label>
                        <select {...F('designation')}>
                          <option value="">Select Designation</option>
                          {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Employee Type <span className="req">*</span></label>
                        <select {...F('employeeType')}>
                          <option>Full Time</option><option>Part Time</option><option>Contract</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Joining Date <span className="req">*</span></label>
                        <input {...F('joiningDate')} type="date" />
                      </div>
                      <div className="form-group">
                        <label>Probation End Date</label>
                        <input {...F('probationEndDate')} type="date" />
                      </div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Shift</label>
                        <select {...F('shift')}>
                          <option value="">Select Shift</option>
                          <option>Morning</option><option>Evening</option>
                          <option>Night</option><option>Rotational</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Reporting Manager</label>
                        <input {...F('reportingManager')} placeholder="Manager name" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── 3. Documents ── */}
                {tab === 2 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-file-alt" /></div>
                      <div><h4>Identity Documents</h4><p>Government IDs and certificate uploads</p></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Aadhaar Number</label><input {...F('aadharNo')} placeholder="XXXX XXXX XXXX" /></div>
                      <div className="form-group"><label>PAN Number</label><input {...F('panCardNo')} placeholder="ABCDE1234F" /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Driving License Number</label><input {...F('drivingLicense')} placeholder="TN-XXXXXXXXXXXX" /></div>
                      <div className="form-group"><label>Passport Number</label><input {...F('passportNo')} placeholder="A1234567" /></div>
                    </div>
                    <div className="form-group">
                      <label>Employee ID Card Number</label>
                      <input {...F('idCardNo')} placeholder="Auto-generated on ID card print" />
                    </div>

                    <div className="info-box">
                      <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                      <p>Upload clear, legible copies. Aadhaar and PAN copies are mandatory for payroll processing.</p>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
                      {DOC_TYPES.map(d => (
                        <div
                          key={d.k}
                          onClick={() => set(d.k, !form[d.k])}
                          style={{
                            cursor:'pointer', textAlign:'center', padding:'20px 16px',
                            borderRadius:10, transition:'all 0.15s',
                            border: form[d.k] ? '2px dashed var(--primary)' : '1.5px dashed var(--border)',
                            background: form[d.k] ? 'var(--primary-light)' : '#fff',
                          }}
                        >
                          <i
                            className={`fas ${d.icon}`}
                            style={{ fontSize:22, color: form[d.k] ? 'var(--primary)' : 'var(--text-light)', display:'block', marginBottom:10 }}
                          />
                          <div style={{ fontSize:13, fontWeight:700, color: form[d.k] ? 'var(--primary)' : 'var(--text-dark)' }}>
                            {d.label}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-light)', marginTop:3 }}>{d.hint}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── 4. Address ── */}
                {tab === 3 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-home" /></div>
                      <div><h4>Address Details</h4><p>Present and permanent residential addresses</p></div>
                    </div>

                    <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', color:'var(--text-light)', marginBottom:10 }}>
                      🏠 Present Address
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Door No / Flat No <span className="req">*</span></label><input {...F('presentDoorNo')} placeholder="e.g. 10/A" /></div>
                      <div className="form-group"><label>Street <span className="req">*</span></label><input {...F('presentStreet')} placeholder="Street name" /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Area / Locality</label><input {...F('presentArea')} placeholder="Area name" /></div>
                      <div className="form-group"><label>City <span className="req">*</span></label><input {...F('presentCity')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>State <span className="req">*</span></label><input {...F('presentState')} /></div>
                      <div className="form-group"><label>Pincode <span className="req">*</span></label><input {...F('presentPincode')} maxLength={6} /></div>
                    </div>

                    <label className="facility-check" style={{ marginBottom:16, cursor:'pointer' }}>
                      <span><i className="fas fa-copy fci" /> Permanent address same as present address</span>
                      <input
                        type="checkbox"
                        checked={!!form.sameAsPresent}
                        onChange={() => {
                          const c = !form.sameAsPresent
                          setForm(f => ({ ...f, sameAsPresent:c, ...(c ? {
                            permanentDoorNo:f.presentDoorNo, permanentStreet:f.presentStreet,
                            permanentArea:f.presentArea, permanentCity:f.presentCity,
                            permanentState:f.presentState, permanentPincode:f.presentPincode,
                          } : {}) }))
                        }}
                      />
                    </label>

                    <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', color:'var(--text-light)', marginBottom:10 }}>
                      📌 Permanent Address
                    </div>
                    <div style={{ opacity: form.sameAsPresent ? 0.45 : 1, pointerEvents: form.sameAsPresent ? 'none' : 'auto' }}>
                      <div className="form-grid form-grid-2">
                        <div className="form-group"><label>Door No / Flat No</label><input {...F('permanentDoorNo')} placeholder="e.g. 10/A" /></div>
                        <div className="form-group"><label>Street</label><input {...F('permanentStreet')} placeholder="Street name" /></div>
                      </div>
                      <div className="form-grid form-grid-2">
                        <div className="form-group"><label>Area / Locality</label><input {...F('permanentArea')} /></div>
                        <div className="form-group"><label>City</label><input {...F('permanentCity')} /></div>
                      </div>
                      <div className="form-grid form-grid-2">
                        <div className="form-group"><label>State</label><input {...F('permanentState')} /></div>
                        <div className="form-group"><label>Pincode</label><input {...F('permanentPincode')} maxLength={6} /></div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── 5. Professional ── */}
                {tab === 4 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-graduation-cap" /></div>
                      <div><h4>Professional Details</h4><p>Qualification, skills, and registration info</p></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Qualification</label><input {...F('qualification')} placeholder="e.g. B.Pharm, GNM, B.Com" /></div>
                      <div className="form-group"><label>Experience (Years)</label><input {...F('experience')} type="number" min="0" placeholder="3" /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>License Number</label><input {...F('licenseNo')} placeholder="License No. (if applicable)" /></div>
                      <div className="form-group"><label>Registration Number</label><input {...F('registrationNo')} placeholder="Professional Reg. No." /></div>
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input {...F('specialization')} placeholder="e.g. Clinical Pharmacy, Critical Care Nursing" />
                    </div>

                    <div className="form-group">
                      <label>Skills (Multi Select)</label>
                      <div className="chip-box" style={{ minHeight:46 }}>
                        {(form.skills||[]).map(s => (
                          <span key={s} className="chip">
                            {s}
                            <span className="chip-x" onClick={() => removeSkill(s)}>×</span>
                          </span>
                        ))}
                        <input
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={onSkillKeyDown}
                          onBlur={addSkill}
                          placeholder="Type a skill and press Enter"
                          style={{ border:'none', outline:'none', flex:1, minWidth:140, fontSize:13, fontFamily:'var(--font)', background:'transparent' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ── 6. Salary ── */}
                {tab === 5 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-rupee-sign" /></div>
                      <div><h4>Salary Details</h4><p>Pay structure and applicable deductions</p></div>
                    </div>

                    <div className="form-group" style={{ marginBottom:18 }}>
                      <label>Salary Type <span className="req">*</span></label>
                      <div style={{ display:'flex', gap:10 }}>
                        {[['Monthly','fa-calendar-alt'],['Daily','fa-coins']].map(([opt, icon]) => (
                          <label
                            key={opt}
                            className="facility-check"
                            style={{
                              cursor:'pointer', flex:1, justifyContent:'flex-start', gap:10,
                              borderColor: form.salaryType === opt ? 'var(--primary)' : 'var(--border)',
                              background: form.salaryType === opt ? 'var(--primary-light)' : '#fff',
                            }}
                          >
                            <input
                              type="radio"
                              name="salaryType"
                              checked={form.salaryType === opt}
                              onChange={() => set('salaryType', opt)}
                              style={{ accentColor:'var(--primary)' }}
                            />
                            <i className={`fas ${icon} fci`} style={{ color: form.salaryType === opt ? 'var(--primary)' : undefined }} />
                            <span style={{ color: form.salaryType === opt ? 'var(--primary)' : undefined }}>
                              {opt === 'Daily' ? 'Daily Wage' : opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-grid form-grid-3">
                      <div className="form-group">
                        <label>Basic Salary <span className="req">*</span></label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input {...F('basicSalary')} type="number" placeholder="25,000" /></div>
                      </div>
                      <div className="form-group">
                        <label>Allowance</label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input {...F('allowance')} type="number" placeholder="3,000" /></div>
                      </div>
                      <div className="form-group">
                        <label>Incentive</label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input {...F('incentive')} type="number" placeholder="0" /></div>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom:18 }}>
                      <label>Salary Effective Date</label>
                      <input {...F('salaryEffectiveDate')} type="date" />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {[['pfApplicable','fa-piggy-bank','PF (Provident Fund) Applicable'],['esiApplicable','fa-building-shield','ESI (Employee State Insurance) Applicable']].map(([k, icon, label]) => (
                        <div key={k} className={`facility-check${form[k] ? ' checked' : ''}`} style={{ cursor:'pointer', justifyContent:'space-between' }}
                          onClick={() => set(k, !form[k])}>
                          <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                            <i className={`fas ${icon} fci`} style={{ width:18, textAlign:'center' }} /> {label}
                          </span>
                          <label className="toggle-switch" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                            <span className="toggle-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── 7. Bank ── */}
                {tab === 6 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-university" /></div>
                      <div><h4>Bank Details</h4><p>Salary disbursement account information</p></div>
                    </div>

                    <div className="info-box" style={{ background:'var(--warning-light)', border:'1px solid var(--warning)' }}>
                      <i className="fas fa-exclamation-triangle" style={{ color:'var(--warning)', marginTop:1, flexShrink:0 }} />
                      <p style={{ color:'var(--warning)' }}>Bank account details are required for salary processing. Verify account number before saving.</p>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Bank Name <span className="req">*</span></label><input {...F('bankName')} placeholder="e.g. State Bank of India" /></div>
                      <div className="form-group"><label>Branch Name</label><input {...F('bankBranchName')} placeholder="Bank branch name" /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Account Holder Name <span className="req">*</span></label><input {...F('bankAccountHolder')} placeholder="As per bank records" /></div>
                      <div className="form-group"><label>Account Number <span className="req">*</span></label><input {...F('bankAccountNo')} placeholder="Account Number" /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>IFSC Code <span className="req">*</span></label><input {...F('bankIfscCode')} placeholder="SBIN0001234" /></div>
                      <div className="form-group"><label>UPI ID</label><input {...F('upiId')} placeholder="staff@sbi or 9876543210@upi" /></div>
                    </div>
                  </>
                )}

                {/* ── 8. Emergency ── */}
                {tab === 7 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-ambulance" /></div>
                      <div><h4>Emergency Contact</h4><p>Person to contact in case of emergency</p></div>
                    </div>
                    <div className="info-box">
                      <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                      <p>This contact will be reached in case of medical emergency or urgent matters involving the staff member.</p>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Contact Name <span className="req">*</span></label><input {...F('emergencyContactName')} placeholder="Full name" /></div>
                      <div className="form-group">
                        <label>Relationship <span className="req">*</span></label>
                        <select {...F('emergencyRelationship')}>
                          <option value="">Select Relationship</option>
                          {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Mobile Number <span className="req">*</span></label>
                        <div className="input-prefix"><span className="pre-tag">+91</span><input {...F('emergencyPhone')} placeholder="9876543210" /></div>
                      </div>
                      <div className="form-group">
                        <label>Alternate Number</label>
                        <div className="input-prefix"><span className="pre-tag">+91</span><input {...F('emergencyAltPhone')} placeholder="Optional" /></div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── 9. Login ── */}
                {tab === 8 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-user-lock" /></div>
                      <div><h4>Login & Access Details</h4><p>Portal credentials and role-based access</p></div>
                    </div>
                    <div className="info-box" style={{ background:'var(--accent-light)', border:'1px solid var(--accent)' }}>
                      <i className="fas fa-shield-alt" style={{ color:'var(--accent)', marginTop:1, flexShrink:0 }} />
                      <p style={{ color:'var(--accent)' }}>Credentials will be sent to the registered email. Staff can reset password on first login. Role determines module access permissions.</p>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Username <span className="req">*</span></label><input {...F('username')} placeholder="e.g. ranjitha.venkat" /></div>
                      <div className="form-group">
                        <label>{editing ? 'New Password (leave blank to keep)' : 'Password'} {!editing && <span className="req">*</span>}</label>
                        <input {...F('password')} type="password" placeholder="Min 8 characters" />
                      </div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Role / Access Level <span className="req">*</span></label>
                        <select {...F('role')}>
                          <option value="">Select Role</option>
                          <option>Admin</option><option>Doctor</option><option>Receptionist</option>
                          <option>Pharmacist</option><option>Nurse</option><option>Accountant</option>
                          <option>Store Keeper</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Login Status</label>
                        <select {...F('loginStatus')}><option>Active</option><option>Inactive</option><option>Blocked</option></select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-2" style={{ marginBottom:18 }}>
                      <div className="form-group">
                        <label>Last Login</label>
                        <input value={form.lastLogin ? new Date(form.lastLogin).toLocaleString('en-IN') : ''} readOnly placeholder="Auto updated on login" />
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {[
                        ['sendCredEmail','fa-envelope','Send Credentials via Email'],
                        ['sendCredWhatsapp','fa-whatsapp','Send Credentials via WhatsApp'],
                        ['forcePasswordChange','fa-key','Force Password Change on First Login'],
                      ].map(([k, icon, label]) => (
                        <div key={k} className={`facility-check${form[k] ? ' checked' : ''}`} style={{ cursor:'pointer', justifyContent:'space-between' }}
                          onClick={() => set(k, !form[k])}>
                          <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                            <i className={`fas ${icon} fci`} style={{ width:18, textAlign:'center' }} /> {label}
                          </span>
                          <label className="toggle-switch" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                            <span className="toggle-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── 10. Attendance ── */}
                {tab === 9 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-hand-paper" /></div>
                      <div><h4>Attendance Details</h4><p>Biometric setup and shift configuration</p></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Biometric ID / Fingerprint ID</label><input {...F('biometricId')} placeholder="e.g. BIO-0043" /></div>
                      <div className="form-group">
                        <label>Shift Timing <span className="req">*</span></label>
                        <select {...F('shiftTiming')}>
                          <option value="">Select Shift</option>
                          {SHIFT_TIMINGS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom:18 }}>
                      <label>Weekly Off Day <span className="req">*</span></label>
                      <select {...F('weeklyOff')}>
                        <option value="">Select Day</option>
                        <option>Sunday</option><option>Monday</option><option>Saturday</option>
                        <option>Saturday &amp; Sunday</option><option>None</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom:22 }}>
                      <label>Available / Working Days</label>
                      <div className="days-selector">
                        {DAYS.map(d => (
                          <div
                            key={d}
                            className={`day-btn${(form.availableDays||[]).includes(d) ? ' selected' : ''}`}
                            onClick={() => toggleDay(d)}
                          >{d}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:6 }}>
                      {[
                        ['overtimeEligible','fa-clock','Overtime Eligible'],
                        ['gpsAttendance','fa-map-marker-alt','GPS / Location-based Attendance'],
                        ['mobilePunchIn','fa-mobile-alt','Mobile Punch-In Allowed'],
                      ].map(([k, icon, label]) => (
                        <div key={k} className={`facility-check${form[k] ? ' checked' : ''}`} style={{ cursor:'pointer', justifyContent:'space-between' }}
                          onClick={() => set(k, !form[k])}>
                          <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                            <i className={`fas ${icon} fci`} style={{ width:18, textAlign:'center' }} /> {label}
                          </span>
                          <label className="toggle-switch" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                            <span className="toggle-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── 11. System & Remarks ── */}
                {tab === 10 && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-cog" /></div>
                      <div><h4>System Fields & Remarks</h4><p>Audit trail and additional notes</p></div>
                    </div>
                    <div className="info-box">
                      <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                      <p>System fields are auto-populated. You can add remarks or notes about this staff member for internal reference.</p>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Created By</label><input value={editing ? (form.createdBy || '—') : 'Admin (current session)'} readOnly /></div>
                      <div className="form-group"><label>Created Date</label><input value={form.createdAt ? new Date(form.createdAt).toLocaleString('en-IN') : '—'} readOnly /></div>
                      <div className="form-group"><label>Modified By</label><input value={form.updatedBy || '—'} readOnly /></div>
                      <div className="form-group"><label>Modified Date</label><input value={form.updatedAt ? new Date(form.updatedAt).toLocaleString('en-IN') : '—'} readOnly /></div>
                    </div>
                    <div className="form-group">
                      <label>Remarks / Internal Notes</label>
                      <textarea {...F('remarks')} rows={5} placeholder="Add any internal notes about this staff member — background, special requirements, observations, etc." />
                    </div>
                  </>
                )}

                {/* ── 12. Review ── */}
                {tab === REVIEW_STEP.id && (
                  <>
                    <div className="fs-title">
                      <div className="fs-icon"><i className="fas fa-check-double" /></div>
                      <div><h4>Review & Confirm</h4><p>Verify all details before {editing ? 'updating' : 'registering'} the staff member</p></div>
                    </div>

                    <div style={{
                      background:'linear-gradient(135deg,var(--primary-light),var(--accent-light))',
                      border:'1px solid var(--primary-mid)', borderRadius:12, padding:16,
                      display:'flex', alignItems:'center', gap:16, marginBottom:20,
                    }}>
                      <div style={{
                        width:64, height:64, borderRadius:16,
                        background:'linear-gradient(135deg,var(--primary),#3498DB)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:22, fontWeight:800, color:'#fff', fontFamily:'var(--font-head)',
                        border:'3px solid #fff', boxShadow:'var(--shadow)', flexShrink:0,
                      }}>
                        {getInitials(form.name || `${form.firstName} ${form.lastName}`)}
                      </div>
                      <div>
                        <strong style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, display:'block' }}>
                          {form.name || `${form.firstName} ${form.lastName}`.trim() || 'Staff Name'}
                        </strong>
                        <span style={{ fontSize:12, color:'var(--text-mid)' }}>
                          {form.designation || 'Designation'} · {branches.find(b => b._id === form.branch)?.branchName || 'Branch'}
                        </span>
                        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                          <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--primary)' }}>{form.employeeId || 'EMP-NEW'}</span>
                          <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--accent)' }}>{form.status}</span>
                          <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--warning)' }}>{form.employeeType}</span>
                        </div>
                      </div>
                    </div>

                    {[
                      { title:'Basic Information', icon:'fa-id-card', rows:[
                        ['Employee ID', form.employeeId], ['Full Name', form.name || `${form.firstName} ${form.lastName}`.trim()],
                        ['Gender', form.gender], ['Age', age ? `${age} years` : '—'],
                        ['Mobile', form.phone], ['Status', form.status],
                      ]},
                      { title:'Employment', icon:'fa-briefcase', rows:[
                        ['Branch', branches.find(b => b._id === form.branch)?.branchName ? `${branches.find(b => b._id === form.branch)?.branchCode} – ${branches.find(b => b._id === form.branch)?.branchName}` : '—'],
                        ['Department', form.department], ['Designation', form.designation],
                        ['Emp. Type', form.employeeType], ['Shift', form.shift], ['Reporting To', form.reportingManager],
                      ]},
                      { title:'Salary & Bank', icon:'fa-rupee-sign', rows:[
                        ['Basic Salary', form.basicSalary ? `₹${form.basicSalary}` : '—'],
                        ['Allowance', form.allowance ? `₹${form.allowance}` : '—'],
                        ['Salary Type', form.salaryType],
                        ['PF', form.pfApplicable ? '✔ Yes' : '— No'],
                        ['ESI', form.esiApplicable ? '✔ Yes' : '— No'],
                        ['Bank', form.bankName || '—'],
                      ]},
                      { title:'Attendance & Login', icon:'fa-fingerprint', rows:[
                        ['Biometric ID', form.biometricId || '—'], ['Shift Timing', form.shiftTiming || '—'],
                        ['Weekly Off', form.weeklyOff || '—'], ['Overtime', form.overtimeEligible ? 'Yes' : 'No'],
                        ['Login Role', form.role || '—'], ['Login Status', form.loginStatus],
                      ]},
                    ].map(({ title, icon, rows }) => (
                      <div key={title} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
                        <h5 style={{
                          fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px',
                          color:'var(--text-light)', marginBottom:8, paddingBottom:8,
                          borderBottom:'1px solid var(--border)',
                          display:'flex', alignItems:'center', gap:7,
                        }}>
                          <i className={`fas ${icon}`} style={{ fontSize:11, color:'var(--primary)' }} />
                          {title}
                        </h5>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                          {rows.map(([k, v]) => (
                            <div key={k} style={{ display:'flex', flexDirection:'column', gap:2 }}>
                              <span style={{ fontSize:10, color:'var(--text-light)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{k}</span>
                              <strong style={{ fontSize:12, color:'var(--text-dark)' }}>{v || '—'}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>{/* end drawer-content */}
            </div>{/* end drawer-body-wrap */}

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={() => tab > 0 ? setTab(tab - 1) : setShowDrawer(false)}>
                <i className={`fas fa-${tab > 0 ? 'arrow-left' : 'times'}`} /> {tab > 0 ? 'Previous' : 'Cancel'}
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--text-light)' }}>Step {tab + 1} of {TABS.length + 1}</span>
                {tab < TABS.length ? (
                  <button className="btn btn-primary" onClick={() => setTab(tab + 1)}>
                    Next <i className="fas fa-arrow-right" />
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={saveMut.isPending}>
                    {saveMut.isPending
                      ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Saving…</>
                      : <><i className="fas fa-save" /> {editing ? 'Update Staff' : 'Register Staff'}</>}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {deleteId && (
        <div className="modal-overlay-small">
          <div className="confirm-modal">
            <div style={{ width:44, height:44, borderRadius:12, background:'var(--danger-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <i className="fas fa-trash" style={{ color:'var(--danger)', fontSize:20 }} />
            </div>
            <h3>Delete Staff Member?</h3>
            <p>This action cannot be undone. All data for this staff member will be permanently deleted.</p>
            <div className="confirm-modal-btns">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}>
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}