# 项目概览 - CodeCoin 大转盘游戏

## 项目完整文件结构

```
大转盘游戏/
│
├── 📄 package.json              # 根Workspace配置
├── 📄 .gitignore                # Git忽略文件
├── 📄 README.md                 # 完整项目文档
├── 📄 QUICKSTART.md             # 快速启动指南
├── 📄 DEPLOY_TELEGRAM.md        # Telegram部署详细指南
├── 📄 PROJECT_OVERVIEW.md       # 本文件
├── 📄 docker-compose.yml        # Docker编排文件
├── 📄 start.bat                 # Windows快速启动脚本
│
├── 📁 frontend/                 # React前端应用
│   ├── 📄 package.json
│   ├── 📄 vite.config.js        # Vite配置
│   ├── 📄 tailwind.config.js    # Tailwind CSS配置
│   ├── 📄 postcss.config.js     # PostCSS配置
│   ├── 📄 index.html            # HTML入口
│   ├── 📄 nginx.conf            # Nginx配置（生产环境）
│   ├── 📄 Dockerfile            # Docker镜像
│   ├── 📄 .env.example          # 环境变量示例
│   ├── 📁 public/               # 静态资源
│   └── 📁 src/
│       ├── 📄 main.jsx          # React入口
│       ├── 📄 App.jsx           # 主应用组件
│       ├── 📄 index.css         # 全局样式
│       ├── 📁 components/
│       │   └── 📄 WheelSVG.jsx  # 转盘SVG组件
│       ├── 📁 hooks/
│       │   └── 📄 useTelegram.js # Telegram集成Hook
│       └── 📁 services/
│           └── 📄 api.js        # API服务
│
└── 📁 backend/                  # Node.js后端
    ├── 📄 package.json
    ├── 📄 Dockerfile            # Docker镜像
    ├── 📄 .env.example          # 环境变量示例
    ├── 📁 data/                 # SQLite数据库目录
    └── 📁 src/
        ├── 📄 index.js          # Express服务器
        ├── 📁 db/
        │   ├── 📄 init.js       # 数据库初始化
        │   └── 📄 seed.js       # 数据填充
        ├── 📁 routes/
        │   ├── 📄 users.js      # 用户相关路由
        │   └── 📄 leaderboard.js # 排行榜路由
        ├── 📁 services/
        │   └── 📄 userService.js # 用户业务逻辑
        └── 📁 middleware/
            └── 📄 auth.js       # Telegram认证中间件
```

## 核心技术栈

### 前端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3 | UI框架 |
| Vite | 5.2 | 构建工具 |
| Framer Motion | 11.0 | 动画库 |
| Tailwind CSS | 3.4 | 样式框架 |
| Telegram SDK | 1.1 | Telegram集成 |
| Axios | 1.6 | HTTP客户端 |

### 后端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | 运行时 |
| Express | 4.19 | Web框架 |
| Better-SQLite3 | 9.6 | 数据库 |
| CORS | 2.8 | 跨域支持 |

## 数据库设计

### users 表
存储用户基本信息、余额、积分、碎片、解锁状态等。

### tasks 表
定义可用任务（关注频道、邀请好友等）。

### user_tasks 表
记录用户任务完成状态。

### spins_history 表
记录所有抽奖历史。

### points_history 表
记录积分变动历史。

### nfts 表
存储用户获得的NFT。

### invites 表
记录邀请关系和奖励。

## API接口

### 用户相关
- `GET /api/users/:userId` - 获取用户完整数据
- `POST /api/users/:userId/spin` - 执行抽奖
- `POST /api/users/:userId/tasks/:taskId/complete` - 完成任务
- `POST /api/users/:userId/withdraw` - 提现

### 排行榜
- `GET /api/leaderboard` - 获取TOP 5排行榜

### 健康检查
- `GET /api/health` - 服务健康状态

## 抽奖概率配置

在 `backend/src/services/userService.js` 中的 `prizeWeights` 数组：

