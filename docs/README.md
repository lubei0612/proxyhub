# 📚 ProxyHub 文档中心

> **所有项目文档统一存放在此目录**  
> 最后更新：2025-11-07

---

## 📂 目录结构

```
docs/
├── 📁 reports/              # 项目报告和进度文档
├── 📁 archive/              # 历史文档归档
├── 📁 archived/             # 旧文档存档
├── 📁 spec-workflow/        # Spec工作流相关
├── 📁 test-reports/         # 测试报告
├── 📁 verification-reports/ # 验证报告
├── 📁 CODE-REFERENCE/       # 代码参考
├── 📁 UI-REFERENCE/         # UI参考
├── 📄 PROJECT-GUIDE.md      # 🎯 项目开发指南（重要）
├── 📄 TASK-REMOVE-MOCK-DATA.md  # 清理模拟数据任务
├── 📄 README-文档索引.md    # 详细文档索引
└── ...（其他文档）
```

---

## 🚀 快速导航

### 📌 必读文档

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [PROJECT-GUIDE.md](PROJECT-GUIDE.md) | 项目开发指南、规范、性能优化 | ⭐⭐⭐ |
| [TASK-REMOVE-MOCK-DATA.md](TASK-REMOVE-MOCK-DATA.md) | 清理模拟数据任务清单 | ⭐⭐⭐ |
| [QUICK_START.md](QUICK_START.md) | 快速启动指南 | ⭐⭐ |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 部署说明 | ⭐⭐ |

### 📊 最新报告

| 报告 | 日期 | 描述 |
|------|------|------|
| [reports/PROGRESS-2025-11-07.md](reports/PROGRESS-2025-11-07.md) | 2025-11-07 | 项目进度更新 |
| [reports/SUMMARY-2025-11-06.md](reports/SUMMARY-2025-11-06.md) | 2025-11-06 | 项目总结 |

### 🔧 技术文档

- **部署相关**
  - [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Docker部署指南
  - [DEPLOY-WITH-ENV-TEMPLATE.md](DEPLOY-WITH-ENV-TEMPLATE.md) - 环境变量配置
  - [DOCKER-ENV-LOADING-FIX.md](DOCKER-ENV-LOADING-FIX.md) - Docker环境变量修复
  - [腾讯云部署指南.md](腾讯云部署指南.md) - 腾讯云部署

- **问题排查**
  - [QUICK-FIX-WHITSCREEN.md](QUICK-FIX-WHITSCREEN.md) - 前端白屏修复
  - [CLEAN-MOCK-DATA.md](CLEAN-MOCK-DATA.md) - 清理模拟数据
  - [login-fix-report.md](login-fix-report.md) - 登录问题修复

- **API文档**
  - [985Proxy 开放 API 文档.md](985Proxy%20开放%20API%20文档.md) - 985Proxy API
  - [API文档使用指南.md](API文档使用指南.md) - API使用说明
  - [Zone配置说明-985Proxy.md](Zone配置说明-985Proxy.md) - Zone配置

### 🧪 测试文档

- [test-reports/](test-reports/) - 测试报告目录
- [verification-reports/](verification-reports/) - 验证报告目录
- [ACCEPTANCE_TEST.md](ACCEPTANCE_TEST.md) - 验收测试

### 📋 项目管理

- [tasks.md](tasks.md) - 任务清单
- [requirements.md](requirements.md) - 需求文档
- [design.md](design.md) - 设计文档
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - 实施指南

---

## 🎯 开发指南核心要点

来自 [PROJECT-GUIDE.md](PROJECT-GUIDE.md)：

### ⚡ 性能优化原则

**每次开发前必须考虑**：
- 📊 数据规模 - 预估数据量
- 🔄 并发场景 - 同时多少用户
- ⚡ 响应时间 - 用户能接受的等待时间
- 💾 资源消耗 - CPU、内存、数据库

**性能目标**：
- 🎯 API响应时间 < 200ms (P95)
- 🎯 页面加载时间 < 2s
- 🎯 数据库查询 < 100ms
- 🎯 并发支持 ≥ 100 用户

**代码审查清单**：
- [ ] 是否有N+1查询问题？
- [ ] 是否有嵌套循环？
- [ ] 大数据量是否分页？
- [ ] 是否添加了必要的索引？
- [ ] 是否使用了缓存？

详见：[PROJECT-GUIDE.md - 性能与算法优化](PROJECT-GUIDE.md#性能与算法优化)

---

## 🔍 搜索文档

**按关键词搜索**：
```bash
# 在所有文档中搜索
grep -r "关键词" docs/

# 搜索特定类型
grep -r "部署" docs/ --include="*.md"
```

---

## 📝 文档维护规范

### 新文档创建规则

1. **报告类** → `docs/reports/`
2. **测试类** → `docs/test-reports/` 或 `docs/verification-reports/`
3. **归档类** → `docs/archive/`
4. **核心文档** → `docs/` 根目录

### 文档命名规范

- ✅ 使用英文或拼音
- ✅ 使用短横线分隔：`project-guide.md`
- ✅ 日期格式：`YYYY-MM-DD`
- ❌ 避免特殊字符和空格

---

## 🔗 相关链接

- **项目主页**: [../README.md](../README.md)
- **后端文档**: [../backend/README.md](../backend/README.md)
- **前端文档**: [../frontend/README.md](../frontend/README.md)

---

**最后更新**: 2025-11-07  
**维护者**: ProxyHub Team
