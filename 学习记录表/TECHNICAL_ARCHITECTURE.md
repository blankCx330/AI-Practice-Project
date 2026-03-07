# 学习计划管理应用 - 技术架构文档

## 1. 项目概述

### 1.1 项目类型
- **应用类型**: 单页 Web 应用（纯前端）
- **部署方式**: 静态文件部署（无需服务器）
- **运行环境**: 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+, Edge 80+）

### 1.2 核心目标
- **解决的问题**: 帮助用户制定、管理和追踪学习计划，提升学习效率
- **目标用户**: 学生、职场人士、终身学习者
- **性能要求**: 
  - 页面加载时间 < 1秒
  - 操作响应时间 < 100ms
  - 数据本地持久化，支持离线使用

### 1.3 技术选型总览
- **前端技术栈**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **数据存储**: 浏览器 localStorage
- **开发工具**: 无需构建工具，原生开发
- **版本控制**: Git

---

## 2. 架构设计

### 2.1 系统架构

#### 整体架构
采用 **分层架构模式**，将应用分为四个层次：

```
┌─────────────────────────────────────────┐
│          UI Layer (HTML/CSS)            │
│  - 页面结构布局                           │
│  - 样式渲染                               │
│  - 用户交互界面                           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Controller Layer (app.js)          │
│  - 事件监听与处理                         │
│  - 业务逻辑协调                           │
│  - UI 更新控制                           │
│  - 数据流管理                             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       Model Layer (plan.js)             │
│  - 数据结构定义                           │
│  - 数据验证逻辑                           │
│  - 业务规则封装                           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Storage Layer (storage.js)          │
│  - localStorage 读写封装                  │
│  - 数据序列化/反序列化                    │
│  - 缓存管理                               │
└─────────────────────────────────────────┘
```

#### 分层设计原则
- **UI 层**: 只负责展示和用户交互，不包含业务逻辑
- **Controller 层**: 协调 UI 和 Model，处理用户操作，不直接操作数据
- **Model 层**: 定义数据结构和业务规则，提供数据操作接口
- **Storage 层**: 封装数据持久化逻辑，提供统一的存储接口

#### 数据流向
```
用户操作 → Controller → Model → Storage
                ↓
              UI 更新 ← Model ← Storage
```

### 2.2 技术栈详解

#### 前端技术选型
| 技术 | 选择 | 理由 |
|------|------|------|
| 页面结构 | HTML5 | 语义化标签，更好的可访问性和SEO |
| 样式 | CSS3 (原生) | 无需构建工具，快速开发，易于维护 |
| 逻辑 | Vanilla JavaScript (ES6+) | 无框架依赖，轻量级，性能好，学习成本低 |
| 存储 | localStorage | 浏览器原生支持，无需后端，适合小型应用 |

#### 技术选型原则
- **简单优先**: 避免过度设计，选择最简单的技术方案
- **无依赖**: 不依赖第三方库，降低复杂度和学习成本
- **性能优先**: 原生技术栈，性能最优
- **易于维护**: 代码结构清晰，便于后续维护和扩展

#### 为什么不使用框架？
1. **项目规模**: 功能简单，无需框架提供的复杂特性
2. **性能考虑**: 原生 JavaScript 性能最佳
3. **学习成本**: 降低开发门槛，团队成员容易上手
4. **维护成本**: 没有框架版本升级带来的维护负担

### 2.3 部署方案

#### 部署架构
```
静态文件服务器
    │
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js
        ├── storage.js
        ├── models/
        │   └── plan.js
        └── utils/
            └── date.js
```

#### 部署选项
**推荐方案 1: GitHub Pages**
- **优点**: 免费、简单、支持自定义域名
- **适用**: 个人项目、开源项目
- **步骤**: 
  1. 创建 GitHub 仓库
  2. 推送代码到 main 分支
  3. 在仓库设置中启用 GitHub Pages
  4. 选择部署分支

**推荐方案 2: Vercel**
- **优点**: 免费、自动部署、CDN 加速
- **适用**: 生产环境
- **步骤**:
  1. 连接 GitHub 仓库
  2. 自动检测静态站点
  3. 自动部署和发布

**推荐方案 3: 本地文件服务器**
- **优点**: 无需网络，适合本地开发测试
- **适用**: 开发环境
- **工具**: VS Code Live Server、Python http.server

#### CI/CD 流程（可选）
```
代码提交 → Git Push → GitHub Actions → 自动部署
                          │
                          ├── 代码检查 (ESLint)
                          ├── 运行测试
                          └── 部署到 GitHub Pages
```

---

## 3. 模块设计

