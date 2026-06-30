import axios from 'axios'
import { getPortalToken } from './multiAuthService'

// Separate axios instance for portal (branch/staff/client etc.)
const PortalAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7004/api',
})

PortalAPI.interceptors.request.use((config) => {
  // Try portal token first, fall back to admin token
  const token = getPortalToken() || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default PortalAPI
