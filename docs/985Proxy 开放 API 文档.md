# 985Proxy 开放 API 文档

#### 版本号: 2025.10.16

---

#### 正式服: https://www.985proxy.com/

#### 正式服接口网关: https://open-api.985proxy.com/

---

#### 测试服: https://sandbox.985proxy.com/

#### 测试服接口网关: https://sandbox-open-api.985proxy.com/

---

# 动态住宅

## GET 地区列表

GET /res_rotating/city_list

### 请求参数

| 名称   | 位置  | 类型   | 必选 | 说明    |
| ------ | ----- | ------ | ---- | ------- |
| apikey | query | string | 是   | API Key |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": [
    {
      "code": "string",
      "state_list": [
        {
          "code": "string",
          "city_list": [{}]
        }
      ]
    }
  ]
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称          | 类型     | 必选 | 约束 | 说明      |
| ------------- | -------- | ---- | ---- | --------- |
| » code        | integer  | true | none | 状态码    |
| » msg         | string   | true | none | 消息内容  |
| » data        | [object] | true | none | 响应数据  |
| »» code       | string   | true | none | 国家代码  |
| »» state_list | [object] | true | none | 州/省列表 |
| »»» code      | string   | true | none | 州省代码  |
| »»» city_list | [object] | true | none | 城市列表  |
| »»»» code     | string   | true | none | 城市代码  |

## GET 提取代理

GET /res_rotating/extract

### 请求参数

| 名称   | 位置  | 类型    | 必选 | 说明                                                                                           |
| ------ | ----- | ------- | ---- | ---------------------------------------------------------------------------------------------- |
| zone   | query | string  | 是   | 通道标识                                                                                       |
| num    | query | string  | 是   | 提取数量                                                                                       |
| area   | query | string  | 否   | 国家代码                                                                                       |
| state  | query | string  | 否   | 州/省代码                                                                                      |
| city   | query | string  | 否   | 城市代码                                                                                       |
| life   | query | integer | 否   | 代理时效 max: 120                                                                              |
| result | query | integer | 否   | 响应格式 1:TXT 2:JSON                                                                          |
| format | query | integer | 否   | 代理格式 1: ip:port:username:password 2: username:password:ip:port 3:username:password@ip:port |
| lb     | query | integer | 否   | 分隔符 1: 换行回车（\r\n）2: （\n）3: 回车（\r） 4: Tab（\t）                                  |
| apikey | query | string  | 是   | API Key                                                                                        |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

# 静态住宅

## GET IP 列表

GET /res_static/ip_list

### 请求参数

