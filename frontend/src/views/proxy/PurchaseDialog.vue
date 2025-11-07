<template>
  <el-dialog
    v-model="visible"
    title="购买静态住宅IP"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-steps :active="currentStep" finish-status="success" align-center class="purchase-steps">
      <el-step title="选择IP" />
      <el-step title="价格确认" />
      <el-step title="完成购买" />
    </el-steps>

    <!-- Step 1: 选择IP -->
    <div v-if="currentStep === 0" class="step-content">
      <el-form :model="form" label-width="120px">
        <el-form-item label="IP类型">
          <el-radio-group v-model="form.ipType" @change="handleIpTypeChange">
            <el-radio label="shared">共享IP（便宜）</el-radio>
            <el-radio label="premium">原生IP（贵）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="购买时长">
          <el-select v-model="form.duration" placeholder="选择时长" @change="loadInventory">
            <el-option label="30天" :value="30" />
            <el-option label="60天" :value="60" />
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">
          <el-icon><ShoppingCart /></el-icon>
          可用库存
        </el-divider>

        <el-alert
          v-if="inventoryLoading"
          title="正在加载库存..."
          type="info"
          :closable="false"
          show-icon
        />

        <div v-else-if="inventory.length > 0" class="inventory-grid">
          <el-card
            v-for="item in inventory"
            :key="`${item.country}-${item.city}`"
            shadow="hover"
            class="inventory-card"
            :class="{ selected: isLocationSelected(item) }"
            @click="toggleLocation(item)"
          >
            <div class="inventory-header">
              <img :src="getFlagUrl(item.countryCode)" class="flag-icon" />
              <span class="country-name">{{ item.country }}</span>
            </div>
            <div class="inventory-body">
              <div class="city-name">{{ item.city || '全国' }}</div>
              <div class="stock-info">
                <el-tag type="success">库存: {{ item.stock }}</el-tag>
                <el-tag type="warning">${{ item.price }}/月</el-tag>
              </div>
              <div class="quantity-selector" v-if="isLocationSelected(item)" @click.stop>
                <el-input-number
                  :model-value="getLocationQuantity(item)"
                  :min="1"
                  :max="Math.min(item.stock, 100)"
                  size="small"
                  @update:model-value="updateLocationQuantity(item, $event)"
                />
              </div>
            </div>
          </el-card>
        </div>

        <el-empty v-else description="暂无可用库存" />

        <el-divider />

        <el-form-item label="已选择">
          <el-tag
            v-for="loc in form.locations"
            :key="`${loc.country}-${loc.city}`"
            closable
            @close="removeLocation(loc)"
            class="location-tag"
          >
            {{ loc.country }} - {{ loc.city || '全国' }} x {{ loc.quantity }}
          </el-tag>
          <span v-if="form.locations.length === 0" class="text-secondary">
            请点击上方库存卡片选择
          </span>
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 2: 价格确认 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-alert
        title="正在计算价格，请稍候..."
        type="info"
        :closable="false"
        v-if="priceLoading"
        show-icon
      />

      <div v-else-if="priceData" class="price-summary">
        <el-descriptions title="订单明细" :column="2" border>
          <el-descriptions-item label="IP类型">
            {{ form.ipType === 'shared' ? '共享IP' : '原生IP' }}
          </el-descriptions-item>
          <el-descriptions-item label="购买时长">
            {{ form.duration }} 天
          </el-descriptions-item>
          <el-descriptions-item label="购买数量" :span="2">
            {{ totalQuantity }} 个IP
          </el-descriptions-item>
        </el-descriptions>

        <el-table :data="priceData.breakdown" border style="margin-top: 20px">
          <el-table-column prop="country" label="国家/地区" width="150" />
          <el-table-column prop="city" label="城市" width="120">
            <template #default="{ row }">
              {{ row.city || '全国' }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
              ${{ row.unitPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" align="right">
            <template #default="{ row }">
              ${{ row.subtotal.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="total-price">
          <el-statistic title="总计" :value="priceData.amount" prefix="$" :precision="2" />
        </div>
      </div>
    </div>

    <!-- Step 3: 完成购买 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-result
        icon="success"
        title="购买成功！"
        sub-title="您的静态IP已成功购买并分配"
      >
        <template #extra>
          <el-button type="primary" @click="handleViewIPs">查看我的IP</el-button>
          <el-button @click="handleClose">关闭</el-button>
        </template>
      </el-result>

      <!-- 显示购买的IP详情 -->
      <el-card v-if="purchaseResult" class="purchase-result-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#67C23A" :size="20"><SuccessFilled /></el-icon>
            <span style="margin-left: 10px;">购买详情</span>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ purchaseResult.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="支付金额">${{ purchaseResult.totalPrice }}</el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ purchaseResult.totalQuantity }} 个IP</el-descriptions-item>
          <el-descriptions-item label="购买时长">{{ purchaseResult.duration }} 天</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">已分配的IP</el-divider>
        
        <el-table :data="purchaseResult.allocatedIPs" border size="small" style="margin-top: 15px;">
          <el-table-column prop="ip" label="IP地址" width="140" />
          <el-table-column prop="port" label="端口" width="80" align="center" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="password" label="密码" width="130" />
          <el-table-column prop="country" label="国家" width="80" align="center" />
          <el-table-column prop="cityName" label="城市" />
        </el-table>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="currentStep > 0 && currentStep < 2"
          @click="handlePrevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep === 0"
          type="primary"
          :disabled="form.locations.length === 0"
          @click="handleNextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 1"
          type="primary"
          :loading="purchasing"
          @click="handlePurchase"
        >
          {{ purchasing ? '正在连接985Proxy...' : '确认购买' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getInventory, calculatePrice, purchaseStaticProxy, checkOrderStatus } from '@/api/modules/proxy985';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const currentStep = ref(0);
const form = ref({
  ipType: 'shared',
  duration: 30,
  locations: [] as Array<{ country: string; city: string; quantity: number }>,
});

const inventory = ref<any[]>([]);
const inventoryLoading = ref(false);
const priceData = ref<any>(null);
const priceLoading = ref(false);
const purchasing = ref(false);
const orderStatus = ref<any>(null);
const purchaseResult = ref<any>(null);

const totalQuantity = computed(() => {
  return form.value.locations.reduce((sum, loc) => sum + loc.quantity, 0);
});

// 加载库存
const loadInventory = async () => {
  if (!form.value.duration) return;
  
  inventoryLoading.value = true;
  try {
    const response = await getInventory(form.value.ipType, form.value.duration);
    
    // 转换API返回的数据格式
    const countries = response.countries || [];
    inventory.value = countries.flatMap((country: any) => 
      country.cities.map((city: any) => ({
        country: country.countryName,
        countryCode: country.countryCode,
        city: city.cityName,
        stock: city.stock,
        price: country.price,
      }))
    );
    
    console.log('[Inventory]', inventory.value.length, 'items loaded');
  } catch (error: any) {
    console.error('[Inventory] Load failed:', error);
    ElMessage.error('加载库存失败: ' + (error.message || '请稍后重试'));
    inventory.value = [];
  } finally {
    inventoryLoading.value = false;
  }
};

// IP类型变更
const handleIpTypeChange = () => {
  form.value.locations = [];
  loadInventory();
};

// 判断位置是否已选择
const isLocationSelected = (item: any) => {
  return form.value.locations.some(
    loc => loc.country === item.country && loc.city === item.city
  );
};

// 切换位置选择
const toggleLocation = (item: any) => {
  const index = form.value.locations.findIndex(
    loc => loc.country === item.country && loc.city === item.city
  );
  
  if (index >= 0) {
    form.value.locations.splice(index, 1);
  } else {
    form.value.locations.push({
      country: item.country,
      city: item.city || '',
      quantity: 1,
    });
  }
};

// 获取位置数量
const getLocationQuantity = (item: any) => {
  const loc = form.value.locations.find(
    l => l.country === item.country && l.city === item.city
  );
  return loc?.quantity || 1;
};

// 更新位置数量
const updateLocationQuantity = (item: any, quantity: number) => {
  const loc = form.value.locations.find(
    l => l.country === item.country && l.city === item.city
  );
  if (loc) {
    loc.quantity = quantity;
  }
};

// 移除位置
const removeLocation = (location: any) => {
  const index = form.value.locations.findIndex(
    loc => loc.country === location.country && loc.city === location.city
  );
  if (index >= 0) {
    form.value.locations.splice(index, 1);
  }
};

// 下一步
const handleNextStep = async () => {
  if (currentStep.value === 0) {
    // 计算价格
    priceLoading.value = true;
    try {
      const response = await calculatePrice({
        productType: 'static_residential',
        duration: form.value.duration,
        locations: form.value.locations,
      });
      priceData.value = response.data;
      currentStep.value = 1;
    } catch (error: any) {
      ElMessage.error('价格计算失败: ' + (error.message || '请稍后重试'));
    } finally {
      priceLoading.value = false;
    }
  }
};

// 上一步
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 确认购买
const handlePurchase = async () => {
  purchasing.value = true;
  try {
    const response = await purchaseStaticProxy({
      ipType: form.value.ipType as 'shared' | 'premium',
      duration: form.value.duration,
      items: form.value.locations.map(loc => ({
        country: loc.country,
        city: loc.city,
        quantity: loc.quantity,
      })),
      channelName: '默认通道',
    });
    
    // 保存购买结果（包含IP详情）
    purchaseResult.value = response.data.order;
    
    currentStep.value = 2;
    ElMessage.success({
      message: `购买成功！已分配 ${response.data.order.totalQuantity} 个IP`,
      duration: 5000,
    });
    
    emit('success');
    
  } catch (error: any) {
    // 显示详细错误信息
    let errorMessage = '购买失败';
    if (error.response?.data?.message) {
      errorMessage += ': ' + error.response.data.message;
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }
    
    // 根据错误类型提供解决方案
    if (errorMessage.includes('余额不足')) {
      ElMessage.error({
        message: errorMessage + ' - 请先充值',
        duration: 5000,
      });
    } else if (errorMessage.includes('库存不足')) {
      ElMessage.error({
        message: errorMessage + ' - 请减少购买数量或选择其他地区',
        duration: 5000,
      });
    } else if (errorMessage.includes('985Proxy')) {
      ElMessage.error({
        message: errorMessage + ' - 请联系客服或稍后重试',
        duration: 5000,
      });
    } else {
      ElMessage.error({
        message: errorMessage + ' - 请检查网络连接或联系客服',
        duration: 5000,
      });
    }
  } finally {
    purchasing.value = false;
  }
};

// 轮询订单状态
const pollOrderStatus = async (orderNo: string) => {
  let attempts = 0;
  const maxAttempts = 30; // 最多30次，每次5秒
  
  const poll = async () => {
    try {
      const response = await checkOrderStatus(orderNo);
      orderStatus.value = response.data;
      
      if (response.data.status === 'completed') {
        ElMessage.success('IP分配完成！');
        emit('success');
        return;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 5000); // 5秒后再次检查
      } else {
        ElMessage.warning('订单处理时间较长，请稍后在"我的IP"中查看');
      }
    } catch (error) {
      console.error('[Poll Order] Error:', error);
    }
  };
  
  setTimeout(poll, 5000); // 5秒后开始第一次检查
};

// 查看我的IP
const handleViewIPs = () => {
  emit('success');
  handleClose();
};

// 关闭对话框
const handleClose = () => {
  visible.value = false;
  // 重置表单
  setTimeout(() => {
    currentStep.value = 0;
    form.value = {
      ipType: 'shared',
      duration: 30,
      locations: [],
    };
    inventory.value = [];
    priceData.value = null;
    orderStatus.value = null;
  }, 300);
};

// 获取国旗URL
const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    loadInventory();
  }
});
</script>

<style scoped lang="scss">
.purchase-steps {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.inventory-card {
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.selected {
    border: 2px solid #409eff;
    background: #ecf5ff;
  }
}

.inventory-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  
  .flag-icon {
    width: 24px;
    height: auto;
    border-radius: 2px;
  }
  
  .country-name {
    font-weight: 600;
    font-size: 16px;
  }
}

.inventory-body {
  .city-name {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
  }
  
  .stock-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .quantity-selector {
    display: flex;
    justify-content: center;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
}

.location-tag {
  margin-right: 10px;
  margin-bottom: 5px;
}

.price-summary {
  .total-price {
    margin-top: 30px;
    text-align: right;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

.order-timeline {
  margin-top: 30px;
}

.text-secondary {
  color: #909399;
  font-size: 14px;
}
</style>

