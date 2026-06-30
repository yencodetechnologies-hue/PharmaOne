import { getPortalUser } from '../../../services/multiAuthService'
export default function VendorDashboard() {
  const user = getPortalUser()
  return (
    <div>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:22,fontWeight:800 }}>Vendor Dashboard</h1><p style={{ color:'var(--text-muted)' }}>Welcome, <strong>{user?.name}</strong>{user?.distributorCode ? ` · ${user.distributorCode}` : ''}</p></div>
      <div className="card"><p style={{ color:'var(--text-muted)' }}>Use the sidebar to manage your products and orders.</p></div>
    </div>
  )
}
