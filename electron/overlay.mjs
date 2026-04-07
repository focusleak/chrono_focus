// Electron 全屏遮罩管理模块
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { BrowserWindow, screen } = require('electron')
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 遮罩窗口配置
 * @typedef {Object} OverlayConfig
 * @property {string} [backgroundColor] - 背景颜色（默认 rgba(0,0,0,0.6)）
 * @property {string} content - HTML 内容
 * @property {boolean} [clickThrough] - 是否可点击穿透背景
 * @property {Function} [onClosed] - 窗口关闭回调
 */

/**
 * 全屏遮罩管理器
 */
export class OverlayManager {
  /** @type {BrowserWindow | null} */
  overlayWindow = null
  /** @type {BrowserWindow} */
  mainWindow

  /**
   * @param {BrowserWindow} mainWindow 
   */
  constructor(mainWindow) {
    this.mainWindow = mainWindow
  }

  /**
   * 显示全屏遮罩
   * @param {OverlayConfig} config
   * @returns {boolean}
   */
  show(config) {
    if (this.overlayWindow) {
      this.overlayWindow.focus()
      return true
    }

    const primaryDisplay = screen.getPrimaryDisplay()
    const screenBounds = primaryDisplay.bounds

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
        preload: path.join(__dirname, 'overlay-preload.mjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    })

    // macOS 下设置窗口层级
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver')
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    if (config.clickThrough) {
      this.overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    }

    const html = this.buildHTML(config)
    this.overlayWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    this.overlayWindow.show()

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null
      if (config.onClosed) config.onClosed()
      if (this.mainWindow) this.mainWindow.webContents.send('overlay-closed')
    })

    return true
  }

  /**
   * 更新遮罩内容
   * @param {string} content - HTML 内容
   */
  updateContent(content) {
    if (this.overlayWindow) {
      const html = this.buildHTML({ content })
      this.overlayWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    }
  }

  /**
   * 关闭全屏遮罩
   * @returns {boolean}
   */
  close() {
    if (this.overlayWindow) {
      this.overlayWindow.close()
      this.overlayWindow = null
      return true
    }
    return false
  }

  /**
   * 获取遮罩窗口实例
   * @returns {BrowserWindow | null}
   */
  getWindow() {
    return this.overlayWindow
  }

  /**
   * 构建 HTML 内容
   * @param {OverlayConfig} config
   * @returns {string}
   */
  buildHTML(config) {
    const bgColor = config.backgroundColor || 'rgba(0,0,0,0.6)'

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
          ${config.content.includes('<style>') ? '' : `
          body {
            display: flex; align-items: center; justify-content: center;
          }
          `}
        </style>
      </head>
      <body>
        ${config.content}
      </body>
      </html>
    `
  }
}

/** @type {OverlayManager | null} */
let instance = null

/**
 * 创建遮罩管理器实例（单例）
 * @param {BrowserWindow} mainWindow
 * @returns {OverlayManager}
 */
export function createOverlayManager(mainWindow) {
  if (!instance) {
    instance = new OverlayManager(mainWindow)
  }
  return instance
}

/**
 * @returns {OverlayManager | null}
 */
export function getOverlayManager() {
  return instance
}
