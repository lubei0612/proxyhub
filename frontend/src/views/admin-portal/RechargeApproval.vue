<template>
  <div class="recharge-approval-container">
    <h1>充值审核</h1>

    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecharges">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 充值列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="recharges" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="tradeNo" label="交易号" width="180" show-overflow-tooltip />
        <el-table-column label="用户邮箱" width="200">
          <template #default="{ row }">
            {{ row.user?.email || 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #67c23a">${{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="充值方式" width="120">
          <template #default="{ row }">
            {{ getMethodText(row.method) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              text
              type="success"
              size="small"
              @click="handleApprove(row, true)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              text
              type="danger"
              size="small"
              @click="handleApprove(row, false)"
            >
              拒绝
            </el-button>
            <span v-else style="color: #909399">已处理</span>
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
          @size-change="loadRecharges"
          @current-change="loadRecharges"
        />
      </div>
    </el-card>

    <!-- 审核备注对话框 -->
    <el-dialog v-model="remarkDialog.visible" :title="remarkDialog.title" width="500px">
      <el-form :model="remarkDialog.form" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="remarkDialog.form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remarkDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmApproval">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAllRecharges, approveRecharge } from '@/api/modules/billing';
import { ElMessage } from 'element-plus';

const recharges = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  status: 'pending',
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const remarkDialog = reactive({
  visible: false,
  title: '',
  rechargeId: '',
  approved: false,
  form: {
    remark: '',
  },
});

const loadRecharges = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    const res = await getAllRecharges(params);
    if (res.data) {
      recharges.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load recharges:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.status = 'pending';
  pagination.page = 1;
  loadRecharges();
};

const handleApprove = (row: any, approved: boolean) => {
  remarkDialog.rechargeId = row.id;
  remarkDialog.approved = approved;
  remarkDialog.title = approved ? '通过充值审核' : '拒绝充值申请';
  remarkDialog.form.remark = '';
  remarkDialog.visible = true;
};

const handleConfirmApproval = async () => {
  try {
    await approveRecharge(remarkDialog.rechargeId, {
      approved: remarkDialog.approved,
      remark: remarkDialog.form.remark,
    });
    ElMessage.success(remarkDialog.approved ? '充值已通过' : '充值已拒绝');
    remarkDialog.visible = false;
    loadRecharges();
  } catch (error) {
    console.error('Failed to approve recharge:', error);
  }
};

const getMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    usdt: 'USDT',
    alipay: '支付宝',
    wechat: '微信支付',
  };
  return methodMap[method] || method;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadRecharges();
});
</script>

<style scoped lang="scss">
.recharge-approval-container {
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

