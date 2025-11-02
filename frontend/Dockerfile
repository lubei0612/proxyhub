# 前端生产环境 Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 接收构建参数
ARG VITE_API_URL=http://localhost:3000

# 设置环境变量
ENV VITE_API_URL=$VITE_API_URL

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像 - 使用 Nginx
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.prod.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
