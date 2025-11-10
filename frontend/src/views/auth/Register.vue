<template>
  <div class="auth-container">
    <!-- 左侧品牌区 -->
    <div class="brand-section">
      <div class="brand-content">
        <!-- Logo with breathing effect -->
        <div class="logo-wrapper">
          <div class="logo-breathing">
            <svg viewBox="0 0 200 200" class="logo-svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4a9eff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#1e5db8;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#logoGradient)" />
              <path d="M 100 50 L 130 90 L 100 90 L 100 150 L 70 110 L 100 110 Z" fill="white" />
            </svg>
          </div>
          <h2 class="brand-name">ProxyHub</h2>
        </div>

        <!-- 主标题 -->
        <div class="brand-title">
          <h1>ProxyHub</h1>
          <div class="brand-slogan">
            <span>安全</span>
            <span>快速</span>
            <span>稳定</span>
          </div>
        </div>

        <!-- 特点列表 -->
        <div class="feature-list">
          <div class="feature-item">
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>高度可靠，正常运行时间99.9%</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>支持HTTP/HTTPS/SOCKS5协议</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>超过190个国家有2亿多个住宅IP在线</span>
          </div>
        </div>

        <!-- 背景装饰 -->
        <div class="bg-decoration"></div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-section">
      <div class="form-content">
        <!-- 语言切换 -->
        <div class="language-selector">
          <el-dropdown>
            <span class="lang-btn">
              简体中文 <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>简体中文</el-dropdown-item>
                <el-dropdown-item>English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 注册表单 -->
        <div class="form-wrapper">
          <h1 class="form-title">立即注册</h1>

          <el-form :model="registerForm" :rules="rules" ref="formRef" class="register-form">
            <el-form-item label="姓名" prop="nickname" required>
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入姓名"
                size="large"
              />
            </el-form-item>

            <el-form-item label="移动电话" prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入移动电话"
                size="large"
              />
            </el-form-item>

            <el-form-item label="电子邮箱" prop="email" required>
              <el-input
                v-model="registerForm.email"
                placeholder="请输入电子邮箱"
                size="large"
              />
            </el-form-item>

            <el-form-item label="验证码" prop="code">
              <div class="code-input-group">
                <el-input
                  v-model="registerForm.code"
                  placeholder="请输入验证码"
                  size="large"
                />
                <el-button 
                  type="primary" 
                  size="large"
                  :disabled="codeSending || countdown > 0"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="密码" prop="password" required>
              <el-input
                v-model="registerForm.password"
                placeholder="请输入密码"
                type="password"
                size="large"
                show-password
              />
            </el-form-item>

            <el-form-item label="邀请码（选填）" prop="inviteCode">
              <el-input
                v-model="registerForm.inviteCode"
                placeholder="请输入邀请码"
                size="large"
              />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="registerForm.agree">
                我已阅读并同意
                <a href="#" class="link">《服务条款》</a>
                和
                <a href="#" class="link">《购买政策》</a>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <router-link to="/login">返回登录</router-link>
          </div>

          <p class="disclaimer">
            * 本产品不支持任何形式的赌博服务，仅支持在境外网络环境下合法合规使用
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CircleCheck, ArrowDown } from '@element-plus/icons-vue';
import request from '@/api/request';

const router = useRouter();
const formRef = ref();

const loading = ref(false);
const codeSending = ref(false);
const countdown = ref(0);

const registerForm = reactive({
  nickname: '',
  email: '',
  phone: '',
  password: '',
  code: '',
  inviteCode: '',
  agree: false,
});

const rules = {
  nickname: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
};

const handleRegister = async () => {
  if (!registerForm.agree) {
    ElMessage.warning('请阅读并同意服务条款和购买政策');
    return;
  }

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    await request({
      url: '/auth/register',
      method: 'post',
      data: {
        email: registerForm.email,
        password: registerForm.password,
        nickname: registerForm.nickname,
        phone: registerForm.phone,
      },
    });

    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-container {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

/* 左侧品牌区 */
.brand-section {
  flex: 0 0 40%;
  background: linear-gradient(135deg, #0a1f3d 0%, #1a4d7a 50%, #0d2847 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;

  .brand-content {
    position: relative;
    z-index: 2;
    color: white;
  }

  /* Logo with breathing effect */
  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 60px;

    .logo-breathing {
      width: 50px;
      height: 50px;
      animation: breathe 3s ease-in-out infinite;

      .logo-svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 4px 12px rgba(74, 158, 255, 0.4));
      }
    }

    .brand-name {
      font-size: 28px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
  }

  @keyframes breathe {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.08);
      opacity: 0.9;
    }
  }

  /* 主标题 */
  .brand-title {
    margin-bottom: 50px;

    h1 {
      font-size: 56px;
      font-weight: 700;
      margin: 0 0 20px 0;
      color: white;
      letter-spacing: 2px;
    }

    .brand-slogan {
      display: flex;
      gap: 30px;
      font-size: 32px;
      font-weight: 300;
      color: rgba(255, 255, 255, 0.95);
      
      span {
        position: relative;
        padding: 0 15px;
        
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  /* 特点列表 */
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);

      .feature-icon {
        font-size: 20px;
        color: #4a9eff;
      }
    }
  }

  /* 背景装饰 */
  .bg-decoration {
    position: absolute;
    width: 800px;
    height: 800px;
    bottom: -400px;
    right: -400px;
    background: radial-gradient(circle, rgba(74, 158, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.03) 0px,
        transparent 1px,
        transparent 40px,
        rgba(255, 255, 255, 0.03) 41px
      );
    }
  }
}

/* 右侧表单区 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;

  .form-content {
    width: 100%;
    max-width: 480px;
    position: relative;
  }

  /* 语言切换 */
  .language-selector {
    position: absolute;
    top: 0;
    right: 0;

    .lang-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        color: #1677ff;
      }
    }
  }

  /* 表单包装器 */
  .form-wrapper {
    margin-top: 40px;

    .form-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 30px 0;
    }

    /* 表单 */
    .register-form {
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #333;
      }

      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px #e0e0e0 inset;
        
        &:hover {
          box-shadow: 0 0 0 1px #1677ff inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px #1677ff inset;
        }
      }

      .code-input-group {
        display: flex;
        gap: 10px;

        .el-input {
          flex: 1;
        }

        .el-button {
          flex-shrink: 0;
          min-width: 120px;
          white-space: nowrap;
        }
      }

      .link {
        color: #1677ff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .submit-btn {
        width: 100%;
        background: #1677ff;
        border-color: #1677ff;
        font-size: 16px;
        height: 44px;

        &:hover {
          background: #3d8fff;
          border-color: #3d8fff;
        }
      }
    }

    /* 表单底部 */
    .form-footer {
      text-align: center;
      margin-top: 20px;

      a {
        color: #1677ff;
        text-decoration: none;
        font-size: 14px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* 免责声明 */
    .disclaimer {
      text-align: center;
      margin-top: 30px;
      color: #999;
      font-size: 12px;
      line-height: 1.6;
    }
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .brand-section {
    flex: 0 0 35%;
    padding: 40px;

    .brand-title h1 {
      font-size: 42px;
    }

    .brand-slogan {
      font-size: 24px;
    }
  }
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .brand-section {
    flex: none;
    min-height: 300px;
    padding: 40px 20px;

    .brand-title h1 {
      font-size: 36px;
    }

    .brand-slogan {
      font-size: 20px;
      gap: 15px;
    }

    .feature-list {
      display: none;
    }
  }

  .form-section {
    padding: 30px 20px;
  }
}
</style>
