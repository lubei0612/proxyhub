<template>
  <div class="register-container">
    <el-card class="register-card">
      <h1>ProxyHub</h1>
      <p>创建您的账户</p>
      <el-form :model="registerForm" class="register-form">
        <el-form-item>
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            type="email"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.nickname"
            placeholder="昵称（可选）"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="registerForm.password"
            placeholder="密码（至少8位）"
            type="password"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="confirmPassword"
            placeholder="确认密码"
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
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <span>已有账号？</span>
        <a href="/login">立即登录</a>
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

const registerForm = reactive({
  email: '',
  nickname: '',
  password: '',
});

const confirmPassword = ref('');
const loading = ref(false);

const handleRegister = async () => {
  // 表单验证
  if (!registerForm.email) {
    ElMessage.warning('请输入邮箱');
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
  
  if (registerForm.password !== confirmPassword.value) {
    ElMessage.warning('两次密码输入不一致');
    return;
  }
  
  loading.value = true;
  
  try {
    const success = await userStore.userRegister({
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname || undefined,
    });
    
    if (success) {
      // 注册成功，跳转到仪表盘
      router.push('/dashboard');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
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

.register-form {
  margin-top: 30px;
}

.register-footer {
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

