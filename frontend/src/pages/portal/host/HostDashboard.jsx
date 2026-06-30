import { getPortalUser } from '../../../services/multiAuthService'
export default function HostDashboard() {
  const user = getPortalUser()
  return (
    <div>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:22,fontWeight:800 }}>Host Dashboard</h1><p style={{ color:'var(--text-muted)' }}>Welcome, <strong>{user?.name}</strong> — Host (Admin)</p></div>
      <div className="card"><p style={{ color:'var(--text-muted)' }}>Use the sidebar to manage your branches, staff, clients and doctors.</p></div>
    </div>
  )
}
