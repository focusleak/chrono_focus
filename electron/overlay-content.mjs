// 遮罩窗口 HTML 内容生成

/** HTML 转义，防止 XSS 注入 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
}

const BASE_STYLES = `
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
`

const DARK_MODE_MEDIA = `@media (prefers-color-scheme: dark)`

export const createTestOverlayHTML = () => `
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
`

export const createRestReminderHTML = (config) => {
  const { isLongBreak, timeLeft, progress, breakDuration, isSkipped, skipCount } = config

  const styles = `
    <style>
      ${BASE_STYLES}
      .overlay-container {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        padding: 40px;
        max-width: 448px;
        width: 90%;
        text-align: center;
      }
      ${DARK_MODE_MEDIA} {
        .overlay-container { background: #1c1c1e; }
      }
      .icon-wrapper {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: #fed7aa;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 24px;
      }
      ${DARK_MODE_MEDIA} {
        .icon-wrapper { background: rgba(251,146,60,0.2); }
      }
      .icon-svg {
        width: 32px; height: 32px;
        color: #f97316;
      }
      ${DARK_MODE_MEDIA} {
        .icon-svg { color: #fb923c; }
      }
      h2 {
        font-size: 20px; font-weight: 600;
        color: #111827; margin-bottom: 8px;
      }
      ${DARK_MODE_MEDIA} {
        h2 { color: #f3f4f6; }
      }
      .subtitle {
        font-size: 14px; color: #6b7280; margin-bottom: 8px;
      }
      ${DARK_MODE_MEDIA} {
        .subtitle { color: #9ca3af; }
      }
      .skip-hint {
        font-size: 12px; color: #f59e0b; margin-bottom: 24px;
        font-weight: 500;
      }
      ${DARK_MODE_MEDIA} {
        .skip-hint { color: #fbbf24; }
      }
      .timer {
        font-size: 48px; font-weight: 600;
        font-family: 'SF Mono', 'Menlo', monospace;
        color: #111827; margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
      }
      ${DARK_MODE_MEDIA} {
        .timer { color: #f3f4f6; }
      }
      .progress-bar {
        width: 100%; height: 6px;
        background: #e5e7eb; border-radius: 999px;
        overflow: hidden; margin-bottom: 8px;
      }
      ${DARK_MODE_MEDIA} {
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
      ${DARK_MODE_MEDIA} {
        .progress-text { color: #6b7280; }
      }
      .btn-skip {
        width: 100%; padding: 12px 16px;
        border-radius: 12px; font-size: 14px;
        font-weight: 500; cursor: pointer;
        border: none; transition: background 0.15s, opacity 0.15s;
        background: #f3f4f6; color: #374151;
      }
      .btn-skip:hover:not(:disabled) {
        background: #e5e7eb;
      }
      ${DARK_MODE_MEDIA} {
        .btn-skip { background: #2c2c2e; color: #d1d5db; }
        .btn-skip:hover:not(:disabled) { background: #3a3a3c; }
      }
      .btn-skip:disabled {
        opacity: 0.5; cursor: not-allowed;
      }
    </style>
  `

  const html = `
    ${styles}
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
      <h2>${escapeHtml(isLongBreak ? "长休息提醒" : "休息提醒")}</h2>
      <p class="subtitle">${escapeHtml(isLongBreak ? "已经连续短休多次，本次为长休息" : "你已经工作了一段时间，记得休息一下哦")}</p>
      ${isSkipped ? `<p class="skip-hint">已跳过 ${escapeHtml(skipCount)} 次</p>` : ""}
      <div class="timer" id="timerDisplay">${formatTime(timeLeft)}</div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: ${Number(progress) || 0}%"></div>
      </div>
      <p class="progress-text">倒计时结束后自动关闭</p>
      <button class="btn-skip" id="skipBtn">跳过</button>
    </div>
    <script>
      // 注册定时器到全局数组，便于清理
      window.__intervals = window.__intervals || []

      let currentTime = ${Number(timeLeft) || 0};
      const totalDuration = ${Number(breakDuration) || 0};

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
          if (typeof window.overlayAPI?.close === 'function') {
            window.overlayAPI.close();
          }
          if (typeof window.overlayAPI?.notifyClosed === 'function') {
            window.overlayAPI.notifyClosed();
          }
        }
      }, 1000);

      window.__intervals.push(interval);

      document.getElementById('skipBtn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('skipBtn').disabled = true;
        if (typeof window.overlayAPI?.close === 'function') {
          window.overlayAPI.close();
        }
        if (typeof window.overlayAPI?.notifySkip === 'function') {
          window.overlayAPI.notifySkip();
        }
      });
    </script>
  `

  return html
}

export const createQuizHTML = (config) => {
  const { num1, num2 } = config
  const correctAnswer = num1 * num2

  const styles = `
    <style>
      ${BASE_STYLES}
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
      ${DARK_MODE_MEDIA} {
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
      ${DARK_MODE_MEDIA} {
        .close-btn:hover { background: #2c2c2e; color: #d1d5db; }
      }
      .icon-wrapper {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: #dbeafe;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 24px;
      }
      ${DARK_MODE_MEDIA} {
        .icon-wrapper { background: rgba(96,165,250,0.2); }
      }
      .icon { font-size: 32px; font-weight: bold; color: #2563eb; }
      ${DARK_MODE_MEDIA} {
        .icon { color: #60a5fa; }
      }
      h2 {
        font-size: 20px; font-weight: 600;
        color: #111827; margin-bottom: 24px;
      }
      ${DARK_MODE_MEDIA} {
        h2 { color: #f3f4f6; }
      }
      .question {
        font-size: 36px; font-weight: bold;
        font-family: 'SF Mono', 'Menlo', monospace;
        color: #111827; margin-bottom: 32px;
      }
      ${DARK_MODE_MEDIA} {
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
      ${DARK_MODE_MEDIA} {
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
      ${DARK_MODE_MEDIA} {
        .result-correct { color: #4ade80; }
      }
      .result-wrong { color: #dc2626; }
      ${DARK_MODE_MEDIA} {
        .result-wrong { color: #f87171; }
      }
      .btn-blue {
        width: 100%; padding: 12px 16px;
        border-radius: 12px; font-size: 14px;
        font-weight: 500; cursor: pointer;
        border: none; transition: background 0.15s;
        background: #3b82f6; color: white;
      }
      .btn-blue:hover { background: #2563eb; }
      .btn-blue:disabled {
        opacity: 0.5; cursor: not-allowed;
      }
    </style>
  `

  const html = `
    ${styles}
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
      <div class="question">${escapeHtml(num1)} × ${escapeHtml(num2)} = ?</div>
      <input type="number" class="answer-input" id="answerInput" placeholder="输入答案后按回车提交" />
      <div id="resultArea"></div>
      <button class="btn-blue" id="submitBtn">提交答案</button>
    </div>
    <script>
      const correctAnswer = ${correctAnswer};
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
        if (typeof window.overlayAPI?.close === 'function') {
          window.overlayAPI.close();
        }
        if (typeof window.overlayAPI?.notifyQuizClose === 'function') {
          window.overlayAPI.notifyQuizClose();
        }
      });
    </script>
  `

  return html
}
