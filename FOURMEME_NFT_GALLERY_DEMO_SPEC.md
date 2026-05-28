# Four.meme NFT Gallery - 前端 Demo 开发文档

> **项目代号：** Cubus × Four.meme NFT Gallery（Demo 阶段）
> **文档版本：** v4.0（基于 unipeg.art 真实截图分析）
> **目标读者：** Claude Code
> **维护者：** KING
> **最后更新：** 2026-05-27
> **视觉参考：** https://unipeg.art（必看截图，附在文档目录中）

---

## ⚡ 给 Claude Code 的核心指令

**你的任务：高度还原 unipeg.art 的视觉风格，做一份 Four.meme NFT 画廊前端 Demo。**

### 必须遵守

1. **视觉是最高优先级** —— 客户的判断标准就是"像不像 unipeg.art"
2. **Demo 完全独立运行** —— `npm install && npm run dev` 不需要任何配置
3. **所有按钮可点** —— 即使是 mock 也要有完整反馈
4. **必须支持黑夜/白天模式切换** —— Unipeg 顶部有 ☀️ 切换按钮
5. **Mock 数据要真实** —— 真实地址格式、真实交易哈希、真实金额单位
6. **架构干净** —— 后期切换真实 API 只改 `lib/api/`

### 项目阶段

| 阶段 | 当前位置 |
|---|---|
| **Demo 阶段（本文档）** | ⭐ 我们在这 |
| 客户审阅 | ↓ |
| 真实对接 | ↓ |
| 部署上线 | ↓ |

客户目前只有概念，没有后端、合约、设计稿。**做出来给客户看，再调整。**

---

## 📌 项目背景速读

### 要做什么

为 Four.meme（BSC 链上 meme 平台）做一个 **链上 SVG NFT 画廊网站**，视觉风格高度还原 unipeg.art。

### Unipeg 核心机制（理解上下文）

- NFT 图像 **100% 链上生成**（base64 SVG，无 IPFS）
- tokenURI 返回 `data:application/json;base64,...`
- 像素艺术风格（24×24 像素独角兽）
- 总量固定（Unipeg 是 10000）

### 我方分工

- ❌ 不做合约
- ❌ 不做后端
- ✅ 只做前端
- ✅ Demo 阶段全部用 mock

---

# 🎨 视觉规范（严格按 unipeg.art 真实截图）

> ⚠️ 这一节是文档最重要的部分。Claude Code 必须严格遵守，不允许自由发挥。

## 1. 色彩系统

### 黑夜模式（默认）

```css
:root[data-theme="dark"] {
  /* ===== 背景(纯黑) ===== */
  --bg-base: #000000;                  /* 主背景:纯黑 */
  --bg-card: #1A1B23;                  /* NFT 卡片默认色 */
  --bg-surface: #161616;               /* 浮起表面(按钮、输入框) */
  --bg-input: #0E0E10;                 /* 输入框背景 */
  --bg-hover: #1A1A1C;                 /* hover 微弱浮起 */

  /* ===== 文字 ===== */
  --text-primary: #EEEAE0;             /* 主文字:暖白(不是纯白!) */
  --text-secondary: #9B9B9B;           /* 次文字:中灰 */
  --text-tertiary: #6B6B6B;            /* 三级文字:暗灰 */
  --text-muted: #4A4A4A;               /* 占位文字 */

  /* ===== 品牌紫粉(仅用于 EXPLORE/SWAP/COLLECTION 小标签) ===== */
  --brand-tag: #C77DFF;                /* 标签紫粉 */
  --brand-tag-dim: #9D5BD2;            /* 标签紫粉暗版 */

  /* ===== 按钮(主操作:米白底黑字) ===== */
  --btn-primary-bg: #F5F2EB;           /* Connect wallet 按钮底色 */
  --btn-primary-text: #000000;
  --btn-primary-hover: #FFFFFF;

  /* ===== 边框(几乎不可见,仅卡片轮廓) ===== */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-input: rgba(255, 255, 255, 0.1);
  --border-active: rgba(255, 255, 255, 0.3);

  /* ===== 选中/激活态 ===== */
  --underline-active: #EEEAE0;
}
```

### 白天模式

```css
:root[data-theme="light"] {
  /* ===== 背景(米白) ===== */
  --bg-base: #F5F2EB;
  --bg-card: #E8E4D9;
  --bg-surface: #FFFFFF;
  --bg-input: #FFFFFF;
  --bg-hover: #EAE6DB;

  /* ===== 文字 ===== */
  --text-primary: #0E0E10;
  --text-secondary: #5A5A5A;
  --text-tertiary: #8A8A8A;
  --text-muted: #B8B8B8;

  /* ===== 品牌紫粉(白天模式深一点) ===== */
  --brand-tag: #9D5BD2;
  --brand-tag-dim: #7A3FB0;

  /* ===== 按钮(主操作:黑底白字) ===== */
  --btn-primary-bg: #000000;
  --btn-primary-text: #F5F2EB;
  --btn-primary-hover: #1A1A1A;

  /* ===== 边框 ===== */
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-input: rgba(0, 0, 0, 0.12);
  --border-active: rgba(0, 0, 0, 0.4);

  --underline-active: #0E0E10;
}
```

### NFT 卡片背景色系统 ⭐ 关键

unipeg.art 的核心特征：**每个 NFT 卡片有自己的背景色**（不是统一颜色），这些背景色应该从 NFT metadata 中读取，体现"链上原生"感。

Mock 阶段，**为每个 tokenId 分配一个固定背景色**（基于 tokenId seed），从以下色板挑选：

