# Telegram Mini App 部署指南

## 快速开始

### 第一步：创建Telegram Bot

1. 在Telegram中搜索 `@BotFather`
2. 发送命令 `/newbot`
3. 按照提示设置机器人名称（例如：CodeCoin Lottery）
4. 设置用户名（必须以bot结尾，例如：codecoin_lottery_bot）
5. 保存收到的 **Bot Token**（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 第二步：配置后端

1. 将Bot Token添加到 `backend/.env`:
```env
PORT=3001
BOT_TOKEN=你的Bot_Token
DATABASE_PATH=./data/lottery.db
NODE_ENV=production
```

2. 部署后端到云服务（推荐Railway或Render）

### 第三步：部署前端

1. 更新 `frontend/.env`:
```env
VITE_API_URL=https://你的后端地址/api
```

2. 构建前端:
```bash
cd frontend
npm run build
```

3. 部署 `dist` 文件夹到静态托管服务（推荐Vercel或Netlify）

### 第四步：创建Mini App

1. 回到 BotFather，发送 `/newapp`
2. 选择你创建的机器人
3. 填写应用信息：
   - **Title**: CodeCoin 大转盘
   - **Description**: 抽奖赢USDT和世界杯门票
   - **Photo**: 上传应用图标（512x512 PNG）
   - **GIF**: 可选，上传演示动画
   - **Web App URL**: `https://你的前端地址`

4. 发送 `/mybots` → 选择你的机器人 → `Bot Settings` → `Menu Button` → 设置为你的Web App

## 部署平台推荐

### 后端部署

#### Railway（推荐，免费额度足够）
```bash
# 1. 安装CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 在backend目录初始化
cd backend
railway init

# 4. 添加环境变量
railway variables set BOT_TOKEN=你的token
railway variables set PORT=3001
railway variables set NODE_ENV=production

# 5. 部署
railway up
```

#### Render（推荐，有免费套餐）
1. 访问 https://render.com
2. 创建新的 Web Service
3. 连接GitHub仓库
4. 配置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 添加环境变量（同上）

### 前端部署

#### Vercel（推荐，速度快）
```bash
# 1. 安装CLI
npm i -g vercel

# 2. 在frontend目录部署
cd frontend
vercel --prod

# 3. 设置环境变量
vercel env add VITE_API_URL
# 输入: https://你的后端地址/api
```

#### Netlify（推荐，配置简单）
```bash
# 1. 安装CLI
npm i -g netlify-cli

# 2. 构建
cd frontend
npm run build

# 3. 部署
netlify deploy --prod --dir=dist

# 4. 添加环境变量
netlify env:set VITE_API_URL https://你的后端地址/api
```

#### Cloudflare Pages（推荐，全球CDN）
1. 访问 https://pages.cloudflare.com
2. 连接GitHub仓库
3. 配置：
   - **Framework**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
4. 添加环境变量: `VITE_API_URL`

## 本地开发与测试

### 使用ngrok在Telegram中测试

```bash
# 1. 安装ngrok
npm install -g ngrok

# 2. 启动本地服务
npm run dev

# 3. 在新终端启动ngrok（前端）
ngrok http 3000

# 4. 在新终端启动ngrok（后端）
ngrok http 3001

# 5. 更新frontend/.env中的VITE_API_URL为后端ngrok地址

# 6. 在BotFather中设置前端ngrok地址为Web App URL
```

## 域名配置（可选）

如果你有自己的域名：

### 前端域名设置
- Vercel: 在项目设置中添加自定义域名
- Netlify: 在Domain settings中添加域名
- Cloudflare: 自动使用Cloudflare域名或添加自定义域名

### 后端域名设置
- Railway: 在Settings中添加自定义域名
- Render: 在Settings中添加自定义域名

## 安全配置

### 1. HTTPS要求
Telegram Mini App **必须使用HTTPS**。推荐的托管平台都自动提供免费SSL证书。

### 2. 验证Telegram数据
后端已包含Telegram initData验证。生产环境中必须启用：

```javascript
// backend/src/middleware/auth.js
// 确保 NODE_ENV=production 时验证生效
```

### 3. CORS配置
在 `backend/src/index.js` 中配置允许的前端域名：

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## 监控和日志

### Railway
```bash
railway logs
```

### Render
在Dashboard中查看实时日志

### 数据库备份
```bash
# 定期备份SQLite数据库
scp user@server:/path/to/backend/data/lottery.db ./backup/
```

## 常见问题

### Q: Telegram中打不开Mini App
A: 确保使用HTTPS，检查URL是否正确，查看浏览器控制台错误

### Q: 后端API调用失败
A: 检查CORS配置，确保前端 `.env` 中的 `VITE_API_URL` 正确

### Q: 转盘不转动
A: 检查 framer-motion 是否正确安装，查看浏览器控制台错误

### Q: 数据不持久化
A: 确保 `backend/data/` 目录有写权限，检查SQLite数据库文件

## 性能优化

1. **前端优化**:
   - Vite自动进行代码分割和压缩
   - 使用CDN加速静态资源

2. **后端优化**:
   - SQLite使用WAL模式提升并发性能
   - 考虑添加Redis缓存热点数据

3. **数据库优化**:
   - 为常用查询添加索引
   - 定期清理历史数据

## 扩展功能建议

- 添加支付集成（Telegram Stars、TON等）
- 实现实时排行榜更新
- 添加推送通知功能
- 集成Web3钱包
- 添加多语言支持

## 技术支持

如有问题，请检查：
1. Node.js版本 >= 18
2. 所有依赖正确安装
3. 环境变量正确配置
4. 网络连接正常
5. Telegram Bot设置正确

---

**祝你的游戏运营成功！** 🎉
