# 肉鸽游戏 (Roguelike Survivor Game) 项目规划文档

## 项目概述

**项目名称**: 肉鸽游戏 (Rogue Survivor)  
**项目类型**: 动作冒险 / 街机风格肉鸽游戏  
**核心价值**: 在有限空间内不断击败敌人获取经验升级，收集金币购买武器和被动技能，挑战更高分数

### 目标用户
- 休闲游戏玩家
- 肉鸽/地牢类游戏爱好者
- 喜欢快节奏动作游戏的玩家

### 项目范围
| 包含功能 | 不包含功能 |
|---------|-----------|
| ✅ 玩家自动攻击系统 | ❌ 多人联机 |
| ✅ 敌人AI追踪 | ❌ 复杂剧情 |
| ✅ 经验升级系统 | ❌ 地图探索 |
| ✅ 技能树选择 | ❌ 装备强化系统 |
| ✅ 商店系统 (武器+被动) | ❌ 技能树天赋系统 |
| ✅ 武器升级机制 | ❌ 技能冷却机制 |
| ✅ 拾取物自动飞向玩家 | ❌ 敌人波次系统 |
| ✅ 难度递增 | ❌ Boss战 |
| ✅ 分数排行榜 | ❌ 成就系统 |
| ✅ 角色选择 | ❌ 存档系统 |

---

## 需求清单

### 核心功能 (MVP) - 已实现

| 功能 | 描述 | 优先级 | 状态 |
|------|------|--------|------|
| 玩家移动 | WASD/方向键控制玩家移动，限制在画布范围内 | P0 | ✅ |
| 自动攻击 | 武器自动环绕玩家并攻击范围内的敌人 | P0 | ✅ |
| 敌人AI | 敌人自动追踪玩家 | P0 | ✅ |
| 敌人生成 | 从画布边缘随机位置生成敌人 | P0 | ✅ |
| 伤害计算 | 玩家攻击对敌人造成伤害，含暴击机制 | P0 | ✅ |
| 经验系统 | 击杀敌人获得经验，积累足够升级 | P0 | ✅ |
| 升级选择 | 升级时从3个随机技能中选择 | P0 | ✅ |
| 难度递增 | 每30秒难度+1，敌人生成加快/属性增强 | P0 | ✅ |
| 商店系统 | 按B键打开商店，购买武器/被动 | P0 | ✅ |
| 武器购买 | 购买新武器，漂浮身边自动攻击 | P0 | ✅ |
| 武器升级 | 购买已有武器升级（伤害/攻速/弹道/范围） | P0 | ✅ |
| 被动道具 | 购买被动道具提供永久属性加成 | P0 | ✅ |
| 拾取系统 | 金币/宝箱在拾取范围内自动飞向玩家 | P0 | ✅ |
| 角色选择 | 4个可选角色，不同初始武器和属性 | P0 | ✅ |
| 结束游戏 | 玩家可选择结束游戏 | P0 | ✅ |
| 排行榜 | 显示最高分榜单（本地存储） | P0 | ✅ |

### 扩展功能 - 待实现

| 功能 | 描述 | 优先级 | 依赖 |
|------|------|--------|------|
| 敌人类型扩展 | 添加更多敌人类型（远程怪、法师怪等） | P1 | 基础系统 |
| Boss战 | 特定时间召唤Boss敌人 | P1 | 敌人AI |
| 技能冷却 | 武器攻击冷却可视化 | P1 | 自动攻击 |
| 敌人波次 | 明确的波次概念，每波清空后刷新 | P1 | 敌人生成 |
| 连击系统 | 连续击杀增加分数倍率 | P2 | 分数系统 |
| 成就系统 | 达成特定目标解锁成就 | P2 | 分数系统 |
| 特殊事件 | 随机事件（商人、宝箱怪、精英怪） | P2 | 敌人生成 |

### 隐含需求

- **性能优化**: 大量敌人和投射物时的渲染优化
- **响应式控制**: 支持键盘操作
- **视觉反馈**: 伤害数字、暴击特效、升级特效
- **音效系统**: 背景音乐、音效（可选）

---

## 项目结构

### 当前目录结构

