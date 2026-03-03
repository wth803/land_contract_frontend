/**
 * contracts.js - 合同列表、搜索和分页逻辑模块
 * 负责从 API 获取数据并渲染到表格，处理分页和搜索
 */

// 当前分页状态
let currentPage = 1;
const PAGE_SIZE = 10;

// 当前搜索条件（null 表示不在搜索模式）
let searchParams = null;

/**
 * 加载合同列表（普通列表或搜索结果）
 * @param {number} page - 要加载的页码
 */
async function loadContracts(page = null) {
    if (page !== null) currentPage = page;

    setLoading(true);
    try {
        let result;
        if (searchParams) {
            // 搜索模式
            result = await searchContracts(
                searchParams.name,
                searchParams.landLocation,
                currentPage,
                PAGE_SIZE
            );
        } else {
            // 普通列表模式
            result = await getContracts(currentPage, PAGE_SIZE);
        }
        renderContractTable(result.items, result.total);
        renderPagination(result.total, result.page, result.page_size);
    } catch (error) {
        const message = parseErrorMessage(error);
        showToast(message, 'error');
        renderEmptyTable('加载失败，请稍后重试');
    } finally {
        setLoading(false);
    }
}

/**
 * 执行搜索
 * 从搜索输入框读取条件，切换到搜索模式并加载第 1 页
 */
async function handleSearch() {
    const nameInput = document.getElementById('search-name');
    const locationInput = document.getElementById('search-location');
    const name = nameInput ? nameInput.value.trim() : '';
    const landLocation = locationInput ? locationInput.value.trim() : '';

    // 至少填写一个搜索条件
    if (!name && !landLocation) {
        showToast('请至少输入承包人姓名或地块位置中的一个搜索条件', 'warning');
        return;
    }

    searchParams = { name, landLocation };
    await loadContracts(1);
}

/**
 * 重置搜索，回到普通列表模式
 */
async function handleReset() {
    const nameInput = document.getElementById('search-name');
    const locationInput = document.getElementById('search-location');
    if (nameInput) nameInput.value = '';
    if (locationInput) locationInput.value = '';
    searchParams = null;
    await loadContracts(1);
}

/**
 * 将合同列表渲染到表格
 * @param {Array} items - 合同数据数组
 * @param {number} total - 总记录数
 */
function renderContractTable(items, total) {
    const tbody = document.getElementById('contract-tbody');
    const totalEl = document.getElementById('total-count');
    if (!tbody) return;

    // 更新总记录数显示
    if (totalEl) totalEl.textContent = total;

    if (!items || items.length === 0) {
        renderEmptyTable('暂无数据');
        return;
    }

    // 计算当前页起始序号
    const startIndex = (currentPage - 1) * PAGE_SIZE + 1;

    tbody.innerHTML = items
        .map((contract, index) => {
            const rowNum = startIndex + index;
            return `
            <tr>
                <td>${rowNum}</td>
                <td>${escapeHtml(contract.name)}</td>
                <td>${escapeHtml(contract.id_card)}</td>
                <td>${escapeHtml(contract.phone)}</td>
                <td class="location-cell">${escapeHtml(contract.land_location)}</td>
                <td>${escapeHtml(String(contract.area))}</td>
                <td>${escapeHtml(String(contract.year))}</td>
                <td class="remark-cell">${escapeHtml(contract.remark || '-')}</td>
                <td class="action-cell">
                    <button class="btn btn-sm btn-edit" data-action="edit" data-id="${contract.id}">编辑</button>
                    <button class="btn btn-sm btn-delete" data-action="delete" data-id="${contract.id}" data-name="${escapeHtml(contract.name)}">删除</button>
                </td>
            </tr>
        `;
        })
        .join('');
}

/**
 * 渲染空状态提示
 * @param {string} message - 提示消息
 */
