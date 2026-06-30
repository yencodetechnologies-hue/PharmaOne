import { useState, useMemo } from 'react'
import { useProducts, useSaveProduct, useDeleteProduct, useCategories, useBrands } from '../../../hooks/useAdminMutations'
import { ConfirmModal } from '../../../components/common/UIComponents'
import '../../../styles/product.css'

const initForm = {
  productCode:'', barcode:'', productName:'', genericName:'', brandName:'', category:'', subCategory:'',
  manufacturerName:'', vendorName:'', productType:'',
  composition:'', strength:'', dosageForm:'', packSize:'', hsnCode:'', scheduleType:'', storageCondition:'',
  purchasePrice:'', landingCost:'', mrp:'', sellingPrice:'', marginPercent:'', discountPercent:'',
  gstPercent:'12', cgstPercent:'', sgstPercent:'', igstPercent:'',
  openingStock:'', currentStock:'', minStockLevel:'', maxStockLevel:'', reorderLevel:'', reorderQty:'',
  unitOfMeasure:'', batchNumber:'', serialNumber:'', manufacturingDate:'', expiryDate:'', shelfLife:'',
  preferredVendor:'', vendorProductCode:'', lastPurchasePrice:'', lastPurchaseDate:'',
  description:'', usageInstructions:'', sideEffects:'', notes:'', isActive: true,
  productImage:null, productBrochure:null, productCertificate:null, drugLicenseCopy:null,
}

const STEPS = [
  { id: 'basic',      num: 1, label: 'Basic Info',       sub: 'Product identity',         icon: '🆔' },
  { id: 'medicine',   num: 2, label: 'Medicine Details',  sub: 'Composition & form',        icon: '💊' },
  { id: 'pricing',    num: 3, label: 'Pricing',           sub: 'MRP & margins',             icon: '₹' },
  { id: 'stock',      num: 4, label: 'Stock Details',     sub: 'Levels & units',            icon: '📦' },
  { id: 'batch',      num: 5, label: 'Batch Details',     sub: 'Batch & expiry',            icon: '🏷️' },
  { id: 'supplier',   num: 6, label: 'Supplier',          sub: 'Vendor info',               icon: '🚚' },
  { id: 'images',     num: 7, label: 'Images & Docs',     sub: 'Uploads',                   icon: '🖼️' },
  { id: 'additional', num: 8, label: 'Additional Info',   sub: 'Notes & usage',             icon: 'ℹ️' },
  { id: 'review',     num: 9, label: 'Review',            sub: 'Confirm & save',            icon: '✅' },
]

