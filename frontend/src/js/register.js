/* =================================================
   注册页逻辑（register.html）
   手机号 + 昵称 + 密码 注册
   ================================================= */

(function () {
    'use strict';

    var phoneInput = document.getElementById('phoneInput');
    var nicknameInput = document.getElementById('nicknameInput');
    var passwordInput = document.getElementById('passwordInput');
    var confirmInput = document.getElementById('confirmInput');
    var registerBtn = document.getElementById('registerBtn');
    var registerError = document.getElementById('registerError');

    async function doRegister() {
        var phone = phoneInput.value.trim();
        var nickname = nicknameInput.value.trim();
        var password = passwordInput.value;
        var confirm = confirmInput.value;

        if (!phone) {
            showError('请输入手机号');
            phoneInput.focus();
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            showError('手机号格式不正确');
            phoneInput.focus();
            return;
        }
        if (!password || password.length < 6) {
            showError('密码不能少于6位');
            passwordInput.focus();
            return;
        }
        if (password !== confirm) {
            showError('两次输入的密码不一致');
            confirmInput.focus();
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = '注册中...';
        hideError();

        var resp = await window.AuthApi.register(phone, password, nickname);

        registerBtn.disabled = false;
        registerBtn.textContent = '注册';

        if (resp.success && resp.data && resp.data.token) {
            // 注册成功，自动登录，跳转首页
            location.href = 'index.html';
        } else {
            showError(resp.message || '注册失败');
        }
    }

    function showError(msg) {
        registerError.textContent = msg;
        registerError.style.display = 'block';
    }
    function hideError() {
        registerError.textContent = '';
        registerError.style.display = 'none';
    }

    registerBtn.addEventListener('click', doRegister);

    // 回车跳转下一个输入框
    phoneInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') nicknameInput.focus();
    });
    nicknameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') passwordInput.focus();
    });
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmInput.focus();
    });
    confirmInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doRegister();
    });

    phoneInput.focus();
})();
