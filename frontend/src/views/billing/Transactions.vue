<template>
  <div class="transactions-container">
    <h1>交易记录</h1>

    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="交易类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="全部" clearable>
            <el-option label="充值" value="recharge" />
            <el-option label="代理购买" value="proxy_purchase" />
            <el-option label="退款" value="refund" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTransactions">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 交易列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="transactions" v-loading="loading" style="width: 100%" stripe>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'income'" type="success">收入</el-tag>
            <el-tag v-else type="danger">支出</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="150">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'income' ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
              {{ row.type === 'income' ? '+' : '-' }}${{ Math.abs(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTransactions"
          @current-change="loadTransactions"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getUserTransactions } from '@/api/modules/billing';

const transactions = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  type: '',
  category: '',
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const loadTransactions = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    const res = await getUserTransactions(params);
    if (res.data) {
      transactions.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load transactions:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.type = '';
  filters.category = '';
  pagination.page = 1;
  loadTransactions();
};

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    recharge: '充值',
    proxy_purchase: '代理购买',
    refund: '退款',
    commission: '佣金',
  };
  return categoryMap[category] || category;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped lang="scss">
.transactions-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

