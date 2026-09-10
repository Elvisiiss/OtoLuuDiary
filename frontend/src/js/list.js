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
    //  待做清单
    // =====================================================================
    var todoFilter = 'all';
    var editingTodoId = null;

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
                s.parentElement._val = v;
            });
        });
        // 保存
        document.getElementById('todoModalSave').addEventListener('click', saveTodo);
    }

    function openTodoModal(todo) {
        editingTodoId = todo ? todo.id : null;
        document.getElementById('todoModalTitle').textContent = todo ? '编辑待做' : '新增待做';
        document.getElementById('todoContent').value = todo ? todo.content : '';
        document.getElementById('todoRepeat').value = todo ? (todo.repeatType || '') : '';
        document.getElementById('todoDueDate').value = todo ? (todo.dueDate || '') : '';
        var imp = todo ? (todo.importance || 0) : 0;
        document.querySelectorAll('#todoImportance .star').forEach(function(s) {
            s.classList.toggle('active', +s.getAttribute('data-val') <= imp);
        });
        document.getElementById('todoImportance')._val = imp;
        document.getElementById('todoModal').style.display = 'flex';
    }

    function closeTodoModal() {
        document.getElementById('todoModal').style.display = 'none';
        editingTodoId = null;
    }

    async function saveTodo() {
        var content = document.getElementById('todoContent').value.trim();
        if (!content) { toast('请输入内容', 'error'); return; }
        var data = {
            content: content,
            importance: document.getElementById('todoImportance')._val || 0,
            repeatType: document.getElementById('todoRepeat').value || null,
            dueDate: document.getElementById('todoDueDate').value || null
        };
        var resp;
        if (editingTodoId) {
            resp = await window.DiaryApi.request('/todos/' + editingTodoId, { method: 'PUT', body: data });
        } else {
            resp = await window.DiaryApi.request('/todos', { method: 'POST', body: data });
        }
        if (resp.success) { toast('保存成功', 'success'); closeTodoModal(); loadTodos(); }
        else toast(resp.message || '保存失败', 'error');
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
            if (t.importance >= 2) badges += '<span class="todo-badge important">重要</span>';
            if (t.repeatType) {
                var repeatNames = { daily:'每天', weekday:'工作日', weekly:'每周', monthly:'每月' };
                badges += '<span class="todo-badge repeat">'+(repeatNames[t.repeatType]||t.repeatType)+'</span>';
            }
            var due = '';
            if (t.dueDate) {
                var overdue = !t.done && t.dueDate < todayStr();
                due = '<span class="todo-due'+(overdue?' overdue':'')+'">'+t.dueDate+'</span>';
            }
            return '<div class="todo-item" data-id="'+t.id+'">'
                + '<div class="todo-check'+doneClass+'" data-id="'+t.id+'" data-done="'+(t.done?1:0)+'"></div>'
                + '<span class="todo-text'+doneClass+'">'+escapeHtml(t.content)+'</span>'
                + badges + due
                + '<div class="todo-actions">'
                + '<button class="todo-edit" data-id="'+t.id+'" title="编辑">✏️</button>'
                + '<button class="todo-del" data-id="'+t.id+'" title="删除">🗑️</button>'
                + '</div></div>';
        }).join('');

        // 完成/取消完成
        container.querySelectorAll('.todo-check').forEach(function(ch) {
            ch.addEventListener('click', async function() {
                var id = ch.getAttribute('data-id');
                var done = ch.getAttribute('data-done') === '0';
                var resp = await window.DiaryApi.request('/todos/' + id + '/done', { method: 'PUT', body: { done: done } });
                if (resp.success) loadTodos();
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
