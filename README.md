# 🍅 Chrono Focus

一个功能完整的跨平台番茄钟 + 休息提醒 + 喝水提醒 + 任务管理桌面应用

## ✨ 功能特性

### 🍅 番茄钟
- 25分钟专注时间（可自定义）
- 5分钟短休息 / 15分钟长休息
- 自动切换番茄钟和休息
- 记录完成的番茄钟数量
- **关联具体任务**，追踪每个任务的番茄钟

### 📋 任务管理
- **任务列表管理**：创建、查看、删除任务
- **任务分解引导**：创建任务时引导拆分子任务
- **进度追踪**：实时查看子任务完成进度
- **任务状态**：区分进行中和已完成任务
- **番茄钟关联**：为每个任务记录投入的番茄钟数量

### 😴 休息提醒
- 定时提醒休息（默认每30分钟）
- 系统通知提醒
- 可自定义提醒间隔

### 🧍 站立提醒（NEW！）
- 定时提醒站立活动（默认每45分钟）
- 系统通知提醒
- 可自定义间隔和开关
- 仅在番茄钟运行时提醒

### 💧 喝水提醒
- 定时提醒喝水（默认每60分钟）
- 记录每日喝水进度
- 可设置每日喝水目标

### 📊 统计面板
- 今日完成的番茄钟数量
- 总专注时间
- 喝水进度追踪

### ⚙️ 自定义设置
- 番茄钟时长可调
- 休息时长可调
- 提醒开关和间隔自定义

## 🚀 技术栈

- **Electron** - 跨平台桌面应用
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Zustand** - 状态管理
- **Ant Design** - UI组件库
- **TailwindCSS** - 样式系统

## 📦 安装和运行

### 前置要求
- Node.js >= 16
- npm >= 8

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 Electron（在另一个终端）
npm run electron:start
```

### 构建生产版本

```bash
# 构建应用
npm run build

# 这将生成可执行文件在 release/ 目录
```

## 🎯 使用说明

### 1. 番茄钟（主界面）
- **选择任务**（可选）：从任务选择器中选择要专注的任务
- **开始番茄钟**：点击"开始"按钮开始专注
- **时间结束**：自动进入短休息

### 2. 📋 任务管理
- **创建任务**：点击"新建任务"按钮
- **任务分解**：按照引导将大任务拆分成子任务
- **查看进度**：在任务列表中查看子任务完成进度
- **完成任务**：点击完成按钮标记任务为已完成

### 3. 😴 休息提醒
- 默认每30分钟提醒休息
- 可在设置中调整或关闭

### 4. 🧍 站立提醒
- 默认每45分钟提醒站立活动
- 仅在番茄钟运行时提醒
- 可在设置中调整或关闭

### 5. 💧 喝水记录
- 切换到"喝水记录"标签
- 每次喝水后点击"记录一杯水"
- 查看每日进度

### 6. ⚙️ 自定义设置
- 进入"设置"标签
- 调整各时间段长度
- 开启/关闭提醒
- 调整提醒间隔

## 📝 项目结构

```
chrono-focus/
├── src/
│   ├── components/        # React 组件
│   │   ├── TimerDisplay.tsx       # 计时器显示
│   │   ├── TimerControls.tsx      # 控制按钮
│   │   ├── TimerTypeSelector.tsx  # 类型选择器
│   │   ├── TaskSelector.tsx       # 任务选择器
│   │   ├── TaskList.tsx           # 任务列表
│   │   ├── TaskCreationModal.tsx  # 任务创建（含分解引导）
│   │   ├── TaskDetailModal.tsx    # 任务详情
│   │   ├── SettingsPanel.tsx      # 设置面板
│   │   ├── StatsPanel.tsx         # 统计面板
│   │   └── WaterTracker.tsx       # 喝水记录
│   ├── hooks/            # 自定义 Hooks
│   │   └── useTimer.ts   # 定时器逻辑
│   ├── store/            # 状态管理
│   │   └── timerStore.ts # Zustand store
│   ├── utils/            # 工具函数
│   │   └── helpers.ts    # 辅助函数
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 启动 Vite 开发服务器
npm run dev

# 类型检查
npx tsc --noEmit

# 构建生产版本
npm run build
```

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
