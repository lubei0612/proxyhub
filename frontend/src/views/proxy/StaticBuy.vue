<template>
  <div class="static-buy-container">
    <h1>静态住宅代理IP选购</h1>

    <el-row :gutter="20">
      <!-- 左侧：IP选择区域 -->
      <el-col :span="16">
        <el-card shadow="hover" class="selection-card">
          <template #header>
            <div class="card-header">
              <span>选择代理IP</span>
              <el-tag v-if="totalSelectedCount > 0" type="success">
                已选择 {{ totalSelectedCount }} 个IP
              </el-tag>
            </div>
          </template>

          <!-- IP类型选择 -->
          <div class="section">
            <h3>住宅IP类型</h3>
            <el-radio-group v-model="ipType" size="large" class="ip-type-group">
              <el-radio-button label="shared">
                <div class="radio-content">
                  <el-icon><Connection /></el-icon>
                  <div>
                    <div class="radio-title">普通</div>
                    <div class="radio-desc">稳定可靠，性价比高</div>
                  </div>
                </div>
              </el-radio-button>
              <el-radio-button label="premium">
                <div class="radio-content">
                  <el-icon><Star /></el-icon>
                  <div>
                    <div class="radio-title">原生</div>
                    <div class="radio-desc">电子商务，流媒体优选</div>
                  </div>
                </div>
              </el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <!-- 时长选择 -->
          <div class="section">
            <h3>选择时长</h3>
            <el-radio-group v-model="duration" class="duration-group">
              <el-radio-button :label="30">30天 - ${{ getBasePrice() }}/个</el-radio-button>
              <el-radio-button :label="60">60天 - ${{ (getBasePrice() * 2).toFixed(2) }}/个</el-radio-button>
              <el-radio-button :label="90">90天 - ${{ (getBasePrice() * 3).toFixed(2) }}/个</el-radio-button>
              <el-radio-button :label="180">180天 - ${{ (getBasePrice() * 6).toFixed(2) }}/个</el-radio-button>
              <el-radio-button :label="360">360天 - ${{ (getBasePrice() * 12).toFixed(2) }}/个</el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <!-- 业务场景选择 -->
          <div class="section">
            <h3>热门业务场景（可选）</h3>
            <el-select v-model="businessScenario" placeholder="选择业务场景" clearable style="width: 100%">
              <el-option label="Shopee" value="shopee">
                <span>🛒 Shopee - 东南亚电商平台</span>
              </el-option>
              <el-option label="TikTok" value="tiktok">
                <span>📱 TikTok - 短视频社交</span>
              </el-option>
              <el-option label="TikTok Shop" value="tiktok_shop">
                <span>🛍️ TikTok Shop - 直播带货</span>
              </el-option>
              <el-option label="AliExpress" value="aliexpress">
                <span>📦 AliExpress - 跨境电商</span>
              </el-option>
              <el-option label="Temu" value="temu">
                <span>🎁 Temu - 社交电商</span>
              </el-option>
              <el-option label="YouTube" value="youtube">
                <span>▶️ YouTube - 视频营销</span>
              </el-option>
              <el-option label="Amazon" value="amazon">
                <span>📚 Amazon - 亚马逊电商</span>
              </el-option>
            </el-select>
          </div>

          <el-divider />

          <!-- 大洲筛选 -->
          <div class="section">
            <h3>选择地区</h3>
            <el-radio-group v-model="selectedContinent" class="continent-group">
              <el-radio-button label="all">所有</el-radio-button>
              <el-radio-button label="europe">欧洲</el-radio-button>
              <el-radio-button label="south-america">南美洲</el-radio-button>
              <el-radio-button label="asia">亚洲</el-radio-button>
              <el-radio-button label="north-america">北美洲</el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <!-- 国家卡片网格（4列） -->
          <div class="section">
            <h3>选择国家和城市（{{ filteredCountries.length }}）</h3>
            <div class="country-grid">
              <div
                v-for="(item, index) in filteredCountries"
                :key="index"
                class="country-card"
                :class="{ 'selected': item.quantity > 0 }"
              >
                <div class="card-flag">
                  <img :src="getFlagUrl(item.code)" :alt="item.name" />
                </div>
                <div class="card-info">
                  <div class="card-country">{{ item.name }}</div>
                  <div class="card-city">{{ item.city }}</div>
                  <div class="card-available">库存：{{ item.available }}</div>
                  <div class="card-price">${{ getUnitPrice(item) }}/月</div>
                </div>
                <div class="card-quantity">
                  <el-input-number
                    v-model="item.quantity"
                    :min="0"
                    :max="item.available"
                    size="small"
                    @change="updateSelection"
                  />
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="filteredCountries.length === 0"
              description="该地区暂无可用IP"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：支付面板 -->
      <el-col :span="8">
        <el-card shadow="hover" class="payment-panel sticky-panel">
          <template #header>
            <div class="card-header">
              <span>支付信息</span>
            </div>
          </template>

          <!-- 未选择IP时 -->
          <div v-if="totalSelectedCount === 0" class="empty-selection">
            <el-icon :size="60" color="#c0c4cc"><ShoppingCart /></el-icon>
            <p class="empty-text">请先选择IP</p>
            <p class="empty-hint">在左侧选择国家和城市，设置购买数量</p>
          </div>

          <!-- 已选择IP时 -->
          <div v-else class="payment-details">
            <!-- 订单明细 -->
            <div class="order-details">
              <h4>订单明细</h4>
              <div class="order-items">
                <div v-for="(item, index) in selectedCountries" :key="index" class="order-item">
                  <div class="item-header">
                    <div class="item-location">
                      <img :src="getFlagUrl(item.code)" :alt="item.name" class="flag-sm" />
                      <span class="location-name">{{ item.name }} - {{ item.city }}</span>
                    </div>
                    <div class="item-count">{{ item.quantity }} 个</div>
                  </div>
                  <div class="item-footer">
                    <span class="item-price-label">${{ getUnitPrice(item) }}/月 × {{ item.quantity }}个 × {{ duration / 30 }}月</span>
                    <span class="item-price-value">${{ calculateItemPrice(item) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

            <!-- 价格汇总 -->
            <div class="price-summary">
              <div class="summary-row">
                <span class="label">IP类型：</span>
                <span class="value">{{ ipType === 'shared' ? '普通IP' : '原生IP' }}</span>
              </div>
              <div class="summary-row">
                <span class="label">时长：</span>
                <span class="value">{{ duration }}天</span>
              </div>
              <div class="summary-row">
                <span class="label">总数量：</span>
                <span class="value">{{ totalSelectedCount }} 个</span>
              </div>
              <div class="summary-row highlight">
                <span class="label">小计（USD）：</span>
                <span class="value total">${{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">折合（CNY）：</span>
                <span class="value">¥{{ (totalPrice * exchangeRate).toFixed(2) }}</span>
              </div>
            </div>

            <el-divider />

            <!-- 支付方式 -->
            <div class="payment-method">
              <h4>支付方式</h4>
              <el-radio-group v-model="paymentMethod" class="payment-options">
                <el-radio label="balance">
                  <div class="payment-option-content">
                    <el-icon><Wallet /></el-icon>
                    <div>
                      <div>账户余额</div>
                      <div class="balance-amount">${{ userBalance.toFixed(2) }}</div>
                    </div>
                  </div>
                </el-radio>
                <el-radio label="wechat">
                  <div class="payment-option-content">
                    <el-icon color="#07c160"><ChatDotRound /></el-icon>
                    <span>微信支付</span>
                  </div>
                </el-radio>
                <el-radio label="alipay">
                  <div class="payment-option-content">
                    <el-icon color="#1677ff"><Money /></el-icon>
                    <span>支付宝</span>
                  </div>
                </el-radio>
                <el-radio label="usdt">
                  <div class="payment-option-content">
                    <el-icon color="#26a17b"><CreditCard /></el-icon>
                    <span>USDT</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 余额不足提示 -->
            <el-alert
              v-if="paymentMethod === 'balance' && totalPrice > userBalance"
              type="warning"
              :closable="false"
              show-icon
              class="balance-warning"
            >
              余额不足，请先充值
            </el-alert>

            <!-- 提交按钮 -->
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="handleSubmit"
              class="submit-btn"
            >
              <el-icon><Check /></el-icon>
              立即购买
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Connection,
  Star,
  ShoppingCart,
  Wallet,
  ChatDotRound,
  Money,
  CreditCard,
  Check,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

// 国家数据（按大洲分类）
const countryData = {
  'north-america': [
    { code: 'US', name: '美国', city: 'Los Angeles', available: 150, quantity: 0 },
    { code: 'US', name: '美国', city: 'New York', available: 200, quantity: 0 },
    { code: 'US', name: '美国', city: 'Chicago', available: 120, quantity: 0 },
    { code: 'CA', name: '加拿大', city: 'Toronto', available: 80, quantity: 0 },
    { code: 'CA', name: '加拿大', city: 'Vancouver', available: 60, quantity: 0 },
    { code: 'MX', name: '墨西哥', city: 'Mexico City', available: 50, quantity: 0 },
  ],
  'south-america': [
    { code: 'BR', name: '巴西', city: 'São Paulo', available: 60, quantity: 0 },
    { code: 'BR', name: '巴西', city: 'Rio de Janeiro', available: 45, quantity: 0 },
    { code: 'AR', name: '阿根廷', city: 'Buenos Aires', available: 40, quantity: 0 },
    { code: 'CL', name: '智利', city: 'Santiago', available: 35, quantity: 0 },
  ],
  'europe': [
    { code: 'GB', name: '英国', city: 'London', available: 100, quantity: 0 },
    { code: 'GB', name: '英国', city: 'Manchester', available: 70, quantity: 0 },
    { code: 'DE', name: '德国', city: 'Berlin', available: 120, quantity: 0 },
    { code: 'DE', name: '德国', city: 'Munich', available: 90, quantity: 0 },
    { code: 'FR', name: '法国', city: 'Paris', available: 90, quantity: 0 },
    { code: 'FR', name: '法国', city: 'Lyon', available: 65, quantity: 0 },
    { code: 'ES', name: '西班牙', city: 'Madrid', available: 75, quantity: 0 },
    { code: 'IT', name: '意大利', city: 'Rome', available: 60, quantity: 0 },
  ],
  'asia': [
    { code: 'JP', name: '日本', city: 'Tokyo', available: 80, quantity: 0 },
    { code: 'JP', name: '日本', city: 'Osaka', available: 55, quantity: 0 },
    { code: 'KR', name: '韩国', city: 'Seoul', available: 70, quantity: 0 },
    { code: 'KR', name: '韩国', city: 'Busan', available: 45, quantity: 0 },
    { code: 'SG', name: '新加坡', city: 'Singapore', available: 50, quantity: 0 },
    { code: 'IN', name: '印度', city: 'Mumbai', available: 95, quantity: 0 },
    { code: 'TH', name: '泰国', city: 'Bangkok', available: 65, quantity: 0 },
    { code: 'VN', name: '越南', city: 'Ho Chi Minh', available: 55, quantity: 0 },
  ],
};

const userStore = useUserStore();

// 表单数据
const ipType = ref<'shared' | 'premium'>('shared');
const duration = ref(30);
const selectedContinent = ref('all');
const businessScenario = ref('');
const paymentMethod = ref('balance');
const submitting = ref(false);
const exchangeRate = ref(7.25);
const userBalance = ref(1000); // TODO: 从store获取

// 获取基础价格
const getBasePrice = () => {
  return ipType.value === 'shared' ? 5 : 8;
};

// 计算属性：筛选后的国家列表
const filteredCountries = computed(() => {
  if (selectedContinent.value === 'all') {
    // 显示所有国家
    return Object.values(countryData).flat();
  }
  return countryData[selectedContinent.value as keyof typeof countryData] || [];
});

// 已选择的国家（数量>0）
const selectedCountries = computed(() => {
  return filteredCountries.value.filter((item) => item.quantity > 0);
});

// 总选择数量
const totalSelectedCount = computed(() => {
  return selectedCountries.value.reduce((sum, item) => sum + item.quantity, 0);
});

// 获取单价（考虑覆盖价格）
const getUnitPrice = (item: any) => {
  // TODO: 调用后端API获取覆盖价格
  // 这里先使用基础价格
  return getBasePrice();
};

// 计算单项价格
const calculateItemPrice = (item: any) => {
  const unitPrice = getUnitPrice(item);
  const months = duration.value / 30;
  return (unitPrice * item.quantity * months).toFixed(2);
};

// 总价格
const totalPrice = computed(() => {
  let total = 0;
  selectedCountries.value.forEach((item) => {
    total += parseFloat(calculateItemPrice(item));
  });
  return total;
});

// 是否可以提交
const canSubmit = computed(() => {
  if (totalSelectedCount.value === 0) return false;
  if (paymentMethod.value === 'balance' && totalPrice.value > userBalance.value) return false;
  return true;
});

// 获取国旗URL
const getFlagUrl = (code: string) => {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

// 更新选择
const updateSelection = () => {
  // 触发响应式更新
};

// 提交订单
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      `确认购买 ${totalSelectedCount.value} 个IP，共计 $${totalPrice.value.toFixed(2)}？`,
      '确认订单',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    submitting.value = true;

    // TODO: 调用后端API提交订单
    // const response = await submitOrder({...});

    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 2000));

    ElMessage.success('订单提交成功！');

    // 重置表单
    Object.values(countryData).flat().forEach((item) => {
      item.quantity = 0;
    });
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('订单提交失败：' + (error.message || '未知错误'));
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  // 初始化：从userStore获取用户余额
  // userBalance.value = userStore.user?.balance || 0;
});
</script>

<style scoped lang="scss">
.static-buy-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .selection-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }

    .section {
      margin-bottom: 20px;

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      // IP类型选择
      .ip-type-group {
        display: flex;
        gap: 15px;
        width: 100%;

        :deep(.el-radio-button) {
          flex: 1;
          border-radius: 8px;
          overflow: hidden;

          .el-radio-button__inner {
            width: 100%;
            padding: 20px;
            border: 2px solid #dcdfe6;
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background-color: #f0f7ff;
            }
          }

          &.is-active .el-radio-button__inner {
            border-color: #409eff;
            background-color: #e6f4ff;
            color: #409eff;
          }
        }

        .radio-content {
          display: flex;
          align-items: center;
          gap: 12px;

          .el-icon {
            font-size: 28px;
          }

          .radio-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .radio-desc {
            font-size: 12px;
            color: #909399;
            line-height: 1.4;
          }
        }
      }

      // 时长选择
      .duration-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        :deep(.el-radio-button) {
          margin-right: 0;

          .el-radio-button__inner {
            width: 100%;
            border-radius: 6px;
            text-align: left;
          }
        }
      }

      // 大洲选择
      .continent-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      // 国家卡片网格（4列）
      .country-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-top: 15px;

        @media (max-width: 1400px) {
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        .country-card {
          border: 2px solid #dcdfe6;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.3s;
          cursor: pointer;
          background: #ffffff;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          }

          &.selected {
            border-color: #409eff;
            background: #e6f4ff;
          }

          .card-flag {
            display: flex;
            justify-content: center;
            margin-bottom: 12px;

            img {
              width: 60px;
              height: 45px;
              border-radius: 4px;
              object-fit: cover;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }

          .card-info {
            text-align: center;
            margin-bottom: 12px;

            .card-country {
              font-size: 15px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .card-city {
              font-size: 13px;
              color: #606266;
              margin-bottom: 6px;
            }

            .card-available {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }

            .card-price {
              font-size: 14px;
              font-weight: 600;
              color: #409eff;
            }
          }

          .card-quantity {
            display: flex;
            justify-content: center;

            :deep(.el-input-number) {
              width: 100%;
            }
          }
        }
      }
    }
  }

  // 支付面板
  .payment-panel {
    &.sticky-panel {
      position: sticky;
      top: 20px;
    }

    .card-header {
      font-weight: 600;
      color: #303133;
    }

    // 空状态
    .empty-selection {
      text-align: center;
      padding: 40px 20px;

      .empty-text {
        font-size: 16px;
        font-weight: 600;
        color: #909399;
        margin: 15px 0 8px;
      }

      .empty-hint {
        font-size: 13px;
        color: #c0c4cc;
        margin: 0;
      }
    }

    // 支付详情
    .payment-details {
      .order-details {
        h4 {
          margin: 0 0 15px 0;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .order-items {
          max-height: 300px;
          overflow-y: auto;

          .order-item {
            padding: 12px;
            border: 1px solid #ebeef5;
            border-radius: 6px;
            margin-bottom: 10px;

            &:last-child {
              margin-bottom: 0;
            }

            .item-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;

              .item-location {
                display: flex;
                align-items: center;
                gap: 8px;

                .flag-sm {
                  width: 24px;
                  height: 18px;
                  border-radius: 2px;
                  object-fit: cover;
                }

                .location-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                }
              }

              .item-count {
                font-size: 14px;
                font-weight: 600;
                color: #409eff;
              }
            }

            .item-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .item-price-label {
                font-size: 12px;
                color: #909399;
              }

              .item-price-value {
                font-size: 14px;
                font-weight: 600;
                color: #303133;
              }
            }
          }
        }
      }

      .price-summary {
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;

          .label {
            color: #606266;
          }

          .value {
            font-weight: 600;
            color: #303133;

            &.total {
              font-size: 20px;
              color: #409eff;
            }
          }

          &.highlight {
            padding: 12px 0;
            border-top: 1px dashed #dcdfe6;
            border-bottom: 1px dashed #dcdfe6;
            margin: 8px 0;
          }
        }
      }

      .payment-method {
        h4 {
          margin: 0 0 15px 0;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;

          :deep(.el-radio) {
            margin-right: 0;
            padding: 12px;
            border: 1px solid #dcdfe6;
            border-radius: 6px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background-color: #f0f7ff;
            }

            &.is-checked {
              border-color: #409eff;
              background-color: #e6f4ff;
            }

            .el-radio__label {
              width: 100%;
            }
          }

          .payment-option-content {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;

            .el-icon {
              font-size: 20px;
            }

            .balance-amount {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .balance-warning {
        margin: 15px 0;
      }

      .submit-btn {
        width: 100%;
        margin-top: 15px;
        height: 45px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

// 浅色主题适配
:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 16px 20px;
}

:deep(.el-divider) {
  margin: 20px 0;
  border-color: #ebeef5;
}
</style>
