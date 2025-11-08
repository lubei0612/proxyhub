<template>
  <div class="dedicated-proxy-container">
    <h1>专线代理</h1>

    <!-- 页面描述 -->
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <template #default>
        <div class="description">
          <p><strong>专线代理选择参考：</strong></p>
          <p>• 短视频专线：适用于TikTok、YouTube Shorts等短视频平台内容采集和账号运营</p>
          <p>• 直播专线：适用于直播平台推流、观看和互动场景，提供更稳定的网络质量</p>
          <p>• 如需购买专线代理，请联系您的客服获取详细方案和报价</p>
        </div>
      </template>
    </el-alert>

    <!-- 专线类型选项 -->
    <el-row :gutter="20">
      <!-- 短视频专线 -->
      <el-col :span="12">
        <el-card shadow="hover" class="proxy-type-card short-video">
          <template #header>
            <div class="card-header">
              <el-icon :size="32"><VideoPlay /></el-icon>
              <h2>短视频专线</h2>
            </div>
          </template>

          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>专为短视频平台优化</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>支持TikTok、YouTube Shorts等平台</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>高并发内容采集能力</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67c23a"><Check /></el-icon>
                <span>账号批量运营支持</span>
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

      <!-- 直播专线 -->
      <el-col :span="12">
        <el-card shadow="hover" class="proxy-type-card live-streaming">
          <template #header>
            <div class="card-header">
              <el-icon :size="32"><VideoCameraFilled /></el-icon>
              <h2>直播专线</h2>
            </div>
          </template>

          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>专为直播场景优化</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>低延迟高带宽保障</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>支持推流和观看场景</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>稳定的直播连接质量</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409eff"><Check /></el-icon>
                <span>支持实时互动操作</span>
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
        <el-collapse-item title="什么是专线代理？" name="1">
          <p>专线代理是为特定业务场景优化的定制化代理服务，提供更高的稳定性、更快的速度和更专业的技术支持。</p>
        </el-collapse-item>
        <el-collapse-item title="如何选择短视频专线还是直播专线？" name="2">
          <p>• <strong>短视频专线</strong>：适合需要批量采集短视频内容、运营多个账号的场景</p>
          <p>• <strong>直播专线</strong>：适合需要进行直播推流、观看或互动的场景，对延迟和带宽要求更高</p>
        </el-collapse-item>
        <el-collapse-item title="专线代理的定价如何？" name="3">
          <p>专线代理采用定制化报价，根据您的具体需求（如带宽、IP数量、使用时长等）提供专属方案。请联系您的客服获取详细报价。</p>
        </el-collapse-item>
        <el-collapse-item title="专线代理支持哪些地区？" name="4">
          <p>我们的专线代理支持全球主要国家和地区，具体可用地区请咨询您的客服。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  VideoPlay,
  VideoCameraFilled,
  Check,
  ChatDotRound,
  QuestionFilled,
} from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
.dedicated-proxy-container {
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

    &.short-video {
      border-top: 4px solid #67c23a;
    }

    &.live-streaming {
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
  .dedicated-proxy-container {
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

