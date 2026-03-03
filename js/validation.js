/**
 * validation.js - 表单验证逻辑模块
 * 前端验证规则与后端 Pydantic 验证规则完全一致
 */

/**
 * 验证规则定义
 * 每条规则包含：test 函数（返回 true 表示有效）、message 错误提示
 */
const VALIDATION_RULES = {
    // 承包人姓名：不能为空
    name: [
        {
            test: (v) => v.trim().length > 0,
            message: '承包人姓名不能为空',
        },
    ],

    // 身份证号：18位，前17位数字，最后一位数字或X/x
    id_card: [
        {
            test: (v) => v.trim().length > 0,
            message: '身份证号不能为空',
        },
        {
            test: (v) => /^\d{17}[\dXx]$/.test(v.trim()),
            message: '身份证号格式不正确，应为18位，前17位为数字，最后一位为数字或X',
        },
    ],

    // 联系电话：11位纯数字
    phone: [
        {
            test: (v) => v.trim().length > 0,
            message: '联系电话不能为空',
        },
        {
            test: (v) => /^\d{11}$/.test(v.trim()),
            message: '联系电话格式不正确，应为11位纯数字',
        },
    ],

    // 地块位置：不能为空
    land_location: [
        {
            test: (v) => v.trim().length > 0,
            message: '地块位置不能为空',
        },
    ],

    // 承包面积：大于0的浮点数
    area: [
        {
            test: (v) => v.trim().length > 0,
            message: '承包面积不能为空',
        },
        {
            test: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
            message: '承包面积必须是大于0的数值',
        },
    ],

    // 承包年份：1949~2100 之间的整数
    year: [
        {
            test: (v) => v.trim().length > 0,
            message: '承包年份不能为空',
        },
        {
            test: (v) => {
                const num = parseInt(v, 10);
                return Number.isInteger(num) && num >= 1949 && num <= 2100;
            },
            message: '承包年份必须在 1949 到 2100 之间',
        },
    ],

    // 村别：不能为空，最多 50 个字符
    village: [
        {
            test: (v) => v.trim().length > 0,
            message: '村别不能为空',
        },
        {
            test: (v) => v.trim().length <= 50,
            message: '村别最多 50 个字符',
        },
    ],

    // 承包方编码：不能为空，最多 30 个字符
    contractor_code: [
        {
            test: (v) => v.trim().length > 0,
            message: '承包方编码不能为空',
        },
        {
            test: (v) => v.trim().length <= 30,
            message: '承包方编码最多 30 个字符',
        },
    ],

    // 地块编码：不能为空，最多 30 个字符
    plot_code: [
        {
            test: (v) => v.trim().length > 0,
            message: '地块编码不能为空',
        },
        {
            test: (v) => v.trim().length <= 30,
            message: '地块编码最多 30 个字符',
        },
    ],

    // 银行卡号：可选，长度在 10-25 位之间
    bank_account: [
        {
            test: (v) => { const t = v.trim(); return t.length === 0 || (t.length >= 10 && t.length <= 25); },
            message: '银行卡号长度应在 10 到 25 位之间',
        },
    ],
};

/**
 * 验证单个字段
 * @param {string} field - 字段名
 * @param {string} value - 字段值
 * @returns {string|null} 错误消息，如果验证通过则返回 null
 */
function validateField(field, value) {
    const rules = VALIDATION_RULES[field];
    if (!rules) return null;

    for (const rule of rules) {
        if (!rule.test(value)) {
            return rule.message;
        }
    }
    return null;
}

/**
 * 验证整个表单
 * @param {object} formData - 表单数据对象
 * @returns {object} 包含每个字段错误信息的对象（为空则验证通过）
 */
function validateForm(formData) {
    const errors = {};
    const fields = ['name', 'id_card', 'phone', 'land_location', 'area', 'year', 'village', 'contractor_code', 'plot_code', 'bank_account'];

    for (const field of fields) {
        const value = String(formData[field] ?? '');
        const error = validateField(field, value);
        if (error) {
            errors[field] = error;
        }
    }

    return errors;
}

/**
 * 在表单字段下方显示/清除错误提示
 * @param {string} fieldId - 字段的 DOM ID
 * @param {string|null} message - 错误消息，null 表示清除错误
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // 移除旧的错误提示
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    if (message) {
        // 添加错误样式
        field.classList.add('input-error');
        // 创建错误提示元素
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        field.parentElement.appendChild(errorEl);
    } else {
        // 清除错误样式
        field.classList.remove('input-error');
    }
}

/**
 * 清除表单所有字段的错误提示
 * @param {string[]} fieldIds - 字段 DOM ID 列表
 */
function clearAllErrors(fieldIds) {
    for (const id of fieldIds) {
        showFieldError(id, null);
    }
}

/**
 * 实时验证：为表单字段绑定 blur 事件，失焦时验证
 * @param {string} fieldId - 字段的 DOM ID
 * @param {string} fieldName - 对应的验证规则字段名
 */
function bindFieldValidation(fieldId, fieldName) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.addEventListener('blur', () => {
        const error = validateField(fieldName, field.value);
        showFieldError(fieldId, error);
    });

    field.addEventListener('input', () => {
        // 用户输入时清除错误提示（减少干扰）
        if (field.classList.contains('input-error')) {
            const error = validateField(fieldName, field.value);
            if (!error) showFieldError(fieldId, null);
        }
    });
}
