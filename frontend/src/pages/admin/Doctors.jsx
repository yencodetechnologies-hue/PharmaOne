import { useState, useMemo } from 'react'
import { useDoctors, useSaveDoctor, useDeleteDoctor, useBranches } from '../../hooks/useAdminMutations'

// ── Constants ────────────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const SPECIALIZATIONS = [
  'General Physician','Cardiology','Dermatology','Endocrinology','ENT',
  'Gastroenterology','General Surgery','Gynaecology','Nephrology','Neurology',
  'Oncology','Ophthalmology','Orthopaedics','Paediatrics','Psychiatry',
  'Pulmonology','Radiology','Rheumatology','Urology','Dentistry',
  'Physiotherapy','Dietetics','Cosmetic Surgery','Plastic Surgery','Other',
]

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

const TREATMENT_SPECIALITIES = [
  'Root Canal','Dental Implant','Orthodontics','Teeth Whitening','Laser Treatment',
  'Hair PRP','Skin PRP','Botox','Fillers','Chemical Peel','Acne Treatment',
  'Physiotherapy','Knee Replacement','Hip Replacement','Cataract Surgery','LASIK',
  'Dialysis','Chemotherapy','Radiation Therapy','General Surgery',
]

const PROCEDURES = [
  'Consultation','Minor Surgery','Dressing','Injection','IV Infusion',
  'ECG','Echo','Endoscopy','Colonoscopy','Biopsy','FNAC',
  'Dental Filling','Extraction','Scaling','Root Canal','Crown Fitting',
  'Physiotherapy Session','Laser Session','PRP Session',
]

const TABS = [
  { id:0, icon:'fa-id-card',         label:'Basic Info',    sub:'Identity & photo' },
  { id:1, icon:'fa-graduation-cap',  label:'Professional',  sub:'Qualifications & fees' },
  { id:2, icon:'fa-phone-alt',       label:'Contact',       sub:'Mobile & email' },
  { id:3, icon:'fa-home',            label:'Address',       sub:'Residential details' },
  { id:4, icon:'fa-building',        label:'Branch Info',   sub:'Department & cabin' },
  { id:5, icon:'fa-clock',           label:'Schedule',      sub:'Availability & slots' },
  { id:6, icon:'fa-rupee-sign',      label:'Financial',     sub:'Salary & bank' },
  { id:7, icon:'fa-file-alt',        label:'Documents',     sub:'Certificates & ID' },
  { id:8, icon:'fa-user-lock',       label:'Login & Access',sub:'Portal credentials' },
  { id:9, icon:'fa-star',            label:'PharmaOne',     sub:'Specific settings' },
]
const REVIEW_STEP = { id:10, label:'Review', sub:'Confirm & save' }

const initForm = {
  doctorId:'', doctorCode:'', name:'', firstName:'', lastName:'', displayName:'',
  gender:'Male', dob:'', bloodGroup:'', maritalStatus:'', avatar:'',
  qualification:'', additionalQualification:'', specialization:'', subSpecialization:'',
  registrationNo:'', medicalCouncilNo:'', licenseNo:'', experience:'',
  consultationFee:'', followUpFee:'', emergencyFee:'',
  phone:'', alternateMobile:'', email:'', alternateEmail:'', emergencyContact:'',
  addressLine1:'', addressLine2:'', city:'', state:'', country:'India', pincode:'',
  branch:'', department:'', cabinNumber:'', employeeType:'Full Time',
  joiningDate:'', relievingDate:'', status:'Active',
  availableDays:[], morningFromTime:'09:00', morningToTime:'13:00',
  eveningFromTime:'17:00', eveningToTime:'21:00', maxAppointmentsPerDay:'',
  onlineConsultation:false, slotDuration:15,
  salaryType:'Fixed', salaryAmount:'', revenueShare:'',
  bankName:'', bankAccountNo:'', bankIfscCode:'', upiId:'',
  aadharNo:'', panCardNo:'',
  registrationCertificate:'', degreeCertificate:'', medicalLicenseCopy:'',
  signature:'', idCardCopy:'',
  username:'', password:'', loginStatus:'Active', lastLogin:'',
  sendCredentialsEmail:true, sendCredentialsWhatsapp:false, forcePasswordChange:true,
  treatmentSpeciality:[], procedureList:[],
  xrayAccess:false, audioNotesAccess:false, videoNotesAccess:false,
  onlineConsultationAccess:false,
  prescriptionTemplate:'', referralCommission:'',
  bio:'', remarks:'',
}

