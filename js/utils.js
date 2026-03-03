/**
 * utils.js - 工具函数模块
 * 提供 Toast 通知、Loading 动画、数字格式化及 XSS 防护功能
 */

/* ==================== XSS 防护 ==================== */

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param {*} str - 需要转义的值
 * @returns {string} 转义后的字符串
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==================== Toast 通知 ==================== */

let toastTimer = null;

/**
 * 显示 Toast 通知
 * @param {string} message - 通知内容
 * @param {'success'|'error'|'info'} type - 通知类型
 * @param {number} duration - 显示时长（毫秒），默认 3000
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // 清除已有定时器，避免多次触发时提前消失
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  // textContent 不解析 HTML，无需额外转义
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, duration);
}

/* ==================== Loading 动画 ==================== */

/**
 * 显示全屏 Loading 遮罩
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('show');
}

/**
 * 隐藏全屏 Loading 遮罩
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('show');
}

/* ==================== 格式化工具 ==================== */

/**
 * 格式化 ISO 时间字符串为本地日期时间
 * @param {string} isoStr - ISO 8601 时间字符串
 * @returns {string} 格式化后的本地时间字符串
 */
function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const date = new Date(isoStr);
    return date.toLocaleString('zh-CN', { hour12: false });
  } catch {
    return isoStr;
  }
}

/**
 * 格式化面积数字，保留最多两位小数
 * @param {number} area - 面积数值
 * @returns {string} 格式化后的面积字符串
 */
function formatArea(area) {
  if (area === null || area === undefined) return '-';
  return parseFloat(area).toFixed(2).replace(/\.?0+$/, '') + ' 亩';
}
