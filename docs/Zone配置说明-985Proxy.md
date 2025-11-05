# 985Proxy Zone（通道）配置说明

## 🎯 Zone是什么？

**Zone（通道标识）** 是985Proxy静态住宅代理中的核心概念：

### Zone的作用
- 每个Zone代表一个**独立的代理通道**
- 通过Zone来管理和使用您购买的静态IP
- **必须先创建Zone，才能购买IP**

### Zone vs API Key
| 项目 | Zone | API Key |
|------|------|---------|
| **用途** | 标识特定的代理通道 | 验证API调用权限 |
| **获取方式** | 在后台手动创建通道 | 在后台生成 |
| **数量** | 可以创建多个通道 | 通常一个账号一个 |
| **使用场景** | 购买/查询/续费IP时指定通道 | 所有API调用都需要 |

---

## 📋 获取Zone ID的步骤

### 方法1：Web后台创建（推荐）

1. **登录985Proxy**
   - 正式环境：https://www.985proxy.com/
   - 测试环境：https://sandbox.985proxy.com/

2. **进入静态住宅代理页面**
   - 左侧菜单：`静态住宅代理` / `Static Residential`
   - 或：`通道管理` / `Channel Management`

3. **创建新通道**
   - 点击 `创建通道` / `Create Channel` 按钮
   - 填写通道名称（可选）
   - 提交创建

4. **获取Zone ID**
   - 创建成功后，在通道列表中会显示Zone ID
   - 复制这个Zone ID

### 方法2：查看现有通道

如果您之前已经创建过通道：
1. 进入 `通道管理` / `Channel Management`
2. 查看通道列表
3. 每个通道都有对应的Zone ID
4. 复制您要使用的Zone ID

---

## 🔧 Zone ID格式说明

### 可能的格式

根据985Proxy的实现，Zone ID可能有以下格式：

1. **简单格式**：`zone_xxxxxxxxx`
2. **Base64格式**：`ne_hj06qomI-xxxxx...`
3. **其他格式**：根据您在后台看到的为准

**重要**：请以985Proxy后台显示的Zone ID为准！

---

## ⚠️ 常见错误

### 错误1：zone does not exist

**原因**：
- Zone还没有在985Proxy后台创建
- Zone ID拼写错误
- Zone ID已过期或被删除

**解决**：
1. 确认已在后台创建通道
2. 仔细核对Zone ID是否正确
3. 确认Zone属于当前API Key对应的账号

### 错误2：unauthorized

**原因**：
- API Key错误
- Zone ID不属于当前API Key的账号

**解决**：
1. 检查API Key是否正确
2. 确认Zone和API Key属于同一个账号

---

## 📝 ProxyHub配置示例

### backend/.env 配置

```env
# 985Proxy API配置
PROXY_985_API_KEY=your_api_key_here
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=your_zone_id_here  # ← 这里填写您在后台创建的Zone ID
PROXY_985_TEST_MODE=false  # false=真实购买，true=测试模式
```

### 配置步骤

1. **获取API Key** - 在985Proxy后台生成
2. **创建Zone** - 在后台创建静态住宅通道
3. **复制Zone ID** - 从通道列表复制
4. **更新.env** - 将Zone ID填入配置
5. **重启后端** - 应用新配置
6. **测试购买** - 在ProxyHub购买IP

---

## 🧪 验证Zone ID是否正确

### 方法1：调用查询API

使用985Proxy的查询接口验证Zone是否存在：

```bash
GET https://open-api.985proxy.com/res_static/list
?zone=your_zone_id
&static_proxy_type=all
&apikey=your_api_key
```

**如果Zone正确**：
- 返回200 OK
- data中可能为空（如果还没购买过IP）

**如果Zone不存在**：
- 返回错误：`zone does not exist`

### 方法2：在ProxyHub测试购买

1. 确保 `PROXY_985_TEST_MODE=true`（测试模式）
2. 在ProxyHub购买页面测试购买
3. 查看后端日志
4. 如果Zone正确，会跳过API调用使用mock数据

---

## 🎯 购买IP的完整流程

### ProxyHub + 985Proxy 集成流程

```
用户在ProxyHub购买IP
    ↓
ProxyHub后端验证余额
    ↓
调用985Proxy API
POST /res_static/buy
{
  "zone": "your_zone_id",        ← Zone标识您的通道
  "static_proxy_type": "shared", ← 普通/原生
  "time_period": 30,             ← 购买时长
  "buy_data": [{
    "country_code": "US",
    "city_name": "New York",
    "count": "1"
  }]
}
    ↓
985Proxy验证Zone是否存在
    ↓
985Proxy从指定Zone的IP池分配IP
    ↓
返回购买的IP信息
    ↓
ProxyHub保存到数据库
    ↓
ProxyHub扣除用户余额
    ↓
用户收到IP
```

---

## 📞 获取帮助

### 如果遇到问题

1. **检查后端日志** - 查看详细错误信息
2. **验证Zone ID** - 确认Zone在后台存在
3. **联系985Proxy客服**
   - Telegram: https://t.me/lubei12
   - 提供您的API Key（部分）
   - 询问Zone相关问题

### 常见支持问题

1. **如何创建Zone？** - 联系客服获取详细步骤
2. **Zone ID格式是什么？** - 以后台显示为准
3. **一个账号可以创建几个Zone？** - 咨询客服确认

---

## ✅ 确认清单

在使用ProxyHub购买IP前，请确认：

- [ ] 已在985Proxy后台创建静态住宅通道
- [ ] 已获取正确的Zone ID
- [ ] 已将Zone ID填入 `backend/.env`
- [ ] 已重启ProxyHub后端服务
- [ ] Zone ID格式与后台显示一致
- [ ] API Key和Zone属于同一个账号
- [ ] 985Proxy账户有足够余额

---

**最后更新**: 2025-11-05  
**版本**: v1.0

