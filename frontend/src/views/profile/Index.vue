<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <h3>个人中心</h3>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="邮箱">{{ userStore.user?.email }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userStore.user?.nickname || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ userStore.user?.role }}</el-descriptions-item>
        <el-descriptions-item label="账户余额">${{ userStore.user?.balance || 0 }}</el-descriptions-item>
        <el-descriptions-item label="赠送余额">${{ userStore.user?.gift_balance || 0 }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
</script>

<style scoped lang="scss">
.profile-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>

