<template>
  <div class="notifications-container">
    <h1>通知设置</h1>

    <el-row :gutter="20">
      <!-- 左侧：通知设置 -->
      <el-col :span="16">
        <!-- 邮件通知 -->
        <el-card shadow="hover" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>邮件通知</span>
            </div>
          </template>

          <div class="notification-items">
            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">订单通知</div>
                <div class="item-desc">购买成功、订单取消等通知</div>
              </div>
              <el-switch v-model="emailSettings.orderNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">充值通知</div>
                <div class="item-desc">充值审核结果通知</div>
              </div>
              <el-switch v-model="emailSettings.rechargeNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">到期提醒</div>
                <div class="item-desc">代理IP即将到期提醒</div>
              </div>
              <el-switch v-model="emailSettings.expirationNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">余额不足提醒</div>
                <div class="item-desc">账户余额低于设定金额时提醒</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px">
                <el-switch v-model="emailSettings.lowBalanceNotification" />
                <el-input-number
                  v-if="emailSettings.lowBalanceNotification"
                  v-model="emailSettings.lowBalanceThreshold"
                  :min="0"
                  :step="10"
                  size="small"
                  style="width: 120px"
                />
                <span v-if="emailSettings.lowBalanceNotification">USD</span>
              </div>
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">系统公告</div>
                <div class="item-desc">系统维护、功能更新等公告</div>
              </div>
              <el-switch v-model="emailSettings.systemNotification" />
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="saveEmailSettings" :loading="saving">
              <el-icon><Check /></el-icon>
              保存邮件设置
            </el-button>
          </div>
        </el-card>

        <!-- 站内通知 -->
        <el-card shadow="hover" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>站内通知</span>
            </div>
          </template>

          <div class="notification-items">
            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">订单通知</div>
                <div class="item-desc">购买成功、订单取消等通知</div>
              </div>
              <el-switch v-model="inAppSettings.orderNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">充值通知</div>
                <div class="item-desc">充值审核结果通知</div>
              </div>
              <el-switch v-model="inAppSettings.rechargeNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">到期提醒</div>
                <div class="item-desc">代理IP即将到期提醒</div>
              </div>
              <el-switch v-model="inAppSettings.expirationNotification" />
            </div>

            <el-divider />

            <div class="notification-item">
              <div class="item-info">
                <div class="item-title">系统公告</div>
                <div class="item-desc">系统维护、功能更新等公告</div>
              </div>
              <el-switch v-model="inAppSettings.systemNotification" />
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="saveInAppSettings" :loading="saving">
              <el-icon><Check /></el-icon>
              保存站内设置
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：通知历史 -->
      <el-col :span="8">
        <!-- 最近通知 -->
        <el-card shadow="hover" class="history-card">
          <template #header>
            <div class="card-header">
              <span>最近通知</span>
              <el-button type="primary" size="small" @click="markAllAsRead">
                全部标记已读
              </el-button>
            </div>
          </template>

          <div class="notification-list">
            <div
              v-for="notification in recentNotifications"
              :key="notification.id"
              class="notification-card"
              :class="{ unread: !notification.isRead }"
            >
              <div class="notification-header">
                <el-icon :size="20" :color="getTypeColor(notification.type)">
                  <component :is="getTypeIcon(notification.type)" />
                </el-icon>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-content">{{ notification.content }}</div>
              <div v-if="!notification.isRead" class="unread-badge"></div>
            </div>

            <el-empty
              v-if="recentNotifications.length === 0"
              description="暂无通知"
              :image-size="100"
            />
          </div>
        </el-card>

        <!-- 通知统计 -->
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>通知统计</span>
            </div>
          </template>

          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-label">未读通知</div>
              <div class="stat-value">{{ unreadCount }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-label">今日通知</div>
              <div class="stat-value">{{ todayCount }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-label">本周通知</div>
              <div class="stat-value">{{ weekCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Check,
  Bell,
  Warning,
  SuccessFilled,
  CircleCheck,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';

// 邮件通知设置
const emailSettings = ref({
  orderNotification: true,
  rechargeNotification: true,
  expirationNotification: true,
  lowBalanceNotification: true,
  lowBalanceThreshold: 50,
  systemNotification: true,
});

// 站内通知设置
const inAppSettings = ref({
  orderNotification: true,
  rechargeNotification: true,
  expirationNotification: true,
  systemNotification: true,
});

const saving = ref(false);

// 最近通知
const recentNotifications = ref([
  {
    id: 1,
    type: 'success',
    title: '购买成功',
    content: '您已成功购买静态IP - 美国洛杉矶 × 5个',
    isRead: false,
    createdAt: dayjs().subtract(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: 2,
    type: 'info',
    title: '充值审核中',
    content: '您的充值申请（$100.00）正在审核中，请耐心等待',
    isRead: false,
    createdAt: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: 3,
    type: 'warning',
    title: '代理IP即将到期',
    content: '您有3个静态IP将于3天后到期，请及时续费',
    isRead: true,
    createdAt: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  },
]);

const unreadCount = computed(() => {
  return recentNotifications.value.filter((n) => !n.isRead).length;
});

const todayCount = computed(() => {
  return recentNotifications.value.filter((n) =>
    dayjs(n.createdAt).isSame(dayjs(), 'day')
  ).length;
});

const weekCount = computed(() => {
  return recentNotifications.value.filter((n) =>
    dayjs(n.createdAt).isSame(dayjs(), 'week')
  ).length;
});

const getTypeIcon = (type: string) => {
  const map: Record<string, any> = {
    success: SuccessFilled,
    info: Bell,
    warning: Warning,
    error: CircleCheck,
  };
  return map[type] || Bell;
};

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    success: '#67c23a',
    info: '#409eff',
    warning: '#e6a23c',
    error: '#f56c6c',
  };
  return map[type] || '#909399';
};

const formatTime = (time: string) => {
  const diff = dayjs().diff(dayjs(time), 'minute');
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  return dayjs(time).format('MM-DD HH:mm');
};

const saveEmailSettings = async () => {
  try {
    saving.value = true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    ElMessage.success('邮件设置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    saving.value = false;
  }
};

const saveInAppSettings = async () => {
  try {
    saving.value = true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    ElMessage.success('站内设置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    saving.value = false;
  }
};

const markAllAsRead = () => {
  recentNotifications.value.forEach((n) => (n.isRead = true));
  ElMessage.success('已全部标记为已读');
};

onMounted(() => {
  // 加载通知设置
});
</script>

<style scoped lang="scss">
.notifications-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .settings-card,
  .history-card,
  .stats-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: #303133;
  }

  .notification-items {
    .notification-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;

      .item-info {
        flex: 1;

        .item-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 5px;
        }

        .item-desc {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }

  .action-buttons {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #dcdfe6;
  }

  .notification-list {
    max-height: 600px;
    overflow-y: auto;

    .notification-card {
      position: relative;
      padding: 15px;
      margin-bottom: 12px;
      background-color: #f5f7fa;
      border-radius: 8px;
      border-left: 3px solid transparent;
      transition: all 0.3s;

      &.unread {
        border-left-color: #409eff;
        background-color: #ecf5ff;
      }

      &:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .notification-time {
          font-size: 12px;
          color: #909399;
        }
      }

      .notification-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 5px;
      }

      .notification-content {
        font-size: 13px;
        color: #606266;
        line-height: 1.5;
      }

      .unread-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        background-color: #f56c6c;
        border-radius: 50%;
      }
    }
  }

  .stats-list {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;

      .stat-label {
        font-size: 14px;
        color: #606266;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}

:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 16px 20px;
}
</style>

