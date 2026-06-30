import { useState } from 'react'
import { useBranches, useSaveBranch, useDeleteBranch } from '../../hooks/useAdminMutations'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const STATES = ['Tamil Nadu','Karnataka','Kerala','Andhra Pradesh','Telangana','Maharashtra','Delhi','Gujarat','Rajasthan','West Bengal']

const initForm = {
  branchCode:'', branchName:'', branchType:'', status:'Active', description:'',
  contactPerson:'', mobileNumber:'', alternateMobile:'', landlineNumber:'', email:'', alternateEmail:'', website:'',
  addressLine1:'', addressLine2:'', area:'', city:'', district:'', state:'', country:'India', pincode:'', googleMapLink:'', latitude:'', longitude:'',
  openingTime:'09:00', closingTime:'21:00', workingDays:['Mon','Tue','Wed','Thu','Fri','Sat'], weeklyOff:'Sunday', emergencyService:false, service24x7:false,
  totalFloors:'', totalCabins:'', totalConsultationRooms:'', totalDoctors:'', waitingHallCapacity:'',
  pharmacyAvailable:false, laboratoryAvailable:false, xrayAvailable:false, scanAvailable:false, otAvailable:false,
  gstNumber:'', panNumber:'', registrationNumber:'', bankName:'', accountNumber:'', ifscCode:'', upiId:'',
  branchPrefix:'', invoicePrefix:'INV-', patientPrefix:'PAT-', appointmentPrefix:'APT-', estimationPrefix:'EST-',
  defaultCurrency:'INR', timeZone:'Asia/Kolkata', password:'', receptionistCount:'', doctorCount:'', staffCount:'',
}

const TABS = [
  { id:0, icon:'fa-info-circle',      label:'Basic Info' },
  { id:1, icon:'fa-phone',            label:'Contact' },
  { id:2, icon:'fa-map-marker-alt',   label:'Address' },
  { id:3, icon:'fa-clock',            label:'Operations' },
  { id:4, icon:'fa-hospital',         label:'Facilities' },
  { id:5, icon:'fa-rupee-sign',       label:'Financial' },
  { id:6, icon:'fa-users',            label:'Staff & Prefix' },
  { id:7, icon:'fa-check-double',     label:'Review' },
]

const avatarColors = ['', 'green', 'purple', 'orange', '']

