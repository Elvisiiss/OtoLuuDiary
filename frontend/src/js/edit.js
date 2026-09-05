/* =================================================
   编辑页逻辑（edit.html）
   支持两种模式：
     - 新增：URL 无 id 参数
     - 修改：URL 带 ?id=xxx，先加载再修改
   ================================================= */

(function () {
    'use strict';

    // 当前编辑的日记（修改模式下加载后存这里）
    let currentId = null;
    let isEditMode = false;

    // ========== 工具 ==========
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
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
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('show'), 2200);
    }
    function getQueryParam(name) {
        const params = new URLSearchParams(location.search);
        return params.get(name);
    }
    /** 解析标签输入框（支持逗号、空格、中文逗号分隔） */
    function parseTagsInput(str) {
        if (!str) return [];
        return str.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    }

    // ========== 表单操作 ==========

    function setFormValue(diary) {
        document.getElementById('title').value = diary.title || '';
        document.getElementById('content').value = diary.content || '';
        document.getElementById('weather').value = diary.weather || '';
        document.getElementById('mood').value = diary.mood || '';
        document.getElementById('tags').value = (diary.tags || []).join(', ');
    }

    function getFormValue() {
        return {
            title:   document.getElementById('title').value.trim(),
            content: document.getElementById('content').value,
            weather: document.getElementById('weather').value.trim() || null,
            mood:    document.getElementById('mood').value.trim() || null,
            tags:    parseTagsInput(document.getElementById('tags').value)
        };
    }

    function validate(data) {
        if (!data.title)   return '标题不能为空';
        if (!data.content || !data.content.trim()) return '正文不能为空';
        return null;
    }

    // ========== 加载（修改模式） ==========

    async function loadDiary(id) {
        const resp = await window.DiaryApi.getById(id);
        if (resp.success && resp.data) {
            currentId = id;
            setFormValue(resp.data);
            document.getElementById('pageTitle').textContent = '编辑日记';
            document.getElementById('saveBtn').textContent = '保存修改';
        } else {
            toast(resp.message || '加载失败，日记可能已被删除', 'error');
            // 切回新增模式
            isEditMode = false;
            currentId = null;
        }
    }

    // ========== 保存 ==========

    async function onSave() {
        const data = getFormValue();
        const err = validate(data);
        if (err) {
            toast(err, 'error');
            return;
        }
        const btn = document.getElementById('saveBtn');
        btn.disabled = true;
        btn.textContent = '保存中...';

        let resp;
        if (isEditMode && currentId) {
            resp = await window.DiaryApi.update(currentId, data);
        } else {
            resp = await window.DiaryApi.create(data);
        }

        btn.disabled = false;

        if (resp.success) {
            toast(isEditMode ? '修改成功' : '创建成功', 'success');
            // 保存成功后返回列表页
            setTimeout(() => { location.href = 'index.html'; }, 600);
        } else {
            btn.textContent = isEditMode ? '保存修改' : '保存';
            toast(resp.message || '保存失败', 'error');
        }
    }

    // ========== 启动 ==========

    document.addEventListener('DOMContentLoaded', function () {
        const id = getQueryParam('id');
        if (id) {
            isEditMode = true;
            loadDiary(id);
        } else {
            isEditMode = false;
            document.getElementById('pageTitle').textContent = '写新日记';
            document.getElementById('saveBtn').textContent = '保存';
        }

        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', function () {
            location.href = 'index.html';
        });

        // 保存按钮
        document.getElementById('saveBtn').addEventListener('click', onSave);

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', function () {
            if (confirm('确定取消吗？未保存的内容将会丢失。')) {
                location.href = 'index.html';
            }
        });
    });

})();
