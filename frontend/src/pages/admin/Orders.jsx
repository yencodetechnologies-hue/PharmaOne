import { useState } from 'react'
import { useOrders, useSaveOrder, useDeleteOrder, useVendors } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const initItem={materialName:'',brand:'',qty:'',price:''}
const init={vendorName:'',vendorId:'',orderDate:'',status:'Pending',notes:'',items:[{...initItem}]}
const SC={Pending:'warning',Approved:'info',Delivered:'success',Cancelled:'danger'}
export default function Orders() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState({...init,items:[{...initItem}]});const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useOrders();const {data:vendors=[]}=useVendors()
  const saveMut=useSaveOrder();const deleteMut=useDeleteOrder()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm({...init,items:[{...initItem}]});setShowModal(true)}
  const openEdit=(o)=>{setEditing(o._id);setForm({vendorName:o.vendorName||'',vendorId:o.vendorId||'',orderDate:o.orderDate?.slice(0,10)||'',status:o.status||'Pending',notes:o.notes||'',items:o.items?.length?o.items:[{...initItem}]});setShowModal(true)}
  const addItem=()=>setForm({...form,items:[...form.items,{...initItem}]})
  const updItem=(i,k,v)=>setForm({...form,items:form.items.map((it,idx)=>idx===i?{...it,[k]:v}:it)})
  const remItem=(i)=>setForm({...form,items:form.items.filter((_,idx)=>idx!==i)})
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:{...form,items:JSON.stringify(form.items)}},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const filtered=data.filter(d=>`${d.vendorName} ${d.status}`.toLowerCase().includes(search.toLowerCase()))
  const grandTotal=form.items.reduce((s,it)=>s+(Number(it.qty||0)*Number(it.price||0)),0)
  return (
    <div>
      <div className="page-header"><div><h1>Order List</h1><p>{data.length} orders</p></div><button className="btn btn-primary" onClick={openCreate}>+ New Order</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search orders..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>📦</div><h3>No orders</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Date</th><th>Vendor</th><th>Items</th><th>Total Value</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(d=>{const items=Array.isArray(d.items)?d.items:(typeof d.items==='string'?JSON.parse(d.items||'[]'):[]);const tv=items.reduce((s,it)=>s+(Number(it.qty||0)*Number(it.price||0)),0);return(<tr key={d._id}><td style={{fontSize:13}}>{d.orderDate?new Date(d.orderDate).toLocaleDateString('en-IN'):'—'}</td><td style={{fontWeight:600}}>{d.vendorName||'—'}</td><td style={{fontSize:13}}>{items.length} item(s)</td><td style={{fontWeight:700,color:'var(--primary)'}}>₹{tv.toLocaleString('en-IN')}</td><td><span className={`badge badge-${SC[d.status]||'primary'}`}>{d.status}</span></td><td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td></tr>)})}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg" style={{maxWidth:780}}>
        <div className="modal-header"><h2>{editing?'✏️ Edit Order':'+ New Order'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="section-title">Order Details</div>
            <div className="grid-3">
              <div className="form-group"><label>Vendor *</label><select className="form-control" value={form.vendorId} onChange={e=>{const v=vendors.find(v=>v._id===e.target.value);setForm({...form,vendorId:e.target.value,vendorName:v?.distributorName||''})}}><option value="">Select Vendor</option>{vendors.map(v=><option key={v._id} value={v._id}>{v.distributorName}</option>)}</select></div>
              <div className="form-group"><label>Order Date *</label><input {...F('orderDate')} type="date" required/></div>
              <div className="form-group"><label>Status</label><select {...F('status')}>{['Pending','Approved','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="section-title" style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>Order Items<button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Add Item</button></div>
            <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'var(--bg2)'}}>{['Material Name','Brand','Qty','Price (₹)','Total',''].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:12,fontWeight:700,color:'var(--text-muted)'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {form.items.map((item,i)=>(<tr key={i} style={{borderTop:'1px solid var(--border)'}}>
                    <td style={{padding:8}}><input className="form-control" value={item.materialName} onChange={e=>updItem(i,'materialName',e.target.value)} placeholder="Material name" required/></td>
                    <td style={{padding:8}}><input className="form-control" value={item.brand} onChange={e=>updItem(i,'brand',e.target.value)} placeholder="Brand"/></td>
                    <td style={{padding:8,width:90}}><input className="form-control" type="number" value={item.qty} onChange={e=>updItem(i,'qty',e.target.value)} placeholder="0"/></td>
                    <td style={{padding:8,width:110}}><input className="form-control" type="number" value={item.price} onChange={e=>updItem(i,'price',e.target.value)} placeholder="0.00"/></td>
                    <td style={{padding:8,width:110,fontWeight:700,color:'var(--primary)'}}>₹{(Number(item.qty||0)*Number(item.price||0)).toLocaleString('en-IN')}</td>
                    <td style={{padding:8,width:40}}>{form.items.length>1&&<button type="button" onClick={()=>remItem(i)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--danger)',fontSize:16}}>✕</button>}</td>
                  </tr>))}
                  <tr style={{borderTop:'2px solid var(--border)',background:'var(--bg2)'}}><td colSpan={4} style={{padding:'10px 12px',fontWeight:700,textAlign:'right'}}>Grand Total</td><td style={{padding:'10px 12px',fontWeight:800,color:'var(--primary)',fontSize:15}}>₹{grandTotal.toLocaleString('en-IN')}</td><td/></tr>
                </tbody>
              </table>
            </div>
            <div className="form-group" style={{marginTop:12}}><label>Notes</label><textarea {...F('notes')} className="form-control" rows={2}/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Create')} Order</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
