import API from './api'

export const multiLoginUser = async ({ email, password, role }) => {
  const response = await API.post('/multi-auth/login', { email, password, role })
  if (response.data.token) {
    localStorage.setItem('portal_token', response.data.token)
  }
  if (response.data.user) {
    localStorage.setItem('portal_user', JSON.stringify(response.data.user))
  }
  return response.data
}

export const multiLogoutUser = () => {
  localStorage.removeItem('portal_token')
  localStorage.removeItem('portal_user')
}

export const getPortalUser = () => {
  const u = localStorage.getItem('portal_user')
  return u ? JSON.parse(u) : null
}

export const getPortalToken = () => localStorage.getItem('portal_token') || ''
