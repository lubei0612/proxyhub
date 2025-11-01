import request from '../request';

export interface RegisterParams {
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    nickname: string;
    role: string;
    balance: number;
    status: string;
    createdAt: string;
  };
  access_token: string;
  refresh_token: string;
}

/**
 * 用户注册
 */
export function register(data: RegisterParams) {
  return request.post<any, AuthResponse>('/auth/register', data);
}

/**
 * 用户登录
 */
export function login(data: LoginParams) {
  return request.post<any, AuthResponse>('/auth/login', data);
}

/**
 * 管理员登录
 */
export function adminLogin(data: LoginParams) {
  return request.post<any, AuthResponse>('/auth/admin-login', data);
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken: string) {
  return request.post('/auth/refresh', { refresh_token: refreshToken });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request.get('/auth/profile');
}

