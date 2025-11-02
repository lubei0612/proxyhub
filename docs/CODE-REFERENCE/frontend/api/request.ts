import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response
      const errorMessage = data?.message || data?.msg || data?.error

      switch (status) {
        case 401:
          if (errorMessage) {
            ElMessage.error(errorMessage)
            if (!errorMessage.includes('用户不存在') && !errorMessage.includes('密码错误')) {
              const userStore = useUserStore()
              userStore.logout()
              if (router.currentRoute.value.path !== '/login' && 
                  router.currentRoute.value.path !== '/admin-portal/login') {
                router.push('/login')
              }
            }
          } else {
            ElMessage.error('未登录或登录已过期，请重新登录')
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
          }
          break
        case 403:
          ElMessage.error(errorMessage || '没有权限访问')
          break
        case 404:
          ElMessage.error(errorMessage || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(errorMessage || '服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(errorMessage || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default request








