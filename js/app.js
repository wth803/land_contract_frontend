/**
 * app.js - 主应用入口模块
 * 负责应用初始化和各模块事件绑定
 */

/**
 * 应用初始化，在 DOM 加载完成后执行
 */
async function initApp() {
    // 初始化各模块事件监听
    initContracts();
    initModal();

    // 加载首页数据
    await loadContracts(1);
}

// DOM 加载完成后启动应用
document.addEventListener('DOMContentLoaded', initApp);
