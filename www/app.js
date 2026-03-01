/**
 * 企业记账报税 - 手机端交互（支持线上登录）
 */

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('registerModal');
  const btnRegister = document.getElementById('btnRegister');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const registerForm = document.getElementById('registerForm');
  const btnSendCode = document.getElementById('btnSendCode');
  const phoneInput = document.getElementById('phone');
  const codeInput = document.getElementById('code');

  const API = window.API_CONFIG || { BASE_URL: '', ENDPOINTS: { SEND_CODE: '/api/sms/send', LOGIN: '/api/auth/login' } };

  // 打开注册弹窗
  btnRegister.addEventListener('click', function() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  // 关闭弹窗
  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  btnCloseModal.addEventListener('click', closeModal);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // 验证码倒计时
  let countdown = 0;

  function startCountdown() {
    countdown = 60;
    btnSendCode.disabled = true;
    btnSendCode.textContent = countdown + '秒后重试';
    const timer = setInterval(function() {
      countdown--;
      btnSendCode.textContent = countdown + '秒后重试';
      if (countdown <= 0) {
        clearInterval(timer);
        btnSendCode.disabled = false;
        btnSendCode.textContent = '获取验证码';
      }
    }, 1000);
  }

  btnSendCode.addEventListener('click', function() {
    const phone = phoneInput.value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    if (countdown > 0) return;

    const url = API.BASE_URL + API.ENDPOINTS.SEND_CODE;
    btnSendCode.disabled = true;
    btnSendCode.textContent = '发送中...';

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone })
    })
      .then(function(res) {
        if (!res.ok) throw new Error('发送失败');
        return res.json();
      })
      .then(function(data) {
        if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
          throw new Error(data.msg || data.message || '发送失败');
        }
        startCountdown();
      })
      .catch(function(err) {
        btnSendCode.disabled = false;
        btnSendCode.textContent = '获取验证码';
        alert(err.message || '验证码发送失败，请检查网络或后端服务');
      });
  });

  // 提交注册/登录
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    if (!/^\d{4,6}$/.test(code)) {
      alert('请输入正确的验证码');
      return;
    }

    const url = API.BASE_URL + API.ENDPOINTS.LOGIN;
    const submitBtn = registerForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '登录中...';

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, code: code })
    })
      .then(function(res) {
        if (!res.ok) throw new Error('登录失败');
        return res.json();
      })
      .then(function(data) {
        var token = data.token || data.data && data.data.token;
        if (token) {
          localStorage.setItem('token', token);
          if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.code !== undefined && data.code !== 0 && data.code !== 200 && !token) {
          throw new Error(data.msg || data.message || '登录失败');
        }
        alert('登录成功');
        closeModal();
        registerForm.reset();
      })
      .catch(function(err) {
        alert(err.message || '登录失败，请检查网络或验证码');
      })
      .finally(function() {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });

  // 底部导航切换
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (item.classList.contains('nav-center')) return;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
});
