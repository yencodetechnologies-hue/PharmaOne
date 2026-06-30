import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { multiLogoutUser, getPortalUser } from '../services/multiAuthService'

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15"/>
    <path d="M16 6V26M6 16H26" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
  </svg>
)

const NAV_CONFIG = {
  host: {
    label: 'Host Portal',
    icon: '👑',
    color: '#b45309',
    bg: '#78350f',
    items: [
      { to: '/portal/host',              label: 'Dashboard',   icon: '⊞' },
      { to: '/portal/host/branches',     label: 'My Branches', icon: '🏢' },
      { to: '/portal/host/staff',        label: 'Staff',       icon: '👥' },
      { to: '/portal/host/clients',      label: 'Clients',     icon: '🫀' },
      { to: '/portal/host/doctors',      label: 'Doctors',     icon: '👨‍⚕️' },
    ],
  },
  branch: {
    label: 'Branch Portal',
    icon: '🏢',
    color: '#0369a1',
    bg: '#0c4a6e',
    items: [
      { to: '/portal/branch',             label: 'Dashboard',    icon: '⊞' },
      { to: '/portal/branch/staff',       label: 'Staff',        icon: '👥' },
      { to: '/portal/branch/staff/add',   label: 'Add Staff',    icon: '➕' },
      { to: '/portal/branch/clients',     label: 'Clients',      icon: '🫀' },
      { to: '/portal/branch/clients/add', label: 'Add Client',   icon: '➕' },
      { to: '/portal/branch/appointments',label: 'Appointments', icon: '📅' },
    ],
  },
  doctor: {
    label: 'Doctor Portal',
    icon: '👨‍⚕️',
    color: '#065f46',
    bg: '#064e3b',
    items: [
      { to: '/portal/doctor',             label: 'Dashboard',    icon: '⊞' },
      { to: '/portal/doctor/patients',    label: 'My Patients',  icon: '🫀' },
      { to: '/portal/doctor/appointments',label: 'Appointments', icon: '📅' },
    ],
  },
  staff: {
    label: 'Staff Portal',
    icon: '👥',
    color: '#1e40af',
    bg: '#1e3a8a',
    items: [
      { to: '/portal/staff',              label: 'Dashboard',    icon: '⊞' },
      { to: '/portal/staff/clients',      label: 'Clients',      icon: '🫀' },
      { to: '/portal/staff/clients/add',  label: 'Add Client',   icon: '➕' },
      { to: '/portal/staff/appointments', label: 'Appointments', icon: '📅' },
    ],
  },
  client: {
    label: 'Client Portal',
    icon: '🫀',
    color: '#9f1239',
    bg: '#881337',
    items: [
      { to: '/portal/client',              label: 'Dashboard',     icon: '⊞' },
      { to: '/portal/client/profile',      label: 'My Profile',    icon: '👤' },
      { to: '/portal/client/appointments', label: 'Appointments',  icon: '📅' },
      { to: '/portal/client/records',      label: 'Medical Records',icon: '📋' },
    ],
  },
  vendor: {
    label: 'Vendor Portal',
    icon: '🏭',
    color: '#92400e',
    bg: '#78350f',
    items: [
      { to: '/portal/vendor',           label: 'Dashboard', icon: '⊞' },
      { to: '/portal/vendor/products',  label: 'Products',  icon: '📦' },
      { to: '/portal/vendor/orders',    label: 'Orders',    icon: '🛒' },
    ],
  },
  auditor: {
    label: 'Auditor Portal',
    icon: '📋',
    color: '#134e4a',
    bg: '#0f3d3a',
    items: [
      { to: '/portal/auditor',           label: 'Dashboard', icon: '⊞' },
      { to: '/portal/auditor/branches',  label: 'Branches',  icon: '🏢' },
      { to: '/portal/auditor/reports',   label: 'Reports',   icon: '📊' },
    ],
  },
}

export default function PortalLayout() {
  const user = getPortalUser()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const role = user?.role || 'staff'
  const config = NAV_CONFIG[role] || NAV_CONFIG.staff

  const handleLogout = () => {
    multiLogoutUser()
    navigate('/portal/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: config.bg,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', flexShrink: 0, overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          padding: collapsed ? '20px 16px' : '20px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Logo />
          {!collapsed && (
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>PharmaOne</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3 }}>{config.label}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {config.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/portal/${role}` || item.to === `/portal/${role}/clients/add` || item.to === `/portal/${role}/staff/add`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 18px' : '11px 14px',
                borderRadius: 10, margin: '2px 0',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                background: isActive ? config.color : 'transparent',
                fontWeight: isActive ? 700 : 400, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: collapsed ? '14px 12px' : '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'capitalize' }}>{role}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.7)',
            fontSize: 13, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)',
          }}>
            <span>⏻</span>{!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'white', padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{
              border: 'none', background: 'var(--bg2)', padding: '6px 10px',
              borderRadius: 8, cursor: 'pointer', fontSize: 16,
            }}>☰</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: config.color }}>
              {config.icon} {config.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Welcome, <strong>{user?.name}</strong>
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: config.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
