<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <span class="language-switcher">
      <el-icon><Switch /></el-icon>
      <span class="language-text">{{ currentLanguageName }}</span>
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
          <span class="language-option">
            <span class="flag">🇨🇳</span>
            <span>简体中文</span>
            <el-icon v-if="currentLocale === 'zh-CN'" class="check-icon"><Check /></el-icon>
          </span>
        </el-dropdown-item>
        <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
          <span class="language-option">
            <span class="flag">🇺🇸</span>
            <span>English</span>
            <el-icon v-if="currentLocale === 'en-US'" class="check-icon"><Check /></el-icon>
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Switch, ArrowDown, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const currentLanguageName = computed(() => {
  return currentLocale.value === 'zh-CN' ? '简体中文' : 'English';
});

const handleCommand = (command: string) => {
  if (command === currentLocale.value) {
    return;
  }

  locale.value = command;
  localStorage.setItem('locale', command);
  
  const message = command === 'zh-CN' ? '已切换到简体中文' : 'Switched to English';
  ElMessage.success(message);
  
  // 可选：刷新页面以完全应用语言变更
  // location.reload();
};
</script>

<style scoped lang="scss">
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  color: var(--el-text-color-primary);

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .language-text {
    font-size: 14px;
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;

  .flag {
    font-size: 18px;
  }

  .check-icon {
    margin-left: auto;
    color: var(--el-color-primary);
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}
</style>
