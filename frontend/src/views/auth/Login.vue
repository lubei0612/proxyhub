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
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin">
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
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const loginForm = reactive({
  email: '',
  password: '',
});

const handleLogin = () => {
  if (!loginForm.email || !loginForm.password) {
    ElMessage.warning('请输入邮箱和密码');
    return;
  }
  // TODO: 调用登录API
  ElMessage.info('登录功能将在后续任务中实现');
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

