import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { login, register, adminLogin, type LoginParams, type RegisterParams } from '@/api/modules/auth';

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  // 计算属性
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // 用户登录
  async function userLogin(params: LoginParams) {
    try {
      const response = await login(params);
      
      // 保存token和用户信息
      token.value = response.access_token;
      user.value = response.user;
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      ElMessage.success('登录成功');
      return true;
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败');
      return false;
    }
  }

  // 管理员登录
  async function adminUserLogin(params: LoginParams) {
    try {
      const response = await adminLogin(params);
      
      // 保存token和用户信息
      token.value = response.access_token;
      user.value = response.user;
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      ElMessage.success('管理员登录成功');
      return true;
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败');
      return false;
    }
  }

  // 用户注册
  async function userRegister(params: RegisterParams) {
    try {
      const response = await register(params);
      
      // 注册成功后自动登录
      token.value = response.access_token;
      user.value = response.user;
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      ElMessage.success('注册成功');
      return true;
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '注册失败');
      return false;
    }
  }

  // 退出登录
  function logout() {
    token.value = '';
    user.value = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    ElMessage.info('已退出登录');
  }

  // 更新用户信息
  function updateUser(newUser: any) {
    user.value = { ...user.value, ...newUser };
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  // 更新余额
  function updateBalance(newBalance: number) {
    if (user.value) {
      user.value.balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    userLogin,
    adminUserLogin,
    userRegister,
    logout,
    updateUser,
    updateBalance,
  };
});

