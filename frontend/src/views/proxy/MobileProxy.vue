<template>
  <div class="mobile-proxy-container">
    <h1>移动代理</h1>

    <!-- 页面描述 -->
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <template #default>
        <div class="description">
          <p><strong>移动代理选择参考：</strong></p>
          <p>• 4G代理：适用于社交媒体营销、电商平台操作、数据采集等场景</p>
          <p>• 5G代理：提供更快速度和更低延迟，适合高频次操作和实时数据处理</p>
          <p>• 如需购买移动代理，请联系您的客服获取详细方案和报价</p>
        </div>
      </template>
    </el-alert>

    <!-- 移动代理类型选项 -->
    <el-row :gutter="20">
      <!-- 4G移动代理 -->
      <el-col :span="12">
        <el-card shadow="hover" class="proxy-type-card fourG">
          <template #header>
            <div class="card-header">
              <el-icon :size="32"><Cellphone /></el-icon>
              <h2>4G移动代理</h2>
            </div>
          </template>

          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>真实移动网络IP</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>高匿名性和可信度</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>支持社交媒体和电商平台</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>动态IP轮换</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>稳定的网络连接</span>
              </div>
            </div>

            <div class="pricing-info">
              <div class="price-tag">
                <span class="label">参考价格：</span>
                <span class="price">请联系客服</span>
              </div>
            </div>

            <el-button type="primary" size="large" class="contact-btn" disabled>
              <el-icon><ChatDotRound /></el-icon>
              请联系您的客服
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 5G移动代理 -->
      <el-col :span="12">
        <el-card shadow="hover" class="proxy-type-card fiveG">
          <template #header>
            <div class="card-header">
              <el-icon :size="32"><Connection /></el-icon>
              <h2>5G移动代理</h2>
            </div>
          </template>

          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>下一代移动网络IP</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>超低延迟和高带宽</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>更快的数据处理速度</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>支持高频次操作</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>适合实时业务场景</span>
              </div>
            </div>

            <div class="pricing-info">
              <div class="price-tag">
                <span class="label">参考价格：</span>
                <span class="price">请联系客服</span>
              </div>
            </div>

            <el-button type="primary" size="large" class="contact-btn" disabled>
              <el-icon><ChatDotRound /></el-icon>
              请联系您的客服
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 常见问题 -->
    <el-card shadow="hover" class="faq-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <el-icon><QuestionFilled /></el-icon>
          <span>常见问题</span>
        </div>
      </template>

      <el-collapse>
        <el-collapse-item title="什么是移动代理？" name="1">
          <p>移动代理使用真实的移动运营商网络IP（如4G/5G），模拟真实用户的移动设备访问行为，具有极高的匿名性和可信度，不易被目标网站识别和封禁。</p>
        </el-collapse-item>
        <el-collapse-item title="移动代理与普通代理的区别？" name="2">
          <p>• <strong>IP来源</strong>：移动代理来自真实移动运营商网络，普通代理多为数据中心IP</p>
          <p>• <strong>可信度</strong>：移动代理具有更高的可信度，不易被识别为代理</p>
          <p>• <strong>应用场景</strong>：移动代理更适合需要高匿名性的社交媒体、电商等场景</p>
        </el-collapse-item>
        <el-collapse-item title="移动代理的定价如何？" name="3">
          <p>移动代理采用定制化报价，根据您的具体需求（如IP数量、使用时长、地区等）提供专属方案。请联系您的客服获取详细报价。</p>
        </el-collapse-item>
        <el-collapse-item title="移动代理支持哪些地区？" name="4">
          <p>我们的移动代理支持全球主要国家和地区的4G/5G网络，具体可用地区请咨询您的客服。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  Cellphone,
  Connection,
  Check,
  ChatDotRound,
  QuestionFilled,
} from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
.mobile-proxy-container {
  padding: 20px;

  h1 {
    margin: 0 0 24px 0;
    color: #303133;
    font-size: 26px;
    font-weight: 600;
  }

  .description {
    p {
      margin: 8px 0;
      line-height: 1.8;
      color: #606266;

      strong {
        color: #303133;
        font-size: 15px;
      }
    }
  }

  .proxy-type-card {
    height: 100%;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    &.fourG {
      border-top: 4px solid #67c23a;
    }

    &.fiveG {
      border-top: 4px solid #409eff;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }

    .card-content {
      .feature-list {
        margin-bottom: 24px;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 15px;
          color: #606266;

          .el-icon {
            font-size: 18px;
            flex-shrink: 0;
          }
        }
      }

      .pricing-info {
        margin-bottom: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 8px;

        .price-tag {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .label {
            font-size: 14px;
            color: #606266;
          }

          .price {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }
        }
      }

      .contact-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }
    }
  }

  .faq-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .el-collapse {
      border: none;

      :deep(.el-collapse-item__header) {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        border-bottom: 1px solid #ebeef5;
        padding: 15px 0;
      }

      :deep(.el-collapse-item__content) {
        padding: 15px 0;
        color: #606266;
        line-height: 1.8;

        p {
          margin: 8px 0;

          strong {
            color: #303133;
          }
        }
      }
    }
  }
}

// ✅ 移动端响应式适配
@media (max-width: 768px) {
  .mobile-proxy-container {
    padding: 15px;

    h1 {
      font-size: 22px;
    }

    .el-row {
      .el-col {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 20px;
      }
    }

    .proxy-type-card {
      .card-header {
        h2 {
          font-size: 18px;
        }
      }

      .card-content {
        .feature-item {
          font-size: 14px;
        }

        .pricing-info {
          .price-tag {
            flex-direction: column;
            gap: 4px;

            .price {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}
</style>

