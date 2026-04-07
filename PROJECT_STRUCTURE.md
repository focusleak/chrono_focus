# Chrono Focus 项目结构

## 📁 目录结构

```
chrono-focus/
├── src/
│   ├── App.tsx                          # 主应用组件(路由+布局)
│   ├── main.tsx                         # React 入口
│   ├── index.css                        # 全局样式(Tailwind+主题)
│   │
│   ├── components/                      # 🧩 组件目录
│   │   ├── common/                      #    └─ 通用组件(无业务逻辑,可复用)
│   │   │   ├── NumberInput.tsx          #        - 数字输入(带秒数格式化)
│   │   │   ├── ReminderSettings.tsx     #        - 提醒设置(组合组件)
│   │   │   └── index.ts
│   │   ├── ui/                          #    └─ shadcn/ui 基础组件(13个)
│   │   ├── NavItem.tsx                  #    - 导航项
│   │   ├── StatusBar.tsx                #    - 底部状态栏
│   │   ├── ConfirmDialog.tsx            #    - 确认对话框
│   │   ├── ItemSelector.tsx             #    - 项目选择器
│   │   ├── ItemSelectorDialog.tsx       #    - 选择弹窗
│   │   ├── SortableList.tsx             #    - 可拖拽列表
│   │   ├── SettingRow.tsx               #    - 设置行
│   │   ├── RestReminderOverlay.tsx      #    - 休息提醒遮罩
│   │   └── BrowserOverlay.tsx           #    - 浏览器降级遮罩
│   │
│   ├── features/                        # 🎯 业务功能模块
│   │   ├── pomodoro/                    #    - 番茄钟
│   │   │   ├── PomodoroClock.tsx
│   │   │   ├── PomodoroControls.tsx
│   │   │   └── TaskSelector.tsx
│   │   ├── potato/                      #    - 土豆钟
│   │   │   ├── PotatoClock.tsx
│   │   │   ├── PotatoControls.tsx
│   │   │   └── EntertainmentSelector.tsx
│   │   ├── activities/                  #    - 活动管理
│   │   │   ├── ActivitiesPage.tsx       # ✨ 已重构
│   │   │   ├── TaskCard.tsx             # ✨ 新增
│   │   │   ├── TaskCreationModal.tsx
│   │   │   └── TaskDetailModal.tsx
│   │   ├── settings/                    #    - 设置
│   │   │   └── SettingsPage.tsx         # ✨ 已重构
│   │   ├── stats/                       #    - 统计
│   │   │   ├── StatsPanel.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── DailyStatsGrid.tsx
│   │   ├── test/                        #    - 测试页(仅开发环境)
│   │   │   └── TestPage.tsx
│   │   └── reminders/                   #    - 提醒功能(预留)
│   │
│   ├── hooks/                           # ⚛️ 自定义 React Hooks
│   │   ├── reminder/                    #    └─ 提醒 hooks 统一导出
│   │   │   └── index.ts
│   │   ├── usePomodoroTimer.ts          #    - 番茄钟定时器
│   │   ├── usePotatoTimer.ts            #    - 土豆钟定时器
│   │   ├── useRestReminder.ts           #    - 休息提醒倒计时
│   │   ├── useReminder.ts               #    - 通用提醒
│   │   ├── useInterval.ts               #    - 基础定时器
│   │   ├── useInitAutoLaunch.ts         #    - 开机自启
│   │   ├── useThemeStore.ts             #    - 主题状态
│   │   ├── useThemeSync.ts              #    - 主题同步
│   │   ├── useTraySync.ts               #    - 托盘同步
│   │   ├── useTrayActions.ts            #    - 托盘动作
│   │   └── useOverlay.ts                #    - 全屏遮罩
│   │
│   ├── store/                           # 🗄️ 状态管理(Zustand)
│   │   ├── store.ts                     #    - 主 store
│   │   └── slices/                      #    └─ Store slices(预留)
│   │       └── pomodoroSlice.ts
│   │
│   ├── lib/                             # 📚 核心库
│   │   ├── utils.ts                     #    - 工具函数(通知/音效/cn)
│   │   └── storage.ts                   #    - localStorage 封装
│   │
│   ├── utils/                           # 🛠️ 通用工具函数(纯函数)
│   │   ├── time.ts                      #    - 时间格式化
│   │   └── index.ts
│   │
│   └── types/                           # 📝 TypeScript 类型
│       ├── index.ts                     #    - 业务类型定义
│       └── electron.d.ts                #    - Electron API 类型
│
└── electron/                            # ⚡ Electron 主进程
    ├── main.mjs
    ├── preload.mjs
    └── assets/
```

## 🎯 设计原则

### 1. 关注点分离
- **components/common/**: 纯 UI,无业务逻辑,可在任何项目复用
- **features/**: 包含业务逻辑的页面和组件
- **utils/**: 纯函数,无副作用
- **lib/**: 有副作用的核心功能(通知、存储等)

### 2. 按功能域组织
```
features/
├── pomodoro/        # 番茄钟相关
├── potato/          # 土豆钟相关
├── activities/      # 活动管理相关
├── settings/        # 设置相关
├── stats/           # 统计相关
└── reminders/       # 提醒相关(预留)
```

### 3. 组件分层
```
通用组件 (components/common/)
    ↓
业务组件 (components/)
    ↓
功能页面 (features/*/
    ↓
路由页面 (App.tsx)
```

## 📊 重构成果

| 文件 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| SettingsPage.tsx | ~430 行 | ~265 行 | 38% ↓ |
| ActivitiesPage.tsx | 273 行 | 165 行 | 40% ↓ |
| lib/utils.ts | 含重复函数 | 移除重复 | 清晰 |

### 新增组件
- ✅ NumberInput.tsx (73 行) - 从 SettingsPage 抽取
- ✅ ReminderSettings.tsx (84 行) - 统一提醒设置
- ✅ TaskCard.tsx (87 行) - 从 ActivitiesPage 抽取
- ✅ utils/time.ts (45 行) - 时间格式化工具

### 代码质量
- ✅ TypeScript: 0 错误
- ✅ 构建成功: 5.22s
- ✅ 产物大小: 473.65 kB (gzip 148.45 kB)
- ✅ 无空文件夹
- ✅ 无未使用的导入

## 🚀 开发指南

### 添加新功能
1. **新功能页面**: 在 `features/` 下创建新目录
2. **通用 UI 组件**: 放到 `components/common/`
3. **业务组件**: 放到对应 `features/*/`
4. **工具函数**: 纯函数放 `utils/`,有副作用放 `lib/`

### 引用规范
```typescript
// 通用组件 - 使用 @ 别名
import { NumberInput } from '@/components/common'

// 业务组件 - 使用相对路径
import TaskCard from './TaskCard'

// 工具函数
import { formatDuration } from '@/utils'
import { sendNotification } from '@/lib/utils'

// Hooks
import { useReminder } from '@/hooks/reminder'
```