### 3.1 模块划分原则
- **单一职责**: 每个模块只负责一个特定功能
- **高内聚低耦合**: 模块内部功能相关性强，模块间依赖少
- **易于测试**: 模块可独立测试
- **可扩展性**: 预留扩展接口，便于未来添加新功能

### 3.2 模块列表
| 模块名 | 文件 | 职责 | 依赖模块 | 备注 |
|--------|------|------|----------|------|
| UI 模块 | index.html, style.css | 页面结构、样式渲染 | 无 | 视图层 |
| 主控制器 | app.js | 应用主逻辑、事件处理、UI 更新 | plan.js, storage.js, date.js | 核心模块 |
| 数据模型 | plan.js | 计划数据结构定义和验证 | 无 | 核心模块 |
| 存储模块 | storage.js | localStorage 读写封装 | 无 | 基础模块 |
| 工具模块 | date.js | 日期处理工具函数 | 无 | 基础模块 |

### 3.3 模块依赖关系图
```
app.js (主控制器)
    ├── plan.js (数据模型)
    ├── storage.js (存储模块)
    └── date.js (日期工具)
```

### 3.4 核心模块详解

#### 3.4.1 主控制器模块 (app.js)

**职责范围**:
- 初始化应用，加载数据
- 监听用户交互事件
- 协调 Model 和 UI 的更新
- 管理应用状态

**核心业务流程**:

**流程 1: 应用初始化**
```
1. DOMContentLoaded 事件触发
2. 调用 storage.loadData() 读取数据
3. 调用 renderPlanList() 渲染计划列表
4. 绑定事件监听器
```

**流程 2: 创建计划**
```
1. 用户点击"添加计划"按钮
2. 显示创建计划表单（模态框或侧边栏）
3. 用户填写表单
4. 验证表单数据
5. 调用 plan.js 创建计划对象
6. 调用 storage.savePlan() 保存数据
7. 重新渲染计划列表
8. 显示成功提示
```

**流程 3: 编辑计划**
```
1. 用户点击计划项的"编辑"按钮
2. 加载计划数据到编辑表单
3. 用户修改内容
4. 验证修改后的数据
5. 调用 plan.js 更新计划对象
6. 调用 storage.updatePlan() 更新数据
7. 重新渲染计划列表
8. 显示成功提示
```

**关键技术点**:
- **事件委托**: 使用事件委托优化大量计划项的事件监听
- **防抖/节流**: 对频繁操作（如进度拖拽）使用防抖/节流优化性能
- **数据同步**: 确保 UI 和 localStorage 数据同步

#### 3.4.2 数据模型模块 (plan.js)

**职责范围**:
- 定义计划数据结构
- 提供数据创建、更新、删除方法
- 数据验证逻辑

**核心接口设计**:
```javascript
// 计划类
class Plan {
  constructor(data) {
    this.id = generateUUID();
    this.title = data.title;
    this.type = data.type; // 'daily' | 'weekly' | 'monthly' | 'longterm'
    this.status = data.status || 'pending'; // 'pending' | 'in_progress' | 'completed'
    this.progress = data.progress || 0; // 0-100
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // 更新进度
  updateProgress(progress) { ... }
  
  // 更新状态
  updateStatus(status) { ... }
  
  // 验证数据
  validate() { ... }
}

// 工厂函数
function createPlan(data) { ... }
function updatePlan(id, data) { ... }
function deletePlan(id) { ... }
```

**数据验证规则**:
- **title**: 必填，长度 1-100 字符
- **type**: 必填，枚举值 ['daily', 'weekly', 'monthly', 'longterm']
- **status**: 必填，枚举值 ['pending', 'in_progress', 'completed']
- **progress**: 必填，数值范围 0-100
- **startDate**: 必填，有效日期格式 YYYY-MM-DD
- **endDate**: 必填，有效日期格式 YYYY-MM-DD，且必须 >= startDate

**关键技术点**:
- **UUID 生成**: 使用简单算法生成唯一 ID
- **数据不可变性**: 返回新对象而非修改原对象
- **验证时机**: 创建和更新时都需验证

#### 3.4.3 存储模块 (storage.js)

**职责范围**:
- 封装 localStorage 操作
- 数据序列化/反序列化
- 数据迁移和版本管理

**核心接口设计**:
```javascript
const STORAGE_KEY = 'learning_plans';

// 加载所有计划
function loadPlans() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 保存所有计划
function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// 添加计划
function addPlan(plan) { ... }

// 更新计划
function updatePlan(id, updatedPlan) { ... }

// 删除计划
function deletePlan(id) { ... }

// 根据 ID 查询计划
function getPlanById(id) { ... }

// 按条件筛选计划
function filterPlans(criteria) { ... }
```

