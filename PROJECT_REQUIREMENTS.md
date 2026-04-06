# Chrono Focus - 项目需求梳理报告

## 一、项目概述

**Chrono Focus** 是一个功能完整的跨平台桌面应用，集成了番茄钟（专注计时）、土豆钟（娱乐计时）、休息提醒、喝水提醒、站立/拉伸/远眺/走动提醒、任务管理以及数据统计等功能。

---

## 二、技术栈

| 类别 | 技术 |
|------|------|
| **桌面框架** | Electron 41.1.1 |
| **UI 框架** | React 18 |
| **语言** | TypeScript 5.3.3 |
| **构建工具** | Vite 5.0.8 |
| **状态管理** | Zustand 4.4.7 |
| **路由** | React Router DOM 7.14.0 (HashRouter) |
| **样式** | TailwindCSS 3.4.0 + shadcn/ui 组件系统 |
| **UI 组件库** | Radix UI (Checkbox, Dialog, Popover, Progress, Select, Slot, Switch, Tabs, Tooltip) |
| **图标** | Lucide React 1.7.0 |
| **日期处理** | date-fns 4.1.0 |
| **工具库** | class-variance-authority, clsx, tailwind-merge |
| **开机自启** | auto-launch 5.0.6 |
| **打包工具** | Electron Forge 7.11.1 (DMG + ZIP) |

---

## 三、核心功能模块

### 1. 番茄钟 (Pomodoro Clock)

**路由**: `/`

**功能**:
- **专注模式**: 默认 25 分钟专注时间（可自定义 1-60 分钟）
- **短休息**: 默认 5 分钟（可自定义 1-30 分钟），背景色 `#38858a`
- **长休息**: 默认 15 分钟（可自定义 1-60 分钟），背景色 `#2f6a95`
- **专注模式背景色**: `#ba4949`（红色）
- 自动切换番茄钟和休息模式
- 记录完成的番茄钟数量
- **关联具体任务**: 可从任务选择器中选择要专注的任务，追踪每个任务的番茄钟数量
- **任务选择提示**: 可配置是否强制选择任务才能开始番茄钟
- 支持开始/暂停/重置/提前结束操作
- 提前结束时弹出确认弹窗，询问是否确认
- 番茄钟完成后弹窗询问任务是否完成
- 番茄钟/土豆钟互斥运行，冲突时弹出确认对话框

### 2. 土豆钟 (Potato Clock / 娱乐计时)

**路由**: `/potato`

**功能**:
- **娱乐时间计时器**: 用于追踪休闲/娱乐时间
- **每日娱乐时间限制**: 默认 60 分钟（可自定义 5-240 分钟）
- 倒计时结束后自动转为正计时（记录超出时间）
- 超时时发送系统通知："娱乐时间已用完"
- 再次开始超时时弹出警告确认框
- **关联娱乐项目**: 可选择当前进行的娱乐活动
- **背景色**: `#FADFA1`（金色）
- 与番茄钟互斥运行，冲突时弹出确认对话框

### 3. 任务管理 (Task Management)

**功能**:
- **活动类型**: 分为"任务"(task)和"娱乐项目"(entertainment)两种类型
- **创建/编辑/删除活动**: 支持完整的 CRUD 操作
- **活动分解引导**: 创建任务时引导拆分子任务（支持跳过）
- **无需分解选项**: 简单任务可跳过子任务分解步骤
- **循环任务**: 支持循环任务，完成后自动重置状态和子任务
- **子任务管理**: 添加、删除、勾选完成子任务
- **进度追踪**: 实时显示子任务完成进度条
- **任务状态**: 区分"进行中"和"已完成"
- **筛选功能**: 可按全部/任务/娱乐筛选
- **番茄钟关联**: 为每个任务记录投入的番茄钟数量
- **任务详情弹窗**: 查看任务完整信息、子任务进度、番茄钟数

### 4. 统计面板 (Stats Panel)

**路由**: `/stats`

