import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PortalAPI from '../../../services/portalApi'
import { getPortalUser } from '../../../services/multiAuthService'
import { SearchBar, ConfirmModal } from '../../../components/common/UIComponents'

const init = { name:'', surname:'', age:'', gender:'Male', referenceNo:'', email:'', password:'', patientEnquiryDate:'', patientAppointmentDate:'', treatmentDetails:'', procedureMaterial:'', doctorName:'' }

export default function BranchClients() {
  const user = getPortalUser()
  const branchId = user?.branchId || user?._id
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(init)
  const [deleteId, setDeleteId] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'appointments'

  const { data = [], isLoading } = useQuery({
    queryKey: ['portal-clients', branchId],
    queryFn: () => PortalAPI.get(`/branch-portal/clients${branchId ? `?branchId=${branchId}` : ''}`).then(r => r.data.data || []),
    staleTime: 30_000,
  })

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) => id
      ? PortalAPI.put(`/branch-portal/clients/${id}`, payload)
      : PortalAPI.post('/branch-portal/clients', { ...payload, branch: branchId }),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Client updated' : 'Client added')
      qc.invalidateQueries({ queryKey: ['portal-clients'] })
      setShowModal(false); setEditing(null)
    },
    onError: err => toast.error(err.response?.data?.message || 'Operation failed'),
  })

  const deleteMut = useMutation({
    mutationFn: id => PortalAPI.delete(`/branch-portal/clients/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['portal-clients'] }); setDeleteId(null) },
    onError: err => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const F = k => ({ className: 'form-control', value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const openCreate = () => { setEditing(null); setForm(init); setShowModal(true) }
  const openEdit = c => {
    setEditing(c._id)
    setForm({ name:c.name, surname:c.surname, age:c.age, gender:c.gender, referenceNo:c.referenceNo||'', email:c.email, password:'', patientEnquiryDate:c.patientEnquiryDate?.slice(0,10)||'', patientAppointmentDate:c.patientAppointmentDate?.slice(0,10)||'', treatmentDetails:c.treatmentDetails||'', procedureMaterial:c.procedureMaterial||'', doctorName:c.doctorName||'' })
    setShowModal(true)
  }
  const handleSubmit = e => { e.preventDefault(); saveMut.mutate({ id: editing, payload: form }) }
  const filtered = data.filter(c => `${c.name} ${c.surname} ${c.email} ${c.referenceNo}`.toLowerCase().includes(search.toLowerCase()))

  // Appointments view: clients with appointment dates
  const appointments = [...data]
    .filter(c => c.patientAppointmentDate)
    .sort((a, b) => new Date(a.patientAppointmentDate) - new Date(b.patientAppointmentDate))

  const today = new Date(); today.setHours(0,0,0,0)
  const upcoming = appointments.filter(c => new Date(c.patientAppointmentDate) >= today)
  const past = appointments.filter(c => new Date(c.patientAppointmentDate) < today)

  return (
    <div>
      <div className="page-header">
        <div><h1>Clients (Patients)</h1><p>{data.length} clients</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('list')}>📋 List</button>
          <button className={`btn ${viewMode === 'appointments' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('appointments')}>📅 Appointments</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Client</button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="card">
          <div style={{ marginBottom: 20 }}><SearchBar value={search} onChange={setSearch} placeholder="Search clients..." /></div>
          {isLoading ? (
            <div className="loading"><div className="spinner" />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 48 }}>🫀</div><h3>No clients found</h3></div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table>
                <thead><tr><th>Name</th><th>Ref No</th><th>Age / Gender</th><th>Doctor</th><th>Enquiry</th><th>Appointment</th><th>Actions</th></tr></thead>
                <tbody>{filtered.map(c => (
                  <tr key={c._id}>
                    <td><div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'#fce7f3', color:'#9d174d', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.name[0]}</div>
                      <div><div style={{ fontWeight:600 }}>{c.name} {c.surname}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>{c.email}</div></div>
                    </div></td>
                    <td style={{ fontSize:13, color:'var(--text-muted)' }}>{c.referenceNo || '—'}</td>
                    <td><span className="badge badge-info">{c.gender}</span> {c.age}y</td>
                    <td style={{ fontSize:13 }}>{c.doctorName || '—'}</td>
                    <td style={{ fontSize:13, color:'var(--text-muted)' }}>{c.patientEnquiryDate ? new Date(c.patientEnquiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      {c.patientAppointmentDate ? (
                        <span className={`badge ${new Date(c.patientAppointmentDate) >= today ? 'badge-success' : 'badge-warning'}`}>
                          {new Date(c.patientAppointmentDate).toLocaleDateString('en-IN')}
                        </span>
                      ) : '—'}
                    </td>
                    <td><div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c._id)}>🗑</button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'appointments' && (
        <div>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
            {[
              { label:'Total Clients', value: data.length, icon:'🫀', color:'#0369a1' },
              { label:'Upcoming Appointments', value: upcoming.length, icon:'📅', color:'#065f46' },
              { label:'Past Appointments', value: past.length, icon:'✅', color:'#92400e' },
            ].map(s => (
              <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                <div><div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="card" style={{ marginBottom:16 }}>
            <h3 style={{ marginBottom:16, color:'var(--primary)' }}>📅 Upcoming Appointments ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <div style={{ textAlign:'center', padding:20, color:'var(--text-muted)' }}>No upcoming appointments</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {upcoming.map(c => (
                  <div key={c._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', background:'#f0fff4' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'#065f4620', color:'#065f46', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{c.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600 }}>{c.name} {c.surname}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>Dr. {c.doctorName || 'Not assigned'} · {c.referenceNo || 'No ref'}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:700, color:'#065f46' }}>{new Date(c.patientAppointmentDate).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.treatmentDetails ? c.treatmentDetails.slice(0,30)+'…' : 'No details'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom:16, color:'var(--text-muted)' }}>Past Appointments ({past.length})</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {past.slice(0,5).map(c => (
                  <div key={c._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg2)', color:'var(--text-muted)', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{c.name} {c.surname}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Dr. {c.doctorName || 'N/A'}</div>
                    </div>
                    <span className="badge badge-warning">{new Date(c.patientAppointmentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay"><div className="modal modal-lg">
          <div className="modal-header">
            <h2>{editing ? '✏️ Edit Client' : '+ Add Client'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'contents' }}>
            <div className="modal-body">
              <div className="section-title">Personal Info</div>
              <div className="grid-3">
                <div className="form-group"><label>First Name *</label><input {...F('name')} required /></div>
                <div className="form-group"><label>Surname *</label><input {...F('surname')} required /></div>
                <div className="form-group"><label>Age *</label><input {...F('age')} type="number" required /></div>
              </div>
              <div className="grid-3">
                <div className="form-group"><label>Gender</label><select {...F('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="form-group"><label>Reference No</label><input {...F('referenceNo')} /></div>
                <div className="form-group"><label>Doctor Name</label><input {...F('doctorName')} /></div>
              </div>
              <div className="section-title" style={{ marginTop:8 }}>Account</div>
              <div className="grid-2">
                <div className="form-group"><label>Email *</label><input {...F('email')} type="email" required /></div>
                <div className="form-group"><label>{editing ? 'New Password' : 'Password *'}</label><input {...F('password')} type="password" required={!editing} /></div>
              </div>
              <div className="section-title" style={{ marginTop:8 }}>Appointment</div>
              <div className="grid-2">
                <div className="form-group"><label>Enquiry Date</label><input {...F('patientEnquiryDate')} type="date" /></div>
                <div className="form-group"><label>Appointment Date</label><input {...F('patientAppointmentDate')} type="date" /></div>
              </div>
              <div className="form-group"><label>Treatment Details</label><textarea {...F('treatmentDetails')} className="form-control" rows={2} /></div>
              <div className="form-group"><label>Procedure Material</label><input {...F('procedureMaterial')} /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>
                {saveMut.isPending ? '⏳ Saving...' : editing ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </div></div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
