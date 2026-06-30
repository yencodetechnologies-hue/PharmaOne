import { useState } from 'react'
import { useAuditors, useSaveAuditor, useDeleteAuditor } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const init={name:'',email:'',password:'',phone:'',licenseNo:'',qualification:'',firmName:'',gstNo:'',address:'',auditType:'Internal'}
export default function Auditors() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useAuditors();const saveMut=useSaveAuditor();const deleteMut=useDeleteAuditor()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(a)=>{setEditing(a._id);setForm({name:a.name,email:a.email,password:'',phone:a.phone,licenseNo:a.licenseNo||'',qualification:a.qualification||'',firmName:a.firmName||'',gstNo:a.gstNo||'',address:a.address||'',auditType:a.auditType||'Internal'});setShowModal(true)}
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:form},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const ac={Internal:'success',External:'info',Tax:'warning',Compliance:'danger'}
  const filtered=data.filter(d=>`${d.name} ${d.email} ${d.firmName}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="page-header"><div><h1>Auditors</h1><p>{data.length} auditors</p></div><button className="btn btn-primary" onClick={openCreate}>+ Add Auditor</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search auditors..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>📋</div><h3>No auditors</h3></div>:
        <table><thead><tr><th>Auditor</th><th>Firm</th><th>License No</th><th>Audit Type</th><th>Phone</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map(d=>(<tr key={d._id}><td><div style={{fontWeight:600}}>{d.name}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{d.email}</div></td><td style={{fontSize:13}}>{d.firmName||'—'}</td><td style={{fontSize:13}}>{d.licenseNo||'—'}</td><td><span className={`badge badge-${ac[d.auditType]}`}>{d.auditType}</span></td><td style={{fontSize:13}}>{d.phone}</td><td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td></tr>))}</tbody></table>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg">
        <div className="modal-header"><h2>{editing?'✏️ Edit Auditor':'+ Add Auditor'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="grid-2"><div className="form-group"><label>Full Name *</label><input {...F('name')} required/></div><div className="form-group"><label>Firm Name</label><input {...F('firmName')}/></div></div>
            <div className="grid-3"><div className="form-group"><label>License No</label><input {...F('licenseNo')}/></div><div className="form-group"><label>Qualification</label><input {...F('qualification')}/></div><div className="form-group"><label>Audit Type</label><select {...F('auditType')}>{['Internal','External','Tax','Compliance'].map(t=><option key={t}>{t}</option>)}</select></div></div>
            <div className="grid-2"><div className="form-group"><label>GST No</label><input {...F('gstNo')}/></div><div className="form-group"><label>Phone *</label><input {...F('phone')} required/></div></div>
            <div className="form-group"><label>Address</label><textarea {...F('address')} className="form-control" rows={2}/></div>
            <div className="grid-2"><div className="form-group"><label>Email *</label><input {...F('email')} type="email" required/></div><div className="form-group"><label>Password {editing?'':'*'}</label><input {...F('password')} type="password" required={!editing}/></div></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Add')} Auditor</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
