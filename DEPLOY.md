# Four.meme NFT Gallery — 宝塔部署指南

## 文件说明

| 文件 | 大小 | 说明 |
|------|------|------|
| `fourmeme-nft-gallery-dist.zip` | 1.0 MB | **部署包**，纯静态 HTML/CSS/JS，解压后直接放网站目录 |
| `fourmeme-nft-gallery-source.zip` | 734 KB | 源代码，开发/二次修改用 |

---

## 宝塔部署步骤（5分钟完成）

### 1. 上传解压

把 `fourmeme-nft-gallery-dist.zip` 上传到宝塔文件管理器，解压到网站根目录，例如 `/www/wwwroot/fourmeme/`

解压后目录结构：
```
/www/wwwroot/fourmeme/
└── fourmeme-nft-gallery/
    └── out/
        ├── index.html          ← 首页（探索）
        ├── swap/index.html     ← 兑换页
        ├── collection/index.html ← 我的收藏
        ├── gallery/index.html  ← NFT 详情页
        ├── 404.html
        └── _next/              ← CSS/JS 静态资源
```

### 2. 创建静态网站

宝塔面板 → 网站 → 添加站点：
- **域名**：填你的域名
- **网站目录**：`/www/wwwroot/fourmeme/fourmeme-nft-gallery/out`
- **PHP版本**：纯静态，选「不使用」
- **数据库**：不创建

### 3. 配置 Nginx（关键）

宝塔 → 网站 → 你的域名 → 配置文件，在 `location / {` 块内找到 `try_files` 这行，改成：

```nginx
location / {
    try_files $uri $uri/ $uri.html /index.html;
}
```

这行让所有路径都能正确找到对应的 HTML 文件。

完整 nginx location 示例：
```nginx
server {
    listen 80;
    server_name 你的域名;
    root /www/wwwroot/fourmeme/fourmeme-nft-gallery/out;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # 静态资源强缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 访问验证

保存配置 → 点击「重载 Nginx」→ 浏览器访问你的域名

✅ 首页 `/` → 探索画廊  
✅ `/swap/` → 兑换页  
✅ `/collection/` → 我的收藏  
✅ 点击任意 NFT → `/gallery/?id=123` 详情页  

---

## 常见问题

**Q: 访问子页面显示 404？**  
A: Nginx `try_files` 没配置。按第 3 步加上即可。

**Q: 静态资源（图标/字体）加载失败？**  
A: 确认网站根目录是 `out/`，不是 `fourmeme-nft-gallery/`。

**Q: 想绑定 HTTPS？**  
A: 宝塔 → 网站 → SSL → 申请 Let's Encrypt 证书，一键开启。

**Q: 怎么更新站点？**  
A: 重新 `npm run build` 生成新的 `out/` 文件夹，替换服务器上的 `out/` 目录即可。
