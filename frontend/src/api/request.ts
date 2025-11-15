import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api/v1', // 硬编码相对路径，经过Vite代理
  timeout: 360000, // 6分钟超时，确保购买操作有足够时间完成IP分配
  headers: {
    'Content-Type': 'application/json',
  },
});

// 标记是否正在刷新token
let isRefreshing = false;
// 存储待重试的请求
let failedQueue: any[] = [];

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 处理待重试队列
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 如果返回的状态码不是200，则认为是错误
    if (response.status !== 200 && response.status !== 201) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    
    if (error.response) {
      const { status, data } = error.response;
      
      // 401错误 - 尝试刷新token
      if (status === 401 && !originalRequest._retry) {
        // 跳过refresh接口本身的401错误
        if (originalRequest.url?.includes('/auth/refresh')) {
          console.warn('[Request] Refresh token expired, redirecting to login');
          if (window.location.pathname !== '/login') {
            ElMessage.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 500);
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // 如果正在刷新，将请求加入队列
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return request(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // 没有refresh token，直接跳转登录
          console.warn('[Request] No refresh token, redirecting to login');
          isRefreshing = false;
          processQueue(error, null);
          
          if (window.location.pathname !== '/login') {
            ElMessage.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 500);
          }
          return Promise.reject(error);
        }

        try {
          // 尝试刷新token
          console.log('[Request] Attempting to refresh token...');
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          });

          if (response.data && response.data.access_token) {
            const newToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token;
            
            console.log('[Request] Token refreshed successfully');
            
            // 更新token
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            
            // 更新请求头
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            
            // 处理队列中的请求
            processQueue(null, newToken);
            isRefreshing = false;
            
            // 重试原请求
            return request(originalRequest);
          }
        } catch (refreshError: any) {
          // 刷新失败，清除所有数据并跳转登录
          console.error('[Request] Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
          
          if (window.location.pathname !== '/login') {
            // 延迟跳转，避免在消息框显示时跳转
            ElMessage.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh_token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 500);
          }
          return Promise.reject(refreshError);
        }
      }
      
      // 其他HTTP错误
      switch (status) {
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default request;