**数据存储格式**:
```javascript
// localStorage 中存储的数据结构
{
  "version": "1.0",
  "plans": [
    {
      "id": "uuid-xxx",
      "title": "学习 React Hooks",
      "type": "daily",
      "status": "in_progress",
      "progress": 50,
      "startDate": "2025-03-06",
      "endDate": "2025-03-06",
      "createdAt": "2025-03-06T10:00:00Z",
      "updatedAt": "2025-03-06T10:00:00Z"
    }
  ]
}
```

**关键技术点**:
- **存储限制**: localStorage 限制约 5MB，需监控数据大小
- **错误处理**: try-catch 处理 JSON 解析错误
- **数据迁移**: 预留版本号，便于未来数据结构升级
- **性能优化**: 大量数据时考虑分页或索引

#### 3.4.4 日期工具模块 (date.js)

**职责范围**:
- 日期格式化
- 日期计算
- 日期验证

**核心接口设计**:
```javascript
// 格式化日期为 YYYY-MM-DD
function formatDate(date) { ... }

// 格式化日期为显示格式（如：2025年3月6日）
function formatDateDisplay(date) { ... }

// 计算两个日期之间的天数
function getDaysBetween(date1, date2) { ... }

// 判断日期是否过期
function isOverdue(date) { ... }

// 获取相对时间描述（如：3天后到期）
function getRelativeTime(date) { ... }

// 验证日期格式
function isValidDate(dateString) { ... }
```

**关键技术点**:
- **时区处理**: 使用本地时区，避免 UTC 时间混淆
- **边界情况**: 处理无效日期、闰年等边界情况
- **性能**: 避免频繁创建 Date 对象

---

## 4. 数据设计

### 4.1 数据库设计原则

由于使用 localStorage 作为存储方案，需遵循以下原则：
- **数据结构扁平化**: 避免深层嵌套，便于查询和更新
- **数据冗余控制**: 平衡查询效率和存储空间
- **索引策略**: 使用数组存储，按需过滤和排序

### 4.2 核心数据结构

#### 计划对象 (Plan)
```javascript
{
  // 唯一标识符
  id: string,  // UUID 格式，如: "550e8400-e29b-41d4-a716-446655440000"
  
  // 基本信息
  title: string,  // 计划标题，长度 1-100 字符
  
  // 分类信息
  type: 'daily' | 'weekly' | 'monthly' | 'longterm',  // 计划类型
  
  // 状态信息
  status: 'pending' | 'in_progress' | 'completed',  // 计划状态
  progress: number,  // 进度百分比，范围 0-100
  
  // 时间信息
  startDate: string,  // 开始日期，格式 YYYY-MM-DD
  endDate: string,    // 截止日期，格式 YYYY-MM-DD
  createdAt: string,   // 创建时间，ISO 8601 格式
  updatedAt: string    // 更新时间，ISO 8601 格式
}
```

#### localStorage 存储结构
```javascript
{
  "version": "1.0",        // 数据版本号，便于未来迁移
  "lastUpdated": string,   // 最后更新时间
  "plans": [               // 计划数组
    { /* Plan 对象 */ },
    { /* Plan 对象 */ }
  ]
}
```

### 4.3 数据关系

#### 单一实体
- 计划是独立实体，无外键关联
- 每个计划通过唯一 ID 标识

#### 数据完整性
- **唯一性约束**: id 字段唯一
- **枚举约束**: type 和 status 字段必须是预定义值
- **范围约束**: progress 字段必须在 0-100 之间
- **时间约束**: endDate 必须 >= startDate

### 4.4 数据流设计

#### 创建计划流程
```
用户输入 → 表单验证 → Plan 构造函数 → 数据验证 → 存储到 localStorage → UI 更新
```

#### 查询计划流程
```
页面加载 → 从 localStorage 读取 → 反序列化 → 数据过滤/排序 → 渲染 UI
```

#### 更新计划流程
```
用户编辑 → 表单验证 → 数据验证 → 更新 localStorage → UI 更新
```

#### 删除计划流程
```
用户确认 → 从 localStorage 删除 → UI 更新
```

### 4.5 缓存策略

#### 内存缓存
- **目的**: 减少 localStorage 读取次数，提升性能
- **实现**: 在 app.js 中维护 plans 数组
- **更新时机**: 数据变化时同步更新内存和 localStorage

#### 缓存失效策略
```
数据变化 → 立即更新 localStorage → 同步更新内存缓存
```

### 4.6 数据备份与恢复

#### 备份方案
- **手动导出**: 提供"导出数据"功能，下载 JSON 文件
- **定期提醒**: 每周提醒用户备份数据

