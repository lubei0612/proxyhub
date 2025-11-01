<template>
  <div class="recharge-container">
    <h1>账户充值</h1>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="recharge-form-card">
          <template #header>
            <div class="card-header">
              <span>充值金额</span>
            </div>
          </template>

          <el-form :model="form" label-width="100px">
            <el-form-item label="充值方式">
              <el-radio-group v-model="form.method">
                <el-radio label="usdt">USDT (TRC20)</el-radio>
                <el-radio label="alipay">支付宝</el-radio>
                <el-radio label="wechat">微信支付</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="充值金额">
              <el-input-number
                v-model="form.amount"
                :min="10"
                :max="10000"
                :step="10"
                style="width: 100%"
              />
              <div class="hint">最低充值金额：$10</div>
            </el-form-item>

            <el-form-item>
              <div class="quick-amounts">
                <el-button
                  v-for="amount in [50, 100, 200, 500]"
                  :key="amount"
                  @click="form.amount = amount"
                >
                  ${{ amount }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="handleRecharge"
              >
                <el-icon><Wallet /></el-icon>
                提交充值申请
              </el-button>
            </el-form-item>
          </el-form>

          <el-alert
            title="充值说明"
            type="info"
            :closable="false"
            show-icon
          >
            <ul>
              <li>提交充值申请后，请联系客服完成支付</li>
              <li>充值通常在1-24小时内到账</li>
              <li>如有疑问，请联系客服：support@proxyhub.com</li>
            </ul>
          </el-alert>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="recharge-history-card">
          <template #header>
            <div class="card-header">
              <span>充值记录</span>
            </div>
          </template>

          <el-table :data="recharges" v-loading="loadingHistory" max-height="400">
            <el-table-column prop="tradeNo" label="交易号" width="180" show-overflow-tooltip />
            <el-table-column label="金额" width="100">
              <template #default="{ row }">
                ${{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'pending'" type="warning">待审核</el-tag>
                <el-tag v-else-if="row.status === 'approved'" type="success">已完成</el-tag>
                <el-tag v-else type="danger">已拒绝</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination" v-if="pagination.total > 0">
            <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.limit"
              :total="pagination.total"
              layout="prev, pager, next"
              small
              @current-change="loadRecharges"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { createRecharge, getUserRecharges } from '@/api/modules/billing';
import { ElMessage } from 'element-plus';
import { Wallet } from '@element-plus/icons-vue';

const form = reactive({
  amount: 100,
  method: 'usdt',
});

const loading = ref(false);
const loadingHistory = ref(false);
const recharges = ref<any[]>([]);

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const loadRecharges = async () => {
  loadingHistory.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };
    const res = await getUserRecharges(params);
    if (res.data) {
      recharges.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load recharges:', error);
  } finally {
    loadingHistory.value = false;
  }
};

const handleRecharge = async () => {
  if (form.amount < 10) {
    ElMessage.warning('最低充值金额为 $10');
    return;
  }

  loading.value = true;
  try {
    const res = await createRecharge({
      amount: form.amount,
      method: form.method,
    });

    if (res.data) {
      ElMessage.success('充值申请已提交，请等待审核');
      loadRecharges();
      form.amount = 100;
    }
  } catch (error) {
    console.error('Failed to create recharge:', error);
  } finally {
    loading.value = false;
  }
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
.recharge-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .recharge-form-card,
  .recharge-history-card {
    .card-header {
      font-weight: bold;
    }

    .hint {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }

    .quick-amounts {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    :deep(.el-alert) {
      margin-top: 20px;

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin: 5px 0;
        }
      }
    }

    .pagination {
      margin-top: 15px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>

