/* =================================================
   登录页逻辑（login.html）
   手机号 + 密码 登录
   ================================================= */

(function () {
    'use strict';

    var phoneInput = document.getElementById('phoneInput');
    var passwordInput = document.getElementById('passwordInput');
    var loginBtn = document.getElementById('loginBtn');
    var loginError = document.getElementById('loginError');

    // 如果已登录，直接跳转到首页
    if (window.AuthApi && window.AuthApi.isLoggedIn()) {
        window.AuthApi.check().then(function (resp) {
            if (resp.success && resp.data && resp.data.loggedIn) {
                location.href = 'index.html';
            }
        });
    }

    async function doLogin() {
        var phone = phoneInput.value.trim();
        var password = passwordInput.value;

        if (!phone) {
            showError('请输入手机号');
            phoneInput.focus();
            return;
        }
        if (!password) {
            showError('请输入密码');
            passwordInput.focus();
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
        hideError();

        var resp = await window.AuthApi.login(phone, password);

        loginBtn.disabled = false;
        loginBtn.textContent = '登录';

        if (resp.success && resp.data && resp.data.token) {
            location.href = 'index.html';
        } else {
            showError(resp.message || '登录失败');
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

    loginBtn.addEventListener('click', doLogin);

    // 回车登录
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doLogin();
    });
    phoneInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') passwordInput.focus();
    });

    phoneInput.focus();
})();
