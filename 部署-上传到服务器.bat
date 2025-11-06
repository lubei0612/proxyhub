@echo off
echo ========================================
echo 重新上传部署包到腾讯云
echo ========================================

cd /d d:\Users\Desktop\proxyhub

echo.
echo 1. 上传新的部署包...
scp proxyhub-deploy.tar.gz root@43.130.35.117:/opt/proxyhub/

echo.
echo ========================================
echo 上传完成！
echo ========================================
echo.
echo 请在腾讯云SSH执行以下命令：
echo.
echo # 1. 进入目录
echo cd /opt/proxyhub
echo.
echo # 2. 删除旧文件
echo rm -rf backend frontend docker-compose.cn.yml
echo.
echo # 3. 解压新文件
echo tar -xzf proxyhub-deploy.tar.gz
echo.
echo # 4. 查看关键文件
echo cat frontend/Dockerfile.cn ^| grep "build"
echo cat backend/Dockerfile.cn ^| grep "CMD"
echo.
echo # 5. 重新构建
echo docker compose -f docker-compose.cn.yml up -d --build --no-cache
echo.
pause

