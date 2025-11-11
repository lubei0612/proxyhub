<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="`${userName} 的 IP 及交易记录`"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="user-ip-modal">
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="never">
        <div class="user-info">
          <div class="info-item">
            <span class="label">用户ID:</span>
            <span class="value">{{ userData?.user?.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱:</span>
            <span class="value">{{ userData?.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前余额:</span>
            <span class="value balance">${{ parseFloat(userData?.user?.balance || 0).toFixed(2) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="ip-tabs">
        <!-- 静态IP标签 -->
        <el-tab-pane label="静态住宅IP" name="static">
          <template #label>
            <span>
              <el-icon><Monitor /></el-icon>
              静态住宅IP ({{ userData?.staticProxies?.length || 0 }})
            </span>
          </template>
          <el-table :data="userData?.staticProxies || []" style="width: 100%" max-height="400">
            <el-table-column label="IP地址" prop="ip" width="150" />
            <el-table-column label="端口" prop="port" width="80" />
            <el-table-column label="账号" prop="username" width="150" />
            <el-table-column label="密码" prop="password" width="150" show-overflow-tooltip />
            <el-table-column label="国家/城市" width="150">
              <template #default="{ row }">
                {{ row.country }} / {{ row.city }}
              </template>
            </el-table-column>
            <el-table-column label="到期时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.expireTimeUtc) }}
              </template>
            </el-table-column>
            <el-table-column label="订单号" prop="orderNo" width="200" show-overflow-tooltip />
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 动态通道标签 -->
        <el-tab-pane label="动态住宅通道" name="dynamic">
          <template #label>
            <span>
              <el-icon><Connection /></el-icon>
              动态住宅通道 ({{ userData?.dynamicChannels?.length || 0 }})
            </span>
          </template>
          <el-table :data="userData?.dynamicChannels || []" style="width: 100%" max-height="400">
            <el-table-column label="通道名称" prop="name" width="200" />
            <el-table-column label="套餐类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.packageType === 'unlimited' ? 'success' : 'info'">
                  {{ row.packageType === 'unlimited' ? '无限套餐' : '个人套餐' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="流量限制(GB)" width="130">
              <template #default="{ row }">
                {{ row.trafficLimit || '无限制' }}
              </template>
            </el-table-column>
            <el-table-column label="已使用(GB)" width="130">
              <template #default="{ row }">
                {{ parseFloat(row.trafficUsed || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="订单号" prop="orderNo" width="200" show-overflow-tooltip />
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 交易记录标签 -->
        <el-tab-pane label="全部交易" name="transactions">
          <template #label>
            <span>
              <el-icon><Money /></el-icon>
              全部交易记录
            </span>
          </template>
          <el-table :data="userData?.recentTransactions || []" style="width: 100%" max-height="400">
            <el-table-column label="交易类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTransactionTypeColor(row.type)">
                  {{ getTransactionTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="120">
              <template #default="{ row }">
                <span :class="row.amount >= 0 ? 'positive-amount' : 'negative-amount'">
                  ${{ parseFloat(row.amount).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动前余额" width="130">
              <template #default="{ row }">
                ${{ parseFloat(row.balanceBefore).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="变动后余额" width="130">
              <template #default="{ row }">
                ${{ parseFloat(row.balanceAfter).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="交易号" prop="transactionNo" width="200" show-overflow-tooltip />
            <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip />
            <el-table-column label="交易时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport" :loading="exporting">
          导出CSV
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Monitor, Connection, Money, Download } from '@element-plus/icons-vue';
import { getUserIPs } from '@/api/modules/admin';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  userId: string;
  userName: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible']);

const loading = ref(false);
const exporting = ref(false);
const activeTab = ref('static');
const userData = ref<any>(null);

// 监听visible变化，加载数据
watch(() => props.visible, async (newVal) => {
  if (newVal && props.userId) {
    await loadUserIPs();
  }
});

// 加载用户IP数据
const loadUserIPs = async () => {
  loading.value = true;
  try {
    const data = await getUserIPs(props.userId);
    userData.value = data;
  } catch (error: any) {
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false);
};

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 获取交易类型名称
const getTransactionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    recharge: '充值',
    purchase: '购买',
    renewal: '续费',
    refund: '退款',
    commission: '佣金',
    expense: '扣费',
    income: '收入',
  };
  return typeMap[type] || type;
};

// 获取交易类型颜色
const getTransactionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    recharge: 'success',
    purchase: 'primary',
    renewal: 'warning',
    refund: 'info',
    commission: 'success',
    expense: 'danger',
    income: 'success',
  };
  return colorMap[type] || 'info';
};

// 导出CSV（简化版，不依赖xlsx）
const handleExport = async () => {
  if (!userData.value) {
    ElMessage.warning('没有可导出的数据');
    return;
  }

  exporting.value = true;
  try {
    let csvContent = '';

    // Section 1: 静态IP
    if (userData.value.staticProxies && userData.value.staticProxies.length > 0) {
      csvContent += '=== 静态住宅IP ===\n';
      csvContent += 'IP地址,端口,账号,密码,国家,城市,到期时间,订单号,创建时间\n';
      userData.value.staticProxies.forEach((proxy: any) => {
        csvContent += `${proxy.ip},${proxy.port},${proxy.username},${proxy.password},${proxy.country},${proxy.city},${formatDate(proxy.expireTimeUtc)},${proxy.orderNo},${formatDate(proxy.createdAt)}\n`;
      });
      csvContent += '\n';
    }

    // Section 2: 动态通道
    if (userData.value.dynamicChannels && userData.value.dynamicChannels.length > 0) {
      csvContent += '=== 动态住宅通道 ===\n';
      csvContent += '通道名称,套餐类型,流量限制(GB),已使用(GB),订单号,创建时间\n';
      userData.value.dynamicChannels.forEach((channel: any) => {
        const packageType = channel.packageType === 'unlimited' ? '无限套餐' : '个人套餐';
        const trafficLimit = channel.trafficLimit || '无限制';
        csvContent += `${channel.name},${packageType},${trafficLimit},${parseFloat(channel.trafficUsed || 0).toFixed(2)},${channel.orderNo},${formatDate(channel.createdAt)}\n`;
      });
      csvContent += '\n';
    }

    // Section 3: 交易记录
    if (userData.value.recentTransactions && userData.value.recentTransactions.length > 0) {
      csvContent += '=== 交易记录 ===\n';
      csvContent += '交易类型,金额,变动前余额,变动后余额,交易号,备注,交易时间\n';
      userData.value.recentTransactions.forEach((tx: any) => {
        csvContent += `${getTransactionTypeName(tx.type)},${parseFloat(tx.amount).toFixed(2)},${parseFloat(tx.balanceBefore).toFixed(2)},${parseFloat(tx.balanceAfter).toFixed(2)},${tx.transactionNo},"${tx.remark}",${formatDate(tx.createdAt)}\n`;
      });
    }

    // 生成文件名并下载
    const filename = `user-ips-${props.userName}-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    
    ElMessage.success('导出成功');
  } catch (error: any) {
    ElMessage.error('导出失败：' + (error.message || '未知错误'));
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped lang="scss">
.user-ip-modal {
  .user-info-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    :deep(.el-card__body) {
      padding: 15px 20px;
    }
    
    .user-info {
      display: flex;
      gap: 30px;
      align-items: center;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        
        .label {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .value {
          font-size: 16px;
          font-weight: 600;
          
          &.balance {
            font-size: 18px;
            color: #ffd700;
          }
        }
      }
    }
  }
  
  .ip-tabs {
    margin-top: 20px;
    
    :deep(.el-tabs__item) {
      font-size: 15px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
  }
  
  .positive-amount {
    color: #67c23a;
    font-weight: 600;
  }
  
  .negative-amount {
    color: #f56c6c;
    font-weight: 600;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