```
肉鸽游戏/
├── src/
│   ├── game/
│   │   ├── constants.ts      # 游戏配置、角色、武器、被动、敌人数据
│   │   ├── types.ts          # TypeScript类型定义
│   │   ├── store.ts          # Zustand状态管理
│   │   ├── GameCanvas.tsx   # 游戏主画布和渲染循环
│   │   ├── UI.tsx            # 游戏UI组件
│   │   └── index.ts          # 游戏模块导出
│   ├── types/
│   │   ├── index.ts
│   │   └── entities.ts
│   ├── assets/
│   ├── App.tsx               # 应用主组件
│   ├── App.css
│   ├── main.tsx              # 入口文件
│   └── index.css
├── public/
│   └── vite.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 模块职责说明

| 模块 | 职责 | 依赖 |
|------|------|------|
| `constants.ts` | 游戏平衡数值、静态数据（武器、角色、被动） | 无 |
| `types.ts` | 全部TypeScript接口定义 | 无 |
| `store.ts` | 游戏状态管理（ Zustand） | types.ts, constants.ts |
| `GameCanvas.tsx` | 渲染循环、输入处理、碰撞检测、自动攻击 | store.ts, types.ts |
| `UI.tsx` | 菜单、升级界面、商店界面、结束界面 | store.ts, constants.ts |

---

## 技术方案

### 技术栈选型

| 层级 | 技术 | 选择理由 |
|------|------|----------|
| 前端框架 | React 19 | 现代UI库，组件化开发 |
| 语言 | TypeScript | 类型安全，IDE支持好 |
| 状态管理 | Zustand | 轻量级，API简洁，适合游戏状态 |
| 构建工具 | Vite | 快速启动，热更新 |
| 游戏渲染 | Canvas 2D | 适合2D游戏，性能足够 |

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  GameCanvas │  │     UI      │  │     App         │ │
│  │  (渲染循环)  │  │  (界面组件)  │  │   (根组件)      │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
└─────────┼────────────────┼───────────────────┼──────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Zustand Store                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  gameStore (玩家、敌人、投射物、状态管理)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                   Game Logic                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 移动控制  │  │ 自动攻击  │  │ 碰撞检测  │  │ AI追踪 │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                   Canvas Rendering                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 玩家渲染  │  │ 敌人渲染  │  │ 投射物   │  │ UI渲染 │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入 (WASD)
    │
    ▼
GameCanvas.tsx (键盘事件)
    │
    ▼
useGameStore.updatePlayerPosition()
    │
    ▼
Zustand Store 更新 player.position
    │
    ▼
渲染循环读取新位置 → 重绘

---

敌人死亡
    │
    ▼
store.removeEnemy() 
    │
    ├──► addExp() → 经验足够 → 触发升级
    │
    ├──► addGold() → 金币增加
    │
    └──► addPickup() → 生成掉落物
```

### 关键数值配置

| 参数 | 当前值 | 说明 |
|------|--------|------|
| 画布大小 | 1200x800 | 游戏区域 |
| 玩家初始HP | 80-150（角色差异） | 角色决定 |
| 初始攻击力 | 10-20 | 角色决定 |
| 初始防御 | 0-5 | 角色决定 |
| 初始移速 | 3-5 | 角色决定 |
| 经验升级基数 | 100 | 首级所需经验 |
| 经验增长系数 | 1.5 | 每级递增 |
| 难度增加间隔 | 30秒 | 难度提升周期 |
| 敌人生成间隔 | 1500ms | 初始值（最低200ms） |
| 拾取范围 | 80px | 初始值 |

---

## 开发计划

### 阶段一：基础框架 ✅ 已完成

- [x] 项目初始化（Vite + React + TypeScript）
- [x] 状态管理搭建（Zustand）
- [x] 游戏类型定义
- [x] 基础配置数据

### 阶段二：核心玩法 ✅ 已完成

- [x] 玩家移动控制
- [x] 敌人AI追踪
- [x] 自动攻击系统
- [x] 碰撞检测
- [x] 伤害计算（含暴击）
- [x] 敌人生成与难度递增

### 阶段三：成长系统 ✅ 已完成

- [x] 经验系统
- [x] 升级技能选择
- [x] 属性提升
- [x] 商店系统
- [x] 武器系统（购买+升级）
- [x] 被动道具系统
- [x] 拾取物系统

### 阶段四：UI与体验

- [x] 开始界面（角色选择）
- [x] 游戏UI（HP条、金币、时间）
- [x] 升级界面
- [x] 商店界面
- [x] 结束界面 + 排行榜

### 阶段五：优化与扩展

- [ ] 性能优化（大量单位渲染）
- [ ] 视觉效果增强（粒子、特效）
- [ ] 敌人类型扩展
- [ ] 音效系统
- [ ] 更多游戏模式

---

## 开发指导

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 关键实现要点

#### 1. 游戏循环

游戏使用 `requestAnimationFrame` 实现渲染循环，通过 `deltaTime` 保证不同帧率下的游戏速度一致：

```typescript
// GameCanvas.tsx
const gameLoop = (timestamp: number) => {
  const deltaTime = timestamp - lastTimeRef.current;
  lastTimeRef.current = timestamp;
  if (screen === 'playing') {
    update(deltaTime); // 更新游戏状态
    // ... 处理输入
  }
  render(ctx, canvas.width, canvas.height); // 渲染
  animationId = requestAnimationFrame(gameLoop);
};
```

#### 2. 自动攻击系统

武器自动寻找范围内最近的敌人并攻击：

