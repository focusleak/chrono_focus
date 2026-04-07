import { app, BrowserWindow, Notification, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import AutoLaunch from 'auto-launch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

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
      preload: path.join(__dirname, 'preload.ts'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    title: 'Chrono Focus',
    backgroundColor: '#f5f5f7',
  })

  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../build/icon.png'),
  })

  notification.show()
  return true
})

// IPC: 请求通知权限（macOS）
ipcMain.handle('request-notification-permission', async () => {
  return true
})

// IPC: 设置开机自启动
ipcMain.handle('set-auto-launch', async (_event, enabled: boolean) => {
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
