# Brain Dots - Colors 项目架构分析

## 📋 项目概述

这是一个颜色匹配游戏，有两个版本：
1. **原始 iOS 版本** - 使用 Swift + SpriteKit 开发
2. **Web 版本** - 使用 HTML5 Canvas + JavaScript 开发

---

## 🍎 原始 iOS 项目架构

### 技术栈
- **语言**: Swift 2.x
- **游戏引擎**: SpriteKit
- **物理引擎**: SpriteKit Physics World
- **音效**: AVFoundation
- **广告**: Google Mobile Ads SDK
- **社交**: Game Center
- **存储**: NSUserDefaults

### 项目结构

```
Brain Dots - Colors/
├── Roll from top/                    # 主应用目录
│   ├── AppDelegate.swift             # 应用程序委托
│   ├── GameViewController.swift      # 游戏视图控制器（MVC 中的 Controller）
│   ├── GameScene.swift               # 游戏场景（核心游戏逻辑）
│   ├── Assets.xcassets/              # 图片资源集合
│   │   ├── main_circle.imageset/     # 轮子图片
│   │   ├── red_circle.imageset/      # 红色球
│   │   ├── blue_circle.imageset/     # 蓝色球
│   │   ├── green_circle.imageset/    # 绿色球
│   │   ├── yellow_circle.imageset/   # 黄色球
│   │   └── ...
│   ├── Base.lproj/                   # Storyboard 文件
│   ├── punch.wav                     # 失败音效
│   └── scored.wav                    # 得分音效
├── GameStartingEndScene.swift        # 开始/结束场景
└── Brain Dots - Colors.xcodeproj/    # Xcode 项目文件
```

### 核心架构组件

#### 1. **AppDelegate.swift** (应用程序入口)
```swift
- 应用程序生命周期管理
- 初始化窗口和根视图控制器
```

#### 2. **GameViewController.swift** (视图控制器层)
```swift
职责：
- 管理 SKView (SpriteKit 视图)
- Game Center 集成（排行榜、分数提交）
- Google AdMob 广告管理
- 场景切换管理
- 社交分享功能
```

#### 3. **GameScene.swift** (游戏场景层 - 核心逻辑)
```swift
职责：
- 游戏状态管理（开始、游戏中、结束）
- 物理引擎配置（contactDelegate）
- 游戏对象创建和管理
  - 中心旋转圆圈（centerImage_1, centerImage_2）
  - 左右轮子（left_quad1, right_quad1）
  - 障碍物球（obstacleArray）
- 触摸事件处理（touchesBegan, touchesMoved, touchesEnded）
- 碰撞检测（didBeginContact）
- 分数系统
- 难度递增逻辑
- 音效播放
```

**关键数据结构**:
```swift
struct obstacleStruct {
    let isLeft: Bool              // 球向左还是右移动
    let spriteNode: SKSpriteNode  // SpriteKit 节点
    let timeCreated: Int64        // 创建时间
}
```

#### 4. **GameStartingEndScene.swift** (开始/结束场景)
```swift
职责：
- 游戏开始界面
- 显示最高分
- 显示上次分数
- 游戏结束界面
- 按钮交互（开始、排行榜、分享、评分）
```

### 设计模式

1. **MVC 模式**
   - Model: GameScene 中的游戏状态和数据结构
   - View: SKView 和 SKSpriteNode
   - Controller: GameViewController

2. **委托模式 (Delegate Pattern)**
   - `SKPhysicsContactDelegate` - 处理物理碰撞
   - `GKGameCenterControllerDelegate` - Game Center 交互
   - `GADInterstitialDelegate` - 广告展示

3. **场景模式 (Scene Pattern)**
   - 使用 SKScene 管理不同的游戏状态
   - 场景切换使用 SKTransition

### 物理引擎

**Bitmask 碰撞检测系统**:
```swift
let left_bitmask = UInt32(0b1)        // 001
let right_bitmask = UInt32(0b10)      // 010
let obstacles_bitmask = UInt32(0b11)  // 011
```

