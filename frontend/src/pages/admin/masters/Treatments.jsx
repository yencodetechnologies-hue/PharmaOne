import { useState, useMemo } from 'react'
import { useTreatments, useSaveTreatment, useDeleteTreatment } from '../../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../../components/common/UIComponents'
import '../../../styles/treatment.css'

const CATEGORIES = ['Consultation','Dental','Orthodontic','Implant','Root Canal','Cosmetic','Skin Care','Hair Treatment','Laser Treatment','Physiotherapy','Surgery','General Procedure']
const DEPARTMENTS = ['Dental','Skin Care','Hair Care','Physiotherapy','General Surgery','Cosmetology','Orthodontics']
const UNITS = ['Nos','ml','mg','g','Unit','Box','Pair']

const STEPS = [
  { num: 1, key: 'basic',       title: 'Basic Info',       sub: 'Treatment identity' },
  { num: 2, key: 'cost',        title: 'Cost & GST',       sub: 'Fees & taxation' },
  { num: 3, key: 'requirements',title: 'Requirements',     sub: 'Doctor, consent, photos' },
  { num: 4, key: 'materials',   title: 'Material Mapping', sub: 'Items consumed' },
  { num: 5, key: 'doctors',     title: 'Doctor Config',    sub: 'Fees & commission' },
  { num: 6, key: 'package',     title: 'Package',          sub: 'Bundle settings' },
  { num: 7, key: 'review',      title: 'Review',           sub: 'Confirm & save' },
]

const initForm = {
  treatmentCode:'', treatmentName:'', treatmentCategory:'', department:'', description:'',
  durationMinutes:'', numberOfSessions:1, treatmentCost:'', discountAllowed:true,
  gstApplicable:true, gstPercentage:18, doctorRequired:true, assistantRequired:false,
  materialRequired:false, consentFormRequired:false, beforePhotoRequired:false,
  afterPhotoRequired:false, followUpRequired:false, followUpDays:'', isActive:true,
  materials: [], doctorConfigs: [], includeInPackage: false, packageName: '',
}

