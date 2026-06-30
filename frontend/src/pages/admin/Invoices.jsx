import { useState } from 'react'
import { useInvoices, useSaveInvoice, useDeleteInvoice, useClients, useBranches } from '../../hooks/useAdminMutations'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceStats } from '../../services/adminService'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'
const init={companyType:'Pvt Ltd',clientName:'',client:'',totalAmount:'',paidAmount:'',paymentMode:'Cash',transaction:'',comments:'',dueDate:'',branch:''}
export default function Invoices() {
  const [search,setSearch]=useState('');const [showModal,setShowModal]=useState(false);const [editing,setEditing]=useState(null);const [form,setForm]=useState(init);const [deleteId,setDeleteId]=useState(null)
  const {data=[],isLoading}=useInvoices();const {data:clients=[]}=useClients();const {data:branches=[]}=useBranches()
  const {data:stats}=useQuery({queryKey:['invoiceStats'],queryFn:()=>getInvoiceStats().then(r=>r.data.data)})
  const saveMut=useSaveInvoice();const deleteMut=useDeleteInvoice()
  const F=(k)=>({className:'form-control',value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})})
  const openCreate=()=>{setEditing(null);setForm(init);setShowModal(true)}
  const openEdit=(inv)=>{setEditing(inv._id);setForm({companyType:inv.companyType,clientName:inv.clientName||'',client:inv.client?._id||'',totalAmount:inv.totalAmount,paidAmount:inv.paidAmount,paymentMode:inv.paymentMode||'Cash',transaction:inv.transaction||'',comments:inv.comments||'',dueDate:inv.dueDate?.slice(0,10)||'',branch:inv.branch?._id||inv.branch||''});setShowModal(true)}
  const handleSubmit=(e)=>{e.preventDefault();saveMut.mutate({id:editing,data:form},{onSuccess:()=>{setShowModal(false);setEditing(null)}})}
  const handleDelete=()=>{deleteMut.mutate(deleteId,{onSuccess:()=>setDeleteId(null)})}
  const sc={Paid:'success',Partial:'warning',Pending:'info',Overdue:'danger'}
  const filtered=data.filter(d=>`${d.invoiceNo} ${d.clientName}`.toLowerCase().includes(search.toLowerCase()))
  const balance=Number(form.totalAmount||0)-Number(form.paidAmount||0)
  return (
    <div>
      <div className="page-header"><div><h1>Invoices</h1><p>{data.length} invoices</p></div><button className="btn btn-primary" onClick={openCreate}>+ New Invoice</button></div>
      {stats&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>{[{l:'Total',v:stats.total,c:'#1a7a4a'},{l:'Paid',v:stats.paid,c:'#38a169'},{l:'Pending',v:stats.pending,c:'#3182ce'},{l:'Revenue',v:`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`,c:'#d69e2e'}].map(s=>(<div key={s.l} style={{background:'white',borderRadius:12,padding:'16px 20px',boxShadow:'var(--shadow)',borderLeft:`4px solid ${s.c}`}}><div style={{fontSize:22,fontWeight:800}}>{s.v}</div><div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{s.l}</div></div>))}</div>}
      <div className="card">
        <div style={{marginBottom:20}}><SearchBar value={search} onChange={setSearch} placeholder="Search invoices..."/></div>
        {isLoading?<div className="loading"><div className="spinner"/>Loading...</div>:filtered.length===0?<div className="empty-state"><div style={{fontSize:48}}>🧾</div><h3>No invoices</h3></div>:
        <div style={{overflowX:'auto'}}><table>
          <thead><tr><th>Invoice No</th><th>Client</th><th>Total</th><th>Paid</th><th>Balance</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(d=>(<tr key={d._id}>
            <td style={{fontWeight:700,color:'var(--primary)'}}>{d.invoiceNo}</td>
            <td style={{fontSize:13}}>{d.client?.name?`${d.client.name} ${d.client.surname}`:d.clientName||'—'}</td>
            <td style={{fontWeight:600}}>₹{Number(d.totalAmount).toLocaleString('en-IN')}</td>
            <td style={{color:'var(--success)',fontWeight:600}}>₹{Number(d.paidAmount).toLocaleString('en-IN')}</td>
            <td style={{color:d.balanceAmount>0?'var(--danger)':'var(--success)',fontWeight:600}}>₹{Number(d.balanceAmount).toLocaleString('en-IN')}</td>
            <td style={{fontSize:13}}>{d.paymentMode||'—'}</td>
            <td><span className={`badge badge-${sc[d.status]}`}>{d.status}</span></td>
            <td><div style={{display:'flex',gap:6}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(d._id)}>🗑</button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>
      {showModal&&<div className="modal-overlay"><div className="modal modal-lg">
        <div className="modal-header"><h2>{editing?'✏️ Edit Invoice':'+ New Invoice'}</h2><button className="modal-close" onClick={()=>setShowModal(false)}>×</button></div>
        <form onSubmit={handleSubmit} style={{display:'contents'}}>
          <div className="modal-body">
            <div className="grid-2"><div className="form-group"><label>Company Type *</label><select {...F('companyType')}>{['Pvt Ltd','LLP','Proprietorship','Partnership','Other'].map(t=><option key={t}>{t}</option>)}</select></div><div className="form-group"><label>Client</label><select className="form-control" value={form.client} onChange={e=>setForm({...form,client:e.target.value})}><option value="">-- Select Client --</option>{clients.map(c=><option key={c._id} value={c._id}>{c.name} {c.surname}</option>)}</select></div></div>
            <div className="form-group"><label>Client Name (if no account)</label><input {...F('clientName')}/></div>
            <div className="grid-3"><div className="form-group"><label>Total Amount *</label><input {...F('totalAmount')} type="number" required/></div><div className="form-group"><label>Paid Amount</label><input {...F('paidAmount')} type="number"/></div><div className="form-group"><label>Balance</label><input className="form-control" readOnly value={balance>=0?balance:0} style={{background:'var(--bg2)',color:balance>0?'var(--danger)':'var(--success)',fontWeight:700}}/></div></div>
            <div className="grid-3"><div className="form-group"><label>Payment Mode</label><select {...F('paymentMode')}>{['Cash','Card','UPI','Net Banking','Cheque'].map(m=><option key={m}>{m}</option>)}</select></div><div className="form-group"><label>Transaction ID</label><input {...F('transaction')}/></div><div className="form-group"><label>Due Date</label><input {...F('dueDate')} type="date"/></div></div>
            <div className="form-group"><label>Branch</label><select className="form-control" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}><option value="">Select Branch</option>{branches.map(b=><option key={b._id} value={b._id}>{b.branchName||b.name}</option>)}</select></div>
            <div className="form-group"><label>Comments</label><textarea {...F('comments')} className="form-control" rows={2}/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>{saveMut.isPending?'⏳ Saving...':(editing?'Update':'Create')} Invoice</button></div>
        </form>
      </div></div>}
      <ConfirmModal isOpen={!!deleteId} onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>
    </div>
  )
}
