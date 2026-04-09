import { useEffect } from 'react'

import { useFullScreenOverlay } from '@/hooks/useFullScreenOverlay'

/**
 * FullScreenOverlay - 通用 Electron 全屏遮罩组件
 * 
 * 仅支持 Electron 模式，无浏览器降级
 * 所有内容都由调用者传递
 * 
 * 不渲染任何 UI，仅作为控制器
 */
const FullScreenOverlay = () => {
  const { close, onAction } = useFullScreenOverlay()

  // 监听全屏遮罩的动作事件
  useEffect(() => {
    const handleAction = (action: string) => {
      switch (action) {
        case 'closed':
          // 遮罩被外部关闭
          close()
          break
      }
    }

    // 注册事件监听
    const cleanup = onAction(handleAction)
    return cleanup
  }, [close, onAction])

  // 不渲染任何 UI
  return null
}

export default FullScreenOverlay
