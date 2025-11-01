<template>
  <div class="admin-login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>ProxyHub 管理后台</h2>
        <p>仅限管理员登录</p>
      </div>
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.email"
            placeholder="管理员邮箱"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            type="password"
            size="large"
            show-password
            prefix-icon="Lock"
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
        <a @click="$router.push('/login')">返回用户登录</a>
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
      // 检查是否是管理员
      if (userStore.isAdmin) {
        router.push('/admin-portal/users');
      } else {
        ElMessage.error('您没有管理员权限');
        userStore.userLogout();
      }
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.admin-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;

  h2 {
    font-size: 24px;
    color: #303133;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.login-footer {
  margin-top: 20px;
  font-size: 14px;

  a {
    color: #409eff;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

