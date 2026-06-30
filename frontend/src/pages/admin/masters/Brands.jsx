import { useState, useMemo } from 'react'
import { useBrands, useSaveBrand, useDeleteBrand } from '../../../hooks/useAdminMutations'
import { ConfirmModal } from '../../../components/common/UIComponents'
import '../../../styles/brand.css'

const BRAND_TYPES = ['Medicine', 'Medical Equipment', 'Consumable', 'Procedure Material']
const COUNTRIES = ['India', 'USA', 'Germany', 'Switzerland', 'Japan', 'China', 'UK']
const GST_OPTIONS = ['0', '5', '12', '18', '28']

const TYPE_META = {
  Medicine:            { color: '#0D6EAC', bg: '#E8F4FD' },
  'Medical Equipment': { color: '#F39C12', bg: '#FEF9EC' },
  Consumable:          { color: '#00B894', bg: '#E0F7F2' },
  'Procedure Material':{ color: '#8E44AD', bg: '#F3EAF9' },
}

const AVATAR_PALETTE = ['#0D6EAC', '#F39C12', '#00B894', '#8E44AD', '#E74C3C', '#3F51B5', '#E91E63', '#17A2B8']

const initForm = {
  brandCode: '', brandName: '', brandShortName: '', brandType: '', displayOrder: 1,
  manufacturer: '', companyName: '', vendor: '', countryOfOrigin: 'India',
  contactPerson: '', mobileNumber: '', email: '', website: '',
  gstApplicable: true, gstPercentage: '', defaultMarginPercent: 20, commissionPercent: 5,
  description: '', remarks: '', isActive: true,
}

function initials(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[Math.abs(hash)] || AVATAR_PALETTE[0]
}

