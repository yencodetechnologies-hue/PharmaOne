import { useState } from 'react'
import { usePaymentModes, useSavePaymentMode, useDeletePaymentMode } from '../../../hooks/useAdminMutations'

// ── Payment mode icons/colors by type ───────────────────────────────────────
const TYPE_CONFIG = {
  'Cash':           { emoji:'💵', bg:'#E8F5E9', badge:'badge-emerald', label:'Cash' },
  'Digital / UPI':  { emoji:'📱', bg:'#E3F2FD', badge:'badge-blue',   label:'Digital' },
  'Card':           { emoji:'💳', bg:'#E1F5FE', badge:'badge-indigo',  label:'Card' },
  'Bank Transfer':  { emoji:'🏦', bg:'#F3E5F5', badge:'badge-teal',   label:'Bank' },
  'Cheque':         { emoji:'📝', bg:'#FCE4EC', badge:'badge-teal',   label:'Bank' },
  'Demand Draft':   { emoji:'📄', bg:'#FFF8E1', badge:'badge-teal',   label:'Bank' },
  'Wallet':         { emoji:'👝', bg:'#E0F7FA', badge:'badge-blue',   label:'Digital' },
  'Insurance':      { emoji:'🏥', bg:'#FBE9E7', badge:'badge-rose',   label:'Credit' },
  'Credit Billing': { emoji:'🧾', bg:'#EDE7F6', badge:'badge-purple', label:'Credit' },
}
const getType = t => TYPE_CONFIG[t] || { emoji:'💳', bg:'#E8F4FD', badge:'badge-blue', label:t || '—' }

const PAYMENT_TYPES = ['Cash','Digital / UPI','Card','Bank Transfer','Cheque','Demand Draft','Wallet','Insurance','Credit Billing']

const initForm = {
  modeName:'', paymentType:'', description:'', status:'Active', isActive:true,
  accountName:'', accountNumber:'', bankName:'', bankBranchName:'', ifscCode:'', upiId:'', qrCodeImage:'',
  transactionCharges:'', dailyLimit:'', allowRefund:true, isDefault:false,
  branch:'All Branches', collectionAccount:'',
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', border:'1.5px solid var(--border)', borderRadius:10, marginBottom:10, background:'#fff' }}>
      <i className={`fas ${icon}`} style={{ color:'var(--text-mid)', width:16, textAlign:'center', fontSize:14 }} />
      <span style={{ flex:1, fontSize:13, fontWeight:500, color:'var(--text-mid)' }}>{label}</span>
      <label style={{ position:'relative', display:'inline-block', width:46, height:25, flexShrink:0 }}>
        <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
        <span style={{ position:'absolute', cursor:'pointer', inset:0, background: checked ? 'var(--primary)' : '#CBD5E0', borderRadius:25, transition:'0.25s' }}>
          <span style={{ position:'absolute', width:19, height:19, background:'#fff', borderRadius:'50%', top:3, left: checked ? 24 : 3, transition:'0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
        </span>
      </label>
    </div>
  )
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SecLabel({ icon, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'18px 0 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--text-mid)' }}>
      <i className={`fas ${icon}`} style={{ color:'var(--primary)', fontSize:13 }} /> {label}
    </div>
  )
}

// ── Form Grid ─────────────────────────────────────────────────────────────────
const G2 = ({ children, style }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14, ...style }}>{children}</div>
const G3 = ({ children })         => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>{children}</div>

// ── Form Group ────────────────────────────────────────────────────────────────
const FG = ({ label, req, opt, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)' }}>
      {label}
      {req && <span style={{ color:'var(--danger)' }}> *</span>}
      {opt && <span style={{ fontSize:10, color:'var(--text-light)', fontWeight:400 }}> (Optional)</span>}
    </label>
    {children}
  </div>
)

const inp = { border:'1.5px solid var(--border)', borderRadius:9, padding:'9px 12px', fontSize:13, color:'var(--text-dark)', background:'#fff', outline:'none', fontFamily:'var(--font)', width:'100%' }
const Inp = ({ value, onChange, ...rest }) => <input style={inp} value={value ?? ''} onChange={onChange} {...rest} />
const Sel = ({ value, onChange, children }) => <select style={{ ...inp, cursor:'pointer' }} value={value ?? ''} onChange={onChange}>{children}</select>
const Txt = ({ value, onChange, ...rest }) => <textarea style={{ ...inp, resize:'vertical', minHeight:60 }} value={value ?? ''} onChange={onChange} {...rest} />

