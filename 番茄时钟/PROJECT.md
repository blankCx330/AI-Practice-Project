# 🍅 番茄时钟项目 - 开发者文档

## 📖 项目概述

番茄时钟是一个简约舒适的专注力管理工具，基于经典的番茄工作法（Pomodoro Technique）开发。应用帮助用户精准记录学习时间、追踪学习进度，并提供丰富的数据可视化功能。

**项目状态**：生产就绪，核心功能完整。

**目标用户**：学生、开发者、自由职业者等需要专注工作的人群。

## 🛠 技术栈

### 核心框架
- **React 19**：前端框架，使用函数组件和Hooks
- **TypeScript 5.9**：类型安全，提升代码可维护性
- **Vite 7.3**：构建工具，提供极速开发体验

### 核心依赖
- **date-fns 4.1**：现代化的日期处理库，轻量高效
- **Recharts 3.7**：基于D3.js的图表库，用于数据可视化

### 开发工具
- **ESLint 9.39**：代码质量检查
- **TypeScript ESLint**：TypeScript专用lint规则
- **Vitest**：单元测试框架

## 📁 项目结构详解

```
番茄时钟/
├── package.json           # 项目依赖和脚本
├── vite.config.ts        # Vite构建配置
├── tsconfig.json         # TypeScript主配置
├── tsconfig.app.json     # 应用TypeScript配置
├── tsconfig.node.json    # Node环境TypeScript配置
├── eslint.config.js      # ESLint配置
├── README.md             # 用户文档
├── PROJECT.md            # 开发者文档（本文档）
├── index.html            # 应用入口HTML
└── src/
    ├── main.tsx          # React应用入口点
    ├── index.css         # 全局样式
    ├── App.tsx           # 应用根组件
    ├── App.css           # 应用样式
    ├── types/
    │   └── index.ts      # 全局类型定义
    ├── context/
    │   └── StudyContext.tsx  # 全局状态管理（Context + Reducer）
    ├── hooks/
    │   └── useRecentNames.ts # 最近命名管理Hook
    └── components/       # 组件目录
        ├── Layout/       # 布局组件
        │   ├── Layout.tsx
        │   └── Layout.css
        ├── Timer/        # 番茄时钟组件
        │   ├── Timer.tsx
        │   └── Timer.css
        ├── TodayRecords/ # 今日学习记录组件
        │   ├── TodayRecords.tsx
        │   └── TodayRecords.css
        ├── Calendar/     # 日历视图组件
        │   ├── Calendar.tsx
        │   └── Calendar.css
        ├── Statistics/   # 统计图表组件
        │   ├── Statistics.tsx
        │   └── Statistics.css
        └── Settings/     # 设置组件
            ├── Settings.tsx
            └── Settings.css
```

## 🏗️ 架构设计

### 1. 状态管理（Context + Reducer模式）

**核心文件**：`src/context/StudyContext.tsx`

**设计思路**：使用React Context配合useReducer实现集中式状态管理，避免props drilling问题。

**状态结构**：
```typescript
interface AppState {
  records: StudyRecord[];        // 所有学习记录
  timerMinutes: number;          // 当前设置的计时时长
  timerStatus: TimerStatus;      // 计时器状态（idle/running/paused）
  remainingSeconds: number;      // 剩余秒数
  timerStartTime: number | null; // 计时开始时间戳
  currentView: ViewType;         // 当前视图
  selectedYear: number;          // 日历选中年份
  selectedMonth: number;         // 日历选中月份
  settings: AppSettings;         // 应用设置
}
```

**核心Reducer Action**：
- `SET_RECORDS`：设置学习记录
- `ADD_RECORD`：添加学习记录
- `DELETE_RECORD`：删除学习记录
- `UPDATE_RECORD`：更新记录名称
- `SET_TIMER_MINUTES`：设置计时时长
- `SET_TIMER_STATUS`：设置计时器状态
- `SET_REMAINING_SECONDS`：设置剩余秒数
- `SET_TIMER_START_TIME`：设置计时开始时间
- `SET_CURRENT_VIEW`：设置当前视图
- `SET_SELECTED_YEAR/MONTH`：设置日历选中时间
- `TICK`：计时器秒数递减

