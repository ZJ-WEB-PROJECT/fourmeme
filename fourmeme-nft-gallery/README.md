# Four.meme NFT Gallery

BSC 链 NFT 展示画廊前端 Demo，Next.js 14 静态导出，可直接部署到宝塔 / Nginx 等静态服务器。

---

## 环境要求

| 工具 | 最低版本 | 备注 |
|------|----------|------|
| Node.js | **18.17.0 +** | 推荐 20.x LTS，[下载](https://nodejs.org) |
| npm | 9 + | 随 Node.js 自带 |

```bash
# 验证版本
node -v   # 应显示 v18.x 或以上
npm -v    # 应显示 9.x 或以上
```

> ⚠️ **Node.js 版本不对是最常见的编译失败原因**，请先确认。

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

浏览器打开 http://localhost:3000

### 3. 构建静态文件（用于部署）

```bash
npm run build
```

构建完成后，静态文件输出到 `out/` 目录：

```
out/
├── index.html          ← 首页
├── swap/index.html     ← 兑换页
├── collection/index.html
├── gallery/index.html
├── 404.html
└── _next/              ← CSS / JS 资源
```

把 `out/` 目录上传到服务器即可，**不需要 Node.js 运行时**。

---

## 环境变量

复制 `.env.local`（源码包中已包含），按需修改：

```env
# Mock 模式（true = 使用模拟数据，无需后端接口）
NEXT_PUBLIC_USE_MOCK=true

# WalletConnect Project ID（手机端连接钱包必须填写）
# 免费注册：https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=46b0c7dc1264e0964709558089c09b41

# BSC RPC
NEXT_PUBLIC_BSC_MAINNET_RPC=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
```

---

## 宝塔部署

详细步骤见根目录 `DEPLOY.md`。

核心要点：
- 网站目录指向 `out/`
- Nginx 配置加一行：`try_files $uri $uri/ $uri.html /index.html;`

---

## 常见编译错误

**`Error: CALL_AND_RETRY_LAST Allocation failed`**
→ Node.js 版本过低，升级到 18.17+

**`Cannot find module 'xxx'`**
→ 没有运行 `npm install`，先执行安装依赖

**`next: command not found`**
→ 依赖未安装，运行 `npm install`

**`Error: Dynamic server usage`**
→ 正常现象，项目已配置 `output: 'export'`，使用 `npm run build` 构建即可

**端口 3000 被占用**
→ `npx kill-port 3000` 然后重新 `npm run dev`
