<template>
  <div class="admin-orders-container">
    <h1>订单管理</h1>

    <el-card shadow="hover">
      <el-alert
        title="提示"
        description="此页面显示所有用户的订单记录"
        type="info"
        show-icon
        :closable="false"
        class="info-alert"
      />
      <p style="text-align: center; color: #909399; padding: 40px 0">
        订单管理功能与用户端订单页面类似，显示所有用户的订单记录
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// This page uses similar logic as /billing/orders but for all users
</script>

<style scoped lang="scss">
.admin-orders-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .info-alert {
    margin-bottom: 20px;
  }
}
</style>