```typescript
// 遍历所有武器
player.weapons.forEach((weapon, idx) => {
  // 检查攻击冷却
  const interval = 1000 / (weapon.baseAttackSpeed * (1 + weapon.upgrade.attackSpeed));
  if (now - weapon.lastAttackTime < interval) return;
  
  // 寻找最近敌人
  let target: Enemy | null = null, minDist = Infinity;
  enemies.forEach(e => {
    const d = Math.hypot(e.position.x - player.position.x, e.position.y - player.position.y);
    if (d < range && d < minDist) { minDist = d; target = e; }
  });
  
  // 发射投射物
  if (target) {
    addProjectile(proj);
  }
});
```

#### 3. 难度递增

难度每30秒增加一级，影响敌人生成和属性：

```typescript
const newDifficulty = Math.floor(newTime / 30000) + 1;
const newSpawnRate = Math.max(200, 1500 * Math.pow(0.95, newDifficulty - 1));
// 敌人HP = baseHp * 1.1^((difficulty-1)/2)
// 敌人攻击 = baseAttack * 1.05^((difficulty-1)/2)
```

#### 4. 拾取物飞向玩家

当掉落物进入拾取范围后，自动飞向玩家：

```typescript
if (distance < player.stats.pickupRange) {
  const speed = 15;
  const newX = pickup.position.x + (dx / distance) * speed;
  const newY = pickup.position.y + (dy / distance) * speed;
  // 靠近后自动拾取
  if (distance < player.size) collectPickup(pickup.id);
}
```

#### 5. 武器环绕

武器围绕玩家旋转：

```typescript
const angle = weapon.orbitAngle + time * 0.002;
const weaponX = player.position.x + Math.cos(angle) * (player.size + 20);
const weaponY = player.position.y + Math.sin(angle) * (player.size + 20);
```

### 配置文件说明

`constants.ts` 包含所有游戏平衡数值：

| 配置项 | 用途 |
|--------|------|
| `GAME_CONFIG` | 全局游戏设置（画布、难度、基础数值） |
| `WEAPONS` | 可购买武器列表 |
| `CHARACTERS` | 可选角色及初始属性 |
| `PASSIVES` | 可购买被动道具 |
| `ENEMY_TYPES` | 敌人类型模板 |
| `COLORS` | 渲染颜色 |
| `getSkillOptions()` | 升级技能选项生成 |

### 状态管理

Zustand store 包含所有游戏状态：

```typescript
interface GameStore {
  // 屏幕状态
  screen: GameScreen;
  isPaused: boolean;
  
  // 游戏状态
  time: number;
  score: number;
  difficulty: number;
  
  // 实体
  player: Player | null;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  
  // 游戏系统
  levelUpOptions: SkillOption[];
  shopWeapons: (Weapon | Passive)[];
  leaderboard: LeaderboardEntry[];
  
  // 方法
  update(deltaTime: number): void;
  // ... 更多方法
}
```

### 注意事项

1. **性能考虑**: 当敌人数量>30时可能需要优化渲染和碰撞检测
2. **数值平衡**: 当前数值基于测试可能需要调整
3. **存储限制**: 排行榜使用localStorage，最多存储10条
4. **输入处理**: B键有防抖处理，防止快速切换

---

## 扩展建议

### 视觉增强

1. **粒子效果**: 攻击命中、敌人死亡、拾取物品时的粒子特效
2. **伤害数字**: 伤害值飘字显示
3. **暴击特效**: 暴击时的特殊视觉效果
4. **升级特效**: 升级时的光效和动画

### 音效系统

1. 背景音乐（战斗、菜单）
2. 音效（攻击、拾取、升级、受伤）
3. 语音（角色选择、升级提示）

### 敌人扩展

| 敌人类型 | 特点 | 实现难度 |
|---------|------|---------|
| 远程怪 | 远程攻击玩家 | 中 |
| 法师怪 | 魔法攻击+减速 | 中 |
| 精英怪 | 高血量+高攻击 | 低 |
| 治疗怪 | 给周围敌人回血 | 中 |
| 自爆怪 | 靠近玩家后自爆 | 低 |

### 特殊事件

1. **商人事件**: 随机出现折扣商人
2. **宝箱怪**: 伪装的宝箱，靠近后攻击
3. **精英怪**: 掉落大量金币和经验

### 游戏模式

1. **限时模式**: 固定时间内容尽可能高分
2. **无尽模式**: 永无止境的生存挑战
3. **速通模式**: 以最快速度达到指定等级

---

## 总结

本项目已实现了一个完整的肉鸽游戏核心玩法，包括：
- ✅ 自动攻击系统
- ✅ 敌人AI和难度递增
- ✅ 经验升级与技能选择
- ✅ 商店与武器/被动系统
- ✅ 拾取物自动飞向玩家
- ✅ 角色选择与排行榜

后续可在此基础上进行扩展优化，如添加更多敌人类型、Boss战、视觉效果和音效等。