**功能**:
- **分类统计**: 总览/专注/娱乐/喝水/站立/远眺/走动 共 7 个分类
- **总览**: 显示所有关键指标概览
- **专注统计**: 完成番茄钟数、专注时间（分钟/小时）、等效番茄钟数
- **娱乐统计**: 已用时间、每日限制、剩余时间、娱乐活动数
- **喝水统计**: 今日喝水/目标、完成进度、还需喝杯数、每日目标(ml)，支持快速加减记录
- **站立/远眺/走动统计**: 今日次数、提醒间隔等信息
- **每日统计网格**: 类似 GitHub 贡献图的日历热力图
  - 支持按月/按年查看
  - 颜色强度表示番茄钟数量（6 级渐变色）
  - 悬浮提示显示当天详细数据
  - 支持日期导航（上/下月/年、回到今天）
  - 汇总显示周期内的总番茄钟、专注时间、喝水杯数、完成任务、娱乐时间

### 5. 设置面板 (Settings Panel)

**路由**: `/settings`, `/settings/activities`, `/settings/reminders`

#### 5.1 常规设置 (`/settings`)
- **启动设置**: 开机自启动开关（通过 Electron + auto-launch 实现）
- **外观**: 主题模式切换（亮色/暗色/跟随系统）
- **番茄钟设置**: 番茄钟时长、短休息时长、长休息时长
- **土豆钟设置**: 每日娱乐时间限制

#### 5.2 活动管理 (`/settings/activities`)
- 活动列表入口，可新建活动

#### 5.3 提醒设置 (`/settings/reminders`)
- **休息提醒**: 开关 + 间隔（默认 30 分钟，范围 5-120 分钟）
- **喝水提醒**: 开关 + 间隔（默认 60 分钟）+ 每日目标杯数（默认 8 杯，范围 1-20）
- **站立提醒**: 开关 + 间隔（默认 45 分钟）
- **拉伸提醒**: 开关 + 间隔（默认 30 分钟）
- **远眺提醒**: 开关 + 间隔（默认 20 分钟）
- **走动提醒**: 开关 + 间隔（默认 60 分钟）

### 6. 喝水提醒 (Hydration Prompt)

**功能**:
- 番茄钟完成或开始新番茄钟时弹出喝水提示
- 可选择"喝一杯水"（自动记录喝水数）或"不需要"
- 与通知系统联动

### 7. 任务完成弹窗 (Task Complete Modal)

**功能**:
- 番茄钟结束后询问关联任务是否已完成
- 选择"已完成"则标记任务为完成状态
- 选择"还没有"可继续下一个番茄钟

---

## 四、状态管理 (Zustand Store)

### 状态结构

