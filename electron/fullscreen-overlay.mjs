import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** CSP：仅允许内联脚本和样式 */
const CSP_HEADER = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data:",
  "font-src 'none'",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
].join('; ')

/**
 * FullScreenOverlayManager
 * 通用全屏遮罩管理器，内容由调用者传递
 */
export class FullScreenOverlayManager {
  window = null
  mainWindow = null

  constructor(mainWindow) {
    this.mainWindow = mainWindow
  }

  /** 显示遮罩窗口 */
  show(content) {
    // 如果窗口已存在，直接聚焦
    if (this.window) {
      this.window.focus()
      return true
    }

    const screenBounds = screen.getPrimaryDisplay().bounds

    this.window = new BrowserWindow({
      x: screenBounds.x,
      y: screenBounds.y,
      width: screenBounds.width,
      height: screenBounds.height,
      transparent: true,
      frame: false,
      hasShadow: false,
      alwaysOnTop: true,
      fullscreenable: false,
      resizable: false,
      skipTaskbar: true,
      focusable: true,
      simpleFullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'fullscreen-overlay-preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    // 始终置顶
    this.window.setAlwaysOnTop(true, 'screen-saver')
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    // 加载 HTML 内容
    const html = this._buildHTML(content)
    this.window.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    // 设置 CSP
    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.executeJavaScript(`
        const meta = document.createElement('meta')
        meta.httpEquiv = 'Content-Security-Policy'
        meta.content = "${CSP_HEADER}"
        document.head.appendChild(meta)
      `)
    })

    // 关闭前清理定时器
    this.window.on('close', () => {
      if (this.window) {
        this.window.webContents.executeJavaScript(`
          (window.__intervals || []).forEach(id => clearInterval(id))
        `).catch(() => {})
      }
    })

    // 显示窗口
    this.window.show()

    // 监听窗口关闭事件
    this.window.on('closed', () => {
      this.window = null
      // 通知主窗口
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('fullscreen-overlay:closed')
      }
    })

    return true
  }

  /** 关闭遮罩 */
  close() {
    if (this.window) {
      this.window.close()
      this.window = null
      return true
    }
    return false
  }

  /** 更新主窗口引用 */
  setMainWindow(window) {
    this.mainWindow = window
  }

  /** 构建 HTML 文档 */
  _buildHTML(content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%; height: 100%;
            overflow: hidden;
            background: transparent;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `
  }
}

/** 创建全屏遮罩管理器 */
export function createFullScreenOverlayManager(mainWindow) {
  return new FullScreenOverlayManager(mainWindow)
}
