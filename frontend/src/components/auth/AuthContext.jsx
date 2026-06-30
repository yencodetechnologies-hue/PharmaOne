import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser())

  const login = async (email, password) => {
    const data = await loginUser({ email, password })
    setUser(data.user)
    return data.user
  }

  const register = async (userData) => {
    const data = await registerUser(userData)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
