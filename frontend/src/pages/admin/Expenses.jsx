import { useState } from 'react'
import { useExpenses, useSaveExpense, useDeleteExpense, useBranches } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const init={title:'',amount:'',category:'Medicine',description:'',date:'',paymentMode:'Cash',branch:''}
export default function Expenses() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useExpenses();const {data:branches=[]}=useBranches()
  const saveMut=useSaveExpense();const deleteMut=useDeleteExpense()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(e)=>{setEditing(e._id);setForm({title:e.title,amount:e.amount,category:e.category||'Medicine',description:e.description||'',date:e.date?.slice(0,10)||'',paymentMode:e.paymentMode||'Cash',branch:e.branch?._id||e.branch||''});setShowModal(true)}
  const handleSubmit=(ev)=>{ev.preventDefault();saveMut.mutate({id:editing,data:form},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const cc={Medicine:'success',Equipment:'info',Staff:'warning',Utilities:'primary',Rent:'danger',Marketing:'info',Other:'primary'}
  const filtered=data.filter(d=>`${d.title} ${d.category}`.toLowerCase().includes(search.toLowerCase()))
  const total=data.reduce((s,d)=>s+Number(d.amount||0),0)
  return (
    <div>
      <div className="page-header"><div><h1>Expenses</h1><p>Total: ₹{total.toLocaleString('en-IN')}</p></div><button className="btn btn-primary" onClick={openCreate}>+ Add Expense</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search expenses..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>💸</div><h3>No expenses</h3></div>:
        <table><thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Mode</th><th>Date</th><th>Branch</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map(d=>(<tr key={d._id}><td><div style={{fontWeight:600}}>{d.title}</div>{d.description&&<div style={{fontSize:12,color:'var(--text-muted)'}}>{d.description}</div>}</td><td><span className={`badge badge-${cc[d.category]||'primary'}`}>{d.category}</span></td><td style={{fontWeight:700,color:'var(--danger)'}}>₹{Number(d.amount).toLocaleString('en-IN')}</td><td style={{fontSize:13}}>{d.paymentMode||'—'}</td><td style={{fontSize:13,color:'var(--text-muted)'}}>{d.date?new Date(d.date).toLocaleDateString('en-IN'):'—'}</td><td style={{fontSize:13}}>{d.branch?.branchName||d.branch?.name||'—'}</td><td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td></tr>))}</tbody></table>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal">
        <div className="modal-header"><h2>{editing?'✏️ Edit Expense':'+ Add Expense'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="form-group"><label>Title *</label><input {...F('title')} required/></div>
            <div className="grid-2"><div className="form-group"><label>Amount *</label><input {...F('amount')} type="number" required/></div><div className="form-group"><label>Category</label><select {...F('category')}>{['Medicine','Equipment','Staff','Utilities','Rent','Marketing','Other'].map(c=><option key={c}>{c}</option>)}</select></div></div>
            <div className="grid-2"><div className="form-group"><label>Payment Mode</label><select {...F('paymentMode')}>{['Cash','Card','UPI','Net Banking','Cheque'].map(m=><option key={m}>{m}</option>)}</select></div><div className="form-group"><label>Date</label><input {...F('date')} type="date"/></div></div>
            <div className="form-group"><label>Branch</label><select className="form-control" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}><option value="">Select Branch</option>{branches.map(b=><option key={b._id} value={b._id}>{b.branchName||b.name}</option>)}</select></div>
            <div className="form-group"><label>Description</label><textarea {...F('description')} className="form-control" rows={2}/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Add')} Expense</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
