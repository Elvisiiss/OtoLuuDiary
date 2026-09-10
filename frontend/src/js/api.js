/* =================================================
   后端 API 调用封装（所有接口统一通过这里调用）
   后端地址默认：http://localhost:8080/api

   功能：
   - 自动在请求头中附加 Token（Authorization: Bearer xxx）
   - Token 存储在 localStorage 中
   - 遇到 401 自动跳转到登录页
   ================================================= */

const API_BASE = 'http://localhost:8080/api';

const TOKEN_KEY = 'otoluudiary_token';

/**
 * 通用请求函数：内部使用 fetch，自动解析返回的统一结构
 * 返回 Promise<{success, message, data}>
 */
async function request(path, options = {}) {
    const url = API_BASE + path;
    const defaultOpts = {
        headers: { 'Content-Type': 'application/json' }
    };
    // 合并请求配置
    const finalOpts = Object.assign({}, defaultOpts, options);

    // 自动附加 Token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        finalOpts.headers['Authorization'] = 'Bearer ' + token;
    }

    if (options.body && typeof options.body !== 'string') {
        finalOpts.body = JSON.stringify(options.body);
    }

    try {
        const resp = await fetch(url, finalOpts);

        // 401 未授权 → 跳转登录页
        if (resp.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            // 如果当前不在登录页，才跳转
            if (!location.href.includes('login.html')) {
                location.href = 'login.html';
            }
            return {
                success: false,
                message: '未登录或 Token 已过期，请重新登录',
                data: null
            };
        }

        if (!resp.ok) {
            // HTTP 状态错误（如 404、500 等）
            const text = await resp.text().catch(() => '');
            return {
                success: false,
                message: '请求失败（HTTP ' + resp.status + '）' + (text ? ': ' + text : ''),
                data: null
            };
        }
        const json = await resp.json();
        return json;
    } catch (e) {
        // 网络错误（比如后端没启动）
        console.error('[API 网络错误]', path, e);
        return {
            success: false,
            message: '无法连接后端服务，请确认后端是否已启动（地址：' + API_BASE + '）。错误：' + e.message,
            data: null
        };
    }
}

// ============ 认证接口 ============

const AuthApi = {

    /** 登录：返回 {token} */
    login: async function (password) {
        const resp = await request('/auth/login', {
            method: 'POST',
            body: { password: password }
        });
        if (resp.success && resp.data && resp.data.token) {
            localStorage.setItem(TOKEN_KEY, resp.data.token);
        }
        return resp;
    },

    /** 登出 */
    logout: async function () {
        await request('/auth/logout', { method: 'POST' });
        localStorage.removeItem(TOKEN_KEY);
    },

    /** 检查登录状态 */
    check: function () {
        return request('/auth/check', { method: 'GET' });
    },

    /** 获取本地存储的 Token */
    getToken: function () {
        return localStorage.getItem(TOKEN_KEY);
    },

    /** 判断是否已登录（本地有 Token） */
    isLoggedIn: function () {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};

// ============ 具体业务接口 ============

const DiaryApi = {

    /** 全部日记列表 */
    listAll: () => request('/diaries', { method: 'GET' }),

    /** 单条详情 */
    getById: (id) => request('/diaries/' + encodeURIComponent(id), { method: 'GET' }),

    /** 新增：body = {title, content, tags[], weather, mood} */
    create: (body) => request('/diaries', { method: 'POST', body }),

    /** 修改：body 为需要修改的字段 */
    update: (id, body) => request('/diaries/' + encodeURIComponent(id), { method: 'PUT', body }),

    /** 删除 */
    remove: (id) => request('/diaries/' + encodeURIComponent(id), { method: 'DELETE' }),

    /** 关键词搜索 */
    search: (keyword) => {
        const q = keyword ? ('?keyword=' + encodeURIComponent(keyword)) : '';
        return request('/diaries/search' + q, { method: 'GET' });
    },

    /** 按标签筛选 */
    filterByTag: (tag) => {
        const q = tag ? ('?tag=' + encodeURIComponent(tag)) : '';
        return request('/diaries/tag' + q, { method: 'GET' });
    },

    /** 全部标签列表 */
    allTags: () => request('/tags', { method: 'GET' })
};

// 暴露给渲染进程（页面 js）使用
window.AuthApi = AuthApi;
window.DiaryApi = DiaryApi;
