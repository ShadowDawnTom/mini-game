# 🎮 开始使用 CodeCoin 大转盘游戏

## ⚡ 最快启动方式（Windows）

双击运行 `start.bat` 文件，脚本会自动：
- 安装所有依赖
- 配置环境变量
- 启动前后端服务

然后访问 http://localhost:3000

## 🔧 手动启动（所有平台）

```bash
# 1. 安装依赖
npm install

# 2. 配置环境
# 复制 backend/.env.example 为 backend/.env
# 复制 frontend/.env.example 为 frontend/.env

# 3. 启动服务
npm run dev
```

## 📱 在Telegram中测试

### 准备工作
1. 创建Telegram Bot（通过 @BotFather）
2. 获取Bot Token
3. 将Token填入 `backend/.env`

### 使用ngrok测试
```bash
# 安装ngrok
npm install -g ngrok

# 启动服务
npm run dev

# 新终端：暴露前端
ngrok http 3000

# 新终端：暴露后端
ngrok http 3001

# 更新frontend/.env中的VITE_API_URL为后端ngrok地址
# 在BotFather中设置前端ngrok地址为Web App URL
```

## 📚 详细文档

- **QUICKSTART.md** - 详细的本地开发指南
- **DEPLOY_TELEGRAM.md** - Telegram部署完整流程
- **README.md** - 项目完整说明
- **PROJECT_OVERVIEW.md** - 技术架构和设计

## 🎯 核心功能

✅ 转盘抽奖（10种奖品）  
✅ 任务系统（获取抽奖次数）  
✅ 碎片收集（门票和黄金）  
✅ 积分排行榜  
✅ 提现功能  
✅ 邀请奖励  

## 🚀 生产部署

前端推荐：Vercel / Netlify / Cloudflare Pages  
后端推荐：Railway / Render / VPS

详见 `DEPLOY_TELEGRAM.md`

## ❓ 需要帮助？

1. 检查所有依赖是否安装
2. 确认Node.js版本 >= 18
3. 查看浏览器控制台和后端日志
4. 参考各个文档文件

---

**开始你的游戏之旅！** 🎰
