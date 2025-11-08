<template>
  <div class="admin-orders-container">
    <h1>订单管理</h1>

    <el-card shadow="hover" class="orders-card">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <el-tag type="info">总订单数：{{ pagination.total }}</el-tag>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="5">
            <el-input v-model="filters.orderNo" placeholder="订单号" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="5">
            <el-input v-model="filters.userEmail" placeholder="用户邮箱" clearable />
          </el-col>

          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="订单状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待支付" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-col>

          <el-col :span="4">
            <el-select v-model="filters.type" placeholder="订单类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="静态IP购买" value="static_proxy" />
              <el-option label="动态代理购买" value="dynamic_proxy" />
              <el-option label="续费" value="renewal" />
            </el-select>
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
            <el-button type="success" @click="exportOrders">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 订单列表 -->
      <el-table :data="orderList" v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="订单号" width="150">
          <template #default="{ row }">
            <el-text copyable>{{ row.orderNo }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="用户邮箱" width="180">
          <template #default="{ row }">
            <el-text type="primary">{{ row.userEmail }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="订单类型" width="130">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <el-text type="success" style="font-size: 16px; font-weight: 600">
              ${{ row.amount.toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="订单详情" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description }}
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="cancelOrder(row)"
            >
              取消
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
      title="订单详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号" :span="2">
            <el-text copyable>{{ currentOrder.orderNo }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="用户邮箱">
            {{ currentOrder.userEmail }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="getTypeColor(currentOrder.type)">
              {{ getTypeText(currentOrder.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <el-text type="success" style="font-size: 18px; font-weight: 600">
              ${{ currentOrder.amount.toFixed(2) }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="订单详情" :span="2">
            {{ currentOrder.description }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentOrder.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(currentOrder.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 订单项 -->
        <el-divider content-position="left">订单项</el-divider>
        <el-table :data="currentOrder.items" style="width: 100%">
          <el-table-column label="项目名称" prop="name" />
          <el-table-column label="数量" prop="quantity" width="80" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              ${{ row.unitPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              ${{ (row.quantity * row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Download, View } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import * as orderApi from '@/api/modules/order';

const filters = ref({
  orderNo: '',
  userEmail: '',
  status: '',
  type: '',
});

const orderList = ref<any[]>([]);
const selectedOrders = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const detailDialogVisible = ref(false);
const currentOrder = ref<any>(null);

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    static_proxy: '静态IP购买',
    dynamic_proxy: '动态代理购买',
    renewal: '续费',
  };
  return map[type] || type;
};

const getTypeColor = (type: string) => {
  const map: Record<string, any> = {
    static_proxy: 'success',
    dynamic_proxy: 'warning',
    renewal: 'info',
  };
  return map[type] || 'info';
};

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info',
    failed: 'danger',
  };
  return map[status] || 'info';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    completed: '已完成',
    cancelled: '已取消',
    failed: '失败',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      ...filters.value,
    };

    const response = await orderApi.getAllOrders(params);
    
    // 处理订单数据
    orderList.value = (response.data || []).map((order: any) => ({
      ...order,
      userEmail: order.user?.email || order.userEmail || 'N/A',
      amount: parseFloat(order.amount || 0),
      description: order.remark || order.description || '-',
    }));
    
    pagination.value.total = response.total || 0;
  } catch (error: any) {
    console.error('[AdminOrders] 加载失败:', error);
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    orderNo: '',
    userEmail: '',
    status: '',
    type: '',
  };
  loadData();
};

const viewDetail = (order: any) => {
  currentOrder.value = order;
  detailDialogVisible.value = true;
};

const cancelOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确认取消订单 ${order.orderNo} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 调用API取消订单
    await orderApi.cancelOrder(order.id);

    ElMessage.success('订单已取消');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + error.message);
    }
  }
};

const handleSelectionChange = (selection: any[]) => {
  selectedOrders.value = selection;
};

const exportOrders = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单');
    return;
  }

  try {
    // 准备导出数据
    const exportData = selectedOrders.value.map((order) => ({
      订单号: order.orderNo,
      用户邮箱: order.userEmail,
      订单类型: getTypeText(order.type),
      金额: `$${order.amount.toFixed(2)}`,
      状态: getStatusText(order.status),
      订单详情: order.description,
      创建时间: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    }));

    // 转换为CSV格式
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `订单导出_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();

    ElMessage.success(`成功导出 ${selectedOrders.value.length} 条订单`);
  } catch (error: any) {
    console.error('[Orders] 导出失败:', error);
    ElMessage.error('导出失败：' + error.message);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.admin-orders-container {
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
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
