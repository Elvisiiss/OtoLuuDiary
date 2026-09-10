/* =================================================
   登录页逻辑（login.html）
   ================================================= */

(function () {
    'use strict';

    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    // 如果已登录，直接跳转到首页
    if (window.AuthApi && window.AuthApi.getToken()) {
        window.AuthApi.check().then(function (resp) {
            if (resp.success && resp.data && resp.data.loggedIn) {
                location.href = 'index.html';
            }
        });
    }

    async function doLogin() {
        const password = passwordInput.value.trim();
        if (!password) {
            showError('请输入密码');
            passwordInput.focus();
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
        hideError();

        const resp = await window.AuthApi.login(password);

        loginBtn.disabled = false;
        loginBtn.textContent = '登录';

        if (resp.success && resp.data && resp.data.token) {
            // 登录成功，跳转到首页
            location.href = 'index.html';
        } else {
            showError(resp.message || '登录失败');
            passwordInput.select();
            passwordInput.focus();
        }
    }

    function showError(msg) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
    }

    function hideError() {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }

    // 点击登录按钮
    loginBtn.addEventListener('click', doLogin);

    // 回车登录
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            doLogin();
        }
    });

    // 自动聚焦密码框
    passwordInput.focus();

})();
