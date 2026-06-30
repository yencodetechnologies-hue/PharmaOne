import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/auth/AuthContext'
import { getPortalUser } from './services/multiAuthService'

// Layouts
import AdminLayout    from './layouts/AdminLayout'
import PortalLayout   from './layouts/PortalLayout'

// Auth pages
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import PortalLoginPage  from './pages/PortalLoginPage'

// Admin pages
import Dashboard    from './pages/admin/Dashboard'
import Clients      from './pages/admin/Clients'
import Doctors      from './pages/admin/Doctors'
import Employees    from './pages/admin/Employees'
import Vendors      from './pages/admin/Vendors'
import Auditors     from './pages/admin/Auditors'
import Invoices     from './pages/admin/Invoices'
import Expenses     from './pages/admin/Expenses'
import Branches     from './pages/admin/Branches'
import Transactions from './pages/admin/Transactions'
import Orders       from './pages/admin/Orders'
import Estimations  from './pages/admin/Estimations'
import Deliveries   from './pages/admin/Deliveries'
import Hosts        from './pages/admin/Hosts'

// Master pages
import Categories   from './pages/admin/masters/Categories'
import Brands       from './pages/admin/masters/Brands'
import PaymentModes from './pages/admin/masters/PaymentModes'
import Products     from './pages/admin/masters/Products'
import Treatments   from './pages/admin/masters/Treatments'

// Portal pages — Branch
import BranchDashboard from './pages/portal/branch/BranchDashboard'
import BranchStaff     from './pages/portal/branch/BranchStaff'
import BranchClients   from './pages/portal/branch/BranchClients'

// Portal pages — Staff
import StaffDashboard  from './pages/portal/staff/StaffDashboard'
import StaffClients    from './pages/portal/staff/StaffClients'

// Portal pages — Other
import HostDashboard    from './pages/portal/host/HostDashboard'
import DoctorDashboard  from './pages/portal/doctor/DoctorDashboard'
import ClientDashboard  from './pages/portal/client/ClientDashboard'
import VendorDashboard  from './pages/portal/vendor/VendorDashboard'
import AuditorDashboard from './pages/portal/auditor/AuditorDashboard'

/* Placeholder for routes not yet implemented */
const Soon = ({ title }) => (
  <div style={{ textAlign:'center', padding:'60px 20px' }}>
    <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
    <h2 style={{ color:'var(--text)', marginBottom:8 }}>{title}</h2>
    <p style={{ color:'var(--text-muted)' }}>This section is coming soon.</p>
  </div>
)