function nowFormatted() {
  const d = new Date()
  const date = d.toLocaleDateString('en-GB').split('/').reverse().join('-')
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date}  ${time}`
}

export default function Brands() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = useBrands()
  const saveMut = useSaveBrand()
  const deleteMut = useDeleteBrand()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const setVal = (k, v) => setForm({ ...form, [k]: v })

  const filtered = useMemo(() => data.filter(d => {
    const matchesSearch = `${d.brandName} ${d.brandCode}`.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || d.brandType === typeFilter
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? d.isActive : !d.isActive)
    return matchesSearch && matchesType && matchesStatus
  }), [data, search, typeFilter, statusFilter])

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(d => d.isActive).length
    const medicine = data.filter(d => d.brandType === 'Medicine').length
    const equipment = data.filter(d => d.brandType === 'Medical Equipment').length
    return { total, active, medicine, equipment }
  }, [data])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...initForm, brandCode: `BR-${String(data.length + 1).padStart(4, '0')}` })
    setShowDrawer(true)
  }
  const openEdit = r => { setEditing(r._id); setForm({ ...initForm, ...r }); setShowDrawer(true) }
  const closeDrawer = () => { setShowDrawer(false); setEditing(null) }
  const handleSave = () => saveMut.mutate({ id: editing, data: form }, { onSuccess: () => closeDrawer() })

  return (
    <div className="bm-page">
      <div className="page-header">
        <div>
          <h2>Brand Master</h2>
          <p>Manage pharmaceutical and medical equipment brands with manufacturer details</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><span>⬇</span> Export</button>
          <button className="btn btn-primary-green" onClick={openCreate}><span>+</span> Add Brand</button>
        </div>
      </div>

      <div className="bm-stats-row">
        <div className="bm-stat-card">
          <div className="bm-stat-icon blue-text">TM</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Brands</div>
          </div>
        </div>
        <div className="bm-stat-card">
          <div className="bm-stat-icon green">✓</div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Brands</div>
          </div>
        </div>
        <div className="bm-stat-card">
          <div className="bm-stat-icon blue">💊</div>
          <div>
            <div className="stat-value">{stats.medicine}</div>
            <div className="stat-label">Medicine Brands</div>
          </div>
        </div>
        <div className="bm-stat-card">
          <div className="bm-stat-icon orange">⚕</div>
          <div>
            <div className="stat-value">{stats.equipment}</div>
            <div className="stat-label">Equipment Brands</div>
          </div>
        </div>
      </div>

      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si">🔍</span>
            <input placeholder="Search brand name, code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {BRAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="list-count">Showing <strong>{Math.min(6, filtered.length)}</strong> of {filtered.length}</div>
        </div>

        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏷️</div><h3>No brands found</h3><p>Try adjusting your search or filters</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Manufacturer</th>
                  <th>Vendor</th>
                  <th>Country</th>
                  <th>GST %</th>
                  <th>Margin %</th>
                  <th>Commission %</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const meta = TYPE_META[r.brandType] || { color: '#0D6EAC', bg: '#E8F4FD' }
                  return (
                    <tr key={r._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          <div className="bm-avatar" style={{ background: avatarColor(r.brandName) }}>{initials(r.brandName)}</div>
                          <div>
                            <strong>{r.brandName}</strong>
                            <small>{r.manufacturer || '—'} <span className="bm-code-chip">{r.brandCode}</span></small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge" style={{ color: meta.color, background: meta.bg }}>{r.brandType || '—'}</span></td>
                      <td>{r.manufacturer || '—'}</td>
                      <td>{r.vendorName || '—'}</td>
                      <td><span className="bm-country">{(r.countryOfOrigin || 'IN').slice(0, 2).toUpperCase()} {r.countryOfOrigin || '—'}</span></td>
                      <td>{r.gstPercentage != null && r.gstPercentage !== '' ? <span className="badge badge-purple">{r.gstPercentage}%</span> : <span className="badge badge-orange">{r.gstPercentage}%</span>}</td>
                      <td className="bm-margin">{r.defaultMarginPercent != null ? `${r.defaultMarginPercent}%` : '—'}</td>
                      <td>{r.commissionPercent != null ? `${r.commissionPercent}%` : '—'}</td>
                      <td><strong>{r.displayOrder || 1}</strong></td>
                      <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="View">👁</button>
                          <button className="act-btn" title="Edit" onClick={() => openEdit(r)}>✏️</button>
                          <button className="act-btn danger" title="Delete" onClick={() => setDeleteId(r._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDrawer && (
        <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && closeDrawer()}>
          <div className="drawer bm-drawer">
            <div className="drawer-header bm-drawer-header">
              <div className="dh-icon">🏷</div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Brand' : 'Add New Brand'}</h3>
                <p>Medicine · Medical Equipment · Consumable · Procedure Material</p>
              </div>
              <button className="drawer-close" onClick={closeDrawer}>×</button>
            </div>

            <div className="drawer-content bm-drawer-content">
              <div className="bm-preview-banner">
                <div className="bm-avatar lg" style={{ background: avatarColor(form.brandName) }}>{initials(form.brandName) || 'B'}</div>
                <div className="bm-preview-text">
                  <strong>{form.brandName || 'Brand Name'}</strong>
                  <span>{form.manufacturer || 'Manufacturer'} · {form.countryOfOrigin || 'Country'}</span>
                </div>
                <span className="bm-code-pill">{form.brandCode || 'BR-0000'}</span>
                <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="fs-title">
                <div className="fs-icon">ℹ️</div>
                <div><h4>Basic Information</h4></div>
              </div>

              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>Brand ID</label>
                  <input readOnly value={form.brandCode || 'BR-0000'} />
                </div>
                <div className="form-group">
                  <label>Brand Code <span className="req">*</span></label>
                  <input placeholder="e.g. BR037" {...F('brandCode')} />
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
                  <label>Brand Name <span className="req">*</span></label>
                  <input placeholder="e.g. Cipla" {...F('brandName')} />
                </div>
                <div className="form-group">
                  <label>Brand Short Name</label>
                  <input placeholder="e.g. CIPL" {...F('brandShortName')} />
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Brand Type <span className="req">*</span></label>
                  <select {...F('brandType')}>
                    <option value="">Select Type</option>
                    {BRAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" placeholder="1" {...F('displayOrder')} />
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">🏢</div>
                <div><h4>Company Information</h4></div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Manufacturer Name <span className="req">*</span></label>
                  <input placeholder="Manufacturing company name" {...F('manufacturer')} />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input placeholder="Parent company name" {...F('companyName')} />
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Vendor Name</label>
                  <select {...F('vendor')}>
                    <option value="">Select Vendor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Country of Origin</label>
                  <select {...F('countryOfOrigin')}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">📞</div>
                <div><h4>Contact Information</h4></div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input placeholder="Brand representative" {...F('contactPerson')} />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="input-prefix">
                    <span className="pre-tag">+91</span>
                    <input placeholder="9876543210" {...F('mobileNumber')} />
                  </div>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Email</label>
                  <input placeholder="brand@company.com" {...F('email')} />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <div className="input-prefix">
                    <span className="pre-tag">https://</span>
                    <input placeholder="www.brand.com" {...F('website')} />
                  </div>
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">₨</div>
                <div><h4>Financial Information</h4></div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>GST Applicable</label>
                  <select value={form.gstApplicable ? 'true' : 'false'} onChange={e => setVal('gstApplicable', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>GST Percentage</label>
                  <select value={form.gstPercentage} onChange={e => setVal('gstPercentage', e.target.value)}>
                    <option value="">Select</option>
                    {GST_OPTIONS.map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Default Margin %</label>
                  <div className="input-prefix">
                    <span className="pre-tag">%</span>
                    <input type="number" placeholder="20" {...F('defaultMarginPercent')} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Commission %</label>
                  <div className="input-prefix">
                    <span className="pre-tag">%</span>
                    <input type="number" placeholder="5" {...F('commissionPercent')} />
                  </div>
                </div>
              </div>

              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Brand Description</label>
                  <textarea rows={3} placeholder="Brief description about the brand..." {...F('description')} />
                </div>
              </div>

              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Notes / Remarks</label>
                  <textarea rows={2} placeholder="Internal notes..." {...F('remarks')} />
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">⚙️</div>
                <div><h4>Audit (Auto)</h4></div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Created By</label>
                  <input readOnly placeholder="Admin User" value={form.createdBy || ''} />
                </div>
                <div className="form-group">
                  <label>Created Date</label>
                  <input readOnly value={editing ? (form.createdDate || nowFormatted()) : nowFormatted()} />
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Modified By</label>
                  <input readOnly placeholder="—" value={form.modifiedBy || ''} />
                </div>
                <div className="form-group">
                  <label>Modified Date</label>
                  <input readOnly placeholder="—" value={form.modifiedDate || ''} />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={closeDrawer}>✕ Cancel</button>
              <button className="btn btn-primary-green" onClick={handleSave} disabled={saveMut.isPending}>
                {saveMut.isPending ? '⏳ Saving...' : `💾 ${editing ? 'Update Brand' : 'Save Brand'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}