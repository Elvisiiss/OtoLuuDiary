/* =================================================
   后端 API 调用封装
   - 自动附加 Token
   - 401 自动跳转登录页
   - Token 存储在 localStorage
   ================================================= */

var API_BASE = 'http://localhost:8080/api';
var TOKEN_KEY = 'otoluudiary_token';

async function request(path, options) {
    options = options || {};
    var url = API_BASE + path;
    var headers = { 'Content-Type': 'application/json' };

    // 自动附加 Token
    var token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    var fetchOpts = {
        method: options.method || 'GET',
        headers: headers
    };
    if (options.body) {
        fetchOpts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    try {
        var resp = await fetch(url, fetchOpts);

        // 401 → 跳转登录页
        if (resp.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            if (!location.href.includes('login.html') && !location.href.includes('register.html')) {
                location.href = 'login.html';
            }
            return { success: false, message: '未登录或 Token 已过期，请重新登录', data: null };
        }

        if (!resp.ok) {
            var text = await resp.text().catch(function() { return ''; });
            return { success: false, message: '请求失败（HTTP ' + resp.status + '）' + (text ? ': ' + text : ''), data: null };
        }
        return await resp.json();
    } catch (e) {
        console.error('[API 网络错误]', path, e);
        return { success: false, message: '无法连接后端服务，请确认后端是否已启动。错误：' + e.message, data: null };
    }
}

// ============ 认证接口 ============

var AuthApi = {
    /** 注册：手机号 + 密码 + 昵称 */
    register: async function(phone, password, nickname) {
        var resp = await request('/user/register', {
            method: 'POST',
            body: { phone: phone, password: password, nickname: nickname || '' }
        });
        if (resp.success && resp.data && resp.data.token) {
            localStorage.setItem(TOKEN_KEY, resp.data.token);
        }
        return resp;
    },

    /** 登录：手机号 + 密码 */
    login: async function(phone, password) {
        var resp = await request('/auth/login', {
            method: 'POST',
            body: { phone: phone, password: password }
        });
        if (resp.success && resp.data && resp.data.token) {
            localStorage.setItem(TOKEN_KEY, resp.data.token);
        }
        return resp;
    },

    /** 登出 */
    logout: async function() {
        await request('/auth/logout', { method: 'POST' });
        localStorage.removeItem(TOKEN_KEY);
    },

    /** 检查登录状态 */
    check: function() {
        return request('/auth/check', { method: 'GET' });
    },

    /** 获取当前用户信息 */
    getUserInfo: function() {
        return request('/user/info', { method: 'GET' });
    },

    /** 获取本地 Token */
    getToken: function() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /** 是否已登录 */
    isLoggedIn: function() {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};

// ============ 日记接口 ============

var DiaryApi = {
    listAll: function() { return request('/diaries', { method: 'GET' }); },
    getById: function(id) { return request('/diaries/' + encodeURIComponent(id), { method: 'GET' }); },
    create: function(body) { return request('/diaries', { method: 'POST', body: body }); },
    update: function(id, body) { return request('/diaries/' + encodeURIComponent(id), { method: 'PUT', body: body }); },
    remove: function(id) { return request('/diaries/' + encodeURIComponent(id), { method: 'DELETE' }); },
    search: function(keyword) {
        var q = keyword ? ('?keyword=' + encodeURIComponent(keyword)) : '';
        return request('/diaries/search' + q, { method: 'GET' });
    },
    filterByTag: function(tag) {
        var q = tag ? ('?tag=' + encodeURIComponent(tag)) : '';
        return request('/diaries/tag' + q, { method: 'GET' });
    },
    allTags: function() { return request('/tags', { method: 'GET' }); }
};

window.AuthApi = AuthApi;
window.DiaryApi = DiaryApi;