```javascript
const prizeWeights = [
  8,   // 门票碎片×1 (8%)
  20,  // 0.5 USDT (20%)
  25,  // 再来一次 (25%)
  8,   // 金条碎片×1 (8%)
  20,  // 500 积分 (20%)
  2,   // NFT 盲盒 (2%)
  25,  // 0.1 USDT (25%)
  3,   // 门票碎片×2 (3%)
  15,  // 次数+2 (15%)
  4    // 1.0 USDT (4%)
];
```

## 关键特性说明

### Telegram集成
- 使用 `@telegram-apps/sdk-react` 进行Telegram集成
- 自动获取用户信息（ID、用户名等）
- 支持Telegram主题适配
- 验证Telegram initData确保安全

### 转盘动画
- 使用Framer Motion实现平滑旋转动画
- 4秒转动时长，带缓动效果
- SVG绘制10个扇形区域
- 顶部指针指示中奖位置

### 任务系统
- 4种预设任务类型
- 完成任务获得抽奖次数和积分
- 任务状态持久化

### 碎片系统
- 收集6个门票碎片可兑换世界杯门票抽奖资格
- 收集5个金条碎片可兑换1g联名金条
- 通过转盘抽奖获得碎片

### 提现机制
- 需要完成三个解锁步骤：绑定钱包、KYC认证、开卡
- 最低提现额度10 USDT
- 提现进度可视化

## 部署方案

### 方案1: 分离部署（推荐）
- **前端**: Vercel/Netlify/Cloudflare Pages
- **后端**: Railway/Render/VPS
- **优点**: 各自独立扩展，CDN加速
- **成本**: 免费套餐即可

### 方案2: Docker部署
- 使用 `docker-compose.yml` 一键部署
- **优点**: 统一管理，易于迁移
- **适用**: VPS或云服务器

### 方案3: 一体化部署
- 后端serve前端静态文件
- **优点**: 简单，单一端口
- **缺点**: 前端无CDN加速

## 开发流程

1. **本地开发**: 使用 `npm run dev` 启动开发服务器
2. **调试**: 浏览器开发者工具 + 后端日志
3. **测试**: 使用ngrok在Telegram中测试
4. **部署**: 按照 `DEPLOY_TELEGRAM.md` 部署
5. **监控**: 查看部署平台的日志和监控

## 自定义配置

### 修改奖品
编辑 `frontend/src/App.jsx` 中的 `prizes` 数组和 `backend/src/services/userService.js` 中的对应配置。

### 修改任务
在数据库 `tasks` 表中添加或修改任务，或修改 `backend/src/db/init.js` 中的初始化任务。

### 修改样式
所有样式使用Tailwind CSS类名，直接在JSX中修改。

### 调整概率
修改 `backend/src/services/userService.js` 中的 `prizeWeights` 数组。

## 常用命令

```bash
# 开发
npm run dev                    # 同时启动前后端
npm run dev:frontend           # 仅启动前端
npm run dev:backend            # 仅启动后端

# 构建
npm run build                  # 构建前端

# 生产环境
npm run start:backend          # 启动后端生产服务器

# Docker
docker-compose up -d           # 启动所有服务
docker-compose logs -f         # 查看日志
docker-compose down            # 停止所有服务
```

## 后续增强建议

- [ ] 添加用户认证和会话管理
- [ ] 实现实时推送通知
- [ ] 添加支付集成（Telegram Stars、TON）
- [ ] 实现Web3钱包连接
- [ ] 添加管理后台
- [ ] 实现多语言支持
- [ ] 添加数据分析和统计
- [ ] 实现Redis缓存提升性能
- [ ] 添加定时任务（每日重置等）
- [ ] 实现防刷机制

## 维护清单

- [ ] 定期备份SQLite数据库
- [ ] 监控服务器资源使用
- [ ] 查看错误日志
- [ ] 更新依赖包
- [ ] 测试新功能
- [ ] 响应用户反馈

---

**项目已准备就绪！** 🚀

下一步：运行 `start.bat` 或查看 `QUICKSTART.md` 开始开发。