/* ── Guards ─────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace /> }
const PublicRoute    = ({ children }) => { const { user } = useAuth(); return !user ? children : <Navigate to="/dashboard" replace /> }
const PortalGuard = ({ children, role }) => {
  const pu = getPortalUser()
  if (!pu) return <Navigate to="/portal/login" replace />
  if (role && pu.role !== role) return <Navigate to="/portal/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"        element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"     element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/portal/login" element={<PortalLoginPage />} />

          {/* ── Admin panel ─────────────────────────────────── */}
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard"    element={<Dashboard />} />

            {/* Masters */}
            <Route path="masters/branches"      element={<Branches />} />
            <Route path="masters/doctors"       element={<Doctors />} />
            <Route path="masters/employees"     element={<Employees />} />
            <Route path="masters/vendors"       element={<Vendors />} />
            <Route path="masters/products"      element={<Products />} />
            <Route path="masters/treatments"    element={<Treatments />} />
            <Route path="masters/categories"    element={<Categories />} />
            <Route path="masters/brands"        element={<Brands />} />
            <Route path="masters/payment-modes" element={<PaymentModes />} />

            {/* Backward-compat old paths */}
            <Route path="branches"     element={<Branches />} />
            <Route path="doctors"      element={<Doctors />} />
            <Route path="employees"    element={<Employees />} />
            <Route path="vendors"      element={<Vendors />} />

            {/* Patient Management */}
            <Route path="patients/list"          element={<Clients />} />
            <Route path="patients/register"      element={<Clients />} />
            <Route path="patients/enquiry"       element={<Soon title="Patient Enquiry" />} />
            <Route path="patients/appointments"  element={<Soon title="Appointments" />} />
            <Route path="patients/consultation"  element={<Soon title="Consultation" />} />
            <Route path="patients/treatment-plan"element={<Soon title="Treatment Plan" />} />
            <Route path="clients"                element={<Clients />} />

            {/* Doctor Management */}
            <Route path="doctors/schedule"       element={<Soon title="Doctor Schedule" />} />

            {/* Employee Management */}
            <Route path="employees/attendance"   element={<Soon title="Attendance" />} />
            <Route path="employees/leave"        element={<Soon title="Leave Management" />} />
            <Route path="employees/payroll"      element={<Soon title="Payroll" />} />

            {/* Pharmacy */}
            <Route path="pharmacy/stock-entry"   element={<Soon title="Stock Entry" />} />
            <Route path="pharmacy/purchase"      element={<Soon title="Purchase Entry" />} />
            <Route path="pharmacy/sales"         element={<Soon title="Sales" />} />
            <Route path="pharmacy/expiry"        element={<Soon title="Expiry Management" />} />
            <Route path="pharmacy/low-stock"     element={<Soon title="Low Stock Alert" />} />

            {/* Inventory */}
            <Route path="inventory/stock-in"     element={<Soon title="Stock In" />} />
            <Route path="inventory/stock-out"    element={<Soon title="Stock Out" />} />
            <Route path="inventory/current"      element={<Soon title="Current Stock" />} />

            {/* Vendor */}
            <Route path="vendors/purchase-orders"element={<Soon title="Purchase Orders" />} />

            {/* Billing */}
            <Route path="invoices"               element={<Invoices />} />
            <Route path="invoices/generate"      element={<Invoices />} />
            <Route path="estimations"            element={<Estimations />} />
            <Route path="transactions"           element={<Transactions />} />

            {/* Appointments */}
            <Route path="appointments/calendar"  element={<Soon title="Calendar View" />} />
            <Route path="appointments/today"     element={<Soon title="Today's Appointments" />} />
            <Route path="appointments/upcoming"  element={<Soon title="Upcoming Appointments" />} />

            {/* Other */}
            <Route path="orders"       element={<Orders />} />
            <Route path="expenses"     element={<Expenses />} />
            <Route path="deliveries"   element={<Deliveries />} />
            <Route path="hosts"        element={<Hosts />} />
            <Route path="auditors"     element={<Auditors />} />

            {/* Settings */}
            <Route path="settings/general" element={<Soon title="Settings" />} />
          </Route>

          {/* ── Portal routes ───────────────────────────────── */}
          <Route path="/portal/branch" element={<PortalGuard role="branch"><PortalLayout /></PortalGuard>}>
            <Route index element={<BranchDashboard />} />
            <Route path="staff"          element={<BranchStaff />} />
            <Route path="staff/add"      element={<BranchStaff />} />
            <Route path="clients"        element={<BranchClients />} />
            <Route path="clients/add"    element={<BranchClients />} />
            <Route path="appointments"   element={<BranchClients />} />
          </Route>

          <Route path="/portal/staff" element={<PortalGuard role="staff"><PortalLayout /></PortalGuard>}>
            <Route index element={<StaffDashboard />} />
            <Route path="clients"      element={<StaffClients />} />
            <Route path="clients/add"  element={<StaffClients />} />
            <Route path="appointments" element={<StaffClients />} />
          </Route>

          <Route path="/portal/host"    element={<PortalGuard role="host"><PortalLayout /></PortalGuard>}><Route index element={<HostDashboard />} /></Route>
          <Route path="/portal/doctor"  element={<PortalGuard role="doctor"><PortalLayout /></PortalGuard>}><Route index element={<DoctorDashboard />} /></Route>
          <Route path="/portal/client"  element={<PortalGuard role="client"><PortalLayout /></PortalGuard>}><Route index element={<ClientDashboard />} /></Route>
          <Route path="/portal/vendor"  element={<PortalGuard role="vendor"><PortalLayout /></PortalGuard>}><Route index element={<VendorDashboard />} /></Route>
          <Route path="/portal/auditor" element={<PortalGuard role="auditor"><PortalLayout /></PortalGuard>}><Route index element={<AuditorDashboard />} /></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