#### 恢复方案
- **手动导入**: 提供"导入数据"功能，上传 JSON 文件
- **数据合并**: 导入时可选择覆盖或合并现有数据

#### 实现建议
```javascript
// 导出数据
function exportData() {
  const data = localStorage.getItem('learning_plans');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // 创建下载链接并触发下载
}

// 导入数据
function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    // 验证数据格式
    // 合并或覆盖现有数据
  };
  reader.readAsText(file);
}
```

---

## 5. 技术方案

### 5.1 数据验证方案

#### 验证时机
- **前端验证**: 创建和更新计划时立即验证
- **验证触发**: 表单提交、输入失焦、实时验证

#### 验证规则
```javascript
// 计划数据验证
function validatePlan(plan) {
  const errors = [];
  
  // 标题验证
  if (!plan.title || plan.title.trim().length === 0) {
    errors.push('标题不能为空');
  } else if (plan.title.length > 100) {
    errors.push('标题长度不能超过100字符');
  }
  
  // 类型验证
  const validTypes = ['daily', 'weekly', 'monthly', 'longterm'];
  if (!validTypes.includes(plan.type)) {
    errors.push('无效的计划类型');
  }
  
  // 状态验证
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (!validStatuses.includes(plan.status)) {
    errors.push('无效的计划状态');
  }
  
  // 进度验证
  if (plan.progress < 0 || plan.progress > 100) {
    errors.push('进度必须在0-100之间');
  }
  
  // 日期验证
  if (!isValidDate(plan.startDate)) {
    errors.push('无效的开始日期');
  }
  if (!isValidDate(plan.endDate)) {
    errors.push('无效的截止日期');
  }
  if (plan.endDate < plan.startDate) {
    errors.push('截止日期不能早于开始日期');
  }
  
  return errors;
}
```

#### 错误提示策略
- **实时提示**: 输入框下方显示错误信息
- **提交时验证**: 显示所有错误，高亮第一个错误字段
- **用户友好**: 使用清晰的语言描述错误原因

### 5.2 UI 交互方案

#### 表单交互
- **创建计划**: 模态框或侧边栏滑出
- **编辑计划**: 复用创建表单，预填充数据
- **删除确认**: 弹出确认对话框

#### 状态切换
- **点击切换**: 点击状态标签循环切换状态
- **进度拖拽**: 进度条支持拖拽调整
- **即时保存**: 状态和进度变化时自动保存

#### 列表展示
- **卡片布局**: 每个计划显示为卡片
- **状态标识**: 不同状态使用不同颜色
- **进度可视化**: 进度条显示完成百分比

#### 筛选与搜索
- **筛选器**: 下拉菜单选择状态/类型
- **搜索框**: 实时搜索，支持标题模糊匹配
- **排序**: 支持按日期、状态、进度排序

### 5.3 响应式设计

#### 断点设置
```css
/* 移动端 */
@media (max-width: 767px) {
  /* 单列布局 */
  /* 隐藏次要信息 */
  /* 增大触控区域 */
}

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 两列布局 */
}

/* 桌面端 */
@media (min-width: 1024px) {
  /* 多列布局 */
  /* 显示所有信息 */
}
```

#### 移动端优化
- **触控友好**: 按钮最小 44x44px
- **手势支持**: 支持滑动删除（可选）
- **简化布局**: 隐藏或折叠次要功能
- **性能优化**: 减少重排重绘

### 5.4 错误处理方案

#### 错误分类
1. **数据验证错误**: 用户输入不符合规则
2. **存储错误**: localStorage 读写失败
3. **浏览器兼容性错误**: 浏览器不支持某些 API

#### 处理策略
```javascript
// localStorage 操作错误处理
function safeLocalStorageOperation(operation, fallback) {
  try {
    return operation();
  } catch (error) {
    console.error('localStorage operation failed:', error);
    
    // 显示用户友好的错误提示
    showNotification('数据保存失败，请检查浏览器设置', 'error');
    
    // 执行降级方案
    if (fallback) {
      return fallback();
    }
    
    return null;
  }
}

// 使用示例
const plans = safeLocalStorageOperation(
  () => JSON.parse(localStorage.getItem('learning_plans')),
  () => []  // 降级方案：返回空数组
);
```

#### 用户提示
- **成功提示**: 操作成功后显示绿色提示，2秒后自动消失
- **错误提示**: 操作失败显示红色提示，需手动关闭
- **确认对话框**: 删除等危险操作需用户确认

### 5.5 性能优化方案

#### 加载性能
- **延迟加载**: 非关键资源延迟加载
- **关键路径**: 内联关键 CSS，优先加载主逻辑
- **减少请求**: 单个 HTML/CSS/JS 文件，减少 HTTP 请求