### 2. 数据持久化

**存储策略**：
- 使用`localStorage`存储学习记录
- 键名：`study-records`（JSON格式）
- 键名：`pomodoro-settings`（JSON格式，设置）
- 键名：`recent-study-names`（JSON格式，最近命名列表，最多20个）

### 3. 组件通信

**组件层级关系**：
```
App (Provider)
├── Layout (导航容器)
├── Timer (计时器)
├── TodayRecords (今日记录)
├── Calendar (日历视图)
├── Statistics (统计分析)
└── Settings (应用设置)
```

**数据流**：单向数据流，所有组件通过`useApp()` hook访问和修改全局状态。

## 🎯 功能模块详解

### 1. 计时器模块（Timer）

**核心文件**：`src/components/Timer/Timer.tsx`

**功能特点**：
- 支持15/25/30/45/60分钟多种时长选择
- 可视化圆环进度条显示剩余时间
- 三种状态：空闲（idle）、运行（running）、暂停（paused）
- 学习命名功能，支持从最近命名列表快速选择
- 提前完成、放弃功能
- Toast消息通知系统，提供即时反馈

**命名功能实现**：
- 点击命名输入框时弹出最近命名列表
- 默认包含"学习"和"锻炼"两个预设名称
- 可选择已有名称或输入新名称
- 支持删除不需要的命名

**完成逻辑**：
- 支持任意时长（包括1分钟内）的记录保存
- 完成时显示Toast通知，确认记录已保存
- 放弃时如有已学习时间，弹出确认对话框

### 2. 今日记录模块（TodayRecords）

**核心文件**：`src/components/TodayRecords/TodayRecords.tsx`

**功能特点**：
- 实时展示今日所有学习记录
- 按时间倒序排列，最新记录在最前面
- 点击记录名称可编辑命名
- 删除单条记录功能
- 今日学习总时长统计
- **饼状图**：按名称分类显示学习时间分布

**饼状图实现**：
- 使用Recharts的PieChart组件
- 按记录名称分组计算时长和百分比
- 未命名记录显示为"未命名的记录"
- 鼠标悬停显示详细信息

**命名编辑弹窗**：
- 点击记录名称弹出编辑窗口
- 显示最近使用的命名列表
- 可选择或删除历史命名
- 支持手动输入新名称

### 3. 日历模块（Calendar）

**核心文件**：`src/components/Calendar/Calendar.tsx`

**功能特点**：
- 双视图模式：年视图、月视图
- 智能着色：根据学习时长自动显示颜色深度
- 月度/年度学习时长统计
- 日期导航功能

### 4. 统计模块（Statistics）

**核心文件**：`src/components/Statistics/Statistics.tsx`

**功能特点**：
- 多维度统计：周、月、年视图切换
- 数据可视化：使用Recharts绘制柱状图
- 关键指标：总时长、学习天数、日均时长、单日最长

### 5. 设置模块（Settings）

**核心文件**：`src/components/Settings/Settings.tsx`

**功能特点**：
- 默认时长设置（5-120分钟可调）
- 提示音开关和测试功能
- 浏览器通知授权管理
- 数据清除功能（危险操作）

### 6. 最近命名管理（useRecentNames Hook）

**核心文件**：`src/hooks/useRecentNames.ts`

**功能特点**：
- localStorage持久化存储最近命名
- 最多保存20个命名
- 新命名自动添加到列表顶部
- 支持删除单个命名
- 默认包含"学习"和"锻炼"

## ✅ 已完成功能清单

### 核心功能
- [x] **基础计时器**：开始、暂停、继续、重置
- [x] **多种时长选择**：15/25/30/45/60分钟预设
- [x] **进度可视化**：圆环进度条实时更新
- [x] **学习记录**：自动保存每次学习记录
- [x] **学习命名**：可为学习时段命名，支持快速选择
- [x] **短时记录**：支持1分钟内的短时间学习记录
- [x] **Toast通知**：完成/放弃操作的即时反馈

