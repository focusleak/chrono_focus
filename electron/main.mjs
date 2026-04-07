// Electron main process
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  app,
  BrowserWindow,
  Notification,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} = require("electron");
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import AutoLaunch from "auto-launch";
import { createOverlayManager } from "./overlay.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let overlayManager = null;
let tray = null;

// 配置开机自启动
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

  // 开发环境加载 Vite 开发服务器
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Loading app in development mode");

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
    overlayManager = null;
  });

  // 初始化遮罩管理器
  overlayManager = createOverlayManager(mainWindow);
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  let icon = nativeImage.createFromPath(iconPath);

  icon = icon.resize({ width: 22, height: 22 });
  icon.setTemplateImage(true);

  tray = new Tray(icon);

  tray.setTitle("1.空闲");

  tray.setToolTip("Chrono Focus");

  // 初始菜单（空闲状态）
  updateTrayMenu("idle");

  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 根据状态更新托盘菜单
function updateTrayMenu(state) {
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

  let template = [showWindow];

  switch (state) {
    case "pomodoro":
      template.push(
        { type: "separator" },
        {
          label: "暂停番茄钟",
          click: () => mainWindow?.webContents.send("tray-action", "pomodoro-toggle"),
        },
        {
          label: "放弃",
          click: () => mainWindow?.webContents.send("tray-action", "pomodoro-abort"),
        }
      );
      break;

    case "shortBreak":
    case "longBreak":
      template.push(
        { type: "separator" },
        {
          label: "暂停/继续",
          click: () => mainWindow?.webContents.send("tray-action", "break-toggle"),
        },
        {
          label: "放弃",
          click: () => mainWindow?.webContents.send("tray-action", "break-abort"),
        }
      );
      break;

    case "potato":
      template.push(
        { type: "separator" },
        {
          label: "暂停土豆钟",
          click: () => mainWindow?.webContents.send("tray-action", "potato-toggle"),
        },
        {
          label: "放弃",
          click: () => mainWindow?.webContents.send("tray-action", "potato-abort"),
        }
      );
      template.push({ type: "separator" }, startPomodoro);
      break;

    case "restReminder":
      template.push(
        { type: "separator" },
        {
          label: "暂停",
          click: () => mainWindow?.webContents.send("tray-action", "rest-toggle"),
        }
      );
      template.push({ type: "separator" }, startPomodoro);
      break;

    case "restReminderPaused":
      template.push(
        { type: "separator" },
        {
          label: "继续",
          click: () => mainWindow?.webContents.send("tray-action", "rest-toggle"),
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

  template.push({ type: "separator" }, quit);

  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
}

// IPC: 更新托盘菜单状态
ipcMain.handle("update-tray-menu", async (_event, { state }) => {
  updateTrayMenu(state);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  createTray()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC: 显示系统通知
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

// IPC: 请求通知权限
ipcMain.handle("request-notification-permission", async () => {
  return true;
});

// IPC: 设置开机自启动
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

// IPC: 获取开机自启动状态
ipcMain.handle("get-auto-launch", async () => {
  try {
    const isEnabled = await autoLauncher.isEnabled();
    return { success: true, enabled: isEnabled };
  } catch (error) {
    console.error("Failed to get auto-launch status:", error);
    return { success: false, enabled: false, error: String(error) };
  }
});

// IPC: 显示全屏遮罩
ipcMain.handle("show-fullscreen-overlay", async () => {
  if (!overlayManager) return false;

  return overlayManager.show({
    content: `
      <div class="content">
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
  });
});

// IPC: 关闭全屏遮罩
ipcMain.handle("close-fullscreen-overlay", async () => {
  if (!overlayManager) return false;
  return overlayManager.close();
});

// 格式化时间辅助函数
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// IPC: 显示休息提醒遮罩
ipcMain.handle("show-rest-reminder-overlay", async (_event, config) => {
  if (!overlayManager) return false;

  const {
    isLongBreak,
    timeLeft,
    progress,
    breakDuration,
    isSkipped,
    skipCount,
  } = config;

  const content = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%; height: 100%;
        overflow: hidden;
        background: rgba(0,0,0,0.7);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        color: white;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      body {
        display: flex; align-items: center; justify-content: center;
      }
      .overlay-container {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        padding: 40px;
        max-width: 448px;
        width: 90%;
        text-align: center;
      }
      @media (prefers-color-scheme: dark) {
        .overlay-container { background: #1c1c1e; }
      }
      .icon-wrapper {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: #fed7aa;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 24px;
      }
      @media (prefers-color-scheme: dark) {
        .icon-wrapper { background: rgba(251,146,60,0.2); }
      }
      .icon { font-size: 32px; }
      .icon-svg {
        width: 32px; height: 32px;
        color: #f97316;
      }
      @media (prefers-color-scheme: dark) {
        .icon-svg { color: #fb923c; }
      }
      h2 {
        font-size: 20px; font-weight: 600;
        color: #111827; margin-bottom: 8px;
      }
      @media (prefers-color-scheme: dark) {
        h2 { color: #f3f4f6; }
      }
      .subtitle {
        font-size: 14px; color: #6b7280; margin-bottom: 8px;
      }
      @media (prefers-color-scheme: dark) {
        .subtitle { color: #9ca3af; }
      }
      .skip-hint {
        font-size: 12px; color: #f59e0b; margin-bottom: 24px;
        font-weight: 500;
      }
      @media (prefers-color-scheme: dark) {
        .skip-hint { color: #fbbf24; }
      }
      .timer {
        font-size: 48px; font-weight: 600;
        font-family: 'SF Mono', 'Menlo', monospace;
        color: #111827; margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
      }
      @media (prefers-color-scheme: dark) {
        .timer { color: #f3f4f6; }
      }
      .progress-bar {
        width: 100%; height: 6px;
        background: #e5e7eb; border-radius: 999px;
        overflow: hidden; margin-bottom: 8px;
      }
      @media (prefers-color-scheme: dark) {
        .progress-bar { background: #374151; }
      }
      .progress-fill {
        height: 100%; border-radius: 999px;
        background: #f97316;
        transition: width 1s linear;
      }
      .progress-text {
        font-size: 12px; color: #9ca3af; margin-bottom: 32px;
      }
      @media (prefers-color-scheme: dark) {
        .progress-text { color: #6b7280; }
      }
      .btn-group {
        display: flex; gap: 12px;
      }
      .btn {
        flex: 1; padding: 12px 16px;
        border-radius: 12px; font-size: 14px;
        font-weight: 500; cursor: pointer;
        border: none; transition: background 0.15s, opacity 0.15s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .btn:disabled {
        opacity: 0.5; cursor: not-allowed;
      }
      .btn-skip {
        background: #f3f4f6; color: #374151;
      }
      .btn-skip:hover:not(:disabled) {
        background: #e5e7eb;
      }
      @media (prefers-color-scheme: dark) {
        .btn-skip { background: #2c2c2e; color: #d1d5db; }
        .btn-skip:hover:not(:disabled) { background: #3a3a3c; }
      }
    </style>
    <div class="overlay-container">
      <div class="icon-wrapper">
        <svg class="icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
          <line x1="6" x2="6" y1="2" y2="4"/>
          <line x1="10" x2="10" y1="2" y2="4"/>
          <line x1="14" x2="14" y1="2" y2="4"/>
        </svg>
      </div>
      <h2>${isLongBreak ? "长休息提醒" : "休息提醒"}</h2>
      <p class="subtitle">${isLongBreak ? "已经连续短休多次，本次为长休息" : "你已经工作了一段时间，记得休息一下哦"}</p>
      ${isSkipped ? `<p class="skip-hint">已跳过 ${skipCount} 次</p>` : ""}
      <div class="timer" id="timerDisplay">${formatTime(timeLeft)}</div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: ${progress}%"></div>
      </div>
      <p class="progress-text">倒计时结束后自动关闭</p>
      <button class="btn btn-skip" id="skipBtn" style="width: 100%">
        跳过
      </button>
    </div>
    <script>
      let currentTime = ${timeLeft};
      const totalDuration = ${breakDuration};

      const timerEl = document.getElementById('timerDisplay');
      const progressEl = document.getElementById('progressFill');

      function formatTimeStr(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }

      function updateDisplay(t) {
        timerEl.textContent = formatTimeStr(t);
        const p = totalDuration > 0 ? ((totalDuration - t) / totalDuration) * 100 : 0;
        progressEl.style.width = p + '%';
      }

      const interval = setInterval(() => {
        if (currentTime > 0) {
          currentTime--;
          updateDisplay(currentTime);
        } else {
          clearInterval(interval);
          // 倒计时结束，自动关闭遮罩
          if (typeof window.overlayAPI?.close === 'function') {
            window.overlayAPI.close();
          }
          if (typeof window.overlayAPI?.notifyClosed === 'function') {
            window.overlayAPI.notifyClosed();
          }
        }
      }, 1000);

      // 跳过按钮
      document.getElementById('skipBtn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('skipBtn').disabled = true;
        // 直接关闭遮罩窗口
        if (typeof window.overlayAPI?.close === 'function') {
          window.overlayAPI.close();
        }
        // 同时通知主进程
        if (typeof window.overlayAPI?.notifySkip === 'function') {
          window.overlayAPI.notifySkip();
        }
      });
    </script>
  `;

  return overlayManager.show({ content });
});

// IPC: 显示答题遮罩
ipcMain.handle("show-quiz-overlay", async (_event, config) => {
  if (!overlayManager) return false;

  const { num1, num2 } = config;

  const content = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%; height: 100%;
        overflow: hidden;
        background: rgba(0,0,0,0.7);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        color: white;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      body {
        display: flex; align-items: center; justify-content: center;
      }
      .quiz-container {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        padding: 40px;
        max-width: 384px;
        width: 90%;
        text-align: center;
        position: relative;
      }
      @media (prefers-color-scheme: dark) {
        .quiz-container { background: #1c1c1e; }
      }
      .close-btn {
        position: absolute; top: 16px; right: 16px;
        width: 32px; height: 32px;
        border-radius: 8px; border: none;
        background: transparent; cursor: pointer;
        color: #9ca3af; font-size: 20px;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, color 0.15s;
      }
      .close-btn:hover {
        background: #f3f4f6; color: #374151;
      }
      @media (prefers-color-scheme: dark) {
        .close-btn:hover { background: #2c2c2e; color: #d1d5db; }
      }
      .icon-wrapper {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: #dbeafe;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 24px;
      }
      @media (prefers-color-scheme: dark) {
        .icon-wrapper { background: rgba(96,165,250,0.2); }
      }
      .icon { font-size: 32px; font-weight: bold; color: #2563eb; }
      @media (prefers-color-scheme: dark) {
        .icon { color: #60a5fa; }
      }
      h2 {
        font-size: 20px; font-weight: 600;
        color: #111827; margin-bottom: 24px;
      }
      @media (prefers-color-scheme: dark) {
        h2 { color: #f3f4f6; }
      }
      .question {
        font-size: 36px; font-weight: bold;
        font-family: 'SF Mono', 'Menlo', monospace;
        color: #111827; margin-bottom: 32px;
      }
      @media (prefers-color-scheme: dark) {
        .question { color: #f3f4f6; }
      }
      .answer-input {
        width: 100%; height: 56px;
        padding: 0 16px; font-size: 24px;
        text-align: center; font-family: 'SF Mono', 'Menlo', monospace;
        border-radius: 12px; border: 2px solid #d1d5db;
        background: #ffffff; color: #111827;
        outline: none; transition: border-color 0.15s;
        margin-bottom: 16px;
      }
      @media (prefers-color-scheme: dark) {
        .answer-input {
          background: #2c2c2e; border-color: #4b5563; color: #f3f4f6;
        }
      }
      .answer-input:focus {
        border-color: #3b82f6;
      }
      .answer-input:disabled {
        opacity: 0.5;
      }
      .result {
        display: flex; align-items: center; justify-content: center;
        gap: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500;
      }
      .result-correct { color: #16a34a; }
      @media (prefers-color-scheme: dark) {
        .result-correct { color: #4ade80; }
      }
      .result-wrong { color: #dc2626; }
      @media (prefers-color-scheme: dark) {
        .result-wrong { color: #f87171; }
      }
      .btn {
        width: 100%; padding: 12px 16px;
        border-radius: 12px; font-size: 14px;
        font-weight: 500; cursor: pointer;
        border: none; transition: background 0.15s;
      }
      .btn-blue {
        background: #3b82f6; color: white;
      }
      .btn-blue:hover { background: #2563eb; }
      .btn-blue:disabled {
        opacity: 0.5; cursor: not-allowed;
      }
    </style>
    <div class="quiz-container">
      <button class="close-btn" id="closeBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="icon-wrapper">
        <span class="icon">×</span>
      </div>
      <h2>请回答</h2>
      <div class="question">${num1} × ${num2} = ?</div>
      <input type="number" class="answer-input" id="answerInput" placeholder="输入答案后按回车提交" />
      <div id="resultArea"></div>
      <button class="btn btn-blue" id="submitBtn">提交答案</button>
    </div>
    <script>
      const correctAnswer = ${num1} * ${num2};
      const inputEl = document.getElementById('answerInput');
      const submitEl = document.getElementById('submitBtn');
      const resultEl = document.getElementById('resultArea');

      inputEl.focus();

      function submitAnswer() {
        const val = inputEl.value.trim();
        if (!val) return;

        const userAnswer = parseInt(val, 10);
        const isCorrect = userAnswer === correctAnswer;

        inputEl.disabled = true;
        submitEl.disabled = true;

        if (isCorrect) {
          resultEl.innerHTML = '<div class="result result-correct"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 回答正确！</div>';
          setTimeout(() => {
            if (typeof window.overlayAPI?.notifyQuizCorrect === 'function') {
              window.overlayAPI.notifyQuizCorrect();
            }
          }, 1000);
        } else {
          resultEl.innerHTML = '<div class="result result-wrong"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> 回答错误，请重试</div>';
          inputEl.disabled = false;
          inputEl.value = '';
          inputEl.focus();
          submitEl.disabled = false;
        }
      }

      submitEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitAnswer();
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          submitAnswer();
        }
      });

      document.getElementById('closeBtn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // 直接关闭遮罩窗口
        if (typeof window.overlayAPI?.close === 'function') {
          window.overlayAPI.close();
        }
        // 同时通知主进程
        if (typeof window.overlayAPI?.notifyQuizClose === 'function') {
          window.overlayAPI.notifyQuizClose();
        }
      });
    </script>
  `;

  return overlayManager.show({ content });
});

// IPC: 关闭遮罩
ipcMain.handle("close-overlay", async () => {
  console.log("[main] close-overlay called, overlayManager:", !!overlayManager);
  if (!overlayManager) return false;
  const result = overlayManager.close();
  console.log("[main] overlayManager.close() result:", result);
  return result;
});

// IPC: 更新托盘文字
ipcMain.handle("update-tray-text", async (_event, { text }) => {
  if (tray) {
    tray.setTitle(text);
  }
  return true;
});

// IPC: 接收遮罩窗口动作并转发到主窗口
ipcMain.handle("overlay-action", async (event, { action }) => {
  console.log("[main] overlay-action received:", action);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("overlay-action", action);
  }
  // 如果是关闭动作，同时关闭遮罩窗口
  if (action === "closed") {
    if (overlayManager) overlayManager.close();
  }
  return true;
});
