/**
 * app.js - 应用初始化与事件绑定
 * 页面加载完成后执行初始化逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  // 初始加载合同列表
  loadContracts();

  /* ==================== 表格事件委托（编辑/删除按钮） ==================== */
  document.getElementById('contractTableBody').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === 'edit') {
      handleEdit(id);
    } else if (btn.dataset.action === 'delete') {
      handleDelete(id, btn.dataset.name || '');
    }
  });

  /* ==================== 搜索区域事件 ==================== */

  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('resetBtn').addEventListener('click', handleSearchReset);

  // 按下 Enter 键也触发搜索
  document.getElementById('searchName').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });
  document.getElementById('searchLocation').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });

  /* ==================== 添加按钮 ==================== */

  document.getElementById('addBtn').addEventListener('click', () => openModal(null));

  /* ==================== 模态框事件 ==================== */

  // 关闭按钮
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);

  // 提交按钮
  document.getElementById('submitBtn').addEventListener('click', handleFormSubmit);

  // 点击遮罩层关闭模态框
  document.getElementById('contractModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // 表单内按 Enter 提交（textarea 除外）
  document.getElementById('contractForm').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleFormSubmit();
    }
  });

  // 输入时清除对应字段的错误提示
  document.querySelectorAll('#contractForm .form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorId = input.dataset.errorTarget;
      if (errorId) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = '';
      }
    });
  });

  /* ==================== 删除确认对话框事件 ==================== */

  document.getElementById('deleteCancelBtn').addEventListener('click', cancelDelete);
  document.getElementById('deleteConfirmBtn').addEventListener('click', confirmDelete);

  // 点击遮罩层关闭删除对话框
  document.getElementById('deleteDialog').addEventListener('click', e => {
    if (e.target === e.currentTarget) cancelDelete();
  });

  /* ==================== 键盘可访问性：Esc 关闭弹窗 ==================== */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('contractModal');
      const deleteDialog = document.getElementById('deleteDialog');
      if (modal.classList.contains('show')) closeModal();
      if (deleteDialog.classList.contains('show')) cancelDelete();
    }
  });
});
