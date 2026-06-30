import { useDashboard } from '../../hooks/useAdminMutations'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background:'white', borderRadius:14, padding:'20px 22px', boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:16, borderLeft:`4px solid ${color}` }}>
    <div style={{ width:48, height:48, borderRadius:12, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:26, fontWeight:800, lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>{label}</div>
    </div>
  </div>
)
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboard()

  if (isLoading) return <div className="loading"><div className="spinner"/><span>Loading dashboard...</span></div>

  const chartData = stats?.monthlyRevenue?.map(m => ({ name: MONTHS[m._id.month-1], revenue: m.total })).reverse() || []

  return (
    <div>
      <div className="page-header">
        <div><h1>Dashboard</h1><p>Welcome back! Here's your PharmaOne overview.</p></div>
        <span style={{fontSize:12,color:'var(--text-muted)',background:'white',padding:'6px 14px',borderRadius:8,border:'1px solid var(--border)'}}>
          📅 {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
        </span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard icon="🫀" label="Total Clients"  value={stats?.counts?.clients??0}   color="#1a7a4a"/>
        <StatCard icon="👨‍⚕️" label="Doctors"       value={stats?.counts?.doctors??0}   color="#3182ce"/>
        <StatCard icon="👥" label="Staff"          value={stats?.counts?.employees??0} color="#805ad5"/>
        <StatCard icon="🏭" label="Vendors"        value={stats?.counts?.vendors??0}   color="#dd6b20"/>
        <StatCard icon="🏢" label="Branches"       value={stats?.counts?.branches??0}  color="#319795"/>
        <StatCard icon="🧾" label="Invoices"       value={stats?.counts?.invoices??0}  color="#d69e2e"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:24}}>
        <div style={{background:'linear-gradient(135deg,#1a7a4a,#2ea566)',borderRadius:14,padding:'22px 24px',color:'white'}}>
          <div style={{fontSize:13,opacity:0.8,marginBottom:8}}>💰 Total Revenue</div>
          <div style={{fontSize:28,fontWeight:800}}>₹{(stats?.financials?.totalRevenue??0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{background:'linear-gradient(135deg,#c53030,#e53e3e)',borderRadius:14,padding:'22px 24px',color:'white'}}>
          <div style={{fontSize:13,opacity:0.8,marginBottom:8}}>💸 Total Expenses</div>
          <div style={{fontSize:28,fontWeight:800}}>₹{(stats?.financials?.totalExpenses??0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{background:'linear-gradient(135deg,#2b6cb0,#3182ce)',borderRadius:14,padding:'22px 24px',color:'white'}}>
          <div style={{fontSize:13,opacity:0.8,marginBottom:8}}>📈 Net Profit</div>
          <div style={{fontSize:28,fontWeight:800}}>₹{(stats?.financials?.netProfit??0).toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:20}}>
        <div className="card">
          <div style={{fontWeight:700,fontSize:15,marginBottom:20}}>Monthly Revenue</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a7a4a" stopOpacity={0.3}/><stop offset="95%" stopColor="#1a7a4a" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:'#6b8f7a'}}/>
              <YAxis tick={{fontSize:12,fill:'#6b8f7a'}}/>
              <Tooltip formatter={v=>`₹${v.toLocaleString('en-IN')}`}/>
              <Area type="monotone" dataKey="revenue" stroke="#1a7a4a" strokeWidth={2.5} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Recent Clients</div>
          {(stats?.recentClients||[]).map(c=>(
            <div key={c._id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'var(--primary-xlight)',color:'var(--primary)',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>{c.name[0]}</div>
              <div><div style={{fontWeight:600,fontSize:13}}>{c.name} {c.surname}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{c.email}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
