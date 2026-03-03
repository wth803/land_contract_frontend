/**
 * validation.js - 表单验证模块
 * 前端验证规则与后端保持一致
 */

/**
 * 验证承包人姓名（非空）
 * @param {string} value
 * @returns {string|null} 错误信息或 null
 */
function validateName(value) {
  if (!value || value.trim() === '') return '承包人姓名不能为空';
  return null;
}

/**
 * 验证身份证号（18位，末位可为 X/x）
 * @param {string} value
 * @returns {string|null} 错误信息或 null
 */
function validateIdCard(value) {
  if (!value || value.trim() === '') return '身份证号不能为空';
  if (!/^\d{17}[\dXx]$/.test(value.trim())) return '身份证号格式不正确（18位，末位可为X）';
  return null;
}

/**
 * 验证联系电话（11位纯数字）
 * @param {string} value
 * @returns {string|null} 错误信息或 null
 */
function validatePhone(value) {
  if (!value || value.trim() === '') return '联系电话不能为空';
  if (!/^\d{11}$/.test(value.trim())) return '联系电话格式不正确（11位纯数字）';
  return null;
}

/**
 * 验证地块位置（非空）
 * @param {string} value
 * @returns {string|null} 错误信息或 null
 */
function validateLandLocation(value) {
  if (!value || value.trim() === '') return '地块位置不能为空';
  return null;
}

/**
 * 验证承包面积（大于0的浮点数）
 * @param {string|number} value
 * @returns {string|null} 错误信息或 null
 */
function validateArea(value) {
  if (value === '' || value === null || value === undefined) return '承包面积不能为空';
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return '承包面积必须大于 0';
  return null;
}

/**
 * 验证承包年份（1949~2100 的整数）
 * @param {string|number} value
 * @returns {string|null} 错误信息或 null
 */
function validateYear(value) {
  if (value === '' || value === null || value === undefined) return '承包年份不能为空';
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1949 || num > 2100) return '承包年份须在 1949 ~ 2100 之间';
  return null;
}

/**
 * 对整个表单进行验证
 * @param {Object} data - 表单数据对象（字段名与数据模型一致）
 * @returns {{ valid: boolean, errors: Object }} 验证结果及各字段错误信息
 */
function validateContractForm(data) {
  const errors = {};

  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;

  const idCardErr = validateIdCard(data.id_card);
  if (idCardErr) errors.id_card = idCardErr;

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const locationErr = validateLandLocation(data.land_location);
  if (locationErr) errors.land_location = locationErr;

  const areaErr = validateArea(data.area);
  if (areaErr) errors.area = areaErr;

  const yearErr = validateYear(data.year);
  if (yearErr) errors.year = yearErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
