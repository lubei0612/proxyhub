<template>
  <div class="recharge-approval-container">
    <h1>充值审核</h1>

    <el-card shadow="hover" class="approval-card">
      <template #header>
        <div class="card-header">
          <span>待审核充值列表</span>
          <el-tag type="warning">待审核：{{ pendingCount }}</el-tag>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="审核状态" @change="loadData">
              <el-option label="待审核" value="pending" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-select v-model="filters.paymentMethod" placeholder="支付方式" clearable>
              <el-option label="全部" value="" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="USDT" value="usdt" />
              <el-option label="美金" value="usd" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-input v-model="filters.email" placeholder="用户邮箱" clearable />
          </el-col>

          <el-col :span="4">
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 审核列表 -->
      <el-table :data="rechargeList" v-loading="loading" style="width: 100%">
        <el-table-column label="订单号" width="150">
          <template #default="{ row }">
            <el-text copyable>{{ row.orderNo }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="用户邮箱" width="180">
          <template #default="{ row }">
            <el-text type="primary">{{ row.user?.email || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="充值金额" width="120">
          <template #default="{ row }">
            <el-text type="success" style="font-size: 16px; font-weight: 600">
              ${{ parseFloat(row.amount).toFixed(2) }}
            </el-text>
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

        <el-table-column label="备注" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button
                type="success"
                size="small"
                @click="handleApprove(row)"
              >
                <el-icon><Check /></el-icon>
                批准
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleReject(row)"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="info"
                size="small"
                @click="viewDetail(row)"
              >
                查看详情
              </el-button>
            </template>
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

    <!-- 批准对话框 -->
    <el-dialog v-model="approveDialogVisible" title="批准充值" width="500px">
      <el-alert type="warning" :closable="false" style="margin-bottom: 20px">
        <p>确认批准此充值申请吗？批准后金额将自动到账。</p>
      </el-alert>

      <el-descriptions :column="1" border v-if="currentRecharge">
        <el-descriptions-item label="订单号">
          {{ currentRecharge.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="用户邮箱">
          {{ currentRecharge.user?.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="充值金额">
          ${{ parseFloat(currentRecharge.amount).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ getPaymentMethodText(currentRecharge.paymentMethod) }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmApprove" :loading="approving">
          <el-icon><Check /></el-icon>
          确认批准
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝充值" width="500px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="rejecting">
          <el-icon><Close /></el-icon>
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Check, Close } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { approveRecharge, getAllRecharges } from '@/api/modules/billing';

const filters = ref({
  status: 'pending',
  paymentMethod: '',
  email: '',
});

const rechargeList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

const pendingCount = computed(() => {
  return rechargeList.value.filter((r) => r.status === 'pending').length;
});

const approveDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const currentRecharge = ref<any>(null);
const approving = ref(false);
const rejecting = ref(false);
const rejectForm = ref({
  reason: '',
});

const getPaymentMethodText = (method: string) => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    usdt: 'USDT',
    usd: '美金',
  };
  return map[method] || method;
};

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm');
};

const loadData = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
    };

    if (filters.value.status) {
      params.status = filters.value.status;
    }
    if (filters.value.paymentMethod) {
      params.method = filters.value.paymentMethod;
    }
    if (filters.value.email && filters.value.email.trim()) {
      params.email = filters.value.email.trim();
    }

    // 调用真实API
    const response = await getAllRecharges(params);
    rechargeList.value = response.data || response.list || [];
    pagination.value.total = response.total || 0;
  } catch (error: any) {
    console.error('加载充值记录失败:', error);
    ElMessage.error('加载失败：' + (error.message || '请稍后重试'));
    rechargeList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleApprove = (recharge: any) => {
  currentRecharge.value = recharge;
  approveDialogVisible.value = true;
};

const confirmApprove = async () => {
  if (!currentRecharge.value) {
    return;
  }

  try {
    approving.value = true;
    
    // 调用API批准充值
    await approveRecharge(currentRecharge.value.id.toString(), {
      approved: true,
      remark: '审核通过',
    });

    ElMessage.success('批准成功！用户余额已更新。');
    approveDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    console.error('批准充值失败:', error);
    ElMessage.error('批准失败：' + (error.message || '请稍后重试'));
  } finally {
    approving.value = false;
  }
};

const handleReject = (recharge: any) => {
  currentRecharge.value = recharge;
  rejectForm.value.reason = '';
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectForm.value.reason) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }

  if (!currentRecharge.value) {
    return;
  }

  try {
    rejecting.value = true;
    
    // 调用API拒绝充值
    await approveRecharge(currentRecharge.value.id.toString(), {
      approved: false,
      remark: rejectForm.value.reason,
    });

    ElMessage.success('已拒绝该充值申请');
    rejectDialogVisible.value = false;
    rejectForm.value.reason = '';
    loadData();
  } catch (error: any) {
    console.error('拒绝充值失败:', error);
    ElMessage.error('操作失败：' + (error.message || '请稍后重试'));
  } finally {
    rejecting.value = false;
  }
};

const viewDetail = (recharge: any) => {
  ElMessageBox.alert(
    `订单号：${recharge.orderNo}\n用户：${recharge.user?.email || '-'}\n金额：$${parseFloat(recharge.amount).toFixed(2)}\n备注：${recharge.remark || '无'}`,
    '充值详情',
    { confirmButtonText: '关闭' }
  );
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.recharge-approval-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .approval-card {
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
