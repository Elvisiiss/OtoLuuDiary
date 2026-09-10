/* =================================================
   编辑页逻辑（edit.html）
   支持两种模式：
     - 新增：URL 无 id 参数
     - 修改：URL 带 ?id=xxx，先加载再修改
   ================================================= */

(function () {
    'use strict';

    let currentId = null;
    let isEditMode = false;
    let quill = null;        // Quill 编辑器实例
    let importanceVal = 0;   // 当前重要度 0-5

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
    function parseTagsInput(str) {
        if (!str) return [];
        return str.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    }

    // ========== 日期工具 ==========
    function getDefaultDiaryDate() {
        var now = new Date();
        var d = new Date(now);
        if (now.getHours() < 4) {
            d.setDate(d.getDate() - 1);
        }
        d.setHours(0, 0, 0, 0);
        return d;
    }
    function formatDateForInput(d) {
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function dateStrToTimestamp(dateStr) {
        if (!dateStr) return null;
        var parts = dateStr.split('-');
        var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
        return d.getTime();
    }
    function timestampToDateStr(ts) {
        if (!ts) return '';
        return formatDateForInput(new Date(ts));
    }

    // ========== 重要度选择器 ==========
    function setImportance(val) {
        importanceVal = val;
        var stars = document.querySelectorAll('#importancePicker .star');
        stars.forEach(function (s) {
            var v = parseInt(s.getAttribute('data-val'));
            s.classList.toggle('active', v <= val);
        });
    }

    // ========== Quill 编辑器 ==========
    function initQuill() {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: '#editorToolbar'
            },
            placeholder: '写下今天发生的事...'
        });

        // 自定义图片上传：点击工具栏图片按钮时，上传到服务器
        var toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', function () {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.onchange = function () {
                if (input.files && input.files[0]) {
                    uploadAndInsertImage(input.files[0]);
                }
            };
        });
    }

    /** 上传图片并插入到编辑器 */
    async function uploadAndInsertImage(file) {
        if (!file.type.startsWith('image/')) {
            toast('仅支持图片文件', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast('图片不能超过 10MB', 'error');
            return;
        }
        var form = new FormData();
        form.append('file', file);
        // 临时 diaryId（新建时还没有ID，用 new 标记）
        var diaryId = currentId || 'temp';
        form.append('diaryId', diaryId);

        try {
            var resp = await window.DiaryApi.uploadMedia(form);
            if (resp.success && resp.data) {
                var url = '/api/uploads/' + resp.data.filePath;
                var range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', url);
                quill.setSelection(range.index + 1);
            } else {
                toast(resp.message || '上传失败', 'error');
            }
        } catch (e) {
            toast('上传出错', 'error');
        }
    }

    // ========== 媒体上传区 ==========
    function initUploadZone() {
        var zone = document.getElementById('uploadZone');
        var input = document.getElementById('fileInput');

        zone.addEventListener('click', function () {
            input.click();
        });

        // 拖拽
        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        zone.addEventListener('dragleave', function () {
            zone.classList.remove('dragover');
        });
        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        });

        input.addEventListener('change', function () {
            if (input.files.length) {
                handleFiles(input.files);
            }
        });
    }

    async function handleFiles(files) {
        for (var i = 0; i < files.length; i++) {
            await uploadFile(files[i]);
        }
    }

    async function uploadFile(file) {
        var isImage = file.type.startsWith('image/');
        var isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
            toast('仅支持图片和视频', 'error');
            return;
        }
        var max = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > max) {
            toast('文件过大（图片≤10MB，视频≤100MB）', 'error');
            return;
        }

        var form = new FormData();
        form.append('file', file);
        form.append('diaryId', currentId || 'temp');

        try {
            var resp = await window.DiaryApi.uploadMedia(form);
            if (resp.success && resp.data) {
                addUploadItem(resp.data);
                // 同时插入到编辑器
                var url = '/api/uploads/' + resp.data.filePath;
                if (isImage) {
                    var range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1);
                } else {
                    var range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'video', url);
                    quill.setSelection(range.index + 1);
                }
                toast('上传成功', 'success');
            } else {
                toast(resp.message || '上传失败', 'error');
            }
        } catch (e) {
            toast('上传出错', 'error');
        }
    }

    function addUploadItem(media) {
        var list = document.getElementById('uploadList');
        var isImage = media.fileType && media.fileType.startsWith('image/');
        var item = document.createElement('div');
        item.className = 'upload-item';
        if (isImage) {
            item.innerHTML = '<img src="/api/uploads/' + media.filePath + '" alt="' + escapeHtml(media.fileName) + '">'
                + '<span class="upload-name">' + escapeHtml(media.fileName) + '</span>';
        } else {
            item.innerHTML = '<span class="upload-video-icon">🎬</span>'
                + '<span class="upload-name">' + escapeHtml(media.fileName) + '</span>';
        }
        list.appendChild(item);
    }

    // ========== 表单操作 ==========
    function setFormValue(diary) {
        document.getElementById('title').value = diary.title || '';
        document.getElementById('weather').value = diary.weather || '';
        document.getElementById('mood').value = diary.mood || '';
        document.getElementById('tags').value = (diary.tags || []).join(', ');
        document.getElementById('location').value = diary.location || '';
        document.getElementById('backgroundImage').value = diary.backgroundImage || '';
        if (diary.diaryDate || diary.createdAt) {
            document.getElementById('diaryDate').value = timestampToDateStr(diary.diaryDate || diary.createdAt);
        }
        // 重要度
        setImportance(diary.importance || 0);
        // 富文本内容（HTML）
        if (diary.content) {
            quill.root.innerHTML = diary.content;
        }
    }

    function getFormValue() {
        var dateStr = document.getElementById('diaryDate').value;
        return {
            title:           document.getElementById('title').value.trim(),
            content:         quill.root.innerHTML,
            weather:         document.getElementById('weather').value.trim() || null,
            mood:            document.getElementById('mood').value.trim() || null,
            tags:            parseTagsInput(document.getElementById('tags').value),
            importance:      importanceVal || null,
            location:        document.getElementById('location').value.trim() || null,
            backgroundImage: document.getElementById('backgroundImage').value.trim() || null,
            diaryDate:       dateStrToTimestamp(dateStr)
        };
    }

    function validate(data) {
        if (!data.title)   return '标题不能为空';
        // Quill 空内容是 <p><br></p>
        var text = quill.getText().trim();
        if (!text) return '正文不能为空';
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
            // 加载已有的媒体文件
            loadMediaList(id);
        } else {
            toast(resp.message || '加载失败，日记可能已被删除', 'error');
            isEditMode = false;
            currentId = null;
        }
    }

    async function loadMediaList(diaryId) {
        try {
            var resp = await window.DiaryApi.listMedia(diaryId);
            if (resp.success && resp.data) {
                resp.data.forEach(function (m) { addUploadItem(m); });
            }
        } catch (e) {
            // 忽略
        }
    }

    // ========== 保存 ==========
    async function onSave() {
        var data = getFormValue();
        var err = validate(data);
        if (err) {
            toast(err, 'error');
            return;
        }
        var btn = document.getElementById('saveBtn');
        btn.disabled = true;
        btn.textContent = '保存中...';

        var resp;
        if (isEditMode && currentId) {
            resp = await window.DiaryApi.update(currentId, data);
        } else {
            resp = await window.DiaryApi.create(data);
        }

        btn.disabled = false;

        if (resp.success) {
            toast(isEditMode ? '修改成功' : '创建成功', 'success');
            setTimeout(function () { location.href = 'index.html'; }, 600);
        } else {
            btn.textContent = isEditMode ? '保存修改' : '保存';
            toast(resp.message || '保存失败', 'error');
        }
    }

    // ========== 启动 ==========
    document.addEventListener('DOMContentLoaded', function () {
        if (!window.AuthApi || !window.AuthApi.isLoggedIn()) {
            location.href = 'login.html';
            return;
        }

        // 初始化 Quill
        initQuill();

        // 初始化重要度选择器
        document.querySelectorAll('#importancePicker .star').forEach(function (star) {
            star.addEventListener('click', function () {
                var val = parseInt(star.getAttribute('data-val'));
                setImportance(val === importanceVal ? 0 : val);  // 再次点击取消
            });
        });
        document.getElementById('importanceClear').addEventListener('click', function () {
            setImportance(0);
        });

        // 初始化上传区
        initUploadZone();

        var id = getQueryParam('id');
        if (id) {
            isEditMode = true;
            loadDiary(id);
        } else {
            isEditMode = false;
            document.getElementById('pageTitle').textContent = '写新日记';
            document.getElementById('saveBtn').textContent = '保存';
            document.getElementById('diaryDate').value = formatDateForInput(getDefaultDiaryDate());
        }

        document.getElementById('backBtn').addEventListener('click', function () {
            location.href = 'index.html';
        });
        document.getElementById('saveBtn').addEventListener('click', onSave);
        document.getElementById('cancelBtn').addEventListener('click', function () {
            if (confirm('确定取消吗？未保存的内容将会丢失。')) {
                location.href = 'index.html';
            }
        });
    });

})();
