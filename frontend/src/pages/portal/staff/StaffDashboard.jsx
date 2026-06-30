import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PortalAPI from '../../../services/portalApi'
import { getPortalUser } from '../../../services/multiAuthService'

export default function StaffDashboard() {
  const user = getPortalUser()
  const branchId = user?.branch?._id || user?.branch
  const navigate = useNavigate()

  const { data: clients = [] } = useQuery({
    queryKey: ['staff-clients', branchId],
    queryFn: () => PortalAPI.get(`/branch-portal/clients${branchId ? `?branchId=${branchId}` : ''}`).then(r => r.data.data || []),
  })

  const today = new Date(); today.setHours(0,0,0,0)
  const todayAppts = clients.filter(c => {
    if (!c.patientAppointmentDate) return false
    const d = new Date(c.patientAppointmentDate); d.setHours(0,0,0,0)
    return d.getTime() === today.getTime()
  })
  const upcoming = clients.filter(c => c.patientAppointmentDate && new Date(c.patientAppointmentDate) > today)
  const recentClients = [...clients].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Staff Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome, <strong>{user?.name}</strong>{user?.designation ? ` · ${user.designation}` : ''}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Clients', value: clients.length, icon: '🫀', color: '#9f1239', path: '/portal/staff/clients' },
          { label: "Today's Appts", value: todayAppts.length, icon: '📅', color: '#065f46', path: '/portal/staff/appointments' },
          { label: 'Upcoming Appts', value: upcoming.length, icon: '⏰', color: '#b45309', path: '/portal/staff/appointments' },
        ].map(s => (
          <div key={s.label} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}

        <div className="card" style={{ cursor: 'pointer', background: 'var(--primary)', color: 'white' }} onClick={() => navigate('/portal/staff/clients/add')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>➕</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Add Client</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Register new patient</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Recent Clients</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/staff/clients')}>View All →</button>
          </div>
          {recentClients.length === 0 ? (
            <div style={{ textAlign:'center', padding:20, color:'var(--text-muted)' }}>No clients yet</div>
          ) : recentClients.map(c => (
            <div key={c._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#fce7f3', color:'#9d174d', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{c.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{c.name} {c.surname}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.gender} · {c.age}y</div>
              </div>
              {c.patientAppointmentDate && <span className="badge badge-success" style={{ fontSize:11 }}>{new Date(c.patientAppointmentDate).toLocaleDateString('en-IN')}</span>}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Today's Appointments</h3>
          {todayAppts.length === 0 ? (
            <div style={{ textAlign:'center', padding:20, color:'var(--text-muted)' }}>No appointments today</div>
          ) : todayAppts.map(c => (
            <div key={c._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'#f0fff4', marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#065f4620', color:'#065f46', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{c.name} {c.surname}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Dr. {c.doctorName || 'TBD'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
