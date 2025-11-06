/**
 * 订单状态轮询 Composable
 * 用于在IP购买后轮询检查订单状态
 */

import { ref, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api/request';

export interface OrderPollingOptions {
  orderNo: string;
  maxRetries?: number;
  retryInterval?: number;
  onStatusChange?: (status: string) => void;
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useOrderPolling() {
  const isPolling = ref(false);
  const currentStatus = ref<string>('processing');
  const retryCount = ref(0);
  
  let pollTimer: NodeJS.Timeout | null = null;

  /**
   * 开始轮询订单状态
   */
  const startPolling = async (options: OrderPollingOptions) => {
    const {
      orderNo,
      maxRetries = 20, // 最多20次（20 * 3秒 = 60秒）
      retryInterval = 3000, // 默认3秒轮询一次
      onStatusChange,
      onCompleted,
      onError
    } = options;

    // 防止重复轮询
    if (isPolling.value) {
      console.warn('[OrderPolling] Already polling');
      return;
    }

    isPolling.value = true;
    retryCount.value = 0;

    console.log(`[OrderPolling] Start polling order: ${orderNo}`);

    const checkStatus = async () => {
      try {
        retryCount.value++;

        console.log(`[OrderPolling] Attempt ${retryCount.value}/${maxRetries}`);

        // 调用后端API查询订单状态
        const response = await request.get(
          `/proxy/static/order/${orderNo}/status`
        );

        const { status, data } = response;

        console.log(`[OrderPolling] Order status: ${status}`, data);

        // 更新当前状态
        currentStatus.value = status;
        onStatusChange?.(status);

        // 处理不同状态
        if (status === 'completed') {
          console.log('[OrderPolling] ✅ Order completed!');
          stopPolling();
          ElMessage.success('订单处理完成！');
          onCompleted?.(data);
          return;
        }

        if (status === 'failed') {
          console.error('[OrderPolling] ❌ Order failed');
          stopPolling();
          ElMessage.error('订单处理失败');
          onError?.(new Error('Order failed'));
          return;
        }

        // 检查是否达到最大重试次数
        if (retryCount.value >= maxRetries) {
          console.warn('[OrderPolling] ⚠️ Max retries reached');
          stopPolling();
          ElMessage.warning(
            '订单处理超时，请稍后手动刷新或查看订单详情'
          );
          onError?.(new Error('Max retries reached'));
          return;
        }

        // 继续轮询
        pollTimer = setTimeout(checkStatus, retryInterval);
      } catch (error: any) {
        console.error('[OrderPolling] Error checking status:', error);

        // 如果是认证错误，停止轮询
        if (error.response?.status === 401 || error.response?.status === 403) {
          stopPolling();
          onError?.(error);
          return;
        }

        // 其他错误继续重试
        if (retryCount.value < maxRetries) {
          pollTimer = setTimeout(checkStatus, retryInterval);
        } else {
          stopPolling();
          onError?.(error);
        }
      }
    };

    // 开始第一次检查
    await checkStatus();
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    isPolling.value = false;
    console.log('[OrderPolling] Polling stopped');
  };

  /**
   * 组件卸载时自动停止轮询
   */
  onUnmounted(() => {
    stopPolling();
  });

  return {
    isPolling,
    currentStatus,
    retryCount,
    startPolling,
    stopPolling
  };
}

