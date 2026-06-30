import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../components/auth/AuthContext'
import { useState } from 'react'

const PharmaLogo = () => (
  <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="10" width="24" height="6" rx="3" fill="#0D6EAC"/>
    <rect x="10" y="1" width="6" height="24" rx="3" fill="#0D6EAC"/>
    <rect x="1" y="10" width="24" height="6" rx="3" fill="#00B894" opacity="0.55"/>
    <rect x="10" y="1" width="6" height="24" rx="3" fill="#00B894" opacity="0.55"/>
    <circle cx="13" cy="13" r="4" fill="#0D6EAC"/>
  </svg>
)

const NAV = [
  { section: 'Overview' },
  { to: '/dashboard', icon: 'fas fa-th-large',  label: 'Dashboard' },
  { section: 'Masters' },
  { label: 'Masters', icon: 'fas fa-sitemap', id: 'masters', children: [
    { to: '/masters/branches',      label: 'Branch Master' },
    { to: '/masters/doctors',       label: 'Doctor Master' },
    { to: '/masters/employees',     label: 'Staff Master' },
    { to: '/masters/vendors',       label: 'Vendor Master' },
    { to: '/masters/products',      label: 'Product Master' },
    { to: '/masters/treatments',    label: 'Treatment Master' },
    { to: '/masters/categories',    label: 'Category Master' },
    { to: '/masters/brands',        label: 'Brand Master' },
    { to: '/masters/payment-modes', label: 'Payment Mode' },
  ]},
  { section: 'Clinical' },
  { label: 'Patient Management', icon: 'fas fa-user-injured', id: 'patients', badge: '12', children: [
    { to: '/patients/list',           label: 'Patient List' },
    { to: '/patients/register',       label: 'Patient Registration' },
    { to: '/patients/enquiry',        label: 'Patient Enquiry' },
    { to: '/patients/appointments',   label: 'Appointment' },
    { to: '/patients/consultation',   label: 'Consultation' },
    { to: '/patients/treatment-plan', label: 'Treatment Plan' },
    { to: '/estimations',             label: 'Estimation' },
  ]},
  { label: 'Appointments', icon: 'fas fa-calendar-check', id: 'appts', badge: '8', children: [
    { to: '/appointments/calendar',  label: 'Calendar View' },
    { to: '/appointments/today',     label: "Today's Appointments" },
    { to: '/appointments/upcoming',  label: 'Upcoming Appointments' },
  ]},
  { label: 'Doctor Management', icon: 'fas fa-stethoscope', id: 'doctormgmt', children: [
    { to: '/masters/doctors',        label: 'Doctor List' },
    { to: '/doctors/schedule',       label: 'Doctor Schedule' },
  ]},
  { section: 'Operations' },
  { label: 'Pharmacy', icon: 'fas fa-capsules', id: 'pharmacy', children: [
    { to: '/pharmacy/stock-entry',  label: 'Stock Entry' },
    { to: '/pharmacy/purchase',     label: 'Purchase Entry' },
    { to: '/pharmacy/sales',        label: 'Sales' },
    { to: '/pharmacy/expiry',       label: 'Expiry Management' },
    { to: '/pharmacy/low-stock',    label: 'Low Stock Alert' },
  ]},
  { label: 'Inventory', icon: 'fas fa-boxes', id: 'inventory', badgeColor: '#F39C12', badge: '3', children: [
    { to: '/inventory/stock-in',   label: 'Stock In' },
    { to: '/inventory/stock-out',  label: 'Stock Out' },
    { to: '/inventory/current',    label: 'Current Stock' },
  ]},
  { label: 'Employee Management', icon: 'fas fa-users', id: 'employees', children: [
    { to: '/masters/employees',    label: 'Employee List' },
    { to: '/employees/attendance', label: 'Attendance' },
    { to: '/employees/leave',      label: 'Leave Management' },
    { to: '/employees/payroll',    label: 'Payroll' },
  ]},
  { section: 'Finance' },
  { label: 'Billing & Invoice', icon: 'fas fa-file-invoice-dollar', id: 'billing', children: [
    { to: '/invoices',           label: 'Invoice List' },
    { to: '/invoices/generate',  label: 'Generate Invoice' },
    { to: '/estimations',        label: 'Estimation List' },
    { to: '/transactions',       label: 'Transactions' },
  ]},
  { label: 'Vendor Management', icon: 'fas fa-truck', id: 'vendors', children: [
    { to: '/masters/vendors',            label: 'Vendor List' },
    { to: '/vendors/purchase-orders',    label: 'Purchase Orders' },
  ]},
  { label: 'Financial Reports', icon: 'fas fa-chart-line', id: 'finance', children: [
    { to: '/expenses',      label: 'Expenses' },
    { to: '/orders',        label: 'Orders' },
    { to: '/deliveries',    label: 'Deliveries' },
  ]},
  { section: 'Admin' },
  { label: 'User Management', icon: 'fas fa-shield-alt', id: 'usermgmt', children: [
    { to: '/hosts',    label: 'Host / Admin' },
    { to: '/auditors', label: 'Auditors' },
  ]},
  { to: '/settings/general', icon: 'fas fa-cog', label: 'Settings' },
]

