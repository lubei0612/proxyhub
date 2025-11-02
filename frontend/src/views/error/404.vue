<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被删除</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.error-container {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 20px;
}

.error-message {
  font-size: 32px;
  color: #303133;
  margin-bottom: 16px;
}

.error-desc {
  font-size: 16px;
  color: #909399;
  margin-bottom: 32px;
}
</style>