#### 运行时性能
- **事件委托**: 使用事件委托减少事件监听器数量
- **防抖节流**: 对频繁操作（搜索、拖拽）使用防抖/节流
- **虚拟滚动**: 计划数量 > 100 时考虑虚拟滚动
- **避免重排**: 批量 DOM 更新，使用文档片段

#### 内存优化
- **及时清理**: 删除数据时清理相关引用
- **避免泄漏**: 移除不需要的事件监听器

### 5.6 浏览器兼容性方案

#### 特性检测
```javascript
// 检测 localStorage 支持
function isLocalStorageSupported() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// 检测 ES6 支持
function isES6Supported() {
  try {
    new Function('(a = 0) => a');
    return true;
  } catch (e) {
    return false;
  }
}
```

#### 降级方案
- **localStorage 不可用**: 使用内存存储（会话级别）
- **ES6 不支持**: 显示提示，建议升级浏览器

#### 目标浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## 6. 开发规范

### 6.1 目录结构

#### 推荐的项目结构
```
学习记录表/
├── index.html                 # 主页面入口
├── css/
│   └── style.css              # 样式文件
├── js/
│   ├── app.js                 # 主应用逻辑
│   ├── storage.js             # localStorage 封装
│   ├── models/
│   │   └── plan.js            # 计划数据模型
│   └── utils/
│       ├── date.js            # 日期处理工具
│       ├── validator.js       # 数据验证工具（可选）
│       └── notification.js    # 通知提示工具（可选）
├── assets/                    # 静态资源（可选）
│   └── icons/
├── tests/                     # 测试文件（可选）
│   └── plan.test.js
├── README.md                  # 项目说明
├── TECHNICAL_ARCHITECTURE.md  # 技术架构文档
└── PROJECT_PLAN.md            # 项目功能文档
```

#### 目录命名规范
- **使用英文**: 所有目录和文件名使用英文
- **kebab-case**: 使用小写字母和连字符（如：date-utils.js）
- **避免缩写**: 使用完整单词，提高可读性

### 6.2 命名规范

#### 变量/函数命名
- **变量**: 使用名词，描述数据内容
  ```javascript
  // 推荐
  const plans = [];
  const currentPlan = null;
  
  // 不推荐
  const p = [];
  const cp = null;
  ```
  
- **函数**: 使用动词或动词短语，描述行为
  ```javascript
  // 推荐
  function createPlan() { }
  function updatePlanProgress() { }
  function deletePlanById() { }
  
  // 不推荐
  function plan() { }
  function progress() { }
  ```

- **布尔值**: 使用 is/has/can/should 前缀
  ```javascript
  // 推荐
  const isCompleted = true;
  const hasEndDate = false;
  const canEdit = true;
  
  // 不推荐
  const completed = true;
  const endDate = false;
  ```

- **常量**: 全大写下划线分隔
  ```javascript
  const STORAGE_KEY = 'learning_plans';
  const MAX_TITLE_LENGTH = 100;
  const DATE_FORMAT = 'YYYY-MM-DD';
  ```

#### 文件命名
- **JavaScript 文件**: kebab-case（如：date-utils.js）
- **CSS 文件**: kebab-case（如：plan-list.css）
- **HTML 文件**: kebab-case（如：index.html）
- **测试文件**: *.test.js 或 *.spec.js（如：plan.test.js）

#### CSS 类名命名
- **使用 BEM 方法论**: Block__Element--Modifier
  ```css
  /* Block */
  .plan-list { }
  
  /* Element */
  .plan-list__item { }
  .plan-list__title { }
  
  /* Modifier */
  .plan-list__item--completed { }
  .plan-list__item--overdue { }
  ```

#### ID 命名
- **使用 camelCase**: 如 `planList`, `createPlanForm`
- **语义化**: 描述元素用途，如 `deleteButton`, `statusFilter`

### 6.3 代码风格

#### JavaScript 代码组织
```javascript
// 1. 常量定义
const STORAGE_KEY = 'learning_plans';
const MAX_PROGRESS = 100;

// 2. 工具函数
function generateUUID() {
  // ...
}

// 3. 数据模型类
class Plan {
  constructor(data) {
    // ...
  }
}

// 4. 存储模块
const Storage = {
  loadPlans() { },
  savePlans() { }
};

// 5. 主应用逻辑
const App = {
  init() { },
  bindEvents() { },
  renderPlanList() { }
};

// 6. 初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
```

