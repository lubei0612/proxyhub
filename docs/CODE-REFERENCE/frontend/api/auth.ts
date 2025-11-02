import request from './request'

export const authApi = {
  login: (email: string, password: string) => {
    return request.post('/auth/login', { email, password })
  },

  register: (email: string, password: string, referralCode?: string) => {
    return request.post('/auth/register', { email, password, referralCode })
  },

  logout: () => {
    return request.post('/auth/logout')
  },

  getProfile: () => {
    return request.get('/users/profile')
  },
}