const emptyMaterialRow = () => ({ materialName:'', qty:1, unit:'Nos', estCost:0 })
const emptyDoctorRow   = () => ({ doctorName:'', consultationFee:'', treatmentFee:'', commissionPercent:'' })

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Treatments() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [showDrawer, setShowDrawer] = useState(false)
  const [step, setStep] = useState(1)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = useTreatments()
  const saveMut = useSaveTreatment()
  const deleteMut = useDeleteTreatment()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const setVal = (k, v) => setForm({ ...form, [k]: v })

  const filtered = useMemo(() => data.filter(d => {
    const matchesSearch = `${d.treatmentName} ${d.treatmentCode}`.toLowerCase().includes(search.toLowerCase())
    const matchesCat = !categoryFilter || d.treatmentCategory === categoryFilter
    const matchesDept = !deptFilter || d.department === deptFilter
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? d.isActive : !d.isActive)
    return matchesSearch && matchesCat && matchesDept && matchesStatus
  }), [data, search, categoryFilter, deptFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(d => d.isActive).length
    const packages = data.filter(d => d.includeInPackage).length
    const doctorSet = new Set()
    data.forEach(d => (d.doctorConfigs || []).forEach(dc => dc.doctorName && doctorSet.add(dc.doctorName)))
    const avgRevenue = total ? Math.round(data.reduce((s, d) => s + (Number(d.treatmentCost) || 0), 0) / total) : 0
    return { total, active, packages, doctors: doctorSet.size, avgRevenue }
  }, [data])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...initForm, treatmentCode: `TRT-${String(data.length + 1).padStart(4, '0')}` })
    setStep(1)
    setShowDrawer(true)
  }
  const openEdit = r => {
    setEditing(r._id)
    setForm({ ...initForm, ...r })
    setStep(1)
    setShowDrawer(true)
  }
  const closeDrawer = () => { setShowDrawer(false); setEditing(null) }

  const handleSave = () => {
    saveMut.mutate({ id: editing, data: form }, { onSuccess: () => closeDrawer() })
  }

  const goNext = () => step < 7 ? setStep(step + 1) : handleSave()
  const goPrev = () => step > 1 && setStep(step - 1)

  const baseCost = Number(form.treatmentCost) || 0
  const gstAmount = form.gstApplicable ? Math.round(baseCost * (Number(form.gstPercentage) || 0) / 100) : 0
  const totalWithGst = baseCost + gstAmount
  const sessions = Number(form.numberOfSessions) || 1
  const perSessionCost = sessions ? Math.round(totalWithGst / sessions) : totalWithGst

  // ── materials helpers ──
  const updateMaterial = (idx, key, val) => {
    const next = [...form.materials]
    next[idx] = { ...next[idx], [key]: val }
    setVal('materials', next)
  }
  const addMaterialRow = () => setVal('materials', [...form.materials, emptyMaterialRow()])
  const removeMaterialRow = idx => setVal('materials', form.materials.filter((_, i) => i !== idx))

  // ── doctor config helpers ──
  const updateDoctor = (idx, key, val) => {
    const next = [...form.doctorConfigs]
    next[idx] = { ...next[idx], [key]: val }
    setVal('doctorConfigs', next)
  }
  const addDoctorRow = () => setVal('doctorConfigs', [...form.doctorConfigs, emptyDoctorRow()])
  const removeDoctorRow = idx => setVal('doctorConfigs', form.doctorConfigs.filter((_, i) => i !== idx))

  const stepDone = key => {
    const idx = STEPS.findIndex(s => s.key === key)
    return idx + 1 < step
  }

  return (
    <div className="tm-page">
      <div className="page-header">
        <div>
          <h2>Treatment Master</h2>
          <p>Procedures, treatments, packages with material mapping and doctor configuration</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><span>⬇</span> Export</button>
          <button className="btn btn-outline"><span>🗂</span> Packages</button>
          <button className="btn btn-primary" onClick={openCreate}><span>+</span> Add Treatment</button>
        </div>
      </div>

      <div className="stats-row tm-stats">
        <div className="stat-card accent-red">
          <div className="stat-icon red">🩺</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Treatments</div>
            <div className="stat-sub">{stats.active} Active</div>
          </div>
        </div>
        <div className="stat-card accent-purple">
          <div className="stat-icon purple">🗂</div>
          <div>
            <div className="stat-value">{stats.packages}</div>
            <div className="stat-label">Treatment Packages</div>
            <div className="stat-sub">Bundled procedures</div>
          </div>
        </div>
        <div className="stat-card accent-blue">
          <div className="stat-icon blue">👤</div>
          <div>
            <div className="stat-value">{stats.doctors}</div>
            <div className="stat-label">Doctor Assigned</div>
            <div className="stat-sub">Across treatments</div>
          </div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-icon green">₨</div>
          <div>
            <div className="stat-value">₹{(stats.avgRevenue / 100000).toFixed(1)}L</div>
            <div className="stat-label">Avg Monthly Revenue</div>
            <div className="stat-sub">From all treatments</div>
          </div>
        </div>
      </div>

      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si">🔍</span>
            <input placeholder="Search treatment name, code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="list-count">Showing <strong>{paged.length}</strong> of {filtered.length}</div>
          <div className="view-tabs">
            <button className={`view-tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>☰ List</button>
            <button className={`view-tab ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>▦ Cards</button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🩺</div><h3>No treatments found</h3><p>Try adjusting your search or filters</p></div>
        ) : viewMode === 'list' ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Treatment</th>
                  <th>Category</th>
                  <th>Dept.</th>
                  <th>Duration</th>
                  <th>Sessions</th>
                  <th>Cost</th>
                  <th>GST%</th>
                  <th>Total</th>
                  <th>Requirements</th>
                  <th>Follow-up</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(r => {
                  const total = Math.round((Number(r.treatmentCost) || 0) * (1 + (r.gstApplicable ? (Number(r.gstPercentage) || 0) / 100 : 0)))
                  return (
                    <tr key={r._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          <div className="entity-logo">{initials(r.treatmentName)}</div>
                          <div>
                            <strong>{r.treatmentName}</strong>
                            <small>{r.description ? r.description.slice(0, 28) : '—'} <span className="tm-code">{r.treatmentCode}</span></small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-red">{r.treatmentCategory || '—'}</span></td>
                      <td>{r.department || '—'}</td>
                      <td>{r.durationMinutes ? `${r.durationMinutes} min` : '—'}</td>
                      <td><strong>{r.numberOfSessions || 1}</strong></td>
                      <td>₹{Number(r.treatmentCost || 0).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-purple">{r.gstApplicable ? `${r.gstPercentage}%` : 'N/A'}</span></td>
                      <td className="tm-total">₹{total.toLocaleString('en-IN')}</td>
                      <td>
                        <div className="req-icons">
                          {r.doctorRequired && <span className="req-icon green" title="Doctor Required">👤</span>}
                          {r.materialRequired && <span className="req-icon green" title="Material Required">🧪</span>}
                          {r.consentFormRequired && <span className="req-icon green" title="Consent Required">📋</span>}
                          {r.assistantRequired && <span className="req-icon green" title="Assistant Required">🧑‍⚕️</span>}
                        </div>
                      </td>
                      <td>{r.followUpRequired ? <span className="badge badge-blue">{r.followUpDays} days</span> : <span className="tm-muted">None</span>}</td>
                      <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="View">👁</button>
                          <button className="act-btn" title="Edit" onClick={() => openEdit(r)}>✏️</button>
                          <button className="act-btn purple" title="Package">🗂</button>
                          <button className="act-btn green" title="Assign Doctor">👤</button>
                          <button className="act-btn danger" title="Delete" onClick={() => setDeleteId(r._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tm-cards-grid">
            {paged.map(r => (
              <div key={r._id} className="tm-card">
                <div className="tm-card-head">
                  <div className="entity-logo">{initials(r.treatmentName)}</div>
                  <span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <strong>{r.treatmentName}</strong>
                <small>{r.treatmentCode} · {r.department}</small>
                <div className="tm-card-row"><span>Cost</span><span>₹{Number(r.treatmentCost || 0).toLocaleString('en-IN')}</span></div>
                <div className="tm-card-row"><span>Sessions</span><span>{r.numberOfSessions || 1}</span></div>
                <div className="action-btns">
                  <button className="act-btn" onClick={() => openEdit(r)}>✏️</button>
                  <button className="act-btn danger" onClick={() => setDeleteId(r._id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="table-pagination">
            <div className="pagination-info">Page {page} of {totalPages}</div>
            <div className="pagination-btns">
              <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <button key={i} className={`pg-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showDrawer && (
        <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && closeDrawer()}>
          <div className="drawer drawer-wide">
            <div className="drawer-header">
              <div className="dh-icon">🩺</div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Treatment' : 'Add New Treatment'}</h3>
                <p>Procedure · Material Mapping · Doctor Config · Package</p>
              </div>
              <span className="dh-badge">{step === 7 ? 'Review' : `Step ${step} / 6`}</span>
              <button className="drawer-close" onClick={closeDrawer}>×</button>
            </div>

            <div className="drawer-body-wrap">
              <div className="drawer-steps">
                {STEPS.map(s => (
                  <div
                    key={s.key}
                    className={`step-nav-item ${step === s.num ? 'active' : ''} ${stepDone(s.key) ? 'done' : ''} ${s.key === 'review' ? 'review-step' : ''}`}
                    onClick={() => setStep(s.num)}
                  >
                    <div className="step-num">{stepDone(s.key) ? '✓' : s.num}</div>
                    <div className="step-nav-text">
                      <strong>{s.title}</strong>
                      <span>{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="drawer-content">
                {step === 1 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">🩺</div>
                      <div>
                        <h4>Basic Information</h4>
                        <p>Treatment identity and classification</p>
                      </div>
                    </div>

                    <div className="tm-preview-banner">
                      <div className="entity-logo">{initials(form.treatmentName) || '🦷'}</div>
                      <div className="tm-preview-text">
                        <strong>{form.treatmentName || 'Treatment Name'}</strong>
                        <span>{form.treatmentCategory || 'Category'} · {form.department || 'Department'}</span>
                      </div>
                      <span className="tm-code-pill">{form.treatmentCode || 'TRT-0000'}</span>
                      <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>{form.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div className="form-grid form-grid-3">
                      <div className="form-group">
                        <label>Treatment ID</label>
                        <input readOnly value={form.treatmentCode || 'TRT-0000'} />
                      </div>
                      <div className="form-group">
                        <label>Treatment Code <span className="req">*</span></label>
                        <input placeholder="e.g. TRT-RCT-001" {...F('treatmentCode')} />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select value={form.isActive ? 'true' : 'false'} onChange={e => setVal('isActive', e.target.value === 'true')}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Treatment Name <span className="req">*</span></label>
                        <input placeholder="e.g. Root Canal Treatment" {...F('treatmentName')} />
                      </div>
                      <div className="form-group">
                        <label>Treatment Category <span className="req">*</span></label>
                        <select {...F('treatmentCategory')}>
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Department <span className="req">*</span></label>
                        <select {...F('department')}>
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Duration (Minutes)</label>
                        <input type="number" placeholder="e.g. 60" {...F('durationMinutes')} />
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Number of Sessions</label>
                        <input type="number" min="1" placeholder="e.g. 3" {...F('numberOfSessions')} />
                      </div>
                    </div>

                    <div className="form-grid form-grid-1">
                      <div className="form-group">
                        <label>Description</label>
                        <textarea rows={3} placeholder="Detailed description of the treatment procedure" {...F('description')} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">₨</div>
                      <div>
                        <h4>Cost & GST</h4>
                        <p>Treatment pricing and tax configuration</p>
                      </div>
                    </div>

                    <div className="form-grid form-grid-3">
                      <div className="form-group">
                        <label>Treatment Cost <span className="req">*</span></label>
                        <div className="input-prefix">
                          <span className="pre-tag">₹</span>
                          <input type="number" placeholder="0" {...F('treatmentCost')} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>GST % <span className="req">*</span></label>
                        <select value={form.gstPercentage} onChange={e => setVal('gstPercentage', e.target.value)}>
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Total Cost with GST</label>
                        <div className="input-prefix">
                          <span className="pre-tag">₹</span>
                          <input readOnly value={totalWithGst} />
                        </div>
                      </div>
                    </div>

                    <div className="form-grid form-grid-2">
                      <div className="form-group">
                        <label>Discount Allowed</label>
                        <select value={form.discountAllowed ? 'true' : 'false'} onChange={e => setVal('discountAllowed', e.target.value === 'true')}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>GST Applicable</label>
                        <select value={form.gstApplicable ? 'true' : 'false'} onChange={e => setVal('gstApplicable', e.target.value === 'true')}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>

                    <div className="tm-cost-summary">
                      <div className="tm-cost-row"><span>Base Treatment Cost</span><strong>₹{baseCost.toLocaleString('en-IN')}</strong></div>
                      <div className="tm-cost-row"><span>GST Amount ({form.gstApplicable ? form.gstPercentage : 0}%)</span><strong>₹{gstAmount.toLocaleString('en-IN')}</strong></div>
                      <div className="tm-cost-row total"><span>Per Session Cost (÷ {sessions} sessions)</span><strong>₹{perSessionCost.toLocaleString('en-IN')}</strong></div>
                      <div className="tm-cost-row total"><span>Total Cost (incl. GST)</span><strong>₹{totalWithGst.toLocaleString('en-IN')}</strong></div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">✅</div>
                      <div>
                        <h4>Treatment Requirements</h4>
                        <p>Doctor, assistant, consent, photo requirements</p>
                      </div>
                    </div>

                    <div className="tm-toggle-grid">
                      <ToggleRow label="Doctor Required" icon="👤" checked={form.doctorRequired} onChange={v => setVal('doctorRequired', v)} />
                      <ToggleRow label="Assistant Required" icon="🧑‍⚕️" checked={form.assistantRequired} onChange={v => setVal('assistantRequired', v)} />
                      <ToggleRow label="Material Required" icon="🧪" checked={form.materialRequired} onChange={v => setVal('materialRequired', v)} />
                      <ToggleRow label="Consent Form Required" icon="📋" checked={form.consentFormRequired} onChange={v => setVal('consentFormRequired', v)} />
                      <ToggleRow label="Before Photo Required" icon="📷" checked={form.beforePhotoRequired} onChange={v => setVal('beforePhotoRequired', v)} />
                      <ToggleRow label="After Photo Required" icon="📷" checked={form.afterPhotoRequired} onChange={v => setVal('afterPhotoRequired', v)} />
                    </div>

                    <div className="form-grid form-grid-2" style={{ marginTop: 16 }}>
                      <div className="form-group">
                        <label>Follow-up Required</label>
                        <select value={form.followUpRequired ? 'true' : 'false'} onChange={e => setVal('followUpRequired', e.target.value === 'true')}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Follow-up Days</label>
                        <input type="number" placeholder="e.g. 7" disabled={!form.followUpRequired} {...F('followUpDays')} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">🧬</div>
                      <div>
                        <h4>Treatment Material Mapping</h4>
                        <p>Materials and consumables used per session</p>
                      </div>
                    </div>

                    <div className="info-box">
                      <span>ℹ️</span>
                      <p>Add all materials consumed during this treatment. Stock will be automatically deducted when a session is recorded.</p>
                    </div>

                    <div className="tm-material-table">
                      <div className="tm-material-head">
                        <span>#</span><span>Material Name</span><span>Qty</span><span>Unit</span><span>Est. Cost (₹)</span><span></span>
                      </div>
                      {form.materials.length === 0 && (
                        <div className="tm-material-row">
                          <span>1</span>
                          <input placeholder="e.g. File Kit, Cement" disabled />
                          <input value="" disabled />
                          <select disabled><option>Nos</option></select>
                          <input value="0" disabled />
                          <span></span>
                        </div>
                      )}
                      {form.materials.map((m, idx) => (
                        <div className="tm-material-row" key={idx}>
                          <span>{idx + 1}</span>
                          <input placeholder="Material name" value={m.materialName} onChange={e => updateMaterial(idx, 'materialName', e.target.value)} />
                          <input type="number" value={m.qty} onChange={e => updateMaterial(idx, 'qty', e.target.value)} />
                          <select value={m.unit} onChange={e => updateMaterial(idx, 'unit', e.target.value)}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <input type="number" value={m.estCost} onChange={e => updateMaterial(idx, 'estCost', e.target.value)} />
                          <span className="tm-remove" onClick={() => removeMaterialRow(idx)}>✕</span>
                        </div>
                      ))}
                      <button type="button" className="tm-add-row" onClick={addMaterialRow}>+ Add Material Row</button>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">👤</div>
                      <div>
                        <h4>Doctor Configuration</h4>
                        <p>Assign doctors with consultation fees and commission</p>
                      </div>
                    </div>

                    <div className="info-box danger">
                      <span>❗</span>
                      <p>Configure which doctors can perform this treatment and set their specific fees and revenue sharing percentages.</p>
                    </div>

                    <div className="tm-doctor-table">
                      <div className="tm-doctor-head">
                        <span>Doctor</span><span>Consultation Fee (₹)</span><span>Treatment Fee (₹)</span><span>Commission %</span><span>Remove</span>
                      </div>
                      {form.doctorConfigs.length === 0 && (
                        <div className="tm-doctor-row">
                          <select disabled><option>Select Doctor</option></select>
                          <input disabled value="" />
                          <input disabled value="" />
                          <input disabled value="" />
                          <span></span>
                        </div>
                      )}
                      {form.doctorConfigs.map((d, idx) => (
                        <div className="tm-doctor-row" key={idx}>
                          <input placeholder="Doctor name" value={d.doctorName} onChange={e => updateDoctor(idx, 'doctorName', e.target.value)} />
                          <input type="number" value={d.consultationFee} onChange={e => updateDoctor(idx, 'consultationFee', e.target.value)} />
                          <input type="number" value={d.treatmentFee} onChange={e => updateDoctor(idx, 'treatmentFee', e.target.value)} />
                          <input type="number" value={d.commissionPercent} onChange={e => updateDoctor(idx, 'commissionPercent', e.target.value)} />
                          <span className="tm-remove" onClick={() => removeDoctorRow(idx)}>✕</span>
                        </div>
                      ))}
                      <button type="button" className="tm-add-row" onClick={addDoctorRow}>+ Add Doctor</button>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">🗂</div>
                      <div>
                        <h4>Treatment Package <span className="tm-optional">(Optional)</span></h4>
                        <p>Bundle this treatment into a patient-facing package</p>
                      </div>
                    </div>

                    <ToggleRow
                      label="Include in a Treatment Package"
                      icon="🗂"
                      checked={form.includeInPackage}
                      onChange={v => setVal('includeInPackage', v)}
                      full
                    />

                    {form.includeInPackage && (
                      <div className="form-grid form-grid-1" style={{ marginTop: 16 }}>
                        <div className="form-group">
                          <label>Package Name</label>
                          <input placeholder="e.g. Complete Smile Makeover" {...F('packageName')} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 7 && (
                  <div className="fs-block">
                    <div className="fs-title">
                      <div className="fs-icon">✅</div>
                      <div>
                        <h4>Review & Confirm</h4>
                        <p>Verify all treatment details before saving</p>
                      </div>
                    </div>

                    <div className="tm-preview-banner">
                      <div className="entity-logo">{initials(form.treatmentName) || '🦷'}</div>
                      <div className="tm-preview-text">
                        <strong>{form.treatmentName || '—'}</strong>
                        <span>{form.treatmentCategory || 'Category'} · {form.department || 'Department'}</span>
                      </div>
                      <span className="tm-code-pill">{form.treatmentCode || 'TRT-0000'}</span>
                      <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>{form.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div className="tm-review-section">
                      <div className="tm-review-title">🩺 TREATMENT INFO</div>
                      <div className="tm-review-grid">
                        <ReviewItem label="Treatment ID" value={form.treatmentCode} accent />
                        <ReviewItem label="Name" value={form.treatmentName} />
                        <ReviewItem label="Category" value={form.treatmentCategory} />
                        <ReviewItem label="Department" value={form.department} />
                        <ReviewItem label="Sessions" value={form.numberOfSessions} />
                        <ReviewItem label="Status" value={form.isActive ? 'Active' : 'Inactive'} status={form.isActive} />
                      </div>
                    </div>

                    <div className="tm-review-section">
                      <div className="tm-review-title">₨ COST & GST</div>
                      <div className="tm-review-grid">
                        <ReviewItem label="Base Cost" value={`₹${baseCost.toLocaleString('en-IN')}`} />
                        <ReviewItem label="GST %" value={`${form.gstApplicable ? form.gstPercentage : 0}%`} />
                        <ReviewItem label="Total (incl. GST)" value={`₹${totalWithGst.toLocaleString('en-IN')}`} />
                      </div>
                    </div>

                    <div className="tm-review-section">
                      <div className="tm-review-title">✅ REQUIREMENTS</div>
                      <div className="tm-review-grid">
                        <ReviewItem label="Doctor Required" value={form.doctorRequired ? 'Yes' : 'No'} status={form.doctorRequired} />
                        <ReviewItem label="Material Required" value={form.materialRequired ? 'Yes' : 'No'} status={form.materialRequired} />
                        <ReviewItem label="Consent Required" value={form.consentFormRequired ? 'Yes' : 'No'} status={form.consentFormRequired} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={closeDrawer}>✕ Cancel</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="tm-progress-dots">
                  {STEPS.map(s => (
                    <span key={s.key} className={`tm-dot ${s.num === step ? 'active' : s.num < step ? 'done' : ''}`} />
                  ))}
                </div>
                {step > 1 && <button className="btn btn-outline" onClick={goPrev}>← Previous</button>}
                {step < 7 ? (
                  <button className="btn btn-primary" onClick={goNext}>Next →</button>
                ) : (
                  <button className="btn btn-success" onClick={handleSave} disabled={saveMut.isPending}>
                    {saveMut.isPending ? '⏳ Saving...' : `📋 ${editing ? 'Update Treatment' : 'Add Treatment'}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

function ToggleRow({ label, icon, checked, onChange, full }) {
  return (
    <div className={`tm-toggle-row ${full ? 'full' : ''}`}>
      <span className="tm-toggle-icon">{icon}</span>
      <span className="tm-toggle-label">{label}</span>
      <label className="toggle-switch">
        <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

function ReviewItem({ label, value, accent, status }) {
  return (
    <div className="tm-review-item">
      <span className="tm-review-label">{label}</span>
      <span className={`tm-review-value ${accent ? 'accent' : ''} ${status === true ? 'success' : status === false ? 'muted' : ''}`}>
        {status === true ? `✓ ${value}` : (value || '—')}
      </span>
    </div>
  )
}