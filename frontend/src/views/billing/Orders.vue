<template>
  <div class="orders-container">
    <h1>充值订单</h1>

    <el-card shadow="hover" class="orders-card">
      <template #header>
        <div class="card-header">
          <span>充值订单列表</span>
          <el-dropdown @command="handleExport">
            <el-button type="success">
              <el-icon><Download /></el-icon>
              导出
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="csv">
                  <el-icon><Document /></el-icon>
                  导出为 CSV
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>

      <!-- 筛选条件（3行布局） -->
      <div class="filter-section">
        <el-row :gutter="15" class="filter-row">
          <el-col :span="6">
            <el-input
              v-model="filters.orderNo"
              placeholder="请输入订单号"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-input
              v-model="filters.tradeNo"
              placeholder="请输入交易号"
              clearable
            />
          </el-col>

          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="请选择支付状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-select v-model="filters.refunded" placeholder="请选择是否退款" clearable>
              <el-option label="全部" value="" />
              <el-option label="未退款" value="false" />
              <el-option label="已退款" value="true" />
            </el-select>
          </el-col>
        </el-row>

        <el-row :gutter="15" class="filter-row">
          <el-col :span="12">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="下单开始时间"
              end-placeholder="下单结束时间"
              style="width: 100%"
            />
          </el-col>

          <el-col :span="6">
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 订单列表 -->
      <el-table :data="orderList" v-loading="loading" style="width: 100%">
        <el-table-column label="订单号" width="180">
          <template #default="{ row }">
            <el-text copyable>{{ row.orderNo }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="交易号" width="180">
          <template #default="{ row }">
            <el-text copyable>{{ row.tradeNo || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="充值金额" width="120">
          <template #default="{ row }">
            <el-text type="primary">${{ row.amount.toFixed(2) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">
            <el-tag>{{ getPaymentMethodText(row.paymentMethod) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="是否退款" width="100">
          <template #default="{ row }">
            <el-tag :type="row.refunded ? 'danger' : 'success'">
              {{ row.refunded ? '已退款' : '未退款' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />

        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.approvedAt ? formatDate(row.approvedAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="充值订单详情"
      width="600px"
    >
      <div class="detail-content" v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号" :span="2">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="交易号" :span="2">
            {{ currentOrder.tradeNo || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="充值金额">
            ${{ currentOrder.amount.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ getPaymentMethodText(currentOrder.paymentMethod) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否退款">
            <el-tag :type="currentOrder.refunded ? 'danger' : 'success'">
              {{ currentOrder.refunded ? '已退款' : '未退款' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            {{ formatDate(currentOrder.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间" :span="2">
            {{ currentOrder.approvedAt ? formatDate(currentOrder.approvedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentOrder.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Download, Document, ArrowDown } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { exportToCSV, formatDateForFilename } from '@/utils/export';
import { getUserOrders } from '@/api/modules/order';

// 筛选条件
const filters = ref({
  orderNo: '',
  tradeNo: '',
  status: '',
  refunded: '',
  dateRange: null as any,
});

// 订单列表
const orderList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 详情对话框
const detailDialogVisible = ref(false);
const currentOrder = ref<any>(null);

// 获取支付方式文本
const getPaymentMethodText = (method: string) => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    usdt: 'USDT',
    usd: '美金',
  };
  return map[method] || method;
};

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
  };
  return map[status] || status;
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      ...filters.value,
    };

    // 调用实际API
    const response = await getUserOrders(params);
    orderList.value = response.data || response.list || [];
    pagination.value.total = response.total || orderList.value.length;
  } catch (error: any) {
    console.error('[Orders] 加载失败:', error);
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
    orderList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    orderNo: '',
    tradeNo: '',
    status: '',
    refunded: '',
    dateRange: null,
  };
  loadData();
};

// 查看详情
const viewDetail = (order: any) => {
  currentOrder.value = order;
  detailDialogVisible.value = true;
};

// 导出订单
const handleExport = (format: string) => {
  if (orderList.value.length === 0) {
    ElMessage.warning('暂无订单数据可导出');
    return;
  }

  try {
    const filename = `recharge-orders_${formatDateForFilename()}`;
    
    if (format === 'csv') {
      const headers = ['orderNo', 'tradeNo', 'amount', 'paymentMethod', 'status', 'remark', 'createdAt', 'updatedAt'];
      const data = orderList.value.map((order) => ({
        orderNo: order.orderNo,
        tradeNo: order.tradeNo || '-',
        amount: `$${order.amount.toFixed(2)}`,
        paymentMethod: getPaymentMethodName(order.paymentMethod),
        status: getStatusName(order.status),
        remark: order.remark || '-',
        createdAt: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      }));
      
      exportToCSV(data, headers, filename);
      ElMessage.success(`已导出 ${orderList.value.length} 条订单`);
    }
  } catch (error: any) {
    ElMessage.error('导出失败：' + error.message);
  }
};

// 获取支付方式名称
const getPaymentMethodName = (method: string) => {
  const methodMap: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    usdt: 'USDT',
    usd: '美金支付',
  };
  return methodMap[method] || method;
};

// 获取状态名称
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
  };
  return statusMap[status] || status;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.orders-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .orders-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }

    .filter-section {
      margin-bottom: 20px;

      .filter-row {
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .detail-content {
    padding: 10px 0;
  }
}

// 浅色主题适配
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

:deep(.el-table) {
  color: #606266;

  th {
    background-color: #f5f7fa;
    color: #303133;
  }

  tr:hover > td {
    background-color: #f5f7fa;
  }
}
</style>
