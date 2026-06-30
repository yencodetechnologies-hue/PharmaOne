import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PortalAPI from '../../../services/portalApi'
import { getPortalUser } from '../../../services/multiAuthService'
import { SearchBar, ConfirmModal } from '../../../components/common/UIComponents'

const init = { name:'', phone:'', aadharNo:'', panCardNo:'', address:'', email:'', password:'', communicationAddress:'', presentAddress:'', licenseNo:'', salary:'', idCardNo:'', designation:'', department:'', joiningDate:'' }

export default function BranchStaff() {
  const user = getPortalUser()
  const branchId = user?.branchId || user?._id
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(init)
  const [deleteId, setDeleteId] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['portal-staff', branchId],
    queryFn: () => PortalAPI.get(`/branch-portal/staff${branchId ? `?branchId=${branchId}` : ''}`).then(r => r.data.data || []),
    staleTime: 30_000,
  })

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) => id
      ? PortalAPI.put(`/branch-portal/staff/${id}`, payload)
      : PortalAPI.post('/branch-portal/staff', { ...payload, branch: branchId }),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Staff updated' : 'Staff added')
      qc.invalidateQueries({ queryKey: ['portal-staff'] })
      setShowModal(false); setEditing(null)
    },
    onError: err => toast.error(err.response?.data?.message || 'Operation failed'),
  })

  const deleteMut = useMutation({
    mutationFn: id => PortalAPI.delete(`/branch-portal/staff/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['portal-staff'] }); setDeleteId(null) },
    onError: err => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const F = k => ({ className: 'form-control', value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const openCreate = () => { setEditing(null); setForm(init); setShowModal(true) }
  const openEdit = s => {
    setEditing(s._id)
    setForm({ name:s.name, phone:s.phone, aadharNo:s.aadharNo, panCardNo:s.panCardNo, address:s.address, email:s.email, password:'', communicationAddress:s.communicationAddress||'', presentAddress:s.presentAddress||'', licenseNo:s.licenseNo||'', salary:s.salary, idCardNo:s.idCardNo||'', designation:s.designation||'', department:s.department||'', joiningDate:s.joiningDate?.slice(0,10)||'' })
    setShowModal(true)
  }
  const handleSubmit = e => { e.preventDefault(); saveMut.mutate({ id: editing, payload: form }) }
  const filtered = data.filter(s => `${s.name} ${s.email} ${s.designation}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-header">
        <div><h1>Staff Management</h1><p>{data.length} staff members</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Staff</button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search staff..." />
        </div>
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 48 }}>👥</div><h3>No staff found</h3><p>Add staff members to this branch</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Designation</th><th>Department</th><th>Phone</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s._id}>
                  <td><div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'#ede9fe', color:'#5b21b6', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{s.name[0]}</div>
                    <div><div style={{ fontWeight:600 }}>{s.name}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.email}</div></div>
                  </div></td>
                  <td><span className="badge badge-primary">{s.designation || '—'}</span></td>
                  <td style={{ fontSize:13 }}>{s.department || '—'}</td>
                  <td style={{ fontSize:13 }}>{s.phone}</td>
                  <td style={{ fontWeight:600, color:'var(--primary)' }}>₹{Number(s.salary||0).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td><div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(s._id)}>🗑</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay"><div className="modal modal-lg">
          <div className="modal-header">
            <h2>{editing ? '✏️ Edit Staff' : '+ Add Staff'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'contents' }}>
            <div className="modal-body">
              <div className="section-title">Personal Details</div>
              <div className="grid-3">
                <div className="form-group"><label>Full Name *</label><input {...F('name')} required /></div>
                <div className="form-group"><label>Phone *</label><input {...F('phone')} required /></div>
                <div className="form-group"><label>ID Card No</label><input {...F('idCardNo')} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Aadhar No *</label><input {...F('aadharNo')} required /></div>
                <div className="form-group"><label>PAN Card No *</label><input {...F('panCardNo')} required /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Designation</label><input {...F('designation')} /></div>
                <div className="form-group"><label>Department</label><input {...F('department')} /></div>
              </div>
              <div className="grid-3">
                <div className="form-group"><label>Salary</label><input {...F('salary')} type="number" /></div>
                <div className="form-group"><label>License No</label><input {...F('licenseNo')} /></div>
                <div className="form-group"><label>Joining Date</label><input {...F('joiningDate')} type="date" /></div>
              </div>
              <div className="form-group"><label>Address *</label><textarea {...F('address')} className="form-control" rows={2} required /></div>
              <div className="section-title" style={{ marginTop:8 }}>Account</div>
              <div className="grid-2">
                <div className="form-group"><label>Email *</label><input {...F('email')} type="email" required /></div>
                <div className="form-group"><label>Password {editing ? '' : '*'}</label><input {...F('password')} type="password" required={!editing} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saveMut.isPending}>
                {saveMut.isPending ? '⏳ Saving...' : editing ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </div></div>
      )}

      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteMut.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