使用 SpriteKit 的 PhysicsBody 和 contactTestBitMask 进行精确碰撞检测。

### 游戏逻辑流程

```
1. 应用启动 → GameViewController.viewDidLoad()
2. 加载开始场景 → GameStartingEndScene
3. 用户点击开始 → 切换到 GameScene
4. 游戏循环：
   - update() - 每帧更新
   - spawnEnimes() - 生成障碍物
   - runAnimations() - 旋转动画
   - 处理触摸输入 → 旋转轮子
   - 碰撞检测 → 判断颜色匹配
   - 更新分数/游戏结束
5. 游戏结束 → 返回 GameStartingEndScene
```

---

## 🌐 Web 版本架构

### 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **渲染**: HTML5 Canvas API
- **服务端**: Node.js + Express
- **存储**: localStorage (浏览器本地存储)
- **音效**: Web Audio API

### 项目结构

```
BrainDotsColors-iOS-master/
├── index.html          # HTML 结构
├── game.js             # 游戏核心逻辑（约 490 行）
├── style.css           # 样式表
├── server.js           # Express 服务器
└── package.json        # 项目配置
```

### 核心架构组件

#### 1. **index.html** (视图层)
```html
结构：
- <canvas id="gameCanvas"> - 游戏画布
- <div id="start-screen"> - 开始界面
- <div id="game-over-screen"> - 游戏结束界面
- <div id="tutorial"> - 教程提示
```

#### 2. **game.js** (游戏逻辑层 - 单文件架构)
```javascript
主要模块：

1. 画布初始化
   - resizeCanvas() - 响应式画布尺寸

2. 游戏状态管理
   - gameState: 'start' | 'playing' | 'gameOver'
   - score, bestScore, gameLevel, framesCount

3. 游戏对象定义
   - centerCircle: { x, y, radius, rotation }
   - leftWheel: { x, y, radius, rotation, touchActive }
   - rightWheel: { x, y, radius, rotation, touchActive }
   - Obstacle 类

4. 渲染系统
   - drawCircle() - 绘制圆形
   - drawWheel() - 绘制轮子（四个颜色象限）
   - drawObstacle() - 绘制障碍物
   - drawScore() - 绘制分数

5. 游戏逻辑
   - spawnObstacle() - 生成障碍物
   - checkCollision() - 碰撞检测（基于距离计算）
   - getWheelColor() - 根据轮子角度计算当前颜色

6. 输入处理
   - 触摸事件（touchstart, touchmove, touchend）
   - 鼠标事件（mousedown, mousemove, mouseup）
   - 坐标转换（getTouchPos）

7. 音频系统
   - Web Audio API
   - playSound() - 生成音效

8. 游戏循环
   - gameLoop() - requestAnimationFrame
   - 更新 → 渲染 → 循环
```

#### 3. **style.css** (样式层)
```css
- 响应式布局（flexbox）
- 渐变背景
- 屏幕叠加层样式
- 按钮交互效果
```

#### 4. **server.js** (服务端)
```javascript
- Express 静态文件服务器
- 端口：3636
- 提供 HTML/CSS/JS 文件服务
```

### 设计模式

1. **面向对象**
   - Obstacle 类封装障碍物属性
   - 游戏对象使用对象字面量

2. **状态机模式**
   - gameState 管理游戏状态
   - 不同状态对应不同的 UI 和逻辑

3. **模块化组织**
   - 功能函数按职责分组
   - 全局变量集中管理

### 渲染系统

**Canvas 2D 渲染**:
- 使用 `ctx.arc()` 绘制圆形
- 使用 `ctx.save()` / `ctx.restore()` 管理变换
- 使用渐变填充创建视觉效果
- 坐标系统：左上角为原点

### 物理系统

**简化的碰撞检测**:
```javascript
function checkCollision(obstacle, wheel, isLeft) {
    const dx = obstacle.x - wheel.x;
    const dy = obstacle.y - wheel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obstacle.size + wheel.radius);
}
```

使用欧几里得距离公式，比 SpriteKit 的物理引擎简单但足够有效。

