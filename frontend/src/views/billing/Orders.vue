<template>
  <div class="orders-container">
    <h1>订单记录</h1>

    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="订单类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="购买" value="buy" />
            <el-option label="续费" value="renew" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOrders">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="orders" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="orderNo" label="订单号" width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'buy'" type="primary">购买</el-tag>
            <el-tag v-else type="warning">续费</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="代理类型" width="120">
          <template #default="{ row }">
            {{ row.staticProxyType === 'native' ? '原生IP' : '共享IP' }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ row.timePeriod }} 天
          </template>
        </el-table-column>
        <el-table-column label="总价" width="120">
          <template #default="{ row }">
            ${{ row.total_price }}
          </template>
        </el-table-column>
        <el-table-column label="实付" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">${{ row.pay_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待支付</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
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
          @size-change="loadOrders"
          @current-change="loadOrders"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="订单详情" width="600px">
      <el-descriptions :column="1" border v-if="detailDialog.order">
        <el-descriptions-item label="订单号">
          {{ detailDialog.order.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="订单类型">
          {{ detailDialog.order.type === 'buy' ? '购买' : '续费' }}
        </el-descriptions-item>
        <el-descriptions-item label="代理类型">
          {{ detailDialog.order.proxyType }}
        </el-descriptions-item>
        <el-descriptions-item label="总价">
          ${{ detailDialog.order.total_price }}
        </el-descriptions-item>
        <el-descriptions-item label="折扣">
          ${{ detailDialog.order.discount_price }}
        </el-descriptions-item>
        <el-descriptions-item label="实付">
          ${{ detailDialog.order.pay_price }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ getStatusText(detailDialog.order.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(detailDialog.order.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="购买详情" v-if="detailDialog.order.buy_data">
          <pre>{{ JSON.stringify(detailDialog.order.buy_data, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getUserOrders } from '@/api/modules/order';

const orders = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  type: '',
  status: '',
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const detailDialog = reactive({
  visible: false,
  order: null as any,
});

const loadOrders = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    const res = await getUserOrders(params);
    if (res.data) {
      orders.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.type = '';
  filters.status = '';
  pagination.page = 1;
  loadOrders();
};

const handleViewDetail = (row: any) => {
  detailDialog.order = row;
  detailDialog.visible = true;
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped lang="scss">
.orders-container {
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

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
}
</style>

