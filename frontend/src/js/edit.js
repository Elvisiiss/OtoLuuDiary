/* =================================================
   编辑页逻辑（edit.html）
   全屏沉浸式编辑 + 底部工具面板 + 侧边信息卡片
   ================================================= */

(function () {
    'use strict';

    // ========== 状态 ==========
    var currentId = null;
    var isEditMode = false;
    var quill = null;
    var importanceVal = 0;
    var weatherVal = '';   // 当前选中天气
    var viewMode = 'scroll';  // 'scroll' | 'page'
    var currentPage = 1;
    var totalPages = 1;
    var pageHeight = 0;
    var bgImage = '';  // 当前背景图URL

    // ========== 工具函数 ==========
    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function toast(msg, type) {
        type = type || 'info';
        var el = document.querySelector('.toast');
        if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
        el.className = 'toast ' + type; el.textContent = msg;
        void el.offsetWidth; el.classList.add('show');
        clearTimeout(el._timer);
        el._timer = setTimeout(function(){ el.classList.remove('show'); }, 2200);
    }
    function getQueryParam(n) { return new URLSearchParams(location.search).get(n); }
    function parseTagsInput(s) {
        if (!s) return [];
        return s.split(/[,，\s]+/).map(function(x){ return x.trim(); }).filter(Boolean);
    }

    // ========== 日期工具 ==========
    function getDefaultDiaryDate() {
        var now = new Date(), d = new Date(now);
        if (now.getHours() < 4) d.setDate(d.getDate() - 1);
        d.setHours(0,0,0,0); return d;
    }
    function formatDateForInput(d) {
        var pad = function(n){ return n<10?'0'+n:''+n; };
        return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    }
    function dateStrToTimestamp(s) {
        if (!s) return null;
        var p = s.split('-');
        return new Date(+p[0],+p[1]-1,+p[2],0,0,0,0).getTime();
    }
    function timestampToDateStr(ts) {
        if (!ts) return '';
        return formatDateForInput(new Date(ts));
    }

    // ========== Quill 初始化 ==========
    function initQuill() {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: { toolbar: '#editorToolbar' },
            placeholder: '开始写下今天的思绪...'
        });
    }

    // ========== 底部面板 ==========
    function initBottomDock() {
        var dock = document.getElementById('bottomDock');
        var handle = document.getElementById('dockHandle');

        // 拉手点击展开/收起
        handle.addEventListener('click', function() {
            dock.classList.toggle('open');
        });

        // Tab 切换
        var tabs = document.querySelectorAll('.dock-tab');
        var contents = document.querySelectorAll('.dock-content');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var target = tab.getAttribute('data-tab');
                tabs.forEach(function(t){ t.classList.remove('active'); });
                contents.forEach(function(c){ c.classList.remove('active'); });
                tab.classList.add('active');
                document.querySelector('.dock-content[data-tab="'+target+'"]').classList.add('active');
            });
        });

        // 格式按钮
        initFormatButtons();

        // 背景面板
        initBgPanel();

        // 翻页面板
        initPageMode();
    }

    // ========== 格式控制 ==========
    function initFormatButtons() {
        // 简单格式按钮（bold, italic, underline, strike, blockquote, code-block, clean）
        document.querySelectorAll('.fmt-btn[data-cmd]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var cmd = btn.getAttribute('data-cmd');
                var val = btn.getAttribute('data-val');

                if (cmd === 'clean') {
                    quill.removeFormat(quill.getSelection(true));
                    return;
                }
                if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline' || cmd === 'strike') {
                    var current = quill.getFormat()[cmd];
                    quill.format(cmd, !current);
                    btn.classList.toggle('active', !current);
                    return;
                }
                if (cmd === 'blockquote' || cmd === 'code-block') {
                    var current = quill.getFormat()[cmd];
                    quill.format(cmd, !current);
                    btn.classList.toggle('active', !current);
                    return;
                }
                if (cmd === 'header') {
                    var current = quill.getFormat().header;
                    var newVal = (current == (val || null)) ? false : (val || false);
                    quill.format('header', newVal);
                    // 更新 header 按钮状态
                    document.querySelectorAll('.fmt-btn[data-cmd="header"]').forEach(function(h) {
                        h.classList.toggle('active', h.getAttribute('data-val') == (newVal || ''));
                    });
                    return;
                }
                if (cmd === 'size') {
                    quill.format('size', val || false);
                    document.querySelectorAll('.fmt-btn[data-cmd="size"]').forEach(function(s) {
                        s.classList.toggle('active', s.getAttribute('data-val') === (val || ''));
                    });
                    return;
                }
                if (cmd === 'list') {
                    var current = quill.getFormat().list;
                    quill.format('list', current === val ? false : val);
                    return;
                }
            });
        });

        // 颜色应用
        document.getElementById('applyTextColor').addEventListener('click', function() {
            var color = document.getElementById('textColor').value;
            quill.format('color', color);
        });
        document.getElementById('applyBgColor').addEventListener('click', function() {
            var color = document.getElementById('bgColor').value;
            quill.format('background', color);
        });

        // 图片/视频插入
        document.getElementById('insertImageBtn').addEventListener('click', function() {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            input.click();
            input.onchange = function() {
                if (input.files && input.files[0]) uploadAndInsert(input.files[0], 'image');
            };
        });
        document.getElementById('insertVideoBtn').addEventListener('click', function() {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'video/*';
            input.click();
            input.onchange = function() {
                if (input.files && input.files[0]) uploadAndInsert(input.files[0], 'video');
            };
        });

        // 监听选区变化，更新按钮高亮
        quill.on('selection-change', function(range) {
            if (!range) return;
            var fmt = quill.getFormat(range);
            document.querySelector('.fmt-btn[data-cmd="bold"]').classList.toggle('active', !!fmt.bold);
            document.querySelector('.fmt-btn[data-cmd="italic"]').classList.toggle('active', !!fmt.italic);
            document.querySelector('.fmt-btn[data-cmd="underline"]').classList.toggle('active', !!fmt.underline);
            document.querySelector('.fmt-btn[data-cmd="strike"]').classList.toggle('active', !!fmt.strike);
            document.querySelector('.fmt-btn[data-cmd="blockquote"]').classList.toggle('active', !!fmt.blockquote);
            document.querySelector('.fmt-btn[data-cmd="code-block"]').classList.toggle('active', !!fmt['code-block']);
        });
    }

    async function uploadAndInsert(file, type) {
        var maxSize = type === 'video' ? 100*1024*1024 : 10*1024*1024;
        if (file.size > maxSize) { toast('文件过大', 'error'); return; }
        var form = new FormData();
        form.append('file', file);
        form.append('diaryId', currentId || 'temp');
        try {
            var resp = await window.DiaryApi.uploadMedia(form);
            if (resp.success && resp.data) {
                var url = '/api/uploads/' + resp.data.filePath;
                var range = quill.getSelection(true);
                quill.insertEmbed(range.index, type === 'video' ? 'video' : 'image', url);
                quill.setSelection(range.index + 1);
                toast('插入成功', 'success');
            } else {
                toast(resp.message || '上传失败', 'error');
            }
        } catch(e) { toast('上传出错', 'error'); }
    }

    // ========== 背景面板 ==========
    function initBgPanel() {
        var presets = document.querySelectorAll('.bg-preset');
        presets.forEach(function(el) {
            el.addEventListener('click', function() {
                var bg = el.getAttribute('data-bg');
                applyEditorBg(bg, '');
                presets.forEach(function(p){ p.classList.remove('active'); });
                el.classList.add('active');
            });
        });

        document.getElementById('applyBgImage').addEventListener('click', function() {
            if (viewMode === 'scroll') { toast('滚动模式不支持自定义背景图', 'error'); return; }
            var url = document.getElementById('bgImageUrl').value.trim();
            if (url) applyEditorBg('', url);
        });

        document.getElementById('clearBg').addEventListener('click', function() {
            applyEditorBg('#ffffff', '');
            presets.forEach(function(p){ p.classList.remove('active'); });
            document.getElementById('bgImageUrl').value = '';
        });
    }

    function applyEditorBg(color, imageUrl) {
        var editor = document.querySelector('.editor-area');
        var qlEditor = document.querySelector('.editor-area .ql-editor');
        if (color) {
            editor.style.background = color;
            qlEditor.style.background = color;
            bgImage = '';
        }
        if (imageUrl) {
            editor.style.background = 'url('+imageUrl+') center/cover no-repeat';
            qlEditor.style.background = 'transparent';
            bgImage = imageUrl;
        }
    }

    // ========== 翻页模式 ==========
    function initPageMode() {
        document.getElementById('modeScroll').addEventListener('click', function() { setViewMode('scroll'); });
        document.getElementById('modePage').addEventListener('click', function() { setViewMode('page'); });
        document.getElementById('pagePrev').addEventListener('click', function() { goToPage(currentPage - 1); });
        document.getElementById('pageNext').addEventListener('click', function() { goToPage(currentPage + 1); });

        // 键盘翻页
        document.addEventListener('keydown', function(e) {
            if (viewMode !== 'page') return;
            if (e.key === 'PageDown') { e.preventDefault(); goToPage(currentPage + 1); }
            if (e.key === 'PageUp') { e.preventDefault(); goToPage(currentPage - 1); }
        });
    }

    function setViewMode(mode) {
        viewMode = mode;
        var area = document.querySelector('.editor-area');
        var indicator = document.getElementById('pageIndicator');
        var scrollBtn = document.getElementById('modeScroll');
        var pageBtn = document.getElementById('modePage');
        var bgNote = document.getElementById('bgScrollNote');

        scrollBtn.classList.toggle('active', mode === 'scroll');
        pageBtn.classList.toggle('active', mode === 'page');

        if (mode === 'page') {
            area.classList.add('page-mode');
            indicator.style.display = 'flex';
            if (bgImage) { applyEditorBg('', bgImage); } // 保持背景
            recalcPages();
        } else {
            area.classList.remove('page-mode');
            indicator.style.display = 'none';
            var qlEditor = document.querySelector('.editor-area .ql-editor');
            qlEditor.style.transform = '';
            // 滚动模式下如果有背景图则清除
            if (bgImage) {
                applyEditorBg('#ffffff', '');
                toast('已切换到滚动模式，自定义背景已清除', 'info');
            }
        }
        bgNote.style.display = (mode === 'scroll') ? 'block' : 'none';
    }

    function recalcPages() {
        var qlEditor = document.querySelector('.editor-area .ql-editor');
        var area = document.querySelector('.editor-area');
        pageHeight = area.clientHeight - 20; // 减去上下间距
        var contentH = qlEditor.scrollHeight;
        totalPages = Math.max(1, Math.ceil(contentH / pageHeight));
        if (currentPage > totalPages) currentPage = totalPages;
        updatePageDisplay();
    }

    function goToPage(p) {
        if (p < 1 || p > totalPages) return;
        currentPage = p;
        updatePageDisplay();
    }

    function updatePageDisplay() {
        var qlEditor = document.querySelector('.editor-area .ql-editor');
        qlEditor.style.transform = 'translateY(-' + ((currentPage - 1) * pageHeight) + 'px)';
        document.getElementById('pageNum').textContent = currentPage + ' / ' + totalPages;
    }

    // ========== 侧边信息卡片（倾斜插入效果）==========
    function initSideCard() {
        var card = document.getElementById('sideCard');

        // 点击露出的角 → 飞出展开
        card.addEventListener('click', function(e) {
            if (card.classList.contains('peek')) {
                e.stopPropagation();
                openCard();
            }
        });

        // 点击卡片以外任意地方 → 收起
        document.addEventListener('click', function(e) {
            if (card.classList.contains('open') && !card.contains(e.target)) {
                closeCard();
            }
        });

        // 初始状态：露出角（倾斜插在右侧）
        card.classList.add('peek');
    }

    function openCard() {
        var card = document.getElementById('sideCard');
        card.classList.remove('peek');
        // 强制重排以触发过渡动画
        void card.offsetWidth;
        card.classList.add('open');
    }

    function closeCard() {
        var card = document.getElementById('sideCard');
        card.classList.remove('open');
        void card.offsetWidth;
        card.classList.add('peek');
    }

    function shakeTitle() {
        var input = document.getElementById('title');
        input.classList.add('error');
        input.focus();
        setTimeout(function(){ input.classList.remove('error'); }, 800);
    }

    // ========== 重要度 ==========
    function setImportance(val) {
        importanceVal = val;
        document.querySelectorAll('#importancePicker .star').forEach(function(s) {
            s.classList.toggle('active', +s.getAttribute('data-val') <= val);
        });
    }

    // ========== 天气选择 ==========
    function setWeather(val) {
        weatherVal = val || '';
        document.querySelectorAll('#weatherPicker img').forEach(function(img) {
            img.classList.toggle('active', img.getAttribute('data-val') === weatherVal);
        });
    }

    // ========== 表单数据 ==========
    function getFormValue() {
        var dateStr = document.getElementById('diaryDate').value;
        return {
            title:           document.getElementById('title').value.trim(),
            content:         quill.root.innerHTML,
            weather:         weatherVal || null,
            mood:            document.getElementById('mood').value.trim() || null,
            tags:            parseTagsInput(document.getElementById('tags').value),
            importance:      importanceVal || null,
            location:        document.getElementById('location').value.trim() || null,
            backgroundImage: bgImage || document.getElementById('bgImageUrl').value.trim() || null,
            diaryDate:       dateStrToTimestamp(dateStr)
        };
    }

    function setFormValue(diary) {
        document.getElementById('title').value = diary.title || '';
        setWeather(diary.weather || '');
        document.getElementById('mood').value = diary.mood || '';
        document.getElementById('tags').value = (diary.tags || []).join(', ');
        document.getElementById('location').value = diary.location || '';
        if (diary.diaryDate || diary.createdAt) {
            document.getElementById('diaryDate').value = timestampToDateStr(diary.diaryDate || diary.createdAt);
        }
        setImportance(diary.importance || 0);
        if (diary.content) quill.root.innerHTML = diary.content;
        if (diary.backgroundImage) {
            bgImage = diary.backgroundImage;
            document.getElementById('bgImageUrl').value = bgImage;
            applyEditorBg('', bgImage);
        }
    }

    function validate(data) {
        if (!data.title) return '标题不能为空';
        if (!quill.getText().trim()) return '正文不能为空';
        return null;
    }

    // ========== 加载日记 ==========
    async function loadDiary(id) {
        var resp = await window.DiaryApi.getById(id);
        if (resp.success && resp.data) {
            currentId = id;
            setFormValue(resp.data);
            document.getElementById('pageTitle').textContent = '编辑日记';
        } else {
            toast(resp.message || '加载失败', 'error');
            isEditMode = false; currentId = null;
        }
    }

    // ========== 保存 ==========
    async function onSave() {
        var data = getFormValue();

        // 标题为空 → 弹出卡片 + 闪烁
        if (!data.title) {
            openCard();
            shakeTitle();
            toast('请填写日记标题', 'error');
            return;
        }

        var err = validate(data);
        if (err) { toast(err, 'error'); return; }

        var btn = document.getElementById('saveBtn');
        var btnCard = document.getElementById('saveBtnCard');
        btn.disabled = true; btn.textContent = '保存中...';
        btnCard.disabled = true; btnCard.textContent = '保存中...';

        var resp;
        if (isEditMode && currentId) {
            resp = await window.DiaryApi.update(currentId, data);
        } else {
            resp = await window.DiaryApi.create(data);
        }

        btn.disabled = false; btn.textContent = '保存';
        btnCard.disabled = false; btnCard.textContent = '保存';

        if (resp.success) {
            toast(isEditMode ? '修改成功' : '创建成功', 'success');
            setTimeout(function(){ location.href = 'index.html'; }, 600);
        } else {
            toast(resp.message || '保存失败', 'error');
        }
    }

    // ========== 启动 ==========
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.AuthApi || !window.AuthApi.isLoggedIn()) {
            location.href = 'login.html'; return;
        }

        // 标记 editing 模式（用于 CSS 控制 html/body 无滚动）
        document.documentElement.classList.add('editing');

        initQuill();
        initBottomDock();
        initSideCard();

        // 重要度
        document.querySelectorAll('#importancePicker .star').forEach(function(star) {
            star.addEventListener('click', function() {
                var v = +star.getAttribute('data-val');
                setImportance(v === importanceVal ? 0 : v);
            });
        });
        document.getElementById('importanceClear').addEventListener('click', function() { setImportance(0); });

        // 天气图标选择
        document.querySelectorAll('#weatherPicker img').forEach(function(img) {
            img.addEventListener('click', function() {
                var v = img.getAttribute('data-val');
                setWeather(v === weatherVal ? '' : v);
            });
        });

        // 模式检测
        var id = getQueryParam('id');
        if (id) {
            isEditMode = true;
            loadDiary(id);
        } else {
            isEditMode = false;
            document.getElementById('pageTitle').textContent = '写新日记';
            document.getElementById('diaryDate').value = formatDateForInput(getDefaultDiaryDate());
        }

        // 保存按钮（顶栏 + 卡片内）
        document.getElementById('saveBtn').addEventListener('click', onSave);
        document.getElementById('saveBtnCard').addEventListener('click', onSave);
        document.getElementById('backBtn').addEventListener('click', function() { location.href = 'index.html'; });
        document.getElementById('cancelBtn').addEventListener('click', function() {
            if (confirm('确定取消吗？未保存的内容将会丢失。')) location.href = 'index.html';
        });

        // 窗口大小变化时重算翻页
        window.addEventListener('resize', function() {
            if (viewMode === 'page') recalcPages();
        });
    });

})();
