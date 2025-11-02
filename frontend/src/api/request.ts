import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api/v1', // 硬编码相对路径，经过Vite代理
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error: AxiosError<any>) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录');
          // 清除token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 跳转到登录页
          window.location.href = '/login';
          break;
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