| 状态字段 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `isRunning` | boolean | false | 番茄钟是否运行中 |
| `timeLeft` | number | 25*60 | 番茄钟剩余时间（秒） |
| `currentTime` | number | 25*60 | 番茄钟当前时间（秒） |
| `pomodoroType` | 'pomodoro'\|'shortBreak'\|'longBreak' | 'pomodoro' | 番茄钟类型 |
| `showTaskSelectWarning` | boolean | false | 是否显示任务选择提示 |
| `showHydrationPrompt` | boolean | false | 是否显示喝水提示 |
| `showPomodoroPotatoConflict` | 'pomodoro'\|'potato'\|null | null | 番茄钟/土豆钟冲突提示 |
| `showBreakPrompt` | 'shortBreak'\|'longBreak'\|null | null | 休息提示 |
| `autoStartEnabled` | boolean | false | 开机自启动 |
| `pomodoroTime` | number | 25 | 番茄钟时长（分钟） |
| `shortBreakTime` | number | 5 | 短休息时长（分钟） |
| `longBreakTime` | number | 15 | 长休息时长（分钟） |
| `restReminderEnabled` | boolean | true | 休息提醒开关 |
| `restReminderInterval` | number | 30 | 休息提醒间隔（分钟） |
| `waterReminderEnabled` | boolean | true | 喝水提醒开关 |
| `waterReminderInterval` | number | 60 | 喝水提醒间隔（分钟） |
| `dailyWaterGoal` | number | 8 | 每日喝水目标（杯） |
| `waterCount` | number | 0 | 今日已喝水杯数 |
| `completedPomodoros` | number | 0 | 完成的番茄钟数量 |
| `totalFocusTime` | number | 0 | 总专注时间（分钟） |
| `standReminderEnabled` | boolean | true | 站立提醒开关 |
| `standReminderInterval` | number | 45 | 站立提醒间隔（分钟） |
| `stretchReminderEnabled` | boolean | true | 拉伸提醒开关 |
| `stretchReminderInterval` | number | 30 | 拉伸提醒间隔（分钟） |
| `gazeReminderEnabled` | boolean | true | 远眺提醒开关 |
| `gazeReminderInterval` | number | 20 | 远眺提醒间隔（分钟） |
| `walkReminderEnabled` | boolean | true | 走动提醒开关 |
| `walkReminderInterval` | number | 60 | 走动提醒间隔（分钟） |
| `gazeReminderCount` | number | 0 | 今日远眺提醒次数 |
| `walkReminderCount` | number | 0 | 今日走动提醒次数 |
| `standReminderCount` | number | 0 | 今日站立提醒次数 |
| `tasks` | Task[] | [] | 任务列表 |
| `currentTaskId` | string\|null | null | 当前选中任务 ID |
| `currentEntertainmentId` | string\|null | null | 当前选中娱乐项目 ID |
| `dailyStats` | DailyStats[] | [] | 每日统计记录 |
| `potatoActivities` | PotatoActivity[] | [] | 土豆钟活动记录 |
| `potatoTimeLeft` | number | 3600 | 土豆钟剩余时间（秒） |
| `isPotatoRunning` | boolean | false | 土豆钟是否运行中 |
| `dailyPotatoLimit` | number | 60 | 每日娱乐时间限制（分钟） |

### 核心方法

- **番茄钟**: `startPomodoro`, `pausePomodoro`, `resetPomodoro`, `stopPomodoro`, `finishEarlyPomodoro`, `setPomodoroType`, `tick`
- **土豆钟**: `startPotato`, `pausePotato`, `resetPotato`, `tickPotato`, `addPotatoActivity`, `deletePotatoActivity`, `setDailyPotatoLimit`
- **任务管理**: `addTask`, `updateTask`, `deleteTask`, `setCurrentTask`, `setCurrentEntertainment`, `toggleSubtask`, `completeTask`
- **喝水**: `incrementWater`, `setShowHydrationPrompt`, `acknowledgeHydration`
- **统计**: `addDailyStats`, `getDailyStats`, `getTodayStats`
- **设置**: `updateSettings`, `setAutoStartEnabled`
- **冲突解决**: `resolvePomodoroPotatoConflict`

### 数据持久化

- **存储方式**: localStorage（通过 `src/lib/storage.ts` 封装）
- **存储 Key**: `pomodoro-settings`, `theme-mode`
- **自动保存**: 所有状态变更触发 `saveToStorage`
- **数据迁移**: 支持旧数据兼容（如任务 type 字段默认值填充）

---

## 五、自定义 Hooks

| Hook | 功能 |
|------|------|
| `usePomodoroTimer` | 番茄钟主定时器 + 所有提醒集成 |
| `usePotatoTimer` | 土豆钟定时器 |
| `useReminder` | 通用定时提醒 Hook |
| `useAutoStart` | 应用打开即启动的休息提醒 |
| `useInitAutoLaunch` | 初始化开机自启动状态的 + 设置方法 |
| `useThemeSync` | 主题同步到 DOM（class 切换 + 系统监听） |
| `useThemeStore` | 主题状态管理（light/dark/system） |

---

## 六、UI 组件

### 业务组件

| 组件 | 说明 |
|------|------|
| PomodoroClock | 番茄钟主界面 |
| PotatoClock | 土豆钟（娱乐计时） |
| SettingsPanel | 设置面板（含子路由） |
| TaskList | 任务列表 |
| TaskCreationModal | 任务创建弹窗 |
| TaskDetailModal | 任务详情弹窗 |
| SettingRow | 设置行组件 |
| StatsPanel | 统计面板 |
| StatCard | 统计卡片 |
| DailyStatsGrid | 每日统计网格（热力图） |
| HydrationPrompt | 喝水提示 |
| TaskCompleteModal | 任务完成弹窗 |
| ItemSelectorDialog | 项目选择弹窗 |
| ConfirmDialog | 确认对话框 |

