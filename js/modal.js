/**
 * modal.js - 模态框逻辑模块
 * 负责添加/编辑模态框的打开、关闭、表单填充和提交
 */

// 当前编辑的合同 ID（null 表示新增模式）
let editingContractId = null;

// 表单字段的 DOM ID 与 API 字段名的映射
const FIELD_MAP = [
    { domId: 'field-name', apiField: 'name' },
    { domId: 'field-id-card', apiField: 'id_card' },
    { domId: 'field-phone', apiField: 'phone' },
    { domId: 'field-land-location', apiField: 'land_location' },
    { domId: 'field-area', apiField: 'area' },
    { domId: 'field-year', apiField: 'year' },
    { domId: 'field-village', apiField: 'village' },
    { domId: 'field-contractor-code', apiField: 'contractor_code' },
    { domId: 'field-plot-code', apiField: 'plot_code' },
    { domId: 'field-bank-account', apiField: 'bank_account' },
    { domId: 'field-remark', apiField: 'remark' },
];

/**
 * 打开模态框
 * @param {object|null} contract - 编辑时传入合同对象；新增时传 null
 */
function openModal(contract = null) {
    const modal = document.getElementById('contract-modal');
    const modalTitle = document.getElementById('modal-title');
    if (!modal) return;

    // 清空表单和错误提示
    resetForm();

    if (contract) {
        // 编辑模式：填充现有数据
        editingContractId = contract.id;
        modalTitle.textContent = '编辑土地承包明细';
        fillForm(contract);
    } else {
        // 新增模式
        editingContractId = null;
        modalTitle.textContent = '新增土地承包明细';
    }

    // 显示模态框
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // 聚焦到第一个输入框，提升可访问性
    setTimeout(() => {
        const firstInput = document.getElementById('field-name');
        if (firstInput) firstInput.focus();
    }, 100);
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modal = document.getElementById('contract-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    editingContractId = null;
    resetForm();
}

/**
 * 用合同数据填充表单
 * @param {object} contract - 合同数据对象
 */
function fillForm(contract) {
    for (const { domId, apiField } of FIELD_MAP) {
        const el = document.getElementById(domId);
        if (el) {
            el.value = contract[apiField] ?? '';
        }
    }
}

/**
 * 重置表单（清空所有字段和错误提示）
 */
function resetForm() {
    const form = document.getElementById('contract-form');
    if (form) form.reset();

    // 清除所有字段错误提示
    const fieldIds = FIELD_MAP.map((f) => f.domId);
    clearAllErrors(fieldIds);
}

/**
 * 从表单读取数据，构建 API 请求体
 * @returns {object} 合同数据对象
 */
function getFormData() {
    const data = {};
    for (const { domId, apiField } of FIELD_MAP) {
        const el = document.getElementById(domId);
        if (el) {
            data[apiField] = el.value.trim();
        }
    }
    // 将数值字段转为数字类型
    if (data.area !== '') data.area = parseFloat(data.area);
    if (data.year !== '') data.year = parseInt(data.year, 10);
    // 备注为空时设为 null
    if (data.remark === '') data.remark = null;
    // 银行卡号为空时设为 null
    if (data.bank_account === '') data.bank_account = null;
    return data;
}

/**
 * 提交表单（新增或编辑）
 * 由 app.js 中的表单提交事件调用
 */
async function submitForm() {
    const formData = getFormData();

    // 前端验证
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
        // 显示所有字段错误
        for (const { domId, apiField } of FIELD_MAP) {
            showFieldError(domId, errors[apiField] || null);
        }
        return;
    }

    // 清除所有错误提示
    for (const { domId } of FIELD_MAP) {
        showFieldError(domId, null);
    }

    // 禁用提交按钮防止重复提交
    const submitBtn = document.getElementById('modal-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    try {
        if (editingContractId !== null) {
            // 编辑模式
            await updateContract(editingContractId, formData);
            showToast('土地承包明细已成功更新', 'success');
        } else {
            // 新增模式
            await createContract(formData);
            showToast('土地承包明细已成功添加', 'success');
        }

        closeModal();
        // 刷新列表
        await loadContracts();
    } catch (error) {
        const message = parseErrorMessage(error);
        showToast(message, 'error');

        // 尝试将后端 422 错误映射到对应字段
        if (error.status === 422 && Array.isArray(error.data?.detail)) {
            mapBackendErrors(error.data.detail);
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/**
 * 将后端 422 验证错误映射到表单字段
 * @param {Array} details - 后端错误详情数组
 */
function mapBackendErrors(details) {
    const fieldMapping = {
        name: 'field-name',
        id_card: 'field-id-card',
        phone: 'field-phone',
        land_location: 'field-land-location',
        area: 'field-area',
        year: 'field-year',
        village: 'field-village',
        contractor_code: 'field-contractor-code',
        plot_code: 'field-plot-code',
        bank_account: 'field-bank-account',
        remark: 'field-remark',
    };

    for (const detail of details) {
        const fieldName = detail.loc && detail.loc[detail.loc.length - 1];
        const domId = fieldMapping[fieldName];
        if (domId && detail.msg) {
            showFieldError(domId, detail.msg);
        }
    }
}

/**
 * 初始化模态框事件监听
 * 在 DOM 加载完成后由 app.js 调用
 */
function initModal() {
    const modal = document.getElementById('contract-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const form = document.getElementById('contract-form');

    // 点击关闭按钮
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // 点击模态框背景关闭
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // 表单提交事件
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitForm();
        });
    }

    // 绑定各字段的实时验证
    bindFieldValidation('field-name', 'name');
    bindFieldValidation('field-id-card', 'id_card');
    bindFieldValidation('field-phone', 'phone');
    bindFieldValidation('field-land-location', 'land_location');
    bindFieldValidation('field-area', 'area');
    bindFieldValidation('field-year', 'year');
    bindFieldValidation('field-village', 'village');
    bindFieldValidation('field-contractor-code', 'contractor_code');
    bindFieldValidation('field-plot-code', 'plot_code');
    bindFieldValidation('field-bank-account', 'bank_account');

    // Escape 键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}
