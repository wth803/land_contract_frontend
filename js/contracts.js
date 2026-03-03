/**
 * contracts.js - 列表、搜索、分页、删除模块
 */

// 分页状态
let currentPage = 1;
const PAGE_SIZE = 10;

// 当前搜索条件（空字符串表示不启用搜索）
let searchName = '';
let searchLocation = '';

/**
 * 根据当前分页和搜索条件加载数据
 */
async function loadContracts() {
  showLoading();
  try {
    let result;
    if (searchName || searchLocation) {
      result = await apiSearchContracts(searchName, searchLocation, currentPage, PAGE_SIZE);
    } else {
      result = await apiGetContracts(currentPage, PAGE_SIZE);
    }
    renderTable(result.items, result.total);
    renderPagination(result.total, result.page, result.page_size);
  } catch (err) {
    showToast(err.message || '加载数据失败，请稍后重试', 'error');
    renderTable([], 0);
    renderPagination(0, 1, PAGE_SIZE);
  } finally {
    hideLoading();
  }
}

/**
 * 渲染数据表格
 * @param {Array} items - 合同列表
 * @param {number} total - 总条数
 */
function renderTable(items, total) {
  const tbody = document.getElementById('contractTableBody');
  const emptyEl = document.getElementById('emptyState');
  const tableWrap = document.getElementById('tableWrapper');
  const totalEl = document.getElementById('totalCount');

  if (totalEl) totalEl.textContent = total;

  if (!items || items.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'flex';
    tableWrap.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  tableWrap.style.display = '';

  // 计算当前页起始序号
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;

  tbody.innerHTML = items
    .map((item, idx) => `
      <tr>
        <td>${startIndex + idx}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.id_card)}</td>
        <td>${escapeHtml(item.phone)}</td>
        <td title="${escapeHtml(item.land_location)}">${escapeHtml(item.land_location)}</td>
        <td>${formatArea(item.area)}</td>
        <td>${escapeHtml(String(item.year))}</td>
        <td title="${escapeHtml(item.remark || '')}">${escapeHtml(item.remark || '-')}</td>
        <td class="action-cell">
          <button class="btn btn-sm btn-edit" data-action="edit" data-id="${item.id}" aria-label="编辑">编辑</button>
          <button class="btn btn-sm btn-delete" data-action="delete" data-id="${item.id}" data-name="${escapeHtml(item.name)}" aria-label="删除">删除</button>
        </td>
      </tr>
    `)
    .join('');
}

/**
 * 渲染分页控件
 * @param {number} total - 总条数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页条数
 */
function renderPagination(total, page, pageSize) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(total / pageSize) || 1;
  const buttons = [];

  // 上一页
  buttons.push(`
    <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="changePage(${page - 1})" aria-label="上一页">
      &laquo;
    </button>
  `);

  // 页码按钮（最多显示 5 个页码，超出时省略）
  const range = getPageRange(page, totalPages);
  range.forEach(p => {
    if (p === '...') {
      buttons.push('<span class="page-ellipsis">…</span>');
    } else {
      buttons.push(`
        <button class="page-btn ${p === page ? 'active' : ''}" onclick="changePage(${p})" aria-current="${p === page ? 'page' : 'false'}">${p}</button>
      `);
    }
  });

  // 下一页
  buttons.push(`
    <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})" aria-label="下一页">
      &raquo;
    </button>
  `);

  // 页码信息
  const infoHtml = `<span class="page-info">第 ${page} / ${totalPages} 页，共 ${total} 条</span>`;

  container.innerHTML = buttons.join('') + infoHtml;
}

/**
 * 生成页码范围数组（带省略号逻辑）
 * @param {number} current - 当前页
 * @param {number} total - 总页数
 * @returns {Array<number|string>}
 */
function getPageRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

/**
 * 切换页码
 * @param {number} page - 目标页码
 */
function changePage(page) {
  currentPage = page;
  loadContracts();
  // 滚动到表格顶部
  document.getElementById('tableSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==================== 搜索 ==================== */

/**
 * 执行搜索
 */
function handleSearch() {
  const nameVal = document.getElementById('searchName').value.trim();
  const locationVal = document.getElementById('searchLocation').value.trim();

  if (!nameVal && !locationVal) {
    showToast('请至少输入一个搜索条件（承包人姓名或地块位置）', 'error');
    return;
  }

  searchName = nameVal;
  searchLocation = locationVal;
  currentPage = 1;
  loadContracts();
}

/**
 * 重置搜索条件，返回全量列表
 */
function handleSearchReset() {
  document.getElementById('searchName').value = '';
  document.getElementById('searchLocation').value = '';
  searchName = '';
  searchLocation = '';
  currentPage = 1;
  loadContracts();
}

/* ==================== 编辑 ==================== */

// 内存中缓存已加载的合同列表，用于快速定位编辑目标
const contractCache = new Map();

/**
 * 处理编辑按钮点击
 * @param {number} id - 合同 ID
 */
async function handleEdit(id) {
  // 优先从缓存读取；若缓存无数据则从 DOM 重建（备用）
  const rows = document.querySelectorAll(`[data-id="${id}"]`);
  if (rows.length === 0) return;

  // 从表格行反向提取数据（避免额外 GET 请求）
  const tr = rows[0].closest('tr');
  const cells = tr.querySelectorAll('td');

  const contract = {
    id,
    name: cells[1].textContent,
    id_card: cells[2].textContent,
    phone: cells[3].textContent,
    land_location: cells[4].getAttribute('title') || cells[4].textContent,
    area: parseFloat(cells[5].textContent),
    year: parseInt(cells[6].textContent, 10),
    remark: cells[7].textContent === '-' ? '' : (cells[7].getAttribute('title') || ''),
  };

  openModal(contract);
}

/* ==================== 删除 ==================== */

/** 待删除的合同 ID */
let pendingDeleteId = null;

/**
 * 弹出删除确认对话框
 * @param {number} id - 合同 ID
 * @param {string} name - 承包人姓名（用于确认提示）
 */
function handleDelete(id, name) {
  pendingDeleteId = id;
  const msg = document.getElementById('deleteConfirmMsg');
  if (msg) msg.textContent = `确定要删除承包人「${name}」的土地承包明细记录吗？此操作不可撤销。`;
  const dialog = document.getElementById('deleteDialog');
  if (dialog) {
    dialog.classList.add('show');
    document.body.classList.add('modal-open');
  }
}

/**
 * 取消删除
 */
function cancelDelete() {
  pendingDeleteId = null;
  const dialog = document.getElementById('deleteDialog');
  if (dialog) {
    dialog.classList.remove('show');
    document.body.classList.remove('modal-open');
  }
}

/**
 * 确认执行删除
 */
async function confirmDelete() {
  if (pendingDeleteId === null) return;
  const id = pendingDeleteId;
  cancelDelete();

  showLoading();
  try {
    const res = await apiDeleteContract(id);
    showToast(res.message || '删除成功', 'success');
    // 若当前页只剩一条记录且不是第一页，自动跳回上一页
    const rows = document.querySelectorAll('#contractTableBody tr');
    if (rows.length === 1 && currentPage > 1) {
      currentPage--;
    }
    await loadContracts();
  } catch (err) {
    showToast(err.message || '删除失败，请稍后重试', 'error');
  } finally {
    hideLoading();
  }
}
