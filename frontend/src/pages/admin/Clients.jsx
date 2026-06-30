import { useState } from 'react'
import { useClients, useSaveClient, useDeleteClient, useBranches } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const init={name:'',surname:'',age:'',gender:'Male',referenceNo:'',email:'',password:'',patientEnquiryDate:'',patientAppointmentDate:'',treatmentDetails:'',procedureMaterial:'',doctorName:'',branch:''}
export default function Clients() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useClients();const {data:branches=[]}=useBranches()
  const saveMut=useSaveClient();const deleteMut=useDeleteClient()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(c)=>{setEditing(c._id);setForm({name:c.name,surname:c.surname,age:c.age,gender:c.gender,referenceNo:c.referenceNo||'',email:c.email,password:'',patientEnquiryDate:c.patientEnquiryDate?.slice(0,10)||'',patientAppointmentDate:c.patientAppointmentDate?.slice(0,10)||'',treatmentDetails:c.treatmentDetails||'',procedureMaterial:c.procedureMaterial||'',doctorName:c.doctorName||'',branch:c.branch?._id||c.branch||''});setShowModal(true)}
  const handleSubmit=(e)=>{e.preventDefault();const fd=new FormData();Object.entries(form).forEach(([k,v])=>v&&fd.append(k,v));saveMut.mutate({id:editing,data:fd},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const filtered=data.filter(c=>`${c.name} ${c.surname} ${c.email}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="page-header"><div><h1>Clients (Patients)</h1><p>{data.length} clients</p></div><button className="btn btn-primary" onClick={openCreate}>+ Add Client</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search clients..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>👥</div><h3>No clients found</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Name</th><th>Ref No</th><th>Gender/Age</th><th>Email</th><th>Doctor</th><th>Appointment</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(c=>(<tr key={c._id}>
            <td><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:34,height:34,borderRadius:'50%',background:'var(--primary-xlight)',color:'var(--primary)',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{c.name[0]}</div><div style={{fontWeight:600}}>{c.name} {c.surname}</div></div></td>
            <td style={{fontSize:13,color:'var(--text-muted)'}}>{c.referenceNo||'—'}</td>
            <td><span className="badge badge-primary">{c.gender}</span> {c.age}y</td>
            <td style={{fontSize:13}}>{c.email}</td>
            <td style={{fontSize:13}}>{c.doctorName||'—'}</td>
            <td style={{fontSize:13,color:'var(--text-muted)'}}>{c.patientAppointmentDate?new Date(c.patientAppointmentDate).toLocaleDateString('en-IN'):'—'}</td>
            <td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(c)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(c._id)}>🗑</button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg">
        <div className="modal-header"><h2>{editing?'✏️ Edit Client':'+ Add Client'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="section-title">Personal Info</div>
            <div className="grid-3"><div className="form-group"><label>First Name *</label><input {...F('name')} required/></div><div className="form-group"><label>Surname *</label><input {...F('surname')} required/></div><div className="form-group"><label>Age *</label><input {...F('age')} type="number" required/></div></div>
            <div className="grid-3"><div className="form-group"><label>Gender</label><select {...F('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div><div className="form-group"><label>Reference No</label><input {...F('referenceNo')}/></div><div className="form-group"><label>Doctor Name</label><input {...F('doctorName')}/></div></div>
            <div className="section-title" style={{marginTop:8}}>Account</div>
            <div className="grid-2"><div className="form-group"><label>Email *</label><input {...F('email')} type="email" required/></div><div className="form-group"><label>{editing?'New Password':'Password *'}</label><input {...F('password')} type="password" required={!editing}/></div></div>
            <div className="section-title" style={{marginTop:8}}>Appointment</div>
            <div className="grid-2"><div className="form-group"><label>Enquiry Date</label><input {...F('patientEnquiryDate')} type="date"/></div><div className="form-group"><label>Appointment Date</label><input {...F('patientAppointmentDate')} type="date"/></div></div>
            <div className="form-group"><label>Treatment Details</label><textarea {...F('treatmentDetails')} className="form-control" rows={2}/></div>
            <div className="grid-2"><div className="form-group"><label>Procedure Material</label><input {...F('procedureMaterial')}/></div><div className="form-group"><label>Branch</label><select className="form-control" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}><option value="">Select Branch</option>{branches.map(b=><option key={b._id} value={b._id}>{b.branchName||b.name}</option>)}</select></div></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update Client':'Create Client')}</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
