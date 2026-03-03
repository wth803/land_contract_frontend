# 土地承包明细管理系统 · 前端

响应式土地承包明细管理网站，原生 HTML5 / CSS3 / ES6+ 实现，对接 FastAPI 后端 REST API。

## 功能特性

- 📋 **数据列表**：分页展示土地承包明细（序号、姓名、身份证号、电话、地块、面积、年份、备注、操作）
- 🔍 **模糊搜索**：按承包人姓名和/或地块位置模糊查询，支持 Enter 键快速触发
- ➕ **新增/✏️ 编辑**：模态框表单，编辑时自动填充现有数据，提交后刷新列表
- 🗑️ **删除确认**：二次确认对话框，防止误操作
- ✅ **前端验证**：与后端规则一致（姓名非空、身份证 18 位、电话 11 位纯数字、面积 > 0、年份 1949～2100）
- 📱 **响应式**：桌面 / 平板 / 手机三端自适应布局
- 🌿 **绿色主题**：CSS 变量定义农业主题色系
- ⚡ **用户体验**：Loading 动画、Toast 通知、空数据提示、Esc/遮罩层关闭弹窗

## 文件结构

```
land_contract_frontend/
├── index.html              # SPA 主页面
├── css/
│   └── style.css           # 绿色农业主题样式（含 CSS 变量、响应式）
├── js/
│   ├── utils.js            # Toast、Loading、格式化、XSS 防护
│   ├── api.js              # fetch API 封装（BASE_URL: http://localhost:8000）
│   ├── validation.js       # 表单前端验证（与后端规则一致）
│   ├── modal.js            # 添加/编辑模态框管理
│   ├── contracts.js        # 列表渲染、搜索、分页、删除
│   └── app.js              # 初始化与事件绑定
└── README.md
```

## 快速开始

### 前置条件

确保后端服务已启动并监听 `http://localhost:8000`。后端项目地址：[wth803/land_contract_backend](https://github.com/wth803/land_contract_backend)

### 运行前端

使用任意 HTTP 静态文件服务器即可，例如：

```bash
# Python 3
python -m http.server 3000

# Node.js（需先安装 serve）
npx serve .

# VS Code 插件：Live Server
# 右键 index.html → Open with Live Server
```

打开浏览器访问 `http://localhost:3000`（端口号以实际为准）。

> ⚠️ 请勿直接以 `file://` 协议打开 `index.html`，否则跨域请求将被浏览器阻止。

## 后端 API

| 方法   | 路径                    | 功能                         |
|--------|-------------------------|------------------------------|
| GET    | `/api/contracts`        | 获取列表（分页）             |
| GET    | `/api/contracts/search` | 姓名 / 地块位置模糊搜索       |
| POST   | `/api/contracts`        | 创建新明细                   |
| PUT    | `/api/contracts/{id}`   | 更新明细（部分更新）         |
| DELETE | `/api/contracts/{id}`   | 删除明细                     |

## 数据字段说明

| 字段            | 类型   | 必填 | 说明                         |
|-----------------|--------|------|------------------------------|
| `name`          | string | ✅   | 承包人姓名                   |
| `id_card`       | string | ✅   | 身份证号（18 位，末位可为 X） |
| `phone`         | string | ✅   | 联系电话（11 位纯数字）       |
| `land_location` | string | ✅   | 地块位置                     |
| `area`          | float  | ✅   | 承包面积（亩，大于 0）        |
| `year`          | int    | ✅   | 承包年份（1949 ～ 2100）      |
| `remark`        | string | ❌   | 备注                         |

## 技术栈

- **HTML5** — 语义化标签，无障碍属性（ARIA）
- **CSS3** — Flexbox / Grid 布局，CSS 变量，媒体查询
- **ES6+ JavaScript** — 原生 fetch、async/await、模块化组织
- 无任何第三方框架或库依赖