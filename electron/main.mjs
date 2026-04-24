import { app, BrowserWindow, Notification, ipcMain, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import AutoLaunch from "auto-launch";
import { initTray } from "./tray.mjs";
import { createFullScreenOverlayManager } from "./fullscreen-overlay.mjs";
import { createFullScreenHTML } from "./fullscreen-overlay-content.mjs";
import { createTimer, stopTimer, stopAllTimers, handleAppWakeUp } from "./timer.mjs";

// ========== 常量 ==========
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VITE_DEV_PORT = Number(process.env.VITE_PORT) || 5173;
const ICON_PATH = path.join(__dirname, "../build/icon.png");

// ========== 状态 ==========
let mainWindow = null;
let fullscreenOverlayManager = null;
let isQuitting = false;

// ========== 开机自启 ==========
const autoLauncher = new AutoLaunch({
  name: "Chrono Focus",
  path: app.getPath("exe"),
  isHidden: false,
});

// ========== 应用初始化 ==========
app.setName("Chrono Focus");

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock?.setMenu(
      Menu.buildFromTemplate([{ label: "Chrono Focus" }])
    );
  }

  createWindow();

  app.on("activate", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
});

// 监听应用唤醒事件
app.on("wake-event", () => {
  handleAppWakeUp(mainWindow);
});

// macOS 特定的激活事件
app.on("activate", () => {
  handleAppWakeUp(mainWindow);
});

// ========== 窗口管理 ==========
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true, // 启用沙箱隔离
    },
    titleBarStyle: "hiddenInset",
    title: "Chrono Focus",
    backgroundColor: "#f5f5f7",
  });

  // 开发环境加载 Vite 服务器，生产环境加载构建产物
  if (process.env.NODE_ENV === "development" || process.env.HOT) {
    mainWindow.loadURL(`http://localhost:${VITE_DEV_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // 设置 Content-Security-Policy
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: file:; connect-src 'self' http://localhost:*; font-src 'self'; frame-src 'none'; object-src 'none'"
      document.head.appendChild(meta)
    `).catch(() => {})
  })

  mainWindow.on("closed", () => {
    mainWindow = null;
    fullscreenOverlayManager?.close();
    fullscreenOverlayManager = null;
  });

  // 点击关闭按钮时隐藏到系统托盘，而非退出应用
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // 初始化子模块（托盘 + 遮罩），同步 mainWindow 引用
  fullscreenOverlayManager = createFullScreenOverlayManager(mainWindow);
  initTray(mainWindow);
  registerIpcHandlers();
}

/** 当主窗口被重建时更新引用 */
function updateMainWindowReference(window) {
  mainWindow = window;
  fullscreenOverlayManager?.setMainWindow(window);
}

// ========== IPC Handlers ==========
function registerIpcHandlers() {
  // 系统通知
  ipcMain.handle("show-notification", async (_event, { title, body }) => {
    try {
      const notification = new Notification({
        title,
        body,
        ...(fs.existsSync(ICON_PATH) ? { icon: ICON_PATH } : {}),
      });
      notification.show();
      return true;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return false;
    }
  });

  // 通知权限检查（macOS 需要真实查询，其他平台默认允许）
  ipcMain.handle("request-notification-permission", async () => {
    if (process.platform === "darwin") {
      return Notification.isSupported();
    }
    return true;
  });

  // 开机自启设置
  ipcMain.handle("set-auto-launch", async (_event, enabled) => {
    try {
      await (enabled ? autoLauncher.enable() : autoLauncher.disable());
      const isEnabled = await autoLauncher.isEnabled();
      return { success: true, enabled: isEnabled };
    } catch (error) {
      console.error("Failed to set auto-launch:", error);
      return { success: false, error: String(error) };
    }
  });

  // 获取开机自启状态
  ipcMain.handle("get-auto-launch", async () => {
    try {
      const isEnabled = await autoLauncher.isEnabled();
      return { success: true, enabled: isEnabled };
    } catch (error) {
      console.error("Failed to get auto-launch status:", error);
      return { success: false, enabled: false, error: String(error) };
    }
  });

  // ========== FullScreenOverlay IPC Handlers ==========

  // 显示 FullScreenOverlay 遮罩
  ipcMain.handle("fullscreen-overlay:show", async (_event, config) => {
    if (!fullscreenOverlayManager) return false;
    return fullscreenOverlayManager.show(createFullScreenHTML(config));
  });

  // 关闭 FullScreenOverlay 遮罩
  ipcMain.handle("fullscreen-overlay:close", async () => {
    if (!fullscreenOverlayManager) return false;
    return fullscreenOverlayManager.close();
  });

  // FullScreenOverlay 遮罩动作转发
  ipcMain.handle("fullscreen-overlay:action", async (_event, { action }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("fullscreen-overlay:action", action);
    }
    if (action === "closed") {
      fullscreenOverlayManager?.close();
    }
    return true;
  });

  // ========== Electron 定时器 IPC Handlers ==========

  // 创建定时器
  ipcMain.handle("electron-timer:create", async (_event, { id, delay }) => {
    console.log('[Electron IPC] Received create timer request', { id, delay });
    const result = createTimer(id, delay, mainWindow);
    console.log('[Electron IPC] Sending create timer response', { id, result });
    return result;
  });

  // 停止定时器
  ipcMain.handle("electron-timer:stop", async (_event, id) => {
    console.log('[Electron IPC] Received stop timer request', { id });
    const result = stopTimer(id);
    console.log('[Electron IPC] Sending stop timer response', { id, result });
    return result;
  });

  // 停止所有定时器
  ipcMain.handle("electron-timer:stopAll", async () => {
    console.log('[Electron IPC] Received stop all timers request');
    stopAllTimers();
    console.log('[Electron IPC] All timers stopped');
    return true;
  });
}

// 清理所有定时器
app.on("will-quit", () => {
  stopAllTimers();
});

// ========== 导出 ==========
export { updateMainWindowReference };