### shadcn/ui 基础组件

button, card, input, textarea, checkbox, switch, dialog, popover, badge, label, progress, alert, segmented, tooltip, toast

---

## 七、Electron 集成

### 主进程

- 窗口配置: 1100x750, 最小 900x650
- macOS 标题栏样式: `hiddenInset`（隐藏默认标题栏）
- 开发环境: 加载 `http://localhost:5173`，打开 DevTools
- 生产环境: 加载 `dist/index.html`
- IPC 通道:
  - `show-notification`: 显示系统通知
  - `request-notification-permission`: 请求通知权限
  - `set-auto-launch`: 设置开机自启动
  - `get-auto-launch`: 获取开机自启动状态

### Preload 脚本

- 通过 `contextBridge` 暴露 `electronAPI` 到渲染进程
- 使用 `contextIsolation: true`, `nodeIntegration: false`（安全最佳实践）

---

## 八、路由配置

使用 **HashRouter**（适合 Electron 本地文件加载场景）:

| 路由 | 组件 | 说明 |
|------|------|------|
| `/` | `PomodoroClock` | 番茄钟主界面 |
| `/potato` | `PotatoClock` | 土豆钟（娱乐计时） |
| `/stats` | `StatsPanel` | 统计面板 |
| `/settings` | `SettingsPanel` (index) | 常规设置 |
| `/settings/activities` | `SettingsPanel` (activities) | 活动管理 |
| `/settings/reminders` | `SettingsPanel` (reminders) | 提醒设置 |

---

## 九、主题系统

- 三种模式: `light`（亮色）、`dark`（暗色）、`system`（跟随系统）
- 通过 `document.documentElement.classList` 切换 `dark`/`light` class
- 监听系统主题变化（`prefers-color-scheme`）
- 主题偏好持久化到 localStorage

---

## 十、提醒系统

### 通用提醒 Hook (`useReminder`)

- 参数: 开关状态、间隔分钟、通知标题、通知内容、附加条件
- 触发时发送系统通知 + 播放提示音（Web Audio API 生成）

### 提醒类型汇总

| 提醒类型 | 默认间隔 | 触发条件 |
|---------|---------|---------|
| 休息提醒 | 30 分钟 | 始终（未运行番茄钟时由 useAutoStart 接管） |
| 喝水提醒 | 60 分钟 | 始终 |
| 站立提醒 | 45 分钟 | 仅在番茄钟运行时 |
| 拉伸提醒 | 30 分钟 | 仅在番茄钟运行时 |
| 远眺提醒 | 20 分钟 | 仅在番茄钟运行时 |
| 走动提醒 | 60 分钟 | 仅在番茄钟运行时 |

### 通知 + 提示音

- `sendNotification`: 优先使用 Electron 通知，回退到浏览器 Notification API
- `playSound`: 使用 Web Audio API 生成提示音（完成 800Hz, 提醒 600Hz）
- `requestNotificationPermission`: 请求浏览器通知权限

---

## 十一、数据结构

### Task（任务/活动）

```typescript
interface Task {
  id: string
  title: string
  description: string
  type: 'task' | 'entertainment'  // 活动类型
  subtasks: SubTask[]
  completedPomodoros: number       // 投入的番茄钟数量
  createdAt: string
  completedAt?: string
  isCompleted: boolean
  isRecurring: boolean             // 是否循环任务
  isSimple: boolean                // 是否无需分解
}
```

### SubTask（子任务）

```typescript
interface SubTask {
  id: string
  title: string
  completed: boolean
}
```

### DailyStats（每日统计）

```typescript
interface DailyStats {
  date: string           // YYYY-MM-DD
  pomodoros: number
  focusTime: number      // 分钟
  waterCount: number
  tasksCompleted: number
  potatoTime: number     // 娱乐时间（分钟）
}
```

### PotatoActivity（土豆钟活动）

```typescript
interface PotatoActivity {
  id: string
  title: string
  duration: number  // 分钟
  createdAt: string
}
```

