import { useState, useMemo } from 'react'
import { useCategories, useSaveCategory, useDeleteCategory } from '../../../hooks/useAdminMutations'
import { ConfirmModal } from '../../../components/common/UIComponents'
import '../../../styles/categories.css'

const CATEGORY_TYPES = ['Medicine', 'Treatment', 'Procedure', 'Material', 'Service', 'Lab Test', 'Income', 'Expense']
const BRANCHES = ['Chennai – Velachery', 'Chennai – Anna Nagar', 'Coimbatore – RS Puram']
const GST_OPTIONS = ['0', '5', '12', '18', '28']

const TYPE_META = {
  Medicine:  { icon: '💊', color: '#E74C3C', bg: '#FDECEC' },
  Treatment: { icon: '🩹', color: '#E74C3C', bg: '#FDECEC' },
  Procedure: { icon: '⚙️', color: '#8E44AD', bg: '#F3EAF9' },
  Material:  { icon: '📦', color: '#0D6EAC', bg: '#E8F4FD' },
  Service:   { icon: '🗃️', color: '#F39C12', bg: '#FEF9EC' },
  'Lab Test':{ icon: '🔬', color: '#8E44AD', bg: '#F3EAF9' },
  Income:    { icon: '💰', color: '#00B894', bg: '#E0F7F2' },
  Expense:   { icon: '📤', color: '#E74C3C', bg: '#FDECEC' },
}

const ICONS = ['💊','🦴','🩺','🏪','🧪','🩹','🩸','💉','🧴','🩼','📋','📦','💰','🩻','✨','⚙️']
const COLORS = ['#0D6EAC','#E91E63','#8E44AD','#00B894','#F39C12','#17A2B8','#E74C3C','#27AE60','#3F51B5','#E67E22']

const initForm = {
  categoryCode: '', categoryName: '', categoryType: '', parentCategory: '', branch: '',
  displayOrder: 1, description: '', gstPercentage: '', hsnCode: '', isTaxable: true,
  icon: ICONS[0], color: COLORS[0], categoryImage: '', remarks: '', isActive: true,
}