#### 注释规范
```javascript
/**
 * 创建新计划
 * @param {Object} data - 计划数据
 * @param {string} data.title - 计划标题
 * @param {string} data.type - 计划类型
 * @returns {Plan} 创建的计划对象
 * @throws {Error} 数据验证失败时抛出错误
 */
function createPlan(data) {
  // 验证数据
  const errors = validatePlan(data);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // 创建计划对象
  const plan = new Plan(data);
  
  return plan;
}

// 单行注释：说明复杂逻辑的原因
// 使用事件委托减少事件监听器数量，提升性能
planList.addEventListener('click', handlePlanClick);

// TODO: 未来添加的功能
// TODO: 添加计划标签功能
```

#### 代码组织原则
- **单一职责**: 一个函数只做一件事
- **函数长度**: 单个函数不超过 50 行
- **参数数量**: 函数参数不超过 3 个
- **避免嵌套**: 嵌套层级不超过 3 层

### 6.4 HTML 规范

#### 语义化标签
```html
<!-- 推荐：使用语义化标签 -->
<header>
  <nav>
    <ul>
      <li><a href="#plans">我的计划</a></li>
    </ul>
  </nav>
</header>

<main>
  <section id="plans">
    <h2>学习计划</h2>
    <article class="plan-card">
      <h3>学习 React Hooks</h3>
      <p>今天学习 React Hooks 基础</p>
    </article>
  </section>
</main>

<footer>
  <p>&copy; 2025 学习计划管理器</p>
</footer>

<!-- 不推荐：滥用 div -->
<div class="header">
  <div class="nav">
    <div class="link">我的计划</div>
  </div>
</div>
```

#### 可访问性
```html
<!-- 添加 ARIA 标签 -->
<button aria-label="创建新计划" id="createPlanBtn">
  <span class="icon">+</span>
</button>

<!-- 表单字段关联 label -->
<label for="planTitle">计划标题</label>
<input type="text" id="planTitle" name="title" required>

<!-- 错误提示 -->
<input type="text" id="planTitle" aria-describedby="titleError">
<span id="titleError" role="alert"></span>
```

### 6.5 CSS 规范

#### 样式组织
```css
/* 1. CSS 变量定义 */
:root {
  --primary-color: #3498db;
  --success-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --text-color: #333;
  --border-radius: 4px;
  --transition: all 0.3s ease;
}

/* 2. 重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 3. 通用样式 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
}

/* 4. 组件样式 */
.plan-card {
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 12px;
  transition: var(--transition);
}

.plan-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 5. 状态样式 */
.plan-card--completed {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.plan-card--overdue {
  border-left: 3px solid var(--danger-color);
}

/* 6. 响应式样式 */
@media (max-width: 767px) {
  .plan-card {
    padding: 12px;
  }
}
```

#### CSS 命名约定
- **使用类选择器**: 避免使用 ID 选择器和标签选择器
- **避免 !important**: 除非覆盖第三方样式
- **避免嵌套过深**: 最多嵌套 3 层

### 6.6 Git 工作流

#### 分支策略
```
main (生产分支)
  │
  ├── develop (开发分支)
  │     │
  │     ├── feature/add-filter (功能分支)
  │     ├── feature/add-search (功能分支)
  │     └── fix/storage-error (修复分支)
  │
  └── hotfix/critical-bug (紧急修复分支)
```

#### 提交规范
```
<类型>(<范围>): <描述>

类型：
- feat: 新功能
- fix: 修复 bug
- docs: 文档修改
- style: 代码格式修改（不影响功能）
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

范围：可选，表示影响的模块
- plan: 计划相关
- storage: 存储相关
- ui: 界面相关

示例：
feat(plan): 添加计划筛选功能
fix(storage): 修复 localStorage 读取失败的问题
docs(readme): 更新项目说明文档
style(ui): 统一按钮样式
refactor(plan): 重构计划创建逻辑
```

#### Commit Message 示例
```
feat(plan): 添加计划筛选功能

- 新增按状态筛选功能
- 新增按类型筛选功能
- 更新 UI 显示筛选器

Closes #123
```

### 6.7 测试规范

#### 单元测试
```javascript
// tests/plan.test.js

describe('Plan', () => {
  test('should create a plan with valid data', () => {
    const data = {
      title: '学习 React',
      type: 'daily',
      status: 'pending',
      progress: 0,
      startDate: '2025-03-06',
      endDate: '2025-03-06'
    };
    
    const plan = createPlan(data);
    
    expect(plan.id).toBeDefined();
    expect(plan.title).toBe('学习 React');
    expect(plan.type).toBe('daily');
  });
  
  test('should throw error with invalid title', () => {
    const data = {
      title: '',
      type: 'daily'
    };
    
    expect(() => createPlan(data)).toThrow('标题不能为空');
  });
});
```