export default function Branches() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [tab, setTab] = useState(0)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = useBranches()
  const saveMut = useSaveBranch()
  const deleteMut = useDeleteBranch()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = d => set('workingDays', form.workingDays.includes(d) ? form.workingDays.filter(x => x !== d) : [...form.workingDays, d])

  const openCreate = () => { setEditing(null); setForm(initForm); setTab(0); setShowDrawer(true) }
  const openEdit = b => {
    setEditing(b._id)
    setForm({ ...initForm, ...b, workingDays: b.workingDays || ['Mon','Tue','Wed','Thu','Fri','Sat'] })
    setTab(0); setShowDrawer(true)
  }

  const handleSubmit = () => {
    saveMut.mutate({ id: editing, data: form }, { onSuccess: () => { setShowDrawer(false); setEditing(null) } })
  }

  const filtered = data.filter(b => {
    const q = search.toLowerCase()
    const matchQ = !q || `${b.branchName} ${b.branchCode} ${b.city}`.toLowerCase().includes(q)
    const matchType = !filterType || b.branchType === filterType
    const matchStatus = !filterStatus || (filterStatus === 'Active' ? (b.isActive || b.status === 'Active') : (!b.isActive && b.status !== 'Active'))
    return matchQ && matchType && matchStatus
  })

  const totalActive = data.filter(b => b.isActive || b.status === 'Active').length
  const totalFranchise = data.filter(b => b.branchType === 'Franchise').length
  const totalInactive = data.filter(b => !b.isActive && b.status !== 'Active').length

  const getInitial = name => (name || '?')[0].toUpperCase()
  const getColor = i => avatarColors[i % avatarColors.length] || ''

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
            <span className="current">Branch Master</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800 }}>Branch Master</h2>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 3 }}>Manage all clinic and pharmacy branch locations</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><i className="fas fa-download" /> Export</button>
          <button className="btn btn-outline"><i className="fas fa-print" /> Print</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus" /> Add Branch</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-building" /></div>
          <div><div className="stat-value">{data.length}</div><div className="stat-label">Total Branches</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-check-circle" /></div>
          <div><div className="stat-value">{totalActive}</div><div className="stat-label">Active Branches</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-store" /></div>
          <div><div className="stat-value">{totalFranchise}</div><div className="stat-label">Franchise Branches</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><i className="fas fa-times-circle" /></div>
          <div><div className="stat-value">{totalInactive}</div><div className="stat-label">Inactive Branches</div></div>
        </div>
      </div>

      {/* List Panel */}
      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si"><i className="fas fa-search" /></span>
            <input placeholder="Search by branch name, code, city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Main Branch</option><option>Franchise</option><option>Clinic</option><option>Pharmacy</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <select className="filter-select">
            <option value="">All Cities</option>
          </select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> branches</div>
          <div className="view-tabs">
            <button className="view-tab active"><i className="fas fa-list" /> List</button>
            <button className="view-tab"><i className="fas fa-th" /> Grid</button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="loading"><div className="spinner" />Loading branches...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fas fa-building" /></div>
              <h3>No branches found</h3>
              <p>Add your first branch to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Branch</th><th>Code</th><th>Type</th><th>Contact</th>
                  <th>City</th><th>Facilities</th><th>Manager</th>
                  <th>Doctors</th><th>GST No</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const isActive = b.isActive || b.status === 'Active'
                  return (
                    <tr key={b._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          <div className={`entity-logo ${getColor(i)}`}>{getInitial(b.branchName)}</div>
                          <div>
                            <strong>{b.branchName}</strong>
                            <small>{b.invoicePrefix || 'INV-'}{b.branchCode} · {b.patientPrefix || 'PAT-'}{b.branchCode}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.branchCode || '—'}</span></td>
                      <td>
                        <span className={`badge ${b.branchType === 'Main Branch' ? 'badge-blue' : 'badge-orange'}`}>
                          {b.branchType || 'Main Branch'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{b.contactPerson || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{b.mobileNumber || b.contactDetails || ''}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{[b.area || b.city, b.city].filter(Boolean).join(', ') || '—'}</td>
                      <td>
                        <div className="facility-tags">
                          {b.pharmacyAvailable && <span className="f-tag">Pharmacy</span>}
                          {b.xrayAvailable && <span className="f-tag">X-Ray</span>}
                          {b.laboratoryAvailable && <span className="f-tag">Lab</span>}
                          {b.scanAvailable && <span className="f-tag">Scan</span>}
                          {b.otAvailable && <span className="f-tag">OT</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{b.contactPerson || '—'}</td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{b.totalDoctors || b.doctorCount || 0}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{b.gstNumber || '—'}</td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="View"><i className="fas fa-eye" /></button>
                          <button className="act-btn" title="Edit" onClick={() => openEdit(b)}><i className="fas fa-pen" /></button>
                          <button className="act-btn" title="ID Card"><i className="fas fa-id-card" /></button>
                          <button className="act-btn danger" title="Delete" onClick={() => setDeleteId(b._id)}><i className="fas fa-trash" /></button>
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
          <div className="pagination-info">Showing 1–{filtered.length} of {filtered.length} branches</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Rows per page:</span>
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
          <div className="drawer">
            <div className="drawer-header">
              <div className="dh-icon"><i className="fas fa-building" /></div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Branch' : 'Add New Branch'}</h3>
                <p>Fill in all sections to {editing ? 'update the' : 'register a new'} branch</p>
              </div>
              <button className="drawer-close" onClick={() => setShowDrawer(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="drawer-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`drawer-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                  <i className={`fas ${t.icon}`} /> {t.label} <span className="tab-num">{t.id + 1}</span>
                </button>
              ))}
            </div>

            <div className="drawer-body">

              {/* Section 1: Basic */}
              {tab === 0 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-info-circle" /></div>
                    <div><h4>Basic Information</h4><p>Branch identity and classification</p></div>
                  </div>
                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Branch ID</label>
                      <input value="BRN-AUTO" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Branch Code <span className="req">*</span></label>
                      <input {...F('branchCode')} placeholder="e.g. CHN001" />
                    </div>
                    <div className="form-group">
                      <label>Branch Type <span className="req">*</span></label>
                      <select {...F('branchType')}>
                        <option value="">Select type</option>
                        <option>Main Branch</option><option>Franchise</option>
                        <option>Clinic</option><option>Pharmacy</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Branch Name <span className="req">*</span></label>
                      <input {...F('branchName')} placeholder="e.g. Pharma One Velachery" />
                    </div>
                    <div className="form-group">
                      <label>Status <span className="req">*</span></label>
                      <select {...F('status')}><option>Active</option><option>Inactive</option></select>
                    </div>
                  </div>
                  <div className="form-grid form-grid-1">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea {...F('description')} placeholder="Brief description about this branch, services offered, etc." />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Branch Logo</label>
                    <div className="logo-upload">
                      <div className="upload-icon"><i className="fas fa-cloud-upload-alt" /></div>
                      <p>Click to upload branch logo</p>
                      <span>PNG, JPG up to 2MB · Recommended 200×200px</span>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label>Portal Login Password</label>
                    <input {...F('password')} type="password" placeholder="Branch portal login password" />
                  </div>
                </>
              )}

              {/* Section 2: Contact */}
              {tab === 1 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-phone" /></div>
                    <div><h4>Contact Information</h4><p>Primary and alternate contact details</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Contact Person <span className="req">*</span></label><input {...F('contactPerson')} placeholder="Full name" /></div>
                    <div className="form-group"><label>Mobile Number <span className="req">*</span></label>
                      <div className="input-prefix"><span className="pre-tag">+91</span><input {...F('mobileNumber')} placeholder="9876543210" /></div>
                    </div>
                    <div className="form-group"><label>Alternate Mobile</label>
                      <div className="input-prefix"><span className="pre-tag">+91</span><input {...F('alternateMobile')} placeholder="Optional" /></div>
                    </div>
                    <div className="form-group"><label>Landline Number</label><input {...F('landlineNumber')} placeholder="044-XXXXXXXX" /></div>
                    <div className="form-group"><label>Email Address <span className="req">*</span></label><input {...F('email')} type="email" placeholder="branch@pharmaone.in" /></div>
                    <div className="form-group"><label>Alternate Email</label><input {...F('alternateEmail')} type="email" placeholder="Optional" /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Website</label>
                      <div className="input-prefix"><span className="pre-tag">https://</span><input {...F('website')} placeholder="www.pharmaone.in" /></div>
                    </div>
                  </div>
                </>
              )}

              {/* Section 3: Address */}
              {tab === 2 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-map-marker-alt" /></div>
                    <div><h4>Address Information</h4><p>Physical location and map details</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Address Line 1 <span className="req">*</span></label><input {...F('addressLine1')} placeholder="Door No., Street Name" /></div>
                    <div className="form-group"><label>Address Line 2</label><input {...F('addressLine2')} placeholder="Landmark, Near…" /></div>
                    <div className="form-group"><label>Area / Locality</label><input {...F('area')} placeholder="Area name" /></div>
                    <div className="form-group"><label>City <span className="req">*</span></label><input {...F('city')} placeholder="e.g. Chennai" /></div>
                    <div className="form-group"><label>District</label><input {...F('district')} placeholder="e.g. Chennai" /></div>
                    <div className="form-group"><label>State <span className="req">*</span></label>
                      <select {...F('state')}>
                        <option value="">Select State</option>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Country</label><select {...F('country')}><option>India</option></select></div>
                    <div className="form-group"><label>Pincode <span className="req">*</span></label><input {...F('pincode')} placeholder="600042" maxLength={6} /></div>
                  </div>
                  <div className="form-grid form-grid-1">
                    <div className="form-group"><label>Google Map Link</label>
                      <div className="input-prefix"><span className="pre-tag"><i className="fas fa-map" /></span><input {...F('googleMapLink')} placeholder="https://maps.google.com/…" /></div>
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Latitude</label><input {...F('latitude')} placeholder="13.0827" /></div>
                    <div className="form-group"><label>Longitude</label><input {...F('longitude')} placeholder="80.2707" /></div>
                  </div>
                </>
              )}

              {/* Section 4: Operations */}
              {tab === 3 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-clock" /></div>
                    <div><h4>Operational Details</h4><p>Working hours and schedule</p></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Opening Time <span className="req">*</span></label><input {...F('openingTime')} type="time" /></div>
                    <div className="form-group"><label>Closing Time <span className="req">*</span></label><input {...F('closingTime')} type="time" /></div>
                    <div className="form-group"><label>Weekly Off Day</label>
                      <select {...F('weeklyOff')}><option>None</option><option>Sunday</option><option>Monday</option><option>Saturday</option></select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Working Days <span className="req">*</span></label>
                    <div className="days-selector">
                      {DAYS.map(d => (
                        <div key={d} className={`day-btn${form.workingDays.includes(d) ? ' selected' : ''}`} onClick={() => toggleDay(d)}>{d}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.emergencyService} onChange={e => set('emergencyService', e.target.checked)} />
                        <span className="toggle-slider" />
                      </label>
                      <span className="toggle-label">Emergency Service Available</span>
                    </div>
                    <div className="toggle-group">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.service24x7} onChange={e => set('service24x7', e.target.checked)} />
                        <span className="toggle-slider" />
                      </label>
                      <span className="toggle-label">24×7 Service Available</span>
                    </div>
                  </div>
                </>
              )}

              {/* Section 5: Facilities */}
              {tab === 4 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-hospital" /></div>
                    <div><h4>Facility Details</h4><p>Infrastructure and available services</p></div>
                  </div>
                  <div className="form-grid form-grid-3" style={{ marginBottom: 18 }}>
                    <div className="form-group"><label>Total Floors</label><input {...F('totalFloors')} type="number" placeholder="2" /></div>
                    <div className="form-group"><label>Total Cabins</label><input {...F('totalCabins')} type="number" placeholder="6" /></div>
                    <div className="form-group"><label>Consultation Rooms</label><input {...F('totalConsultationRooms')} type="number" placeholder="4" /></div>
                    <div className="form-group"><label>Total Doctors</label><input {...F('totalDoctors')} type="number" placeholder="8" /></div>
                    <div className="form-group"><label>Waiting Hall Capacity</label><input {...F('waitingHallCapacity')} type="number" placeholder="30" /></div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label>Available Services</label>
                  </div>
                  <div className="facility-grid">
                    {[
                      { k:'pharmacyAvailable',   icon:'fa-pills',         label:'Pharmacy' },
                      { k:'laboratoryAvailable', icon:'fa-flask',         label:'Laboratory' },
                      { k:'xrayAvailable',       icon:'fa-x-ray',         label:'X-Ray' },
                      { k:'scanAvailable',       icon:'fa-desktop',       label:'Scan / Ultrasound' },
                      { k:'otAvailable',         icon:'fa-procedures',    label:'Operation Theatre' },
                    ].map(({ k, icon, label }) => (
                      <div key={k} className={`facility-check${form[k] ? ' checked' : ''}`} onClick={() => set(k, !form[k])}>
                        <input type="checkbox" checked={!!form[k]} onChange={() => {}} />
                        <span className="fci"><i className={`fas ${icon}`} /></span>
                        <span>{label}</span>
                        {form[k] && <i className="fas fa-check" style={{ marginLeft:'auto', color:'var(--accent)', fontSize:12 }} />}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Section 6: Financial */}
              {tab === 5 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-rupee-sign" /></div>
                    <div><h4>Financial Details</h4><p>Tax information and banking</p></div>
                  </div>
                  <div className="form-grid form-grid-3">
                    <div className="form-group"><label>GST Number</label><input {...F('gstNumber')} placeholder="33ABCDE1234F1Z5" /></div>
                    <div className="form-group"><label>PAN Number</label><input {...F('panNumber')} /></div>
                    <div className="form-group"><label>Registration Number</label><input {...F('registrationNumber')} /></div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group"><label>Bank Name</label><input {...F('bankName')} /></div>
                    <div className="form-group"><label>Account Number</label><input {...F('accountNumber')} /></div>
                    <div className="form-group"><label>IFSC Code</label><input {...F('ifscCode')} /></div>
                    <div className="form-group"><label>UPI ID</label><input {...F('upiId')} /></div>
                  </div>
                </>
              )}

              {/* Section 7: Staff & Prefix */}
              {tab === 6 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-users" /></div>
                    <div><h4>Staff Info & Document Prefixes</h4><p>Configure document numbering for this branch</p></div>
                  </div>
                  <div className="info-box">
                    <i className="fas fa-info-circle" style={{ color:'var(--primary)', marginTop:1, flexShrink:0 }} />
                    <p>Document prefixes ensure all records from this branch are uniquely identified. Example: INV-CHN001-00001</p>
                  </div>
                  <div className="form-grid form-grid-3">
                    <div className="form-group"><label>Branch Prefix</label><input {...F('branchPrefix')} placeholder="CHN01" /></div>
                    <div className="form-group"><label>Invoice Prefix</label><input {...F('invoicePrefix')} placeholder="INV-CHN001" /></div>
                    <div className="form-group"><label>Patient Prefix</label><input {...F('patientPrefix')} placeholder="PAT-CHN001" /></div>
                    <div className="form-group"><label>Appointment Prefix</label><input {...F('appointmentPrefix')} placeholder="APT-" /></div>
                    <div className="form-group"><label>Estimation Prefix</label><input {...F('estimationPrefix')} placeholder="EST-" /></div>
                    <div className="form-group"><label>Default Currency</label>
                      <select {...F('defaultCurrency')}><option value="INR">INR – Indian Rupee</option><option value="USD">USD</option></select>
                    </div>
                  </div>
                  <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:9, padding:'12px 14px', marginTop:8 }}>
                    <p style={{ fontSize:11, color:'var(--text-light)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Preview</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {[form.invoicePrefix, form.patientPrefix, form.appointmentPrefix, form.estimationPrefix].filter(Boolean).map((p,i) => (
                        <span key={i} style={{ background:'#fff', border:'1.5px solid var(--primary-mid)', color:'var(--primary)', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:6, fontFamily:'var(--font-head)' }}>
                          {p}{form.branchCode || 'CODE'}-00001
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-grid form-grid-3" style={{ marginTop:16 }}>
                    <div className="form-group"><label>Receptionist Count</label><input {...F('receptionistCount')} type="number" /></div>
                    <div className="form-group"><label>Doctor Count</label><input {...F('doctorCount')} type="number" /></div>
                    <div className="form-group"><label>Staff Count</label><input {...F('staffCount')} type="number" /></div>
                  </div>
                </>
              )}

              {/* Section 8: Review */}
              {tab === 7 && (
                <>
                  <div className="fs-title">
                    <div className="fs-icon"><i className="fas fa-check-double" /></div>
                    <div><h4>Review & Confirm</h4><p>Verify all details before saving</p></div>
                  </div>
                  {[
                    { title:'Basic', rows:[['Branch Name',form.branchName],['Branch Code',form.branchCode],['Type',form.branchType],['Status',form.status]] },
                    { title:'Contact', rows:[['Contact Person',form.contactPerson],['Mobile',form.mobileNumber],['Email',form.email]] },
                    { title:'Address', rows:[['City',form.city],['State',form.state],['Pincode',form.pincode]] },
                    { title:'Operations', rows:[['Opening',form.openingTime],['Closing',form.closingTime],['Working Days',form.workingDays.join(', ')]] },
                    { title:'Financial', rows:[['GST No',form.gstNumber],['Bank',form.bankName]] },
                    { title:'Prefixes', rows:[['Invoice',form.invoicePrefix],['Patient',form.patientPrefix]] },
                  ].map(({ title, rows }) => (
                    <div key={title} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
                      <h5 style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', color:'var(--text-light)', marginBottom:8 }}>{title}</h5>
                      {rows.map(([k,v]) => (
                        <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                          <span style={{ fontSize:12, color:'var(--text-light)' }}>{k}</span>
                          <strong style={{ fontSize:12, color:'var(--text-dark)' }}>{v || '—'}</strong>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={() => tab > 0 ? setTab(tab-1) : setShowDrawer(false)}>
                <i className={`fas fa-${tab > 0 ? 'arrow-left' : 'times'}`} /> {tab > 0 ? 'Previous' : 'Cancel'}
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--text-light)' }}>Step {tab+1} of {TABS.length}</span>
                {tab < TABS.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setTab(tab+1)}>
                    Next <i className="fas fa-arrow-right" />
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={saveMut.isPending}>
                    {saveMut.isPending ? <><div className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Saving…</> : <><i className="fas fa-save" /> {editing ? 'Update Branch' : 'Save Branch'}</>}
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
            <h3>Delete Branch?</h3>
            <p>This action cannot be undone. All data for this branch will be permanently deleted.</p>
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
