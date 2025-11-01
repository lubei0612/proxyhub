<template>
  <div class="mobile-placeholder">
    <el-result icon="warning" title="功能开发中" sub-title="移动代理功能即将推出，敬请期待！">
      <template #extra>
        <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
        <el-button @click="$router.push('/proxy/static/buy')">购买静态IP</el-button>
      </template>
    </el-result>

    <el-card shadow="hover" class="feature-preview">
      <template #header>
        <div class="card-header">
          <span>即将推出的功能</span>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item timestamp="即将推出" placement="top">
          <el-card>
            <h4>移动代理套餐</h4>
            <p>提供4G/5G移动代理IP，支持动态切换</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="规划中" placement="top">
          <el-card>
            <h4>智能路由</h4>
            <p>根据目标网站自动选择最优代理线路</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="规划中" placement="top">
          <el-card>
            <h4>API接口</h4>
            <p>完善的RESTful API，方便集成到您的应用中</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Placeholder page for mobile proxy functionality
</script>

<style scoped lang="scss">
.mobile-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;

  .feature-preview {
    max-width: 600px;
    width: 100%;
    margin-top: 40px;

    .card-header {
      font-weight: bold;
      font-size: 18px;
    }

    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
    }
  }
}
</style>

