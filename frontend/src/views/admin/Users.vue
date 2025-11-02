<template>
  <div class="admin-users-page">
    <h2>用户管理</h2>
    <el-card>
      <el-table :data="[]" border>
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="balance" label="余额" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="true" description="暂无用户数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Admin users page
</script>

<style scoped lang="scss">
.admin-users-page {
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
  }
}
</style>

