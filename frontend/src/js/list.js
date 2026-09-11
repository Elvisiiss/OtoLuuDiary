/* =================================================
   首页逻辑（index.html）
   四个页面：我的日记、待做清单、计划月历、日程表
   ================================================= */

(function () {
    'use strict';

    // ========== 工具函数 ==========
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function formatDate(ts) {
        if (!ts) return '';
        var d = new Date(ts);
        var pad = function(n){ return n<10?'0'+n:''+n; };
        return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    }
    function stripHtml(html) {
        if (!html) return '';
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    function previewContent(text, maxLen) {
        maxLen = maxLen || 260;
        if (!text) return '';
        var t = text.replace(/\s+/g, ' ').trim();
        return t.length > maxLen ? t.substring(0, maxLen) + '……' : t;
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
    function todayStr() {
        var d = new Date();
        var pad = function(n){ return n<10?'0'+n:''+n; };
        return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    }

    // ========== 页面切换 ==========
    function initNav() {
        document.querySelectorAll('.nav-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var page = item.getAttribute('data-page');
                // 切换导航高亮
                document.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
                item.classList.add('active');
                // 切换页面面板
                document.querySelectorAll('.page-panel').forEach(function(p){ p.classList.remove('active'); });
                if (page === 'diary')    document.getElementById('pageDiary').classList.add('active');
                if (page === 'todo')     document.getElementById('pageTodo').classList.add('active');
                if (page === 'calendar') document.getElementById('pageCalendar').classList.add('active');
                if (page === 'schedule') document.getElementById('pageSchedule').classList.add('active');
            });
        });
    }

    // =====================================================================
    //  日记
    // =====================================================================
    var diaryState = { keyword: '' };

    function renderDiaryList(list) {
        var container = document.getElementById('diaryList');
        if (!list || list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="big-icon">📝</div><h3>还没有日记</h3>'
                + '<p>' + (diaryState.keyword ? '没有找到匹配的日记' : '点击「写日记」开始记录吧！') + '</p></div>';
            return;
        }
        container.innerHTML = list.map(function(d) {
            var tagsHtml = (d.tags && d.tags.length)
                ? '<div class="card-tags">' + d.tags.map(function(t){ return '<span class="tag-chip">#'+escapeHtml(t)+'</span>'; }).join('') + '</div>'
                : '';
            var meta = [];
            meta.push('<span class="meta-time">'+formatDate(d.diaryDate || d.createdAt)+'</span>');
            if (d.importance > 0) meta.push('<span class="meta-importance">'+'★'.repeat(d.importance)+'☆'.repeat(5-d.importance)+'</span>');
            if (d.location) meta.push('<span class="meta-location">'+escapeHtml(d.location)+'</span>');
            if (d.weather) meta.push('<span class="meta-weather">'+escapeHtml(d.weather)+'</span>');
            if (d.mood) meta.push('<span class="meta-mood">'+escapeHtml(d.mood)+'</span>');
            var bgStyle = '', bgClass = '';
            if (d.backgroundImage) {
                bgStyle = ' style="background-image:url(\''+escapeHtml(d.backgroundImage)+'\');background-size:cover;background-position:center;"';
                bgClass = ' has-bg';
            }
            return '<div class="diary-card'+bgClass+'" data-id="'+d.id+'"'+bgStyle+'>'
                + '<div class="card-header"><div class="card-title">'+escapeHtml(d.title||'(无标题)')+'</div>'
                + '<div class="card-actions"><a class="btn btn-default" href="edit.html?id='+encodeURIComponent(d.id)+'">编辑</a>'
                + '<button class="btn btn-danger btn-del" data-id="'+d.id+'">删除</button></div></div>'
                + '<div class="card-meta">'+meta.join('')+'</div>'
                + '<div class="card-content">'+escapeHtml(previewContent(stripHtml(d.content)))+'</div>'
                + tagsHtml + '</div>';
        }).join('');

        container.querySelectorAll('.diary-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.card-actions')) return;
                location.href = 'edit.html?id=' + encodeURIComponent(card.getAttribute('data-id'));
            });
        });
        container.querySelectorAll('.btn-del').forEach(function(btn) {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                if (!confirm('确定要删除这条日记吗？')) return;
                var resp = await window.DiaryApi.remove(btn.getAttribute('data-id'));
                if (resp.success) { toast('删除成功', 'success'); loadDiaryData(); }
                else toast(resp.message || '删除失败', 'error');
            });
        });
    }

    async function loadDiaryData() {
        var resp;
        if (diaryState.keyword) resp = await window.DiaryApi.search(diaryState.keyword);
        else resp = await window.DiaryApi.listAll();
        var tip = document.getElementById('statusTip');
        if (resp.success) {
            var count = resp.data ? resp.data.length : 0;
            tip.textContent = '共 ' + count + ' 条日记' + (diaryState.keyword ? '（关键词："'+diaryState.keyword+'"）' : '');
            renderDiaryList(resp.data || []);
        } else {
            tip.textContent = resp.message || '加载失败';
            renderDiaryList([]);
        }
    }

    function initDiary() {
        var timer = null;
        document.getElementById('searchInput').addEventListener('input', function() {
            clearTimeout(timer);
            var self = this;
            timer = setTimeout(function(){ diaryState.keyword = self.value.trim(); loadDiaryData(); }, 300);
        });
    }

    // =====================================================================
    //  待做清单（增强版）
    // =====================================================================
    var todoFilter = 'all';
    var editingTodoId = null;
    var todoMediaFiles = [];    // 待上传的媒体文件
    var completeMediaFiles = []; // 完成时的媒体文件
    var completingTodoId = null;

    function initTodo() {
        // 筛选按钮
        document.querySelectorAll('.todo-filter').forEach(function(f) {
            f.addEventListener('click', function() {
                todoFilter = f.getAttribute('data-filter');
                document.querySelectorAll('.todo-filter').forEach(function(x){ x.classList.remove('active'); });
                f.classList.add('active');
                loadTodos();
            });
        });
        // 新增按钮
        document.getElementById('addTodoBtn').addEventListener('click', function() { openTodoModal(); });
        // 弹窗关闭
        document.getElementById('todoModalClose').addEventListener('click', closeTodoModal);
        document.getElementById('todoModalCancel').addEventListener('click', closeTodoModal);
        // 重要度选择
        document.querySelectorAll('#todoImportance .star').forEach(function(s) {
            s.addEventListener('click', function() {
                var v = +s.getAttribute('data-val');
                document.querySelectorAll('#todoImportance .star').forEach(function(x) {
                    x.classList.toggle('active', +x.getAttribute('data-val') <= v);
                });
                document.getElementById('todoImportance')._val = v;
            });
        });
        // 循环方式切换 → 显示/隐藏自定义星期和结束条件
        document.getElementById('todoRepeat').addEventListener('change', function() {
            var val = this.value;
            document.getElementById('weekdayPickerWrap').style.display = val === 'custom' ? '' : 'none';
            document.getElementById('repeatEndWrap').style.display = val ? '' : 'none';
        });
        // 自定义星期按钮
        document.querySelectorAll('#weekdayPicker .weekday-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { btn.classList.toggle('active'); });
        });
        // 循环结束类型切换
        document.getElementById('todoRepeatEndType').addEventListener('change', function() {
            var val = this.value;
            document.getElementById('todoRepeatEndCount').style.display = val === 'count' ? '' : 'none';
            document.getElementById('todoRepeatEndDate').style.display = val === 'date' ? '' : 'none';
        });
        // 媒体上传
        initUploadZone('todoUploadZone', 'todoFileInput', 'todoMediaPreview', todoMediaFiles);
        // 保存
        document.getElementById('todoModalSave').addEventListener('click', saveTodo);
        // 完成弹窗
        document.getElementById('completeModalClose').addEventListener('click', closeCompleteModal);
        document.getElementById('completeModalCancel').addEventListener('click', closeCompleteModal);
        document.getElementById('completeModalSave').addEventListener('click', saveCompletion);
        initUploadZone('completeUploadZone', 'completeFileInput', 'completeMediaPreview', completeMediaFiles);
    }

    // 通用上传区域初始化
    function initUploadZone(zoneId, inputId, previewId, fileArr) {
        var zone = document.getElementById(zoneId);
        var input = document.getElementById(inputId);
        zone.addEventListener('click', function() { input.click(); });
        input.addEventListener('change', function() {
            if (input.files) Array.from(input.files).forEach(function(f){ fileArr.push(f); });
            renderMediaPreview(previewId, fileArr);
            input.value = '';
        });
        zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
        zone.addEventListener('drop', function(e) {
            e.preventDefault(); zone.classList.remove('dragover');
            if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(function(f){ fileArr.push(f); });
            renderMediaPreview(previewId, fileArr);
        });
    }

    function renderMediaPreview(previewId, fileArr) {
        var box = document.getElementById(previewId);
        box.innerHTML = '';
        fileArr.forEach(function(f, i) {
            var item = document.createElement('div');
            item.className = 'media-preview-item';
            if (f.type && f.type.startsWith('video/')) {
                item.innerHTML = '<video src="'+URL.createObjectURL(f)+' muted></video><span class="mp-remove" data-idx="'+i+'">✕</span>';
            } else {
                item.innerHTML = '<img src="'+URL.createObjectURL(f)+'"><span class="mp-remove" data-idx="'+i+'">✕</span>';
            }
            box.appendChild(item);
        });
        box.querySelectorAll('.mp-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                fileArr.splice(+btn.getAttribute('data-idx'), 1);
                renderMediaPreview(previewId, fileArr);
            });
        });
    }

    function getRepeatConfig() {
        var type = document.getElementById('todoRepeat').value;
        if (!type) return { repeatType: null, repeatConfig: null, repeatEndType: null, repeatEndValue: null };
        var config = null;
        if (type === 'custom') {
            var days = [];
            document.querySelectorAll('#weekdayPicker .weekday-btn.active').forEach(function(b) {
                days.push(+b.getAttribute('data-day'));
            });
            config = JSON.stringify({ weekdays: days });
            type = 'custom';
        }
        var endType = document.getElementById('todoRepeatEndType').value || 'never';
        var endValue = null;
        if (endType === 'count') endValue = document.getElementById('todoRepeatEndCount').value || null;
        if (endType === 'date') endValue = document.getElementById('todoRepeatEndDate').value || null;
        return { repeatType: type, repeatConfig: config, repeatEndType: endType, repeatEndValue: endValue };
    }

    function setRepeatConfig(todo) {
        document.getElementById('todoRepeat').value = todo.repeatType || '';
        document.getElementById('weekdayPickerWrap').style.display = todo.repeatType === 'custom' ? '' : 'none';
        document.getElementById('repeatEndWrap').style.display = todo.repeatType ? '' : 'none';
        // 恢复自定义星期
        document.querySelectorAll('#weekdayPicker .weekday-btn').forEach(function(b){ b.classList.remove('active'); });
        if (todo.repeatConfig) {
            try {
                var cfg = JSON.parse(todo.repeatConfig);
                if (cfg.weekdays) cfg.weekdays.forEach(function(d) {
                    var btn = document.querySelector('#weekdayPicker .weekday-btn[data-day="'+d+'"]');
                    if (btn) btn.classList.add('active');
                });
            } catch(e) {}
        }
        // 恢复结束条件
        document.getElementById('todoRepeatEndType').value = todo.repeatEndType || 'never';
        document.getElementById('todoRepeatEndCount').style.display = todo.repeatEndType === 'count' ? '' : 'none';
        document.getElementById('todoRepeatEndDate').style.display = todo.repeatEndType === 'date' ? '' : 'none';
        document.getElementById('todoRepeatEndCount').value = todo.repeatEndValue || '';
        document.getElementById('todoRepeatEndDate').value = todo.repeatEndValue || '';
    }

    function openTodoModal(todo) {
        editingTodoId = todo ? todo.id : null;
        document.getElementById('todoModalTitle').textContent = todo ? '编辑待做' : '新增待做';
        document.getElementById('todoTitle').value = todo ? todo.title : '';
        document.getElementById('todoDesc').value = todo ? (todo.description || '') : '';
        var imp = todo ? (todo.importance || 0) : 0;
        document.querySelectorAll('#todoImportance .star').forEach(function(s) {
            s.classList.toggle('active', +s.getAttribute('data-val') <= imp);
        });
        document.getElementById('todoImportance')._val = imp;
        if (todo) setRepeatConfig(todo);
        else {
            document.getElementById('todoRepeat').value = '';
            document.getElementById('weekdayPickerWrap').style.display = 'none';
            document.getElementById('repeatEndWrap').style.display = 'none';
        }
        todoMediaFiles = [];
        document.getElementById('todoMediaPreview').innerHTML = '';
        document.getElementById('todoModal').style.display = 'flex';
    }

    function closeTodoModal() {
        document.getElementById('todoModal').style.display = 'none';
        editingTodoId = null;
    }

    async function saveTodo() {
        var title = document.getElementById('todoTitle').value.trim();
        if (!title) { toast('请输入标题', 'error'); return; }
        var rc = getRepeatConfig();
        var data = {
            title: title,
            description: document.getElementById('todoDesc').value.trim() || null,
            importance: document.getElementById('todoImportance')._val || 0,
            repeatType: rc.repeatType,
            repeatConfig: rc.repeatConfig,
            repeatEndType: rc.repeatEndType,
            repeatEndValue: rc.repeatEndValue
        };
        var resp;
        if (editingTodoId) {
            resp = await window.DiaryApi.request('/todos/' + editingTodoId, { method: 'PUT', body: data });
        } else {
            resp = await window.DiaryApi.request('/todos', { method: 'POST', body: data });
        }
        if (resp.success) {
            var todoId = resp.data ? resp.data.id : editingTodoId;
            // 上传媒体文件
            for (var i = 0; i < todoMediaFiles.length; i++) {
                var fd = new FormData();
                fd.append('file', todoMediaFiles[i]);
                await window.DiaryApi.request('/todos/' + todoId + '/media', { method: 'POST', body: fd, isFormData: true });
            }
            toast('保存成功', 'success'); closeTodoModal(); loadTodos();
        } else toast(resp.message || '保存失败', 'error');
    }

    function formatRepeatText(t) {
        if (!t.repeatType) return '';
        var names = { daily:'每天', weekday:'工作日', weekly:'每周', monthly:'每月', custom:'自定义' };
        var text = names[t.repeatType] || t.repeatType;
        if (t.repeatType === 'custom' && t.repeatConfig) {
            try {
                var cfg = JSON.parse(t.repeatConfig);
                if (cfg.weekdays && cfg.weekdays.length) {
                    var dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                    text = cfg.weekdays.map(function(d){ return dayNames[d]; }).join('、');
                }
            } catch(e) {}
        }
        if (t.repeatEndType === 'count' && t.repeatEndValue) text += ' ×' + t.repeatEndValue;
        if (t.repeatEndType === 'date' && t.repeatEndValue) text += ' 至' + t.repeatEndValue;
        return text;
    }

    function renderTodos(list) {
        var container = document.getElementById('todoList');
        if (!list || list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="big-icon">✅</div><h3>暂无待做事项</h3><p>点击「新增待做」添加吧</p></div>';
            return;
        }
        container.innerHTML = list.map(function(t) {
            var doneClass = t.done ? ' done' : '';
            var badges = '';
            if (t.importance >= 3) badges += '<span class="todo-badge important">★'.repeat(t.importance)+'</span>';
            var rptText = formatRepeatText(t);
            if (rptText) badges += '<span class="todo-badge repeat">'+escapeHtml(rptText)+'</span>';
            return '<div class="todo-item" data-id="'+t.id+'">'
                + '<div class="todo-check'+doneClass+'" data-id="'+t.id+'" data-done="'+(t.done?1:0)+'"></div>'
                + '<div style="flex:1;min-width:0;">'
                + '<div class="todo-item-title'+doneClass+'">'+escapeHtml(t.title)+'</div>'
                + (t.description ? '<div class="todo-item-desc">'+escapeHtml(t.description)+'</div>' : '')
                + '</div>'
                + badges
                + '<div class="todo-actions">'
                + '<button class="todo-complete" data-id="'+t.id+'" title="完成并记录">✅</button>'
                + '<button class="todo-edit" data-id="'+t.id+'" title="编辑">✏️</button>'
                + '<button class="todo-del" data-id="'+t.id+'" title="删除">🗑️</button>'
                + '</div></div>';
        }).join('');

        // 勾选完成（简单切换）
        container.querySelectorAll('.todo-check').forEach(function(ch) {
            ch.addEventListener('click', async function() {
                var id = ch.getAttribute('data-id');
                var done = ch.getAttribute('data-done') === '0';
                var resp = await window.DiaryApi.request('/todos/' + id + '/done', { method: 'PUT', body: { done: done } });
                if (resp.success) loadTodos();
            });
        });
        // 完成并记录
        container.querySelectorAll('.todo-complete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                openCompleteModal(btn.getAttribute('data-id'));
            });
        });
        // 编辑
        container.querySelectorAll('.todo-edit').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                var resp = await window.DiaryApi.request('/todos/' + btn.getAttribute('data-id'));
                if (resp.success && resp.data) openTodoModal(resp.data);
            });
        });
        // 删除
        container.querySelectorAll('.todo-del').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                if (!confirm('确定删除？')) return;
                var resp = await window.DiaryApi.request('/todos/' + btn.getAttribute('data-id'), { method: 'DELETE' });
                if (resp.success) { toast('已删除', 'success'); loadTodos(); }
            });
        });
    }

    async function loadTodos() {
        var url = '/todos';
        if (todoFilter === 'today') url = '/todos?filter=today';
        else if (todoFilter === 'week') url = '/todos?filter=week';
        else if (todoFilter === 'important') url = '/todos?filter=important';
        var resp = await window.DiaryApi.request(url);
        if (resp.success) renderTodos(resp.data || []);
        else renderTodos([]);
    }

    // ========== 完成弹窗 ==========
    function openCompleteModal(todoId) {
        completingTodoId = todoId;
        completeMediaFiles = [];
        document.getElementById('completeNote').value = '';
        document.getElementById('completeMediaPreview').innerHTML = '';
        document.getElementById('completeModal').style.display = 'flex';
    }
    function closeCompleteModal() {
        document.getElementById('completeModal').style.display = 'none';
        completingTodoId = null;
    }
    async function saveCompletion() {
        if (!completingTodoId) return;
        var note = document.getElementById('completeNote').value.trim();
        // 创建完成记录
        var resp = await window.DiaryApi.request('/todos/' + completingTodoId + '/completions', {
            method: 'POST', body: { note: note || null }
        });
        if (!resp.success) { toast('记录失败', 'error'); return; }
        // 标记完成
        await window.DiaryApi.request('/todos/' + completingTodoId + '/done', { method: 'PUT', body: { done: true } });
        // 上传完成时的媒体到该 todo
        for (var i = 0; i < completeMediaFiles.length; i++) {
            var fd = new FormData();
            fd.append('file', completeMediaFiles[i]);
            await window.DiaryApi.request('/todos/' + completingTodoId + '/media', { method: 'POST', body: fd, isFormData: true });
        }
        toast('已完成 ✅', 'success');
        closeCompleteModal();
        loadTodos();
    }

    // =====================================================================
    //  计划月历
    // =====================================================================
    var calYear, calMonth;

    function initCalendar() {
        var now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();
        document.getElementById('calPrev').addEventListener('click', function() { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); });
        document.getElementById('calNext').addEventListener('click', function() { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); });
    }

    async function renderCalendar() {
        var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        document.getElementById('calMonth').textContent = calYear + '年' + monthNames[calMonth];

        // 获取当月计划
        var resp = await window.DiaryApi.request('/plans?year='+calYear+'&month='+(calMonth+1));
        var plans = (resp.success && resp.data) ? resp.data : [];

        // 按日期分组
        var planMap = {};
        plans.forEach(function(p) {
            if (!planMap[p.planDate]) planMap[p.planDate] = [];
            planMap[p.planDate].push(p);
        });

        var grid = document.getElementById('calendarGrid');
        var html = '';
        // 星期头
        ['日','一','二','三','四','五','六'].forEach(function(d) {
            html += '<div class="cal-header">'+d+'</div>';
        });

        var firstDay = new Date(calYear, calMonth, 1).getDay();
        var daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
        var today = todayStr();

        // 上月空白
        var prevMonthDays = new Date(calYear, calMonth, 0).getDate();
        for (var i = firstDay - 1; i >= 0; i--) {
            html += '<div class="cal-cell other-month"><div class="cal-day">'+(prevMonthDays-i)+'</div></div>';
        }

        // 当月日期
        for (var d = 1; d <= daysInMonth; d++) {
            var pad = function(n){ return n<10?'0'+n:''+n; };
            var dateStr = calYear+'-'+pad(calMonth+1)+'-'+pad(d);
            var isToday = dateStr === today ? ' today' : '';
            var dayPlans = planMap[dateStr] || [];
            html += '<div class="cal-cell'+isToday+'" data-date="'+dateStr+'">';
            html += '<div class="cal-day">'+d+'</div>';
            html += '<div class="cal-plans">';
            dayPlans.slice(0,3).forEach(function(p) {
                html += '<div class="cal-plan">'+escapeHtml(p.content)+'</div>';
            });
            if (dayPlans.length > 3) html += '<div class="cal-plan">+'+(dayPlans.length-3)+'项</div>';
            html += '</div>';
            html += '<span class="cal-add">+ 添加</span>';
            html += '</div>';
        }

        // 下月空白
        var totalCells = firstDay + daysInMonth;
        var remaining = (7 - totalCells % 7) % 7;
        for (var j = 1; j <= remaining; j++) {
            html += '<div class="cal-cell other-month"><div class="cal-day">'+j+'</div></div>';
        }

        grid.innerHTML = html;

        // 点击日期添加计划
        grid.querySelectorAll('.cal-cell:not(.other-month)').forEach(function(cell) {
            cell.addEventListener('click', function() {
                var date = cell.getAttribute('data-date');
                var content = prompt('添加计划到 ' + date + '：');
                if (content && content.trim()) {
                    window.DiaryApi.request('/plans', { method: 'POST', body: { planDate: date, content: content.trim() } })
                        .then(function(r) { if (r.success) { toast('已添加', 'success'); renderCalendar(); } });
                }
            });
        });
    }

    // =====================================================================
    //  日程表（课程表样式）
    // =====================================================================
    var scheduleSlots = [
        { slot:1, label:'第1节', time:'08:00-08:45' },
        { slot:2, label:'第2节', time:'08:55-09:40' },
        { slot:3, label:'第3节', time:'10:00-10:45' },
        { slot:4, label:'第4节', time:'10:55-11:40' },
        { slot:5, label:'第5节', time:'14:00-14:45' },
        { slot:6, label:'第6节', time:'14:55-15:40' },
        { slot:7, label:'第7节', time:'16:00-16:45' },
        { slot:8, label:'第8节', time:'16:55-17:40' },
        { slot:9, label:'第9节', time:'19:00-19:45' },
        { slot:10, label:'第10节', time:'19:55-20:40' }
    ];

    function initSchedule() {
        document.getElementById('addScheduleBtn').addEventListener('click', function() {
            document.getElementById('scheduleModal').style.display = 'flex';
        });
        document.getElementById('scheduleModalClose').addEventListener('click', closeScheduleModal);
        document.getElementById('scheduleModalCancel').addEventListener('click', closeScheduleModal);
        document.getElementById('scheduleModalSave').addEventListener('click', saveSchedule);
    }

    function closeScheduleModal() {
        document.getElementById('scheduleModal').style.display = 'none';
        document.getElementById('scheduleName').value = '';
        document.getElementById('scheduleLocation').value = '';
    }

    async function saveSchedule() {
        var name = document.getElementById('scheduleName').value.trim();
        if (!name) { toast('请输入名称', 'error'); return; }
        var data = {
            name: name,
            dayOfWeek: +document.getElementById('scheduleDay').value,
            timeSlot: +document.getElementById('scheduleSlot').value,
            location: document.getElementById('scheduleLocation').value.trim() || null
        };
        var resp = await window.DiaryApi.request('/schedules', { method: 'POST', body: data });
        if (resp.success) { toast('已添加', 'success'); closeScheduleModal(); loadSchedule(); }
        else toast(resp.message || '添加失败', 'error');
    }

    async function loadSchedule() {
        var resp = await window.DiaryApi.request('/schedules');
        var items = (resp.success && resp.data) ? resp.data : [];

        var tbody = document.getElementById('scheduleBody');
        tbody.innerHTML = scheduleSlots.map(function(s) {
            var row = '<tr><td><strong>'+s.label+'</strong><br><span style="font-size:10px;color:#999;">'+s.time+'</span></td>';
            for (var day = 1; day <= 7; day++) {
                var cellItems = items.filter(function(it){ return it.dayOfWeek === day && it.timeSlot === s.slot; });
                row += '<td>';
                cellItems.forEach(function(it) {
                    row += '<div class="schedule-item" data-id="'+it.id+'">'
                        + '<div class="s-name">'+escapeHtml(it.name)+'</div>'
                        + (it.location ? '<div class="s-loc">📍'+escapeHtml(it.location)+'</div>' : '')
                        + '<span class="s-del" data-id="'+it.id+'">✕</span></div>';
                });
                row += '</td>';
            }
            row += '</tr>';
            return row;
        }).join('');

        // 删除日程
        tbody.querySelectorAll('.s-del').forEach(function(btn) {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                if (!confirm('确定删除此日程？')) return;
                var r = await window.DiaryApi.request('/schedules/' + btn.getAttribute('data-id'), { method: 'DELETE' });
                if (r.success) { toast('已删除', 'success'); loadSchedule(); }
            });
        });
    }

    // =====================================================================
    //  启动
    // =====================================================================
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.AuthApi || !window.AuthApi.isLoggedIn()) { location.href = 'login.html'; return; }

        initNav();
        initDiary();
        initTodo();
        initCalendar();
        initSchedule();

        // 加载数据
        loadDiaryData();
        loadTodos();
        renderCalendar();
        loadSchedule();

        // 用户信息
        window.AuthApi.getUserInfo().then(function(resp) {
            var el = document.getElementById('userInfo');
            if (resp.success && resp.data) el.textContent = '👤 ' + (resp.data.nickname || resp.data.phone);
            else el.textContent = '👤 用户';
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', async function() {
            if (!confirm('确定要退出登录吗？')) return;
            await window.AuthApi.logout();
            location.href = 'login.html';
        });
    });

})();
