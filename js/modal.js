/**
 * modal.js - 模态框管理模块
 * 负责添加/编辑模态框的打开、关闭、表单填充与错误提示
 */

// 当前正在编辑的合同 ID（null 表示新增模式）
let currentEditId = null;

/**
 * 打开模态框
 * @param {Object|null} contract - 合同数据（编辑模式时传入，新增时传 null）
 */
function openModal(contract = null) {
  currentEditId = contract ? contract.id : null;
  const modal = document.getElementById('contractModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('contractForm');

  // 重置表单及错误提示
  form.reset();
  clearFormErrors();

  if (contract) {
    // 编辑模式：填充现有数据
    title.textContent = '编辑土地承包明细';
    document.getElementById('fieldName').value = contract.name || '';
    document.getElementById('fieldIdCard').value = contract.id_card || '';
    document.getElementById('fieldPhone').value = contract.phone || '';
    document.getElementById('fieldLandLocation').value = contract.land_location || '';
    document.getElementById('fieldArea').value = contract.area !== undefined ? contract.area : '';
    document.getElementById('fieldYear').value = contract.year !== undefined ? contract.year : '';
    document.getElementById('fieldRemark').value = contract.remark || '';
  } else {
    // 新增模式
    title.textContent = '添加土地承包明细';
  }

  modal.classList.add('show');
  document.body.classList.add('modal-open');
  // 聚焦第一个输入框，提升可访问性
  document.getElementById('fieldName').focus();
}

/**
 * 关闭模态框
 */
function closeModal() {
  const modal = document.getElementById('contractModal');
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
  currentEditId = null;
}

// 字段名到输入框 ID 及错误提示 ID 的映射表
const FIELD_ID_MAP = {
  name:          { inputId: 'fieldName',         errorId: 'errorName' },
  id_card:       { inputId: 'fieldIdCard',        errorId: 'errorIdCard' },
  phone:         { inputId: 'fieldPhone',         errorId: 'errorPhone' },
  land_location: { inputId: 'fieldLandLocation',  errorId: 'errorLandLocation' },
  area:          { inputId: 'fieldArea',          errorId: 'errorArea' },
  year:          { inputId: 'fieldYear',          errorId: 'errorYear' },
};

/**
 * 清除所有表单字段的错误提示
 */
function clearFormErrors() {
  Object.values(FIELD_ID_MAP).forEach(({ inputId, errorId }) => {
    const el = document.getElementById(errorId);
    if (el) el.textContent = '';
    const inp = document.getElementById(inputId);
    if (inp) inp.classList.remove('error');
  });
}

/**
 * 在表单字段上显示错误提示
 * @param {Object} errors - 字段名到错误信息的映射
 */
function showFormErrors(errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const mapping = FIELD_ID_MAP[field];
    if (!mapping) return;
    const errorEl = document.getElementById(mapping.errorId);
    const inputEl = document.getElementById(mapping.inputId);
    if (errorEl) errorEl.textContent = msg;
    if (inputEl) inputEl.classList.add('error');
  });
}

/**
 * 收集表单数据
 * @returns {Object} 表单数据对象
 */
function getFormData() {
  return {
    name: document.getElementById('fieldName').value.trim(),
    id_card: document.getElementById('fieldIdCard').value.trim(),
    phone: document.getElementById('fieldPhone').value.trim(),
    land_location: document.getElementById('fieldLandLocation').value.trim(),
    area: document.getElementById('fieldArea').value,
    year: document.getElementById('fieldYear').value,
    remark: document.getElementById('fieldRemark').value.trim(),
  };
}

/**
 * 处理表单提交（新增/编辑）
 */
async function handleFormSubmit() {
  clearFormErrors();
  const data = getFormData();

  // 前端验证
  const { valid, errors } = validateContractForm(data);
  if (!valid) {
    showFormErrors(errors);
    return;
  }

  // 构建提交 payload，数值类型转换
  const payload = {
    name: data.name,
    id_card: data.id_card,
    phone: data.phone,
    land_location: data.land_location,
    area: parseFloat(data.area),
    year: parseInt(data.year, 10),
    remark: data.remark || null,
  };

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  showLoading();

  try {
    if (currentEditId !== null) {
      await apiUpdateContract(currentEditId, payload);
      showToast('土地承包明细更新成功', 'success');
    } else {
      await apiCreateContract(payload);
      showToast('土地承包明细添加成功', 'success');
    }
    closeModal();
    // 提交成功后刷新列表
    await loadContracts();
  } catch (err) {
    showToast(err.message || '操作失败，请稍后重试', 'error');
    // 若后端返回 422 字段级错误，也展示在表单上
    if (err.status === 422 && err.data && Array.isArray(err.data.detail)) {
      const backendErrors = {};
      err.data.detail.forEach(e => {
        const field = e.loc[e.loc.length - 1];
        backendErrors[field] = e.msg;
      });
      showFormErrors(backendErrors);
    }
  } finally {
    submitBtn.disabled = false;
    hideLoading();
  }
}
