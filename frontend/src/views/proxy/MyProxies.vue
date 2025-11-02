<template>
  <div class="my-proxies-page">
    <el-card>
      <template #header>
        <h3>我的代理</h3>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="静态代理" name="static">
          <el-empty description="暂无静态代理" />
        </el-tab-pane>
        <el-tab-pane label="动态代理" name="dynamic">
          <el-empty description="暂无动态代理" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('static');
</script>

<style scoped lang="scss">
.my-proxies-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>

