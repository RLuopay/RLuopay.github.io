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
    }
  }
  function closeModal() { modal.hidden = true; }

  btnEl.addEventListener('click', openModal);
  document.getElementById('userClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* 登录 / 首次注册（本地） */
  document.getElementById('loginGo').addEventListener('click', function () {
    var name = document.getElementById('lName').value.trim();
    var pass = document.getElementById('lPass').value;
    if (!name) { msg.textContent = '先取个昵称呀～'; return; }
    if (pass.length < 1) { msg.textContent = '密码随便设一个吧～'; return; }
    var saved = load();
    if (saved && saved.name === name) {
      if (saved.pass !== pass) { msg.textContent = '密码对不上哦。'; return; }
      user = saved;
    } else if (saved) {
      msg.textContent = '这台设备已经有个账号啦。';
      return;
    } else {
      user = { name: name, pass: pass, qq: '', avatar: '🙂', bio: '' };
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