function nowFormatted() {
  const d = new Date()
  const date = d.toLocaleDateString('en-GB').split('/').reverse().join('-')
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date}  ${time}`
}

export default function Categories() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTypeCard, setActiveTypeCard] = useState('')

  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = useCategories()
  const saveMut = useSaveCategory()
  const deleteMut = useDeleteCategory()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const setVal = (k, v) => setForm({ ...form, [k]: v })

  const filtered = useMemo(() => data.filter(d => {
    const matchesSearch = `${d.categoryName} ${d.categoryCode}`.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter && !activeTypeCard ? true : (d.categoryType === (typeFilter || activeTypeCard))
    const matchesBranchName = !branchFilter || d.branchName === branchFilter
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? d.isActive : !d.isActive)
    return matchesSearch && matchesType && matchesBranchName && matchesStatus
  }), [data, search, typeFilter, branchFilter, statusFilter, activeTypeCard])

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(d => d.isActive).length
    const byType = {}
    CATEGORY_TYPES.forEach(t => { byType[t] = data.filter(d => d.categoryType === t) })
    return { total, active, byType }
  }, [data])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...initForm, categoryCode: `CAT-${String(data.length + 1).padStart(3, '0')}` })
    setShowDrawer(true)
  }
  const openEdit = r => { setEditing(r._id); setForm({ ...initForm, ...r }); setShowDrawer(true) }
  const closeDrawer = () => { setShowDrawer(false); setEditing(null) }
  const handleSave = () => saveMut.mutate({ id: editing, data: form }, { onSuccess: () => closeDrawer() })

  const toggleTypeCard = type => setActiveTypeCard(prev => prev === type ? '' : type)

  return (
    <div className="cm-page">
      <div className="page-header">
        <div>
          <h2>Category Master</h2>
          <p>Organise medicines, treatments, procedures, inventory and services into structured categories</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><span>⬇</span> Export</button>
          <button className="btn btn-outline"><span>🖨</span> Print</button>
          <button className="btn btn-primary-blue" onClick={openCreate}><span>+</span> Add Category</button>
        </div>
      </div>

      <div className="cm-stats-row">
        <div className="cm-stat-card">
          <div className="cm-stat-icon blue">🏷</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Categories</div>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon green">✓</div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Categories</div>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon purple">💊</div>
          <div>
            <div className="stat-value">{stats.byType['Medicine']?.length || 0}</div>
            <div className="stat-label">Medicine Categories</div>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon red">🩺</div>
          <div>
            <div className="stat-value">{stats.byType['Treatment']?.length || 0}</div>
            <div className="stat-label">Treatment Categories</div>
          </div>
        </div>
      </div>

      <div className="cm-type-grid">
        {CATEGORY_TYPES.map(type => {
          const meta = TYPE_META[type]
          const items = stats.byType[type] || []
          const activeCount = items.filter(i => i.isActive).length
          return (
            <div
              key={type}
              className={`cm-type-card ${activeTypeCard === type ? 'selected' : ''}`}
              style={{ '--type-color': meta.color }}
              onClick={() => toggleTypeCard(type)}
            >
              <div className="cm-type-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
              <strong>{type}</strong>
              <span className="cm-type-sub">{items.length} subcategories</span>
              <div className="cm-type-foot">
                <span className="cm-type-count">{items.reduce((s, i) => s + (i.itemCount || 0), 0) || items.length} items</span>
                <span className="badge badge-green">Active</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si">🔍</span>
            <input placeholder="Search category name, code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setActiveTypeCard('') }}>
            <option value="">All Types</option>
            {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="list-count">Showing <strong>{Math.min(8, filtered.length)}</strong> of {filtered.length}</div>
        </div>

        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏷️</div><h3>No categories found</h3><p>Try adjusting your search or filters</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Category</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Parent</th>
                  <th>GST%</th>
                  <th>HSN Code</th>
                  <th>Taxable</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const meta = TYPE_META[r.categoryType] || { icon: '🏷', color: '#0D6EAC', bg: '#E8F4FD' }
                  return (
                    <tr key={r._id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="entity-cell">
                          <div className="cm-row-icon" style={{ background: meta.bg, color: meta.color }}>{r.icon || meta.icon}</div>
                          <div>
                            <strong>{r.categoryName}</strong>
                            <small>{r.description ? r.description.slice(0, 30) : '—'} <span className="cm-code-chip" style={{ color: meta.color, background: meta.bg }}>{r.categoryCode}</span></small>
                          </div>
                        </div>
                      </td>
                      <td className="cm-mono">{r.categoryCode}</td>
                      <td><span className="badge" style={{ color: meta.color, background: meta.bg }}>{r.categoryType || '—'}</span></td>
                      <td>{r.parentCategoryName || '—'}</td>
                      <td>{r.gstPercentage != null && r.gstPercentage !== '' ? <span className="badge badge-purple">{r.gstPercentage}%</span> : '—'}</td>
                      <td className="cm-mono">{r.hsnCode || '—'}</td>
                      <td>{r.isTaxable ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span>}</td>
                      <td><strong>{r.displayOrder || 1}</strong></td>
                      <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
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
          <div className="drawer cm-drawer">
            <div className="drawer-header cm-drawer-header">
              <div className="dh-icon">🏷</div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Category' : 'Add New Category'}</h3>
                <p>Medicine · Treatment · Procedure · Lab Test · Income · Expense</p>
              </div>
              <button className="drawer-close" onClick={closeDrawer}>×</button>
            </div>

            <div className="drawer-content cm-drawer-content">
              <div className="cm-preview-banner">
                <div className="cm-row-icon lg" style={{ background: '#0D6EAC', color: '#fff' }}>{form.icon}</div>
                <div className="cm-preview-text">
                  <strong>{form.categoryName || 'Category Name'}</strong>
                  <span>{form.categoryType || 'Type'} · {form.branch || 'Branch'}</span>
                </div>
                <span className="cm-code-pill">{form.categoryCode || 'CAT-000'}</span>
                <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="fs-title">
                <div className="fs-icon">ℹ️</div>
                <div>
                  <h4>Category Information</h4>
                  <p>All fields marked * are mandatory</p>
                </div>
              </div>

              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>Category ID</label>
                  <input readOnly value={form.categoryCode || 'CAT-000'} />
                </div>
                <div className="form-group">
                  <label>Category Code <span className="req">*</span></label>
                  <input placeholder="e.g. MED001" {...F('categoryCode')} />
                </div>
                <div className="form-group">
                  <label>Status <span className="req">*</span></label>
                  <select value={form.isActive ? 'true' : 'false'} onChange={e => setVal('isActive', e.target.value === 'true')}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Category Name <span className="req">*</span></label>
                  <input placeholder="e.g. Antibiotics" {...F('categoryName')} />
                </div>
                <div className="form-group">
                  <label>Category Type <span className="req">*</span></label>
                  <select {...F('categoryType')}>
                    <option value="">Select Type</option>
                    {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Parent Category <span className="cm-optional">(Optional)</span></label>
                  <select {...F('parentCategory')}>
                    <option value="">None – Top Level</option>
                    {data.filter(d => d._id !== editing).map(d => <option key={d._id} value={d._id}>{d.categoryName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch <span className="req">*</span></label>
                  <select {...F('branch')}>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" placeholder="1" {...F('displayOrder')} />
                </div>
              </div>

              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Brief description of this category..." {...F('description')} />
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">₨</div>
                <div>
                  <h4>GST & Compliance</h4>
                </div>
              </div>

              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>GST % <span className="cm-optional">(Optional)</span></label>
                  <select value={form.gstPercentage} onChange={e => setVal('gstPercentage', e.target.value)}>
                    <option value="">Select GST</option>
                    {GST_OPTIONS.map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>HSN Code</label>
                  <input placeholder="8-digit HSN code" {...F('hsnCode')} />
                </div>
                <div className="form-group">
                  <label>Is Taxable</label>
                  <select value={form.isTaxable ? 'true' : 'false'} onChange={e => setVal('isTaxable', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="fs-title">
                <div className="fs-icon">🎨</div>
                <div>
                  <h4>Category Icon & Color</h4>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Select Icon <span className="cm-optional">(Optional)</span></label>
                <div className="cm-icon-grid">
                  {ICONS.map(ic => (
                    <button
                      type="button"
                      key={ic}
                      className={`cm-icon-btn ${form.icon === ic ? 'selected' : ''}`}
                      onClick={() => setVal('icon', ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Category Color</label>
                <div className="cm-color-grid">
                  {COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      className={`cm-color-swatch ${form.color === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setVal('color', c)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Category Image <span className="cm-optional">(Optional)</span></label>
                <label className="cm-upload-box">
                  <input type="file" accept=".png,.svg,.jpg,.jpeg" hidden onChange={e => setVal('categoryImage', e.target.files?.[0]?.name || '')} />
                  <span className="cm-upload-icon">🖼</span>
                  <strong>{form.categoryImage || 'Upload Category Image / Icon'}</strong>
                  <span className="cm-upload-sub">PNG / SVG / JPG · Max 1MB</span>
                </label>
              </div>

              <div className="fs-title">
                <div className="fs-icon">⚙️</div>
                <div>
                  <h4>Audit (Auto)</h4>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Created By</label>
                  <input readOnly placeholder="Admin User" value={form.createdBy || (editing ? form.createdBy : '')} />
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

              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Remarks</label>
                  <textarea rows={2} placeholder="Internal notes about this category..." {...F('remarks')} />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={closeDrawer}>✕ Cancel</button>
              <button className="btn btn-primary-blue" onClick={handleSave} disabled={saveMut.isPending}>
                {saveMut.isPending ? '⏳ Saving...' : `💾 ${editing ? 'Update Category' : 'Save Category'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}