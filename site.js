(function () {
  'use strict';
  var KEY = 'claudeSiteUser';
  var area = document.getElementById('userArea');
  if (!area) return;

  var modal = document.getElementById('userModal');
  var loginBox = document.getElementById('loginBox');
  var profileBox = document.getElementById('profileBox');
  var msg = document.getElementById('userMsg');
  var btnEl = document.getElementById('userBtn');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function store(u) {
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {}
  }
  var user = load();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderButton() {
    if (user) {
      btnEl.innerHTML = '<span class="user-avatar">' + esc(user.avatar || '🙂') + '</span>' +
        '<span class="user-name">' + esc(user.name) + '</span>';
      btnEl.setAttribute('aria-label', '我的资料');
    } else {
      btnEl.innerHTML = '登录';
      btnEl.setAttribute('aria-label', '登录');
    }
  }

  function fillProfile() {
    document.getElementById('uName').value = user ? user.name : '';
    document.getElementById('uQQ').value = user && user.qq ? user.qq : '';
    document.getElementById('uAvatar').value = user && user.avatar ? user.avatar : '🙂';
    document.getElementById('uBio').value = user && user.bio ? user.bio : '';
  }

  function openModal() {
    modal.hidden = false;
    msg.textContent = '';
    if (user) {
      loginBox.hidden = true;
      profileBox.hidden = false;
      fillProfile();
    } else {
      loginBox.hidden = false;
      profileBox.hidden = true;
      document.getElementById('lName').value = '';
      document.getElementById('lPass').value = '';
      if (acctInput) acctInput.value = '';
      if (typeof setProvider === 'function') setProvider('wechat');
    }
  }
  function closeModal() { modal.hidden = true; }

  btnEl.addEventListener('click', openModal);
  document.getElementById('userClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* 登录（微信 / QQ / 邮箱，本地保存） */
  var provider = 'wechat';
  var tabs = document.getElementById('loginTabs');
  var acctLabel = document.getElementById('acctLabel');
  var passWrap = document.getElementById('passWrap');
  var acctInput = document.getElementById('lAccount');
  var PROVIDER_TEXT = {
    wechat: ['微信号', '输入微信号'],
    qq: ['QQ 号', '输入 QQ 号'],
    email: ['邮箱', 'name@example.com']
  };
  function setProvider(p) {
    provider = p;
    var t = PROVIDER_TEXT[p];
    if (acctLabel) acctLabel.textContent = t[0];
    if (acctInput) acctInput.placeholder = t[1];
    if (passWrap) passWrap.hidden = p !== 'email';
    Array.prototype.forEach.call(tabs.children, function (b) {
      b.classList.toggle('on', b.getAttribute('data-provider') === p);
    });
  }
  if (tabs) {
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-provider]');
      if (!b) return;
      msg.textContent = '';
      setProvider(b.getAttribute('data-provider'));
    });
  }

  function defaultName(p, acct) {
    if (p === 'email') return acct.split('@')[0];
    if (p === 'qq') return 'QQ ' + acct;
    return '微信 ' + acct.slice(-4);
  }

  document.getElementById('loginGo').addEventListener('click', function () {
    var acct = acctInput.value.trim();
    var pass = document.getElementById('lPass').value;
    var nick = document.getElementById('lName').value.trim();
    if (!acct) { msg.textContent = '先填一下' + PROVIDER_TEXT[provider][0] + '呀～'; return; }
    if (provider === 'qq' && !/^\d{5,12}$/.test(acct)) { msg.textContent = 'QQ 号看起来不太对。'; return; }
    if (provider === 'email' && !/^\S+@\S+\.\S+$/.test(acct)) { msg.textContent = '邮箱格式不太对。'; return; }
    if (provider === 'email' && pass.length < 1) { msg.textContent = '邮箱登录要填密码。'; return; }
    var saved = load();
    if (saved && saved.provider === provider && saved.account === acct) {
      if (saved.pass && saved.pass !== pass) { msg.textContent = '密码对不上哦。'; return; }
      user = saved;
    } else if (saved) {
      msg.textContent = '这台设备已经有个账号啦。';
      return;
    } else {
      user = {
        provider: provider, account: acct, pass: pass,
        name: nick || defaultName(provider, acct),
        avatar: '🙂', bio: '', qq: provider === 'qq' ? acct : ''
      };
    }
    store(user);
    renderButton();
    openModal();
  });

  /* 保存资料 */
  document.getElementById('uSave').addEventListener('click', function () {
    if (!user) return;
    user.name = document.getElementById('uName').value.trim() || user.name;
    user.qq = document.getElementById('uQQ').value.trim();
    user.avatar = document.getElementById('uAvatar').value;
    user.bio = document.getElementById('uBio').value.trim();
    store(user);
    renderButton();
    msg.style.color = 'var(--green)';
    msg.textContent = '保存好啦～';
    setTimeout(function () { msg.textContent = ''; msg.style.color = ''; }, 1600);
  });

  /* 退出 */
  document.getElementById('uLogout').addEventListener('click', function () {
    user = null;
    try { localStorage.removeItem(KEY); } catch (e) {}
    renderButton();
    closeModal();
  });

  renderButton();
})();
