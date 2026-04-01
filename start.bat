@echo off
echo ====================================
echo   CodeCoin 大转盘游戏启动脚本
echo ====================================
echo.

echo [1/4] 检查依赖...
if not exist "node_modules" (
    echo 安装根依赖...
    call npm install
)

if not exist "frontend\node_modules" (
    echo 安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo 安装后端依赖...
    cd backend
    call npm install
    cd ..
)

echo.
echo [2/4] 检查环境变量...
if not exist "backend\.env" (
    echo 创建后端 .env 文件...
    copy backend\.env.example backend\.env
    echo 警告: 请编辑 backend\.env 设置你的BOT_TOKEN
)

if not exist "frontend\.env" (
    echo 创建前端 .env 文件...
    copy frontend\.env.example frontend\.env
)

echo.
echo [3/4] 创建数据目录...
if not exist "backend\data" mkdir backend\data

echo.
echo [4/4] 启动服务...
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 按 Ctrl+C 停止服务
echo.

start cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ 服务启动成功！
echo.
pause
