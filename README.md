# CodeCoin 大转盘游戏 - Telegram Mini App

一个适用于Telegram平台的抽奖转盘小游戏，包含积分系统、碎片收集、任务系统和提现功能。

## 项目架构

```
大转盘游戏/
├── frontend/          # React前端应用（Telegram Mini App）
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── services/      # API服务
│   │   ├── App.jsx        # 主应用
│   │   └── main.jsx       # 入口文件
│   └── package.json
├── backend/           # Node.js后端API
│   ├── src/
│   │   ├── db/            # 数据库初始化
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   └── index.js       # 服务器入口
│   └── package.json
└── package.json       # 根配置（Workspace）
```

## 功能特性

- **转盘抽奖**: 10种奖品，包括USDT、积分、碎片、NFT等
- **任务系统**: 完成任务获取抽奖次数和积分
- **碎片收集**: 收集世界杯门票碎片和黄金碎片
- **积分系统**: 积分排行榜和历史记录
- **提现功能**: 完成KYC等步骤后可提现
- **邀请奖励**: 邀请好友获得奖励

## 开发环境设置

### 1. 安装依赖

```bash
# 安装根依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2. 配置环境变量

```bash
# 后端配置
cd backend
cp .env.example .env
# 编辑 .env 文件，设置你的Telegram Bot Token

# 前端配置
cd ../frontend
cp .env.example .env
# 如需要可修改API地址
```

### 3. 启动开发服务器

```bash
# 在根目录同时启动前后端
npm run dev

# 或者分别启动
npm run dev:frontend  # 前端: http://localhost:3000
npm run dev:backend   # 后端: http://localhost:3001
```

## 部署到Telegram

### 1. 创建Telegram Bot

1. 在Telegram中找到 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 设置机器人名称和用户名
4. 保存Bot Token到 `backend/.env` 中的 `BOT_TOKEN`

### 2. 创建Mini App

1. 向 BotFather 发送 `/newapp`
2. 选择你刚创建的机器人
3. 设置应用标题、描述和图标
4. 上传应用截图
5. 设置Web App URL（你的前端部署地址）

### 3. 部署后端

推荐使用以下平台之一：

**选项A: Railway**
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

**选项B: Render**
1. 在 [render.com](https://render.com) 创建新的Web Service
2. 连接你的GitHub仓库
3. 设置构建命令: `cd backend && npm install`
4. 设置启动命令: `npm run start:backend`
5. 添加环境变量

**选项C: VPS (Ubuntu)**
```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆代码并安装依赖
cd backend
npm install

# 使用PM2运行
npm install -g pm2
pm2 start src/index.js --name lottery-backend
pm2 save
pm2 startup
```

### 4. 部署前端

推荐使用以下平台之一：

**选项A: Vercel**
```bash
# 安装Vercel CLI
npm install -g vercel

# 部署
cd frontend
vercel --prod
```

**选项B: Netlify**
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 构建并部署
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**选项C: Cloudflare Pages**
1. 在 [Cloudflare Pages](https://pages.cloudflare.com) 创建新项目
2. 连接GitHub仓库
3. 设置构建命令: `cd frontend && npm run build`
4. 设置输出目录: `frontend/dist`

### 5. 更新API地址

部署前端后，需要更新API地址：

```bash
# frontend/.env
VITE_API_URL=https://your-backend-url.com/api
```

重新构建并部署前端。

### 6. 配置Telegram Bot

```bash
# 设置Mini App URL
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "打开游戏",
      "web_app": {
        "url": "https://your-frontend-url.com"
      }
    }
  }'
```

## 技术栈

### 前端
- **React 18** - UI框架
- **Vite** - 构建工具
- **Framer Motion** - 动画库
- **Tailwind CSS** - 样式框架
- **@telegram-apps/sdk-react** - Telegram Mini App SDK
- **Axios** - HTTP客户端

### 后端
- **Node.js + Express** - 服务器框架
- **Better-SQLite3** - 数据库
- **Crypto** - Telegram数据验证

## API端点

```
GET  /api/users/:userId              # 获取用户数据
POST /api/users/:userId/spin         # 执行抽奖
POST /api/users/:userId/tasks/:taskId/complete  # 完成任务
POST /api/users/:userId/withdraw     # 提现
GET  /api/leaderboard                # 获取排行榜
GET  /api/health                     # 健康检查
```

## 本地测试

1. 启动开发服务器: `npm run dev`
2. 在浏览器中访问 `http://localhost:3000`
3. 如需在Telegram中测试，需要使用 ngrok 或类似工具暴露本地端口：

```bash
# 安装ngrok
npm install -g ngrok

# 暴露前端端口
ngrok http 3000

# 暴露后端端口（新终端窗口）
ngrok http 3001

# 在Telegram Bot中设置ngrok提供的URL
```

## 数据库结构

- **users**: 用户基本信息、余额、积分、碎片
- **tasks**: 任务定义
- **user_tasks**: 用户任务完成状态
- **spins_history**: 抽奖历史
- **points_history**: 积分历史
- **nfts**: NFT收藏
- **invites**: 邀请记录

## 安全注意事项

1. 生产环境必须验证Telegram initData
2. 设置适当的CORS策略
3. 使用HTTPS
4. 定期备份数据库
5. 不要将 `.env` 文件提交到版本控制

## License

MIT
