<template>
  <div class="expenses-page">
    <el-card>
      <template #header>
        <h3>费用明细</h3>
      </template>
      <el-empty description="暂无费用记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Expenses page
</script>

<style scoped lang="scss">
.expenses-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>

