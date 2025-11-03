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
          <div class="package-price">
            <span class="amount">${{ pkg.price }}</span>
            <span class="period">/ {{ pkg.period }}</span>
          </div>
          <div class="package-unit-price">${{ pkg.unitPrice }}/GB</div>
          
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
            立即购买
          </el-button>
        </el-card>
      </div>

      <!-- 住宅IP类型说明 -->
      <el-card class="ip-type-info" shadow="never">
        <h4>住宅IP类型说明</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-block">
              <div class="info-icon normal">
                <el-icon><Location /></el-icon>
              </div>
              <div class="info-content">
                <h5>普通 (Shared)</h5>
                <p>经过我们严格的高质量筛选程序，适合入门级广泛的商务场景。</p>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-block">
              <div class="info-icon native">
                <el-icon><Star /></el-icon>
              </div>
              <div class="info-content">
                <h5>原生 (Native)</h5>
                <p>本地真实住宅IP，旅游和社交媒体，领域最稳/需求最旺盛的IP。</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 热门业务场景 -->
      <el-card class="business-scenarios" shadow="never">
        <h4>热门业务场景</h4>
        <el-row :gutter="20">
          <el-col :span="8" v-for="scenario in scenarios" :key="scenario.name">
            <div class="scenario-card">
              <div class="scenario-icon">
                <el-icon>
                  <component :is="scenario.icon" />
                </el-icon>
              </div>
              <div class="scenario-name">{{ scenario.name }}</div>
              <div class="scenario-desc">{{ scenario.desc }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  ChatDotRound, 
  Check, 
  Location, 
  Star,
  ShoppingCart,
  Monitor,
  TrendCharts
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
]);

// 业务场景
const scenarios = ref([
  {
    name: '电商采集',
    desc: '商品价格监控、库存跟踪、竞品分析',
    icon: 'ShoppingCart',
  },
  {
    name: '社交媒体',
    desc: '账号管理、内容发布、数据统计',
    icon: 'Monitor',
  },
  {
    name: 'SEO优化',
    desc: '搜索排名监控、关键词分析、竞争对手追踪',
    icon: 'TrendCharts',
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
      }

      .package-unit-price {
        font-size: 14px;
        color: #67c23a;
        margin-bottom: 20px;
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

  // IP类型说明
  .ip-type-info {
    margin-bottom: 30px;

    h4 {
      margin: 0 0 20px 0;
      font-size: 16px;
    }

    .info-block {
      display: flex;
      gap: 15px;
      align-items: flex-start;

      .info-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;

        &.normal {
          background-color: #e1f3d8;
          color: #67c23a;
        }

        &.native {
          background-color: #f0f9ff;
          color: #409eff;
        }
      }

      .info-content {
        flex: 1;

        h5 {
          margin: 0 0 8px 0;
          font-size: 15px;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #909399;
          line-height: 1.5;
        }
      }
    }
  }

  // 业务场景
  .business-scenarios {
    h4 {
      margin: 0 0 20px 0;
      font-size: 16px;
    }

    .scenario-card {
      text-align: center;
      padding: 20px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
      }

      .scenario-icon {
        font-size: 40px;
        color: #409eff;
        margin-bottom: 15px;
      }

      .scenario-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #303133;
      }

      .scenario-desc {
        font-size: 13px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }
}
</style>
