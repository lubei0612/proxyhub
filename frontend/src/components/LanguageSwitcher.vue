<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <el-button :icon="Globe" circle />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
          简体中文
        </el-dropdown-item>
        <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Globe } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const handleCommand = (command: string) => {
  locale.value = command;
  localStorage.setItem('locale', command);
  ElMessage.success(command === 'zh-CN' ? '语言已切换为简体中文' : 'Language switched to English');
  
  // 刷新页面以应用新语言
  setTimeout(() => {
    window.location.reload();
  }, 500);
};
</script>

<style scoped lang="scss">
.is-active {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>

