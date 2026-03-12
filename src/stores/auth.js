import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 模拟管理员账号配置
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  // 是否已登录
  const isAuthenticated = computed(() => !!token.value)

  // 登录
  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // 模拟登录验证
      setTimeout(() => {
        if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
          const mockToken = 'mock_token_' + Date.now()
          const user = { username, role: 'admin' }
          
          token.value = mockToken
          userInfo.value = user
          
          localStorage.setItem('admin_token', mockToken)
          localStorage.setItem('admin_user', JSON.stringify(user))
          
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  // 检查登录状态
  const checkAuth = () => {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      userInfo.value = JSON.parse(savedUser)
      return true
    }
    return false
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
