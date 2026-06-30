import { getPortalUser } from '../../../services/multiAuthService'
export default function AuditorDashboard() {
  const user = getPortalUser()
  return (
    <div>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:22,fontWeight:800 }}>Auditor Dashboard</h1><p style={{ color:'var(--text-muted)' }}>Welcome, <strong>{user?.name}</strong>{user?.auditType ? ` · ${user.auditType} Auditor` : ''}</p></div>
      <div className="card"><p style={{ color:'var(--text-muted)' }}>Use the sidebar to view assigned branches and generate reports.</p></div>
    </div>
  )
}
