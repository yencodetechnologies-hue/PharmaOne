import { getPortalUser } from '../../../services/multiAuthService'
export default function ClientDashboard() {
  const user = getPortalUser()
  return (
    <div>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:22,fontWeight:800 }}>Client Portal</h1><p style={{ color:'var(--text-muted)' }}>Welcome, <strong>{user?.name}</strong></p></div>
      <div className="card"><p style={{ color:'var(--text-muted)' }}>Use the sidebar to view your profile, appointments and medical records.</p></div>
    </div>
  )
}