| 名称              | 位置  | 类型          | 必选 | 说明                                                |
| ----------------- | ----- | ------------- | ---- | --------------------------------------------------- |
| zone              | query | string        | 是   | 通道标识                                            |
| static_proxy_type | query | string        | 是   | 代理类型 all: 全部 shared: 普通 IP premium: 原生 IP |
| purpose_web       | query | string        | 否   | 业务场景                                            |
| page              | query | integer       | 否   | 页码 默认 1                                         |
| limit             | query | integer       | 否   | 单页数量 默认 15                                    |
| ips               | query | array[string] | 否   | 筛选 IPs                                            |
| is_expired        | query | integer       | 否   | 过期状态 是 1 全部 2 未过期 3 未过期 默认 1 全部    |
| is_release        | query | string        | 否   | 释放状态 1 全部 2 未过期 3 未过期 默认 1 全部       |
| apikey            | query | string        | 是   | API Key                                             |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "list": [
      {
        "id": 0,
        "zone": "string",
        "purpose_web": "string",
        "static_proxy_type": "string",
        "ip": "string",
        "port": 0,
        "username": "string",
        "password": "string",
        "country_code": "string",
        "city_name": "string",
        "expire_time_utc": "string",
        "release_time_utc": "string"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称                  | 类型     | 必选 | 约束 | 说明                                      |
| --------------------- | -------- | ---- | ---- | ----------------------------------------- |
| » code                | integer  | true | none | 响应代码                                  |
| » msg                 | string   | true | none | 消息内容                                  |
| » data                | object   | true | none | 响应数据                                  |
| »» page               | integer  | true | none | 当前页码                                  |
| »» limit              | integer  | true | none | 单页数量                                  |
| »» total              | integer  | true | none | 总数量                                    |
| »» list               | [object] | true | none | IP 列表                                   |
| »»» id                | integer  | true | none | 代理 ID                                   |
| »»» zone              | string   | true | none | 通道标识                                  |
| »»» purpose_web       | string   | true | none | 业务场景                                  |
| »»» static_proxy_type | string   | true | none | 代理类型 shared: 普通 IP premium: 原生 IP |
| »»» ip                | string   | true | none | 代理 IP                                   |
| »»» port              | integer  | true | none | 代理端口                                  |
| »»» username          | string   | true | none | 代理账号                                  |
| »»» password          | string   | true | none | 代理密码                                  |
| »»» country_code      | string   | true | none | 国家                                      |
| »»» city_name         | string   | true | none | 城市                                      |
| »»» expire_time_utc   | string   | true | none | 到期时间 UTC                              |
| »»» release_time_utc  | string   | true | none | 释放时间 UTC                              |

## GET IP 详情

GET /res_static/ip_detail

### 请求参数

| 名称   | 位置  | 类型   | 必选 | 说明    |
| ------ | ----- | ------ | ---- | ------- |
| id     | query | string | 是   | 代理 ID |
| apikey | query | string | 是   | API Key |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "id": 0,
    "zone": "string",
    "purpose_web": "string",
    "static_proxy_type": "string",
    "ip": "string",
    "port": 0,
    "username": "string",
    "password": "string",
    "country_code": "string",
    "city_name": "string",
    "expire_time_utc": "string",
    "release_time_utc": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称                 | 类型    | 必选 | 约束 | 说明                                      |
| -------------------- | ------- | ---- | ---- | ----------------------------------------- |
| » code               | integer | true | none | 响应代码                                  |
| » msg                | string  | true | none | 消息内容                                  |
| » data               | object  | true | none | 响应数据                                  |
| »» id                | integer | true | none | 代理 ID                                   |
| »» zone              | string  | true | none | 通道标识                                  |
| »» purpose_web       | string  | true | none | 业务场景                                  |
| »» static_proxy_type | string  | true | none | 代理类型 shared: 普通 IP premium: 原生 IP |
| »» ip                | string  | true | none | 代理 IP                                   |
| »» port              | integer | true | none | 代理端口                                  |
| »» username          | string  | true | none | 代理账号                                  |
| »» password          | string  | true | none | 代理密码                                  |
| »» country_code      | string  | true | none | 国家                                      |
| »» city_name         | string  | true | none | 城市                                      |
| »» expire_time_utc   | string  | true | none | 到期时间 UTC                              |
| »» release_time_utc  | string  | true | none | 释放时间 UTC                              |

## GET 业务场景列表

GET /res_static/business_list

### 请求参数

| 名称   | 位置  | 类型   | 必选 | 说明    |
| ------ | ----- | ------ | ---- | ------- |
| apikey | query | string | 是   | API Key |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": ["string"]
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型     | 必选 | 约束 | 说明     |
| ------ | -------- | ---- | ---- | -------- |
| » code | integer  | true | none | 响应代码 |
| » msg  | string   | true | none | 消息内容 |
| » data | [string] | true | none | 响应数据 |

## GET IP 库存列表

GET /res_static/inventory

### 请求参数

| 名称              | 位置  | 类型   | 必选 | 说明                                      |
| ----------------- | ----- | ------ | ---- | ----------------------------------------- |
| static_proxy_type | query | string | 是   | 代理类型 shared: 普通 IP premium: 原生 IP |
| purpose_web       | query | string | 否   | 业务场景                                  |
| apikey            | query | string | 是   | API Key                                   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": [
    {
      "country_code": "string",
      "city_name": "string",
      "number": 0,
      "price": 0,
      "origin_price": 0,
      "discount": 0
    }
  ]
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称            | 类型     | 必选  | 约束 | 说明            |
| --------------- | -------- | ----- | ---- | --------------- |
| » code          | integer  | true  | none | 响应代码        |
| » msg           | string   | true  | none | 消息内容        |
| » data          | [object] | true  | none | 响应数据        |
| »» country_code | string   | false | none | 国家            |
| »» city_name    | string   | false | none | 城市            |
| »» number       | integer  | false | none | 库存数量        |
| »» price        | number   | false | none | 售价 IP/月/美金 |
| »» origin_price | number   | true  | none | 原价 IP/月/美金 |
| »» discount     | number   | true  | none | 优惠比例 %      |

## POST IP 购买下单

POST /res_static/buy

> Body 请求参数

```json
{
  "zone": "string",
  "pay_type": "string",
  "time_period": 0,
  "promo_code": "string",
  "purpose_web": "string",
  "static_proxy_type": "string",
  "buy_data": [
    {
      "country_code": "string",
      "city_name": "string",
      "count": "string"
    }
  ]
}
```

### 请求参数

| 名称                | 位置  | 类型     | 必选 | 说明                                               |
| ------------------- | ----- | -------- | ---- | -------------------------------------------------- |
| apikey              | query | string   | 是   | API Key                                            |
| body                | body  | object   | 否   | none                                               |
| » zone              | body  | string   | 是   | 通道标识                                           |
| » pay_type          | body  | string   | 否   | 支付方式 钱包余额 balance 赠送金 gift 默认 balance |
| » time_period       | body  | integer  | 是   | 购买时长 单位:天 N\*30 (必须 30 的倍数)            |
| » promo_code        | body  | string   | 否   | 优惠码                                             |
| » purpose_web       | body  | string   | 否   | 业务场景                                           |
| » static_proxy_type | body  | string   | 是   | 购买类型 shared: 普通 IP premium: 原生 IP,         |
| » buy_data          | body  | [object] | 是   | 购买信息                                           |
| »» country_code     | body  | string   | 是   | 国家名称                                           |
| »» city_name        | body  | string   | 是   | 城市名称                                           |
| »» count            | body  | string   | 是   | 数量                                               |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "order_no": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称        | 类型    | 必选 | 约束 | 说明     |
| ----------- | ------- | ---- | ---- | -------- |
| » code      | integer | true | none | 响应代码 |
| » msg       | string  | true | none | 消息内容 |
| » data      | object  | true | none | 响应数据 |
| »» order_no | string  | true | none | 订单号   |

## POST IP 续期下单

POST /res_static/renew

> Body 请求参数

```json
{
  "zone": "string",
  "pay_type": "string",
  "time_period": 0,
  "promo_code": "string",
  "renew_ip_list": ["string"]
}
```

### 请求参数

| 名称            | 位置  | 类型     | 必选 | 说明                                               |
| --------------- | ----- | -------- | ---- | -------------------------------------------------- |
| apikey          | query | string   | 是   | API Key                                            |
| body            | body  | object   | 否   | none                                               |
| » zone          | body  | string   | 是   | 通道标识                                           |
| » pay_type      | body  | string   | 否   | 支付方式 钱包余额 balance 赠送金 gift 默认 balance |
| » time_period   | body  | integer  | 是   | 续期时长 单位:天 N\*30 (必须 30 的倍数)            |
| » promo_code    | body  | string   | 否   | 优惠码                                             |
| » renew_ip_list | body  | [string] | 是   | 续期信息                                           |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "order_no": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称        | 类型    | 必选 | 约束 | 说明     |
| ----------- | ------- | ---- | ---- | -------- |
| » code      | integer | true | none | 响应代码 |
| » msg       | string  | true | none | 消息内容 |
| » data      | object  | true | none | 响应数据 |
| »» order_no | string  | true | none | 订单号   |

## POST 计算价格

POST /res_static/calculate

> Body 请求参数

```json
{
  "time_period": 0,
  "promo_code": "string",
  "action": "string",
  "purpose_web": "string",
  "static_proxy_type": "string",
  "buy_data": [
    {
      "country_code": "string",
      "city_name": "string",
      "count": "string"
    }
  ],
  "zone": "string",
  "renew_ip_list": ["string"]
}
```

### 请求参数

| 名称                | 位置  | 类型     | 必选 | 说明                                                       |
| ------------------- | ----- | -------- | ---- | ---------------------------------------------------------- |
| apikey              | query | string   | 是   | API Key                                                    |
| body                | body  | object   | 否   | none                                                       |
| » time_period       | body  | integer  | 是   | 时长 单位:天 N\*30 (必须 30 的倍数)                        |
| » promo_code        | body  | string   | 否   | 优惠码                                                     |
| » action            | body  | string   | 是   | 计算类型 buy 购买 renew 续费                               |
| » purpose_web       | body  | string   | 否   | 业务场景 action=buy 可选                                   |
| » static_proxy_type | body  | string   | 是   | 购买类型 shared: 普通 IP premium: 原生 IP, action=buy 必填 |
| » buy_data          | body  | [object] | 否   | 购买信息 action=buy 必填                                   |
| »» country_code     | body  | string   | 是   | 国家名称                                                   |
| »» city_name        | body  | string   | 是   | 城市名称                                                   |
| »» count            | body  | string   | 是   | 数量                                                       |
| » zone              | body  | string   | 否   | 续期通道标识 action=renew 必填                             |
| » renew_ip_list     | body  | [string] | 否   | 续期信息 action=renew 必填                                 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "pay_price": "string",
    "discount_price": "string",
    "total_price": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称              | 类型    | 必选 | 约束 | 说明       |
| ----------------- | ------- | ---- | ---- | ---------- |
| » code            | integer | true | none | 响应代码   |
| » msg             | string  | true | none | 消息内容   |
| » data            | object  | true | none | 响应数据   |
| »» pay_price      | string  | true | none | 实付总费用 |
| »» discount_price | string  | true | none | 优惠总费用 |
| »» total_price    | integer | true | none | 总计费用   |

## POST 获取订单结果

POST /res_static/order_result

> Body 请求参数

```json
{
  "order_no": "string"
}
```

### 请求参数

| 名称       | 位置  | 类型   | 必选 | 说明    |
| ---------- | ----- | ------ | ---- | ------- |
| apikey     | query | string | 是   | API Key |
| body       | body  | object | 否   | none    |
| » order_no | body  | string | 是   | 订单号  |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "status": "string",
    "info": {
      "order_no": "string",
      "order_time_utc": "string",
      "complete_time_utc": "string",
      "promo_code": "string",
      "total_price": 0,
      "discount_price": 0,
      "pay_price": 0,
      "result": [
        {
          "id": 0,
          "zone": "string",
          "ip": "string",
          "port": 0,
          "username": "string",
          "password": "string",
          "purpose_web": "string",
          "static_proxy_type": "string",
          "country_code": "string",
          "city_name": "string",
          "expire_time": "string",
          "release_time": "string",
          "expire_time_utc": "string",
          "release_time_utc": "string",
          "total_price": 0,
          "discount_price": 0,
          "pay_price": 0,
          "unit_price": 0,
          "unit_pay_price": 0,
          "ip_month": 0,
          "time_period": 0
        }
      ]
    }
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

状态码 **200**

| 名称                   | 类型     | 必选 | 约束 | 说明                                        |
| ---------------------- | -------- | ---- | ---- | ------------------------------------------- |
| » code                 | integer  | true | none | 响应代码                                    |
| » msg                  | string   | true | none | 消息内容                                    |
| » data                 | object   | true | none | 响应数据                                    |
| »» status              | string   | true | none | 订单状态 progress 进行中 complete 已完成    |
| »» info                | object   | true | none | 订单数据                                    |
| »»» order_no           | string   | true | none | 订单号                                      |
| »»» order_time_utc     | string   | true | none | 下单时间 UTC                                |
| »»» complete_time_utc  | string   | true | none | 完成时间 UTC                                |
| »»» promo_code         | string   | true | none | 优惠码                                      |
| »»» total_price        | number   | true | none | 总计费用                                    |
| »»» discount_price     | number   | true | none | 优惠总费用                                  |
| »»» pay_price          | number   | true | none | 实付总费用                                  |
| »»» result             | [object] | true | none | 订单结果                                    |
| »»»» id                | number   | true | none | 代理 ID                                     |
| »»»» zone              | string   | true | none | 通道标识                                    |
| »»»» ip                | string   | true | none | 代理 IP                                     |
| »»»» port              | integer  | true | none | 代理端口                                    |
| »»»» username          | string   | true | none | 代理账号                                    |
| »»»» password          | string   | true | none | 代理密码                                    |
| »»»» purpose_web       | string   | true | none | 业务场景                                    |
| »»»» static_proxy_type | string   | true | none | 代理类型 shared: 普通 IP premium: 原生 IP   |
| »»»» country_code      | string   | true | none | 国家                                        |
| »»»» city_name         | string   | true | none | 城市                                        |
| »»»» expire_time       | string   | true | none | 到期时间 UTC [即将废弃] 同 expire_time_utc  |
| »»»» release_time      | string   | true | none | 释放时间 UTC [即将废弃] 同 release_time_utc |
| »»»» expire_time_utc   | string   | true | none | 到期时间 UTC                                |
| »»»» release_time_utc  | string   | true | none | 释放时间 UTC                                |
| »»»» total_price       | number   | true | none | 总计费用                                    |
| »»»» discount_price    | number   | true | none | 优惠总费用                                  |
| »»»» pay_price         | number   | true | none | 实付总费用                                  |
| »»»» unit_price        | number   | true | none | 单价 IP/月/美金                             |
| »»»» unit_pay_price    | number   | true | none | 实付单价 IP/月/美金                         |
| »»»» ip_month          | integer  | true | none | 购买月份（30 天/月）                        |
| »»»» time_period       | integer  | true | none | 购买时长 单位:天 N\*30                      |

# 更新日志

## 版本号 2025.10.13

- IP 列表 [/res_static/ip_list] [新增] [请求参数]

| 名称       | 位置  | 类型    | 必选 | 说明                                             |
| ---------- | ----- | ------- | ---- | ------------------------------------------------ |
| is_expired | query | integer | 否   | 过期状态 是 1 全部 2 未过期 3 未过期 默认 1 全部 |
| is_release | query | string  | 否   | 释放状态 1 全部 2 未过期 3 未过期 默认 1 全部    |

- IP 列表 [/res_static/ip_list] [新增] [响应参数]

| 名称   | 类型    | 必选 | 约束 | 说明    |
| ------ | ------- | ---- | ---- | ------- |
| »»» id | integer | true | none | 代理 ID |

- IP 详情 [/res_static/ip_detail] [变更] [请求参数]

```txt
ip [代理 IP] 变更为 id [代理 ID]
```

- IP 详情 [/res_static/ip_detail] [新增] [响应参数]

| 名称   | 类型    | 必选 | 约束 | 说明    |
| ------ | ------- | ---- | ---- | ------- |
| »»» id | integer | true | none | 代理 ID |

- IP 购买下单 [/res_static/buy] [新增] [请求参数]

| 名称       | 位置 | 类型   | 必选 | 说明                                               |
| ---------- | ---- | ------ | ---- | -------------------------------------------------- |
| » pay_type | body | string | 否   | 支付方式 钱包余额 balance 赠送金 gift 默认 balance |

- IP 续期下单 [/res_static/renew] [新增] [请求参数]

| 名称       | 位置 | 类型   | 必选 | 说明                                               |
| ---------- | ---- | ------ | ---- | -------------------------------------------------- |
| » pay_type | body | string | 否   | 支付方式 钱包余额 balance 赠送金 gift 默认 balance |

## 版本号 2025.10.16

- IP 列表 [/res_static/ip_list] [新增] [请求参数]

| 名称 | 位置  | 类型          | 必选 | 说明     |
| ---- | ----- | ------------- | ---- | -------- |
| ips  | query | array[string] | 否   | 筛选 IPs |

- 获取订单结果 [/res_static/order_result] [调整] [响应参数] [旧订单不生效]

| 名称                  | 位置   | 类型 | 必选 | 说明                                        |
| --------------------- | ------ | ---- | ---- | ------------------------------------------- |
| »»»» id               | number | true | none | 代理 ID                                     |
| »»»» zone             | string | true | none | 通道标识                                    |
| »»»» expire_time      | string | true | none | 到期时间 UTC [即将废弃] 同 expire_time_utc  |
| »»»» release_time     | string | true | none | 释放时间 UTC [即将废弃] 同 release_time_utc |
| »»»» expire_time_utc  | string | true | none | 到期时间 UTC                                |
| »»»» release_time_utc | string | true | none | 释放时间 UTC                                |
