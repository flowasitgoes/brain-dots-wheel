# Brain Dots - Colors 🎨

一个有趣的颜色匹配游戏！使用相同颜色的轮子击中对应颜色的球来得分。

## 🎮 游戏玩法

- 中心会生成不同颜色的球（红、蓝、黄、绿）
- 球会向左右两侧移动
- 通过触摸/鼠标拖动屏幕左右两侧来控制轮子旋转
- 将轮子的对应颜色象限对准球的颜色
- 颜色匹配则得分，不匹配则游戏结束

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 访问 http://localhost:3636
```

### 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成！

或者使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 📱 移动端支持

- ✅ 响应式设计，适配所有屏幕尺寸
- ✅ 触摸控制支持
- ✅ 支持多点触摸
- ✅ 移动端优化

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **渲染**: HTML5 Canvas API
- **服务端**: Node.js + Express
- **部署**: Vercel

## 📁 项目结构

```
├── index.html          # HTML 结构
├── game.js             # 游戏核心逻辑
├── style.css           # 样式表
├── server.js           # Express 服务器
├── package.json        # 项目配置
└── vercel.json         # Vercel 部署配置
```

## 🎯 特性

- 🎨 流畅的动画效果
- 📊 分数系统和高分记录
- 📈 难度递增系统
- 🔊 音效反馈
- 📱 跨平台支持（桌面和移动端）

## 📄 许可证

查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 原始项目

原始 iOS 版本使用 Swift + SpriteKit 开发。Web 版本是对原项目的 Web 移植。