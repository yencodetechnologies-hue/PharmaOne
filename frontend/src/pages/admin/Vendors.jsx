import { useState, useCallback } from 'react'
import { useVendors, useSaveVendor, useDeleteVendor } from '../../hooks/useAdminMutations'

// ── Constants ────────────────────────────────────────────────────────────────
const STATES = ['Tamil Nadu','Karnataka','Kerala','Andhra Pradesh','Telangana',
  'Maharashtra','Delhi','Gujarat','Rajasthan','West Bengal','Punjab','Haryana',
  'Bihar','Odisha','Chhattisgarh','Jharkhand','Uttarakhand','Himachal Pradesh',
  'Goa','Assam','Manipur','Meghalaya','Mizoram','Nagaland','Tripura','Sikkim',
  'Arunachal Pradesh','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh']

const STEPS = [
  { id:0,  num:1,  icon:'fa-store',            label:'Basic Info',      sub:'Vendor identity' },
  { id:1,  num:2,  icon:'fa-phone-alt',         label:'Contact',         sub:'Mobile & email' },
  { id:2,  num:3,  icon:'fa-map-marker-alt',    label:'Address',         sub:'Location details' },
  { id:3,  num:4,  icon:'fa-file-contract',     label:'Business Info',   sub:'GST, PAN, Licenses' },
  { id:4,  num:5,  icon:'fa-university',        label:'Bank Details',    sub:'Payment account' },
  { id:5,  num:6,  icon:'fa-shopping-cart',     label:'Purchase Info',   sub:'Credit & limits' },
  { id:6,  num:7,  icon:'fa-pills',             label:'Products',        sub:'Categories supplied' },
  { id:7,  num:8,  icon:'fa-file-alt',          label:'Documents',       sub:'Certificates & files' },
  { id:8,  num:9,  icon:'fa-comments',          label:'Communication',   sub:'Notes & history' },
  { id:9,  num:10, icon:'fa-shield-alt',        label:'Audit & Remarks', sub:'System fields' },
  { id:10, num:'✓',icon:'fa-check-double',      label:'Review',          sub:'Confirm & save' },
]

const LOGO_COLORS = [
  'linear-gradient(135deg,#3F51B5,#0D6EAC)',
  'linear-gradient(135deg,#00B894,#00D2A0)',
  'linear-gradient(135deg,#F39C12,#F7C04A)',
  'linear-gradient(135deg,#8E44AD,#BB6BD9)',
  'linear-gradient(135deg,#0097A7,#26C6DA)',
  'linear-gradient(135deg,#E74C3C,#F08080)',
]

const initForm = {
  vendorCode:'', distributorName:'', contactPerson:'', vendorType:'', status:'Active',
  phone:'', alternateMobile:'', landlineNumber:'', email:'', alternativeEmail:'', website:'',
  addressLine1:'', addressLine2:'', area:'', city:'', district:'', state:'', country:'India', pincode:'',
  distributorCode:'', gstNo:'', panNumber:'', drugLicense:'', fssaiNumber:'', msmeNumber:'', cinNumber:'',
  bankName:'', bankBranchName:'', accountHolder:'', accountNumber:'', ifscCode:'', upiId:'',
  creditDays:'', creditLimit:'', openingBalance:'', preferredVendor:false,
  minimumOrderValue:'', supplyArea:'',
  productCategories:[], brandNames:[], productsSupplied:[],
  lastPurchaseDate:'', lastContactDate:'', notes:'', comments:'',
  alertPurchase:true, alertBalance:true, alertLicenseExpiry:true,
  password:'',
}

// ── Tag Input Component ───────────────────────────────────────────────────────
function TagInput({ tags = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }
  const remove = t => onChange(tags.filter(x => x !== t))
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:6, alignItems:'center',
      border:'1.5px solid var(--border)', borderRadius:9, padding:'7px 10px',
      background:'#fff', cursor:'text', minHeight:42,
    }} onClick={e => e.currentTarget.querySelector('input')?.focus()}>
      {tags.map(t => (
        <span key={t} style={{ display:'flex', alignItems:'center', gap:4, background:'var(--primary-light)', color:'var(--primary)', border:'1px solid var(--primary-mid)', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
          {t}
          <button onClick={() => remove(t)} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--primary)', fontWeight:700, fontSize:14, lineHeight:1, padding:0 }}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        style={{ border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--text-dark)', flex:1, minWidth:120, fontFamily:'var(--font)' }}
      />
    </div>
  )
}

