<template>
  <div class="login-container">
    <el-card class="login-card">
      <h1>ProxyHub</h1>
      <p>代理IP管理平台</p>
      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.email"
            placeholder="邮箱"
            type="email"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            type="password"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span>还没有账号？</span>
        <a href="/register">立即注册</a>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const loginForm = reactive({
  email: '',
  password: '',
});

const loading = ref(false);

// 错误消息映射
const errorMessages: Record<string, string> = {
  AUTH_USER_NOT_FOUND: '该账号不存在，请先注册',
  AUTH_INVALID_PASSWORD: '密码错误，请重试',
  AUTH_INVALID_EMAIL_FORMAT: '请输入有效的邮箱地址',
  AUTH_ACCOUNT_DISABLED: '账户已被禁用，请联系客服',
  AUTH_ADMIN_REQUIRED: '需要管理员权限',
};

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    ElMessage.warning('请输入邮箱和密码');
    return;
  }
  
  loading.value = true;
  
  try {
    const success = await userStore.userLogin({
      email: loginForm.email,
      password: loginForm.password,
    });
    
    if (success) {
      // 确保localStorage写入完成后再跳转
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 使用replace而不是push，避免返回到login页
      router.replace('/dashboard');
    }
  } catch (error: any) {
    // 处理详细错误消息
    let errorMsg = '登录失败，请重试';
    
    if (error.response?.data) {
      const { errorCode, message } = error.response.data;
      
      // 优先使用映射的错误消息，如果没有映射则使用后端返回的message
      if (errorCode && errorMessages[errorCode]) {
        errorMsg = errorMessages[errorCode];
      } else if (message) {
        errorMsg = message;
      }
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    ElMessage.error(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  text-align: center;

  h1 {
    margin: 0 0 10px;
    font-size: 32px;
    color: #409eff;
  }

  p {
    margin: 0 0 30px;
    color: #909399;
    font-size: 14px;
  }
}

.login-form {
  margin-top: 30px;
}

.login-footer {
  margin-top: 20px;
  font-size: 14px;

  a {
    color: #409eff;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

