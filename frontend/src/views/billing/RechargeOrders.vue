<template>
  <div class="recharge-orders-container">
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
        <!-- 第一行 -->
        <el-row :gutter="15" class="filter-row">
          <el-col :span="6">
            <el-input
              v-model="filters.orderNo"
              placeholder="请输入订单号"
              clearable
              @clear="loadData"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="请选择状态" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-select v-model="filters.paymentMethod" placeholder="请选择支付方式" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="USDT" value="usdt" />
              <el-option label="美金支付" value="usd" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-input-number
              v-model="filters.minAmount"
              placeholder="最小金额"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="15" class="filter-row">
          <el-col :span="6">
            <el-input-number
              v-model="filters.maxAmount"
              placeholder="最大金额"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-col>

          <el-col :span="12">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
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
        <el-table-column label="#ID" prop="id" width="80" />

        <el-table-column label="订单号" prop="orderNo" width="200">
          <template #default="{ row }">
            <el-text type="primary" copyable>{{ row.orderNo }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="充值金额" width="120">
          <template #default="{ row }">
            <el-text type="success" style="font-size: 15px; font-weight: 600">
              ${{ parseFloat(row.amount).toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodTagType(row.paymentMethod)">
              {{ getPaymentMethodName(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="备注" prop="remark" min-width="200">
          <template #default="{ row }">
            <el-text v-if="row.remark" line-clamp="2">{{ row.remark }}</el-text>
            <el-text v-else type="info">-</el-text>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="审核时间" width="180">
          <template #default="{ row }">
            <el-text v-if="row.updatedAt && row.status !== 'pending'">
              {{ formatDate(row.updatedAt) }}
            </el-text>
            <el-text v-else type="info">-</el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="充值订单详情"
      width="600px"
    >
      <div v-if="currentOrder" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            <el-text copyable>{{ currentOrder.orderNo }}</el-text>
          </el-descriptions-item>

          <el-descriptions-item label="充值金额">
            <el-text type="success" style="font-size: 16px; font-weight: 600">
              ${{ parseFloat(currentOrder.amount).toFixed(2) }}
            </el-text>
          </el-descriptions-item>

          <el-descriptions-item label="支付方式">
            <el-tag :type="getPaymentMethodTagType(currentOrder.paymentMethod)">
              {{ getPaymentMethodName(currentOrder.paymentMethod) }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ getStatusName(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="申请时间" :span="2">
            {{ formatDate(currentOrder.createdAt) }}
          </el-descriptions-item>

          <el-descriptions-item label="审核时间" :span="2">
            <el-text v-if="currentOrder.updatedAt && currentOrder.status !== 'pending'">
              {{ formatDate(currentOrder.updatedAt) }}
            </el-text>
            <el-text v-else type="info">待审核</el-text>
          </el-descriptions-item>

          <el-descriptions-item label="备注信息" :span="2">
            <el-text v-if="currentOrder.remark">{{ currentOrder.remark }}</el-text>
            <el-text v-else type="info">无</el-text>
          </el-descriptions-item>

          <el-descriptions-item v-if="currentOrder.rejectReason" label="拒绝原因" :span="2">
            <el-text type="danger">{{ currentOrder.rejectReason }}</el-text>
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

// 筛选条件
const filters = ref({
  orderNo: '',
  status: '',
  paymentMethod: '',
  minAmount: null as number | null,
  maxAmount: null as number | null,
  dateRange: [] as string[],
});

// 订单列表
const orderList = ref<any[]>([]);
const loading = ref(false);

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 详情对话框
const detailDialogVisible = ref(false);
const currentOrder = ref<any>(null);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用后端API
    // const response = await getRechargeOrders({...});
    
    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    orderList.value = [
      {
        id: 1,
        orderNo: 'RO202511021430001',
        amount: 100.00,
        paymentMethod: 'wechat',
        status: 'approved',
        remark: '微信支付',
        createdAt: '2025-11-02 14:30:15',
        updatedAt: '2025-11-02 14:35:20',
      },
      {
        id: 2,
        orderNo: 'RO202511021425002',
        amount: 500.00,
        paymentMethod: 'usdt',
        status: 'pending',
        remark: 'USDT地址：TXyzAbC123...',
        createdAt: '2025-11-02 14:25:30',
        updatedAt: null,
      },
      {
        id: 3,
        orderNo: 'RO202511021420003',
        amount: 50.00,
        paymentMethod: 'alipay',
        status: 'rejected',
        remark: '支付宝转账',
        rejectReason: '转账凭证不清晰',
        createdAt: '2025-11-02 14:20:10',
        updatedAt: '2025-11-02 14:22:40',
      },
    ];
    pagination.value.total = orderList.value.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    orderNo: '',
    status: '',
    paymentMethod: '',
    minAmount: null,
    maxAmount: null,
    dateRange: [],
  };
  pagination.value.page = 1;
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
      const headers = ['id', 'orderNo', 'amount', 'paymentMethod', 'status', 'remark', 'createdAt', 'updatedAt'];
      const data = orderList.value.map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        amount: `$${parseFloat(order.amount).toFixed(2)}`,
        paymentMethod: getPaymentMethodName(order.paymentMethod),
        status: getStatusName(order.status),
        remark: order.remark || '-',
        createdAt: formatDate(order.createdAt),
        updatedAt: order.updatedAt ? formatDate(order.updatedAt) : '-',
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

// 获取支付方式标签类型
const getPaymentMethodTagType = (method: string) => {
  const typeMap: Record<string, any> = {
    wechat: 'success',
    alipay: 'primary',
    usdt: 'warning',
    usd: 'danger',
  };
  return typeMap[method] || '';
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

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return typeMap[status] || '';
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.recharge-orders-container {
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
