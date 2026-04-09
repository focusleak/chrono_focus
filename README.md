# Chrono Focus

一个跨平台的休息提醒 + 番茄钟 + 健康小提醒桌面应用，基于 Electron + React 构建。

## 功能特性

### 休息提醒系统

- 打开后自动运行休息提醒系统
- 启用番茄钟或土豆钟后停止计时
- 工作指定时间后弹出全屏遮罩提醒休息
- 遮罩包含倒计时和进度条
- 支持跳过操作
- 支持跳过计数追踪
- 跳过后1分钟再次提醒

### 番茄钟

- 可配置工作时长（默认 25 分钟）、短休息（5 分钟）、长休息（15 分钟）
- 每完成 4 个番茄自动切换为长休息
- 支持关联任务，自动记录完成番茄数量
- 番茄/休息结束时发送系统通知
- 与土豆钟互斥，切换时弹出确认对话框

### 土豆钟

- 娱乐时间倒计时（默认 60 分钟），用完发送提醒，若未手动点击结束，继续正计时（红色显示）
- 可记录娱乐活动类型和时长
- 与番茄钟互斥，切换时弹出确认对话框

### 黑莓钟

- 预留功能模块（当前为占位页面）

### 活动管理

- 创建任务或娱乐活动，支持子任务
- 拖拽排序
- 支持循环任务（完成后自动重置子任务）
- 支持按类别筛选（全部/任务/娱乐）

### 多维提醒

- 喝水提醒与杯数追踪，支持进度显示和手动记录
- 站立提醒、拉伸提醒、远眺提醒、走动提醒
- 每种提醒独立开关和间隔配置

### 统计面板

- 多维度数据查看：总览、专注、娱乐、喝水、站立、远眺、走动
- 每日统计网格视图
- 手动记录喝水数据

### 系统托盘

- 动态显示当前状态文字（如"番茄钟-已专注15分钟"）
- 右键菜单根据当前状态动态生成操作项：暂停/继续/放弃/启动番茄钟/显示窗口/退出
- 托盘动作通过 IPC 转发到渲染进程

### 其他功能

- 窗口拖动
- 开机自启动开关
- 主题切换（浅色/深色/跟随系统）
- 所有时长和间隔可在设置中自定义

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron 41.x |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 路由 | React Router DOM v7 (HashRouter) |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS 3 + CSS Variables |
| UI 组件 | shadcn/ui (基于 Radix UI Primitives) |
| 图标 | Lucide React |
| 拖拽 | @dnd-kit (core + sortable) |
| 日期处理 | date-fns |
| 打包 | @electron-forge (DMG + ZIP) |
| 开机自启 | auto-launch |

## 项目结构

```
chrono-focus/
├── electron/                    # Electron 主进程代码
│   ├── main.mjs               # 主进程入口，创建主窗口、注册 IPC 处理
│   ├── preload.cjs            # 预加载脚本，暴露 electronAPI 到渲染进程
│   ├── tray.mjs               # 系统托盘管理（菜单、文字、状态同步）
│   ├── overlay.mjs            # 全屏遮罩窗口管理器（OverlayManager 类）
│   ├── overlay-preload.cjs    # 遮罩窗口预加载脚本，暴露 overlayAPI
│   ├── overlay-content.mjs    # 遮罩 HTML 内容生成（休息提醒、乘法答题）
│   └── assets/tray-icon.png   # 托盘图标
├── src/                        # React 前端代码
│   ├── main.tsx               # React 入口
│   ├── App.tsx                # 根组件，路由 + 全局 hooks + 布局
│   ├── index.css              # Tailwind CSS + shadcn/ui 主题变量
│   ├── router/                # 路由配置
│   │   ├── index.ts           # 统一导出
│   │   ├── routes.ts          # 路由路径定义
│   │   ├── navigation.ts      # 导航配置（主/次导航栏）
│   │   ├── matchers.ts        # 路由匹配器（activeTab 映射）
│   │   └── AppRoutes.tsx      # 路由组件渲染
│   ├── features/              # 功能模块（按业务划分）
│   │   ├── pomodoro/          # 番茄钟（计时器、控制、任务选择）
│   │   ├── potato/            # 土豆钟（娱乐计时器、娱乐项目选择）
│   │   ├── blueberry/         # 黑莓钟（预留功能，占位页面）
│   │   ├── activities/        # 活动管理（任务 CRUD、拖拽排序、筛选）
│   │   ├── settings/          # 设置页面（所有配置项）
│   │   └── stats/             # 统计面板（多维度数据统计）
│   ├── components/
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   ├── common/            # 通用业务组件（导航、对话框、排序列表等）
│   │   ├── StatusBar.tsx      # 底部状态栏
│   │   ├── RestReminderOverlay.tsx    # 休息提醒遮罩（Electron 模式）
│   │   ├── BrowserOverlay.tsx # 浏览器降级遮罩（纯 React 实现）
│   │   └── ErrorBoundary.tsx  # 错误边界
│   ├── store/
│   │   ├── settingsStore.ts   # 设置状态（持久化，包含主题）
│   │   ├── runtimeStore.ts    # 运行时状态（计时、任务、统计，使用 immer）
│   │   └── createSelectors.ts # Zustand selectors 自动生成工具
│   ├── hooks/
│   │   ├── usePomodoroTimer.ts    # 番茄钟计时逻辑
│   │   ├── usePotatoTimer.ts      # 土豆钟计时逻辑
│   │   ├── useRestReminder.ts     # 休息提醒倒计时
│   │   ├── useThemeSync.ts        # 主题同步
│   │   ├── useTrayActions.ts      # 托盘动作监听
│   │   ├── useTraySync.ts         # 托盘状态同步
│   │   └── common/
│   │       ├── useInterval.ts         # 通用定时器 Hook
│   │       ├── useInitAutoLaunch.ts   # 开机自启动初始化
│   │       ├── useReminder.ts         # 通用提醒 Hook
│   │       └── useOverlay.ts          # 遮罩管理 Hook（Electron/浏览器双模式）
│   ├── types/
│   │   ├── index.ts             # 核心类型定义
│   │   └── electron.d.ts        # Electron API 类型声明
│   ├── utils/
│   │   ├── index.ts             # 统一导出
│   │   ├── time.ts              # 时间格式化
│   │   ├── notification.ts      # 通知工具
│   │   └── stats.ts             # 统计工具
│   └── lib/
│       └── utils.ts             # cn() 类名合并 + 工具函数重新导出
├── electron.ts                # Electron 开发启动脚本
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── components.json            # shadcn/ui 配置
└── index.html
```

