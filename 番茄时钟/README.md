# 🍅 番茄时钟 Pomodoro Timer

一个基于 React 的简约番茄时钟应用，帮助你精准记录学习时间并追踪学习进度。

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/blankcx330/pomodoro-timer)
[![Test Status](https://img.shields.io/badge/tests-40%20passed-blue)](https://github.com/blankcx330/pomodoro-timer)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

---

## ✨ 功能特性

### 1. 番茄时钟
- **精准计时**：支持 15、25、30、45、60 分钟多种时长选择
- **可视化进度**：圆环进度条实时显示剩余时间
- **状态管理**：开始、暂停、继续、完成、重置功能
- **音效提醒**：计时结束时自动播放提示音
- **浏览器通知**：支持桌面通知提醒
- **学习命名**：为每次学习添加名称便于追踪

### 2. 学习记录
- **自动保存**：每次学习完成后自动记录
- **持久存储**：数据保存在浏览器 localStorage，刷新不丢失
- **完整信息**：记录开始时间、结束时间、学习时长、日期、学习名称

### 3. 日历视图
- **年视图**：全年 12 个月的学习情况一目了然
- **月视图**：查看单月每天的详细学习记录
- **智能着色**：根据学习时长自动显示不同颜色深度
  - 灰色：未学习（0 分钟）
  - 浅橙色：1-30 分钟
  - 橙色：31-60 分钟
  - 深橙色：61-120 分钟
  - 最深橙：120+ 分钟

### 4. 统计分析
- **多维度统计**：支持本周、本月、本年视图切换
- **数据可视化**：柱状图展示学习时长
- **关键指标**：总学习时长、学习天数、日均时长、单日最长
- **最近记录**：显示最近 5 条学习记录

### 5. 今日记录
- **饼图分析**：查看今日学习时间分布
- **快速编辑**：点击学习名称快速修改
- **最近名称**：记住常用的学习名称

---

## 🛠 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.2.0 | 用户界面库 |
| TypeScript | ~5.9.3 | 类型安全 |
| Vite | 7.3.1 | 构建工具 |

### 状态管理
| 技术 | 说明 |
|------|------|
| React Context + useReducer | 全局状态管理 |

### 数据处理
| 技术 | 版本 | 说明 |
|------|------|------|
| date-fns | 4.1.0 | 日期处理库 |

### 数据可视化
| 技术 | 版本 | 说明 |
|------|------|------|
| Recharts | 3.7.0 | 图表库（柱状图、饼图） |

### 测试
| 技术 | 用途 |
|------|------|
| Vitest | 单元测试框架 |
| Testing Library | React 测试工具 |
| Playwright | E2E 测试 |

### 代码规范
| 技术 | 说明 |
|------|------|
| ESLint | 代码检查 |
| TypeScript | 编译时类型检查 |

---

## 📁 项目结构

```
pomodoro-timer/
├── src/
│   ├── components/           # React 组件
│   │   ├── Calendar/        # 日历视图组件
│   │   │   ├── Calendar.tsx
│   │   │   └── Calendar.css
│   │   ├── ErrorBoundary/  # 错误边界组件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ErrorBoundary.css
│   │   ├── Icons/          # SVG 图标组件库
│   │   │   ├── Icons.tsx    # 包含 12 个简约线条图标
│   │   │   ├── Icons.css
│   │   │   └── index.ts
│   │   ├── Layout/          # 布局组件（导航栏）
│   │   │   ├── Layout.tsx
│   │   │   └── Layout.css
│   │   ├── Settings/        # 设置页面
│   │   │   ├── Settings.tsx
│   │   │   ├── Settings.css
│   │   │   └── Settings.test.tsx
│   │   ├── Statistics/       # 统计图表组件
│   │   │   ├── Statistics.tsx
│   │   │   └── Statistics.css
│   │   ├── Timer/           # 番茄时钟核心组件
│   │   │   ├── Timer.tsx
│   │   │   ├── Timer.css
│   │   │   └── Timer.test.tsx
│   │   └── TodayRecords/    # 今日记录组件
│   │       ├── TodayRecords.tsx
│   │       └── TodayRecords.css
│   ├── context/             # React Context
│   │   ├── StudyContext.tsx # 学习状态管理
│   │   └── StudyContext.test.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   └── useRecentNames.ts # 最近名称管理
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── test/                # 测试配置
│   │   └── setup.ts
│   ├── App.tsx              # 主应用组件（包含懒加载）
│   ├── App.css
│   ├── main.tsx             # 入口文件
│   ├── index.css            # 全局样式
│   └── App.css              # App 样式
├── e2e/                     # E2E 测试
│   └── timer.spec.ts
├── public/                  # 静态资源
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts          # Vite 配置
├── eslint.config.js        # ESLint 配置
├── playwright.config.ts   # Playwright 配置
└── vitest.config.ts        # Vitest 配置
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **npm** 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

---

## 🧪 测试

### 单元测试

```bash
# 运行测试（监听模式）
npm test

# 运行测试（单次）
npm run test:run

# 生成测试覆盖率报告
npm run test:coverage
```

### E2E 测试

```bash
# 运行 E2E 测试
npm run test:e2e

# 使用 UI 模式运行 E2E 测试
npm run test:e2e:ui
```

---

## 📖 使用说明

### 1. 开始学习
1. 选择学习时长（默认 25 分钟）
2. 点击「开始学习」按钮
3. 计时器开始倒计时，圆环进度条会实时更新
4. 学习完成后会播放提示音并自动保存记录

### 2. 提前完成
1. 点击「完成」按钮
2. 可选择为这次学习命名
3. 学习记录会保存到 localStorage

### 3. 查看日历
1. 点击底部导航栏的「日历」图标
2. 年视图：查看全年学习情况，颜色越深表示学习时间越长
3. 月视图：查看单月每天的详细学习记录
4. 可以通过导航按钮切换年份/月份

### 4. 查看统计
1. 点击底部导航栏的「统计」图标
2. 切换「本周/本月/本年」查看不同时间范围的统计数据
3. 柱状图直观展示每日/每月学习时长
4. 统计卡片显示关键指标

### 5. 今日记录
1. 点击底部导航栏的「今日」图标
2. 查看今日学习记录列表
3. 点击学习名称可快速编辑
4. 饼图展示学习时间分布

### 6. 设置
1. 点击底部导航栏的「设置」图标
2. 设置默认计时时长
3. 开启/关闭提示音
4. 授权/关闭浏览器通知
5. 清除所有学习记录

---

## 🎨 设计规范

### 颜色方案

| 名称 | 色值 | 用途 |
|------|------|------|
| 主色 | `#ff6b6b` | 珊瑚红，按钮、强调 |
| 辅色 | `#ffa502` | 橙色，暂停状态 |
| 背景 | `#fff9f5` | 暖白，整体背景 |
| 文字主 | `#333333` | 主文字 |
| 文字次 | `#666666` | 次要文字 |

### 设计原则
- 简约舒适的视觉风格
- 暖色调番茄主题
- 流畅的动画过渡
- 响应式设计，完美支持移动端

### 图标风格
项目使用统一的 SVG 简约线条风格图标（stroke-width: 1.5px），通过 `Icons.tsx` 组件统一管理：

```typescript
import Icon, { IconName } from './components/Icons';

// 使用示例
<Icon name="tomato" size={24} />
<Icon name="settings" size={20} />
<Icon name="clock" size={24} />
```

---

## 📝 数据结构

### 学习记录 (StudyRecord)

```typescript
interface StudyRecord {
  id: string;           // 唯一标识 (UUID)
  startTime: number;   // 开始时间戳
  endTime: number;     // 结束时间戳
  duration: number;    // 学习时长（分钟）
  date: string;        // 日期（YYYY-MM-DD）
  name?: string;       // 学习名称/主题（可选）
}
```

### 应用设置 (AppSettings)

```typescript
interface AppSettings {
  defaultMinutes: number;      // 默认时长（分钟）
  enableSound: boolean;         // 是否启用提示音
  enableNotifications: boolean;  // 是否启用浏览器通知
}
```

### 计时器状态 (TimerStatus)

```typescript
type TimerStatus = 'idle' | 'running' | 'paused';
```

### 视图类型 (ViewType)

```typescript
type ViewType = 'timer' | 'calendar' | 'statistics' | 'today' | 'settings';
```

### 存储键
- `study-records`：学习记录数组（JSON 格式）
- `app-settings`：应用设置（JSON 格式）
- `recent-names`：最近使用的名称数组

---

## 🔧 状态管理 (StudyContext)

项目使用 React Context + useReducer 进行状态管理。

### 使用方式

```typescript
import { useApp } from './context/StudyContext';

function MyComponent() {
  // 解构返回的状态和方法
  const { state, dispatch, updateSettings, addRecord, finishEarly, playNotificationSound } = useApp();
  
  // state 包含所有状态
  // dispatch 派发 actions
  // updateSettings 更新设置
  // addRecord 添加记录
  // finishEarly 提前完成
  // playNotificationSound 播放提示音
}
```

### AppState 结构

```typescript
interface AppState {
  records: StudyRecord[];        // 学习记录列表
  timerMinutes: number;           // 当前计时器时长（分钟）
  timerStatus: TimerStatus;       // 计时器状态
  remainingSeconds: number;      // 剩余秒数
  timerStartTime: number | null; // 计时开始时间
  currentView: ViewType;         // 当前视图
  selectedYear: number;          // 日历选中的年份
  selectedMonth: number;         // 日历选中的月份
  settings: AppSettings;        // 应用设置
}
```

### Actions

| Action | 说明 | Payload |
|--------|------|---------|
| `SET_RECORDS` | 设置记录列表 | `StudyRecord[]` |
| `ADD_RECORD` | 添加单条记录 | `StudyRecord` |
| `DELETE_RECORD` | 删除记录 | `string (id)` |
| `UPDATE_RECORD` | 更新记录 | `{ id: string, name: string }` |
| `SET_TIMER_MINUTES` | 设置时长 | `number` |
| `SET_TIMER_STATUS` | 设置状态 | `TimerStatus` |
| `SET_REMAINING_SECONDS` | 设置剩余秒数 | `number` |
| `SET_TIMER_START_TIME` | 设置开始时间 | `number \| null` |
| `SET_CURRENT_VIEW` | 设置当前视图 | `ViewType` |
| `SET_SELECTED_YEAR` | 设置选中年份 | `number` |
| `SET_SELECTED_MONTH` | 设置选中月份 | `number` |
| `TICK` | 计时器递减 | - |
| `SET_SETTINGS` | 设置应用配置 | `AppSettings` |

---

## 🧩 组件说明

### 核心组件

| 组件 | 文件 | 功能 |
|------|------|------|
| **Timer** | `Timer.tsx` | 番茄时钟核心，包含计时、暂停、完成等功能，显示圆环进度条 |
| **Calendar** | `Calendar.tsx` | 日历视图，支持年/月视图切换，显示学习时长热力图 |
| **Statistics** | `Statistics.tsx` | 统计分析，包含柱状图和统计卡片（本周/本月/本年） |
| **TodayRecords** | `TodayRecords.tsx` | 今日学习记录，包含饼图展示时间分布 |
| **Settings** | `Settings.tsx` | 设置页面，配置应用参数（时长、提示音、通知） |
| **Layout** | `Layout.tsx` | 布局组件，包含导航栏和页面结构 |

### 工具组件

| 组件 | 文件 | 功能 |
|------|------|------|
| **Icon** | `Icons.tsx` | SVG 图标组件库，包含 12 个统一风格的图标 |
| **ErrorBoundary** | `ErrorBoundary.tsx` | 错误边界组件，捕获子组件错误并显示友好界面 |

### 自定义 Hooks

| Hook | 文件 | 功能 |
|------|------|------|
| **useRecentNames** | `useRecentNames.ts` | 管理最近使用的学习名称，提供添加、删除功能 |

---

## 🚀 性能优化

### 代码分割 (Code Splitting)

项目使用 React.lazy() 实现视图组件的懒加载：

```typescript
// App.tsx
const Timer = lazy(() => import('./components/Timer/Timer'));
const Calendar = lazy(() => import('./components/Calendar/Calendar'));
// ... 其他组件同样懒加载
```

### Bundle 大小

| 包 | 大小 (gzip) | 说明 |
|----|-------------|------|
| index.js | 71 KB | 主包，包含 React 和核心逻辑 |
| CategoricalChart.js | 94 KB | Recharts 图表库，按需加载 |
| Statistics | 14 KB | 统计页面组件 |
| TodayRecords | 8.5 KB | 今日记录组件 |
| 其他组件 | 1-4 KB | 各自独立打包 |

---

## 🚢 部署

### 构建

```bash
npm run build
```

### 部署平台

| 平台 | 推荐程度 | 特点 |
|------|----------|------|
| Vercel | ⭐⭐⭐⭐⭐ | 免费、快速、自动部署 |
| Netlify | ⭐⭐⭐⭐ | 免费 CDN、配置简单 |
| GitHub Pages | ⭐⭐⭐ | 免费、适合开源项目 |
| 自有服务器 | ⭐⭐⭐ | 完全控制、需要运维 |

### 部署检查清单

- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 本地预览正常
- [ ] 无控制台错误

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 克隆到本地：`git clone https://github.com/<your-username>/pomodoro-timer.git`
3. 创建特性分支：`git checkout -b feature/xxx`
4. 安装依赖：`npm install`
5. 进行开发：`npm run dev`
6. 运行测试：`npm test`
7. 提交更改：`git commit -m 'Add xxx'`
8. 推送分支：`git push origin feature/xxx`
9. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 编写单元测试覆盖率新功能
- 使用有意义的变量和函数命名

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Lucide](https://lucide.dev/) - 简约线条图标库
- [date-fns](https://date-fns.org/) - 现代日期处理库
- [Recharts](https://recharts.org/) - React 图表库
- [Vitest](https://vitest.dev/) - 快速单元测试框架
- [React](https://react.dev/) - 用户界面库
- [Vite](https://vitejs.dev/) - 下一代构建工具