<template>
  <div class="expenses-container">
    <h1>消费记录</h1>

    <el-card shadow="hover" class="expenses-card">
      <template #header>
        <div class="card-header">
          <span>我的消费明细</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select
              v-model="filters.type"
              placeholder="消费类型"
              clearable
              @change="loadData"
            >
              <el-option label="全部" value="" />
              <el-option label="购买代理IP" value="purchase" />
              <el-option label="续费" value="renewal" />
              <el-option label="流量消费" value="traffic" />
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="loadData"
            />
          </el-col>

          <el-col :span="4">
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>

          <el-col :span="4">
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>

          <el-col :span="2">
            <el-button type="success" @click="exportData">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">本月消费</div>
              <div class="stat-value">${{ monthlyExpense.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">今日消费</div>
              <div class="stat-value">${{ todayExpense.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">总消费</div>
              <div class="stat-value">${{ totalExpense.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">消费记录数</div>
              <div class="stat-value">{{ pagination.total }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 消费记录列表 -->
      <el-table :data="expenseList" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />

        <el-table-column label="交易时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="消费类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="300">
          <template #default="{ row }">
            {{ row.description || row.remark }}
          </template>
        </el-table-column>

        <el-table-column label="消费金额" width="150" align="right">
          <template #default="{ row }">
            <span class="expense-amount">-${{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="余额" width="150" align="right">
          <template #default="{ row }">
            ${{ (row.balanceAfter || 0).toFixed(2) }}
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
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getUserTransactions } from '@/api/modules/billing';
import { exportToCSV, formatDateForFilename } from '@/utils/export';

const filters = ref({
  type: '',
  dateRange: null as any,
});

const expenseList = ref<any[]>([]);
const loading = ref(false);

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 统计数据
const monthlyExpense = computed(() => {
  const startOfMonth = dayjs().startOf('month');
  return expenseList.value
    .filter((item) => dayjs(item.createdAt).isAfter(startOfMonth))
    .reduce((sum, item) => sum + (item.type === 'expense' ? item.amount : 0), 0);
});

const todayExpense = computed(() => {
  const startOfDay = dayjs().startOf('day');
  return expenseList.value
    .filter((item) => dayjs(item.createdAt).isAfter(startOfDay))
    .reduce((sum, item) => sum + (item.type === 'expense' ? item.amount : 0), 0);
});

const totalExpense = computed(() => {
  return expenseList.value.reduce((sum, item) => sum + (item.type === 'expense' ? item.amount : 0), 0);
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      type: 'expense', // 只查询支出类型
    };

    if (filters.value.type) {
      params.category = filters.value.type;
    }
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      params.startDate = filters.value.dateRange[0];
      params.endDate = filters.value.dateRange[1];
    }

    // 调用真实API
    const response = await getUserTransactions(params);
    expenseList.value = response.data || [];
    pagination.value.total = response.total || 0;
  } catch (error: any) {
    console.error('加载消费记录失败:', error);
    ElMessage.error('加载失败：' + (error.message || '请稍后重试'));
    expenseList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    type: '',
    dateRange: null,
  };
  pagination.value.page = 1;
  loadData();
};

// 导出数据
const exportData = () => {
  if (expenseList.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  const csvData = expenseList.value.map((item) => ({
    '交易时间': formatDate(item.createdAt),
    '消费类型': getTypeName(item.type),
    '描述': item.description || item.remark,
    '消费金额': `-$${item.amount.toFixed(2)}`,
    '余额': `$${(item.balanceAfter || 0).toFixed(2)}`,
  }));

  exportToCSV(csvData, `消费记录_${formatDateForFilename()}.csv`);
  ElMessage.success('导出成功！');
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 获取类型名称
const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    purchase: '购买代理IP',
    renewal: '续费',
    traffic: '流量消费',
    expense: '其他支出',
  };
  return typeMap[type] || type;
};

// 获取类型标签颜色
const getTypeTagType = (type: string) => {
  const typeTagMap: Record<string, any> = {
    purchase: 'primary',
    renewal: 'success',
    traffic: 'warning',
    expense: 'info',
  };
  return typeTagMap[type] || 'info';
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
      font-weight: 600;
      color: #303133;
    }

    .filter-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .stats-section {
      margin-bottom: 20px;
      padding: 20px 0;
      border-bottom: 1px solid #ebeef5;

      .stat-card {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        text-align: center;
        color: #fff;

        &:nth-child(2n) {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &:nth-child(3n) {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &:nth-child(4n) {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .stat-label {
          font-size: 14px;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
        }
      }
    }

    .expense-amount {
      color: #f56c6c;
      font-weight: 600;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