## 架构设计

### 双进程架构

- **主进程 (Electron)**: 管理窗口、系统托盘、原生通知、全屏遮罩、IPC 通信
- **渲染进程 (React)**: 所有 UI 渲染、计时逻辑、状态管理

### 遮罩双模式

- **Electron 模式**: 使用独立 BrowserWindow 创建全屏遮罩（透明、无边框、置顶）
- **浏览器模式**: 降级为 React 组件渲染
- 由 `useOverlay` Hook 统一协调，对外暴露一致的调用接口

### 统一 Store

`useSettingsStore` 和 `useRuntimeStore` 分别管理设置和运行时状态,均通过 `createSelectors` 工具生成便捷的 hooks selectors。

### 数据持久化

所有数据通过 Zustand 的 `persist` 中间件自动持久化到 `localStorage`，无需手动调用保存方法。

**三个独立持久化 Store：**

| Store | 存储 Key | 持久化范围 |
|-------|----------|------------|
| `useSettingsStore` | `chrono-focus-settings` | 全部设置项（时长、间隔、开关等）,包含主题 `theme` |
| `useRuntimeStore` | `chrono-focus-runtime` | 通过 `partialize` 配置选择性保存:任务列表、统计数据、番茄/土豆计数、提醒计数等。运行时状态(计时器运行与否、剩余时间等)不持久化 |

**数据迁移：** `runtimeStore` 配置了 `migrate` 函数，在加载旧数据时自动为任务添加 `type: 'task'` 字段，确保向后兼容。

### 计时器架构

每个计时器（番茄钟、土豆钟、休息提醒、各类提醒）独立 tick，通过 `useInterval` Hook 驱动。休息提醒弹窗显示时暂停所有计时，关闭后恢复。

### 路由配置

使用 React Router DOM v7 的 HashRouter 模式，路由定义集中在 `src/router/` 目录:

| 路由 | 路径 | 说明 |
|------|------|------|
| `POMODORO` | `/` | 番茄钟（首页） |
| `POTATO` | `/potato` | 土豆钟 |
| `BLUEBERRY` | `/blueberry` | 黑莓钟（占位） |
| `ACTIVITIES` | `/activities` | 活动管理 |
| `STATS` | `/stats` | 统计面板 |
| `SETTINGS` | `/settings` | 设置 |
| `TEST` | `/test` | 测试（仅开发环境） |

### 托盘集成

托盘文字动态显示当前状态，右键菜单根据当前状态动态生成不同操作项。托盘动作通过 IPC 通信转发到渲染进程处理。

## 安装与运行

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

并发启动 Vite 开发服务器和 Electron：

```bash
pnpm electron:dev
```

仅启动 Vite 开发服务器（浏览器模式，端口 5173）：

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 预览构建产物

```bash
pnpm preview
```

### 单独启动 Electron

```bash
pnpm electron:start
```

## 配置说明

### 路径别名

项目配置了 `@/` 路径别名，映射到 `src/` 目录，例如：

```typescript
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
```

### 主题系统

使用 CSS Variables 配合 `dark` class 切换主题，支持跟随系统 `prefers-color-scheme` 自动切换。

### 窗口样式

- macOS 使用 `hiddenInset` titleBarStyle
- 顶部 32px 设为可拖拽区域（`-webkit-app-region: drag`）
- 交互元素自动设为不可拖拽

### 音效系统

使用 Web Audio API 动态生成振荡器音效，无需外部音频文件。

## 开发规范

- 使用业内主流前端开发规范
- 所有业务逻辑按功能模块划分在 `src/features/` 下
- 可复用 UI 组件放在 `src/components/ui/` 下
- 通用业务组件放在 `src/components/common/` 下
- 自定义 Hook 统一放在 `src/hooks/` 下，通用 hooks 放在 `src/hooks/common/` 下
- TypeScript 类型定义统一放在 `src/types/` 下
- 工具函数放在 `src/utils/` 下，通过 `index.ts` 统一导出
- 路由配置集中在 `src/router/` 下

## License

MIT
