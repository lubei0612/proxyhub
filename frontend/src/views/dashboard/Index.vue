<template>
  <div class="dashboard-container">
    <el-card>
      <h1>欢迎来到ProxyHub</h1>
      <p>用户：{{ userStore.user?.email }}</p>
      <p>余额：${{ userStore.user?.balance || 0 }}</p>
      <p>角色：{{ userStore.user?.role }}</p>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;

  h1 {
    margin: 0 0 20px;
    color: #303133;
  }

  p {
    margin: 10px 0;
    font-size: 16px;
  }
}
</style>

