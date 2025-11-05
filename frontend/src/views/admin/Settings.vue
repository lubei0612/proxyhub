<template>
  <div class="admin-settings-container">
    <h1>系统设置</h1>

    <el-row :gutter="20">
      <!-- 左侧：系统配置 -->
      <el-col :span="16">
        <!-- 价格配置 -->
        <el-card shadow="hover" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>价格配置</span>
            </div>
          </template>

          <el-form label-width="150px">
            <el-form-item label="普通IP价格">
              <el-input-number
                v-model="priceSettings.sharedPrice"
                :min="0"
                :step="0.1"
                :precision="2"
              />
              <span class="unit">USD/IP/月</span>
            </el-form-item>

            <el-form-item label="原生IP价格">
              <el-input-number
                v-model="priceSettings.premiumPrice"
                :min="0"
                :step="0.1"
                :precision="2"
              />
              <span class="unit">USD/IP/月</span>
            </el-form-item>

            <el-form-item label="汇率（USD→CNY）">
              <el-input-number
                v-model="priceSettings.exchangeRate"
                :min="0"
                :step="0.01"
                :precision="4"
              />
              <span class="unit">CNY</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePriceSettings" :loading="saving">
                <el-icon><Check /></el-icon>
                保存价格配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 充值设置 -->
        <el-card shadow="hover" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>充值设置</span>
            </div>
          </template>

          <el-form label-width="150px">
            <el-form-item label="最小充值金额">
              <el-input-number
                v-model="rechargeSettings.minAmount"
                :min="1"
                :step="1"
              />
              <span class="unit">USD</span>
            </el-form-item>

            <el-form-item label="最大充值金额">
              <el-input-number
                v-model="rechargeSettings.maxAmount"
                :min="1"
                :step="100"
              />
              <span class="unit">USD</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveRechargeSettings" :loading="saving">
                <el-icon><Check /></el-icon>
                保存充值设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 客服设置 -->
        <el-card shadow="hover" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>客服设置</span>
            </div>
          </template>

          <el-form label-width="150px">
            <el-form-item label="客服1用户名">
              <el-input
                v-model="serviceSettings.telegram1"
                placeholder="Telegram用户名"
              />
            </el-form-item>

            <el-form-item label="客服1链接">
              <el-input
                v-model="serviceSettings.telegram1Link"
                placeholder="https://t.me/username"
              />
            </el-form-item>

            <el-divider />

            <el-form-item label="客服2用户名">
              <el-input
                v-model="serviceSettings.telegram2"
                placeholder="Telegram用户名"
              />
            </el-form-item>

            <el-form-item label="客服2链接">
              <el-input
                v-model="serviceSettings.telegram2Link"
                placeholder="https://t.me/username"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveServiceSettings" :loading="saving">
                <el-icon><Check /></el-icon>
                保存客服设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：系统信息 -->
      <el-col :span="8">
        <!-- 系统统计 -->
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>系统统计</span>
            </div>
          </template>

          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-label">总用户数</div>
              <div class="stat-value">{{ systemStats.totalUsers }}</div>
            </div>

            <el-divider />

            <div class="stat-item">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ systemStats.activeUsers }}</div>
            </div>

            <el-divider />

            <div class="stat-item">
              <div class="stat-label">总代理IP</div>
              <div class="stat-value">{{ systemStats.totalProxies }}</div>
            </div>

            <el-divider />

            <div class="stat-item">
              <div class="stat-label">今日订单</div>
              <div class="stat-value">{{ systemStats.todayOrders }}</div>
            </div>

            <el-divider />

            <div class="stat-item">
              <div class="stat-label">今日收入</div>
              <div class="stat-value">${{ systemStats.todayIncome.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>

        <!-- 系统信息 -->
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统名称">
              ProxyHub
            </el-descriptions-item>
            <el-descriptions-item label="系统版本">
              v1.0.0
            </el-descriptions-item>
            <el-descriptions-item label="后端版本">
              NestJS 10.0
            </el-descriptions-item>
            <el-descriptions-item label="前端版本">
              Vue 3.4
            </el-descriptions-item>
            <el-descriptions-item label="数据库">
              PostgreSQL 14
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 快捷操作 -->
        <el-card shadow="hover" class="actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>

          <div class="action-list">
            <el-button type="primary" @click="$router.push('/admin/recharge-approval')" style="width: 100%">
              <el-icon><DocumentChecked /></el-icon>
              充值审核
            </el-button>
            <el-button type="success" @click="$router.push('/admin/users')" style="width: 100%">
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
            <el-button type="info" @click="$router.push('/admin/orders')" style="width: 100%">
              <el-icon><Document /></el-icon>
              订单管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, DocumentChecked, User, Document } from '@element-plus/icons-vue';
import { getSystemSettings, updateSystemSetting, getAdminStatistics } from '@/api/modules/admin';

// 价格配置
const priceSettings = ref({
  sharedPrice: 5.0,
  premiumPrice: 8.0,
  exchangeRate: 7.25,
});

// 充值配置
const rechargeSettings = ref({
  minAmount: 1,
  maxAmount: 10000,
});

// 客服配置
const serviceSettings = ref({
  telegram1: 'lubei12',
  telegram1Link: 'https://t.me/lubei12',
  telegram2: 'lubei12',
  telegram2Link: 'https://t.me/lubei12',
});

// 系统统计
const systemStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalProxies: 0,
  todayOrders: 0,
  todayIncome: 0,
});

