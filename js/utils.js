/**
 * utils.js - 工具函数模块
 * 提供 Toast 通知、Loading 动画、HTML 转义等通用工具
 */

/**
 * 显示 Toast 消息通知
 * @param {string} message - 消息内容
 * @param {string} type - 通知类型：success / error / warning / info
 * @param {number} duration - 显示时长（毫秒），默认 3000
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // 创建 Toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // 根据类型设置图标
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };
    const icon = icons[type] || icons.info;

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" type="button" aria-label="关闭通知">×</button>
    `;

    container.appendChild(toast);

    // 关闭按钮事件（避免内联 onclick）
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    // 触发进入动画
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    // 自动消失
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, duration);
}

/**
 * 显示加载中动画
 * @param {boolean} show - true 显示，false 隐藏
 * @param {string} message - 加载提示文字，默认"加载中..."
 */
function setLoading(show, message = '加载中...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (!overlay) return;

    if (show) {
        if (loadingText) loadingText.textContent = message;
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

/**
 * HTML 转义，防止 XSS 攻击
 * 对所有用户输入内容进行转义后再插入 DOM
 * @param {*} str - 需要转义的字符串或值
 * @returns {string} 转义后的安全字符串
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const text = String(str);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 格式化日期时间字符串
 * @param {string} isoString - ISO 8601 格式的日期时间字符串
 * @returns {string} 本地化的日期时间字符串，如 "2026-03-03 10:30:00"
 */
function formatDateTime(isoString) {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}:${s}`;
    } catch (e) {
        return isoString;
    }
}

/**
 * 解析后端错误响应，提取用户友好的错误消息
 * @param {Error} error - 请求错误对象
 * @returns {string} 用户友好的错误消息
 */
function parseErrorMessage(error) {
    if (!error) return '未知错误';

    // 网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return '无法连接到服务器，请检查网络连接或后端服务是否启动';
    }

    if (!error.data) return error.message || '请求失败';

    const data = error.data;

    // 422 验证错误（Pydantic）
    if (error.status === 422 && Array.isArray(data.detail)) {
        const messages = data.detail.map((item) => item.msg).filter(Boolean);
        return messages.length > 0 ? messages.join('；') : '输入数据验证失败';
    }

    // 其他错误（400、404 等）
    if (typeof data.detail === 'string') {
        return data.detail;
    }

    return error.message || '请求失败';
}

/**
 * 防抖函数，减少频繁触发的事件调用次数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟毫秒数
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
