<template>
  <div class="expenses-container">
    <h1>费用明细</h1>

    <el-card shadow="hover" class="expenses-card">
      <template #header>
        <div class="card-header">
          <span>消费记录</span>
          <el-tag type="danger">总支出：${{ totalExpenses.toFixed(2) }}</el-tag>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.category" placeholder="消费类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="静态IP购买" value="static_proxy" />
              <el-option label="动态代理购买" value="dynamic_proxy" />
              <el-option label="续费" value="renewal" />
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
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

      <!-- 费用统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">本月支出</div>
              <div class="stat-value">${{ monthlyExpenses.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">静态IP购买</div>
              <div class="stat-value">${{ staticProxyExpenses.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">动态代理购买</div>
              <div class="stat-value">${{ dynamicProxyExpenses.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon :size="30"><RefreshRight /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">续费支出</div>
              <div class="stat-value">${{ renewalExpenses.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 费用列表 -->
      <el-table :data="expenseList" v-loading="loading" style="width: 100%">
        <el-table-column label="消费ID" width="150">
          <template #default="{ row }">
            <el-text copyable>{{ row.expenseId }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="消费类型" width="130">
          <template #default="{ row }">
            <el-tag :type="getCategoryColor(row.category)">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">-${{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="消费描述" min-width="300">
          <template #default="{ row }">
            {{ row.description }}
          </template>
        </el-table-column>

        <el-table-column label="关联订单" width="150">
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrder(row.orderId)">
              {{ row.orderId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="消费时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  ShoppingCart,
  Box,
  Connection,
  RefreshRight,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const filters = ref({
  category: '',
  dateRange: null as any,
});

const expenseList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const totalExpenses = computed(() => {
  return expenseList.value.reduce((sum, item) => sum + item.amount, 0);
});

const monthlyExpenses = computed(() => {
  const now = dayjs();
  return expenseList.value
    .filter((item) => dayjs(item.createdAt).isSame(now, 'month'))
    .reduce((sum, item) => sum + item.amount, 0);
});

const staticProxyExpenses = computed(() => {
  return expenseList.value
    .filter((item) => item.category === 'static_proxy')
    .reduce((sum, item) => sum + item.amount, 0);
});

const dynamicProxyExpenses = computed(() => {
  return expenseList.value
    .filter((item) => item.category === 'dynamic_proxy')
    .reduce((sum, item) => sum + item.amount, 0);
});

const renewalExpenses = computed(() => {
  return expenseList.value
    .filter((item) => item.category === 'renewal')
    .reduce((sum, item) => sum + item.amount, 0);
});

const getCategoryText = (category: string) => {
  const map: Record<string, string> = {
    static_proxy: '静态IP购买',
    dynamic_proxy: '动态代理购买',
    renewal: '续费',
  };
  return map[category] || category;
};

const getCategoryColor = (category: string) => {
  const map: Record<string, any> = {
    static_proxy: 'success',
    dynamic_proxy: 'warning',
    renewal: 'info',
  };
  return map[category] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockData = [
      {
        id: 1,
        expenseId: 'EXP20251102001',
        category: 'static_proxy',
        amount: 25,
        description: '购买静态IP - 美国洛杉矶 × 5个 × 30天',
        orderId: 'ORD20251102001',
        createdAt: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: 2,
        expenseId: 'EXP20251101001',
        category: 'renewal',
        amount: 15,
        description: '续费静态IP - 日本东京 × 3个 × 30天',
        orderId: 'ORD20251101001',
        createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: 3,
        expenseId: 'EXP20251031001',
        category: 'dynamic_proxy',
        amount: 50,
        description: '购买动态代理流量包 - 10GB',
        orderId: 'ORD20251031001',
        createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      },
    ];

    expenseList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    category: '',
    dateRange: null,
  };
  loadData();
};

const viewOrder = (orderId: string) => {
  ElMessageBox.alert(`订单详情：${orderId}`, '订单信息', {
    confirmButtonText: '关闭',
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.expenses-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .expenses-card {
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

    .stats-row {
      margin-bottom: 30px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 20px;
        background-color: #f5f7fa;
        border-radius: 8px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }

    .amount {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
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
