/**
 * app.js - 主应用入口模块
 * 负责应用初始化和各模块事件绑定
 */

/**
 * 应用初始化，在 DOM 加载完成后执行
 */
async function initApp() {
    // 检查是否已登录
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 验证 token 有效性
    try {
        await getCurrentUser();
    } catch (e) {
        // getCurrentUser 内部 401 会自动跳转，其他错误也跳转到登录页
        window.location.href = 'login.html';
        return;
    }

    // 显示用户名
    const username = localStorage.getItem('username');
    const usernameEl = document.getElementById('header-username');
    if (usernameEl && username) {
        usernameEl.textContent = username;
    }

    // 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('access_token');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }

    // 初始化各模块事件监听
    initContracts();
    initModal();

    // 加载首页数据
    await loadContracts(1);
}

// DOM 加载完成后启动应用
document.addEventListener('DOMContentLoaded', initApp);
