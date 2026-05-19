import { create } from 'zustand'
import axios from 'axios'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  login: async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      set({ token: res.data.access_token })
      return true
    } catch (error) {
      return false
    }
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null })
  }
}))