function renderEmptyTable(message) {
    const tbody = document.getElementById('contract-tbody');
    const totalEl = document.getElementById('total-count');
    if (!tbody) return;

    if (totalEl) totalEl.textContent = '0';
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-state">
                <div class="empty-icon">📋</div>
                <div>${escapeHtml(message)}</div>
            </td>
        </tr>
    `;

    // 清空分页
    const paginationEl = document.getElementById('pagination');
    if (paginationEl) paginationEl.innerHTML = '';
}

/**
 * 渲染分页导航
 * 最多显示 5 个页码按钮，超出部分用省略号
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 */
function renderPagination(total, page, pageSize) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    const buttons = [];

    // 上一页按钮
    buttons.push(
        `<button class="page-btn${page <= 1 ? ' disabled' : ''}" 
            data-page="${page > 1 ? page - 1 : ''}"
            ${page <= 1 ? 'disabled' : ''}>
            &lsaquo; 上一页
        </button>`
    );

    // 计算要显示的页码范围（最多 5 个）
    const maxVisible = 5;
    let startPage, endPage;

    if (totalPages <= maxVisible) {
        startPage = 1;
        endPage = totalPages;
    } else {
        // 以当前页为中心
        const half = Math.floor(maxVisible / 2);
        startPage = page - half;
        endPage = page + half;

        if (startPage < 1) {
            startPage = 1;
            endPage = maxVisible;
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxVisible + 1;
        }
    }

    // 首页和省略号
    if (startPage > 1) {
        buttons.push(
            `<button class="page-btn" data-page="1">1</button>`
        );
        if (startPage > 2) {
            buttons.push(`<span class="page-ellipsis">…</span>`);
        }
    }

    // 中间页码按钮
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(
            `<button class="page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`
        );
    }

    // 尾页和省略号
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttons.push(`<span class="page-ellipsis">…</span>`);
        }
        buttons.push(
            `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`
        );
    }

    // 下一页按钮
    buttons.push(
        `<button class="page-btn${page >= totalPages ? ' disabled' : ''}" 
            data-page="${page < totalPages ? page + 1 : ''}"
            ${page >= totalPages ? 'disabled' : ''}>
            下一页 &rsaquo;
        </button>`
    );

    paginationEl.innerHTML = buttons.join('');
}

/**
 * 处理编辑按钮点击
 * 根据 ID 查找合同数据并打开编辑模态框
 * @param {number} contractId - 合同 ID
 */
async function handleEdit(contractId) {
    try {
        setLoading(true, '加载数据...');
        // 从当前表格中获取合同数据，避免额外请求
        // 由于后端没有单独的 GET /api/contracts/{id} 接口，我们重新拉取并查找
        let contract = null;
        if (searchParams) {
            const result = await searchContracts(
                searchParams.name,
                searchParams.landLocation,
                currentPage,
                PAGE_SIZE
            );
            contract = result.items.find((c) => c.id === contractId);
        } else {
            const result = await getContracts(currentPage, PAGE_SIZE);
            contract = result.items.find((c) => c.id === contractId);
        }

        if (!contract) {
            showToast('未找到对应的合同记录', 'error');
            return;
        }
        openModal(contract);
    } catch (error) {
        showToast(parseErrorMessage(error), 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * 处理删除按钮点击，弹出确认对话框
 * @param {number} contractId - 合同 ID
 * @param {string} contractName - 承包人姓名（用于确认提示）
 */
function handleDelete(contractId, contractName) {
    const confirmed = confirm(`确认删除承包人"${contractName}"的土地承包明细记录吗？\n\n此操作不可撤销。`);
    if (!confirmed) return;

    performDelete(contractId);
}

/**
 * 执行删除操作
 * @param {number} contractId - 合同 ID
 */
async function performDelete(contractId) {
    try {
        setLoading(true, '删除中...');
        await deleteContract(contractId);
        showToast('土地承包明细记录已成功删除', 'success');
        // 如果当前页已无数据，回到上一页
        await loadContracts();
    } catch (error) {
        showToast(parseErrorMessage(error), 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * 初始化合同列表相关事件监听
 * 在 DOM 加载完成后由 app.js 调用
 */
function initContracts() {
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const addBtn = document.getElementById('add-btn');

    // 搜索按钮
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);

    // 重置按钮
    if (resetBtn) resetBtn.addEventListener('click', handleReset);

    // 添加按钮
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));

    // 搜索框按 Enter 键触发搜索
    const searchName = document.getElementById('search-name');
    const searchLocation = document.getElementById('search-location');
    const onEnter = (e) => { if (e.key === 'Enter') handleSearch(); };
    if (searchName) searchName.addEventListener('keydown', onEnter);
    if (searchLocation) searchLocation.addEventListener('keydown', onEnter);

    // 表格事件委托：统一处理编辑和删除按钮点击
    const tbody = document.getElementById('contract-tbody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = parseInt(btn.dataset.id, 10);
            if (action === 'edit') {
                handleEdit(id);
            } else if (action === 'delete') {
                // data-name 由 escapeHtml 转义写入属性，浏览器自动解码 HTML 实体
                // 故可直接读取 dataset.name 获得原始文本
                handleDelete(id, btn.dataset.name);
            }
        });
    }

    // 分页事件委托：通过 data-page 属性跳转页面
    const paginationEl = document.getElementById('pagination');
    if (paginationEl) {
        paginationEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-page]');
            if (!btn || btn.disabled) return;
            const page = parseInt(btn.dataset.page, 10);
            if (!isNaN(page) && page > 0) loadContracts(page);
        });
    }

    // 初始化导出功能
    initExport();
}

