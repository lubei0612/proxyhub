<template>
  <div class="admin-dashboard">
    <h2>管理仪表盘</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总用户数" :value="0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总订单数" :value="0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总充值金额" :value="0" prefix="$" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总代理数" :value="0" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// Admin dashboard page
</script>

<style scoped lang="scss">
.admin-dashboard {
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
  }
}
</style>

