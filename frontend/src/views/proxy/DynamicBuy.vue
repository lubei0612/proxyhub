<template>
  <div class="dynamic-buy-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>动态住宅IP管理</h3>
          <el-button type="primary" @click="contactService">
            <el-icon><ChatDotRound /></el-icon>
            联系客服购买套餐
          </el-button>
        </div>
      </template>

      <!-- 套餐卡片 -->
      <div class="package-cards">
        <el-card 
          v-for="pkg in packages" 
          :key="pkg.id"
          class="package-card"
          :class="{ 'hot': pkg.isHot }"
          shadow="hover"
        >
          <el-tag v-if="pkg.isHot" class="hot-tag" type="danger" effect="dark">热门</el-tag>
          
          <div class="package-name">{{ pkg.name }}</div>
          <div class="package-price" v-if="!pkg.isEnterprise">
            <span class="amount">${{ pkg.price }}</span>
            <span class="period">/ {{ pkg.period }}</span>
          </div>
          <div class="package-price enterprise" v-else>
            <span class="amount">{{ pkg.price }}</span>
          </div>
          <div class="package-unit-price" v-if="!pkg.isEnterprise">${{ pkg.unitPrice }}/GB</div>
          <div class="package-unit-price enterprise" v-else>{{ pkg.unitPrice }}</div>
          
          <el-divider />
          
          <div class="package-features">
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>{{ pkg.sessions }}</span>
            </div>
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>城市级定位</span>
            </div>
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>1-1440min自定义IP时效</span>
            </div>
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>流量不过期</span>
            </div>
          </div>
          
          <el-button 
            type="primary" 
            class="buy-button"
            @click="contactService"
          >
            联系客服
          </el-button>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  ChatDotRound, 
  Check
} from '@element-plus/icons-vue';

// 套餐数据
const packages = ref([
  {
    id: 1,
    name: '现收现付',
    price: 0,
    period: '免费',
    unitPrice: '5',
    sessions: '无限制',
    isHot: false,
  },
  {
    id: 2,
    name: '个人',
    price: 150,
    period: '365 天',
    unitPrice: '4.5',
    sessions: '无限制',
    isHot: false,
  },
  {
    id: 3,
    name: '商务',
    price: 450,
    period: '365 天',
    unitPrice: '4',
    sessions: '无限制',
    isHot: true,
  },
  {
    id: 4,
    name: '高级',
    price: 1200,
    period: '365 天',
    unitPrice: '3.6',
    sessions: '无限制',
    isHot: false,
  },
  {
    id: 5,
    name: '企业定制',
    price: '大客户',
    period: '',
    unitPrice: '联系客服',
    sessions: '无限制',
    isHot: false,
    isEnterprise: true,
  },
]);

// 联系客服
const contactService = () => {
  window.open('https://t.me/lubei12', '_blank');
  ElMessage.info('正在跳转至Telegram客服...');
};
</script>

<style scoped lang="scss">
.dynamic-buy-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  // 套餐卡片
  .package-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .package-card {
      position: relative;
      text-align: center;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      &.hot {
        border: 2px solid #f56c6c;
      }

      .hot-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .package-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .package-price {
        margin-bottom: 5px;

        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
        }

        .period {
          font-size: 14px;
          color: #909399;
        }

        &.enterprise {
          .amount {
            font-size: 24px;
            color: #606266;
          }
        }
      }

      .package-unit-price {
        font-size: 14px;
        color: #67c23a;
        margin-bottom: 20px;

        &.enterprise {
          color: #409eff;
          font-weight: 600;
        }
      }

      .package-features {
        margin: 20px 0;
        text-align: left;

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: #606266;

          .el-icon {
            color: #67c23a;
          }
        }
      }

      .buy-button {
        width: 100%;
      }
    }
  }
}
</style>