#### 集成测试
```javascript
// tests/storage.test.js

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  test('should save and load plans', () => {
    const plans = [
      { id: '1', title: 'Plan 1' },
      { id: '2', title: 'Plan 2' }
    ];
    
    savePlans(plans);
    const loadedPlans = loadPlans();
    
    expect(loadedPlans).toEqual(plans);
  });
});
```

---

## 7. 开发计划

### 7.1 开发阶段划分

#### 第一阶段：基础搭建 (第1天)
**目标**: 完成项目结构和基础框架

- [ ] 创建项目目录结构
- [ ] 编写 HTML 页面骨架
- [ ] 编写基础 CSS 样式
- [ ] 实现 plan.js 数据模型
- [ ] 实现 storage.js 存储模块
- [ ] 实现 date.js 日期工具
- [ ] 编写基础测试用例

**验收标准**:
- 页面可正常访问
- 数据模型可正常创建和验证
- localStorage 可正常读写

#### 第二阶段：核心功能 (第2-3天)
**目标**: 实现核心 CRUD 功能

**第2天**:
- [ ] 实现创建计划功能
  - 创建计划表单 UI
  - 表单验证逻辑
  - 保存到 localStorage
  - 显示成功提示
- [ ] 实现计划列表展示
  - 渲染计划列表
  - 显示计划状态和进度
  - 空状态提示

**第3天**:
- [ ] 实现编辑计划功能
  - 编辑表单 UI
  - 加载计划数据到表单
  - 更新 localStorage
  - 显示成功提示
- [ ] 实现删除计划功能
  - 删除确认对话框
  - 删除计划逻辑
  - 更新列表显示
- [ ] 实现状态和进度管理
  - 状态切换交互
  - 进度条拖拽/输入
  - 自动保存

**验收标准**:
- 可创建、编辑、删除计划
- 状态和进度可正常修改
- 数据刷新页面后仍然存在

#### 第三阶段：增强功能 (第4天)
**目标**: 完善用户体验

- [ ] 实现筛选功能
  - 按状态筛选
  - 按类型筛选
  - 组合筛选
- [ ] 实现搜索功能
  - 标题模糊搜索
  - 实时搜索
- [ ] 实现统计概览
  - 显示总计划数
  - 显示各状态数量
  - 显示完成率
- [ ] 实现排序功能
  - 按日期排序
  - 按状态排序
  - 按创建时间排序
- [ ] 响应式适配
  - 移动端布局优化
  - 平板布局优化
  - 触控优化

**验收标准**:
- 筛选和搜索功能正常工作
- 统计数据准确显示
- 移动端可正常使用

#### 第四阶段：优化和测试 (第5天)
**目标**: 性能优化和全面测试

- [ ] 性能优化
  - 添加防抖/节流
  - 优化事件监听
  - 减少 DOM 操作
- [ ] 错误处理
  - 添加全局错误处理
  - 添加用户友好的错误提示
  - 处理边界情况
- [ ] 全面测试
  - 功能测试
  - 兼容性测试
  - 性能测试
- [ ] 文档完善
  - 更新 README
  - 编写使用说明
  - 添加代码注释

**验收标准**:
- 页面加载时间 < 1秒
- 操作响应时间 < 100ms
- 无明显 bug

### 7.2 开发注意事项

#### 代码质量
- **及时提交**: 每完成一个功能点就提交代码
- **编写测试**: 关键功能编写单元测试
- **代码审查**: 提交前自查代码质量

#### 性能监控
- 使用 Chrome DevTools 监控性能
- 关注内存使用情况
- 检查 localStorage 大小

#### 用户体验
- 及时反馈用户操作
- 提供友好的错误提示
- 添加加载状态（如有需要）

---

## 8. 验收标准

### 8.1 功能验收

#### 核心功能
- [ ] 可以创建四种类型的计划（每日/每周/月度/长期）
- [ ] 可以修改计划内容、状态、进度、日期
- [ ] 可以删除计划（带确认）
- [ ] 数据刷新页面后仍然存在
- [ ] 状态可正常切换（未开始/进行中/已完成）
- [ ] 进度可正常调整（0-100%）

#### 增强功能
- [ ] 可以按状态筛选计划
- [ ] 可以按类型筛选计划
- [ ] 可以搜索计划（标题模糊匹配）
- [ ] 可以按多种维度排序
- [ ] 统计数据准确显示

#### 数据验证
- [ ] 标题不能为空
- [ ] 标题长度限制 1-100 字符
- [ ] 日期格式验证（YYYY-MM-DD）
- [ ] 截止日期不能早于开始日期
- [ ] 进度范围 0-100

### 8.2 视觉验收

#### 页面布局
- [ ] 页面布局整洁美观
- [ ] 信息层次清晰
- [ ] 字体大小合适
- [ ] 颜色搭配协调

