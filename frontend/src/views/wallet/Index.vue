<template>
  <div class="wallet-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <h3>我的钱包</h3>
          </template>
          <div class="balance-info">
            <div class="balance-item">
              <div class="label">账户余额</div>
              <div class="value">${{ userStore.user?.balance || 0 }}</div>
            </div>
            <div class="balance-item">
              <div class="label">赠送余额</div>
              <div class="value">${{ userStore.user?.gift_balance || 0 }}</div>
            </div>
          </div>
          <el-button type="primary" @click="$router.push('/wallet/recharge')">立即充值</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
</script>

<style scoped lang="scss">
.wallet-page {
  h3 {
    margin: 0;
    font-size: 18px;
  }

  .balance-info {
    margin: 20px 0;
  }

  .balance-item {
    margin-bottom: 16px;

    .label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .value {
      font-size: 28px;
      font-weight: bold;
      color: #67c23a;
    }
  }
}
</style>

