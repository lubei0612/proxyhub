<template>
  <div class="admin-settings-page">
    <h2>系统设置</h2>
    <el-card>
      <el-form label-width="120px">
        <el-form-item label="系统名称">
          <el-input value="ProxyHub" disabled />
        </el-form-item>
        <el-form-item label="系统版本">
          <el-input value="1.0.0" disabled />
        </el-form-item>
        <el-form-item label="系统邮箱">
          <el-input value="admin@proxyhub.com" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Admin settings page
</script>

<style scoped lang="scss">
.admin-settings-page {
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
  }
}
</style>

