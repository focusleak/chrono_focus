import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Content-Security-Policy：仅允许内联样式和脚本，禁止外部资源 */
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

let instance = null

export class OverlayManager {
  overlayWindow = null
  mainWindow = null
  onClosedCallback = null

  constructor(mainWindow) {
    this.mainWindow = mainWindow
  }

  show(config) {
    if (this.overlayWindow) {
      this.overlayWindow.focus()
      return true
    }

    const screenBounds = screen.getPrimaryDisplay().bounds

    this.overlayWindow = new BrowserWindow({
      x: screenBounds.x,
      y: screenBounds.y,
      width: screenBounds.width,
      height: screenBounds.height,
      transparent: true,
      frame: false,
      hasShadow: false,
      alwaysOnTop: true,
      fullscreenable: true,
      resizable: false,
      skipTaskbar: true,
      focusable: true,
      simpleFullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'overlay-preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver')
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    if (config.clickThrough) {
      this.overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    }

    const html = this.buildHTML(config)
    this.overlayWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    // 设置 CSP 头，限制外部资源加载
    this.overlayWindow.webContents.on('did-finish-load', () => {
      this.overlayWindow.webContents.executeJavaScript(`
        const meta = document.createElement('meta')
        meta.httpEquiv = 'Content-Security-Policy'
        meta.content = "${CSP_HEADER}"
        document.head.appendChild(meta)
      `)
    })

    // 窗口关闭前清理定时器，防止泄漏
    this.overlayWindow.on('close', () => {
      if (this.overlayWindow) {
        this.overlayWindow.webContents.executeJavaScript(`
          const intervals = window.__intervals || []
          intervals.forEach(id => clearInterval(id))
        `).catch(() => {})
      }
    })

    this.overlayWindow.show()

    this.onClosedCallback = config.onClosed

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null
      if (this.onClosedCallback) this.onClosedCallback()
      if (this.mainWindow) this.mainWindow.webContents.send('overlay-closed')
    })

    return true
  }

  updateContent(content) {
    if (this.overlayWindow) {
      const html = this.buildHTML({ content })
      this.overlayWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    }
  }

  setMainWindow(window) {
    this.mainWindow = window
  }

  close() {
    if (this.overlayWindow) {
      this.overlayWindow.close()
      this.overlayWindow = null
      return true
    }
    return false
  }

  getWindow() {
    return this.overlayWindow
  }

  buildHTML(config) {
    const bgColor = config.backgroundColor || 'rgba(0,0,0,0.6)'
    const hasOwnStyles = config.content.includes('<style>')

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
            background: ${bgColor};
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
          }
          ${hasOwnStyles ? '' : 'body { display: flex; align-items: center; justify-content: center; }'}
        </style>
      </head>
      <body>
        ${config.content}
      </body>
      </html>
    `
  }
}

export function createOverlayManager(mainWindow) {
  if (!instance) {
    instance = new OverlayManager(mainWindow)
  }
  return instance
}

export function getOverlayManager() {
  return instance
}