const PrefixInp = ({ prefix, value, onChange, ...rest }) => (
  <div style={{ display:'flex', border:'1.5px solid var(--border)', borderRadius:9, overflow:'hidden', transition:'border-color .2s' }}
    onFocusCapture={e => e.currentTarget.style.borderColor='var(--primary)'}
    onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}>
    <span style={{ padding:'9px 11px', background:'var(--bg)', borderRight:'1.5px solid var(--border)', fontSize:12, fontWeight:600, color:'var(--text-light)', whiteSpace:'nowrap', flexShrink:0 }}>{prefix}</span>
    <input style={{ border:'none', outline:'none', background:'transparent', flex:1, padding:'9px 12px', fontSize:13, color:'var(--text-dark)', fontFamily:'var(--font)' }} value={value ?? ''} onChange={onChange} {...rest} />
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
export default function PaymentModes() {
  const [search, setSearch]     = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = usePaymentModes()
  const saveMut   = useSavePaymentMode()
  const deleteMut = useDeletePaymentMode()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const F   = k => ({ value: form[k] ?? '', onChange: e => set(k, e.target.value) })

  const openCreate = () => { setEditing(null); setForm(initForm); setShowDrawer(true) }
  const openEdit   = r => { setEditing(r._id); setForm({ ...initForm, ...r }); setShowDrawer(true) }
  const handleSave = () => {
    const payload = { ...form, isActive: form.status === 'Active' }
    saveMut.mutate({ id: editing, data: payload }, { onSuccess: () => { setShowDrawer(false); setEditing(null) } })
  }

  const filtered = data.filter(d => {
    const q = search.toLowerCase()
    return (!q || (d.modeName || '').toLowerCase().includes(q))
      && (!filterType   || d.paymentType === filterType)
      && (!filterStatus || (filterStatus === 'Active' ? d.isActive : !d.isActive))
  })

  const activeCount   = data.filter(d => d.isActive || d.status === 'Active').length
  const digitalCount  = data.filter(d => d.paymentType === 'Digital / UPI' || d.paymentType === 'Wallet').length
  const bankCount     = data.filter(d => d.paymentType === 'Bank Transfer' || d.paymentType === 'Cheque').length

  // Preview name/type live
  const previewType = getType(form.paymentType)
  const previewName = form.modeName || 'Payment Mode Name'

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="topbar-breadcrumb" style={{ marginBottom:4 }}>
            <a href="/dashboard">Dashboard</a><span className="sep"> › </span>
            <a>Masters</a><span className="sep"> › </span>
            <span className="current">Payment Mode Master</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>Payment Mode Master</h2>
          <p style={{ fontSize:13, color:'var(--text-light)', marginTop:3 }}>Configure payment modes for billing, pharmacy, vendor payments, salary and refunds</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline"><i className="fas fa-download" /> Export</button>
          <button className="btn btn-primary" style={{ background:'#E65100', borderColor:'#E65100', boxShadow:'0 4px 12px rgba(230,81,0,0.3)' }} onClick={openCreate}>
            <i className="fas fa-plus" /> Add Payment Mode
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-row" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:20 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#FBE9E7', color:'#E65100' }}><i className="fas fa-credit-card" /></div><div><div className="stat-value">{data.length}</div><div className="stat-label">Payment Modes</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><i className="fas fa-check-circle" /></div><div><div className="stat-value">{activeCount}</div><div className="stat-label">Active Modes</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><i className="fas fa-mobile-alt" /></div><div><div className="stat-value">{digitalCount}</div><div className="stat-label">Digital / UPI</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#E8F5E9', color:'#2E7D32' }}><i className="fas fa-university" /></div><div><div className="stat-value">{bankCount}</div><div className="stat-label">Bank Transfer</div></div></div>
      </div>

      {/* ── Payment Mode Cards Grid ── */}
      {data.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
          {data.filter(d => d.isActive || d.status === 'Active').map(d => {
            const tc = getType(d.paymentType)
            return (
              <div key={d._id} style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:14, padding:'18px 16px', cursor:'pointer', transition:'all .18s', boxShadow:'var(--shadow)', position:'relative' }}
                onClick={() => openEdit(d)}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';  e.currentTarget.style.boxShadow='var(--shadow)' }}>
                {d.isDefault && <span style={{ position:'absolute', top:10, right:12, fontSize:14 }}>⭐</span>}
                <div style={{ width:48, height:48, borderRadius:12, background:tc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:12 }}>{tc.emoji}</div>
                <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-dark)', marginBottom:4 }}>{d.modeName}</h4>
                <p style={{ fontSize:12, color:'var(--text-light)', marginBottom:10 }}>
                  {tc.label}{d.transactionCharges > 0 ? ` · ${d.transactionCharges}% charges` : ' · 0% charges'}
                </p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <span className="badge badge-green">Active</span>
                  <span className={`badge ${tc.badge}`}>{tc.label}</span>
                  {d.isDefault && <span className="badge badge-emerald">Default</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Quick Add when empty ── */}
      {data.length === 0 && !isLoading && (
        <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
          <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:12 }}>Quick add common payment modes:</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {['Cash','Google Pay','PhonePe','Credit Card','Debit Card','IMPS / NEFT','Cheque','Insurance'].map(m => (
              <button key={m} className="btn btn-outline btn-sm" onClick={() => saveMut.mutate({ id:null, data:{ modeName:m, status:'Active', isActive:true, allowRefund:true, branch:'All Branches' } })}>+ {m}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── List Panel ── */}
      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si"><i className="fas fa-search" /></span>
            <input placeholder="Search payment mode…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong></div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="loading"><div className="spinner" />Loading payment modes…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><i className="fas fa-credit-card" /></div><h3>No payment modes found</h3><p>Click "+ Add Payment Mode" to create one</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" style={{ accentColor:'var(--primary)', width:15, height:15 }} /></th>
                  <th>Payment Mode</th><th>Type</th><th>Bank / Account</th><th>UPI ID</th>
                  <th>Charges %</th><th>Refund</th><th>Default</th><th>Branch</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const tc = getType(d.paymentType)
                  const isActive = d.isActive || d.status === 'Active'
                  const charges = parseFloat(d.transactionCharges) || 0
                  return (
                    <tr key={d._id}>
                      <td><input type="checkbox" style={{ accentColor:'var(--primary)', width:15, height:15 }} /></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:9, background:tc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{tc.emoji}</div>
                          <div>
                            <strong style={{ fontSize:13, fontWeight:700, color:'var(--text-dark)', display:'block' }}>{d.modeName}</strong>
                            <small style={{ fontSize:11, color:'var(--text-light)' }}>{d.paymentType || '—'}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${tc.badge}`}>{tc.label}</span></td>
                      <td style={{ fontSize:12 }}>
                        {d.accountName ? `${d.bankName || ''} ${d.accountName}`.trim() : <span style={{ color:'var(--text-light)' }}>N/A</span>}
                      </td>
                      <td style={{ fontSize:11, fontFamily:'monospace' }}>{d.upiId || <span style={{ color:'var(--text-light)', fontFamily:'var(--font)' }}>N/A</span>}</td>
                      <td style={{ fontWeight:700, color: charges > 0 ? 'var(--warning)' : 'var(--accent)' }}>{charges}%</td>
                      <td><span className={`badge ${d.allowRefund !== false ? 'badge-green' : 'badge-red'}`}>{d.allowRefund !== false ? 'Yes' : 'No'}</span></td>
                      <td style={{ fontSize:16 }}>{d.isDefault ? <span style={{ color:'#F39C12' }}>⭐</span> : <span style={{ color:'var(--text-light)' }}>☆</span>}</td>
                      <td style={{ fontSize:12 }}>{d.branch || 'All'}</td>
                      <td><span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>{isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="act-btn" title="View"><i className="fas fa-eye" /></button>
                          <button className="act-btn" title="Edit" onClick={() => openEdit(d)}><i className="fas fa-edit" /></button>
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
          <div className="pagination-info">Showing 1–{filtered.length} of {filtered.length}</div>
          <div className="pagination-btns">
            <button className="pg-btn"><i className="fas fa-chevron-left" /></button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">2</button>
            <button className="pg-btn"><i className="fas fa-chevron-right" /></button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ADD / EDIT DRAWER
      ═══════════════════════════════════════════════════════════ */}
      {showDrawer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(26,35,64,0.35)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDrawer(false) }}>
          <div style={{ width:660, maxWidth:'96vw', height:'100vh', background:'#fff', display:'flex', flexDirection:'column', boxShadow:'-8px 0 40px rgba(13,110,172,0.15)', animation:'slideIn .22s ease' }}>

            {/* Drawer Header — amber gradient like HTML */}
            <div style={{ padding:'18px 24px', background:'linear-gradient(135deg,#E65100,#F39C12)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <div style={{ width:42, height:42, background:'rgba(255,255,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff', flexShrink:0 }}>
                <i className="fas fa-credit-card" />
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:700, color:'#fff', marginBottom:2 }}>{editing ? 'Edit Payment Mode' : 'Add Payment Mode'}</h3>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Cash · UPI · Card · Bank Transfer · Insurance · Others</p>
              </div>
              <button onClick={() => setShowDrawer(false)} style={{ width:34, height:34, border:'none', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:16, cursor:'pointer', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

              {/* Live Preview Card */}
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'linear-gradient(135deg,#FBE9E7,#FFF3E0)', border:'1.5px solid #FFCCBC', borderRadius:12, marginBottom:18 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,#E65100,#F39C12)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                  {previewType.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <strong style={{ fontSize:15, fontWeight:700, color:'var(--text-dark)', display:'block' }}>{previewName}</strong>
                  <span style={{ fontSize:12, color:'var(--text-light)' }}>Payment Type · {form.paymentType || 'Bank'}</span>
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#E65100', background:'rgba(230,81,0,0.1)', padding:'2px 8px', borderRadius:6 }}>PMT-016</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--accent)', background:'var(--accent-light)', padding:'2px 8px', borderRadius:6 }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:9, padding:'11px 14px', marginBottom:20 }}>
                <i className="fas fa-info-circle" style={{ color:'#E65100', flexShrink:0, marginTop:1, fontSize:13 }} />
                <span style={{ fontSize:12, color:'#E65100', fontWeight:500, lineHeight:1.5 }}>Payment modes configured here appear in Invoice, Billing, Purchase, Salary, Vendor Payments and Refund screens.</span>
              </div>

              {/* ── BASIC INFORMATION ── */}
              <SecLabel icon="fa-info-circle" label="Basic Information" />
              <G3>
                <FG label="Payment Mode ID">
                  <Inp value="PMT-016" readOnly style={{ ...inp, background:'var(--bg)', color:'var(--text-light)', cursor:'not-allowed' }} />
                </FG>
                <FG label="Payment Mode Name" req>
                  <Inp {...F('modeName')} placeholder="e.g. Google Pay, Cash" />
                </FG>
                <FG label="Status">
                  <Sel {...F('status')}><option>Active</option><option>Inactive</option></Sel>
                </FG>
              </G3>
              <G2>
                <FG label="Payment Type" req>
                  <Sel {...F('paymentType')}>
                    <option value="">Select Type</option>
                    {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Sel>
                </FG>
                <FG label="Description">
                  <Txt {...F('description')} placeholder="Brief description…" style={{ ...inp, resize:'vertical', minHeight:42 }} />
                </FG>
              </G2>

              {/* ── BANK & UPI DETAILS ── */}
              <SecLabel icon="fa-university" label="Bank & UPI Details" />
              <G2>
                <FG label="Account Name"><Inp {...F('accountName')} placeholder="Linked bank account name" /></FG>
                <FG label="Account Number"><Inp {...F('accountNumber')} placeholder="Bank account number" /></FG>
                <FG label="Bank Name"><Inp {...F('bankName')} placeholder="e.g. HDFC Bank" /></FG>
                <FG label="Branch Name"><Inp {...F('bankBranchName')} placeholder="Bank branch" /></FG>
                <FG label="IFSC Code"><Inp {...F('ifscCode')} placeholder="HDFC0001234" style={{ textTransform:'uppercase' }} /></FG>
                <FG label="UPI ID"><Inp {...F('upiId')} placeholder="pharmaone@hdfc" /></FG>
              </G2>

              {/* ── QR CODE UPLOAD ── */}
              <FG label="QR Code Image" opt>
                <div style={{ border:'2px dashed #FFCCBC', borderRadius:10, padding:'28px 16px', textAlign:'center', cursor:'pointer', marginBottom:18, background: form.qrCodeImage ? '#FFF8E1' : '#FFFDE7' }}
                  onClick={() => {}}>
                  <i className="fas fa-qrcode" style={{ fontSize:28, color: form.qrCodeImage ? '#E65100' : 'var(--text-light)', marginBottom:10, display:'block' }} />
                  <p style={{ fontSize:13, fontWeight:600, color: form.qrCodeImage ? '#E65100' : 'var(--text-mid)', marginBottom:4 }}>
                    {form.qrCodeImage ? '✓ QR Code uploaded' : 'Upload Payment QR Code'}
                  </p>
                  <span style={{ fontSize:11, color:'var(--text-light)' }}>PNG / JPG · Max 2MB</span>
                </div>
              </FG>

              {/* ── CONFIGURATION ── */}
              <SecLabel icon="fa-cog" label="Configuration" />
              <G2 style={{ marginBottom:12 }}>
                <FG label="Transaction Charges (%)">
                  <PrefixInp prefix="%" {...F('transactionCharges')} type="number" placeholder="0.0" step="0.1" min="0" max="10" />
                </FG>
                <FG label="Daily Limit (₹)">
                  <PrefixInp prefix="₹" {...F('dailyLimit')} type="number" placeholder="Leave blank for unlimited" />
                </FG>
              </G2>
              <ToggleRow icon="fa-undo" label="Allow Refund via this Mode" checked={form.allowRefund} onChange={v => set('allowRefund', v)} />
              <ToggleRow icon="fa-star" label="Set as Default Payment Mode" checked={form.isDefault} onChange={v => set('isDefault', v)} />

              {/* ── MULTI-BRANCH SETTINGS ── */}
              <SecLabel icon="fa-building" label="Multi-Branch Settings" />
              <G2>
                <FG label="Branch" req>
                  <Sel {...F('branch')}>
                    <option>All Branches</option>
                    <option>CHN001 – Velachery</option>
                    <option>CHN002 – Anna Nagar</option>
                    <option>CBE001 – Coimbatore</option>
                  </Sel>
                </FG>
                <FG label="Collection Account">
                  <Inp {...F('collectionAccount')} placeholder="Linked collection account" />
                </FG>
              </G2>

              {/* ── AUDIT (AUTO) ── */}
              <div style={{ height:1, background:'var(--border)', margin:'16px 0' }} />
              <SecLabel icon="fa-shield-alt" label="Audit (Auto)" />
              <G2>
                <FG label="Created Date"><Inp value={editing ? new Date().toLocaleDateString('en-IN') : new Date().toLocaleString('en-IN', { hour12:true })} readOnly style={{ ...inp, background:'var(--bg)', color:'var(--text-light)', cursor:'not-allowed' }} /></FG>
                <FG label="Modified Date"><Inp value="—" readOnly style={{ ...inp, background:'var(--bg)', color:'var(--text-light)', cursor:'not-allowed' }} /></FG>
              </G2>

            </div>{/* /body */}

            {/* Drawer Footer */}
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', flexShrink:0 }}>
              <button className="btn btn-outline" onClick={() => setShowDrawer(false)}><i className="fas fa-times" /> Cancel</button>
              <button onClick={handleSave} disabled={saveMut.isPending} style={{
                padding:'10px 24px', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer',
                background: saveMut.isPending ? '#ccc' : 'linear-gradient(135deg,#E65100,#F39C12)',
                color:'#fff', display:'flex', alignItems:'center', gap:8,
                boxShadow: saveMut.isPending ? 'none' : '0 4px 12px rgba(230,81,0,0.35)', fontFamily:'var(--font)',
              }}>
                {saveMut.isPending
                  ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2, borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Saving…</>
                  : <><i className="fas fa-save" /> Save Payment Mode</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {deleteId && (
        <div className="modal-overlay-small">
          <div className="confirm-modal">
            <div style={{ width:48, height:48, borderRadius:12, background:'var(--danger-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <i className="fas fa-trash" style={{ color:'var(--danger)', fontSize:22 }} />
            </div>
            <h3>Delete Payment Mode?</h3>
            <p>This will permanently remove this payment mode from all billing screens.</p>
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
