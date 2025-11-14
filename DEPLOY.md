# 部署指南

## 📦 部署到 Vercel

### 方法 1: 通过 GitHub 部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的GitHub仓库URL>
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测配置并部署

### 方法 2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产环境部署
vercel --prod
```

## 🔧 配置说明

项目已包含 `vercel.json` 配置文件，Vercel 会自动：
- 使用 Node.js runtime 运行 Express 服务器
- 配置必要的安全 headers
- 处理所有路由请求

## 📱 移动端测试

部署后，在手机上访问你的 Vercel URL，测试以下功能：

1. **触摸控制**
   - 左侧屏幕拖动控制左轮
   - 右侧屏幕拖动控制右轮
   - 支持多点触摸（同时控制两个轮子）

2. **响应式设计**
   - 自动适配不同屏幕尺寸
   - 全屏游戏体验

3. **性能测试**
   - 检查游戏流畅度
   - 测试音效播放

## ⚠️ 注意事项

- 确保 `node_modules` 已在 `.gitignore` 中
- Vercel 会自动安装依赖（根据 `package.json`）
- 首次部署可能需要 1-2 分钟

## 🌐 自定义域名

在 Vercel 项目设置中可以添加自定义域名。

## 🔍 调试

如果部署遇到问题：
1. 检查 Vercel 部署日志
2. 确保所有文件都已提交到 GitHub
3. 检查 `package.json` 中的依赖是否正确
