import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: User) => {
    // 确保balance是数字类型
    if (newUser && typeof newUser.balance !== 'number') {
      newUser.balance = Number(newUser.balance) || 0
    }
    user.value = newUser
    // 保存用户信息到localStorage，路由守卫需要
    localStorage.setItem('user', JSON.stringify(newUser))
    console.log('[UserStore] User saved to localStorage:', newUser.email, 'Role:', newUser.role)
  }

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.access_token)
    setUser(res.user)
    return res
  }

  const register = async (email: string, password: string, referralCode?: string) => {
    const res = await authApi.register(email, password, referralCode)
    setToken(res.access_token)
    setUser(res.user)
    return res
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('[UserStore] User logged out, localStorage cleared')
  }

  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      const res = await authApi.getProfile()
      setUser(res)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  const fetchUserInfo = async () => {
    if (!token.value) {
      return
    }

    try {
      const res = await authApi.getProfile()
      setUser(res)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const updateBalance = (amount: number) => {
    if (user.value) {
      user.value.balance = Number(user.value.balance) + amount
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth,
    fetchUserInfo,
    updateBalance,
    setUser,
  }
})












































































