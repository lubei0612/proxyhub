import { ref, onMounted, onUnmounted } from 'vue';
import { getAdminPendingTasks } from '@/api/modules/dashboard';

export interface PendingTasks {
  pendingRecharges: number;
  abnormalOrders: number;
  systemNotifications: number;
  total: number;
}

/**
 * 管理员待处理事项 Composable
 * ✅ Task 2.3: 实现待处理事项数据动态化
 */
export function useAdminPendingTasks() {
  const pendingTasks = ref<PendingTasks>({
    pendingRecharges: 0,
    abnormalOrders: 0,
    systemNotifications: 0,
    total: 0,
  });

  const loading = ref(false);
  let refreshInterval: number | null = null;

  // 获取待处理事项
  const fetchPendingTasks = async () => {
    try {
      loading.value = true;
      const response = await getAdminPendingTasks();
      pendingTasks.value = response.data || pendingTasks.value;
    } catch (error) {
      console.error('[Admin Pending Tasks] Failed to fetch:', error);
    } finally {
      loading.value = false;
    }
  };

  // 启动自动刷新（每60秒）
  const startAutoRefresh = () => {
    fetchPendingTasks(); // 立即执行一次
    refreshInterval = window.setInterval(fetchPendingTasks, 60000); // 每分钟刷新
  };

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  onMounted(() => {
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    pendingTasks,
    loading,
    fetchPendingTasks,
    startAutoRefresh,
    stopAutoRefresh,
  };
}

