@echo off
chcp 65001 > nul
echo =========================================
echo  配置Docker镜像加速器
echo =========================================
echo.
echo 由于Docker Hub连接问题，需要配置国内镜像加速器
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 右键点击桌面Docker图标
echo 2. 选择 Settings（设置）
echo 3. 选择 Docker Engine
echo 4. 在JSON配置中添加以下内容：
echo.
echo {
echo   "registry-mirrors": [
echo     "https://docker.1ms.run",
echo     "https://docker.anyhub.us.kg",
echo     "https://dockerhub.icu"
echo   ]
echo }
echo.
echo 5. 点击 Apply ^& Restart
echo.
echo 或者复制以下完整配置（替换现有内容）：
echo.
type "%~dp0docs\docker-daemon.json.example"
echo.
echo 配置完成后，请关闭此窗口，然后运行：
echo   快速修复-重新构建.bat
echo.
pause

