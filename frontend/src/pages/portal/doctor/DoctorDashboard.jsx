import { getPortalUser } from '../../../services/multiAuthService'
export default function DoctorDashboard() {
  const user = getPortalUser()
  return (
    <div>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:22,fontWeight:800 }}>Doctor Dashboard</h1><p style={{ color:'var(--text-muted)' }}>Welcome, Dr. <strong>{user?.name}</strong>{user?.specialization ? ` · ${user.specialization}` : ''}</p></div>
      <div className="card"><p style={{ color:'var(--text-muted)' }}>Use the sidebar to view your patients and appointments.</p></div>
    </div>
  )
}