#### 状态区分
- [ ] 未开始状态有明确的视觉标识
- [ ] 进行中状态有明确的视觉标识
- [ ] 已完成状态有明确的视觉标识
- [ ] 过期计划有视觉提示

#### 响应式
- [ ] 桌面端布局正常
- [ ] 平板端布局正常
- [ ] 移动端布局正常
- [ ] 所有功能在移动端可用

### 8.3 性能验收

#### 加载性能
- [ ] 页面首次加载时间 < 1秒
- [ ] 资源大小合理（总大小 < 500KB）
- [ ] 无阻塞渲染的资源

#### 运行时性能
- [ ] 操作响应时间 < 100ms
- [ ] 列表滚动流畅
- [ ] 表单输入流畅
- [ ] 无明显卡顿

#### 内存使用
- [ ] 内存占用合理（< 50MB）
- [ ] 无内存泄漏
- [ ] localStorage 大小合理（< 1MB）

### 8.4 兼容性验收

#### 浏览器兼容
- [ ] Chrome 80+ 正常运行
- [ ] Firefox 75+ 正常运行
- [ ] Safari 13+ 正常运行
- [ ] Edge 80+ 正常运行

#### 设备兼容
- [ ] 桌面端正常运行
- [ ] 平板端正常运行
- [ ] 移动端正常运行
- [ ] 触控操作流畅

### 8.5 代码质量验收

#### 代码规范
- [ ] 代码格式统一
- [ ] 命名清晰易懂
- [ ] 注释充分
- [ ] 无明显冗余代码

#### 错误处理
- [ ] 关键操作有错误处理
- [ ] 错误提示用户友好
- [ ] 无未捕获的异常

#### 可维护性
- [ ] 模块划分清晰
- [ ] 依赖关系简单
- [ ] 易于扩展新功能

---

## 9. 附录

### 9.1 技术决策记录

#### 为什么选择 Vanilla JavaScript？
1. **项目规模小**: 功能简单，无需框架
2. **性能优先**: 原生 JavaScript 性能最佳
3. **学习成本低**: 无需学习框架 API
4. **维护成本低**: 无框架版本升级负担
5. **加载速度快**: 无需加载框架库

#### 为什么选择 localStorage？
1. **无需后端**: 纯前端应用，无需服务器
2. **浏览器原生**: 所有现代浏览器支持
3. **容量足够**: 5MB 足够存储学习计划数据
4. **使用简单**: API 简单易用
5. **离线可用**: 数据存储在本地，支持离线使用

#### 为什么不使用 TypeScript？
1. **开发成本**: 需要编译步骤，增加开发复杂度
2. **学习曲线**: 需要学习类型系统
3. **项目规模**: 项目较小，类型安全收益不大
4. **快速开发**: 原生 JavaScript 开发速度更快

### 9.2 未来扩展方向

#### 短期扩展（1-2个月）
- [ ] 数据导出功能（JSON/PDF）
- [ ] 数据导入功能
- [ ] 计划标签/分类
- [ ] 计划提醒功能
- [ ] 暗黑模式

#### 中期扩展（3-6个月）
- [ ] 云端同步（需后端支持）
- [ ] 用户登录注册
- [ ] 多设备同步
- [ ] 数据统计图表
- [ ] 计划模板功能

#### 长期扩展（6个月以上）
- [ ] 移动 App（React Native/Flutter）
- [ ] 桌面应用（Electron）
- [ ] 团队协作功能
- [ ] API 开放
- [ ] 插件系统

### 9.3 参考资料

#### 官方文档
- [MDN Web Docs - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)

#### 最佳实践
- [JavaScript 最佳实践](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [CSS BEM 命名规范](http://getbem.com/)
- [Web 可访问性指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [性能优化指南](https://web.dev/performance/)

#### 工具推荐
- **开发工具**: VS Code, Chrome DevTools
- **版本控制**: Git, GitHub
- **测试工具**: Jest (可选)
- **部署平台**: GitHub Pages, Vercel, Netlify

---

## 10. 总结

本文档提供了学习计划管理应用的完整技术架构指导，包括：

1. **架构设计**: 清晰的分层架构，职责分离
2. **模块设计**: 高内聚低耦合的模块划分
3. **数据设计**: 简洁高效的数据结构
4. **技术方案**: 实用的技术实现方案
5. **开发规范**: 统一的代码和协作规范
6. **开发计划**: 明确的阶段划分和验收标准

开发人员应根据本文档指导进行开发，确保代码质量和项目成功交付。如遇技术难题，可参考附录中的参考资料或寻求团队支持。

**祝开发顺利！** 🚀