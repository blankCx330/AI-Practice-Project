# 学习计划管理器 📚

一个简洁、高效的纯前端学习计划管理应用，帮助您制定、管理和追踪学习进度。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

## ✨ 功能特性

### 核心功能
- ✅ **计划管理** - 创建、编辑、删除学习计划
- ✅ **多种计划类型** - 支持每日、每周、月度和长期目标
- ✅ **状态追踪** - 未开始、进行中、已完成三种状态
- ✅ **进度管理** - 0-100% 进度条可视化
- ✅ **日期设置** - 开始日期和截止日期管理
- ✅ **数据持久化** - 使用 localStorage 本地存储

### 增强功能
- 🔍 **智能筛选** - 按类型、状态筛选计划
- 🔎 **快速搜索** - 关键词搜索计划标题
- 📊 **统计概览** - 实时显示计划统计信息
- 📈 **多种排序** - 按创建时间、截止日期、进度排序
- 💾 **数据导出** - 导出为 JSON 文件备份
- 📥 **数据导入** - 从 JSON 文件恢复数据

### 用户体验
- 🎨 **响应式设计** - 完美适配桌面、平板、移动端
- ⚡ **实时验证** - 表单输入即时验证反馈
- 🔔 **友好提示** - 操作成功/失败通知提示
- 🌙 **暗黑模式** - 护眼暗黑主题（规划中）

## 🚀 快速开始

### 方式一：直接打开（推荐）

1. 下载项目到本地
2. 双击 `index.html` 文件
3. 开始使用！

### 方式二：本地服务器

```bash
# 使用 Python 简单服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 或使用 VS Code Live Server 扩展
```

然后访问 `http://localhost:8000`

### 方式三：在线访问

部署在 GitHub Pages: [在线演示](#) (待部署)

## 📖 使用指南

### 创建计划

1. 点击右上角 **"添加计划"** 按钮
2. 填写计划信息：
   - **标题**：计划的名称（必填）
   - **类型**：每日/每周/月度/长期
   - **日期**：开始和截止日期（可选）
   - **状态**：未开始/进行中/已完成
   - **进度**：0-100% 拖拽设置
3. 点击 **"保存"** 完成

### 编辑计划

1. 找到要编辑的计划卡片
2. 点击 **"编辑"** 按钮
3. 修改信息后点击 **"保存"**

### 删除计划

1. 找到要删除的计划卡片
2. 点击 **"删除"** 按钮
3. 确认删除操作

### 筛选和搜索

- **类型筛选**：选择 "全部类型" 下拉菜单
- **状态筛选**：选择 "全部状态" 下拉菜单
- **排序方式**：选择 "按创建时间" 下拉菜单
- **关键词搜索**：在搜索框输入关键词

### 数据备份

1. 点击 **"导出"** 按钮
2. 自动下载 JSON 备份文件
3. 妥善保存该文件

### 数据恢复

1. 点击 **"导入"** 按钮
2. 选择之前导出的 JSON 文件
3. 确认导入，数据将覆盖现有数据

## 🏗️ 项目结构

```
学习记录表/
├── index.html                 # 主页面
├── css/
│   └── style.css              # 样式文件
├── js/
│   ├── app.js                 # 主应用逻辑
│   ├── storage.js             # 数据存储模块
│   ├── models/
│   │   └── plan.js            # 计划数据模型
│   └── utils/
│       ├── date.js            # 日期工具
│       ├── errorHandler.js    # 错误处理
│       ├── notification.js    # 通知提示
│       └── formValidator.js   # 表单验证
├── tests/
│   ├── test-runner.html       # 测试运行器
│   └── unit/                  # 单元测试
│       ├── plan.test.js
│       ├── storage.test.js
│       ├── date.test.js
│       └── integration.test.js
├── README.md                  # 项目说明
├── TECHNICAL_ARCHITECTURE.md  # 技术架构文档
└── PROJECT_PLAN.md            # 项目功能文档
```

## 🛠️ 技术栈

- **前端框架**：原生 JavaScript (ES6+)
- **样式**：原生 CSS3
- **存储**：浏览器 localStorage
- **架构模式**：MVC (Model-View-Controller)
- **无依赖**：零第三方库，纯原生实现

## 🎯 核心设计

### 数据模型

```javascript
{
  id: string,           // 唯一标识
  title: string,        // 计划标题
  type: string,         // 计划类型
  status: string,       // 计划状态
  progress: number,     // 进度 0-100
  startDate: string,    // 开始日期
  endDate: string,      // 截止日期
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

### 架构分层

```
┌─────────────────────────┐
│     UI Layer (HTML)     │
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│ Controller Layer (app.js)│
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│  Model Layer (plan.js)  │
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│ Storage Layer (storage.js)│
└─────────────────────────┘
```

## 🧪 运行测试

1. 打开 `tests/test-runner.html`
2. 查看测试结果（40+ 测试用例）
3. 所有测试应该通过 ✅

## 🌐 浏览器支持

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📝 开发计划

### 已完成 ✅
- [x] 核心功能（CRUD）
- [x] 状态和进度管理
- [x] 筛选和搜索
- [x] 数据持久化
- [x] 响应式设计
- [x] 测试套件

### 进行中 🚧
- [ ] 暗黑模式
- [ ] 键盘快捷键
- [ ] localStorage 配额监控

### 规划中 📋
- [ ] PWA 支持
- [ ] 标签系统
- [ ] 数据统计图表
- [ ] 云端同步

## 🤝 贡献指南

欢迎贡献代码、提出问题或建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👤 作者

- 项目创建者：OpenCode AI
- 技术支持：查看 [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)

## 🙏 致谢

- 感谢所有贡献者
- 灵感来源：高效学习方法论
- 设计参考：现代 UI/UX 最佳实践

---

**⭐ 如果这个项目对您有帮助，请给一个 Star！**

Made with ❤️ by OpenCode AI