```typescript
// lib/api/mock/colors.ts
export const NFT_BG_PALETTE_DARK = [
  '#1F2436',   // 深紫蓝
  '#293045',   // 蓝灰
  '#2D3E2D',   // 深绿
  '#3D2D3D',   // 深紫
  '#2F3036',   // 灰
  '#1F2C2F',   // 深青
  '#3E3329',   // 深棕
  '#D4C39A',   // 米黄(高亮卡片)
  '#9DA3B8',   // 浅紫灰(高亮卡片)
  '#4A3A2E',   // 暖棕
  '#2A2E3C',   // 蓝紫
  '#363145',   // 紫
];

export const NFT_BG_PALETTE_LIGHT = [
  '#E5DFD0',   // 米
  '#D4D8DC',   // 灰蓝
  '#D8E0D0',   // 绿米
  '#E0D4D8',   // 粉米
  '#D4D0CC',   // 灰米
  '#CCD8D8',   // 青米
  '#E0D8C8',   // 暖米
  '#A8A29A',   // 深米
];

export function getNFTBgColor(tokenId: number, theme: 'dark' | 'light'): string {
  const palette = theme === 'dark' ? NFT_BG_PALETTE_DARK : NFT_BG_PALETTE_LIGHT;
  return palette[tokenId % palette.length];
}
```

---

## 2. 字体系统

### 字体选型

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

// 主字体:Inter
// Unipeg 用的字体类似 Söhne/Suisse,Inter 最接近的免费替代
const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],  // 必须有 900 black
  variable: '--font-sans',
  display: 'swap',
});

// 等宽字体:JetBrains Mono(用于地址、数字、小标签)
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
```

### 字体使用规则（严格执行）

| 场景 | 字体 | 字号 | 字重 | 颜色 |
|---|---|---|---|---|
| **巨型标题**（Gallery、My uPEGs、Buy uPEG on Uniswap） | sans | 56-72px | **900 black** | text-primary |
| **二级标题**（Get started、章节标题） | sans | 24-28px | 700 | text-primary |
| **正文** | sans | 14-16px | 400 | text-secondary |
| **导航菜单**（Explore、Swap、Collection、More） | sans | 15px | 500 | text-secondary（hover/当前页 text-primary + 下划线） |
| **按钮文字**（Connect wallet、Search、Open Uniswap） | sans | 14px | 500 | 按按钮颜色 |
| **小标签**（EXPLORE、SWAP、COLLECTION、GET STARTED、SEARCH、NETWORK、TOKEN、PAIR） | **mono** | **11-12px** | 500 | **brand-tag**（紫粉） |
| **数字 / 计数**（6428 UPEGS、1635 HOLDERS、价格） | mono | 14-16px | 500 | text-primary |
| **数字小标签**（UPEGS、HOLDERS） | mono | 10-11px | 500 | text-secondary，大写 + 字距宽 |
| **NFT 编号**（UPEG #286963） | mono | 11-13px | 500 | text-primary |
| **NFT 卡片下"UPEG"前缀** | mono | 10-11px | 500 | text-secondary 大写 |
| **地址 / 合约**（0x44b28991...） | mono | 13-14px | 400 | text-primary 或 text-secondary |

### 字体细节

**等宽小标签必须遵循：**
```css
.brand-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-tag);
}
```

**巨型标题必须遵循：**
```css
.display-huge {
  font-family: var(--font-sans);
  font-size: 64px;              /* 移动端缩到 40px */
  font-weight: 900;
  letter-spacing: -0.02em;      /* 紧凑字距 */
  line-height: 1;
  color: var(--text-primary);
}
```

---

## 3. 布局规范

### 顶部导航 Header（严格按截图还原）

```
┌────────────────────────────────────────────────────────────────────┐
│ 🦄 Logo     Explore  Swap  Collection  Market ↗ More >    ☀️ [Connect wallet] │
│              ─────                                                   │
└────────────────────────────────────────────────────────────────────┘
   Logo(左)        导航菜单(居中)                           主题切换 + 钱包按钮(右)
```

**重要细节：**
- 顶部 padding：上下 24px，左右 48px（移动端缩到 16px）
- Logo：紫粉色像素独角兽图标 + "Unipeg" 文字（我们换成 "Four.meme" 或项目名）
- 导航菜单：**居中对齐**（不是左对齐！这是 unipeg.art 的特色）
- 当前页：文字 text-primary 颜色，**下方有一条 2px 短下划线**
- "Market ↗" 外链：右上角带斜箭头图标
- "More >" 下拉：右侧带 chevron
- 主题切换按钮：圆角方形，深色边框，里面是 ☀️/🌙 图标
- Connect wallet 按钮：**米白底（dark）/ 黑底（light）** + 反色文字
- 按钮圆角：8px
- 按钮 padding：8px 16px

### 内容容器

```css
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 48px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
```

### 页面顶部区块（标题区）

```
EXPLORE                                    6428 UPEGS    1635 HOLDERS

Gallery
█████████ (巨大黑色加粗)
```

**结构：**
- 顶部小标签（如 `EXPLORE`）：紫粉色 mono，大写，字距宽，11-12px
- 主标题：64-72px black，紧贴小标签下方（margin-top: 8-12px）
- 右上角数据：每个数据由一行大数字 + 一行小标签组成
  - 大数字：mono，16px，text-primary
  - 小标签：mono，11px，text-secondary，大写 + 字距宽
- 整个区块下方留白：48-64px

### 画廊网格（核心）

```css
/* 桌面端:6 列 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

/* 平板:4 列 */
@media (max-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 手机:3 列 */
@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}
```

---

## 4. NFT 卡片设计（核心组件）⭐

### 视觉结构（基于截图）

```
┌──────────────────┐
│                  │  ← 卡片背景色(每个 NFT 不同)
│                  │
│   🦄 像素画      │  ← NFT 图像,居中,占卡片约 75% 高度
│                  │     注意:不是占满整个卡片!
│                  │
│                  │
├──────────────────┤  ← 无明显分割线,靠间距区分
│ UPEG #286963     │  ← mono 字体
└──────────────────┘
```

### 关键尺寸（严格遵守）

```css
.nft-card {
  aspect-ratio: 1 / 1;             /* 正方形 */
  background-color: var(--card-bg); /* 由 getNFTBgColor() 决定 */
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.nft-card-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  min-height: 0;
}

