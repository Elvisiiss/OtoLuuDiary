/* =================================================
   列表页逻辑（index.html）
   ================================================= */

(function () {
    'use strict';

    // 当前筛选状态
    const state = {
        keyword: '',
        tag: ''
    };

    // ========== 工具函数 ==========

    /** 时间戳 → 日期字符串（仅日期，不显示时间） */
    function formatDate(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        const pad = n => n.toString().padStart(2, '0');
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    /** 弹出提示 */
    function toast(msg, type) {
        type = type || 'info';
        let el = document.querySelector('.toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast';
            document.body.appendChild(el);
        }
        el.className = 'toast ' + type;
        el.textContent = msg;
        // 触发重排后显示
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('show'), 2200);
    }

    /** 纯文本预览（截取前 300 字） */
    function previewContent(text, maxLen) {
        maxLen = maxLen || 260;
        if (!text) return '';
        // 去掉多余空白
        const t = text.replace(/\s+/g, ' ').trim();
        return t.length > maxLen ? t.substring(0, maxLen) + '……' : t;
    }

    // ========== 渲染函数 ==========

    function renderDiaryList(list) {
        const container = document.getElementById('diaryList');
        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="big-icon">📝</div>
                    <h3>还没有日记</h3>
                    <p>${state.keyword || state.tag ? '没有找到匹配的日记，换个关键词试试？' : '点击右上角「写日记」开始记录生活吧！'}</p>
                    <a href="edit.html" class="btn btn-primary">写第一篇日记</a>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(d => {
            const tagsHtml = (d.tags && d.tags.length)
                ? '<div class="card-tags">' + d.tags.map(t =>
                    `<span class="tag-chip">#${escapeHtml(t)}</span>`
                  ).join('') + '</div>'
                : '';
            const meta = [];
            meta.push(`<span class="meta-time">${formatDate(d.diaryDate || d.createdAt)}</span>`);
            if (d.weather) meta.push(`<span class="meta-weather">${escapeHtml(d.weather)}</span>`);
            if (d.mood)    meta.push(`<span class="meta-mood">${escapeHtml(d.mood)}</span>`);

            return `
                <div class="diary-card" data-id="${d.id}">
                    <div class="card-header">
                        <div class="card-title">${escapeHtml(d.title || '(无标题)')}</div>
                        <div class="card-actions">
                            <a class="btn btn-default" href="edit.html?id=${encodeURIComponent(d.id)}">编辑</a>
                            <button class="btn btn-danger btn-del" data-id="${d.id}">删除</button>
                        </div>
                    </div>
                    <div class="card-meta">${meta.join('')}</div>
                    <div class="card-content">${escapeHtml(previewContent(d.content))}</div>
                    ${tagsHtml}
                </div>
            `;
        }).join('');

        // 绑定卡片点击（点击卡片跳到编辑页查看）
        container.querySelectorAll('.diary-card').forEach(card => {
            card.addEventListener('click', function (e) {
                // 如果点击的是按钮或链接，不触发跳转
                if (e.target.closest('.card-actions')) return;
                const id = card.getAttribute('data-id');
                location.href = 'edit.html?id=' + encodeURIComponent(id);
            });
        });

        // 绑定删除按钮
        container.querySelectorAll('.btn-del').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (!confirm('确定要删除这条日记吗？删除后无法恢复。')) return;
                const resp = await window.DiaryApi.remove(id);
                if (resp.success) {
                    toast('删除成功', 'success');
                    loadData();   // 重新加载列表
                    loadTags();   // 标签可能也变了
                } else {
                    toast(resp.message || '删除失败', 'error');
                }
            });
        });
    }

    function renderTagList(allTags) {
        const box = document.getElementById('tagList');
        if (!allTags || allTags.length === 0) {
            box.innerHTML = '<span style="color:#b4bacb;font-size:12px;">暂无标签</span>';
            return;
        }
        box.innerHTML = allTags.map(t => {
            const active = (state.tag === t) ? ' active' : '';
            return `<span class="tag-chip${active}" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</span>`;
        }).join('');

        // 绑定点击
        box.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                state.tag = state.tag === chip.dataset.tag ? '' : chip.dataset.tag;
                loadTags();  // 重新渲染高亮
                loadData();  // 重新加载列表
            });
        });
    }

    function renderStatus(ok, msg) {
        const el = document.getElementById('statusTip');
        if (!el) return;
        el.className = 'status-tip' + (ok ? '' : ' error');
        el.textContent = msg || '';
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ========== 数据加载 ==========

    async function loadData() {
        let resp;
        if (state.keyword) {
            resp = await window.DiaryApi.search(state.keyword);
        } else if (state.tag) {
            resp = await window.DiaryApi.filterByTag(state.tag);
        } else {
            resp = await window.DiaryApi.listAll();
        }

        if (resp.success) {
            renderStatus(true, '共 ' + (resp.data ? resp.data.length : 0) + ' 条日记'
                + (state.keyword ? '（关键词："' + state.keyword + '"）' : '')
                + (state.tag ? '（标签：#' + state.tag + '）' : ''));
            renderDiaryList(resp.data || []);
        } else {
            renderStatus(false, resp.message || '加载失败');
            renderDiaryList([]);
        }
    }

    async function loadTags() {
        const resp = await window.DiaryApi.allTags();
        if (resp.success) {
            renderTagList(resp.data || []);
        }
    }

    // ========== 事件绑定 ==========

    function bindEvents() {
        // 搜索框：输入后 300ms 延迟搜索
        const searchInput = document.getElementById('searchInput');
        let timer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(() => {
                state.keyword = searchInput.value.trim();
                loadData();
            }, 300);
        });

        // 清除标签筛选
        const clearTagEl = document.getElementById('clearTag');
        if (clearTagEl) {
            clearTagEl.addEventListener('click', function () {
                state.tag = '';
                loadTags();
                loadData();
            });
        }
    }

    // ========== 加载用户信息 ==========
    async function loadUserInfo() {
        var el = document.getElementById('userInfo');
        if (!el) return;
        var resp = await window.AuthApi.getUserInfo();
        if (resp.success && resp.data) {
            var name = resp.data.nickname || resp.data.phone;
            el.textContent = '👤 ' + escapeHtml(name);
        } else {
            el.textContent = '👤 用户';
        }
    }

    // ========== 启动 ==========
    document.addEventListener('DOMContentLoaded', function () {
        // 检查登录状态
        if (!window.AuthApi || !window.AuthApi.isLoggedIn()) {
            location.href = 'login.html';
            return;
        }

        bindEvents();
        loadTags();
        loadData();
        loadUserInfo();

        // 退出登录按钮
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function () {
                if (!confirm('确定要退出登录吗？')) return;
                await window.AuthApi.logout();
                location.href = 'login.html';
            });
        }
    });

})();
