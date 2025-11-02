<template>
  <div class="admin-orders-page">
    <h2>订单管理</h2>
    <el-card>
      <el-table :data="[]" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button size="small" type="primary">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="true" description="暂无订单数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Admin orders page
</script>

<style scoped lang="scss">
.admin-orders-page {
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
  }
}
</style>

