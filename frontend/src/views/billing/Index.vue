<template>
  <div class="billing-page">
    <el-card>
      <template #header>
        <h3>账单概览</h3>
      </template>
      <el-empty description="暂无账单数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Billing overview page
</script>

<style scoped lang="scss">
.billing-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>

