// Electron main process
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { app, BrowserWindow, Notification, ipcMain } = require('electron')
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import AutoLaunch from 'auto-launch'
import { createOverlayManager } from './overlay.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow = null
let overlayManager = null

// 配置开机自启动
const autoLauncher = new AutoLaunch({
  name: 'Chrono Focus',
  path: app.getPath('exe'),
  isHidden: false,
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    title: 'Chrono Focus',
    backgroundColor: '#f5f5f7',
  })

  // 开发环境加载 Vite 开发服务器
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('Loading app in development mode')

  mainWindow.loadURL('http://localhost:5173')
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
    overlayManager = null
  })

  // 初始化遮罩管理器
  overlayManager = createOverlayManager(mainWindow)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC: 显示系统通知
ipcMain.handle('show-notification', async (_event, { title, body }) => {
  try {
    const iconPath = path.join(__dirname, '../build/icon.png')
    const notification = new Notification({
      title,
      body,
      ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    })
    notification.show()
    return true
  } catch (error) {
    console.error('Failed to show notification:', error)
    return false
  }
})

// IPC: 请求通知权限
ipcMain.handle('request-notification-permission', async () => {
  return true
})

// IPC: 设置开机自启动
ipcMain.handle('set-auto-launch', async (_event, enabled) => {
  try {
    if (enabled) {
      await autoLauncher.enable()
    } else {
      await autoLauncher.disable()
    }
    const isEnabled = await autoLauncher.isEnabled()
    return { success: true, enabled: isEnabled }
  } catch (error) {
    console.error('Failed to set auto-launch:', error)
    return { success: false, error: String(error) }
  }
})

// IPC: 获取开机自启动状态
ipcMain.handle('get-auto-launch', async () => {
  try {
    const isEnabled = await autoLauncher.isEnabled()
    return { success: true, enabled: isEnabled }
  } catch (error) {
    console.error('Failed to get auto-launch status:', error)
    return { success: false, enabled: false, error: String(error) }
  }
})

// IPC: 显示全屏遮罩
ipcMain.handle('show-fullscreen-overlay', async () => {
  if (!overlayManager) return false

  return overlayManager.show({
    content: `
      <div class="content">
        <div class="icon">⬛</div>
        <h1>Electron 全屏遮罩</h1>
        <p>这是通过 Electron BrowserWindow 创建的全屏遮罩层</p>
        <button class="btn" id="closeBtn">关闭遮罩</button>
      </div>
      <script>
        const closeBtn = document.getElementById('closeBtn')
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (typeof window.closeOverlay === 'function') {
            window.closeOverlay()
          }
        })
      </script>
    `,
  })
})

// IPC: 关闭全屏遮罩
ipcMain.handle('close-fullscreen-overlay', async () => {
  if (!overlayManager) return false
  return overlayManager.close()
})