const saving = ref(false);

// 保存价格配置
const savePriceSettings = async () => {
  try {
    saving.value = true;
    
    // 调用API保存每个配置项
    await Promise.all([
      updateSystemSetting('sharedPrice', priceSettings.value.sharedPrice.toString()),
      updateSystemSetting('premiumPrice', priceSettings.value.premiumPrice.toString()),
      updateSystemSetting('exchangeRate', priceSettings.value.exchangeRate.toString()),
    ]);

    ElMessage.success('价格配置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 保存充值配置
const saveRechargeSettings = async () => {
  try {
    saving.value = true;
    
    // 调用API保存每个配置项
    await Promise.all([
      updateSystemSetting('minRechargeAmount', rechargeSettings.value.minAmount.toString()),
      updateSystemSetting('maxRechargeAmount', rechargeSettings.value.maxAmount.toString()),
    ]);

    ElMessage.success('充值设置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 保存客服配置
const saveServiceSettings = async () => {
  try {
    saving.value = true;
    
    // 调用API保存每个配置项
    await Promise.all([
      updateSystemSetting('telegram1', serviceSettings.value.telegram1),
      updateSystemSetting('telegram1Link', serviceSettings.value.telegram1Link),
      updateSystemSetting('telegram2', serviceSettings.value.telegram2),
      updateSystemSetting('telegram2Link', serviceSettings.value.telegram2Link),
    ]);

    ElMessage.success('客服设置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 加载系统设置
const loadSettings = async () => {
  try {
    const settings = await getSystemSettings();
    
    // 加载价格配置
    if (settings.sharedPrice) priceSettings.value.sharedPrice = parseFloat(settings.sharedPrice);
    if (settings.premiumPrice) priceSettings.value.premiumPrice = parseFloat(settings.premiumPrice);
    if (settings.exchangeRate) priceSettings.value.exchangeRate = parseFloat(settings.exchangeRate);
    
    // 加载充值配置
    if (settings.minRechargeAmount) rechargeSettings.value.minAmount = parseInt(settings.minRechargeAmount);
    if (settings.maxRechargeAmount) rechargeSettings.value.maxAmount = parseInt(settings.maxRechargeAmount);
    
    // 加载客服配置
    if (settings.telegram1) serviceSettings.value.telegram1 = settings.telegram1;
    if (settings.telegram1Link) serviceSettings.value.telegram1Link = settings.telegram1Link;
    if (settings.telegram2) serviceSettings.value.telegram2 = settings.telegram2;
    if (settings.telegram2Link) serviceSettings.value.telegram2Link = settings.telegram2Link;
  } catch (error: any) {
    console.error('[Settings] 加载失败:', error);
    ElMessage.warning('加载系统设置失败，使用默认值');
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const stats = await getAdminStatistics();
    
    // 更新统计数据
    systemStats.value.totalUsers = stats.users?.total || 0;
    systemStats.value.activeUsers = stats.users?.active || 0;
    systemStats.value.totalProxies = stats.proxies?.total || 0;
    systemStats.value.todayOrders = stats.orders?.today || 0;
    systemStats.value.todayIncome = parseFloat(stats.revenue?.today || '0');
  } catch (error: any) {
    console.error('[Settings] 加载统计数据失败:', error);
    // 不显示错误消息，使用默认值0
  }
};

onMounted(() => {
  loadSettings();
  loadStatistics();
});
</script>

<style scoped lang="scss">
.admin-settings-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .settings-card,
  .stats-card,
  .info-card,
  .actions-card {
    margin-bottom: 20px;
  }

  .card-header {
    font-weight: 600;
    color: #303133;
  }

  .unit {
    margin-left: 10px;
    color: #909399;
    font-size: 14px;
  }

  .stats-list {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;

      .stat-label {
        font-size: 14px;
        color: #606266;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .el-button {
      padding: 15px 20px;
      font-size: 15px;
    }
  }
}

:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 16px 20px;
}
</style>