function genProductId() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `PRD-${n}`
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [deleteId, setDeleteId] = useState(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [productId, setProductId] = useState('')

  const { data = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const saveMut = useSaveProduct()
  const deleteMut = useDeleteProduct()

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const FFile = k => ({ onChange: e => setForm({ ...form, [k]: e.target.files?.[0] || null }) })

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(d => d.isActive).length
    const inStock = data.filter(d => (d.currentStock || 0) > (d.minStockLevel || 0)).length
    const low = data.filter(d => (d.currentStock || 0) > 0 && (d.currentStock || 0) <= (d.minStockLevel || 0)).length
    const out = data.filter(d => (d.currentStock || 0) <= 0).length
    return { total, active, inStock, low, out }
  }, [data])

  const openCreate = () => {
    setEditing(null)
    setForm(initForm)
    setProductId(genProductId())
    setStepIdx(0)
    setShowDrawer(true)
  }
  const openEdit = r => {
    setEditing(r._id)
    setForm({ ...initForm, ...r, manufacturingDate: r.manufacturingDate?.slice(0,10)||'', expiryDate: r.expiryDate?.slice(0,10)||'', lastPurchaseDate: r.lastPurchaseDate?.slice(0,10)||'' })
    setProductId(r.productCode || genProductId())
    setStepIdx(0)
    setShowDrawer(true)
  }

  const buildPayload = () => {
    const hasFiles = ['productImage','productBrochure','productCertificate','drugLicenseCopy'].some(k => form[k] instanceof File)
    if (!hasFiles) {
      const { productImage, productBrochure, productCertificate, drugLicenseCopy, ...rest } = form
      return { ...rest, productCode: form.productCode || productId }
    }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    if (!form.productCode) fd.set('productCode', productId)
    return fd
  }

  const handleSubmit = e => {
    e.preventDefault()
    saveMut.mutate({ id: editing, data: buildPayload() }, { onSuccess: () => { setShowDrawer(false); setEditing(null) } })
  }

  const filtered = data.filter(d => `${d.productName} ${d.genericName} ${d.productCode}`.toLowerCase().includes(search.toLowerCase()))

  const goNext = () => setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  const goPrev = () => setStepIdx(i => Math.max(i - 1, 0))
  const isLast = stepIdx === STEPS.length - 1
  const currentStep = STEPS[stepIdx]

  const margin = (() => {
    const pp = parseFloat(form.purchasePrice) || 0
    const sp = parseFloat(form.sellingPrice) || 0
    if (!pp) return '0.00'
    return (((sp - pp) / pp) * 100).toFixed(2)
  })()
  const sellingInclGst = (() => {
    const sp = parseFloat(form.sellingPrice) || 0
    const gst = parseFloat(form.gstPercent) || 0
    return (sp + (sp * gst / 100)).toFixed(2)
  })()

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>💊 Product Master</h2>
          <p>Medicines, surgical items, consumables and equipment catalogue</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline">⬇ Export</button>
          <button className="btn btn-outline">▥ Barcode Print</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">💊</div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Products</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div><div className="stat-value">{stats.inStock}</div><div className="stat-label">In Stock</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div><div className="stat-value">{stats.low}</div><div className="stat-label">Low Stock</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🚫</div>
          <div><div className="stat-value">{stats.out}</div><div className="stat-label">Out of Stock</div></div>
        </div>
      </div>

      <div className="list-panel">
        <div className="list-toolbar">
          <div className="list-search">
            <span className="si">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, SKU, barcode..." />
          </div>
          <select className="filter-select"><option>All Types</option></select>
          <select className="filter-select"><option>All Categories</option></select>
          <select className="filter-select"><option>All Brands</option></select>
          <select className="filter-select"><option>All Status</option></select>
          <div className="list-count">Showing <strong>{filtered.length}</strong> of {data.length}</div>
        </div>

        {isLoading ? <div className="loading"><div className="spinner" />Loading...</div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">💊</div><h3>No products found</h3><p>Try adding your first product</p></div>
          : <div className="table-wrap"><table>
              <thead><tr><th>Code</th><th>Product</th><th>Type</th><th>Category</th><th>Brand</th><th>MRP</th><th>Selling</th><th>GST%</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(r => (
                <tr key={r._id}>
                  <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{r.productCode || '—'}</td>
                  <td>
                    <div className="entity-cell">
                      <div className="entity-logo">{(r.productName || '?').slice(0,1).toUpperCase()}</div>
                      <div>
                        <strong>{r.productName}</strong>
                        <small>{r.genericName}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{r.productType}</span></td>
                  <td style={{ fontSize: 13 }}>{r.category || '—'}</td>
                  <td style={{ fontSize: 13 }}>{r.brandName || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{r.mrp || 0}</td>
                  <td>₹{r.sellingPrice || 0}</td>
                  <td><span className="badge badge-purple">{r.gstPercent || 0}%</span></td>
                  <td>
                    <span className={`badge ${(r.currentStock || 0) <= (r.minStockLevel || 0) ? 'badge-red' : 'badge-green'}`}>
                      {r.currentStock || 0} {r.unitOfMeasure}
                    </span>
                  </td>
                  <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="act-btn" onClick={() => openEdit(r)}>✏️</button>
                      <button className="act-btn danger" onClick={() => setDeleteId(r._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>}
      </div>

      {showDrawer && (
        <div className="drawer-overlay">
          <div className="drawer drawer-wide">
            <div className="drawer-header">
              <div className="dh-icon">💊</div>
              <div style={{ flex: 1 }}>
                <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
                <p>Medicine · Surgical · Consumable · Equipment</p>
              </div>
              <div className="dh-badge">{isLast ? 'Review' : `Step ${stepIdx + 1} / ${STEPS.length}`}</div>
              <button className="drawer-close" onClick={() => setShowDrawer(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="drawer-body-wrap">
                <div className="drawer-steps">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.id}
                      className={`step-nav-item ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''} ${s.id === 'review' ? 'review-step' : ''}`}
                      onClick={() => setStepIdx(i)}
                    >
                      <span className="step-num">{i < stepIdx ? '✓' : s.num}</span>
                      <span className="step-nav-text">
                        <strong>{s.label}</strong>
                        <span>{s.sub}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="drawer-content">

                  {currentStep.id === 'basic' && <>
                    <div className="fs-title"><span className="fs-icon">🆔</span><div><h4>Basic Information</h4><p>Product identity and classification</p></div></div>
                    <div className="prod-banner">
                      <div className="prod-banner-icon">💊</div>
                      <div>
                        <div className="prod-banner-name">{form.productName || 'Product Name'}</div>
                        <div className="prod-banner-sub">{form.brandName || 'Brand'} · {form.category || 'Category'}</div>
                      </div>
                      <div className="prod-banner-badges">
                        <span className="badge badge-blue">{productId}</span>
                        <span className="badge badge-green">{form.productType || 'Medicine'}</span>
                      </div>
                    </div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>Product ID</label><input value={productId} readOnly /></div>
                      <div className="form-group"><label>Product Code / SKU <span className="req">*</span></label><input placeholder="e.g. AMX-500-CAP" {...F('productCode')} required /></div>
                      <div className="form-group"><label>Barcode</label><input placeholder="Scan or enter barcode" {...F('barcode')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Product Name <span className="req">*</span></label><input placeholder="e.g. Amoxicillin 500mg" {...F('productName')} required /></div>
                      <div className="form-group"><label>Generic Name</label><input placeholder="Generic / Chemical name" {...F('genericName')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Product Type <span className="req">*</span></label>
                        <select {...F('productType')} required>
                          <option value="">Select Type</option>
                          <option>Medicine</option><option>Surgical</option><option>Consumable</option><option>Equipment</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Brand Name <span className="req">*</span></label>
                        <select {...F('brandName')} required>
                          <option value="">Select Brand</option>
                          {brands.map(b => <option key={b._id} value={b.brandName}>{b.brandName}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Category <span className="req">*</span></label>
                        <select {...F('category')} required>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c._id} value={c.categoryName}>{c.categoryName}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>Sub Category</label>
                        <select {...F('subCategory')}><option value="">Select Sub Category</option></select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Manufacturer Name</label><input {...F('manufacturerName')} /></div>
                      <div className="form-group"><label>Vendor Name <span className="req">*</span></label><input {...F('vendorName')} required /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Status</label>
                        <select value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                          <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </>}

                  {currentStep.id === 'medicine' && <>
                    <div className="fs-title"><span className="fs-icon">💊</span><div><h4>Medicine Details</h4><p>Composition, form, schedule and storage</p></div></div>
                    <div className="info-box"><p>ℹ️ Fill these fields for medicine and pharmaceutical products. Skip for surgical or equipment items.</p></div>
                    <div className="form-grid form-grid-1">
                      <div className="form-group"><label>Composition</label><input placeholder="e.g. Amoxicillin 500mg + Clavulanate 125mg" {...F('composition')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Strength</label><input placeholder="e.g. 500mg, 250mg, 10ml" {...F('strength')} /></div>

                      <div className="form-group"><label>Dosage Form <span className="req">*</span></label>
                        <select {...F('dosageForm')}>
                          <option value="">Select Form</option>
                          <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option><option>Cream</option><option>Ointment</option><option>Drops</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Pack Size</label><input placeholder="e.g. 10 Tablets, 100ml, 1 Vial" {...F('packSize')} /></div>
                      <div className="form-group"><label>HSN Code</label><input placeholder="8-digit HSN" {...F('hsnCode')} /></div>

                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Schedule Type <span className="req">*</span></label>
                        <select {...F('scheduleType')}>
                          <option value="">Select Schedule</option>
                          <option value="OTC">OTC</option><option value="H">H</option><option value="H1">H1</option><option value="X">X</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-1">
                      <div className="form-group"><label>Storage Condition</label><input placeholder="e.g. Store below 25°C, Keep away from sunlight" {...F('storageCondition')} /></div>
                    </div>
                  </>}

                  {currentStep.id === 'pricing' && <>
                    <div className="fs-title"><span className="fs-icon">₹</span><div><h4>Pricing Details</h4><p>Purchase price, MRP, selling price and GST</p></div></div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>Purchase Price <span className="req">*</span></label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input type="number" placeholder="0.00" {...F('purchasePrice')} required /></div>
                      </div>
                      <div className="form-group"><label>Landing Cost</label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input type="number" placeholder="0.00" {...F('landingCost')} /></div>
                      </div>
                      <div className="form-group"><label>MRP <span className="req">*</span></label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input type="number" placeholder="0.00" {...F('mrp')} required /></div>
                      </div>
                    </div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>Selling Price <span className="req">*</span></label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input type="number" placeholder="0.00" {...F('sellingPrice')} required /></div>
                      </div>
                      <div className="form-group"><label>Discount %</label>
                        <div className="input-prefix"><span className="pre-tag">%</span><input type="number" placeholder="0" {...F('discountPercent')} /></div>
                      </div>
                      <div className="form-group"><label>GST % <span className="req">*</span></label>
                        <select {...F('gstPercent')} required>
                          <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>CGST %</label><input type="number" {...F('cgstPercent')} /></div>
                      <div className="form-group"><label>SGST %</label><input type="number" {...F('sgstPercent')} /></div>
                      <div className="form-group"><label>IGST %</label><input type="number" {...F('igstPercent')} /></div>
                    </div>
                    <div className="summary-box">
                      <div className="summary-row"><span>Purchase Price</span><b>₹{(parseFloat(form.purchasePrice)||0).toFixed(2)}</b></div>
                      <div className="summary-row summary-total"><span>MRP</span><b>₹{(parseFloat(form.mrp)||0).toFixed(2)}</b></div>
                      <div className="summary-row summary-total"><span>Selling Price</span><b>₹{(parseFloat(form.sellingPrice)||0).toFixed(2)}</b></div>
                      <div className="summary-row summary-total"><span>Margin</span><b className="positive">{margin}%</b></div>
                      <div className="summary-row summary-total"><span>Selling Price (incl. GST)</span><b>₹{sellingInclGst}</b></div>
                    </div>
                  </>}

                  {currentStep.id === 'stock' && <>
                    <div className="fs-title"><span className="fs-icon">📦</span><div><h4>Stock Details</h4><p>Opening stock, levels and unit of measure</p></div></div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>Opening Stock <span className="req">*</span></label><input type="number" placeholder="0" {...F('openingStock')} required /></div>
                      <div className="form-group"><label>Current Stock</label><input type="number" placeholder="Same as Opening" {...F('currentStock')} /></div>
                      <div className="form-group"><label>Unit of Measure <span className="req">*</span></label>
                        <select {...F('unitOfMeasure')} required>
                          <option value="">Select Unit</option>
                          <option>Nos</option><option>Box</option><option>Strip</option><option>Bottle</option><option>Kg</option><option>Gram</option><option>Litre</option><option>Pack</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-grid form-grid-3">
                      <div className="form-group"><label>Minimum Stock Level</label><input type="number" placeholder="Min stock before alert" {...F('minStockLevel')} /></div>
                      <div className="form-group"><label>Maximum Stock Level</label><input type="number" placeholder="Max stock capacity" {...F('maxStockLevel')} /></div>
                      <div className="form-group"><label>Reorder Level</label><input type="number" placeholder="Trigger reorder at this level" {...F('reorderLevel')} /></div>
                    </div>
                    <div className="form-grid form-grid-1">
                      <div className="form-group"><label>Reorder Quantity</label><input type="number" placeholder="Default order quantity" {...F('reorderQty')} /></div>
                    </div>
                    <div className="info-box warn"><p>⚠️ Low stock alerts will trigger automatically when current stock falls below the Minimum Stock Level.</p></div>
                  </>}

                  {currentStep.id === 'batch' && <>
                    <div className="fs-title"><span className="fs-icon">🏷️</span><div><h4>Batch Details</h4><p>Batch tracking, manufacturing and expiry</p></div></div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Batch Number</label><input placeholder="e.g. BT-2024-0089" {...F('batchNumber')} /></div>
                      <div className="form-group"><label>Serial Number</label><input placeholder="Optional serial number" {...F('serialNumber')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Manufacturing Date</label><input type="date" {...F('manufacturingDate')} /></div>
                      <div className="form-group"><label>Expiry Date <span className="req">*</span></label><input type="date" {...F('expiryDate')} required /></div>
                    </div>
                    <div className="form-grid form-grid-1">
                      <div className="form-group"><label>Shelf Life</label><input placeholder="e.g. 24 months, 3 years" {...F('shelfLife')} /></div>
                    </div>
                  </>}

                  {currentStep.id === 'supplier' && <>
                    <div className="fs-title"><span className="fs-icon">🚚</span><div><h4>Supplier Details</h4><p>Vendor preference and purchase history</p></div></div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Preferred Vendor <span className="req">*</span></label>
                        <select {...F('preferredVendor')} required>
                          <option value="">Select Preferred Vendor</option>
                          {form.vendorName && <option value={form.vendorName}>{form.vendorName}</option>}
                        </select>
                      </div>
                      <div className="form-group"><label>Vendor Product Code</label><input placeholder="Vendor's internal code for this product" {...F('vendorProductCode')} /></div>
                    </div>
                    <div className="form-grid form-grid-2">
                      <div className="form-group"><label>Last Purchase Price</label>
                        <div className="input-prefix"><span className="pre-tag">₹</span><input type="number" placeholder="0.00" {...F('lastPurchasePrice')} /></div>
                      </div>
                      <div className="form-group"><label>Last Purchase Date</label><input type="date" {...F('lastPurchaseDate')} /></div>
                    </div>
                  </>}

                  {/* {currentStep.id === 'images' && <>
                    <div className="fs-title"><span className="fs-icon">🖼️</span><div><h4>Images & Documents</h4><p>Product photo and supporting files</p></div></div>
                    <label className="logo-upload upload-main">
                      <input type="file" accept="image/png,image/jpeg" hidden {...FFile('productImage')} />
                      <div className="upload-icon">📷</div>
                      <p>{form.productImage?.name || 'Upload Product Image'}</p>
                      <span>PNG / JPG · Max 2MB · Recommended 400×400px</span>
                    </label>
                    <div className="form-grid form-grid-3">
                      <label className="logo-upload upload-doc">
                        <input type="file" accept="image/png" hidden {...FFile('productBrochure')} />
                        <div className="upload-icon">📄</div>
                        <p>{form.productBrochure?.name || 'Product Brochure'}</p>
                        <span>PNG · Max 5MB</span>
                      </label>
                      <label className="logo-upload upload-doc">
                        <input type="file" accept="image/png,image/jpeg,application/pdf" hidden {...FFile('productCertificate')} />
                        <div className="upload-icon">⚙️</div>
                        <p>{form.productCertificate?.name || 'Product Certificate'}</p>
                        <span>PDF / JPG · Max 5MB</span>
                      </label>
                      <label className="logo-upload upload-doc">
                        <input type="file" accept="application/pdf" hidden {...FFile('drugLicenseCopy')} />
                        <div className="upload-icon">📄</div>
                        <p>{form.drugLicenseCopy?.name || 'Drug License Copy'}</p>
                        <span>PDF · Max 5MB</span>
                      </label>
                    </div>
                  </>} */}

                  {currentStep.id === 'images' && (
  <>
    <div className="fs-title">
      <span className="fs-icon">🖼️</span>
      <div>
        <h4>Images & Documents</h4>
        <p>Product photo and supporting files</p>
      </div>
    </div>

    {/* Product Image Upload */}
    <label className="upload-main-area">
      <input
        type="file"
        accept="image/png,image/jpeg"
        hidden
        {...FFile('productImage')}
      />

      <div className="upload-main-content">
        <div className="upload-main-icon">📷</div>

        <h4>
          {form.productImage?.name || 'Upload Product Image'}
        </h4>

        <p>
          PNG / JPG · Max 2MB · Recommended 400×400px
        </p>
      </div>
    </label>

    {/* Documents */}
    <div className="upload-doc-grid">

      <label className="upload-doc-card">
        <input
          type="file"
          accept="image/png"
          hidden
          {...FFile('productBrochure')}
        />

        <div className="upload-doc-icon">📄</div>

        <h5>
          {form.productBrochure?.name || 'Product Brochure'}
        </h5>

        <span>PNG · Max 5MB</span>
      </label>

      <label className="upload-doc-card">
        <input
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          hidden
          {...FFile('productCertificate')}
        />

        <div className="upload-doc-icon">⚙️</div>

        <h5>
          {form.productCertificate?.name || 'Product Certificate'}
        </h5>

        <span>PDF / JPG · Max 5MB</span>
      </label>

      <label className="upload-doc-card">
        <input
          type="file"
          accept="application/pdf"
          hidden
          {...FFile('drugLicenseCopy')}
        />

        <div className="upload-doc-icon">📄</div>

        <h5>
          {form.drugLicenseCopy?.name || 'Drug License Copy'}
        </h5>

        <span>PDF · Max 5MB</span>
      </label>

    </div>
  </>
)}

                  {currentStep.id === 'additional' && <>
                    <div className="fs-title"><span className="fs-icon">ℹ️</span><div><h4>Additional Information</h4><p>Usage instructions, side effects and notes</p></div></div>
                    <div className="form-grid form-grid-1">
                      <div className="form-group"><label>Description</label><textarea rows={3} placeholder="Brief product description..." {...F('description')} /></div>
                      <div className="form-group"><label>Usage Instructions</label><textarea rows={3} placeholder="How to use, dosage guidance..." {...F('usageInstructions')} /></div>
                      <div className="form-group"><label>Side Effects</label><textarea rows={2} placeholder="Known side effects or warnings..." {...F('sideEffects')} /></div>
                      <div className="form-group"><label>Notes</label><textarea rows={2} placeholder="Internal notes for pharmacy staff..." {...F('notes')} /></div>
                    </div>
                  </>}

                  {currentStep.id === 'review' && <>
                    <div className="fs-title"><span className="fs-icon">✅</span><div><h4>Review & Confirm</h4><p>Verify all details before adding to product catalogue</p></div></div>
                    <div className="prod-banner">
                      <div className="prod-banner-icon">💊</div>
                      <div>
                        <div className="prod-banner-name">{form.productName || '—'}</div>
                        <div className="prod-banner-sub">{form.brandName || 'Brand'} · {form.category || 'Category'} · {form.productType || 'Type'}</div>
                      </div>
                      <div className="prod-banner-badges">
                        <span className="badge badge-blue">{form.productCode || productId}</span>
                        <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>{form.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    <div className="review-section">
                      <div className="review-title">📦 PRODUCT INFO</div>
                      <div className="form-grid form-grid-3 review-grid">
                        <div><span>PRODUCT ID</span><b>{form.productCode || productId}</b></div>
                        <div><span>NAME</span><b>{form.productName || '—'}</b></div>
                        <div><span>TYPE</span><b>{form.productType || '—'}</b></div>
                        <div><span>CATEGORY</span><b>{form.category || '—'}</b></div>
                        <div><span>BRAND</span><b>{form.brandName || '—'}</b></div>
                        <div><span>STATUS</span><b className="positive">{form.isActive ? 'Active' : 'Inactive'}</b></div>
                      </div>
                    </div>

                    <div className="review-section">
                      <div className="review-title">₹ PRICING</div>
                      <div className="form-grid form-grid-3 review-grid">
                        <div><span>PURCHASE PRICE</span><b>₹{form.purchasePrice || '—'}</b></div>
                        <div><span>MRP</span><b>₹{form.mrp || '—'}</b></div>
                        <div><span>SELLING PRICE</span><b>₹{form.sellingPrice || '—'}</b></div>
                        <div><span>GST %</span><b>{form.gstPercent || '—'}</b></div>
                        <div><span>MARGIN %</span><b className="positive">{margin}</b></div>
                        <div><span>SCHEDULE</span><b>{form.scheduleType || '—'}</b></div>
                      </div>
                    </div>

                    <div className="review-section">
                      <div className="review-title">📊 STOCK</div>
                      <div className="form-grid form-grid-3 review-grid">
                        <div><span>OPENING STOCK</span><b>{form.openingStock || '—'}</b></div>
                        <div><span>MIN STOCK</span><b>{form.minStockLevel || '—'}</b></div>
                        <div><span>REORDER LEVEL</span><b>{form.reorderLevel || '—'}</b></div>
                        <div><span>UNIT</span><b>{form.unitOfMeasure || '—'}</b></div>
                        <div><span>EXPIRY DATE</span><b>{form.expiryDate || '—'}</b></div>
                        <div><span>BATCH NO</span><b>{form.batchNumber || '—'}</b></div>
                      </div>
                    </div>
                  </>}

                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDrawer(false)}>✕ Cancel</button>
                <div className="drawer-footer-right">
                  {stepIdx > 0 && <button type="button" className="btn btn-outline" onClick={goPrev}>← Previous</button>}
                  <div className="progress-dots">
                    {STEPS.map((s, i) => (
                      <span key={s.id} className={`pdot ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`} />
                    ))}
                  </div>
                  {!isLast
                    ? <button type="button" className="btn btn-primary" onClick={goNext}>Next →</button>
                    : <button type="submit" className="btn btn-success" disabled={saveMut.isPending}>
                        {saveMut.isPending ? '⏳ Saving...' : '💾 Add Product'}
                      </button>}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}