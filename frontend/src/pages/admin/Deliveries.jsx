import { useState } from 'react'
import { useDeliveries, useSaveDelivery, useDeleteDelivery, useClients } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const SOURCE=['Client (Patient)','Dr','Media','Walkin','Neighborhood','Family','IIT']
const GUARDIAN=['Father','Mother','Daughter','Son','Siblings','Spouse','Other']
const SAL=['Mr','Mrs','Ms','Dr']
const SC={Pending:'warning',Dispatched:'info',Delivered:'success',Failed:'danger'}
const init={salutation:'Mr',patientName:'',clientId:'',phone:'',alternativePhone:'',guardianRelation:'Father',guardianName:'',address:'',pincode:'',city:'',state:'',sourceOfReference:'Walkin',deliveryDate:'',deliveryStatus:'Pending',notes:''}
export default function Deliveries() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useDeliveries();const {data:clients=[]}=useClients()
  const saveMut=useSaveDelivery();const deleteMut=useDeleteDelivery()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(d)=>{setEditing(d._id);setForm({salutation:d.salutation||'Mr',patientName:d.patientName||'',clientId:d.clientId||'',phone:d.phone||'',alternativePhone:d.alternativePhone||'',guardianRelation:d.guardianRelation||'Father',guardianName:d.guardianName||'',address:d.address||'',pincode:d.pincode||'',city:d.city||'',state:d.state||'',sourceOfReference:d.sourceOfReference||'Walkin',deliveryDate:d.deliveryDate?.slice(0,10)||'',deliveryStatus:d.deliveryStatus||'Pending',notes:d.notes||''});setShowModal(true)}
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:form},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const filtered=data.filter(d=>`${d.patientName} ${d.phone} ${d.sourceOfReference}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="page-header"><div><h1>Delivery List</h1><p>{data.length} deliveries</p></div><button className="btn btn-primary" onClick={openCreate}>+ Add Delivery</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search deliveries..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>🚚</div><h3>No deliveries</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Patient</th><th>Phone</th><th>Guardian</th><th>Address</th><th>Source</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(d=>(<tr key={d._id}>
            <td style={{fontWeight:600}}>{d.salutation} {d.patientName}</td>
            <td style={{fontSize:13}}><div>{d.phone}</div>{d.alternativePhone&&<div style={{color:'var(--text-muted)',fontSize:12}}>{d.alternativePhone}</div>}</td>
            <td style={{fontSize:13}}>{d.guardianRelation}: {d.guardianName||'—'}</td>
            <td style={{fontSize:13,maxWidth:160}}>{d.address}{d.city?`, ${d.city}`:''}</td>
            <td><span className="badge badge-primary">{d.sourceOfReference}</span></td>
            <td><span className={`badge badge-${SC[d.deliveryStatus]||'primary'}`}>{d.deliveryStatus}</span></td>
            <td style={{fontSize:13,color:'var(--text-muted)'}}>{d.deliveryDate?new Date(d.deliveryDate).toLocaleDateString('en-IN'):'—'}</td>
            <td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg" style={{maxWidth:740}}>
        <div className="modal-header"><h2>{editing?'✏️ Edit Delivery':'+ Add Delivery'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="section-title">Patient Details</div>
            <div className="grid-3"><div className="form-group"><label>Salutation</label><select {...F('salutation')}>{SAL.map(s=><option key={s}>{s}</option>)}</select></div><div className="form-group" style={{gridColumn:'2/4'}}><label>Patient Name *</label><input {...F('patientName')} placeholder="Full name" required/></div></div>
            <div className="form-group"><label>Link to Client (optional)</label><select className="form-control" value={form.clientId} onChange={e=>{const c=clients.find(c=>c._id===e.target.value);setForm({...form,clientId:e.target.value,patientName:c?`${c.name} ${c.surname}`:form.patientName,phone:c?.phone||form.phone})}}>  <option value="">-- Select Existing Client --</option>{clients.map(c=><option key={c._id} value={c._id}>{c.name} {c.surname}</option>)}</select></div>
            <div className="grid-2"><div className="form-group"><label>Phone No *</label><input {...F('phone')} required/></div><div className="form-group"><label>Alternative Phone No</label><input {...F('alternativePhone')}/></div></div>
            <div className="section-title" style={{marginTop:8}}>Guardian Details</div>
            <div className="grid-2"><div className="form-group"><label>Guardian Relation</label><select {...F('guardianRelation')}>{GUARDIAN.map(g=><option key={g}>{g}</option>)}</select></div><div className="form-group"><label>Guardian Name</label><input {...F('guardianName')}/></div></div>
            <div className="section-title" style={{marginTop:8}}>Address</div>
            <div className="form-group"><label>Address *</label><textarea {...F('address')} className="form-control" rows={2} required/></div>
            <div className="grid-3"><div className="form-group"><label>City</label><input {...F('city')}/></div><div className="form-group"><label>State</label><input {...F('state')}/></div><div className="form-group"><label>Pincode</label><input {...F('pincode')}/></div></div>
            <div className="section-title" style={{marginTop:8}}>Delivery Info</div>
            <div className="grid-3"><div className="form-group"><label>Source of Reference</label><select {...F('sourceOfReference')}>{SOURCE.map(s=><option key={s}>{s}</option>)}</select></div><div className="form-group"><label>Delivery Date</label><input {...F('deliveryDate')} type="date"/></div><div className="form-group"><label>Status</label><select {...F('deliveryStatus')}>{['Pending','Dispatched','Delivered','Failed'].map(s=><option key={s}>{s}</option>)}</select></div></div>
            <div className="form-group"><label>Notes</label><textarea {...F('notes')} className="form-control" rows={2}/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Create')} Delivery</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
