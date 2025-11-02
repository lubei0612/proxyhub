<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <h3>订单列表</h3>
      </template>
      <el-empty description="暂无订单记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Order list page
</script>

<style scoped lang="scss">
.order-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>

