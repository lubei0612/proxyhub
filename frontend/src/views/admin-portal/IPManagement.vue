<template>
  <div class="ip-management-container">
    <h1>IP管理</h1>

    <el-card shadow="hover">
      <el-alert
        title="提示"
        description="此页面用于管理所有代理IP"
        type="info"
        show-icon
        :closable="false"
        class="info-alert"
      />
      <p style="text-align: center; color: #909399; padding: 40px 0">
        IP管理功能用于查看和管理所有用户的代理IP
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// This page shows all proxy IPs for all users
</script>

<style scoped lang="scss">
.ip-management-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .info-alert {
    margin-bottom: 20px;
  }
}
</style>

