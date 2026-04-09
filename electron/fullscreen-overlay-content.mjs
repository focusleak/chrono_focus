/**
 * FullScreenOverlay HTML 内容生成
 * 通用模板，内容由调用者传递
 */

/** HTML 转义，防止 XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * 创建 FullScreenOverlay HTML
 * @param {Object} config
 * @param {string} config.content - HTML 内容
 * @param {string} config.backgroundColor - 背景色，默认 rgba(0,0,0,0.7)
 */
export function createFullScreenHTML(config) {
  const { content = "", backgroundColor = "rgba(0,0,0,0.7)" } = config

  return `
    <div style="
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${backgroundColor};
    ">
      ${content}
    </div>
  `
}
