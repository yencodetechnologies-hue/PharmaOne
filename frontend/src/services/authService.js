import API from './api'

/*
========================================
REGISTER ADMIN
========================================
*/
export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData)

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }

  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }

  return response.data
}

/*
========================================
LOGIN ADMIN
========================================
*/
export const loginUser = async (userData) => {
  const response = await API.post('/auth/login', userData)

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }

  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }

  return response.data
}

/*
========================================
LOGOUT
========================================
*/
export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/*
========================================
GET CURRENT USER (from localStorage)
========================================
*/
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}
