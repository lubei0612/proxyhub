<template>
  <div class="auth-container">
    <!-- Telegram风格背景图案 -->
    <div class="background-pattern"></div>
    
    <!-- 中心白色卡片 -->
    <div class="auth-card">
      <!-- ProxyHub Logo -->
      <div class="auth-logo">
        <div class="logo-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="url(#gradient)"/>
            <path d="M24 14L14 20V28L24 34L34 28V20L24 14Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 24L14 20M24 24L34 20M24 24V34" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="24" cy="24" r="3" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stop-color="#2563eb"/>
                <stop offset="1" stop-color="#1d4ed8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 class="logo-text">ProxyHub</h2>
        <p class="logo-subtitle">专业代理IP管理平台</p>
      </div>

      <!-- 顶部标签切换 -->
      <div class="auth-tabs">
        <button 
          :class="['auth-tab', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          :class="['auth-tab', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <div v-if="activeTab === 'login'" class="auth-content">
        <h1>登录</h1>
        <p class="subtitle">请输入您的邮箱和密码登录您的账户</p>

        <!-- 登录方式切换 -->
        <div class="login-mode-tabs">
          <button 
            :class="['mode-tab', { active: loginMode === 'password' }]"
            @click="loginMode = 'password'"
          >
            密码登录
          </button>
          <button 
            :class="['mode-tab', { active: loginMode === 'code' }]"
            @click="loginMode = 'code'"
          >
            验证码登录
          </button>
        </div>

        <!-- 密码登录 -->
        <div v-if="loginMode === 'password'" class="form-content">
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              placeholder="m@example.com"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="form-group">
            <div class="label-with-link">
              <label>密码</label>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>
            <div class="password-input">
              <input 
                v-model="loginForm.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                @keyup.enter="handleLogin"
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>记住密码</span>
            </label>
          </div>
        </div>

        <!-- 验证码登录 -->
        <div v-else class="form-content">
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="loginCodeForm.email" 
              type="email" 
              placeholder="m@example.com"
            />
          </div>

          <div class="form-group">
            <label>验证码</label>
            <div class="code-input-group">
              <input 
                v-model="loginCodeForm.code" 
                type="text" 
                placeholder="请输入6位验证码"
                maxlength="6"
                @keyup.enter="handleCodeLogin"
              />
              <button 
                type="button" 
                class="get-code-btn"
                :disabled="codeCountdown > 0"
                @click="sendLoginCode"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}秒` : '获取验证码' }}
              </button>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>记住密码</span>
            </label>
          </div>
        </div>

        <button 
          class="submit-btn" 
          :disabled="loginLoading"
          @click="loginMode === 'password' ? handleLogin() : handleCodeLogin()"
        >
          <span v-if="!loginLoading">登录</span>
          <span v-else>登录中...</span>
        </button>
      </div>

      <!-- 注册表单 -->
      <div v-else class="auth-content">
        <h1>注册</h1>
        <p class="subtitle">创建一个新账户</p>

        <div class="form-content">
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="registerForm.email" 
              type="email" 
              placeholder="m@example.com"
            />
          </div>

          <div class="form-group">
            <label>验证码</label>
            <div class="code-input-group">
              <input 
                v-model="registerForm.code" 
                type="text" 
                placeholder="请输入6位验证码"
                maxlength="6"
              />
              <button 
                type="button" 
                class="get-code-btn"
                :disabled="regCodeCountdown > 0"
                @click="sendRegisterCode"
              >
                {{ regCodeCountdown > 0 ? `${regCodeCountdown}秒` : '获取验证码' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>密码</label>
            <div class="password-input">
              <input 
                v-model="registerForm.password" 
                :type="showRegPassword ? 'text' : 'password'" 
                placeholder="至少8位字符"
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="showRegPassword = !showRegPassword"
              >
                <svg v-if="!showRegPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>邀请码（可选）</label>
            <input 
              v-model="registerForm.inviteCode" 
              type="text" 
              placeholder="请输入邀请码"
            />
          </div>

          <div class="form-group">
            <label>代理商邀请码（可选）</label>
            <input 
              v-model="registerForm.agentCode" 
              type="text" 
              placeholder="请输入代理商邀请码"
            />
          </div>
        </div>

        <button 
          class="submit-btn" 
          :disabled="registerLoading"
          @click="handleRegister"
        >
          <span v-if="!registerLoading">注册</span>
          <span v-else>注册中...</span>
        </button>

        <p class="terms-text">
          点击"注册"即表示您同意我们的 
          <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 标签状态（根据路由自动设置）
const activeTab = ref<'login' | 'register'>('login');
const loginMode = ref<'password' | 'code'>('password');

// 监听路由变化，自动切换标签
watch(() => route.path, (newPath) => {
  if (newPath === '/register') {
    activeTab.value = 'register';
  } else {
    activeTab.value = 'login';
  }
}, { immediate: true });

// 密码显示状态
const showPassword = ref(false);
const showRegPassword = ref(false);

// 记住密码
const rememberMe = ref(false);

// 加载状态
const loginLoading = ref(false);
const registerLoading = ref(false);

// 验证码倒计时
const codeCountdown = ref(0);
const regCodeCountdown = ref(0);

// 登录表单（密码）
const loginForm = reactive({
  email: '',
  password: '',
});

// 登录表单（验证码）
const loginCodeForm = reactive({
  email: '',
  code: '',
});

// 注册表单
const registerForm = reactive({
  email: '',
  code: '',
  password: '',
  inviteCode: '',
  agentCode: '',
});

// 发送登录验证码
const sendLoginCode = async () => {
  if (!loginCodeForm.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginCodeForm.email,
        type: 'login',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '发送失败');
    }

    ElMessage.success('验证码已发送，请查收邮箱');
    
    // 开始倒计时
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败，请重试');
  }
};

// 发送注册验证码
const sendRegisterCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registerForm.email,
        type: 'register',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '发送失败');
    }

    ElMessage.success('验证码已发送，请查收邮箱');
    
    // 开始倒计时
    regCodeCountdown.value = 60;
    const timer = setInterval(() => {
      regCodeCountdown.value--;
      if (regCodeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败，请重试');
  }
};

// 密码登录
const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    ElMessage.warning('请输入邮箱和密码');
    return;
  }
  
  loginLoading.value = true;
  
  try {
    const success = await userStore.userLogin({
      email: loginForm.email,
      password: loginForm.password,
    });
    
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/dashboard');
    }
  } catch (error: any) {
    let errorMsg = '登录失败，请重试';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }
    ElMessage.error(errorMsg);
  } finally {
    loginLoading.value = false;
  }
};

// 验证码登录
const handleCodeLogin = async () => {
  if (!loginCodeForm.email || !loginCodeForm.code) {
    ElMessage.warning('请输入邮箱和验证码');
    return;
  }

  loginLoading.value = true;
  
  try {
    const response = await fetch('/api/v1/auth/login-with-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginCodeForm.email,
        code: loginCodeForm.code,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '登录失败');
    }

    // 存储token和用户信息
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('userInfo', JSON.stringify(data.user));
    
    // 更新用户store
    userStore.setUser(data.user);
    
    ElMessage.success('登录成功');
    router.replace('/dashboard');
  } catch (error: any) {
    let errorMsg = '登录失败，请重试';
    if (error.message) {
      errorMsg = error.message;
    }
    ElMessage.error(errorMsg);
  } finally {
    loginLoading.value = false;
  }
};

// 注册
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }
  
  if (!registerForm.code) {
    ElMessage.warning('请输入验证码');
    return;
  }
  
  if (!registerForm.password) {
    ElMessage.warning('请输入密码');
    return;
  }
  
  if (registerForm.password.length < 8) {
    ElMessage.warning('密码至少需要8位');
    return;
  }
  
  registerLoading.value = true;
  
  try {
    const success = await userStore.userRegister({
      email: registerForm.email,
      password: registerForm.password,
      // TODO: 添加验证码和邀请码参数
    });
    
    if (success) {
      router.push('/dashboard');
    }
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #17212B 0%, #0E1621 100%);
  overflow: hidden;
}

// Telegram风格背景图案
.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px, 40px 40px;
  background-position: 0 0, 30px 30px;
  pointer-events: none;
}

// 中心卡片
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  margin: 20px;
}

// Logo区域
.auth-logo {
  padding: 40px 20px 20px;
  text-align: center;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-bottom: 1px solid #E4E7ED;
  
  .logo-icon {
    display: inline-flex;
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
    
    svg {
      filter: drop-shadow(0 4px 12px rgba(37, 99, 235, 0.2));
    }
  }
  
  .logo-text {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
  
  .logo-subtitle {
    margin: 0;
    font-size: 13px;
    color: #909399;
    font-weight: 400;
  }
}

// Logo浮动动画
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

// 顶部标签
.auth-tabs {
  display: flex;
  border-bottom: 1px solid #E4E7ED;
  
  .auth-tab {
    flex: 1;
    padding: 16px;
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 500;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    
    &:hover {
      color: #606266;
    }
    
    &.active {
      color: #303133;
      background: #FFFFFF;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #2C5F8D 0%, #4A9EE0 100%);
      }
    }
  }
}

// 内容区域
.auth-content {
  padding: 48px 40px;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    text-align: center;
  }
  
  .subtitle {
    margin: 0 0 32px 0;
    font-size: 14px;
    color: #909399;
    text-align: center;
  }
}

// 登录方式切换
.login-mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  padding: 4px;
  background: #F5F7FA;
  border-radius: 8px;
  
  .mode-tab {
    flex: 1;
    padding: 10px;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s;
    
    &:hover {
      color: #303133;
    }
    
    &.active {
      background: #FFFFFF;
      color: #303133;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
  }
}

// 表单内容
.form-content {
  .form-group {
    margin-bottom: 24px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }
    
    input[type="email"],
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #DCDFE6;
      border-radius: 8px;
      font-size: 16px;
      color: #303133;
      transition: all 0.3s;
      box-sizing: border-box;
      
      &::placeholder {
        color: #C0C4CC;
      }
      
      &:focus {
        outline: none;
        border-color: #4A9EE0;
        box-shadow: 0 0 0 2px rgba(74, 158, 224, 0.1);
      }
      
      &:hover {
        border-color: #C0C4CC;
      }
    }
    
    &.checkbox-group {
      margin-bottom: 32px;
      
      .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-weight: normal;
        
        input[type="checkbox"] {
          margin-right: 8px;
          cursor: pointer;
        }
        
        span {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
  
  .label-with-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .forgot-link {
      font-size: 14px;
      color: #4A9EE0;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .password-input {
    position: relative;
    
    input {
      padding-right: 48px;
    }
    
    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      color: #909399;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.3s;
      
      &:hover {
        color: #606266;
      }
    }
  }
  
  .code-input-group {
    display: flex;
    gap: 8px;
    
    input {
      flex: 1;
    }
    
    .get-code-btn {
      padding: 12px 20px;
      border: 1px solid #DCDFE6;
      background: #FFFFFF;
      border-radius: 8px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
      
      &:hover:not(:disabled) {
        border-color: #4A9EE0;
        color: #4A9EE0;
      }
      
      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}

// 提交按钮
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  background: linear-gradient(135deg, #2C5F8D 0%, #4A9EE0 100%);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 158, 224, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// 条款文字
.terms-text {
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
  text-align: center;
  line-height: 1.6;
  
  a {
    color: #4A9EE0;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .auth-card {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .auth-content {
    padding: 32px 24px;
  }
}
</style>

