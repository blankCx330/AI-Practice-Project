# 🐍 Neon Snake - 霓虹贪吃蛇

## 📁 文件结构
```
D:\OpenCode\测试\
├── snake.html     # 游戏主页面
├── style.css     # 样式文件
├── script.js     # 游戏逻辑
├── server.js     # 游戏服务器
└── package.json  # 依赖配置
```

---

## 🎮 两种游戏模式

### 1️⃣ 单人模式
直接用浏览器打开 `snake.html`，点击「单人模式」即可游玩。

### 2️⃣ 联机模式
需要启动服务器，让多人同时连接。

---

## 🚀 启动服务器

### 本地游玩
```bash
cd D:\OpenCode\测试
node server.js
```
然后在浏览器打开 `snake.html`，选择「在线对战」，服务器地址填写 `localhost:8080`

### 局域网联机（同一WiFi）
1. 查看本机IP地址：`ipconfig`（Windows）或 `ifconfig`（Mac/Linux）
2. 假设IP是 `192.168.1.100`
3. 其他设备连接 `192.168.1.100:8080`

---

## 🌐 与QQ好友联机（外网联机）

需要让服务器可以被外网访问，有以下几种方式：

### 方法1：使用 ngrok（推荐，最简单）
```bash
# 1. 下载 ngrok: https://ngrok.com/download
# 2. 解压后运行：
ngrok http 8080

# 3. ngrok会显示一个类似这样的地址：
# https://xxxx-xxx.ngrok.io

# 4. 告诉QQ好友这个地址，让他们填写到游戏中的服务器地址
```

### 方法2：使用 frp（内网穿透）
```bash
# 需要有公网服务器，配置frp
# frps.ini 配置：
[common]
bind_port = 7000
vhost_http_port = 8080

# 客户端 frpc.ini 配置：
[common]
server_addr = 你的公网IP
server_port = 7000

[snake]
type = tcp
local_ip = 127.0.0.1
local_port = 8080
remote_port = 8080
```

### 方法3：使用花生壳/natapp等内网穿透工具

---

## 🎯 操作说明

### 单人模式
- **移动**: 方向键 ↑ ↓ ← →
- **技能**: Q 加速 | W 减速 | E 穿墙 | R 陷阱
- **暂停**: 空格键

### 联机模式
- **移动**: 方向键
- **技能**: QWER

---

## ⚡ 性能优化

- 使用 `alpha: false` 关闭Canvas透明通道
- 限制粒子最大数量
- 按需渲染（仅在状态变化时重绘）
- 优化的碰撞检测算法

---

## 📋 依赖安装（如果需要）
```bash
cd D:\OpenCode\测试
npm install
```
