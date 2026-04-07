import { createRequire } from "node:module";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import AutoLaunch from "auto-launch";
import { createOverlayManager } from "./overlay.mjs";
import { initTray } from "./tray.mjs";
import {
  createTestOverlayHTML,
  createRestReminderHTML,
  createQuizHTML,
} from "./overlay-content.mjs";

const require = createRequire(import.meta.url);
const { app, BrowserWindow, Notification, ipcMain } = require("electron");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let overlayManager = null;

const autoLauncher = new AutoLaunch({
  name: "Chrono Focus",
  path: app.getPath("exe"),
  isHidden: false,
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: "hiddenInset",
    title: "Chrono Focus",
    backgroundColor: "#f5f5f7",
  });

  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Loading app in development mode");

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (overlayManager) {
      overlayManager.close();
      overlayManager = null;
    }
  });

  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  overlayManager = createOverlayManager(mainWindow);
  initTray(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuiting = true;
});

// ========== IPC Handlers ==========

ipcMain.handle("show-notification", async (_event, { title, body }) => {
  try {
    const iconPath = path.join(__dirname, "../build/icon.png");
    const notification = new Notification({
      title,
      body,
      ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    });
    notification.show();
    return true;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return false;
  }
});

ipcMain.handle("request-notification-permission", async () => {
  return true;
});

ipcMain.handle("set-auto-launch", async (_event, enabled) => {
  try {
    if (enabled) {
      await autoLauncher.enable();
    } else {
      await autoLauncher.disable();
    }
    const isEnabled = await autoLauncher.isEnabled();
    return { success: true, enabled: isEnabled };
  } catch (error) {
    console.error("Failed to set auto-launch:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("get-auto-launch", async () => {
  try {
    const isEnabled = await autoLauncher.isEnabled();
    return { success: true, enabled: isEnabled };
  } catch (error) {
    console.error("Failed to get auto-launch status:", error);
    return { success: false, enabled: false, error: String(error) };
  }
});

ipcMain.handle("show-fullscreen-overlay", async () => {
  if (!overlayManager) return false;
  return overlayManager.show({ content: createTestOverlayHTML() });
});

ipcMain.handle("close-fullscreen-overlay", async () => {
  if (!overlayManager) return false;
  return overlayManager.close();
});

ipcMain.handle("show-rest-reminder-overlay", async (_event, config) => {
  if (!overlayManager) return false;
  return overlayManager.show({ content: createRestReminderHTML(config) });
});

ipcMain.handle("show-quiz-overlay", async (_event, config) => {
  if (!overlayManager) return false;
  return overlayManager.show({ content: createQuizHTML(config) });
});

ipcMain.handle("close-overlay", async () => {
  console.log("[main] close-overlay called, overlayManager:", !!overlayManager);
  if (!overlayManager) return false;
  const result = overlayManager.close();
  console.log("[main] overlayManager.close() result:", result);
  return result;
});

ipcMain.handle("overlay-action", async (event, { action }) => {
  console.log("[main] overlay-action received:", action);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("overlay-action", action);
  }
  if (action === "closed") {
    if (overlayManager) overlayManager.close();
  }
  return true;
});