---

## 十二、项目目录结构

```
chrono-focus/
├── electron/
│   ├── main.ts              # Electron 主进程
│   └── preload.ts           # Electron Preload 脚本
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 基础组件
│   │   ├── ConfirmDialog.tsx     # 确认对话框
│   │   └── ItemSelectorDialog.tsx # 项目选择弹窗
│   ├── features/
│   │   ├── pomodoro/
│   │   │   ├── PomodoroClock.tsx    # 番茄钟组件
│   │   │   ├── HydrationPrompt.tsx  # 喝水提示
│   │   │   └── TaskCompleteModal.tsx # 任务完成弹窗
│   │   ├── potato/
│   │   │   └── PotatoClock.tsx      # 土豆钟组件
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx    # 设置面板（含子路由）
│   │   │   ├── SettingRow.tsx       # 设置行组件
│   │   │   ├── TaskList.tsx         # 任务列表
│   │   │   ├── TaskCreationModal.tsx # 任务创建
│   │   │   └── TaskDetailModal.tsx  # 任务详情
│   │   └── stats/
│   │       ├── StatsPanel.tsx       # 统计面板
│   │       ├── StatCard.tsx         # 统计卡片
│   │       └── DailyStatsGrid.tsx   # 每日统计网格（热力图）
│   ├── hooks/
│   │   ├── usePomodoroTimer.ts   # 番茄钟定时器
│   │   ├── usePotatoTimer.ts     # 土豆钟定时器
│   │   ├── useReminder.ts        # 通用提醒 Hook
│   │   ├── useAutoStart.ts       # 自动启动休息提醒
│   │   ├── useInitAutoLaunch.ts  # 开机自启动初始化
│   │   ├── useThemeSync.ts       # 主题同步
│   │   └── useThemeStore.ts      # 主题状态管理
│   ├── lib/
│   │   ├── utils.ts              # 工具函数（通知、提示音、cn）
│   │   └── storage.ts            # localStorage 封装
│   ├── store/
│   │   └── store.ts              # Zustand 全局状态
│   ├── types/
│   │   └── electron.d.ts         # Electron API 类型声明
│   ├── App.tsx                   # 主应用组件（路由 + 导航）
│   ├── main.tsx                  # React 入口
│   └── index.css                 # 全局样式（Tailwind + CSS 变量主题）
├── components.json               # shadcn/ui 配置
├── tailwind.config.js            # TailwindCSS 配置
├── vite.config.ts                # Vite 配置（含 @ 别名）
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # TypeScript Node 配置
├── postcss.config.js             # PostCSS 配置
├── package.json                  # 依赖配置
├── pnpm-lock.yaml                # pnpm 锁文件
├── index.html                    # HTML 入口
├── .gitignore                    # Git 忽略配置
└── README.md                     # 项目说明
```

---

## 十三、特殊功能与亮点

1. **番茄钟/土豆钟互斥机制**: 两种计时器不能同时运行，切换时弹出确认对话框，防止误操作
2. **土豆钟超时正计时**: 娱乐时间用完后不强制停止，改为正计时记录超出时间，同时发送通知提醒
3. **循环任务**: 完成任务后自动重置（清空子任务、番茄钟计数），适合日常重复任务
4. **任务分解引导**: 创建任务时引导拆分子任务，但支持"无需分解"快速创建
5. **多类型健康提醒**: 休息、喝水、站立、拉伸、远眺、走动共 6 种提醒，均可独立开关和配置间隔
6. **类 GitHub 热力图**: 统计面板使用贡献图样式展示每日专注数据，支持按月/按年查看
7. **主题系统**: 支持亮色/暗色/跟随系统三种模式，切换时平滑过渡（`transition-colors duration-500`）
8. **动态背景色**: 根据番茄钟类型（专注/短休息/长休息）或页面（土豆钟）自动切换背景色
9. **开机自启动**: 通过 Electron + auto-launch 实现，同时支持 macOS 系统级配置提示
10. **localStorage 持久化**: 所有设置、任务、统计数据自动保存，重启不丢失

---

*报告生成时间: 2026年4月6日*
