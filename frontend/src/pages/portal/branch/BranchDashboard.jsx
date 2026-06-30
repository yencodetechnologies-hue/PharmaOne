import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PortalAPI from '../../../services/portalApi'
import { getPortalUser } from '../../../services/multiAuthService'

export default function BranchDashboard() {
  const user = getPortalUser()
  const branchId = user?.branchId || user?._id
  const navigate = useNavigate()

  const { data: staff = [] } = useQuery({
    queryKey: ['portal-staff', branchId],
    queryFn: () => PortalAPI.get(`/branch-portal/staff${branchId ? `?branchId=${branchId}` : ''}`).then(r => r.data.data || []),
  })
  const { data: clients = [] } = useQuery({
    queryKey: ['portal-clients', branchId],
    queryFn: () => PortalAPI.get(`/branch-portal/clients${branchId ? `?branchId=${branchId}` : ''}`).then(r => r.data.data || []),
  })

  const today = new Date(); today.setHours(0,0,0,0)
  const todayAppts = clients.filter(c => {
    if (!c.patientAppointmentDate) return false
    const d = new Date(c.patientAppointmentDate); d.setHours(0,0,0,0)
    return d.getTime() === today.getTime()
  })
  const upcomingAppts = clients.filter(c => c.patientAppointmentDate && new Date(c.patientAppointmentDate) > today)

  const stats = [
    { label: 'Total Staff', value: staff.length, icon: '👥', color: '#1e40af', path: '/portal/branch/staff' },
    { label: 'Total Clients', value: clients.length, icon: '🫀', color: '#9f1239', path: '/portal/branch/clients' },
    { label: "Today's Appointments", value: todayAppts.length, icon: '📅', color: '#065f46', path: '/portal/branch/appointments' },
    { label: 'Upcoming Appointments', value: upcomingAppts.length, icon: '⏰', color: '#b45309', path: '/portal/branch/appointments' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Branch Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong>{user?.name}</strong></p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.18s' }}
            onClick={() => navigate(s.path)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent staff */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Recent Staff</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/branch/staff')}>View All →</button>
          </div>
          {staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No staff yet</div>
          ) : staff.slice(0, 5).map(s => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ede9fe', color: '#5b21b6', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{s.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.designation || 'Staff'}</div>
              </div>
              <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>{s.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>

        {/* Today's appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Today's Appointments</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/branch/appointments')}>View All →</button>
          </div>
          {todayAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No appointments today</div>
          ) : todayAppts.map(c => (
            <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fce7f3', color: '#9d174d', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{c.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name} {c.surname}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dr. {c.doctorName || 'Not assigned'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
