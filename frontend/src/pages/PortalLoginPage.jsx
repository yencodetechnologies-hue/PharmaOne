import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { multiLoginUser } from '../services/multiAuthService'

const ROLES = [
  { value: 'superadmin', label: 'Super Admin',  icon: '🛡️', color: '#6b21a8' },
  { value: 'host',       label: 'Host (Admin)', icon: '👑', color: '#b45309' },
  { value: 'branch',     label: 'Branch',       icon: '🏢', color: '#0369a1' },
  { value: 'doctor',     label: 'Doctor',       icon: '👨‍⚕️', color: '#065f46' },
  { value: 'staff',      label: 'Staff',        icon: '👥', color: '#1e40af' },
  { value: 'client',     label: 'Client',       icon: '🫀', color: '#9f1239' },
  { value: 'vendor',     label: 'Vendor',       icon: '🏭', color: '#92400e' },
  { value: 'auditor',    label: 'Auditor',      icon: '📋', color: '#134e4a' },
]

export default function PortalLoginPage() {
  const [selectedRole, setSelectedRole] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const roleInfo = ROLES.find(r => r.value === selectedRole)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) { setError('Please select your role'); return }
    setError('')
    setLoading(true)
    try {
      const data = await multiLoginUser({ ...form, role: selectedRole })
      const role = data.user.role
      // Redirect based on role
      const routes = {
        superadmin: '/dashboard',        // existing admin dashboard
        host:       '/portal/host',
        branch:     '/portal/branch',
        doctor:     '/portal/doctor',
        staff:      '/portal/staff',
        client:     '/portal/client',
        vendor:     '/portal/vendor',
        auditor:    '/portal/auditor',
      }
      navigate(routes[role] || '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d4f2e 0%, #1a7a4a 50%, #2ea566 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', backdropFilter: 'blur(8px)',
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4V32M4 18H32" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>PharmaOne</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Portal Login — Select your role to continue</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Who are you?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setSelectedRole(r.value); setError('') }}
                  style={{
                    padding: '10px 6px',
                    border: `2px solid ${selectedRole === r.value ? r.color : 'var(--border)'}`,
                    borderRadius: 10,
                    background: selectedRole === r.value ? `${r.color}12` : 'white',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: selectedRole === r.value ? r.color : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          {selectedRole && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                padding: '8px 14px', borderRadius: 8, background: `${roleInfo.color}10`,
                border: `1px solid ${roleInfo.color}30`,
              }}>
                <span>{roleInfo.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: roleInfo.color }}>Logging in as {roleInfo.label}</span>
              </div>

              {error && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #fed7d7',
                  borderRadius: 8, padding: '10px 14px',
                  color: 'var(--danger)', fontSize: 13, marginBottom: 16,
                }}>⚠ {error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, background: roleInfo.color, borderColor: roleInfo.color }}
                >
                  {loading ? '⏳ Signing in...' : `→ Sign in as ${roleInfo.label}`}
                </button>
              </form>
            </>
          )}

          {!selectedRole && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              ↑ Select your role above to login
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            Super Admin? Also accessible via{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}