### 游戏逻辑流程

```
1. 页面加载 → 初始化 Canvas
2. 用户点击开始 → startGame()
3. 游戏循环（requestAnimationFrame）：
   - 更新中心圆圈旋转
   - 生成障碍物（基于帧计数和难度）
   - 更新障碍物位置
   - 处理输入 → 旋转轮子
   - 碰撞检测 → 颜色匹配判断
   - 渲染所有对象
4. 游戏结束 → endGame() → 更新最高分
5. 返回开始界面
```

---

## 🔄 两个版本的对比

| 特性 | iOS 版本 | Web 版本 |
|------|---------|---------|
| **开发语言** | Swift | JavaScript |
| **游戏引擎** | SpriteKit | Canvas API |
| **物理引擎** | SpriteKit Physics | 自定义距离计算 |
| **资源管理** | Assets.xcassets | Canvas 绘制 |
| **音效** | AVFoundation | Web Audio API |
| **存储** | NSUserDefaults | localStorage |
| **触摸处理** | UITouch 事件 | Touch/Mouse 事件 |
| **广告** | Google AdMob | 无 |
| **社交** | Game Center | 无 |
| **文件数** | ~10+ Swift 文件 | 4 个文件 |
| **代码量** | ~800+ 行 | ~490 行 |
| **性能** | 原生性能 | 浏览器性能 |
| **部署** | App Store | Web 服务器 |

### 技术差异

#### 1. **物理引擎**
- **iOS**: SpriteKit 提供完整的物理引擎（重力、碰撞、摩擦等）
- **Web**: 简化实现，只使用距离计算进行碰撞检测

#### 2. **资源加载**
- **iOS**: 使用图片资源（PNG 文件）
- **Web**: 使用 Canvas API 程序化绘制（无需图片文件）

#### 3. **状态管理**
- **iOS**: 使用 SKScene 切换管理状态
- **Web**: 使用 CSS 类切换显示/隐藏 UI 元素

#### 4. **存储**
- **iOS**: NSUserDefaults（键值对存储）
- **Web**: localStorage（浏览器本地存储）

---

## 📊 架构优势

### iOS 版本优势
✅ 原生性能  
✅ 完整的物理引擎  
✅ 丰富的系统集成（Game Center, AdMob）  
✅ 专业的游戏引擎支持  

### Web 版本优势
✅ 跨平台（无需安装）  
✅ 快速部署  
✅ 代码更简洁  
✅ 易于修改和调试  
✅ 无需编译  

---

## 🎯 核心游戏机制

### 颜色匹配逻辑

**轮子颜色象限**:
- 左轮: 从 -3π/4 起始，逆时针排列 [红、蓝、黄、绿]
- 右轮: 从 -π/4 起始，逆时针排列 [绿、黄、红、蓝]

**角度到颜色的映射**:
```javascript
rotation ∈ [-π/2, 0)      → 左轮=蓝色,  右轮=绿色
rotation ∈ [-π, -π/2)     → 左轮=红色,  右轮=黄色
rotation ∈ [0, π/2]       → 左轮=黄色,  右轮=红色
rotation ∈ [π/2, π]       → 左轮=绿色,  右轮=蓝色
```

### 难度递增系统

```javascript
score ≤ 10:   level = 1.5
score ≤ 20:   level = 1.6
score ≤ 30:   level = 1.65
...
score > 140:  level = 2.2

生成间隔 = 240 / gameLevel (越小越快)
```

---

## 🚀 运行方式

### iOS 版本
1. 使用 Xcode 打开 `.xcodeproj`
2. 选择目标设备/模拟器
3. 编译运行

### Web 版本
```bash
npm install
node server.js
# 访问 http://localhost:3636
```

---

## 📝 总结

这是一个典型的**2D 休闲游戏**，核心玩法简单但具有挑战性。两个版本展示了不同平台的技术特点：

- **iOS 版本**使用了成熟的游戏开发框架
- **Web 版本**展示了如何使用 Web 技术实现类似功能

两者都实现了相同的游戏机制，但在实现方式上各有特色。
