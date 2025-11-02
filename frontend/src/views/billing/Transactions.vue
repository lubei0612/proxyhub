<template>
  <div class="transactions-container">
    <h1>交易明细</h1>

    <el-card shadow="hover" class="transactions-card">
      <template #header>
        <div class="card-header">
          <span>交易记录</span>
          <div class="header-stats">
            <el-tag type="success">收入：${{ totalIncome.toFixed(2) }}</el-tag>
            <el-tag type="danger">支出：${{ totalExpense.toFixed(2) }}</el-tag>
          </div>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.type" placeholder="交易类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="充值" value="recharge" />
              <el-option label="购买" value="purchase" />
              <el-option label="退款" value="refund" />
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

      <!-- 交易列表 -->
      <el-table :data="transactionList" v-loading="loading" style="width: 100%">
        <el-table-column label="交易号" width="180">
          <template #default="{ row }">
            <el-text copyable>{{ row.transactionNo }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="交易类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="150">
          <template #default="{ row }">
            <span :class="['amount', row.type === 'recharge' ? 'income' : 'expense']">
              {{ row.type === 'recharge' ? '+' : '-' }}${{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="余额变动" width="150">
          <template #default="{ row }">
            <el-text type="info">${{ row.balanceBefore.toFixed(2) }} → ${{ row.balanceAfter.toFixed(2) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="交易描述" min-width="250" prop="description" />

        <el-table-column label="交易时间" width="180">
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
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const filters = ref({
  type: '',
  dateRange: null as any,
});

const transactionList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const totalIncome = computed(() => {
  return transactionList.value
    .filter((t) => t.type === 'recharge')
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return transactionList.value
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);
});

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    recharge: '充值',
    purchase: '购买',
    refund: '退款',
  };
  return map[type] || type;
};

const getTypeColor = (type: string) => {
  const map: Record<string, any> = {
    recharge: 'success',
    purchase: 'warning',
    refund: 'info',
  };
  return map[type] || 'info';
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
        transactionNo: 'TXN20251102001',
        type: 'recharge',
        amount: 100,
        balanceBefore: 50,
        balanceAfter: 150,
        description: '充值到账',
        createdAt: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: 2,
        transactionNo: 'TXN20251102002',
        type: 'purchase',
        amount: 25,
        balanceBefore: 150,
        balanceAfter: 125,
        description: '购买静态IP - 美国洛杉矶 × 5',
        createdAt: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      },
    ];

    transactionList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    type: '',
    dateRange: null,
  };
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.transactions-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .transactions-card {
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

    .amount {
      font-size: 16px;
      font-weight: 600;

      &.income {
        color: #67c23a;
      }

      &.expense {
        color: #f56c6c;
      }
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