function NavGroup({ item, open, toggle }) {
  const location = useLocation()
  const isGroupActive = item.children?.some(c => location.pathname.startsWith(c.to))
  const isOpen = open

  return (
    <div>
      <div
        className={`nav-item${isGroupActive ? ' active' : ''}`}
        onClick={() => toggle(item.id)}
      >
        <div className="nav-icon"><i className={item.icon} /></div>
        <span className="nav-label">{item.label}</span>
        {item.badge && (
          <span className="nav-badge" style={item.badgeColor ? { background: item.badgeColor } : {}}>
            {item.badge}
          </span>
        )}
        <i className="fas fa-chevron-right nav-arrow" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }} />
      </div>
      {isOpen && (
        <div className="nav-sub">
          {item.children.map(c => (
            <NavLink key={c.to} to={c.to} className={({ isActive }) => `nav-sub-item${isActive ? ' active-sub' : ''}`}>
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState(['masters'])

  const toggle = id => setOpenGroups(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id])
  const handleLogout = () => { logout(); navigate('/login') }

  const breadcrumb = location.pathname.split('/').filter(Boolean)

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><PharmaLogo /></div>
          <div className="logo-text">
            <h1>PharmaOne</h1>
            <span>Healthcare Management</span>
          </div>
        </div>
        <div className="sidebar-branch">
          <i className="fas fa-building" style={{ color: 'var(--primary)', fontSize: 13 }} />
          <div>
            <span className="branch-name">Chennai – Velachery</span>
            <span className="branch-code">Branch: CHN001 · Main Branch</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item, idx) => {
            if (item.section) return (
              <div key={idx} className="nav-section-label">{item.section}</div>
            )
            if (item.children) return (
              <NavGroup key={item.id} item={item} open={openGroups.includes(item.id)} toggle={toggle} />
            )
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <div className="nav-icon"><i className={item.icon} /></div>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-user" onClick={handleLogout}>
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>Super Admin</span>
          </div>
          <i className="fas fa-sign-out-alt" style={{ color: 'var(--text-light)', fontSize: 13 }} />
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-breadcrumb">
              <a href="/dashboard">Dashboard</a>
              {breadcrumb.map((seg, i) => (
                <span key={i}>
                  <span className="sep"> &rsaquo; </span>
                  <span className={i === breadcrumb.length - 1 ? 'current' : ''}>
                    {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="topbar-search">
            <span className="search-icon"><i className="fas fa-search" /></span>
            <input placeholder="Search branches, codes…" />
          </div>

          <div className="topbar-actions">
            <button className="topbar-btn" title="Notifications">
              <i className="fas fa-bell" />
              <span className="notif-dot" />
            </button>
            <button className="topbar-btn" title="Calendar">
              <i className="fas fa-calendar-alt" />
            </button>
            <a href="/portal/login" className="btn btn-outline btn-sm">Portal →</a>
            <div className="topbar-profile">
              <div className="mini-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'Admin'}</span>
              <i className="fas fa-chevron-down" style={{ fontSize: 11, color: 'var(--text-light)' }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>© 2026 <strong>PharmaOne Healthcare Management</strong> · CHN001 – Velachery Branch</span>
          <span>Version 2.1.0 · Powered by <strong>YENCODE Technologies</strong></span>
        </footer>
      </div>
    </div>
  )
}
