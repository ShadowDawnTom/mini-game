# 快速启动指南

## 本地开发（5分钟快速启动）

### 1. 安装所有依赖
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. 配置环境变量
```bash
# 后端配置
cd backend
copy .env.example .env
# 编辑 .env，暂时可以使用任意字符串作为BOT_TOKEN

# 前端配置
cd ../frontend
copy .env.example .env
# 保持默认配置即可
```

### 3. 启动开发服务器
```bash
# 返回根目录
cd ..

# 同时启动前后端
npm run dev
```

现在访问 http://localhost:3000 即可看到游戏界面！

## 在Telegram中测试

### 方法1: 使用ngrok（推荐）

1. 安装ngrok: https://ngrok.com/download

2. 启动服务:
```bash
# 终端1: 启动应用
npm run dev

# 终端2: 暴露前端
ngrok http 3000

# 终端3: 暴露后端
ngrok http 3001
```

3. 配置:
   - 复制后端ngrok URL，更新 `frontend/.env` 中的 `VITE_API_URL`
   - 重启前端服务
   - 复制前端ngrok URL到BotFather作为Web App URL

### 方法2: 直接部署到云平台

参考 `DEPLOY_TELEGRAM.md` 进行完整部署。

## 项目结构

```
大转盘游戏/
├── frontend/              # React前端
│   ├── src/
│   │   ├── App.jsx       # 主应用（4个标签页）
│   │   ├── components/   # WheelSVG组件
│   │   ├── hooks/        # useTelegram Hook
│   │   └── services/     # API服务
│   └── package.json
├── backend/              # Node.js后端
│   ├── src/
│   │   ├── db/          # 数据库初始化
│   │   ├── routes/      # API路由
│   │   └── services/    # 业务逻辑
│   └── package.json
└── package.json          # Workspace配置
```

## 主要功能

- ✨ **转盘抽奖**: 10种奖品，包含USDT、积分、碎片等
- 📋 **任务系统**: 完成任务获得抽奖次数
- 🧩 **碎片收集**: 世界杯门票碎片和黄金碎片
- 🏆 **排行榜**: 积分排名TOP 5
- 💰 **提现功能**: 满足条件后可提现USDT
- 👥 **邀请奖励**: 邀请好友获得奖励

## 调试技巧

### 查看后端日志
```bash
# 后端终端会显示所有API请求和数据库操作
```

### 查看前端错误
打开浏览器开发者工具（F12），查看Console标签

### 数据库查询
```bash
cd backend/data
sqlite3 lottery.db
.tables
SELECT * FROM users;
```

## 下一步

1. **自定义奖品**: 修改 `frontend/src/App.jsx` 中的 `prizes` 数组
2. **调整概率**: 修改 `backend/src/services/userService.js` 中的 `prizeWeights`
3. **添加任务**: 在数据库 `tasks` 表中添加新任务
4. **美化界面**: 修改Tailwind样式

## 需要帮助？

参考完整文档：
- `README.md` - 完整项目说明
- `DEPLOY_TELEGRAM.md` - Telegram部署详细指南
