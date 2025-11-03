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
            <div class="ip-type-cards">
              <div 
                class="ip-type-card"
                :class="{ 'selected': ipType === 'shared' }"
                @click="ipType = 'shared'"
              >
                <div class="card-icon normal">
                  <el-icon :size="28"><Connection /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">普通</div>
                  <div class="card-desc">经过我们严格的高质量筛选程序，适合入门级广泛的商务场景。</div>
                </div>
              </div>
              <div 
                class="ip-type-card"
                :class="{ 'selected': ipType === 'premium' }"
                @click="ipType = 'premium'"
              >
                <div class="card-icon native">
                  <el-icon :size="28"><Star /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">原生</div>
                  <div class="card-desc">电子商务，旅游和社交媒体，领域最稳/需求最旺盛的IP。</div>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 时长选择 -->
          <div class="section">
            <h3>IP购买时长</h3>
            <el-radio-group v-model="duration" class="duration-group">
              <el-radio-button :label="30">30天</el-radio-button>
              <el-radio-button :label="60">60天</el-radio-button>
              <el-radio-button :label="90">90天</el-radio-button>
              <el-radio-button :label="180">180天</el-radio-button>
              <el-radio-button :label="360">360天</el-radio-button>
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

          <!-- 已选择IP时 - 985proxy风格 -->
          <div v-else class="payment-details-985">
            <!-- 支付详情 -->
            <div class="payment-info-section">
              <h4>支付详情</h4>
              
              <!-- 选中的IP明细列表 -->
              <div class="selected-items-list">
                <div v-for="item in selectedCountries" :key="`${item.name}-${item.city}`" class="selected-item">
                  <span class="item-location">
                    <span :class="`fi fi-${item.code.toLowerCase()}`" class="flag-icon"></span>
                    {{ item.name }} - {{ item.city }}
                  </span>
                  <span class="item-quantity">×{{ item.quantity }}</span>
                  <span class="item-price">${{ calculateItemPrice(item) }}</span>
                </div>
              </div>

              <el-divider style="margin: 12px 0" />
              
              <div class="info-row">
                <span class="info-label">总IP数</span>
                <span class="info-value">{{ totalSelectedCount }} IPs</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">有效时间</span>
                <span class="info-value">{{ duration }}天</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">总计费用</span>
                <span class="info-value">${{ totalPrice.toFixed(2) }}</span>
              </div>
              
              <div class="info-row promo">
                <span class="info-label">总计优惠</span>
                <el-link type="primary" :underline="false">使用优惠码</el-link>
                <span class="info-value">$ 0.00</span>
              </div>
            </div>

            <el-divider />

            <!-- 支付费用 -->
            <div class="payment-total">
              <div class="total-label">支付费用</div>
              <div class="total-amount">${{ totalPrice.toFixed(2) }}</div>
            </div>

            <el-divider />

            <!-- 支付方式 -->
            <div class="payment-method-section">
              <div class="method-label">支付方式</div>
              <el-button
                type="primary"
                size="large"
                class="wallet-pay-button"
                :loading="submitting"
                :disabled="!canSubmit"
                @click="handleSubmit"
              >
                <el-icon><Wallet /></el-icon>
                <span>钱包余额支付</span>
              </el-button>
              
              <div class="wallet-balance">
                <span>钱包余额</span>
                <span class="balance-value">${{ userBalance.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
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
import { purchaseStaticProxy } from '@/api/modules/proxy';

const router = useRouter();

// 国家数据（按大洲分类）- 使用 reactive 使其响应式
const countryData = reactive({
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
});

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

// 更新选择（quantity变化时触发）
const updateSelection = (value: number, oldValue: number) => {
  // 由于使用了 reactive，Vue 会自动追踪变化
  // 这里可以添加额外的逻辑，如日志记录
  console.log('数量变化:', {
    新值: value,
    旧值: oldValue,
    已选IP总数: totalSelectedCount.value,
    总价: totalPrice.value.toFixed(2)
  });
};

// 提交订单
const handleSubmit = async () => {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确认购买 ${totalSelectedCount.value} 个IP，共计 $${totalPrice.value.toFixed(2)}？\n\n余额将从 $${userBalance.value.toFixed(2)} 扣除至 $${(userBalance.value - totalPrice.value).toFixed(2)}`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true,
      }
    );

    submitting.value = true;

    // 准备购买数据
    const purchaseData = {
      channelName: businessScenario.value || '默认通道',
      scenario: businessScenario.value,
      ipType: ipType.value, // 'shared' or 'premium'
      duration: duration.value,
      items: selectedCountries.value.map(item => ({
        country: item.code,
        city: item.city,
        quantity: item.quantity,
      })),
    };

    // 调用后端API - 真实购买
    const response = await purchaseStaticProxy(purchaseData);

    // 购买成功
    ElMessage.success({
      message: `🎉 购买成功！已分配 ${response.order.totalQuantity} 个IP，订单号：${response.order.orderNo}`,
      duration: 5000,
      showClose: true,
    });

    // 刷新用户余额
    await userStore.fetchUserInfo();

    // 重置表单
    Object.values(countryData).flat().forEach((item) => {
      item.quantity = 0;
    });

    // 询问是否查看购买的IP
    await ElMessageBox.confirm(
      '购买成功！是否前往静态住宅管理页面查看？',
      '提示',
      {
        confirmButtonText: '去查看',
        cancelButtonText: '继续选购',
        type: 'success',
      }
    ).then(() => {
      router.push('/proxy/static/manage');
    }).catch(() => {
      // 用户选择继续选购
    });

  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      const errorMsg = error.response?.data?.message || error.message || '购买失败';
      
      // 余额不足的特殊处理
      if (errorMsg.includes('余额不足')) {
        await ElMessageBox.confirm(
          `❌ ${errorMsg}\n\n是否前往充值？`,
          '余额不足',
          {
            confirmButtonText: '去充值',
            cancelButtonText: '取消',
            type: 'error',
          }
        ).then(() => {
          router.push('/wallet/recharge');
        }).catch(() => {});
      } else {
        ElMessage.error({
          message: `购买失败：${errorMsg}`,
          duration: 5000,
          showClose: true,
        });
      }
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

      // IP类型选择 - 大卡片样式
      .ip-type-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;

        .ip-type-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          border: 2px solid #dcdfe6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          background: #ffffff;

          &:hover {
            border-color: #409eff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
          }

          &.selected {
            border-color: #409eff;
            background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
          }

          .card-icon {
            flex-shrink: 0;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &.normal {
              background: linear-gradient(135deg, #e1f3d8 0%, #d4f0c4 100%);
              color: #67c23a;
            }

            &.native {
              background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
              color: #409eff;
            }
          }

          .card-content {
            flex: 1;

            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 8px;
            }

            .card-desc {
              font-size: 13px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }
      }

      // 时长选择 - 水平按钮组
      .duration-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        :deep(.el-radio-button) {
          margin-right: 0;
          flex: 1;
          min-width: 140px;

          .el-radio-button__inner {
            width: 100%;
            border-radius: 6px;
            text-align: center;
            padding: 12px 16px;
            font-size: 14px;
            border: 1px solid #dcdfe6;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background-color: #f0f7ff;
            }
          }

          &.is-active .el-radio-button__inner {
            border-color: #409eff;
            background-color: #409eff;
            color: #ffffff;
            font-weight: 600;
          }
        }
      }

      // 大洲选择
      .continent-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        :deep(.el-radio-button) {
          .el-radio-button__inner {
            padding: 10px 20px;
            border-radius: 6px;
            border: 1px solid #dcdfe6;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background-color: #f0f7ff;
            }
          }

          &.is-active .el-radio-button__inner {
            border-color: #409eff;
            background-color: #409eff;
            color: #ffffff;
            font-weight: 600;
          }
        }
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

    // 支付详情 - 985proxy风格
    .payment-details-985 {
      padding: 10px 0;

      h4 {
        margin: 0 0 20px 0;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      // 选中IP明细列表
      .selected-items-list {
        margin-bottom: 12px;
        max-height: 200px;
        overflow-y: auto;
        
        .selected-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ebf0 100%);
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.3s;
          
          &:hover {
            background: linear-gradient(135deg, #e8ebf0 0%, #dfe3e9 100%);
            transform: translateX(2px);
          }
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .item-location {
            flex: 1;
            color: #303133;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            
            .flag-icon {
              width: 20px;
              height: 15px;
              border-radius: 2px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
            }
          }
          
          .item-quantity {
            margin: 0 16px;
            color: #909399;
            font-size: 12px;
            padding: 2px 8px;
            background: #fff;
            border-radius: 12px;
          }
          
          .item-price {
            color: #409eff;
            font-weight: 600;
            font-size: 14px;
            min-width: 60px;
            text-align: right;
          }
        }
      }

      .payment-info-section {
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;

          .info-label {
            font-size: 14px;
            color: #606266;
          }

          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }

          &.promo {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
            align-items: center;
          }
        }
      }

      .payment-total {
        text-align: center;
        padding: 20px 0;

        .total-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .total-amount {
          font-size: 36px;
          font-weight: bold;
          color: #409eff;
        }
      }

      .payment-method-section {
        .method-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 15px;
        }

        .wallet-pay-button {
          width: 100%;
          height: 50px;
          font-size: 16px;
          margin-bottom: 15px;

          .el-icon {
            margin-right: 8px;
          }
        }

        .wallet-balance {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-size: 14px;
          color: #606266;

          .balance-value {
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }

    // 旧版支付详情（保留作为备份）
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
