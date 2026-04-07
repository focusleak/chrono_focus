// Tray manager - 集中管理所有托盘相关的逻辑和文字
import { Tray, Menu, nativeImage, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;
let mainWindow = null;

// 托盘文字配置
const TRAY_TEXTS = {
  idle: "空闲",
  pomodoro: (mins) => `番茄钟-已专注${mins}分钟`,
  shortBreak: "番茄钟-短休息中",
  longBreak: "番茄钟-长休息中",
  potato: (mins) => `土豆钟-${mins}分钟`,
  potatoOvertime: "土豆钟-娱乐中？",
  restReminder: (percent) => `休息提醒-${percent}%`,
  restReminderPaused: (percent) => `${percent}% 休息提醒暂停`,
  restReminderPrompt: "强制休息中",
};

// 托盘菜单模板
const createMenuTemplate = (state) => {
  const showWindow = {
    label: "显示主窗口",
    click: () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    },
  };

  const startPomodoro = {
    label: "启动番茄钟",
    click: () => mainWindow?.webContents.send("tray-action", "start-pomodoro"),
  };

  const quit = { label: "退出", role: "quit" };

  let template = [];

  switch (state) {
    case "pomodoro":
      template.push(
        {
          label: "暂停番茄钟",
          click: () =>
            mainWindow?.webContents.send("tray-action", "pomodoro-toggle"),
        },
        {
          label: "放弃",
          click: () =>
            mainWindow?.webContents.send("tray-action", "pomodoro-abort"),
        }
      );
      break;

    case "shortBreak":
    case "longBreak":
      template.push(
        {
          label: "暂停/继续",
          click: () =>
            mainWindow?.webContents.send("tray-action", "break-toggle"),
        },
        {
          label: "放弃",
          click: () =>
            mainWindow?.webContents.send("tray-action", "break-abort"),
        }
      );
      break;

    case "potato":
      template.push(
        {
          label: "暂停土豆钟",
          click: () =>
            mainWindow?.webContents.send("tray-action", "potato-toggle"),
        },
        {
          label: "放弃",
          click: () =>
            mainWindow?.webContents.send("tray-action", "potato-abort"),
        }
      );
      template.push({ type: "separator" }, startPomodoro);
      break;

    case "restReminder":
      template.push(
        {
          label: "暂停",
          click: () =>
            mainWindow?.webContents.send("tray-action", "rest-toggle"),
        }
      );
      template.push({ type: "separator" }, startPomodoro);
      break;

    case "restReminderPaused":
      template.push(
        {
          label: "继续",
          click: () =>
            mainWindow?.webContents.send("tray-action", "rest-toggle"),
        }
      );
      template.push({ type: "separator" }, startPomodoro);
      break;

    case "restReminderPrompt":
      // 强制休息中，不提供操作菜单
      break;

    default:
      // idle 状态
      template.push({ type: "separator" }, startPomodoro);
      break;
  }

  template.push({ type: "separator" }, showWindow,quit);
  return template;
};

// 根据状态获取托盘文字
const getTrayText = (state, data = {}) => {
  switch (state) {
    case "pomodoro":
      return TRAY_TEXTS.pomodoro(data.mins || "0");
    case "shortBreak":
      return TRAY_TEXTS.shortBreak;
    case "longBreak":
      return TRAY_TEXTS.longBreak;
    case "potato":
      return data.isOvertime
        ? TRAY_TEXTS.potatoOvertime
        : TRAY_TEXTS.potato(data.mins || "0");
    case "restReminder":
      return TRAY_TEXTS.restReminder(data.percent || "0");
    case "restReminderPaused":
      return TRAY_TEXTS.restReminderPaused(data.percent || "0");
    case "restReminderPrompt":
      return TRAY_TEXTS.restReminderPrompt;
    default:
      return TRAY_TEXTS.idle;
  }
};

// 初始化托盘
export const initTray = (window) => {
  mainWindow = window;

  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  let icon = nativeImage.createFromPath(iconPath);
  icon = icon.resize({ width: 22, height: 22 });
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip("Chrono Focus");

  // 右键点击显示菜单
  tray.on("right-click", () => {
    tray.popUpContextMenu();
  });

  // 注册 IPC 处理
  registerTrayIPC();

  // 设置初始状态
  updateTrayState("idle");

  return tray;
};

// 更新托盘状态（文字 + 菜单）
export const updateTrayState = (state, data = {}) => {
  if (!tray) return;

  const text = getTrayText(state, data);
  tray.setTitle(text);

  const template = createMenuTemplate(state);
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
};

// 仅更新托盘文字
export const updateTrayText = (text) => {
  if (tray) {
    tray.setTitle(text);
  }
};

// 仅更新托盘菜单
export const updateTrayMenu = (state) => {
  if (!tray) return;

  const template = createMenuTemplate(state);
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
};

// 注册 IPC 处理
export const registerTrayIPC = () => {
  // IPC: 更新托盘菜单状态
  ipcMain.handle("update-tray-menu", async (_event, { state }) => {
    updateTrayMenu(state);
    return true;
  });

  // IPC: 更新托盘文字
  ipcMain.handle("update-tray-text", async (_event, { text }) => {
    updateTrayText(text);
    return true;
  });
};
