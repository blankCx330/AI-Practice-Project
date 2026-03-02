# 📚 Neon Snake 项目技术文档

---

## 📋 目 录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [系统架构](#3-系统架构)
4. [前端实现](#4-前端实现)
5. [后端实现](#5-后端实现)
6. [核心算法](#6-核心算法)
7. [性能优化](#7-性能优化)
8. [文件结构详解](#8-文件结构详解)
9. [关键技术点](#9-关键技术点)
10. [扩展建议](#10-扩展建议)

---

## 1. 项目概述

### 1.1 项目简介

**Neon Snake（霓虹贪吃蛇）** 是一款基于Web技术实现的现代化贪吃蛇游戏，采用Client-Server架构，支持单人练习和多人实时对战。项目使用纯原生Web技术栈，无需复杂框架，具有轻量、易部署的特点。

### 1.2 项目目标

- 实现经典贪吃蛇玩法的现代化呈现
- 提供流畅的60FPS游戏体验
- 支持多人在线对战
- 展示粒子系统和视觉特效
- 提供可扩展的技能系统

### 1.3 技术特性

| 特性 | 实现方式 |
|------|----------|
| 实时通信 | WebSocket |
| 图形渲染 | HTML5 Canvas |
| 游戏循环 | requestAnimationFrame + setInterval |
| 状态管理 | JavaScript对象 |
| 样式效果 | CSS3动画 + 滤镜 |

---

## 2. 技术栈

### 2.1 前端技术

#### 2.1.1 HTML5

- **Canvas API** - 游戏画布渲染
  - `getContext('2d', { alpha: false })` - 优化性能，关闭透明通道
  - `fillRect()` - 绘制蛇身、网格
  - `arc()` - 绘制食物、粒子
  - `createRadialGradient()` - 径向渐变效果
  - `shadowBlur` / `shadowColor` - 发光效果

- **DOM操作** - UI界面控制
  - `getElementById()` - 获取DOM元素
  - `classList.add/remove()` - 显示/隐藏界面
  - `innerHTML` - 动态更新分数

#### 2.1.2 CSS3

- **视觉效果**
  - `box-shadow` - 霓虹发光边框
  - `radial-gradient` - 背景渐变
  - `filter: blur()` - 模糊效果
  - `animation` - 菜单粒子动画

- **布局**
  - Flexbox - 居中布局
  - Absolute定位 - 覆盖层
  - Fixed定位 - 技能栏

#### 2.1.3 JavaScript (ES6+)

- **类系统**
  - `class SnakePlayer` - 玩家类
  - 构造函数、实例方法
  - 技能对象管理

- **异步处理**
  - `setInterval` - 游戏逻辑循环
  - `requestAnimationFrame` - 渲染循环
  - `setTimeout` - 特效定时器
  - WebSocket事件处理

- **数据结构**
  - 数组 - 蛇身、食物、粒子
  - 对象 - 玩家状态、技能配置
  - Map - 服务器端玩家管理

---

### 2.2 后端技术

#### 2.2.1 Node.js

- **事件驱动** - 高并发连接处理
- **单线程** - 游戏逻辑串行执行

#### 2.2.2 WebSocket (ws库)

- **实时双向通信**
  - `WebSocket.Server` - 创建服务器
  - `ws.on('connection')` - 处理连接
  - `ws.send()` - 推送数据
  - `ws.on('message')` - 接收消息

#### 2.2.3 游戏同步

- 状态广播机制
- 帧同步策略
- 玩家加入/离开处理

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │  界面层     │   │  游戏逻辑   │   │  渲染引擎   │      │
│  │  (HTML/CSS) │   │  (script)   │   │  (Canvas)   │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│                    WebSocket连接                           │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    游戏服务器                               │
│                           │                                │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │  连接管理   │   │  房间系统   │   │  游戏逻辑   │      │
│  │             │   │  (Room)    │   │  (update)   │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 客户端架构

```
Client
│
├── UI Layer (HTML/CSS)
│   ├── Start Screen
│   ├── Online Menu
│   ├── Game Screen
│   └── Game Over Screen
│
├── Game Engine (JavaScript)
│   ├── SnakePlayer Class
│   │   ├── snake[] - 蛇身坐标
│   │   ├── direction - 当前方向
│   │   ├── nextDirection - 下一方向
│   │   ├── skills - 技能对象
│   │   └── ...
│   │
│   ├── Game Loop
│   │   ├── updateSinglePlayer() - 单人逻辑
│   │   ├── updateParticles() - 粒子更新
│   │   └── gameLoop() - 渲染循环
│   │
│   ├── Render System
│   │   ├── draw() - 主渲染
│   │   ├── drawSnake() - 蛇绘制
│   │   ├── drawFood() - 食物绘制
│   │   └── drawParticles() - 粒子绘制
│   │
│   └── Effects System
│       ├── createImpactEat()
│       ├── createImpactNuke()
│       ├── createSpecialEffect()
│       └── createImpactDeath()
│
└── Network Layer
    ├── WebSocket Connection
    ├── sendOnline() - 发送消息
    └── handleOnlineMessage() - 接收处理
```

### 3.3 服务器架构

```
Server
│
├── WebSocket Server (ws)
│   └── Connection Handler
│
├── Room Management
│   ├── Room Class
│   │   ├── players - 玩家Map
│   │   ├── foods - 食物数组
│   │   ├── gameLoop - 游戏循环
│   │   └── methods
│   │
│   └── Rooms Map (roomId -> Room)
│
├── Player Management
│   └── Player Class
│       ├── id, color
│       ├── snake[], direction
│       ├── skills - 技能状态
│       └── WebSocket连接
│
└── Message Types
    ├── init - 初始化
    ├── playerJoined - 玩家加入
    ├── playerLeft - 玩家离开
    ├── update - 游戏状态同步
    ├── skill - 技能使用
    └── start - 开始游戏
```

---

## 4. 前端实现

### 4.1 核心类 - SnakePlayer

```javascript
class SnakePlayer {
    constructor(id, color, startX, startY) {
        // 玩家标识
        this.id = id;
        this.color = color;
        
        // 蛇身数据 - 数组存储坐标
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        // 方向控制
        this.direction = { x: 1, y: 0 };   // 当前方向
        this.nextDirection = { x: 1, y: 0 }; // 下一帧方向
        
        // 游戏状态
        this.score = 0;
        this.alive = true;
        this.frozen = false;
        
        // 技能系统
        this.skills = {
            q: { cooldown: 8000, lastUsed: 0, projectile: null },
            w: { cooldown: 15000, lastUsed: 0, timeStopActive: false, zones: [] },
            e: { cooldown: 3000, lastUsed: 0, clones: [], maxClones: 5 },
            r: { cooldown: 25000, lastUsed: 0, blackhole: null }
        };
    }
}
```

**设计要点：**
- 蛇身使用数组存储，索引0为蛇头
- direction和nextDirection分离，防止一帧内多次转向
- 技能使用对象统一管理，支持冷却计时

---

### 4.2 游戏循环实现

#### 4.2.1 逻辑循环 (setInterval)

```javascript
// 120ms 间隔 - 约8FPS游戏速度
singleGameLoop = setInterval(updateSinglePlayer, gameSpeed);

function updateSinglePlayer() {
    // 1. 技能更新
    updateSkills();
    
    // 2. 方向更新
    player.direction = { ...player.nextDirection };
    
    // 3. 移动计算
    let newHead = {
        x: player.snake[0].x + player.direction.x,
        y: player.snake[0].y + player.direction.y
    };
    
    // 4. 碰撞检测
    if (checkCollision(newHead)) {
        gameOver();
        return;
    }
    
    // 5. 移动蛇身
    player.snake.unshift(newHead);
    
    // 6. 吃食物检测
    if (checkFood(newHead)) {
        player.score += 10;
        generateFood();
    } else {
        player.snake.pop(); // 未吃到，移除尾部
    }
    
    // 7. 标记需要重绘
    renderNeeded = true;
}
```

#### 4.2.2 渲染循环 (requestAnimationFrame)

```javascript
let lastTime = 0;
const PARTICLE_FPS = 60;

function gameLoop(timestamp) {
    // 帧率限制
    if (timestamp - lastTime >= 1000 / PARTICLE_FPS) {
        lastTime = timestamp;
        
        // 按需渲染
        if (renderNeeded || particles.length > 0) {
            if (renderNeeded) {
                draw();
                renderNeeded = false;
            }
            if (particles.length > 0) {
                updateParticles();
            }
        }
    }
    
    // 智能停止
    if (renderNeeded || particles.length > 0 || isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
}
```

**优化策略：**
- 逻辑与渲染分离
- 按需渲染减少开销
- 粒子系统独立更新
- 智能停止机制

---

### 4.3 渲染系统

#### 4.3.1 主渲染函数

```javascript
function draw() {
    // 清空画布
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制特效层
    drawEffects();
    
    // 绘制食物
    foods.forEach(drawFood);
    
    // 绘制分身
    drawClones();
    
    // 绘制蛇
    drawSnakes();
    
    // 绘制粒子
    drawParticles();
}
```

#### 4.3.2 蛇绘制 - 渐变色 + 发光

```javascript
function drawSnake(player, frozen) {
    const hasClones = player.skills.e.clones.length > 0;
    
    player.snake.forEach((seg, idx) => {
        const isHead = idx === 0;
        const px = seg.x * GRID_SIZE + 1.5;
        const py = seg.y * GRID_SIZE + 1.5;
        
        // 蛇头特殊颜色
        let color = isHead 
            ? (frozen ? '#0088ff' : (hasClones ? '#ff00ff' : player.color))
            : `rgb(0, ${200 - idx * 8}, ${100 - idx * 4})`; // 渐变
        
        // 发光效果
        ctx.shadowColor = player.color;
        ctx.shadowBlur = isHead ? 20 : 8;
        
        ctx.fillStyle = color;
        ctx.fillRect(px, py, GRID_SIZE - 3, GRID_SIZE - 3);
    });
}
```

#### 4.3.3 食物绘制 - 径向渐变

```javascript
function drawFood(f) {
    const px = f.x * GRID_SIZE + 10;
    const py = f.y * GRID_SIZE + 10;
    
    // 动态效果
    const t = Date.now() / 250;
    const pulse = Math.sin(t) * 0.25 + 1;
    const float = Math.sin(t * 2) * 2;
    
    // 径向渐变
    const grad = ctx.createRadialGradient(px, py, 0, px, py, GRID_SIZE / 2);
    grad.addColorStop(0, '#ffcc66');
    grad.addColorStop(0.4, '#ff9500');
    grad.addColorStop(0.8, '#ff6600');
    grad.addColorStop(1, '#cc4400');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py + float, (GRID_SIZE / 2 - 3) * pulse, 0, Math.PI * 2);
    ctx.fill();
}
```

---

### 4.4 技能系统实现

#### 4.4.1 Q技能 - 核弹

```javascript
case 'q':
    // 发射核弹
    sk.projectile = { 
        x: head.x + dir.x * 2, 
        y: head.y + dir.y * 2,
        targetX: head.x + dir.x * 8,
        targetY: head.y + dir.y * 8,
        vx: dir.x * 1.5, 
        vy: dir.y * 1.5,
        exploded: false
    };
    break;

// 核弹更新逻辑
if (p.skills.q.projectile) {
    const proj = p.skills.q.projectile;
    proj.x += proj.vx;
    proj.y += proj.vy;
    
    // 到达目标或边界则爆炸
    if (dist <= 1 || proj.x < 0 || proj.x >= TILE_COUNT...) {
        proj.exploded = true;
        // 清除所有食物
        // 增加蛇长
        // 生成爆炸特效
    }
}
```

#### 4.4.2 W技能 - 时间静止

```javascript
case 'w':
    if (!sk.timeStopActive) {
        sk.timeStopActive = true;
        sk.timeStopEnd = now + 8000; // 8秒
        
        // 冻结所有食物
        foods.forEach(f => {
            f.timeFrozen = true;
            f.unfreezeAt = sk.timeStopEnd;
        });
    }
    break;

// 时间静止更新
if (p.skills.w.timeStopActive) {
    if (now > p.skills.w.timeStopEnd) {
        p.skills.w.timeStopActive = false;
        foods.forEach(f => f.timeFrozen = false);
    }
}
```

#### 4.4.3 E技能 - 镜像分身

```javascript
case 'e':
    if (sk.clones.length < sk.maxClones) {
        // 随机位置生成
        sk.clones.push([
            { x: randX, y: randY },
            { x: randX + 1, y: randY },
            { x: randX + 2, y: randY }
        ]);
    }
    break;

// 分身AI更新
for (const clone of p.skills.e.clones) {
    // 1. 找到最近的食物
    // 2. 排序移动方向
    // 3. 选择最优方向移动
    // 4. 检测吃食物
}
```

#### 4.4.4 R技能 - 黑洞

```javascript
case 'r':
    sk.blackhole = { 
        x: head.x, 
        y: head.y, 
        radius: 1, 
        phase: 0 
    };
    break;

// 黑洞更新
if (p.skills.r.blackhole) {
    bh.radius += 0.3;
    bh.phase += 0.2;
    
    // 吸引范围内的食物
    foods.forEach(f => {
        const dist = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
        if (dist < bh.radius * 3) {
            if (dist <= 1) {
                // 吸入
                score += 20;
            } else {
                // 向蛇头移动
                f.x += Math.sign(dx);
                f.y += Math.sign(dy);
            }
        }
    });
}
```

---

### 4.5 粒子系统

```javascript
// 粒子结构
{
    x, y,           // 坐标
    vx, vy,         // 速度
    life,           // 生命值 (1.0 -> 0)
    decay,          // 衰减率
    color,          // 颜色
    size            // 大小
}

// 粒子更新
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // 位置更新
        p.x += p.vx;
        p.y += p.vy;
        
        // 速度衰减
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // 生命衰减
        p.life -= p.decay;
        
        // 移除死亡粒子
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// 爆炸粒子生成
function createImpactNuke() {
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.015,
            color: colors[Math.floor(Math.random() * 4)],
            size: Math.random() * 8 + 4
        });
    }
}
```

---

## 5. 后端实现

### 5.1 服务器启动

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('Neon Snake Server Started');
console.log('Local: ws://localhost:8080');
```

### 5.2 玩家类

```javascript
class Player {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.alive = true;
        this.frozen = false;
        
        this.skills = {
            q: { cooldown: 8000, lastUsed: 0, projectile: null },
            w: { cooldown: 15000, lastUsed: 0, timeStopActive: false },
            e: { cooldown: 15000, lastUsed: 0, clone: null },
            r: { cooldown: 25000, lastUsed: 0, blackhole: null }
        };
        
        this.ws = null;  // WebSocket连接
    }
    
    reset(startX, startY) {
        // 重置蛇位置和状态
    }
}
```

### 5.3 房间系统

```javascript
class Room {
    constructor(id) {
        this.id = id;
        this.players = new Map();  // playerId -> Player
        this.foods = [];
        this.gameLoop = null;
        this.running = false;
        this.gameSpeed = 120;
        
        this.generateFoods(MAX_FOOD);
    }
    
    addPlayer(ws) {
        // 分配ID和颜色
        // 设置初始位置
        // 添加到房间
    }
    
    removePlayer(playerId) {
        // 移除玩家
        // 如果房间为空则销毁
    }
    
    start() {
        // 重置所有玩家
        // 清空食物
        // 生成新食物
        // 启动游戏循环
    }
    
    update() {
        // 游戏主逻辑
        // 处理所有玩家移动
        // 处理技能
        // 检测碰撞
        // 广播状态
    }
    
    broadcast(message) {
        // 向房间内所有玩家发送消息
    }
}
```

### 5.4 消息处理

```javascript
// 客户端发送的消息
const messageTypes = {
    direction: '方向控制',
    skill: '技能使用',
    start: '开始游戏'
};

// 服务器处理
room.handleMessage(playerId, message) {
    const player = this.players.get(playerId);
    
    switch (message.type) {
        case 'direction':
            // 验证方向有效性
            if (message.direction.x !== -player.direction.x && 
                message.direction.y !== -player.direction.y) {
                player.nextDirection = message.direction;
            }
            break;
            
        case 'skill':
            this.useSkill(player, message.skill);
            break;
            
        case 'start':
            this.start();
            break;
    }
}
```

---

## 6. 核心算法

### 6.1 碰撞检测

```javascript
// 墙壁碰撞
if (!hasClones && (
    newHead.x < 0 || 
    newHead.x >= TILE_COUNT || 
    newHead.y < 0 || 
    newHead.y >= TILE_COUNT
)) {
    // 死亡
}

// 自身碰撞
if (!hasClones && player.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
    // 死亡
}

// 食物碰撞
const foodIdx = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
if (foodIdx !== -1) {
    // 吃到食物
}
```

### 6.2 食物生成

```javascript
function generateFoodsLocal(count = 1) {
    for (let i = 0; i < count; i++) {
        let valid = false;
        let newFood;
        
        while (!valid) {
            // 随机位置
            newFood = { 
                x: Math.floor(Math.random() * TILE_COUNT), 
                y: Math.floor(Math.random() * TILE_COUNT)
            };
            
            // 检查与现有食物不重叠
            valid = !foods.some(f => f.x === newFood.x && f.y === newFood.y);
            
            // 检查与蛇身不重叠
            valid = valid && !player.snake.some(s => s.x === newFood.x && s.y === newFood.y);
        }
        
        foods.push(newFood);
    }
}
```

### 6.3 分身AI - 路径规划

```javascript
// 找到最近的食物
let targetFood = null;
let minDist = Infinity;

foods.forEach(f => {
    const d = Math.abs(f.x - clone[0].x) + Math.abs(f.y - clone[0].y);
    if (d < minDist) {
        minDist = d;
        targetFood = f;
    }
});

// 排序移动方向（靠近食物的优先）
dirs.sort((a, b) => {
    const na = { x: clone[0].x + a[0], y: clone[0].y + a[1] };
    const nb = { x: clone[0].x + b[0], y: clone[0].y + b[1] };
    const da = Math.abs(targetFood.x - na.x) + Math.abs(targetFood.y - na.y);
    const db = Math.abs(targetFood.x - nb.x) + Math.abs(targetFood.y - nb.y);
    return da - db;
});
```

---

## 7. 性能优化

### 7.1 渲染优化

| 优化项 | 实现方式 | 效果 |
|--------|----------|------|
| Canvas透明 | `{ alpha: false }` | 减少合成开销 |
| 按需渲染 | `renderNeeded`标志 | 避免无用绘制 |
| 帧率限制 | 60FPS上限 | 降低CPU使用 |
| 智能停止 | 无活动时暂停 | 节省资源 |

### 7.2 内存优化

```javascript
// 粒子数量限制
const MAX_PARTICLES = 150;

function createParticleBurst(...) {
    if (particles.length > MAX_PARTICLES) return;
    // ...
}

// 对象复用
// 避免频繁创建新对象
```

### 7.3 网络优化

```javascript
// 状态压缩
// 只发送必要的状态
getPlayersState() {
    const state = {};
    this.players.forEach(player => {
        state[player.id] = {
            id: player.id,
            color: player.color,
            snake: player.snake,
            score: player.score,
            alive: player.alive,
            // 不发送完整技能状态
            skills: {
                q: { cooldown: player.skills.q.cooldown, lastUsed: player.skills.q.lastUsed },
                // ...
            }
        };
    });
    return state;
}
```

---

## 8. 文件结构详解

### 8.1 snake.html

```
├── DOCTYPE声明
├── head
│   ├── meta标签
│   ├── title
│   ├── style.css引用
│   └── Google Fonts (Orbitron)
│
└── body
    ├── particles (背景粒子)
    ├── game-title (标题)
    ├── game-wrapper
    │   ├── game-container
    │   │   ├── arena (游戏区域)
    │   │   │   └── gameCanvas
    │   │   ├── connectionStatus
    │   │   ├── effectIndicator
    │   │   ├── impactOverlay
    │   │   ├── startScreen (开始菜单)
    │   │   ├── onlineMenu (联机菜单)
    │   │   └── gameOverScreen (结束画面)
    │   └── scorePanel
    ├── skill-bar (技能栏)
    └── script.js引用
```

### 8.2 style.css (关键样式)

- **霓虹效果** - 多层box-shadow
- **渐变背景** - radial-gradient
- **动画** - keyframes粒子漂浮
- **布局** - Flexbox居中

### 8.3 script.js (代码结构)

```
├── 1. 全局变量定义
│   ├── Canvas/Context
│   ├── 游戏配置 (GRID_SIZE, TILE_COUNT)
│   └── 状态变量 (isGameRunning, player1...)
│
├── 2. DOM元素获取
│
├── 3. 类定义 (SnakePlayer)
│
├── 4. 单人模式函数
│   ├── initSinglePlayer()
│   ├── generateFoodsLocal()
│   ├── updateSinglePlayer()
│   ├── endSingleGame()
│   └── startSinglePlayerGame()
│
├── 5. 联机模式函数
│   ├── connectToServer()
│   ├── handleOnlineMessage()
│   ├── updateOnlinePlayersList()
│   └── sendOnline()
│
├── 6. 粒子系统
│   ├── createParticleBurst()
│   ├── updateParticles()
│   └── drawParticles()
│
├── 7. 特效函数
│   ├── createImpactEat()
│   ├── createImpactNuke()
│   ├── createSpecialEffect()
│   └── createImpactDeath()
│
├── 8. UI函数
│   ├── updateScorePanel()
│   ├── showEffect()
│   └── updateSkillUI()
│
├── 9. 绘制函数
│   ├── draw()
│   ├── drawSnake()
│   ├── drawFood()
│   ├── drawNuke()
│   ├── drawBlackhole()
│   ├── drawIceZone()
│   └── drawClone()
│
├── 10. 主循环
│   └── gameLoop()
│
├── 11. 事件处理
│   ├── keydown事件
│   └── createBackgroundParticles()
│
└── 12. 初始化
    ├── createBackgroundParticles()
    └── requestAnimationFrame(gameLoop)
```

### 8.4 server.js (代码结构)

```
├── 1. 依赖引入
│   └── ws (WebSocket)
│
├── 2. 配置常量
│   ├── TILE_COUNT
│   ├── MAX_FOOD
│   └── rooms Map
│
├── 3. 类定义
│   ├── Player类
│   │   ├── 构造函数
│   │   ├── reset()
│   │   └── 技能处理
│   │
│   └── Room类
│       ├── 构造函数
│       ├── generateFoods()
│       ├── addPlayer()
│       ├── removePlayer()
│       ├── start()
│       ├── stop()
│       ├── update()
│       ├── getPlayersState()
│       ├── broadcast()
│       ├── handleMessage()
│       └── useSkill()
│
└── 4. 服务器事件
    ├── connection
    │   └── 处理新连接
    │   └── 分配房间
    │   └── 发送init
    │
    ├── message
    │   └── 解析消息
    │   └── 调用room.handleMessage
    │
    └── close
        └── 移除玩家
        └── 广播离开
```

---

## 9. 关键技术点

### 9.1 Canvas性能

```javascript
// 最佳实践
const ctx = canvas.getContext('2d', { alpha: false });
// 1. 关闭透明通道 - 浏览器不需要计算背景合成
// 2. 批量绘制 - 减少状态切换
// 3. 避免过度绘制 - 使用renderNeeded标志
```

### 9.2 WebSocket心跳

```javascript
// 简单的心跳机制
// 客户端断开时服务器通过onclose自动处理
ws.onclose = () => {
    room.removePlayer(player.id);
    room.broadcast({ type: 'playerLeft', ... });
};
```

### 9.3 状态同步

```javascript
// 服务器是权威来源
// 客户端只负责显示和发送输入
// 防止作弊

// 广播频率 = 游戏速度 = 120ms
gameLoop = setInterval(() => this.update(), this.gameSpeed);
```

### 9.4 方向控制防抖

```javascript
// 防止一帧内多次转向导致自杀
// 使用nextDirection缓冲
player.direction = { ...player.nextDirection };

// 发送时检查
if (dir.x !== -player.direction.x && dir.y !== -player.direction.y) {
    player.nextDirection = dir;
}
```

---

## 10. 扩展建议

### 10.1 可扩展功能

1. **更多技能**
   - 加速/减速
   - 护盾
   - 陷阱

2. **游戏模式**
   - 团队模式
   - 生存模式（毒圈）
   - 计时赛

3. **社交功能**
   - 排行榜
   - 好友系统
   - 聊天

4. **视觉效果**
   - 皮肤系统
   - 地图主题
   - 音效

### 10.2 性能提升

1. **客户端预测**
   - 本地先行
   - 服务器校正

2. **增量更新**
   - 只发送变化部分

3. **Web Workers**
   - 游戏逻辑移至Worker

### 10.3 架构改进

1. **模块化**
   - 使用ES6模块
   - 代码分割

2. **框架迁移**
   - React/Vue管理UI
   - Canvas由专业库处理

3. **数据库**
   - 用户数据持久化
   - 游戏记录

---

## 📚 参考资料

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Node.js WebSocket (ws)](https://github.com/websockets/ws)

---

**文档版本：** 1.0  
**最后更新：** 2026年3月  
**项目作者：** Neon Snake Team
