import { useState } from 'react'
import { useEstimations, useSaveEstimation, useDeleteEstimation, useClients } from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const initProc={treatmentProcedure:'',treatmentPrice:''}
const init={clientId:'',clientName:'',estimationDate:'',status:'Draft',notes:'',procedures:[{...initProc}]}
const SC={Draft:'warning',Sent:'info',Approved:'success',Rejected:'danger'}
export default function Estimations() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState({...init,procedures:[{...initProc}]});const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useEstimations();const {data:clients=[]}=useClients()
  const saveMut=useSaveEstimation();const deleteMut=useDeleteEstimation()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm({...init,procedures:[{...initProc}]});setShowModal(true)}
  const openEdit=(e)=>{setEditing(e._id);setForm({clientId:e.clientId||'',clientName:e.clientName||'',estimationDate:e.estimationDate?.slice(0,10)||'',status:e.status||'Draft',notes:e.notes||'',procedures:e.procedures?.length?e.procedures:[{...initProc}]});setShowModal(true)}
  const addProc=()=>setForm({...form,procedures:[...form.procedures,{...initProc}]})
  const updProc=(i,k,v)=>setForm({...form,procedures:form.procedures.map((p,idx)=>idx===i?{...p,[k]:v}:p)})
  const remProc=(i)=>setForm({...form,procedures:form.procedures.filter((_,idx)=>idx!==i)})
  const totalAmt=form.procedures.reduce((s,p)=>s+Number(p.treatmentPrice||0),0)
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:{...form,totalAmount:totalAmt,procedures:JSON.stringify(form.procedures)}},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const filtered=data.filter(d=>`${d.clientName} ${d.status}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <div className="page-header"><div><h1>Estimation List</h1><p>{data.length} estimations</p></div><button className="btn btn-primary" onClick={openCreate}>+ New Estimation</button></div>
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search estimations..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>📊</div><h3>No estimations</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Client</th><th>Procedures</th><th>Total Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(d=>{const procs=Array.isArray(d.procedures)?d.procedures:(typeof d.procedures==='string'?JSON.parse(d.procedures||'[]'):[]);return(<tr key={d._id}><td style={{fontWeight:600}}>{d.clientName||'—'}</td><td style={{fontSize:13}}>{procs.length} procedure(s)</td><td style={{fontWeight:700,color:'var(--primary)'}}>₹{Number(d.totalAmount||0).toLocaleString('en-IN')}</td><td><span className={`badge badge-${SC[d.status]||'primary'}`}>{d.status}</span></td><td style={{fontSize:13,color:'var(--text-muted)'}}>{d.estimationDate?new Date(d.estimationDate).toLocaleDateString('en-IN'):'—'}</td><td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td></tr>)})}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg" style={{maxWidth:760}}>
        <div className="modal-header"><h2>{editing?'✏️ Edit Estimation':'+ New Estimation'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="section-title">Estimation Details</div>
            <div className="grid-3">
              <div className="form-group"><label>Client</label><select className="form-control" value={form.clientId} onChange={e=>{const c=clients.find(c=>c._id===e.target.value);setForm({...form,clientId:e.target.value,clientName:c?`${c.name} ${c.surname}`:''})}}>  <option value="">Select Client</option>{clients.map(c=><option key={c._id} value={c._id}>{c.name} {c.surname}</option>)}</select></div>
              <div className="form-group"><label>Estimation Date</label><input {...F('estimationDate')} type="date"/></div>
              <div className="form-group"><label>Status</label><select {...F('status')}>{['Draft','Sent','Approved','Rejected'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="section-title" style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>Treatment Procedures<button type="button" className="btn btn-outline btn-sm" onClick={addProc}>+ Add Procedure</button></div>
            <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'var(--bg2)'}}><th style={{padding:'8px 12px',textAlign:'left',fontSize:12,fontWeight:700,color:'var(--text-muted)'}}>Treatment Procedure</th><th style={{padding:'8px 12px',textAlign:'left',fontSize:12,fontWeight:700,color:'var(--text-muted)',width:160}}>Treatment Price (₹)</th><th style={{width:40}}/></tr></thead>
                <tbody>
                  {form.procedures.map((proc,i)=>(<tr key={i} style={{borderTop:'1px solid var(--border)'}}>
                    <td style={{padding:8}}><input className="form-control" value={proc.treatmentProcedure} onChange={e=>updProc(i,'treatmentProcedure',e.target.value)} placeholder="e.g. Root Canal Treatment" required/></td>
                    <td style={{padding:8}}><input className="form-control" type="number" value={proc.treatmentPrice} onChange={e=>updProc(i,'treatmentPrice',e.target.value)} placeholder="0.00"/></td>
                    <td style={{padding:8}}>{form.procedures.length>1&&<button type="button" onClick={()=>remProc(i)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--danger)',fontSize:16}}>✕</button>}</td>
                  </tr>))}
                  <tr style={{borderTop:'2px solid var(--border)',background:'var(--bg2)'}}><td style={{padding:'12px',fontWeight:700,textAlign:'right',fontSize:15}}>Total Amount</td><td style={{padding:'12px',fontWeight:800,color:'var(--primary)',fontSize:18}}>₹{totalAmt.toLocaleString('en-IN')}</td><td/></tr>
                </tbody>
              </table>
            </div>
            <div className="form-group" style={{marginTop:12}}><label>Notes</label><textarea {...F('notes')} className="form-control" rows={2}/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Create')} Estimation</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
