# FullScreenOverlay - 简化版 Electron 全屏遮罩系统

## 概述

这是一个简化的 Electron 全屏遮罩系统，仅保留核心功能，不包含浏览器降级逻辑。

## 架构

### Electron 主进程

```
electron/
├── overlay-simple.mjs              # OverlayManager 类，管理全屏窗口
├── overlay-content-simple.mjs      # HTML 内容生成（休息提醒 + 答题）
└── overlay-simple-preload.cjs      # 预加载脚本，暴露 overlayAPI
```

### React 渲染进程

```
src/
├── components/
│   └── FullScreenOverlay.tsx       # React 控制器组件（不渲染 UI）
├── hooks/
│   └── useFullScreenOverlay.ts     # React Hook，提供统一接口
└── types/
    └── electron.d.ts               # TypeScript 类型定义
```

## 对外接口

### useFullScreenOverlay Hook

```typescript
import { useFullScreenOverlay } from '@/hooks/useFullScreenOverlay'

const { showRest, showQuiz, close, onAction } = useFullScreenOverlay()

// 显示休息提醒
await showRest({
  title: '休息提醒',
  duration: 60, // 秒
})

// 显示答题
await showQuiz({
  num1: 12,
  num2: 34,
})

// 关闭遮罩
await close()

// 监听用户操作
const cleanup = onAction((action) => {
  switch (action) {
    case 'skip':
      // 用户跳过
      break
    case 'closed':
      // 倒计时结束自动关闭
      break
    case 'quizCorrect':
      // 答题正确
      break
  }
})

// 清理事件监听
cleanup()
```

## IPC 通信

### 主进程注册的事件

| 事件 | 功能 |
|------|------|
| `simple-overlay:show-rest` | 显示休息提醒遮罩 |
| `simple-overlay:show-quiz` | 显示答题遮罩 |
| `simple-overlay:close` | 关闭遮罩 |
| `simple-overlay:action` | 转发用户操作到渲染进程 |

### 遮罩窗口触发的动作

| 动作 | 触发时机 |
|------|---------|
| `skip` | 用户点击"跳过"按钮 |
| `closed` | 倒计时结束自动关闭 |
| `quizCorrect` | 答题正确 |

## 使用示例

### 在组件中使用

```tsx
import FullScreenOverlay from '@/components/FullScreenOverlay'

// 在 App.tsx 中挂载
function App() {
  return (
    <>
      {/* 其他组件 */}
      <FullScreenOverlay />
    </>
  )
}
```

### 触发遮罩

```tsx
import { useRuntimeStore } from '@/store/runtimeStore'

// 设置状态标志触发遮罩
const setShowRestReminderPrompt = useRuntimeStore.use.setShowRestReminderPrompt()
setShowRestReminderPrompt(true)
```

## 与原系统的区别

| 特性 | 原系统 | FullScreenOverlay |
|------|--------|-------------------|
| 浏览器降级 | ✅ | ❌ |
| 进度条 | ✅ | ❌ |
| 深色模式适配 | ✅ | ❌ |
| 动画效果 | ✅ | ❌ |
| 代码行数 | ~800 | ~300 |
| 文件数量 | 7 | 6 |

## 安全特性

- ✅ CSP 策略限制外部资源
- ✅ HTML 转义防止 XSS
- ✅ 沙箱隔离
- ✅ Context Isolation

## 窗口配置

- 全屏透明窗口
- 始终置顶（screen-saver 级别）
- 无边框无阴影
- 跳过任务栏
- 所有工作空间可见