.nft-card-image img,
.nft-card-image svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;       /* 像素艺术必须 */
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.nft-card-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nft-card-label .id {
  color: var(--text-primary);
  margin-left: 4px;
}

/* hover:仅轻微上移,不要发光 */
.nft-card:hover {
  transform: translateY(-2px);
}
```

### 特殊标签（如 TWIN）

部分卡片有右上角标签（如截图中 `UPEG #286766 [TWIN]`）：

```css
.nft-card-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 5. 装饰元素

### 背景模糊 NFT（标志性手法）⭐

参考 Swap 页和 Collection 页截图：**四周散落极低透明度的 NFT 图，作为氛围装饰**。

```css
.bg-floating-nfts {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.floating-nft {
  position: absolute;
  width: 120px;
  height: 120px;
  opacity: 0.08;                   /* 极低透明度 */
  filter: blur(8px);               /* 模糊 */
  image-rendering: pixelated;
}

/* 随机分布 10-15 个 */
.floating-nft:nth-child(1) { top: 15%; left: 8%; }
.floating-nft:nth-child(2) { top: 35%; left: 2%; }
.floating-nft:nth-child(3) { top: 70%; left: 12%; }
.floating-nft:nth-child(4) { top: 20%; right: 5%; }
.floating-nft:nth-child(5) { top: 50%; right: 8%; }
/* ... */
```

**实现要点：**
- 在画廊页和 Collection 页，**未连接钱包**时显示更多（页面更空）
- 在 Gallery 页有大量真实 NFT 时，**只在网格外的边缘区域**显示
- 分布要随机但均匀，不要堆在一起
- 不允许动画 / 飘动 —— **静止不动**（Unipeg 是静止的）

### 其他装饰

**没有了。** Unipeg 极简到只剩内容本身。**禁止添加：**
- ❌ 渐变背景
- ❌ 噪点纹理
- ❌ 玻璃光感
- ❌ 网格背景
- ❌ 发光 / 阴影
- ❌ 粒子动画
- ❌ Hover 高亮发光

---

## 6. 主题切换（必须实现）

### 切换按钮位置

顶部 Header 右侧，紧贴 "Connect wallet" 按钮左边。

### 切换按钮样式

```tsx
<button className="theme-toggle">
  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
</button>
```

```css
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.theme-toggle:hover {
  background: var(--bg-hover);
}
```

### 切换逻辑

使用 `next-themes` 库实现：

```typescript
// providers/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"            // 默认黑夜模式
      enableSystem={false}            // 不跟随系统
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 切换动画

**禁止使用过渡动画**（unipeg.art 是瞬间切换的）。要求：
- 切换瞬时
- 不允许 fade / slide
- NFT 卡片背景色立即从 dark 色板切换到 light 色板

---

## 7. 交互细节（参考截图体验）

### Hover 效果（保持克制）

| 元素 | Hover 效果 |
|---|---|
| 导航菜单 | 文字颜色变 text-primary |
| 按钮（Connect wallet） | 背景色微亮 |
| NFT 卡片 | 仅 translateY(-2px)，**无发光** |
| 排序按钮（Newest/Oldest） | 边框变明显 |
| 输入框 | 边框轻微变亮 |
| 主题切换 | 背景微亮 |

### 选中态（截图中 "Newest" 按钮被选中）

```css
.toggle-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
}

.toggle-btn[data-active="true"] {
  color: var(--text-primary);
  border-color: var(--border-active);
  background: var(--bg-surface);
}
```

### 输入框（Search）

参考截图的 Search 输入框：

```css
.input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: var(--font-mono);     /* mono 字体 */
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  border-color: var(--border-active);
}
```

### 主按钮

参考截图 "Connect wallet"、"Search →"、"Open Uniswap →"：

```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-radius: 8px;
  border: none;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
}

/* "Open Uniswap →" 这种带箭头的按钮 */
.btn-arrow::after {
  content: '→';
}
```

### 次按钮

```css
.btn-secondary {
  height: 44px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-input);
}
```

---

## 8. 动画规范（极简）

### 唯一允许的动画

```css
/* 入场淡入(仅页面切换 / 首次加载) */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* NFT 卡片错峰淡入(网格加载时) */
.nft-card {
  animation: fade-in 0.3s ease-out backwards;
}

.nft-card:nth-child(n) {
  animation-delay: calc(var(--index, 0) * 0.02s);
}
```

### 禁止的动画

- ❌ Framer-motion 复杂动画
- ❌ 滚动触发动画
- ❌ 数字滚动动画（直接显示最终数字）
- ❌ 浮动 NFT（保持静止）
- ❌ 闪烁 / 脉动
- ❌ 渐变流动

**Unipeg 的核心气质是"静"，不要让页面"动起来"。**

---

# 🛠 技术栈

| 类别 | 选型 | 版本 | 备注 |
|---|---|---|---|
| 框架 | **Next.js** | 14.x (App Router) | |
| 语言 | **TypeScript** | 5.x | 严格模式 |
| 钱包 | **wagmi + viem** | wagmi v2 | mock 阶段也用真实库 |
| 钱包 UI | **RainbowKit** | v2 | 用 unipeg 类似风格自定义 |
| 样式 | **Tailwind CSS** | 3.x | |
| UI 组件 | **shadcn/ui** | 最新 | 按需引入 |
| 状态 | **TanStack Query** | v5 | |
| 虚拟列表 | **@tanstack/react-virtual** | v3 | 必需 |
| 主题 | **next-themes** | 0.3.x | ⭐ 黑夜白天切换 |
| HTTP | **Axios** | 1.x | |
| 国际化 | **next-intl** | 3.x | 中/英 |
| 图标 | **lucide-react** | 最新 | |
| SVG 安全 | **dompurify** | 3.x | |
| 工具 | dayjs / clsx / nanoid | | |

**禁止安装：** framer-motion（用不上）、styled-components（用 Tailwind）、moment（用 dayjs）。

---

# 📁 项目目录结构

```
fourmeme-nft-gallery/
├── app/
│   ├── layout.tsx                     # 根布局
│   ├── page.tsx                       # 首页(Explore = Gallery 主入口)
│   ├── globals.css                    # 全局 CSS 变量 + 重置
│   ├── gallery/
│   │   └── [tokenId]/
│   │       └── page.tsx               # NFT 详情页
│   ├── swap/
│   │   └── page.tsx                   # Swap 页(参考截图 2)
│   ├── collection/
│   │   └── page.tsx                   # My Collection 页(参考截图 3)
│   └── about/
│       └── page.tsx                   # 关于(More 下拉里的子页面,可选)
│
├── components/
│   ├── ui/                            # shadcn/ui 基础
│   ├── layout/
│   │   ├── Header.tsx                 # 顶部导航 ⭐
│   │   ├── Footer.tsx
│   │   ├── Container.tsx              # 1240px 居中容器
│   │   ├── PageTitle.tsx              # 小标签 + 大标题组件
│   │   └── FloatingBgNFTs.tsx         # 背景散落 NFT 装饰 ⭐
│   ├── nft/
│   │   ├── OnchainSVG.tsx             # 链上 SVG 渲染 ⭐ 核心
│   │   ├── NFTCard.tsx                # 单 NFT 卡片 ⭐
│   │   ├── NFTGrid.tsx                # 6 列响应式网格
│   │   ├── NFTGridVirtual.tsx         # 虚拟列表版
│   │   ├── NFTDetail.tsx              # 详情主体
│   │   ├── NFTTraits.tsx              # 属性
│   │   ├── NFTHistory.tsx             # 时间线
│   │   └── NFTSkeleton.tsx            # 骨架屏
│   ├── filter/
│   │   ├── SortToggle.tsx             # Newest / Oldest 切换
│   │   ├── FilterDropdown.tsx         # FILTERS All ▾
│   │   └── SearchInput.tsx            # 搜索框 ⭐
│   ├── stats/
│   │   ├── StatsInline.tsx            # 顶部右上角数据(6428 UPEGS)
│   │   └── StatCard.tsx               # 详情页数据卡片
│   ├── wallet/
│   │   ├── ConnectButton.tsx          # 自定义连接按钮
│   │   ├── NetworkGuard.tsx
│   │   └── WalletMenu.tsx
│   ├── theme/
│   │   └── ThemeToggle.tsx            # ☀️/🌙 切换按钮 ⭐
│   ├── trade/
│   │   ├── TransferDialog.tsx
│   │   └── SwapRedirect.tsx           # Swap 页主体(参考截图 2)
│   └── common/
│       ├── AddressDisplay.tsx
│       ├── CopyButton.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── Toast.tsx
│       └── Loading.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   ├── types.ts                   # 类型定义 ⭐
│   │   ├── collections.ts
│   │   ├── nfts.ts
│   │   ├── users.ts
│   │   ├── trades.ts
│   │   └── mock/
│   │       ├── svgGenerator.ts        # 像素 SVG 生成 ⭐
│   │       ├── dataFactory.ts
│   │       ├── colors.ts              # NFT 卡片色板 ⭐
│   │       ├── handlers.ts
│   │       └── seedData.json
│   ├── nft/
│   │   ├── parseTokenURI.ts
│   │   ├── normalize.ts
│   │   └── multicallTokenURI.ts
│   ├── contracts/
│   │   ├── abis/
│   │   │   ├── ERC721.json
│   │   │   └── FourMemeFactory.json
│   │   ├── addresses.ts
│   │   └── hooks/
│   │       ├── useTokenURI.ts
│   │       ├── useNFTOwner.ts
│   │       └── useNFTTransfer.ts
│   ├── format.ts
│   ├── chains.ts
│   └── utils.ts
│
├── hooks/
│   ├── useNFTList.ts
│   ├── useNFTDetail.ts
│   ├── useUserNFTs.ts
│   ├── useNFTHistory.ts
│   ├── useStats.ts
│   └── useMockTransaction.ts
│
├── providers/
│   ├── WagmiProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
│
├── config/
│   ├── env.ts
│   ├── site.ts
│   └── nav.ts
│
├── messages/
│   ├── zh.json
│   └── en.json
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── og-image.png
│
├── docs/
│   ├── SPEC.md                        # 本文档
│   └── screenshots/                   # unipeg.art 参考截图 ⭐
│       ├── 01-gallery-dark.png
│       ├── 02-swap-dark.png
│       └── 03-collection-dark.png
│
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# ⭐ Mock 数据策略

## SVG 生成器（核心）

`lib/api/mock/svgGenerator.ts`：

```typescript
/**
 * 生成 24x24 像素艺术 SVG(模拟链上 NFT)
 * 必须生成"独角兽 / 飞马 / 兽形"形状,不是抽象图案
 */
export function generatePixelSVG(tokenId: number): string {
  const rng = seedRandom(tokenId);

  // 真实的独角兽色板(参考截图)
  const bodyColors = [
    '#94B5E5', '#F5E5C5', '#E5A294', '#94E5B5',
    '#C594E5', '#E5E5C5', '#E5C5B5', '#5BC9A8',
    '#F5A89D', '#A8D5F5', '#E89DD4', '#B5E594',
  ];
  const accentColors = ['#FFB8D1', '#FFD580', '#7DD3FC', '#F0E68C'];

  const bodyColor = bodyColors[Math.floor(rng() * bodyColors.length)];
  const maneColor = bodyColors[Math.floor(rng() * bodyColors.length)];
  const accentColor = accentColors[Math.floor(rng() * accentColors.length)];

  // 在 24x24 网格中绘制独角兽形状
  const pixels = drawUnicorn(rng, bodyColor, maneColor, accentColor);

  let rects = '';
  pixels.forEach(({ x, y, color }) => {
    rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges" width="480" height="480">${rects}</svg>`;

  return svg;
}

/**
 * 绘制独角兽形状(简化版)
 * Claude Code 需实现 10-20 个不同的独角兽模板
 * 形态包括:站立、飞翔(带翅膀)、低头、回头、奔跑等
 */
function drawUnicorn(rng: () => number, bodyColor: string, maneColor: string, accentColor: string) {
  // 模板示例:站立独角兽
  // 实际请实现多个模板,根据 rng 随机选一个
  const template = [
    [11, 5, 'horn'], [12, 5, 'horn'],
    [10, 6, 'mane'], [11, 6, 'mane'], [12, 6, 'body'], [13, 6, 'body'],
    [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'],
    [9, 8, 'mane'], [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
    [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'],
    [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'],
    [10, 11, 'body'], [13, 11, 'body'],
    [10, 12, 'body'], [13, 12, 'body'],
    [10, 13, 'body'], [13, 13, 'body'],
    [10, 14, 'accent'], [13, 14, 'accent'],
  ];

  const colorMap: Record<string, string> = {
    body: bodyColor,
    mane: maneColor,
    accent: accentColor,
    horn: '#FFFFFF',
  };

  return template.map(([x, y, role]) => ({
    x: x as number,
    y: y as number,
    color: colorMap[role as string],
  }));
}

export function svgToDataURI(svg: string): string {
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function generateMockMetadata(tokenId: number) {
  return {
    name: `uPEG #${tokenId}`,
    description: 'Fully on-chain pixel art NFT.',
    image: svgToDataURI(generatePixelSVG(tokenId)),
    attributes: generateTraits(tokenId),
  };
}

function seedRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xFFFFFFFF;
  };
}

function generateTraits(tokenId: number) {
  const rng = seedRandom(tokenId);
  return [
    { trait_type: 'Layer', value: ['Background', 'Foreground', 'Twin'][Math.floor(rng() * 3)] },
    { trait_type: 'Body', value: ['Pegasus', 'Unicorn', 'Beast', 'Phantom'][Math.floor(rng() * 4)] },
    { trait_type: 'Color', value: ['Mint', 'Coral', 'Lavender', 'Cream', 'Sky'][Math.floor(rng() * 5)] },
    { trait_type: 'Rarity', value: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(rng() * 4)] },
  ];
}
```

> ⚠️ **Claude Code 注意：** 上面的独角兽模板只是示例。实际实现时**请生成 10-20 个不同的独角兽 / 飞马模板**，参考截图 1 里那些像素独角兽的样子。

## 数据量要求

| 实体 | 数量 |
|---|---|
| NFT 总数 | **6428**（对应截图的"6428 UPEGS"） |
| Holders | **1635**（对应截图） |
| 单个用户持有 NFT | 5-20 个（连接钱包后） |
| 每个 NFT 的 traits | 4 个 |
| 每个 NFT 的历史 | 3-10 条 |

---

# 📄 页面规范

## 1. 首页 / Explore Gallery (`app/page.tsx`)

**严格还原截图 1。**

```
┌───────────────────────────────────────────────────────────────────┐
│ Header                                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│  EXPLORE                                  6428 UPEGS  1635 HOLDERS │
│                                                                     │
│  Gallery                                                            │
│                                                                     │
│  SEARCH  Wallet address (0x…) or uPEG ID                            │
│  ┌─────────────────────────────────────┐  ┌─────────┐              │
│  │ e.g. 0x1234… or 32694               │  │Search → │              │
│  └─────────────────────────────────────┘  └─────────┘              │
│                                                                     │
│  [Newest] Oldest    FILTERS All ▾                                  │
│                                                                     │
│  ┌──┬──┬──┬──┬──┬──┐                                              │
│  │🦄│🦄│🦄│🦄│🦄│🦄│   <- 6 列 NFT 网格                            │
│  ├──┼──┼──┼──┼──┼──┤                                              │
│  │🦄│🦄│🦄│🦄│🦄│🦄│                                              │
│  └──┴──┴──┴──┴──┴──┘                                              │
└───────────────────────────────────────────────────────────────────┘
```

**关键点：**
- 默认显示所有 6428 个 NFT
- Search 输入支持钱包地址过滤 / NFT ID 跳转
- 排序：Newest（默认选中）/ Oldest
- Filter：下拉过滤属性
- 网格用虚拟列表

## 2. Swap 页 (`app/swap/page.tsx`)

**严格还原截图 2。**

```
┌───────────────────────────────────────────────────────────────────┐
│ Header                                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        SWAP                                         │
│                        Buy uPEG on Uniswap                          │
│                                                                     │
│                  Token and network are already set.                 │
│                  Open Uniswap, confirm the amount,                  │
│                  and your uPEG arrives in your wallet.              │
│                                                                     │
│                  ─────────────────────────────                      │
│                  NETWORK              Ethereum                      │
│                  TOKEN     0x44b28991b167582f18ba0259e0173176ca125505│
│                  PAIR                 ETH → uPEG                    │
│                                                                     │
│                  ┌────────────────────────────────────┐            │
│                  │       Open Uniswap →               │            │
│                  └────────────────────────────────────┘            │
│                                                                     │
│                  Your collection updates automatically              │
│                  once the swap is confirmed.                        │
│                                                                     │
│            (背景散落模糊 NFT 装饰)                                   │
└───────────────────────────────────────────────────────────────────┘
```

**关键点：**
- 居中布局（max-width: 640px）
- 紫粉小标签 "SWAP" + 大标题
- 网络/代币/交易对：mono 字体显示，**左侧标签 mono 紫粉，右侧值 mono 主文字色**
- 主按钮：宽度填满，米白底黑字
- 底部说明：text-secondary，居中
- 背景散落 NFT 装饰

## 3. Collection 页 (`app/collection/page.tsx`)

**严格还原截图 3。**

```
┌───────────────────────────────────────────────────────────────────┐
│ Header                                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│  COLLECTION                                                         │
│                                                                     │
│  My uPEGs                              [Wrap to microPEG] [uPEGs] [NFTs]│
│  ─────────────────────                                             │
│                                                                     │
│  GET STARTED                                                        │
│  Connect a wallet                                                   │
│                                                                     │
│  Connect your wallet to view your collection.                       │
│                                                                     │
│  [Connect wallet]                                                   │
│                                                                     │
│       (背景散落模糊 NFT 装饰)                                        │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

**关键点：**
- 未连接钱包：紫粉 "GET STARTED" 小标签 + 黑色大标题 "Connect a wallet" + 描述 + 米白按钮
- 连接钱包后：展示该用户持有的 NFT
- 标题下方有横向分割线
- 右上角 Tab：`Wrap to microPEG` / `uPEGs` / `NFTs`

## 4. NFT 详情页 (`app/gallery/[tokenId]/page.tsx`)

unipeg.art 截图中没有详情页，**自由发挥但严守视觉风格**：

```
┌───────────────────────────────────────────────────────────────────┐
│ Header                                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ← Back                                                             │
│                                                                     │
│  ┌────────────────┐  UPEG                                           │
│  │                │  #286963                                        │
│  │                │  ─────────                                      │
│  │   🦄 大图       │  OWNER  0x1234...5678                          │
│  │                │  LAYER  Background                              │
│  │                │  BODY   Pegasus                                 │
│  │                │  ...                                            │
│  └────────────────┘                                                 │
│                      ┌──────────────────────┐                      │
│                      │ Transfer             │                      │
│                      └──────────────────────┘                      │
│                                                                     │
│  HISTORY                                                            │
│  ─────────────                                                      │
│  • Mint     by 0x... at 2024-05-12 14:23                            │
│  • Transfer from 0x... to 0x... at 2024-05-15 09:11                │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

**关键点：**
- 左侧大图（aspect-ratio 1:1），背景色用该 NFT 的卡片色
- 右侧信息列表：mono 字体小标签 + 主色值
- 属性垂直列表（不是横向卡片）
- 转移按钮：米白底黑字
- 历史时间线：极简，无图标，靠 mono 字体和颜色区分

---

# 🔌 API 接口规范

> ⚠️ Demo 阶段全部 mock。接口形状按真实规范设计，后期切换只改 `lib/api/client.ts`。

## 基础约定

- **Base URL：** `NEXT_PUBLIC_API_BASE_URL`
- **响应：** `{ code, message, data }`
- **分页：** `{ list, total, page, pageSize, hasMore }`

## 接口清单

```
# NFT
GET  /api/v1/nfts?page=1&pageSize=60&sort=newest&owner=0x...&search=xxx
     → { list: NFT[], total, hasMore }

GET  /api/v1/nfts/:tokenId
     → NFT

GET  /api/v1/nfts/:tokenId/history
     → { list: Activity[] }

# Stats
GET  /api/v1/stats
     → { totalSupply, holders, volume24h, ... }

# Users
GET  /api/v1/users/:address/nfts?page=1&pageSize=60
     → { list: NFT[], total, hasMore }

GET  /api/v1/users/:address/activities
     → { list: Activity[] }

# Search
GET  /api/v1/search?q=xxx
     → { type: 'address' | 'tokenId', result: ... }
```

## TypeScript 类型

```typescript
// lib/api/types.ts

export interface NFT {
  contract: string;
  tokenId: string;
  owner: string;
  tokenURI: string;                  // data:application/json;base64,...
  metadata: NFTMetadata;
  bgColor?: string;                   // 卡片背景色
  tags?: string[];                    // 如 ['TWIN']
  listed?: boolean;
  listPrice?: string;
  lastSalePrice?: string;
  lastSaleTime?: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;                      // data:image/svg+xml;base64,...
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface Activity {
  type: 'mint' | 'transfer' | 'sale';
  from: string;
  to: string;
  tokenId: string;
  price?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface Stats {
  totalSupply: number;
  holders: number;
  volume24h: string;
  volumeTotal: string;
}
```

---

# 🔗 链上交互（Mock 阶段）

## Wagmi 配置

```typescript
// providers/WagmiProvider.tsx
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Four.meme Gallery',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [bsc, bscTestnet],
  ssr: true,
});
```

## Mock 交易流程

```typescript
// hooks/useMockTransaction.ts
export function useMockTransfer() {
  const [status, setStatus] = useState<'idle' | 'signing' | 'pending' | 'mining' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');

  const transfer = async (params: { to: string; tokenId: string }) => {
    setStatus('signing');
    await sleep(800);
    setStatus('pending');
    const hash = generateTxHash();
    setTxHash(hash);
    await sleep(1200);
    setStatus('mining');
    await sleep(2500);
    if (Math.random() > 0.1) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return { transfer, status, txHash };
}
```

---

# ⚙️ 环境变量

`.env.example`：

```bash
# ===== Mock 切换 =====
NEXT_PUBLIC_USE_MOCK=true

# ===== API(待真实后端) =====
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_API_VERSION=v1

# ===== 链 =====
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56
NEXT_PUBLIC_BSC_MAINNET_RPC=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/

# ===== 钱包 =====
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# ===== 合约(占位) =====
NEXT_PUBLIC_NFT_ADDRESS_MAINNET=
NEXT_PUBLIC_NFT_ADDRESS_TESTNET=

# ===== 站点 =====
NEXT_PUBLIC_SITE_NAME=Four.meme Gallery
NEXT_PUBLIC_SITE_URL=
```

---

# ✅ 开发阶段拆解

## Phase 1：项目骨架 + 主题系统（Day 1-2）⭐ 视觉基础

- [ ] 初始化 Next.js 14 + TypeScript + Tailwind
- [ ] 配置字体（Inter + JetBrains Mono）
- [ ] **配置 CSS 变量两套主题**（dark + light）
- [ ] **集成 next-themes，实现主题切换**
- [ ] 全局样式：背景、滚动条、字体
- [ ] 安装 shadcn/ui（按需）：Button、Dialog、Toast、Skeleton、Popover
- [ ] 配置 wagmi + viem + RainbowKit
- [ ] 配置 TanStack Query
- [ ] **实现 `<Header />`**（居中导航、Logo、主题切换、连接钱包按钮）
- [ ] **实现 `<ThemeToggle />`** ⭐
- [ ] 实现 `<Container />` 布局
- [ ] **完成验收：打开首页有顶部导航,可以切换黑夜白天**

## Phase 2：Mock 数据系统（Day 3）

- [ ] 实现 `svgGenerator.ts`（10-20 个独角兽模板）
- [ ] 实现 `colors.ts`（NFT 卡片色板）
- [ ] 实现 `dataFactory.ts`（生成 6428 个 NFT 数据）
- [ ] 实现 `parseTokenURI.ts`
- [ ] 实现 mock API handlers
- [ ] 实现 mock / real 切换
- [ ] **完成验收：console 调用 mock API 拿到 6428 个 NFT 数据,SVG 可视化**

## Phase 3：核心组件（Day 4-5）⭐ 视觉重点

- [ ] **`<OnchainSVG />`**（核心，DOMPurify 清洗）
- [ ] **`<NFTCard />`**（严格按截图样式）
- [ ] `<NFTSkeleton />`
- [ ] **`<NFTGrid />`**（6/4/3 列响应式）
- [ ] **`<NFTGridVirtual />`**（虚拟列表）
- [ ] `<AddressDisplay />`、`<CopyButton />`
- [ ] `<PageTitle />`（小标签 + 大标题组件）
- [ ] `<FloatingBgNFTs />`
- [ ] **完成验收：NFTCard 测试页黑夜白天切换正确,像 unipeg.art**

## Phase 4：核心页面（Day 6-9）⭐ Demo 灵魂

### Day 6：Gallery 首页（最重要）
- [ ] 顶部小标签 + 大标题 + 右上角统计
- [ ] Search 输入框 + Search 按钮
- [ ] Newest/Oldest 切换 + Filters 下拉
- [ ] 6 列虚拟网格
- [ ] 错峰淡入动画

### Day 7：Collection 页
- [ ] 未连接钱包：GET STARTED 引导
- [ ] 连接后：我的 NFT 网格
- [ ] 右上角 Tab 切换
- [ ] 背景散落 NFT

### Day 8：Swap 页
- [ ] 居中卡片布局
- [ ] 网络/代币/交易对显示（mono 字体对齐）
- [ ] Open Uniswap 按钮
- [ ] 背景散落 NFT

### Day 9：NFT 详情页
- [ ] 左大图 + 右属性
- [ ] 历史时间线
- [ ] Transfer 按钮（持有时显示）

## Phase 5：交互完善(Day 10-11)

- [ ] `<TransferDialog />` + mock 流程
- [ ] Toast 通知（极简风格）
- [ ] 网络守卫
- [ ] 所有按钮 disabled / loading 状态
- [ ] 错误边界、空状态
- [ ] **完成验收：连接钱包→选 NFT→转移,完整流畅**

## Phase 6：移动端 + SEO（Day 12-13）

- [ ] 移动端适配
- [ ] 国际化（中/英切换）
- [ ] SEO meta + OG 图
- [ ] CSP 策略
- [ ] 性能优化

## Phase 7：部署（Day 14）

- [ ] 部署 Vercel
- [ ] 域名配置
- [ ] 录屏 2-3 分钟演示

**总周期：14 天（2 周）**

---

# 📐 代码规范

## TypeScript
- 严格模式，禁用 `any`
- 所有组件 props 必须有 interface
- 所有 API 响应必须有类型

## 命名
- 组件：`PascalCase`
- Hook：`use*`
- 工具：`camelCase`
- 常量：`UPPER_SNAKE_CASE`

## 文件组织
- 每个组件一个文件
- 业务逻辑下沉到 hooks
- API 走 `lib/api/`
- 类型集中 `lib/api/types.ts`

---

# 🚨 重要约束（必须遵守）

1. **视觉必须严格匹配 unipeg.art** —— 每个页面完成后对比截图自查
2. **不允许添加截图中没有的视觉元素** —— 玻璃光感、cyber 配色、渐变背景全部禁用
3. **必须支持黑夜白天切换** —— 测试每个页面在两种模式下都正常
4. **Demo 必须独立运行** —— `npm install && npm run dev` 直接跑
5. **所有按钮可点** —— 没有"无效"按钮
6. **API 类型集中管理** —— 后期替换只改 `lib/api/`
7. **合约地址 / chainId 走环境变量**
8. **地址校验** —— viem 的 `isAddress`
9. **金额用 bigint (wei)** —— 显示再格式化
10. **DOMPurify 清洗 SVG**
11. **图片必须用 `<OnchainSVG />`** —— 不直接 `<img>`
12. **TODO 必须标记**：`// TODO: replace with real API`
13. **禁止：framer-motion、styled-components、复杂动画库**

---

# 🎯 验收清单（对照 unipeg.art）

让客户看 Demo 时，**16 个验收点**：

- [ ] 1. 打开首页是黑夜模式，背景纯黑
- [ ] 2. 顶部 Logo 在左、菜单**居中**、钱包按钮在右
- [ ] 3. 当前页菜单文字下方有短下划线
- [ ] 4. 顶部右侧有 ☀️/🌙 切换按钮，点击立即切换主题
- [ ] 5. 白天模式背景变成米白色，所有文字反色，NFT 卡片背景变成浅色色板
- [ ] 6. 首页有紫粉小标签 "EXPLORE" + 巨大黑色 "Gallery" 标题
- [ ] 7. 右上角显示 "6428 UPEGS  1635 HOLDERS"（数字 mono，小标签紫粉/灰）
- [ ] 8. 6 列 NFT 网格，每个卡片有自己的背景色
- [ ] 9. NFT 卡片底部显示 "UPEG #286963" 格式（mono 字体）
- [ ] 10. Search 输入框 + Search → 按钮可用
- [ ] 11. Newest/Oldest 切换正确
- [ ] 12. 滚动到底部继续加载（虚拟列表无卡顿）
- [ ] 13. 点击 NFT 进入详情页，再返回不丢失滚动位置
- [ ] 14. Connect Wallet 按钮可点，连接后右上显示地址
- [ ] 15. Collection 页未连接时显示 "Connect a wallet" 引导
- [ ] 16. 移动端打开 6 列变 3 列，所有内容正常

**14 项以上完美 = 客户满意 = 项目通过**

---

# 💬 与客户沟通策略

## Demo 完成后给客户发的消息

```
Four.meme NFT Gallery Demo 出来了:
https://fourmeme-gallery-demo.vercel.app

参考 unipeg.art 的视觉风格,核心功能已全部实现:
- 完整画廊(6428 个 mock NFT,可滚动加载)
- 黑夜/白天模式切换
- 钱包连接 + 模拟转移
- 中英文切换
- 移动端适配

请重点确认:
1. 视觉风格是否符合预期(对比 unipeg.art)
2. 数据展示和交互流程
3. 功能是否还有遗漏

确认后请提供:
- NFT 合约 ABI + 地址
- 后端 API 文档

1-2 周完成真实对接 + 上线。
```

---

# 🔖 附录

## A. 必看参考截图

文档目录 `docs/screenshots/` 下：
- `01-gallery-dark.png` —— 画廊页（截图 1）
- `02-swap-dark.png` —— Swap 页（截图 2）
- `03-collection-dark.png` —— Collection 页（截图 3）

**Claude Code 实现每个页面前，必须先打开对应截图查看。**

## B. 参考链接

- **Unipeg**：https://unipeg.art ⭐ 视觉参考唯一基准
- **Four.meme**：https://four.meme
- wagmi：https://wagmi.sh
- next-themes：https://github.com/pacocoursey/next-themes
- shadcn/ui：https://ui.shadcn.com
- TanStack Virtual：https://tanstack.com/virtual

## C. KING 决策权

以下情况 Claude Code 必须问 KING：
- 截图中未明确的视觉细节
- 与 unipeg.art 风格不符的功能需求
- 性能 / 美学的取舍

## D. 联系方式

- 项目负责人：KING
- 客户群：cebus<>fourmeme
- 客户对接：Adam / Kim / Coming Bit

---

# 🚀 给 Claude Code 的启动指令

```
你要为 Four.meme 做一份 NFT 画廊前端 Demo,严格还原 unipeg.art 的视觉风格。

请仔细阅读本文档,然后:

1. 先打开 docs/screenshots/ 下的 3 张参考截图,描述你看到的视觉特征(给我确认你看懂了)
2. 然后从 Phase 1 开始,做完每个 Phase 跟我确认再继续
3. 视觉质量 = 最高优先级,必须像 unipeg.art
4. Mock 数据要真实,所有交互可点

特别强调:
- 这是 Demo,不需要等后端,全部 mock
- 必须支持黑夜/白天模式切换
- 禁止添加截图中没有的视觉元素(渐变、玻璃光感、cyber 配色等)
- 14 天完成,部署到 Vercel
- 完成后录屏 2-3 分钟给客户看

每完成一个组件,把它和 unipeg.art 截图对比,确认视觉一致后再进下一个。

开始吧。
```

---

**文档结束。Claude Code 请严格按本文档 + 参考截图开发。**
