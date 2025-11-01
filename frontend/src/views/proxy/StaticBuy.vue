<template>
  <div class="static-buy-container">
    <h1>购买静态住宅代理IP</h1>

    <el-card shadow="hover" class="buy-form-card">
      <el-form :model="form" label-width="120px">
        <el-form-item label="通道名称">
          <el-input v-model="form.channelName" placeholder="请输入通道名称（默认：Default）" />
        </el-form-item>

        <el-form-item label="使用场景">
          <el-input v-model="form.scenario" placeholder="例如：电商、社交媒体等（可选）" />
        </el-form-item>

        <el-form-item label="IP类型">
          <el-radio-group v-model="form.ipType">
            <el-radio label="shared">共享IP ($5/个/30天)</el-radio>
            <el-radio label="native">原生IP ($8/个/30天)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="时长">
          <el-select v-model="form.duration" placeholder="请选择时长">
            <el-option label="30天" :value="30" />
            <el-option label="60天" :value="60" />
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
            <el-option label="365天" :value="365" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">选择国家和数量</el-divider>

        <div v-for="(item, index) in form.items" :key="index" class="country-item">
          <el-form-item label="国家">
            <el-select v-model="item.country" placeholder="选择国家">
              <el-option label="🇺🇸 美国 (US)" value="US" />
              <el-option label="🇬🇧 英国 (GB)" value="GB" />
              <el-option label="🇯🇵 日本 (JP)" value="JP" />
              <el-option label="🇩🇪 德国 (DE)" value="DE" />
              <el-option label="🇫🇷 法国 (FR)" value="FR" />
            </el-select>
          </el-form-item>

          <el-form-item label="城市">
            <el-input v-model="item.city" placeholder="例如：New York" />
          </el-form-item>

          <el-form-item label="数量">
            <el-input-number v-model="item.quantity" :min="1" :max="100" />
          </el-form-item>

          <el-button
            v-if="form.items.length > 1"
            type="danger"
            text
            @click="removeItem(index)"
          >
            删除
          </el-button>
        </div>

        <el-form-item>
          <el-button @click="addItem">
            <el-icon><Plus /></el-icon>
            添加更多国家
          </el-button>
        </el-form-item>

        <el-divider />

        <el-form-item>
          <div class="price-summary">
            <div class="price-item">
              <span>单价：</span>
              <span class="price">${{ ipPrice }}</span>
            </div>
            <div class="price-item">
              <span>总数量：</span>
              <span class="quantity">{{ totalQuantity }} 个IP</span>
            </div>
            <div class="price-item">
              <span>时长倍数：</span>
              <span>{{ durationMultiplier }}x</span>
            </div>
            <div class="price-item total">
              <span>总价格：</span>
              <span class="total-price">${{ totalPrice }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handlePurchase">
            <el-icon><ShoppingCart /></el-icon>
            立即购买
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { purchaseStaticProxy } from '@/api/modules/proxy';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, ShoppingCart } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  channelName: 'Default',
  scenario: '',
  ipType: 'shared',
  duration: 30,
  items: [
    { country: 'US', city: 'New York', quantity: 1 },
  ],
});

const loading = ref(false);

const ipPrice = computed(() => {
  return form.value.ipType === 'native' ? 8 : 5;
});

const totalQuantity = computed(() => {
  return form.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

const durationMultiplier = computed(() => {
  return form.value.duration / 30;
});

const totalPrice = computed(() => {
  return (totalQuantity.value * ipPrice.value * durationMultiplier.value).toFixed(2);
});

const addItem = () => {
  form.value.items.push({ country: 'US', city: '', quantity: 1 });
};

const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

const resetForm = () => {
  form.value = {
    channelName: 'Default',
    scenario: '',
    ipType: 'shared',
    duration: 30,
    items: [{ country: 'US', city: 'New York', quantity: 1 }],
  };
};

const handlePurchase = async () => {
  // 验证表单
  if (!form.value.channelName) {
    ElMessage.warning('请输入通道名称');
    return;
  }

  for (const item of form.value.items) {
    if (!item.country || !item.city || item.quantity < 1) {
      ElMessage.warning('请完善所有国家和城市信息');
      return;
    }
  }

  // 确认购买
  try {
    await ElMessageBox.confirm(
      `确认购买 ${totalQuantity.value} 个IP，总计 $${totalPrice.value}？`,
      '确认购买',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    loading.value = true;

    const res = await purchaseStaticProxy(form.value);

    if (res.success) {
      ElMessage.success(res.message || '购买成功！');
      // 更新用户余额
      if (res.data?.newBalance !== undefined) {
        userStore.updateBalance(res.data.newBalance);
      }
      // 跳转到管理页面
      setTimeout(() => {
        router.push('/proxy/static/manage');
      }, 1500);
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Purchase failed:', error);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.static-buy-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .buy-form-card {
    max-width: 800px;
  }

  .country-item {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .el-form-item {
      margin-bottom: 0;
      flex: 1;
    }
  }

  .price-summary {
    width: 100%;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .price-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 16px;

      &.total {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px solid #dcdfe6;
        font-size: 18px;
        font-weight: bold;

        .total-price {
          color: #f56c6c;
          font-size: 24px;
        }
      }

      .price {
        color: #409eff;
        font-weight: bold;
      }

      .quantity {
        color: #67c23a;
        font-weight: bold;
      }
    }
  }
}
</style>

