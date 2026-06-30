import { useState } from 'react'
import { useHosts, useSaveHost, useDeleteHost, useBranches } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const init={name:'',mobileNo:'',email:'',gender:'Male',dob:'',address:'',branch:'',password:'',isActive:true}
export default function Hosts() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useHosts();const {data:branches=[]}=useBranches()
  const saveMut=useSaveHost();const deleteMut=useDeleteHost()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(h)=>{setEditing(h._id);setForm({name:h.name||'',mobileNo:h.mobileNo||'',email:h.email||'',gender:h.gender||'Male',dob:h.dob?.slice(0,10)||'',address:h.address||'',branch:h.branch?._id||h.branch||'',password:'',isActive:h.isActive!==false});setShowModal(true)}
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:form},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const filtered=data.filter(d=>`${d.name} ${d.email} ${d.mobileNo}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="page-header"><div><h1>Host (Superadmin)</h1><p>{data.length} hosts</p></div><button className="btn btn-primary" onClick={openCreate}>+ Add Host</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search hosts..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>👑</div><h3>No hosts</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Name</th><th>Mobile No</th><th>Email</th><th>Gender</th><th>DOB</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(d=>(<tr key={d._id}>
            <td><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1a7a4a,#2ea566)',color:'white',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{d.name[0]}</div><div style={{fontWeight:600}}>{d.name}</div></div></td>
            <td style={{fontSize:13}}>{d.mobileNo||'—'}</td><td style={{fontSize:13}}>{d.email}</td>
            <td><span className="badge badge-primary">{d.gender||'—'}</span></td>
            <td style={{fontSize:13,color:'var(--text-muted)'}}>{d.dob?new Date(d.dob).toLocaleDateString('en-IN'):'—'}</td>
            <td style={{fontSize:13}}>{d.branch?.branchName||d.branch?.name||'—'}</td>
            <td><span className={`badge badge-${d.isActive!==false?'success':'danger'}`}>{d.isActive!==false?'Active':'Inactive'}</span></td>
            <td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg">
        <div className="modal-header"><h2>{editing?'✏️ Edit Host':'+ Add Host (Superadmin)'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="section-title">Personal Details</div>
            <div className="grid-2"><div className="form-group"><label>Full Name *</label><input {...F('name')} required/></div><div className="form-group"><label>Mobile No *</label><input {...F('mobileNo')} required/></div></div>
            <div className="grid-3"><div className="form-group"><label>Gender</label><select {...F('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div><div className="form-group"><label>Date of Birth</label><input {...F('dob')} type="date"/></div><div className="form-group"><label>Branch</label><select className="form-control" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}><option value="">Select Branch</option>{branches.map(b=><option key={b._id} value={b._id}>{b.branchName||b.name}</option>)}</select></div></div>
            <div className="form-group"><label>Address</label><textarea {...F('address')} className="form-control" rows={2}/></div>
            <div className="section-title" style={{marginTop:8}}>Account Details</div>
            <div className="grid-2"><div className="form-group"><label>Email *</label><input {...F('email')} type="email" required/></div><div className="form-group"><label>{editing?'New Password (leave blank)':'Password *'}</label><input {...F('password')} type="password" required={!editing}/></div></div>
            <div className="form-group"><label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} style={{width:18,height:18,accentColor:'var(--primary)'}}/><span>Active</span></label></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Create')} Host</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
