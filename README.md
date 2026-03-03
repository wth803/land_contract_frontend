# 土地承包明细管理系统 - 前端

一个响应式的土地承包明细管理网站前端，使用原生 HTML、CSS 和 JavaScript 实现，对接后端 FastAPI RESTful API，实现土地承包信息的增删改查。

---

## 功能特性

- **列表展示**：分页展示所有土地承包明细，支持序号、承包人姓名、身份证号、联系电话、地块位置、承包面积、承包年份、备注和操作列
- **模糊搜索**：支持按承包人姓名和地块位置进行模糊搜索，搜索结果同样支持分页
- **新增记录**：通过模态框表单新增土地承包明细
- **编辑记录**：点击"编辑"按钮，模态框自动填充现有数据，支持修改
- **删除记录**：点击"删除"按钮，弹出确认对话框，确认后删除
- **表单验证**：前端验证规则与后端 Pydantic 规则完全一致，支持实时字段验证
- **Toast 通知**：操作成功/失败时显示 success / error / warning / info 四种类型通知
- **Loading 动画**：数据加载时显示全屏加载遮罩
- **响应式设计**：适配桌面端、平板和手机，移动端表格横向滚动，模态框全屏显示
- **XSS 防护**：所有用户输入内容经过 HTML 转义后再插入 DOM
- **绿色农业主题**：使用 CSS 变量定义的绿色配色方案

---

## 文件结构

```
land_contract_frontend/
├── index.html              # 主页面，包含所有 HTML 结构（单页应用）
├── css/
│   └── style.css           # 所有样式，包含 CSS 变量主题色、响应式设计
├── js/
│   ├── api.js              # API 调用封装（fetch 请求，基础 URL 配置）
│   ├── app.js              # 主应用逻辑（初始化、事件绑定）
│   ├── contracts.js        # 合同列表、搜索、分页相关逻辑
│   ├── modal.js            # 模态框相关逻辑（打开、关闭、表单填充、提交）
│   ├── validation.js       # 表单验证逻辑（与后端 Pydantic 规则一致）
│   └── utils.js            # 工具函数（Toast 通知、Loading、HTML 转义等）
└── README.md               # 本文档
```

---

## 如何运行

### 前提条件

1. 确保后端 FastAPI 服务已启动，默认监听 `http://localhost:8000`
2. 后端项目地址：[wth803/land_contract_backend](https://github.com/wth803/land_contract_backend)

### 启动前端

前端为纯静态文件，无需构建步骤，有多种方式可以运行：

**方式一：使用 VS Code Live Server 插件**
1. 安装 VS Code 的 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件
2. 右键点击 `index.html`，选择「Open with Live Server」

**方式二：使用 Python HTTP 服务器**
```bash
# Python 3
cd land_contract_frontend
python -m http.server 5500
# 访问 http://localhost:5500
```

**方式三：使用 Node.js serve**
```bash
npx serve .
# 访问终端提示的地址
```

**方式四：直接打开文件（不推荐）**
- 直接在浏览器中打开 `index.html`
- 注意：由于浏览器跨域策略，直接打开文件时 API 请求可能因 CORS 失败，建议使用上述 HTTP 服务器方式

---

## 如何配置后端地址

打开 `js/api.js`，修改文件顶部的 `API_BASE_URL` 常量：

```javascript
// 修改为你的后端实际地址
const API_BASE_URL = 'http://localhost:8000';
```

例如，若后端部署在远程服务器：
```javascript
const API_BASE_URL = 'https://your-backend-server.com';
```

---

## 后端 API 接口

| 方法   | 路径                       | 功能                     |
|--------|----------------------------|--------------------------|
| GET    | `/api/contracts`           | 获取列表（分页）         |
| GET    | `/api/contracts/search`    | 模糊搜索（分页）         |
| POST   | `/api/contracts`           | 创建新记录               |
| PUT    | `/api/contracts/{id}`      | 更新记录（部分更新）     |
| DELETE | `/api/contracts/{id}`      | 删除记录                 |
| GET    | `/`                        | 健康检查                 |

---

## 表单验证规则

| 字段       | 规则                                      |
|------------|-------------------------------------------|
| 承包人姓名 | 不能为空                                  |
| 身份证号   | 18位，前17位数字，最后一位数字或 X/x     |
| 联系电话   | 11位纯数字                                |
| 地块位置   | 不能为空                                  |
| 承包面积   | 大于 0 的数值                             |
| 承包年份   | 1949 ~ 2100 之间的整数                    |
| 备注       | 选填，无限制                              |

---

## 技术栈

- **HTML5**：语义化标签，无障碍访问属性（`role`、`aria-*`）
- **CSS3**：CSS 变量、Flexbox 布局、Grid 布局、媒体查询、动画
- **JavaScript ES6+**：`async/await`、`fetch` API、模块化设计
- **无任何第三方框架或库**

---

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge 等）的最新版本。