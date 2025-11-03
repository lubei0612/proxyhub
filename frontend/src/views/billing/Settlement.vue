<template>
  <div class="settlement-container">
    <h1>结算记录</h1>

    <el-card shadow="hover" class="settlement-card">
      <template #header>
        <div class="card-header">
          <span>结算列表</span>
          <div class="header-stats">
            <el-tag type="success">总结算：${{ totalSettlement.toFixed(2) }}</el-tag>
          </div>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="结算状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待结算" value="pending" />
              <el-option label="已结算" value="completed" />
              <el-option label="结算中" value="processing" />
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-date-picker
              v-model="filters.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              style="width: 100%"
            />
          </el-col>

          <el-col :span="4">
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

      <!-- 结算列表 -->
      <el-table :data="settlementList" v-loading="loading" style="width: 100%">
        <el-table-column label="结算ID" width="150">
          <template #default="{ row }">
            <el-text copyable>{{ row.settlementId }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="结算周期" width="200">
          <template #default="{ row }">
            {{ formatPeriod(row.startDate, row.endDate) }}
          </template>
        </el-table-column>

        <el-table-column label="结算金额" width="150">
          <template #default="{ row }">
            <el-text type="success" style="font-size: 16px; font-weight: 600">
              ${{ row.amount.toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="订单数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.orderCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="结算时间" width="180">
          <template #default="{ row }">
            {{ row.completedAt ? formatDate(row.completedAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
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

    <!-- 结算详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="结算详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentSettlement">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="结算ID">
            {{ currentSettlement.settlementId }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSettlement.status)">
              {{ getStatusText(currentSettlement.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="结算周期" :span="2">
            {{ formatPeriod(currentSettlement.startDate, currentSettlement.endDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="结算金额">
            <el-text type="success" style="font-size: 18px; font-weight: 600">
              ${{ currentSettlement.amount.toFixed(2) }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="订单数量">
            {{ currentSettlement.orderCount }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 订单列表 -->
        <el-divider content-position="left">包含订单</el-divider>
        <el-table :data="currentSettlement.orders" max-height="300">
          <el-table-column label="订单号" width="150">
            <template #default="{ row }">
              <el-text copyable>{{ row.orderNo }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="订单类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="100">
            <template #default="{ row }">
              ${{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
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
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, View } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const filters = ref({
  status: '',
  dateRange: null as any,
});

const settlementList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const detailDialogVisible = ref(false);
const currentSettlement = ref<any>(null);

const totalSettlement = computed(() => {
  return settlementList.value
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.amount, 0);
});

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
  };
  return map[status] || 'info';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待结算',
    processing: '结算中',
    completed: '已结算',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatPeriod = (startDate: string, endDate: string) => {
  return `${dayjs(startDate).format('YYYY-MM-DD')} ~ ${dayjs(endDate).format('YYYY-MM-DD')}`;
};

const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 完整的Mock数据（包含所有数据用于筛选）
    const allMockData = [
      {
        id: 1,
        settlementId: 'STL202511',
        startDate: '2025-11-01',
        endDate: '2025-11-30',
        amount: 1250.5,
        orderCount: 15,
        status: 'processing',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        completedAt: null,
        orders: [
          {
            orderNo: 'ORD20251102001',
            type: '静态IP购买',
            amount: 25,
            createdAt: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            orderNo: 'ORD20251101001',
            type: '续费',
            amount: 15,
            createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          },
        ],
      },
      {
        id: 2,
        settlementId: 'STL202510',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        amount: 2580.0,
        orderCount: 28,
        status: 'completed',
        createdAt: dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
        completedAt: dayjs().subtract(25, 'day').format('YYYY-MM-DD HH:mm:ss'),
        orders: [],
      },
      {
        id: 3,
        settlementId: 'STL202509',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        amount: 1890.75,
        orderCount: 22,
        status: 'completed',
        createdAt: dayjs().subtract(2, 'month').format('YYYY-MM-DD HH:mm:ss'),
        completedAt: dayjs().subtract(55, 'day').format('YYYY-MM-DD HH:mm:ss'),
        orders: [],
      },
    ];

    // 应用筛选条件（前端筛选Mock数据）
    let filteredData = [...allMockData];

    // 按状态筛选
    if (filters.value.status) {
      filteredData = filteredData.filter((item) => item.status === filters.value.status);
    }

    // 按日期范围筛选（筛选结算周期）
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const [startDate, endDate] = filters.value.dateRange;
      filteredData = filteredData.filter((item) => {
        const itemStart = dayjs(item.startDate);
        const filterStart = dayjs(startDate);
        const filterEnd = dayjs(endDate);
        return itemStart.isBetween(filterStart, filterEnd, null, '[]');
      });
    }

    // 应用分页
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    settlementList.value = filteredData.slice(start, end);
    pagination.value.total = filteredData.length;
  } catch (error: any) {
    console.error('加载结算记录失败:', error);
    ElMessage.error('加载失败：' + (error.message || '请稍后重试'));
    settlementList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    status: '',
    dateRange: null,
  };
  loadData();
};

const viewDetail = (settlement: any) => {
  currentSettlement.value = settlement;
  detailDialogVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.settlement-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .settlement-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;

      .header-stats {
        display: flex;
        gap: 10px;
      }
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
