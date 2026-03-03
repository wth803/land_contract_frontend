/**
 * api.js - 后端 API 封装模块
 * 基础路径：http://localhost:8000
 * 所有请求均使用 fetch API，统一处理错误响应
 */

const BASE_URL = 'http://localhost:8000';

/**
 * 统一请求方法，处理 HTTP 错误和 JSON 解析
 * @param {string} url - 请求路径
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<any>} 解析后的响应数据
 */
async function request(url, options = {}) {
  const response = await fetch(BASE_URL + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // 提取后端返回的错误信息
    let message = `请求失败（${response.status}）`;
    if (data) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail.map(e => e.msg).join('；');
      }
    }
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ==================== 合同相关 API ==================== */

/**
 * 获取土地承包明细列表（分页）
 * @param {number} page - 页码，默认 1
 * @param {number} pageSize - 每页条数，默认 10
 * @returns {Promise<{total: number, items: Array, page: number, page_size: number}>}
 */
function apiGetContracts(page = 1, pageSize = 10) {
  return request(`/api/contracts?page=${page}&page_size=${pageSize}`);
}

/**
 * 通过姓名和/或地块位置模糊搜索
 * @param {string} name - 承包人姓名（可选）
 * @param {string} landLocation - 地块位置（可选）
 * @param {number} page - 页码，默认 1
 * @param {number} pageSize - 每页条数，默认 10
 * @returns {Promise<{total: number, items: Array, page: number, page_size: number}>}
 */
function apiSearchContracts(name, landLocation, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (name) params.append('name', name);
  if (landLocation) params.append('land_location', landLocation);
  return request(`/api/contracts/search?${params.toString()}`);
}

/**
 * 创建新的土地承包明细
 * @param {Object} payload - 合同数据
 * @returns {Promise<Object>} 创建的合同对象
 */
function apiCreateContract(payload) {
  return request('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 更新现有的土地承包明细（部分更新）
 * @param {number} id - 合同 ID
 * @param {Object} payload - 需要更新的字段
 * @returns {Promise<Object>} 更新后的合同对象
 */
function apiUpdateContract(id, payload) {
  return request(`/api/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * 删除特定的土地承包明细
 * @param {number} id - 合同 ID
 * @returns {Promise<{message: string}>} 删除结果消息
 */
function apiDeleteContract(id) {
  return request(`/api/contracts/${id}`, { method: 'DELETE' });
}
