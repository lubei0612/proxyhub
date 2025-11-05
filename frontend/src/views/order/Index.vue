<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>IP购买订单</h3>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="orderList" 
        border 
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column label="产品信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.remark || '订单信息' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额" align="right" width="120">
          <template #default="{ row }">
            <span class="price">${{ parseFloat(row.amount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="pagination.total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserOrders } from '@/api/modules/order';

// 加载状态
const loading = ref(false);

// 订单列表
const orderList = ref<any[]>([]);

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
    };

    // 调用实际API
    const response = await getUserOrders(params);
    orderList.value = response.data || response.list || [];
    pagination.value.total = response.total || orderList.value.length;
  } catch (error: any) {
    console.error('[OrderIndex] 加载失败:', error);
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
    orderList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info',
  };
  return map[status] || 'info';
};

// 状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return map[status] || status;
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.order-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .text-secondary {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
  }

  .price {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>

