<template>
  <div class="admin-recharge-page">
    <h2>充值审核</h2>
    <el-card>
      <el-table :data="[]" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="success">通过</el-button>
            <el-button size="small" type="danger">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="true" description="暂无待审核充值" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Admin recharge approval page
</script>

<style scoped lang="scss">
.admin-recharge-page {
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
  }
}
</style>

