/**
 * api.js - API 调用封装模块
 * 封装所有与后端 FastAPI 的通信，使用 fetch API
 */

// API 基础 URL，可根据实际部署情况修改
const API_BASE_URL = 'http://localhost:8000';

/**
 * 通用请求函数，统一处理错误
 * @param {string} url - 请求路径
 * @param {object} options - fetch 配置项
 * @returns {Promise} 响应数据
 */
async function request(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // 尝试解析 JSON 响应体
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    // 处理非 2xx 状态码
    if (!response.ok) {
        const error = new Error('请求失败');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * 获取土地承包明细列表（分页）
 * @param {number} page - 页码，默认为 1
 * @param {number} pageSize - 每页条数，默认为 10
 * @returns {Promise} 包含 total、items、page、page_size 的对象
 */
async function getContracts(page = 1, pageSize = 10) {
    return request(`/api/contracts?page=${page}&page_size=${pageSize}`);
}

/**
 * 通过姓名和土地位置模糊搜索合同
 * @param {string} name - 承包人姓名（可选）
 * @param {string} landLocation - 地块位置（可选）
 * @param {number} page - 页码，默认为 1
 * @param {number} pageSize - 每页条数，默认为 10
 * @returns {Promise} 包含 total、items、page、page_size 的对象
 */
async function searchContracts(name = '', landLocation = '', page = 1, pageSize = 10) {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (name) params.append('name', name);
    if (landLocation) params.append('land_location', landLocation);
    return request(`/api/contracts/search?${params.toString()}`);
}

/**
 * 创建新的土地承包明细
 * @param {object} contractData - 合同数据对象
 * @returns {Promise} 创建后的合同对象
 */
async function createContract(contractData) {
    return request('/api/contracts', {
        method: 'POST',
        body: JSON.stringify(contractData),
    });
}

/**
 * 更新现有的土地承包明细
 * @param {number} id - 合同 ID
 * @param {object} contractData - 更新的合同数据（部分更新）
 * @returns {Promise} 更新后的合同对象
 */
async function updateContract(id, contractData) {
    return request(`/api/contracts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contractData),
    });
}

/**
 * 删除特定的土地承包明细
 * @param {number} id - 合同 ID
 * @returns {Promise} 包含成功消息的对象
 */
async function deleteContract(id) {
    return request(`/api/contracts/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 健康检查
 * @returns {Promise} 服务状态
 */
async function healthCheck() {
    return request('/');
}

/**
 * 导出土地承包明细到 Excel
 * @param {Array<string>} columns - 要导出的列名数组
 * @param {string} searchName - 搜索条件：姓名（可选）
 * @param {string} searchLandLocation - 搜索条件：地块位置（可选）
 * @returns {Promise<Blob>} Excel 文件 Blob
 */
async function exportContracts(columns, searchName = '', searchLandLocation = '') {
    const body = {
        columns: columns,
        search_name: searchName || null,
        search_land_location: searchLandLocation || null,
    };

    const response = await fetch(`${API_BASE_URL}/api/contracts/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        // 尝试解析错误详情
        let errorMessage = '导出失败';
        try {
            const errorData = await response.json();
            if (errorData?.detail) {
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(e => e.msg || e.message || '验证错误').join('；');
                } else {
                    errorMessage = errorData.detail;
                }
            }
        } catch (e) {
            // 忽略 JSON 解析错误
        }
        throw new Error(errorMessage);
    }

    return response.blob();
}