// ── Credit Bar ────────────────────────────────────────────────────────────────
function CreditBar({ outstanding, limit }) {
  const pct = limit > 0 ? Math.min((outstanding / limit) * 100, 100) : 0
  const color = pct > 70 ? 'var(--danger)' : pct > 40 ? 'var(--warning)' : 'var(--accent)'
  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:3 }}>
        ₹{(outstanding/100000).toFixed(1)}L / ₹{(limit/100000).toFixed(1)}L
      </div>
      <div style={{ height:5, borderRadius:3, background:'var(--border)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width 0.3s' }} />
      </div>
    </div>
  )
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', border:'1.5px solid var(--border)', borderRadius:10, marginBottom:10 }}>
      <i className={`fas ${icon}`} style={{ color:'var(--text-mid)', width:16, textAlign:'center' }} />
      <span style={{ flex:1, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>{label}</span>
      <label style={{ position:'relative', display:'inline-block', width:44, height:24, flexShrink:0 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
        <span style={{
          position:'absolute', cursor:'pointer', inset:0,
          background: checked ? 'var(--primary)' : '#CBD5E0',
          borderRadius:24, transition:'0.3s',
        }}>
          <span style={{ position:'absolute', width:18, height:18, background:'#fff', borderRadius:'50%', top:3, left: checked ? 23 : 3, transition:'0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
        </span>
      </label>
    </div>
  )
}

// ── InfoBox ───────────────────────────────────────────────────────────────────
function InfoBox({ type = 'blue', icon, text }) {
  const colors = {
    blue:   { bg:'var(--primary-light)',  border:'var(--primary-mid)', color:'var(--primary)' },
    orange: { bg:'var(--warning-light)',  border:'#FBD38D',            color:'var(--warning)' },
    green:  { bg:'var(--accent-light)',   border:'#9AE6B4',            color:'var(--accent)' },
    indigo: { bg:'#E8EAF6',               border:'#C5CAE9',            color:'#3F51B5' },
  }
  const c = colors[type] || colors.blue
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:c.bg, border:`1px solid ${c.border}`, borderRadius:9, padding:'11px 14px', marginBottom:16 }}>
      <i className={`fas ${icon}`} style={{ color:c.color, flexShrink:0, marginTop:1, fontSize:13 }} />
      <span style={{ fontSize:12, color:c.color, fontWeight:500, lineHeight:1.5 }}>{text}</span>
    </div>
  )
}

// ── Doc Card ──────────────────────────────────────────────────────────────────
function DocCard({ icon, label, sub, required, uploaded, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      border: `1.5px dashed ${uploaded ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius:10, padding:'20px 16px', textAlign:'center',
      cursor:'pointer', transition:'all 0.18s',
      background: uploaded ? 'var(--accent-light)' : '#fff',
      position:'relative',
    }}>
      {required && (
        <span style={{ position:'absolute', top:8, right:8, fontSize:9, fontWeight:700, background:'var(--danger-light)', color:'var(--danger)', padding:'2px 6px', borderRadius:4 }}>Required</span>
      )}
      {uploaded && (
        <span style={{ position:'absolute', top:8, left:8, fontSize:12, color:'var(--accent)' }}>✓</span>
      )}
      <i className={`fas ${icon}`} style={{ fontSize:28, color: uploaded ? 'var(--accent)' : 'var(--text-light)', marginBottom:10, display:'block' }} />
      <p style={{ fontSize:13, fontWeight:600, color: uploaded ? 'var(--accent)' : 'var(--text-mid)', marginBottom:4 }}>{label}</p>
      <span style={{ fontSize:11, color:'var(--text-light)' }}>{sub}</span>
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ iconStyle, icon, title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, ...iconStyle }}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <h4 style={{ fontFamily:'var(--font-head)', fontSize:14, fontWeight:700, color:'var(--text-dark)' }}>{title}</h4>
        <p style={{ fontSize:11, color:'var(--text-light)', marginTop:1 }}>{sub}</p>
      </div>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────────────────
const FG = ({ label, req, opt, span, children }) => (
  <div className="form-group" style={span ? { gridColumn:'1/-1' } : {}}>
    <label>{label}{req && <span className="req"> *</span>}{opt && <span style={{ fontSize:11, color:'var(--text-light)', fontWeight:400 }}> (Optional)</span>}</label>
    {children}
  </div>
)

const Inp = ({ value, onChange, ...rest }) => (
  <input className="form-control" value={value ?? ''} onChange={onChange} {...rest} />
)

const PrefixInp = ({ prefix, value, onChange, ...rest }) => (
  <div style={{ display:'flex', alignItems:'center', border:'1.5px solid var(--border)', borderRadius:9, overflow:'hidden', transition:'border-color .2s' }}
    onFocusCapture={e => e.currentTarget.style.borderColor='var(--primary)'}
    onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}>
    <span style={{ padding:'9px 12px', background:'var(--bg)', borderRight:'1.5px solid var(--border)', fontSize:12, fontWeight:600, color:'var(--text-light)', whiteSpace:'nowrap' }}>{prefix}</span>
    <input value={value ?? ''} onChange={onChange} {...rest} style={{ border:'none', outline:'none', background:'transparent', flex:1, padding:'9px 12px', fontSize:13, color:'var(--text-dark)', fontFamily:'var(--font)' }} />
  </div>
)

const Sel = ({ value, onChange, children, ...rest }) => (
  <select className="form-control" value={value ?? ''} onChange={onChange} {...rest}>{children}</select>
)

// ── REVIEW Section ────────────────────────────────────────────────────────────
function ReviewBlock({ icon, label, rows }) {
  return (
    <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, marginBottom:12, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'#fff' }}>
        <i className={`fas ${icon}`} style={{ color:'var(--primary)', fontSize:13 }} />
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text-dark)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'10px 14px', gap:'6px 0' }}>
        {rows.map(([k,v,cls]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:12, color:'var(--text-light)' }}>{k}</span>
            <strong style={{ fontSize:12, color: cls === 'blue' ? 'var(--primary)' : cls === 'green' ? 'var(--accent)' : cls === 'red' ? 'var(--danger)' : cls === 'muted' ? 'var(--text-light)' : 'var(--text-dark)' }}>{v || '—'}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Vendors() {
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(initForm)
  const [step, setStep]           = useState(0)
  const [done, setDone]           = useState(new Set())
  const [docs, setDocs]           = useState({})
  const [deleteId, setDeleteId]   = useState(null)

  const { data = [], isLoading } = useVendors()
  const saveMut   = useSaveVendor()
  const deleteMut = useDeleteVendor()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const outstanding = parseFloat(form.openingBalance) || 0
  const creditLimit  = parseFloat(form.creditLimit) || 0
  const creditPct    = creditLimit > 0 ? Math.min((outstanding / creditLimit) * 100, 100) : 0

  const initials = form.distributorName
    ? form.distributorName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'VN'

  const openCreate = () => {
    setEditing(null); setForm(initForm); setStep(0); setDone(new Set()); setDocs({}); setShowDrawer(true)
  }
  const openEdit = v => {
    setEditing(v._id)
    setForm({ ...initForm, ...v, lastPurchaseDate: v.lastPurchaseDate?.slice(0,10)||'', lastContactDate: v.lastContactDate?.slice(0,10)||'' })
    setStep(0); setDone(new Set()); setDocs({}); setShowDrawer(true)
  }
  const goStep = i => {
    if (i > step) setDone(d => { const n = new Set(d); for (let j = step; j < i; j++) n.add(j); return n })
    setStep(i)
  }

  const handleSubmit = () => {
    saveMut.mutate({ id: editing, data: form }, { onSuccess: () => { setShowDrawer(false); setEditing(null) } })
  }

  const filtered = data.filter(v => {
    const q = search.toLowerCase()
    return (!q || `${v.distributorName} ${v.vendorCode} ${v.gstNo} ${v.distributorCode}`.toLowerCase().includes(q))
      && (!filterType   || v.vendorType === filterType)
      && (!filterStatus || (filterStatus === 'Active' ? v.isActive : !v.isActive))
  })

  const total      = data.length
  const preferred  = data.filter(v => v.preferredVendor).length
  const outstanding_total = data.reduce((s, v) => s + (v.outstandingBalance || 0), 0)
  const thisMonth  = data.filter(v => v.lastPurchaseDate && new Date(v.lastPurchaseDate) > new Date(Date.now() - 30*24*60*60*1000)).length
  const overdue    = data.filter(v => (v.outstandingBalance || 0) > (v.creditLimit || 0)).length

  const VENDOR_TYPES = { Distributor: 'badge-indigo', Manufacturer: 'badge-purple', Supplier: 'badge-orange' }
  const logoGrad = i => LOGO_COLORS[i % LOGO_COLORS.length]

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="topbar-breadcrumb" style={{ marginBottom:4 }}>
            <a href="/dashboard">Dashboard</a><span className="sep"> › </span>
            <a>Masters</a><span className="sep"> › </span>
            <span className="current">Vendor Master</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>Vendor Master</h2>
          <p style={{ fontSize:13, color:'var(--text-light)', marginTop:3 }}>Manage all suppliers, distributors, and manufacturers with credit and purchase tracking</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><i className="fas fa-download" /> Export</button>
          <button className="btn btn-outline"><i className="fas fa-print" /> Print</button>
          <button className="btn btn-outline"><i className="fas fa-file-excel" /> Excel</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus" /> Add Vendor</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row" style={{ gridTemplateColumns:'repeat(5,1fr)', marginBottom:16 }}>
        {[
          { icon:'fa-store',            color:'blue',   val:total,    label:'Total Vendors',       sub:`${data.filter(v=>v.isActive).length} Active · ${data.filter(v=>!v.isActive).length} Inactive` },
          { icon:'fa-handshake',        color:'green',  val:preferred, label:'Preferred Vendors',  sub:'High reliability rated' },
          { icon:'fa-rupee-sign',       color:'orange', val:`₹${(outstanding_total/100000).toFixed(1)}L`, label:'Outstanding Balance', sub:'Across all vendors' },
          { icon:'fa-truck-loading',    color:'purple', val:thisMonth, label:'This Month Purchases', sub:'Based on last purchase date' },
          { icon:'fa-exclamation-circle',color:'red',   val:overdue,  label:'Overdue Payments',    sub:'Exceeded credit limit' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, width:'100%' }}>
              <div className={`stat-icon ${s.color}`}><i className={`fas ${s.icon}`} /></div>
              <div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--text-light)', paddingLeft:50 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── List Panel ── */}
      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si"><i className="fas fa-search" /></span>
            <input placeholder="Search vendor name, code, GST…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Distributor</option><option>Manufacturer</option><option>Supplier</option>
          </select>
          <select className="filter-select">
            <option>All Categories</option>
            <option>Medicine</option><option>Surgical</option><option>Equipment</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <select className="filter-select">
            <option>All Cities</option>
          </select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of <strong>{total}</strong></div>
          <div className="view-tabs">
            <button className="view-tab active"><i className="fas fa-list" /> List</button>
            <button className="view-tab"><i className="fas fa-th-large" /> Cards</button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="loading"><div className="spinner" />Loading vendors…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><i className="fas fa-store" /></div><h3>No vendors found</h3><p>Click "+ Add Vendor" to register your first vendor</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" style={{ accentColor:'var(--primary)', width:15, height:15 }} /></th>
                  <th>Vendor</th><th>Type</th><th>Mobile</th><th>City</th>
                  <th>GST Number</th><th>Drug License</th><th>Credit Days</th>
                  <th>Outstanding</th><th>Credit Limit</th><th>Last Purchase</th>
                  <th>Preferred</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const isActive = v.isActive || v.status === 'Active'
                  const out = v.outstandingBalance || 0
                  const lim = v.creditLimit || 0
                  const pct = lim > 0 ? Math.min((out/lim)*100,100) : 0
                  const barColor = pct > 70 ? 'var(--danger)' : pct > 40 ? 'var(--warning)' : 'var(--accent)'
                  return (
                    <tr key={v._id}>
                      <td><input type="checkbox" style={{ accentColor:'var(--primary)', width:15, height:15 }} /></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:40, height:40, borderRadius:10, background:logoGrad(i), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:800, flexShrink:0, fontFamily:'var(--font-head)' }}>
                            {(v.distributorName||'').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase()||'VN'}
                          </div>
                          <div>
                            <strong style={{ fontSize:13, fontWeight:700, color:'var(--text-dark)', display:'block' }}>{v.distributorName}</strong>
                            <small style={{ fontSize:11, color:'var(--text-light)' }}>{v.contactPerson}{v.vendorType ? ` · ${v.vendorType}` : ''}</small>
                            <div style={{ fontSize:10, background:'var(--primary-light)', color:'var(--primary)', display:'inline-block', padding:'1px 6px', borderRadius:4, fontWeight:700, marginTop:2 }}>
                              {v.vendorCode || v.distributorCode || v.vendorId || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${v.vendorType === 'Manufacturer' ? 'badge-purple' : v.vendorType === 'Supplier' ? 'badge-orange' : 'badge-blue'}`}>
                          {v.vendorType || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize:12 }}>{v.phone}</td>
                      <td style={{ fontSize:12 }}>{v.city || '—'}</td>
                      <td style={{ fontSize:11, fontFamily:'monospace', fontWeight:600, color:'var(--text-dark)' }}>{v.gstNo || '—'}</td>
                      <td>
                        {v.drugLicense ? (
                          <span style={{ fontSize:11, background:'var(--accent-light)', color:'var(--accent)', padding:'2px 7px', borderRadius:4, fontWeight:600 }}>{v.drugLicense}</span>
                        ) : <span style={{ color:'var(--text-light)', fontSize:12 }}>—</span>}
                      </td>
                      <td style={{ fontSize:13, fontWeight:700 }}>{v.creditDays ? `${v.creditDays} days` : '—'}</td>
                      <td style={{ fontSize:13, fontWeight:700, color: out > 0 ? 'var(--danger)' : 'var(--accent)' }}>
                        ₹{out.toLocaleString('en-IN')}
                      </td>
                      <td style={{ minWidth:120 }}>
                        <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:3 }}>
                          ₹{(out/100000).toFixed(1)}L / ₹{(lim/100000).toFixed(1)}L
                        </div>
                        <div style={{ height:5, borderRadius:3, background:'var(--border)', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3 }} />
                        </div>
                      </td>
                      <td style={{ fontSize:12 }}>
                        {v.lastPurchaseDate ? new Date(v.lastPurchaseDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td style={{ fontSize:16 }}>{v.preferredVendor ? '⭐' : <span style={{ color:'var(--text-light)' }}>☆</span>}</td>
                      <td><span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>{isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          {[
                            { icon:'fa-eye',             cls:'',       title:'View' },
                            { icon:'fa-edit',            cls:'',       title:'Edit',  action: () => openEdit(v) },
                            { icon:'fa-book',            cls:'orange', title:'Ledger' },
                            { icon:'fa-history',         cls:'purple', title:'History' },
                            { icon:'fa-money-bill-wave', cls:'green',  title:'Pay Now' },
                            { icon:'fa-trash',           cls:'red',    title:'Delete', action: () => setDeleteId(v._id) },
                          ].map(btn => (
                            <button key={btn.icon} className={`act-btn${btn.cls ? ` ${btn.cls}` : ''}`} title={btn.title} onClick={btn.action}>
                              <i className={`fas ${btn.icon}`} />
                            </button>
                          ))}
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
          <div className="pagination-info">Showing 1–{filtered.length} of {filtered.length} vendors</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'var(--text-light)' }}>Rows:</span>
            <select className="filter-select" style={{ padding:'5px 10px', fontSize:12 }}>
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
          <div className="pagination-btns">
            <button className="pg-btn"><i className="fas fa-chevron-left" /></button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">2</button>
            <button className="pg-btn"><i className="fas fa-chevron-right" /></button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ADD / EDIT VENDOR DRAWER
      ═══════════════════════════════════════════════════════════ */}
      {showDrawer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(26,35,64,0.35)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDrawer(false) }}>
          <div style={{ width:860, maxWidth:'96vw', height:'100vh', background:'#fff', display:'flex', flexDirection:'column', boxShadow:'-8px 0 40px rgba(13,110,172,0.15)', animation:'slideIn .22s ease' }}>

            {/* Drawer Header */}
            <div style={{ padding:'18px 24px', background:'linear-gradient(135deg,#0D6EAC,#0A5A8C)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <div style={{ width:42, height:42, background:'rgba(255,255,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff', flexShrink:0 }}>
                <i className="fas fa-store" />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:700, color:'#fff' }}>{editing ? 'Edit Vendor' : 'Add New Vendor'}</h3>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Complete all sections to register a supplier or distributor</p>
              </div>
              <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:20 }}>
                {step === 10 ? 'Review' : `Step ${step + 1} / 10`}
              </span>
              <button onClick={() => setShowDrawer(false)} style={{ width:34, height:34, border:'none', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:16, cursor:'pointer', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Body: Step nav + Content */}
            <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

              {/* Left: step navigator */}
              <div style={{ width:210, borderRight:'1px solid var(--border)', overflowY:'auto', flexShrink:0, padding:'12px 0' }}>
                {STEPS.map(s => {
                  const isActive = step === s.id
                  const isDone   = done.has(s.id)
                  return (
                    <div key={s.id} onClick={() => goStep(s.id)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                      cursor:'pointer', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      marginBottom: s.id === 9 ? 8 : 0,
                      ...(s.id === 10 ? { borderTop:'1px solid var(--border)', marginTop:8, paddingTop:14 } : {}),
                      transition:'all .15s',
                    }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:700,
                        background: isDone ? 'var(--accent)' : isActive ? 'var(--primary)' : s.id === 10 ? 'var(--accent-light)' : 'var(--bg)',
                        color: (isDone || isActive) ? '#fff' : s.id === 10 ? 'var(--accent)' : 'var(--text-light)',
                      }}>
                        {isDone ? <i className="fas fa-check" style={{ fontSize:10 }} /> : s.num}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--primary)' : 'var(--text-dark)' }}>{s.label}</div>
                        <div style={{ fontSize:10, color:'var(--text-light)' }}>{s.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right: form content */}
              <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

                {/* ── Step 0: Basic Info ─────────────────────────── */}
                {step === 0 && <>
                  <SectionHead iconStyle={{ background:'#E8EAF6', color:'#3F51B5' }} icon="fa-store" title="Basic Information" sub="Vendor identity and classification" />
                  <div className="form-grid form-grid-3">
                    <FG label="Vendor ID" req><Inp value="VEN-AUTO" readOnly /></FG>
                    <FG label="Vendor Code" req><Inp {...F('vendorCode')} placeholder="e.g. VEN-CHN-025" /></FG>
                    <FG label="Status" req><Sel {...F('status')}><option>Active</option><option>Inactive</option></Sel></FG>
                  </div>
                  <div className="form-grid form-grid-2">
                    <FG label="Vendor Name" req><Inp {...F('distributorName')} placeholder="Company / Vendor full name" /></FG>
                    <FG label="Contact Person Name" req><Inp {...F('contactPerson')} placeholder="Primary contact person" /></FG>
                    <FG label="Vendor Type" req>
                      <Sel {...F('vendorType')}><option value="">Select Type</option><option>Distributor</option><option>Manufacturer</option><option>Supplier</option></Sel>
                    </FG>
                  </div>
                </>}

                {/* ── Step 1: Contact ───────────────────────────── */}
                {step === 1 && <>
                  <SectionHead iconStyle={{ background:'var(--primary-light)', color:'var(--primary)' }} icon="fa-phone-alt" title="Contact Information" sub="Primary and alternate contact details" />
                  <div className="form-grid form-grid-2">
                    <FG label="Mobile Number" req><PrefixInp prefix="+91" {...F('phone')} placeholder="9876543210" /></FG>
                    <FG label="Alternative Mobile"><PrefixInp prefix="+91" {...F('alternateMobile')} placeholder="Optional" /></FG>
                    <FG label="Landline Number"><PrefixInp prefix="044" {...F('landlineNumber')} placeholder="XXXXXXXX" /></FG>
                    <FG label="Email Address" req><Inp {...F('email')} type="email" placeholder="vendor@company.com" /></FG>
                    <FG label="Alternative Email"><Inp {...F('alternativeEmail')} type="email" placeholder="Optional alternate email" /></FG>
                    <FG label="Website"><PrefixInp prefix="https://" {...F('website')} placeholder="www.vendor.com" /></FG>
                  </div>
                </>}

                {/* ── Step 2: Address ───────────────────────────── */}
                {step === 2 && <>
                  <SectionHead iconStyle={{ background:'var(--warning-light)', color:'var(--warning)' }} icon="fa-map-marker-alt" title="Address Information" sub="Registered office and supply location" />
                  <div className="form-grid form-grid-2">
                    <FG label="Address Line 1" req span><Inp {...F('addressLine1')} placeholder="Door No., Street, Building Name" /></FG>
                    <FG label="Address Line 2" span><Inp {...F('addressLine2')} placeholder="Landmark, Area" /></FG>
                    <FG label="Area / Locality"><Inp {...F('area')} placeholder="Area name" /></FG>
                    <FG label="City" req><Inp {...F('city')} placeholder="e.g. Chennai" /></FG>
                    <FG label="District"><Inp {...F('district')} placeholder="District name" /></FG>
                    <FG label="State" req>
                      <Sel {...F('state')}><option value="">Select State</option>{STATES.map(s => <option key={s}>{s}</option>)}</Sel>
                    </FG>
                    <FG label="Country"><Sel {...F('country')}><option>India</option><option>UAE</option><option>USA</option></Sel></FG>
                    <FG label="Pincode" req><Inp {...F('pincode')} placeholder="600001" maxLength={6} /></FG>
                  </div>
                </>}

                {/* ── Step 3: Business Info ─────────────────────── */}
                {step === 3 && <>
                  <SectionHead iconStyle={{ background:'var(--accent-light)', color:'var(--accent)' }} icon="fa-file-contract" title="Business Information" sub="Regulatory and compliance registration numbers" />
                  <InfoBox type="blue" icon="fa-info-circle" text="GST Number and Drug License Number are mandatory for pharma vendors. Other fields are optional but recommended for compliance." />
                  <div className="form-grid form-grid-2">
                    <FG label="Distributor Code" req><Inp {...F('distributorCode')} placeholder="e.g. DIST-001" /></FG>
                    <FG label="GST Number" req><Inp {...F('gstNo')} placeholder="33ABCDE1234F1Z5" maxLength={15} style={{ textTransform:'uppercase' }} /></FG>
                    <FG label="PAN Number" req><Inp {...F('panNumber')} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform:'uppercase' }} /></FG>
                    <FG label="Drug License Number" req><Inp {...F('drugLicense')} placeholder="DL-CHN-2024-001" /></FG>
                    <FG label="FSSAI Number" opt><Inp {...F('fssaiNumber')} placeholder="FSSAI License No." /></FG>
                    <FG label="MSME Number" opt><Inp {...F('msmeNumber')} placeholder="MSME Registration No." /></FG>
                    <FG label="CIN Number" opt><Inp {...F('cinNumber')} placeholder="Corporate Identity Number" /></FG>
                  </div>
                </>}

                {/* ── Step 4: Bank Details ──────────────────────── */}
                {step === 4 && <>
                  <SectionHead iconStyle={{ background:'var(--primary-light)', color:'var(--primary)' }} icon="fa-university" title="Bank Details" sub="Payment account for vendor transactions" />
                  <InfoBox type="orange" icon="fa-exclamation-triangle" text="Bank details are required for processing payments and vendor disbursements. Verify account number before saving." />
                  <div className="form-grid form-grid-2">
                    <FG label="Bank Name" req><Inp {...F('bankName')} placeholder="e.g. HDFC Bank, SBI" /></FG>
                    <FG label="Branch Name"><Inp {...F('bankBranchName')} placeholder="Bank branch name" /></FG>
                    <FG label="Account Holder Name" req><Inp {...F('accountHolder')} placeholder="As per bank records" /></FG>
                    <FG label="Account Number" req><Inp {...F('accountNumber')} placeholder="Account Number" /></FG>
                    <FG label="IFSC Code" req><Inp {...F('ifscCode')} placeholder="HDFC0001234" style={{ textTransform:'uppercase' }} /></FG>
                    <FG label="UPI ID"><Inp {...F('upiId')} placeholder="vendor@hdfc" /></FG>
                  </div>
                </>}

                {/* ── Step 5: Purchase Info ─────────────────────── */}
                {step === 5 && <>
                  <SectionHead iconStyle={{ background:'var(--warning-light)', color:'var(--warning)' }} icon="fa-shopping-cart" title="Purchase Information" sub="Credit terms, limits, and vendor priority" />
                  <div className="form-grid form-grid-3">
                    <FG label="Credit Days" req><Inp {...F('creditDays')} type="number" placeholder="30" min={0} max={180} /></FG>
                    <FG label="Credit Limit (₹)"><PrefixInp prefix="₹" {...F('creditLimit')} type="number" placeholder="2,00,000" /></FG>
                    <FG label="Opening Balance (₹)"><PrefixInp prefix="₹" {...F('openingBalance')} type="number" placeholder="0" /></FG>
                  </div>
                  {/* Outstanding display */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                        <i className="fas fa-exclamation-circle" style={{ color:'var(--warning)', fontSize:13 }} />
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-dark)' }}>Outstanding Balance (Auto Calculated)</span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-light)' }}>Opening Balance + Unpaid Purchases – Payments Made</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:20, fontWeight:800, color: outstanding > creditLimit * 0.7 ? 'var(--danger)' : 'var(--primary)', fontFamily:'var(--font-head)' }}>
                        ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits:2 })}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-light)' }}>Live calculated</div>
                    </div>
                  </div>
                  {/* Preferred vendor toggle */}
                  <div onClick={() => set('preferredVendor', !form.preferredVendor)} style={{
                    display:'flex', alignItems:'center', gap:14, padding:'16px', borderRadius:10, cursor:'pointer', transition:'all .18s',
                    border:`1.5px solid ${form.preferredVendor ? 'var(--warning)' : 'var(--border)'}`,
                    background: form.preferredVendor ? 'var(--warning-light)' : '#fff',
                  }}>
                    <span style={{ fontSize:24 }}>{form.preferredVendor ? '⭐' : '☆'}</span>
                    <div style={{ flex:1 }}>
                      <strong style={{ fontSize:13, color:'var(--text-dark)' }}>Mark as Preferred Vendor</strong>
                      <div style={{ fontSize:12, color:'var(--text-light)', marginTop:2 }}>Preferred vendors appear first in purchase order suggestions</div>
                    </div>
                    <label style={{ position:'relative', display:'inline-block', width:44, height:24 }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={form.preferredVendor} onChange={e => set('preferredVendor', e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
                      <span style={{ position:'absolute', cursor:'pointer', inset:0, background: form.preferredVendor ? 'var(--warning)' : '#CBD5E0', borderRadius:24, transition:'0.3s' }}>
                        <span style={{ position:'absolute', width:18, height:18, background:'#fff', borderRadius:'50%', top:3, left: form.preferredVendor ? 23 : 3, transition:'0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
                      </span>
                    </label>
                  </div>
                </>}

                {/* ── Step 6: Products ──────────────────────────── */}
                {step === 6 && <>
                  <SectionHead iconStyle={{ background:'var(--purple-light)', color:'var(--purple)' }} icon="fa-pills" title="Product Information" sub="Categories, brands, and products this vendor supplies" />
                  <div className="form-group" style={{ marginBottom:16 }}>
                    <label>Product Categories <span className="req">*</span></label>
                    <TagInput tags={form.productCategories} onChange={v => set('productCategories', v)} placeholder="Add category and press Enter…" />
                  </div>
                  <div className="form-group" style={{ marginBottom:16 }}>
                    <label>Brand Names Supplied</label>
                    <TagInput tags={form.brandNames} onChange={v => set('brandNames', v)} placeholder="Add brand and press Enter…" />
                  </div>
                  <div className="form-group" style={{ marginBottom:16 }}>
                    <label>Products / Medicines Supplied</label>
                    <TagInput tags={form.productsSupplied} onChange={v => set('productsSupplied', v)} placeholder="Add product type and press Enter…" />
                  </div>
                  <div className="form-grid form-grid-2">
                    <FG label="Minimum Order Value (₹)"><PrefixInp prefix="₹" {...F('minimumOrderValue')} type="number" placeholder="5,000" /></FG>
                    <FG label="Supply Area / Region"><Inp {...F('supplyArea')} placeholder="e.g. Tamil Nadu, South India, PAN India" /></FG>
                  </div>
                </>}

                {/* ── Step 7: Documents ────────────────────────── */}
                {step === 7 && <>
                  <SectionHead iconStyle={{ background:'#E0F7FA', color:'#0097A7' }} icon="fa-file-alt" title="Document Uploads" sub="Upload compliance and verification documents" />
                  <InfoBox type="indigo" icon="fa-info-circle" text="GST Certificate and Drug License Copy are mandatory. Upload clear, readable scanned copies for vendor verification." />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    {[
                      { key:'gstCert',    icon:'fa-file-invoice',  label:'GST Certificate',          sub:'PDF / JPG · Max 5MB',  req:true },
                      { key:'panCopy',    icon:'fa-id-card',       label:'PAN Card Copy',             sub:'PDF / JPG · Max 2MB',  req:true },
                      { key:'dlCopy',     icon:'fa-file-medical',  label:'Drug License Copy',         sub:'PDF / JPG · Max 5MB',  req:true },
                      { key:'cheque',     icon:'fa-money-check',   label:'Cancelled Cheque',          sub:'PDF / JPG · Max 2MB',  req:false },
                      { key:'agreement',  icon:'fa-file-signature',label:'Agreement / MOU Copy',      sub:'PDF · Max 10MB',       req:false },
                      { key:'fssai',      icon:'fa-certificate',   label:'FSSAI / Other Certificates',sub:'PDF / JPG · Max 5MB',  req:false },
                    ].map(d => (
                      <DocCard key={d.key} icon={d.icon} label={d.label} sub={d.sub} required={d.req}
                        uploaded={!!docs[d.key]}
                        onToggle={() => setDocs(p => ({ ...p, [d.key]: !p[d.key] }))} />
                    ))}
                  </div>
                </>}

                {/* ── Step 8: Communication ─────────────────────── */}
                {step === 8 && <>
                  <SectionHead iconStyle={{ background:'var(--accent-light)', color:'var(--accent)' }} icon="fa-comments" title="Communication Tracking" sub="Purchase history, contact log, and notes" />
                  <div className="form-grid form-grid-2" style={{ marginBottom:16 }}>
                    <FG label="Last Purchase Date"><Inp {...F('lastPurchaseDate')} type="date" /></FG>
                    <FG label="Last Contact Date"><Inp {...F('lastContactDate')} type="date" /></FG>
                  </div>
                  {/* Activity log preview */}
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-mid)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Recent Activity Log</div>
                  <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', marginBottom:16 }}>
                    {[
                      { dot:'var(--accent)',   text:'Purchase Order Placed',    sub:'₹48,000 · 24 medicine items ordered', date:'12 Jun 2026' },
                      { dot:'var(--primary)',  text:'Payment Made ₹35,000',     sub:'Bank transfer · Ref: TXN-BK-00234',    date:'05 Jun 2026' },
                      { dot:'var(--warning)',  text:'Phone Call – Follow-up',   sub:'Spoke with contact regarding delivery', date:'01 Jun 2026' },
                      { dot:'var(--purple)',   text:'Invoice Received',          sub:'₹48,000 received via email',            date:'28 May 2026' },
                    ].map((row, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', background:'#fff' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:row.dot, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <strong style={{ fontSize:12, color:'var(--text-dark)' }}>{row.text}</strong>
                          <div style={{ fontSize:11, color:'var(--text-light)' }}>{row.sub}</div>
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-light)', flexShrink:0 }}>{row.date}</div>
                      </div>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom:12 }}>
                    <label>Notes / Internal Remarks</label>
                    <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add internal notes about this vendor — reliability, delivery performance, product quality, etc." rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Comments</label>
                    <textarea className="form-control" value={form.comments} onChange={e => set('comments', e.target.value)} placeholder="Any additional comments or observations…" rows={2} />
                  </div>
                </>}

                {/* ── Step 9: Audit & Remarks ───────────────────── */}
                {step === 9 && <>
                  <SectionHead iconStyle={{ background:'var(--bg)', color:'var(--text-mid)' }} icon="fa-shield-alt" title="Audit Information" sub="System-generated audit trail and alert settings" />
                  <InfoBox type="green" icon="fa-check-circle" text="All audit fields are automatically populated by the system. These cannot be edited manually." />
                  <div className="form-grid form-grid-2" style={{ marginBottom:16 }}>
                    <FG label="Created By"><Inp value="Admin User" readOnly /></FG>
                    <FG label="Created Date"><Inp value={new Date().toLocaleDateString('en-IN')} readOnly /></FG>
                    <FG label="Modified By"><Inp value="—" readOnly /></FG>
                    <FG label="Modified Date"><Inp value="—" readOnly /></FG>
                  </div>
                  <div style={{ height:1, background:'var(--border)', margin:'16px 0' }} />
                  <ToggleRow icon="fa-bell" label="Enable Purchase Alerts for this Vendor" checked={form.alertPurchase} onChange={v => set('alertPurchase', v)} />
                  <ToggleRow icon="fa-exclamation-triangle" label="Alert on Outstanding Balance Exceeded" checked={form.alertBalance} onChange={v => set('alertBalance', v)} />
                  <ToggleRow icon="fa-file-medical" label="Alert on Drug License Expiry" checked={form.alertLicenseExpiry} onChange={v => set('alertLicenseExpiry', v)} />
                </>}

                {/* ── Step 10: Review ───────────────────────────── */}
                {step === 10 && <>
                  <SectionHead iconStyle={{ background:'var(--accent-light)', color:'var(--accent)' }} icon="fa-check-double" title="Review & Confirm" sub="Verify all details before registering the vendor" />
                  {/* Vendor preview card */}
                  <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px', background:'var(--primary-light)', border:'1.5px solid var(--primary-mid)', borderRadius:12, marginBottom:20 }}>
                    <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(135deg,#3F51B5,#0D6EAC)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:18, fontWeight:800, fontFamily:'var(--font-head)', flexShrink:0 }}>
                      {initials}
                    </div>
                    <div style={{ flex:1 }}>
                      <strong style={{ fontSize:15, color:'var(--text-dark)', display:'block' }}>{form.distributorName || 'Vendor Company Name'}</strong>
                      <span style={{ fontSize:12, color:'var(--text-light)' }}>{form.vendorType || 'Type'} · {form.contactPerson || 'Contact Person'}</span>
                      <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                        {[
                          { val:'VEN-0025', color:'var(--primary)' },
                          { val:form.status || 'Active', color:'var(--accent)' },
                          { val: form.preferredVendor ? '⭐ Preferred' : 'Not Preferred', color: form.preferredVendor ? 'var(--warning)' : 'var(--text-light)' },
                        ].map((c, i) => (
                          <span key={i} style={{ fontSize:11, fontWeight:700, color:c.color, background:'#fff', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border)' }}>{c.val}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ReviewBlock icon="fa-store" label="Basic & Contact" rows={[
                    ['Vendor ID', 'VEN-0025', 'blue'], ['Vendor Name', form.distributorName],
                    ['Type', form.vendorType], ['Contact Person', form.contactPerson],
                    ['Mobile', form.phone], ['Status', form.status || 'Active', 'green'],
                  ]} />
                  <ReviewBlock icon="fa-file-contract" label="Business Details" rows={[
                    ['GST Number', form.gstNo], ['PAN Number', form.panNumber],
                    ['Drug License', form.drugLicense], ['City', form.city],
                    ['State', form.state], ['Country', form.country],
                  ]} />
                  <ReviewBlock icon="fa-shopping-cart" label="Purchase & Credit" rows={[
                    ['Credit Days', form.creditDays ? `${form.creditDays} days` : '—'],
                    ['Credit Limit', form.creditLimit ? `₹${Number(form.creditLimit).toLocaleString('en-IN')}` : '—'],
                    ['Opening Balance', `₹${Number(form.openingBalance||0).toLocaleString('en-IN')}`],
                    ['Outstanding', `₹${outstanding.toLocaleString('en-IN')}`, 'red'],
                    ['Preferred', form.preferredVendor ? 'Yes ⭐' : 'No', form.preferredVendor ? 'green' : 'muted'],
                    ['Bank', form.bankName || '—'],
                  ]} />
                  <ReviewBlock icon="fa-shield-alt" label="Alerts & Audit" rows={[
                    ['Purchase Alerts', form.alertPurchase ? '✔ Enabled' : 'Disabled', form.alertPurchase ? 'green' : 'muted'],
                    ['Balance Alert', form.alertBalance ? '✔ Enabled' : 'Disabled', form.alertBalance ? 'green' : 'muted'],
                    ['License Alert', form.alertLicenseExpiry ? '✔ Enabled' : 'Disabled', form.alertLicenseExpiry ? 'green' : 'muted'],
                    ['Created By', 'Admin User'],
                    ['Created Date', new Date().toLocaleDateString('en-IN')],
                    ['Modified By', '—', 'muted'],
                  ]} />
                </>}

              </div>{/* /form content */}
            </div>{/* /body */}

            {/* Step dots + footer */}
            <div style={{ padding:'10px 24px', background:'var(--bg)', borderTop:'1px solid var(--border)', display:'flex', gap:4, alignItems:'center', flexShrink:0 }}>
              {STEPS.map((s, i) => (
                <div key={i} onClick={() => goStep(i)} title={s.label} style={{
                  height:6, borderRadius:3, cursor:'pointer', transition:'all .2s',
                  width: i === step ? 18 : 6,
                  background: i === step ? 'var(--primary)' : done.has(i) ? 'var(--accent)' : 'var(--border)',
                }} />
              ))}
            </div>

            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-outline" onClick={() => setShowDrawer(false)}><i className="fas fa-times" /> Cancel</button>
                {step > 0 && <button className="btn btn-outline" onClick={() => goStep(step-1)}><i className="fas fa-arrow-left" /> Previous</button>}
              </div>
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={() => goStep(step + 1)}>Next <i className="fas fa-arrow-right" /></button>
              ) : (
                <button className="btn btn-success" onClick={handleSubmit} disabled={saveMut.isPending}>
                  {saveMut.isPending ? <><div className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Registering…</> : <><i className="fas fa-save" /> Register Vendor</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="modal-overlay-small">
          <div className="confirm-modal">
            <div style={{ width:48, height:48, borderRadius:12, background:'var(--danger-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <i className="fas fa-trash" style={{ color:'var(--danger)', fontSize:22 }} />
            </div>
            <h3>Delete Vendor?</h3>
            <p>This will permanently delete the vendor and all associated records.</p>
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