// Age calculator
function calcAge(dob) {
  if (!dob) return ''
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const avatarColors = ['', 'green', 'purple', 'orange', '']
const getColor = i => avatarColors[i % avatarColors.length] || ''
const getInitials = name => (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0,2).toUpperCase() || 'DR'

// Multi-select tag input (PharmaOne treatment/procedure tags)
function TagBox({ options, selected = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const toggle = val => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  const filtered = options.filter(o => o.toLowerCase().includes(input.toLowerCase()) && !selected.includes(o))
  return (
    <div style={{ position:'relative' }}>
      <div className="chip-box" onClick={() => setOpen(true)}>
        {selected.map(v => (
          <span key={v} className="chip">
            {v}
            <span className="chip-x" onClick={e => { e.stopPropagation(); toggle(v) }}>×</span>
          </span>
        ))}
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ''}
          style={{ border:'none', outline:'none', flex:1, minWidth:100, fontSize:13, fontFamily:'var(--font)' }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="chip-dropdown" onMouseLeave={() => setOpen(false)}>
          {filtered.map(opt => (
            <div key={opt} className="chip-option" onClick={() => { toggle(opt); setInput('') }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function Doctors() {
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)
  const [tab, setTab] = useState(0)

  const { data = [], isLoading } = useDoctors()
  const { data: branches = [] } = useBranches()
  const saveMut = useSaveDoctor()
  const deleteMut = useDeleteDoctor()

  const age = useMemo(() => calcAge(form.dob), [form.dob])

  const F = k => ({
    value: form[k] ?? '',
    onChange: e => setForm(f => ({ ...f, [k]: e.target.value })),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = d => set('availableDays', form.availableDays.includes(d) ? form.availableDays.filter(x => x !== d) : [...form.availableDays, d])

  const openCreate = () => {
    setEditing(null)
    const seq = String(data.length + 1).padStart(4, '0')
    const branchPrefix = (branches[0]?.branchCode || 'CHNI').replace(/[^A-Z0-9]/gi, '').toUpperCase()
    setForm({ ...initForm, doctorId: `DOC-${seq}`, doctorCode: `DOC${branchPrefix}-${seq}` })
    setTab(0); setShowDrawer(true)
  }
  const openEdit = d => {
    setEditing(d._id)
    setForm({
      ...initForm, ...d,
      dob:          d.dob?.slice(0,10) || '',
      joiningDate:  d.joiningDate?.slice(0,10) || '',
      relievingDate:d.relievingDate?.slice(0,10) || '',
      branch:       d.branch?._id || d.branch || '',
      password: '',
      availableDays:      Array.isArray(d.availableDays) ? d.availableDays : [],
      treatmentSpeciality:Array.isArray(d.treatmentSpeciality) ? d.treatmentSpeciality : [],
      procedureList:      Array.isArray(d.procedureList) ? d.procedureList : [],
    })
    setTab(0); setShowDrawer(true)
  }

  const handleSubmit = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim() || form.name
    saveMut.mutate({
      id: editing,
      data: { ...form, name: fullName, displayName: form.displayName || `Dr. ${fullName}` },
    }, { onSuccess: () => { setShowDrawer(false); setEditing(null) } })
  }

  const filtered = data.filter(d => {
    const q = search.toLowerCase()
    const matchQ = !q || `${d.name} ${d.email} ${d.specialization} ${d.phone} ${d.doctorCode}`.toLowerCase().includes(q)
    const matchBranch = !filterBranch || (d.branch?._id || d.branch) === filterBranch
    const matchSpec = !filterSpec || d.specialization === filterSpec
    const matchType = !filterType || d.employeeType === filterType
    const matchStatus = !filterStatus || (d.status || (d.isActive ? 'Active' : 'Inactive')) === filterStatus
    return matchQ && matchBranch && matchSpec && matchType && matchStatus
  })

  const totalActive   = data.filter(d => d.status === 'Active' || d.isActive).length
  const totalFullTime = data.filter(d => d.employeeType === 'Full Time').length
  const totalVisiting = data.filter(d => d.employeeType === 'Visiting').length
  const totalOnLeave  = data.filter(d => d.status === 'On Leave').length

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="topbar-breadcrumb" style={{ marginBottom: 4 }}>
            <a href="/dashboard">Dashboard</a>
            <span className="sep"> &rsaquo; </span>
            <a>Masters</a>
            <span className="sep"> &rsaquo; </span>
            <span className="current">Doctor Master</span>
          </div>
          <h2>Doctor Master</h2>
          <p>Manage all registered doctors, schedules, and clinical assignments</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><i className="fas fa-download" /> Export</button>
          <button className="btn btn-outline"><i className="fas fa-print" /> Print</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus" /> Add Doctor</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-user-md" /></div>
          <div><div className="stat-value">{data.length}</div><div className="stat-label">Total Doctors</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-check-circle" /></div>
          <div><div className="stat-value">{totalActive}</div><div className="stat-label">Active Doctors</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-briefcase" /></div>
          <div><div className="stat-value">{totalFullTime}</div><div className="stat-label">Full Time</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><i className="fas fa-walking" /></div>
          <div><div className="stat-value">{totalVisiting}</div><div className="stat-label">Visiting Doctors</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><i className="fas fa-calendar-times" /></div>
          <div><div className="stat-value">{totalOnLeave}</div><div className="stat-label">On Leave Today</div></div>
        </div>
      </div>

      {/* List Panel */}
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
          <select className="filter-select" value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Full Time</option><option>Visiting</option><option>Part Time</option><option>Contract</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option><option>On Leave</option>
          </select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong></div>
          <div className="view-tabs">
            <button className="view-tab active"><i className="fas fa-list" /> List</button>
            <button className="view-tab"><i className="fas fa-id-card" /> Cards</button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="loading"><div className="spinner" />Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fas fa-user-md" /></div>
              <h3>No doctors found</h3>
              <p>Click "Add Doctor" to register your first doctor</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Mobile</th>
                  <th>Branch</th>
                  <th>Type</th>
                  <th>Consult Fee</th>
                  <th>Experience</th>
                  <th>Available Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const isActive = d.status === 'Active' || d.isActive
                  return (
                    <tr key={d._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          {d.avatar ? (
                            <img src={d.avatar} alt={d.name} style={{ width:40, height:40, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                          ) : (
                            <div className={`entity-logo ${getColor(i)}`}>{getInitials(d.name)}</div>
                          )}
                          <div>
                            <strong>{d.displayName || `Dr. ${d.name}`}</strong>
                            <small>{d.qualification || '—'}{d.specialization ? ` · ${d.specialization}` : ''}</small>
                            <div style={{ fontSize:10, background:'var(--primary-light)', color:'var(--primary)', padding:'1px 6px', borderRadius:4, fontWeight:700, display:'inline-block', marginTop:2 }}>
                              {d.doctorCode || `DOC-${d._id.slice(-4).toUpperCase()}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {d.specialization || '—'}
                        {d.subSpecialization && (
                          <div style={{ fontSize:11, color:'var(--text-light)', marginTop:2 }}>{d.subSpecialization}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{d.phone || '—'}</td>
                      <td style={{ fontSize: 12 }}>{d.branch?.branchCode ? `${d.branch.branchCode} – ${d.branch.branchName}` : (d.branch?.branchName || '—')}</td>
                      <td>
                        <span className={`badge ${d.employeeType === 'Full Time' ? 'badge-blue' : 'badge-orange'}`}>
                          {d.employeeType || 'Full Time'}
                        </span>
                      </td>
                      <td><span style={{ fontWeight:700, color:'var(--text-dark)' }}>₹{d.consultationFee || 0}</span></td>
                      <td style={{ fontSize: 13 }}>{d.experience ? `${d.experience} yrs` : '—'}</td>
                      <td>
                        <div className="days-mini" style={{ display:'flex', gap:3 }}>
                          {['M','T','W','T','F','S','S'].map((label, idx) => {
                            const dayName = DAYS[idx]
                            const on = (d.availableDays || []).includes(dayName)
                            return (
                              <div key={idx} style={{
                                width:22, height:22, borderRadius:5, fontSize:10, fontWeight:700,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                background: on ? 'var(--primary-light)' : 'var(--bg)',
                                color: on ? 'var(--primary)' : 'var(--text-light)',
                              }}>{label}</div>
                            )
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-green' : d.status === 'On Leave' ? 'badge-orange' : 'badge-red'}`}>
                          {d.status || (d.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="View Profile"><i className="fas fa-eye" /></button>
                          <button className="act-btn" title="Edit" onClick={() => openEdit(d)}><i className="fas fa-edit" /></button>
                          <button className="act-btn" title="Schedule"><i className="fas fa-calendar-alt" /></button>
                          <button className="act-btn success" title="Performance"><i className="fas fa-chart-line" /></button>
                          <button className="act-btn danger" title="Delete" onClick={() => setDeleteId(d._id)}><i className="fas fa-trash" /></button>
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
          <div className="pagination-info">Showing 1–{filtered.length} of {filtered.length} doctors</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Rows:</span>
            <select className="filter-select" style={{ padding: '5px 10px', fontSize: 12 }}>
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
            <div className="drawer-header">
              <div className="dh-icon"><i className="fas fa-user-md" /></div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                <p>Complete all sections to {editing ? 'update the' : 'register a new'} doctor</p>
              </div>
              <span className="dh-badge">{tab === 10 ? 'Review' : `Step ${tab + 1} / ${TABS.length}`}</span>
              <button className="drawer-close" onClick={() => setShowDrawer(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="drawer-body-wrap">
              <div className="drawer-steps">
                {TABS.map(t => (
                  <div
                    key={t.id}
                    className={`step-nav-item${tab === t.id ? ' active' : ''}${tab > t.id ? ' done' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <div className="step-num">{tab > t.id ? <i className="fas fa-check" /> : t.id + 1}</div>
                    <div className="step-nav-text"><strong>{t.label}</strong><span>{t.sub}</span></div>
                  </div>
                ))}
                <div
                  className={`step-nav-item review-step${tab === REVIEW_STEP.id ? ' active' : ''}`}
                  onClick={() => setTab(REVIEW_STEP.id)}
                >
                  <div className="step-num" style={{ background: tab === REVIEW_STEP.id ? 'var(--primary)' : 'var(--accent-light)', color: tab === REVIEW_STEP.id ? '#fff' : 'var(--accent)' }}>
                    <i className="fas fa-check" />
                  </div>
                  <div className="step-nav-text"><strong>{REVIEW_STEP.label}</strong><span>{REVIEW_STEP.sub}</span></div>
                </div>
              </div>

              <div className="drawer-content">

              {/* ── 1. Basic Info ── */}
              {tab === 0 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-id-card" /></div>
                    <div><h4>Basic Information</h4><p>Doctor's identity, personal details and profile photo</p></div>
                  </div>

                  <div style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:18 }}>
                    <div style={{
                      width:90, height:90, borderRadius:20, flexShrink:0,
                      background:'linear-gradient(135deg,#0D6EAC,#3498DB)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:30, fontWeight:800, color:'#fff', fontFamily:'var(--font-head)',
                    }}>
                      {getInitials(`${form.firstName} ${form.lastName}`)}
                    </div>
                    <div>
                      <h5 style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>Profile Photo</h5>
                      <p style={{ fontSize:12, color:'var(--text-light)', marginBottom:10 }}>
                        Paste a photo URL. Recommended: 300×300px, JPG/PNG.
                      </p>
                      <input {...F('avatar')} placeholder="https://... profile photo URL" style={{ maxWidth:320 }} />
                    </div>
                  </div>

                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Doctor ID <span className="req">*</span></label>
                      <input {...F('doctorId')} placeholder="Auto-generated" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Doctor Code <span className="req">*</span></label>
                      <input {...F('doctorCode')} placeholder="Auto-generated" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Status <span className="req">*</span></label>
                      <select {...F('status')}>
                        <option>Active</option><option>Inactive</option><option>On Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Gender <span className="req">*</span></label>
                      <select {...F('gender')}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>First Name <span className="req">*</span></label>
                      <input
                        value={form.firstName}
                        onChange={e => {
                          const v = e.target.value
                          setForm(f => ({ ...f, firstName:v, name:`${v} ${f.lastName}`.trim(), displayName:`Dr. ${v} ${f.lastName}`.trim() }))
                        }}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        value={form.lastName}
                        onChange={e => {
                          const v = e.target.value
                          setForm(f => ({ ...f, lastName:v, name:`${f.firstName} ${v}`.trim(), displayName:`Dr. ${f.firstName} ${v}`.trim() }))
                        }}
                        placeholder="Last name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Display Name</label>
                      <input {...F('displayName')} placeholder="Name shown to patients" />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input {...F('dob')} type="date" />
                    </div>
                  </div>
                  <div className="form-grid form-grid-3">
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
                    <div className="form-group">
                      <label>Marital Status</label>
                      <select {...F('maritalStatus')}>
                        <option value="">Select</option>
                        <option>Single</option><option>Married</option>
                        <option>Divorced</option><option>Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bio / About Doctor</label>
                    <textarea {...F('bio')} rows={3} placeholder="Short professional bio shown on the patient portal" />
                  </div>
                </>
              )}

              {/* ── 2. Professional ── */}
              {tab === 1 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-graduation-cap" /></div>
                    <div><h4>Professional Information</h4><p>Qualifications, specialization, and consultation charges</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group" style={{ gridColumn:'1/-1' }}>
                      <label>Qualification <span className="req">*</span></label>
                      <input {...F('qualification')} placeholder="e.g. BDS, MDS (Endodontics)" />
                    </div>
                    <div className="form-group">
                      <label>Specialization <span className="req">*</span></label>
                      <select {...F('specialization')}>
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Sub Specialization</label>
                      <input {...F('subSpecialization')} placeholder="e.g. Cosmetic Dentistry" />
                    </div>
                    <div className="form-group">
                      <label>Registration Number <span className="req">*</span></label>
                      <input {...F('registrationNo')} placeholder="Medical Council Reg. No." />
                    </div>
                    <div className="form-group">
                      <label>Medical Council Number</label>
                      <input {...F('medicalCouncilNo')} placeholder="Council Number" />
                    </div>
                    <div className="form-group">
                      <label>License Number</label>
                      <input {...F('licenseNo')} placeholder="License No." />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years) <span className="req">*</span></label>
                      <input {...F('experience')} type="number" min="0" max="60" placeholder="8" />
                    </div>
                  </div>

                  <div className="info-box">
                    <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                    <p>Consultation fees are used in appointment billing and estimation. Leave Emergency Fee blank if not applicable.</p>
                  </div>

                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Consultation Fee <span className="req">*</span></label>
                      <div className="input-prefix">
                        <span className="pre-tag">₹</span>
                        <input {...F('consultationFee')} type="number" placeholder="500" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Follow-up Fee</label>
                      <div className="input-prefix">
                        <span className="pre-tag">₹</span>
                        <input {...F('followUpFee')} type="number" placeholder="300" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Emergency Fee</label>
                      <div className="input-prefix">
                        <span className="pre-tag">₹</span>
                        <input {...F('emergencyFee')} type="number" placeholder="800" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── 3. Contact ── */}
              {tab === 2 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-phone-alt" /></div>
                    <div><h4>Contact Information</h4><p>Primary contact and emergency reach</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Mobile Number <span className="req">*</span></label>
                      <div className="input-prefix">
                        <span className="pre-tag">+91</span>
                        <input {...F('phone')} placeholder="9876543210" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Alternate Mobile</label>
                      <div className="input-prefix">
                        <span className="pre-tag">+91</span>
                        <input {...F('alternateMobile')} placeholder="Optional" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input {...F('email')} type="email" placeholder="doctor@pharmaone.in" />
                    </div>
                    <div className="form-group">
                      <label>Emergency Contact</label>
                      <div className="input-prefix">
                        <span className="pre-tag">+91</span>
                        <input {...F('emergencyContact')} placeholder="Emergency contact number" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── 4. Address ── */}
              {tab === 3 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-home" /></div>
                    <div><h4>Address Information</h4><p>Doctor's residential address</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group" style={{ gridColumn:'1/-1' }}>
                      <label>Address Line 1 <span className="req">*</span></label>
                      <input {...F('addressLine1')} placeholder="Door No., Street Name" />
                    </div>
                    <div className="form-group" style={{ gridColumn:'1/-1' }}>
                      <label>Address Line 2</label>
                      <input {...F('addressLine2')} placeholder="Landmark, Area" />
                    </div>
                    <div className="form-group">
                      <label>City <span className="req">*</span></label>
                      <input {...F('city')} placeholder="Chennai" />
                    </div>
                    <div className="form-group">
                      <label>State <span className="req">*</span></label>
                      <select {...F('state')}>
                        <option value="">Select State</option>
                        <option>Tamil Nadu</option><option>Karnataka</option>
                        <option>Kerala</option><option>Maharashtra</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <select {...F('country')}><option>India</option></select>
                    </div>
                    <div className="form-group">
                      <label>Pincode <span className="req">*</span></label>
                      <input {...F('pincode')} maxLength={6} placeholder="600042" />
                    </div>
                  </div>
                </>
              )}

              {/* ── 5. Branch Info ── */}
              {tab === 4 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-building" /></div>
                    <div><h4>Branch Information</h4><p>Assigned branch, department, and employment details</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Branch <span className="req">*</span></label>
                      <select {...F('branch')}>
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.branchCode} – {b.branchName}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department <span className="req">*</span></label>
                      <select {...F('department')}>
                        <option value="">Select Department</option>
                        <option>Dental</option><option>Dermatology</option>
                        <option>Ophthalmology</option><option>Physiotherapy</option>
                        <option>General Medicine</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cabin / Room Number</label>
                      <select {...F('cabinNumber')}>
                        <option value="">Select Cabin</option>
                        <option>Cabin 1</option><option>Cabin 2</option>
                        <option>Cabin 3</option><option>Cabin 4</option><option>OT Room</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Employee Type <span className="req">*</span></label>
                      <select {...F('employeeType')}>
                        <option>Full Time</option><option>Visiting</option>
                        <option>Part Time</option><option>Contract</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Joining Date <span className="req">*</span></label>
                      <input {...F('joiningDate')} type="date" />
                    </div>
                    <div className="form-group">
                      <label>Relieving Date</label>
                      <input {...F('relievingDate')} type="date" />
                    </div>
                  </div>
                </>
              )}

              {/* ── 6. Schedule ── */}
              {tab === 5 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-clock" /></div>
                    <div><h4>Schedule Information</h4><p>Available days, consultation slots and online availability</p></div>
                  </div>
                  <div className="form-group" style={{ marginBottom:18 }}>
                    <label>Available Days <span className="req">*</span></label>
                    <div className="days-selector">
                      {DAYS.map(d => (
                        <div
                          key={d}
                          className={`day-btn${form.availableDays.includes(d) ? ' selected' : ''}`}
                          onClick={() => toggleDay(d)}
                        >{d}</div>
                      ))}
                    </div>
                  </div>
                  <div className="info-box">
                    <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                    <p>Morning and Evening slots are independent. Leave Evening blank if the doctor works only morning hours.</p>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-mid)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    🌅 Morning Slot
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>From Time</label><input {...F('morningFromTime')} type="time" /></div>
                    <div className="form-group"><label>To Time</label><input {...F('morningToTime')} type="time" /></div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-mid)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    🌆 Evening Slot
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>From Time</label><input {...F('eveningFromTime')} type="time" /></div>
                    <div className="form-group"><label>To Time</label><input {...F('eveningToTime')} type="time" /></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Max Appointments / Day</label>
                      <input {...F('maxAppointmentsPerDay')} type="number" min="1" placeholder="20" />
                    </div>
                  </div>
                  <div className="facility-check" style={{ display:'flex', justifyContent:'space-between', cursor:'default', marginTop:4 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                      <i className="fas fa-video" style={{ color:'var(--text-light)' }} /> Online Consultation Available
                    </span>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={form.onlineConsultation} onChange={e => set('onlineConsultation', e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </>
              )}

              {/* ── 7. Financial ── */}
              {tab === 6 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-rupee-sign" /></div>
                    <div><h4>Financial Information</h4><p>Salary structure and bank account details</p></div>
                  </div>
                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Salary Type <span className="req">*</span></label>
                      <select {...F('salaryType')}>
                        <option>Fixed</option><option>Percentage</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Salary Amount / Month</label>
                      <div className="input-prefix">
                        <span className="pre-tag">₹</span>
                        <input {...F('salaryAmount')} type="number" placeholder="75,000" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Revenue Share (%)</label>
                      <div className="input-prefix">
                        <span className="pre-tag">%</span>
                        <input {...F('revenueShare')} type="number" min="0" max="100" placeholder="30" />
                      </div>
                    </div>
                  </div>
                  <div className="info-box" style={{ background:'var(--warning-light)', borderColor:'#FAD7A0' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color:'var(--warning)', marginTop:1, flexShrink:0 }} />
                    <p style={{ color:'#a06000' }}>Bank details are required for salary disbursement. Ensure account details are verified before saving.</p>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Bank Name</label><input {...F('bankName')} placeholder="e.g. HDFC Bank" /></div>
                    <div className="form-group"><label>Account Number</label><input {...F('bankAccountNo')} placeholder="Account Number" /></div>
                    <div className="form-group"><label>IFSC Code</label><input {...F('bankIfscCode')} placeholder="HDFC0001234" /></div>
                    <div className="form-group"><label>UPI ID</label><input {...F('upiId')} placeholder="doctor@upi" /></div>
                  </div>
                </>
              )}

              {/* ── 8. Documents ── */}
              {tab === 7 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-file-alt" /></div>
                    <div><h4>Documents</h4><p>Upload identity and professional certificates</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Aadhaar Number</label><input {...F('aadharNo')} maxLength={14} placeholder="XXXX XXXX XXXX" /></div>
                    <div className="form-group"><label>PAN Number</label><input {...F('panCardNo')} maxLength={10} placeholder="ABCDE1234F" /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:8 }}>
                    {[
                      ['registrationCertificate', 'fa-id-card', 'Registration Certificate', 'PDF / JPG · Max 5MB'],
                      ['degreeCertificate', 'fa-graduation-cap', 'Degree Certificate', 'PDF / JPG · Max 5MB'],
                      ['medicalLicenseCopy', 'fa-file-medical', 'Medical License Copy', 'PDF / JPG · Max 5MB'],
                      ['signature', 'fa-pen-nib', 'Signature (Digital)', 'PNG / JPG · Max 1MB'],
                      ['idCardCopy', 'fa-id-badge', 'ID Card Copy', 'PDF / JPG · Max 2MB'],
                    ].map(([key, icon, label, hint]) => {
                      const uploaded = !!form[key]
                      return (
                        <label
                          key={key}
                          className={`logo-upload${uploaded ? ' uploaded' : ''}`}
                          style={{
                            padding:18, textAlign:'center', cursor:'pointer',
                            borderColor: uploaded ? 'var(--accent)' : undefined,
                            background: uploaded ? 'var(--accent-light)' : undefined,
                          }}
                        >
                          <i className={`fas ${uploaded ? 'fa-check-circle' : icon}`} style={{ fontSize:22, color: uploaded ? 'var(--accent)' : 'var(--text-light)', display:'block', marginBottom:8 }} />
                          <p style={{ fontSize:13, fontWeight:600, color: uploaded ? 'var(--accent)' : 'var(--text-mid)', marginBottom:4 }}>{label}</p>
                          <span style={{ fontSize:11, color: uploaded ? 'var(--accent)' : 'var(--text-light)' }}>
                            {uploaded ? `Uploaded · ${form[key]} ✓` : hint}
                          </span>
                          <input
                            type="file"
                            accept={key === 'signature' ? 'image/*' : '.pdf,image/*'}
                            style={{ display:'none' }}
                            onChange={e => set(key, e.target.files?.[0]?.name || '')}
                          />
                        </label>
                      )
                    })}
                    <div
                      className="logo-upload uploaded"
                      style={{ padding:18, textAlign:'center', borderStyle:'solid', borderColor:'var(--accent)', background:'var(--accent-light)' }}
                    >
                      <i className="fas fa-check-circle" style={{ fontSize:22, color:'var(--accent)', display:'block', marginBottom:8 }} />
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:4 }}>Profile Photo</p>
                      <span style={{ fontSize:11, color:'var(--accent)' }}>
                        {form.avatar ? 'Already uploaded ✓' : 'Add one in Basic Info'}
                      </span>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop:16 }}>
                    <label>Remarks</label>
                    <textarea {...F('remarks')} rows={2} />
                  </div>
                </>
              )}

              {/* ── 9. Login ── */}
              {tab === 8 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-user-lock" /></div>
                    <div><h4>Login Information</h4><p>Portal credentials and access status</p></div>
                  </div>
                  <div className="info-box" style={{ background:'var(--accent-light)', borderColor:'#9EDDD4' }}>
                    <i className="fas fa-shield-alt" style={{ color:'#00896f', marginTop:1, flexShrink:0 }} />
                    <p style={{ color:'#00896f' }}>A temporary password will be emailed to the doctor's registered email. They can change it on first login.</p>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Username <span className="req">*</span></label>
                      <input {...F('username')} placeholder="e.g. dr.priya.ramesh" />
                    </div>
                    <div className="form-group">
                      <label>{editing ? 'New Password (leave blank to keep)' : 'Password'} {!editing && <span className="req">*</span>}</label>
                      <input {...F('password')} type="password" placeholder="Min 8 characters" />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input value="Doctor" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Login Status <span className="req">*</span></label>
                      <select {...F('loginStatus')}>
                        <option>Active</option><option>Blocked</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Last Login</label>
                      <input value={form.lastLogin || 'Auto updated on login'} readOnly />
                    </div>
                  </div>

                  <div style={{ height:1, background:'var(--border)', margin:'18px 0' }} />

                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      ['sendCredentialsEmail', 'fa-envelope', 'Send Login Credentials via Email'],
                      ['sendCredentialsWhatsapp', 'fa-whatsapp', 'Send Login Credentials via WhatsApp'],
                      ['forcePasswordChange', 'fa-mobile-alt', 'Force Password Change on First Login'],
                    ].map(([key, icon, label]) => (
                      <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:9 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                          <i className={`fa${key === 'sendCredentialsWhatsapp' ? 'b' : 's'} ${icon}`} style={{ color:'var(--text-light)', width:18, textAlign:'center' }} /> {label}
                        </span>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── 10. PharmaOne ── */}
              {tab === 9 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-star" /></div>
                    <div><h4>PharmaOne Specific Settings</h4><p>Clinical access rights and system-specific configurations</p></div>
                  </div>
                  <div className="form-group" style={{ marginBottom:16 }}>
                    <label>Treatment Specialities (Multi Select)</label>
                    <TagBox
                      options={TREATMENT_SPECIALITIES}
                      selected={form.treatmentSpeciality}
                      onChange={v => set('treatmentSpeciality', v)}
                      placeholder="Type to add speciality…"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom:16 }}>
                    <label>Procedure List (Multi Select)</label>
                    <TagBox
                      options={PROCEDURES}
                      selected={form.procedureList}
                      onChange={v => set('procedureList', v)}
                      placeholder="Type to add procedure…"
                    />
                  </div>
                  <div className="form-grid form-grid-2" style={{ marginBottom:16 }}>
                    <div className="form-group">
                      <label>Prescription Template</label>
                      <select {...F('prescriptionTemplate')}>
                        <option value="">Default Template</option>
                        <option value="template1">Template 1 – Standard</option>
                        <option value="template2">Template 2 – Detailed</option>
                        <option value="template3">Template 3 – Compact</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Referral Commission (%)</label>
                      <div className="input-prefix">
                        <span className="pre-tag">%</span>
                        <input {...F('referralCommission')} type="number" min="0" max="50" placeholder="5" />
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      ['xrayAccess', 'fa-x-ray', 'X-Ray Records Access'],
                      ['audioNotesAccess', 'fa-microphone', 'Audio Notes Access'],
                      ['videoNotesAccess', 'fa-video', 'Video Notes Access'],
                    ].map(([key, icon, label]) => (
                      <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:9 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>
                          <i className={`fas ${icon}`} style={{ color:'var(--text-light)', width:18, textAlign:'center' }} /> {label}
                        </span>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── 11. Review ── */}
              {tab === 10 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-check-double" /></div>
                    <div><h4>Review & Confirm</h4><p>Verify all details before {editing ? 'updating' : 'registering'} the doctor</p></div>
                  </div>

                  <div style={{
                    background:'linear-gradient(135deg,var(--primary-light),var(--accent-light))',
                    border:'1px solid var(--primary-mid)', borderRadius:12, padding:16,
                    display:'flex', alignItems:'center', gap:16, marginBottom:20,
                  }}>
                    <div style={{
                      width:64, height:64, borderRadius:16,
                      background:'linear-gradient(135deg,#0D6EAC,#3498DB)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:22, fontWeight:800, color:'#fff', fontFamily:'var(--font-head)',
                      border:'3px solid #fff', boxShadow:'var(--shadow)', flexShrink:0,
                    }}>
                      {getInitials(form.name || `${form.firstName} ${form.lastName}`)}
                    </div>
                    <div>
                      <strong style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, display:'block' }}>
                        {form.displayName || form.name || 'Doctor Name'}
                      </strong>
                      <span style={{ fontSize:12, color:'var(--text-mid)' }}>
                        {form.specialization || 'Specialization'} · {branches.find(b => b._id === form.branch)?.branchName || 'Branch'}
                      </span>
                      <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--primary)' }}>{form.doctorCode || 'DOC-NEW'}</span>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--accent)' }}>{form.status}</span>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, background:'#fff', color:'var(--warning)' }}>{form.employeeType}</span>
                      </div>
                    </div>
                  </div>

                  {[
                    { title:'Basic Information', rows:[
                      ['Full Name', form.name], ['Gender', form.gender], ['Age', age ? `${age} years` : '—'],
                      ['Blood Group', form.bloodGroup], ['Status', form.status], ['DOB', form.dob],
                    ]},
                    { title:'Professional', rows:[
                      ['Specialization', form.specialization], ['Experience', form.experience ? `${form.experience} yrs` : '—'],
                      ['Reg. Number', form.registrationNo], ['Consult Fee', form.consultationFee ? `₹${form.consultationFee}` : '—'],
                      ['Follow-up Fee', form.followUpFee ? `₹${form.followUpFee}` : '—'], ['Emergency Fee', form.emergencyFee ? `₹${form.emergencyFee}` : '—'],
                    ]},
                    { title:'Branch & Schedule', rows:[
                      ['Branch', branches.find(b => b._id === form.branch)?.branchName || '—'], ['Department', form.department],
                      ['Emp. Type', form.employeeType], ['Morning', `${form.morningFromTime} – ${form.morningToTime}`],
                      ['Evening', `${form.eveningFromTime} – ${form.eveningToTime}`], ['Online Consult', form.onlineConsultation ? 'Yes' : 'No'],
                    ]},
                    { title:'PharmaOne Access', rows:[
                      ['X-Ray Access', form.xrayAccess ? '✔ Yes' : '— No'], ['Audio Notes', form.audioNotesAccess ? '✔ Yes' : '— No'],
                      ['Video Notes', form.videoNotesAccess ? '✔ Yes' : '— No'], ['Referral %', form.referralCommission ? `${form.referralCommission}%` : '—'],
                      ['Login Status', form.loginStatus], ['Salary Type', form.salaryType],
                    ]},
                  ].map(({ title, rows }) => (
                    <div key={title} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
                      <h5 style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', color:'var(--text-light)', marginBottom:8 }}>{title}</h5>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                        {rows.map(([k,v]) => (
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

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={() => tab > 0 ? setTab(tab-1) : setShowDrawer(false)}>
                <i className={`fas fa-${tab > 0 ? 'arrow-left' : 'times'}`} /> {tab > 0 ? 'Previous' : 'Cancel'}
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--text-light)' }}>Step {tab+1} of {TABS.length + 1}</span>
                {tab < TABS.length ? (
                  <button className="btn btn-primary" onClick={() => setTab(tab+1)}>
                    Next <i className="fas fa-arrow-right" />
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={saveMut.isPending}>
                    {saveMut.isPending ? <><div className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Saving…</> : <><i className="fas fa-save" /> {editing ? 'Update Doctor' : 'Register Doctor'}</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="modal-overlay-small">
          <div className="confirm-modal">
            <div style={{ width:44,height:44,borderRadius:12,background:'var(--danger-light)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
              <i className="fas fa-trash" style={{ color:'var(--danger)',fontSize:20 }} />
            </div>
            <h3>Delete Doctor?</h3>
            <p>This action cannot be undone. All data for this doctor will be permanently deleted.</p>
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