/**
 * 打开导出模态框
 */
function openExportModal() {
    const overlay = document.getElementById('export-modal');
    if (overlay) {
        overlay.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

/**
 * 关闭导出模态框
 */
function closeExportModal() {
    const overlay = document.getElementById('export-modal');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

/**
 * 初始化导出 Excel 相关事件监听
 */
function initExport() {
    const exportBtn = document.getElementById('export-btn');
    const closeBtn = document.getElementById('export-close-btn');
    const cancelBtn = document.getElementById('export-cancel-btn');
    const confirmBtn = document.getElementById('export-confirm-btn');
    const overlay = document.getElementById('export-modal');
    const selectAllCb = document.getElementById('export-select-all');

    // 导出按钮：打开导出选项模态框
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);

    // 关闭按钮和取消按钮：关闭模态框
    if (closeBtn) closeBtn.addEventListener('click', closeExportModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeExportModal);

    // 点击遮罩层关闭模态框
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeExportModal();
        });
    }

    // 全选 / 取消全选
    if (selectAllCb) {
        selectAllCb.addEventListener('change', function () {
            document.querySelectorAll('input[name="exportColumn"]').forEach(cb => {
                cb.checked = this.checked;
            });
        });
    }

    // 单个 checkbox 变化时更新全选状态
    document.querySelectorAll('input[name="exportColumn"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const all = document.querySelectorAll('input[name="exportColumn"]');
            const checked = document.querySelectorAll('input[name="exportColumn"]:checked');
            if (selectAllCb) selectAllCb.checked = all.length === checked.length;
        });
    });

    // 确认导出按钮
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            // 获取选中的列
            const checkedBoxes = document.querySelectorAll('input[name="exportColumn"]:checked');
            const columns = Array.from(checkedBoxes).map(cb => cb.value);

            if (columns.length === 0) {
                showToast('请至少选择一个导出字段', 'warning');
                return;
            }

            // 如果处于搜索模式，则传入搜索条件，否则传空字符串
            const exportSearchName = searchParams ? searchParams.name : '';
            const exportSearchLocation = searchParams ? searchParams.landLocation : '';

            // 禁用按钮，显示导出中状态
            confirmBtn.disabled = true;
            confirmBtn.textContent = '导出中...';

            try {
                const blob = await exportContracts(columns, exportSearchName, exportSearchLocation);

                // 生成带时间戳的文件名并触发下载
                const now = new Date();
                const timestamp = now.getFullYear() +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') +
                    String(now.getMinutes()).padStart(2, '0') +
                    String(now.getSeconds()).padStart(2, '0');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `土地承包明细_${timestamp}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                showToast('导出成功！', 'success');
                closeExportModal();
            } catch (error) {
                showToast('导出失败：' + error.message, 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '📥 确认导出';
            }
        });
    }

    // ESC 键关闭导出模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
            closeExportModal();
        }
    });
}
