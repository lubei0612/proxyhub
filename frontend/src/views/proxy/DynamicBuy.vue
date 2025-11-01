<template>
  <div class="dynamic-buy-container">
    <h1>购买动态住宅代理</h1>

    <el-row :gutter="20">
      <!-- 套餐选择 -->
      <el-col :span="16">
        <el-card shadow="hover" class="package-card">
          <template #header>
            <div class="card-header">
              <span>选择套餐</span>
            </div>
          </template>

          <el-row :gutter="20" class="package-row">
            <el-col :span="8" v-for="pkg in packages" :key="pkg.id">
              <div
                class="package-item"
                :class="{ active: selectedPackage === pkg.id }"
                @click="selectedPackage = pkg.id"
              >
                <div class="package-header">
                  <h3>{{ pkg.name }}</h3>
                  <el-tag :type="pkg.popular ? 'danger' : 'info'" size="small">
                    {{ pkg.popular ? '热门' : '标准' }}
                  </el-tag>
                </div>
                <div class="package-traffic">
                  <span class="traffic-amount">{{ pkg.traffic }}</span>
                  <span class="traffic-unit">GB</span>
                </div>
                <div class="package-price">
                  <span class="price-symbol">$</span>
                  <span class="price-amount">{{ pkg.price }}</span>
                </div>
                <div class="package-features">
                  <div class="feature" v-for="feature in pkg.features" :key="feature">
                    <el-icon><Check /></el-icon>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-alert
            title="提示"
            description="动态代理按流量计费，不限制使用时间"
            type="info"
            show-icon
            :closable="false"
            style="margin-top: 20px"
          />
        </el-card>
      </el-col>

      <!-- 订单摘要 -->
      <el-col :span="8">
        <el-card shadow="hover" class="summary-card">
          <template #header>
            <div class="card-header">
              <span>订单摘要</span>
            </div>
          </template>

          <div class="summary-content" v-if="currentPackage">
            <div class="summary-item">
              <span>套餐名称：</span>
              <strong>{{ currentPackage.name }}</strong>
            </div>
            <div class="summary-item">
              <span>流量额度：</span>
              <strong>{{ currentPackage.traffic }} GB</strong>
            </div>
            <div class="summary-item">
              <span>有效期：</span>
              <strong>不限</strong>
            </div>
            <div class="summary-item total">
              <span>总价格：</span>
              <strong class="price">${{ currentPackage.price }}</strong>
            </div>

            <el-divider />

            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handlePurchase"
            >
              <el-icon><ShoppingCart /></el-icon>
              立即购买
            </el-button>

            <div class="features-list">
              <h4>套餐特性</h4>
              <ul>
                <li v-for="feature in currentPackage.features" :key="feature">
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>

          <el-empty v-else description="请选择套餐" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, ShoppingCart } from '@element-plus/icons-vue';

const router = useRouter();

const packages = ref([
  {
    id: 1,
    name: '入门套餐',
    traffic: 10,
    price: 50,
    popular: false,
    features: ['不限使用时间', '支持HTTP/HTTPS', '99%在线率', '7x24小时支持'],
  },
  {
    id: 2,
    name: '标准套餐',
    traffic: 50,
    price: 200,
    popular: true,
    features: ['不限使用时间', '支持HTTP/HTTPS/SOCKS5', '99.9%在线率', '优先技术支持'],
  },
  {
    id: 3,
    name: '专业套餐',
    traffic: 100,
    price: 350,
    popular: false,
    features: ['不限使用时间', '全协议支持', '99.9%在线率', 'VIP专属支持', '自定义白名单'],
  },
]);

const selectedPackage = ref(2);
const loading = ref(false);

const currentPackage = computed(() => {
  return packages.value.find((p) => p.id === selectedPackage.value);
});

const handlePurchase = async () => {
  if (!currentPackage.value) {
    ElMessage.warning('请选择套餐');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认购买 ${currentPackage.value.name}（${currentPackage.value.traffic}GB），总计 $${currentPackage.value.price}？`,
      '确认购买',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    loading.value = true;

    // TODO: 实际API调用
    await new Promise((resolve) => setTimeout(resolve, 1500));

    ElMessage.success('购买成功！流量已充值到您的账户');
    setTimeout(() => {
      router.push('/proxy/dynamic/manage');
    }, 1500);
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
.dynamic-buy-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .package-card {
    .card-header {
      font-weight: bold;
      font-size: 16px;
    }

    .package-row {
      margin-bottom: 20px;
    }

    .package-item {
      padding: 20px;
      border: 2px solid #dcdfe6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      height: 100%;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
      }

      &.active {
        border-color: #409eff;
        background-color: #ecf5ff;
      }

      .package-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        h3 {
          margin: 0;
          font-size: 18px;
          color: #303133;
        }
      }

      .package-traffic {
        text-align: center;
        margin-bottom: 10px;

        .traffic-amount {
          font-size: 48px;
          font-weight: bold;
          color: #409eff;
        }

        .traffic-unit {
          font-size: 20px;
          color: #909399;
          margin-left: 5px;
        }
      }

      .package-price {
        text-align: center;
        margin-bottom: 15px;

        .price-symbol {
          font-size: 20px;
          color: #606266;
        }

        .price-amount {
          font-size: 32px;
          font-weight: bold;
          color: #f56c6c;
        }
      }

      .package-features {
        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #606266;

          .el-icon {
            color: #67c23a;
          }
        }
      }
    }
  }

  .summary-card {
    .card-header {
      font-weight: bold;
      font-size: 16px;
    }

    .summary-content {
      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 14px;

        &.total {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #dcdfe6;
          font-size: 18px;

          .price {
            color: #f56c6c;
            font-size: 24px;
          }
        }
      }

      .features-list {
        margin-top: 20px;

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #303133;
        }

        ul {
          margin: 0;
          padding-left: 20px;

          li {
            margin-bottom: 8px;
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }
  }
}
</style>

