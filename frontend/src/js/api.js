/* =================================================
   后端 API 调用封装（所有接口统一通过这里调用）
   后端地址默认：http://localhost:8080/api
   ================================================= */

const API_BASE = 'http://localhost:8080/api';

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
    if (options.body && typeof options.body !== 'string') {
        finalOpts.body = JSON.stringify(options.body);
    }

    try {
        const resp = await fetch(url, finalOpts);
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
window.DiaryApi = DiaryApi;