### 数据管理
- [x] **数据持久化**：localStorage自动保存
- [x] **今日记录查看**：展示当天所有学习记录
- [x] **记录编辑**：支持修改记录名称
- [x] **记录删除**：支持单条记录删除
- [x] **最近命名管理**：自动保存最近使用的命名

### 数据可视化
- [x] **日历年视图**：全年学习情况概览
- [x] **日历月视图**：当月每日学习详情
- [x] **智能着色系统**：根据时长自动着色
- [x] **统计图表**：周/月/年数据可视化
- [x] **饼状图**：按名称分类显示时间分布
- [x] **多维度统计**：总时长、学习天数、日均时长、单日最长

### 用户体验
- [x] **响应式布局**：适配移动端和桌面端
- [x] **底部导航**：快速切换视图
- [x] **中文界面**：完整的中文本地化
- [x] **提示音**：计时结束音效
- [x] **动画效果**：进度条平滑过渡
- [x] **交互反馈**：Toast消息系统

## 🔧 开发指南

### 环境设置
```bash
# 1. 安装依赖
npm install

# 2. 开发模式运行
npm run dev

# 3. 构建生产版本
npm run build

# 4. 运行测试
npm test

# 5. 代码检查
npm run lint
```

### 代码规范
1. **组件命名**：使用PascalCase，如`Timer.tsx`
2. **文件组织**：每个组件有自己的目录，包含TSX和CSS文件
3. **类型定义**：所有TypeScript类型在`src/types/index.ts`中定义
4. **状态管理**：使用context提供的`useApp()` hook，避免直接使用useContext
5. **样式约定**：使用CSS Modules，类名使用kebab-case

## 📈 数据模型详解

### StudyRecord 学习记录
```typescript
interface StudyRecord {
  id: string;           // 唯一标识，格式："record-时间戳"
  startTime: number;    // 开始时间戳（毫秒）
  endTime: number;      // 结束时间戳（毫秒）
  duration: number;     // 学习时长（分钟）
  date: string;         // 日期（YYYY-MM-DD）
  name?: string;        // 学习名称/主题（可选）
}
```

### 数据存储格式
```json
// localStorage中的study-records
[
  {
    "id": "record-1740945600000",
    "startTime": 1740945600000,
    "endTime": 1740947100000,
    "duration": 25,
    "date": "2025-03-02",
    "name": "React项目开发"
  }
]

// localStorage中的recent-study-names
["学习", "锻炼", "阅读", "编程"]
```

## 🚀 部署指南

### 构建生产版本
```bash
npm run build
```

### 输出目录
构建后的文件在`dist/`目录中：
- `dist/index.html`：入口HTML
- `dist/assets/`：打包后的JS和CSS文件

### 部署到静态托管服务
支持任何静态托管服务：
- GitHub Pages
- Vercel
- Netlify
- 阿里云OSS
- 腾讯云COS

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m "添加新功能"`
4. 推送到分支：`git push origin feature/new-feature`
5. 创建Pull Request

### 提交信息规范
```
类型: 描述

类型包括：
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式/格式调整
- refactor: 重构代码
- test: 测试相关
- chore: 构建/工具更新
```

## 📚 学习资源

### 项目相关技术
- [React官方文档](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Vite指南](https://vite.dev/guide/)
- [date-fns文档](https://date-fns.org/docs/)
- [Recharts文档](https://recharts.org/en-US/)

### 设计参考
- [番茄工作法](https://francescocirillo.com/pages/pomodoro-technique)
- [Material Design色彩系统](https://m3.material.io/styles/color/the-color-system)

## 📄 许可证

本项目基于MIT许可证开源。

---

**文档版本**：1.1.0  
**最后更新**：2026年3月3日  
**维护者**：项目开发团队