<template>
  <div class="notifications-container">
    <el-card class="notification-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>通知设置</h2>
        </div>
      </template>
      
      <div class="notification-settings">
        <!-- 通知限额通知 -->
        <div class="notification-item">
          <div class="notification-info">
            <h3>通知限额通知</h3>
            <p>当您的流量使用达到限额阈值时，系统将发送通知提醒</p>
          </div>
          <el-switch
            v-model="settings.trafficLimitNotification"
            size="large"
            :loading="loading"
            @change="updateSetting('trafficLimitNotification')"
          />
        </div>

        <!-- 余额不足通知 -->
        <div class="notification-item">
          <div class="notification-info">
            <h3>余额不足通知</h3>
            <p>当您的账户余额低于设定金额时，系统将发送通知提醒</p>
          </div>
          <el-switch
            v-model="settings.lowBalanceNotification"
            size="large"
            :loading="loading"
            @change="updateSetting('lowBalanceNotification')"
          />
        </div>

        <!-- 计划到期通知 -->
        <div class="notification-item">
          <div class="notification-info">
            <h3>计划到期通知</h3>
            <p>当您的套餐计划即将到期时，系统将提前发送通知提醒</p>
          </div>
          <el-switch
            v-model="settings.planExpiryNotification"
            size="large"
            :loading="loading"
            @change="updateSetting('planExpiryNotification')"
          />
        </div>

        <!-- IP到期通知 -->
        <div class="notification-item">
          <div class="notification-info">
            <h3>IP到期通知</h3>
            <p>当您的静态IP即将到期时，系统将提前发送通知提醒</p>
          </div>
          <el-switch
            v-model="settings.ipExpiryNotification"
            size="large"
            :loading="loading"
            @change="updateSetting('ipExpiryNotification')"
          />
        </div>
      </div>

      <!-- 通知方式说明 -->
      <div class="notification-footer">
        <el-alert
          title="通知方式"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>系统将通过以下方式向您发送通知：</p>
            <ul>
              <li>📧 <strong>邮件通知</strong>：发送到您的注册邮箱</li>
              <li>💬 <strong>站内消息</strong>：在系统内显示通知消息</li>
              <li>📱 <strong>Telegram</strong>：如果您已绑定Telegram账号</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 通知设置
interface NotificationSettings {
  trafficLimitNotification: boolean;
  lowBalanceNotification: boolean;
  planExpiryNotification: boolean;
  ipExpiryNotification: boolean;
}

const settings = ref<NotificationSettings>({
  trafficLimitNotification: true,
  lowBalanceNotification: true,
  planExpiryNotification: true,
  ipExpiryNotification: true,
});

const loading = ref(false);

// 加载通知设置
const loadSettings = async () => {
  try {
    // TODO: 调用API加载用户的通知设置
    // const response = await getUserNotificationSettings();
    // settings.value = response;
    
    // 暂时从localStorage加载
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      settings.value = JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error);
  }
};

// 更新通知设置
const updateSetting = async (key: keyof NotificationSettings) => {
  loading.value = true;
  
  try {
    // TODO: 调用API保存通知设置
    // await updateUserNotificationSettings(settings.value);
    
    // 暂时保存到localStorage
    localStorage.setItem('notification_settings', JSON.stringify(settings.value));
    
    const settingNames: Record<keyof NotificationSettings, string> = {
      trafficLimitNotification: '通知限额通知',
      lowBalanceNotification: '余额不足通知',
      planExpiryNotification: '计划到期通知',
      ipExpiryNotification: 'IP到期通知',
    };
    
    const status = settings.value[key] ? '已启用' : '已禁用';
    ElMessage.success(`${settingNames[key]}${status}`);
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    ElMessage.error('保存失败，请重试');
    // 恢复设置
    settings.value[key] = !settings.value[key];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.notifications-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.notification-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.notification-settings {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  transition: background-color 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--el-fill-color-lighter);
}

.notification-info {
  flex: 1;
  margin-right: 24px;
}

.notification-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.notification-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.notification-footer {
  margin-top: 24px;
  padding: 0 24px 24px;
}

.notification-footer :deep(.el-alert) {
  border-radius: 8px;
}

.notification-footer :deep(.el-alert__description) {
  margin-top: 8px;
}

.notification-footer ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.notification-footer li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.notification-footer li:last-child {
  margin-bottom: 0;
}

.notification-footer strong {
  color: var(--el-text-color-primary);
}

/* 深色主题优化 */
@media (prefers-color-scheme: dark) {
  .notification-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>

