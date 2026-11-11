(function () {
  'use strict';
  if (document.querySelector('.info-btn')) return;
  var header = document.querySelector('header');
  var brand = header && header.querySelector('.brand');
  if (!header || !brand) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'info-btn';
  btn.textContent = '说明';
  brand.insertAdjacentElement('afterend', btn);

  var mask = document.createElement('div');
  mask.className = 'info-mask';
  mask.innerHTML =
    '<div class="info-panel" role="dialog" aria-modal="true" aria-label="关于 Claude 小站">' +
      '<button class="info-close" type="button" aria-label="关闭">×</button>' +
      '<h2>Claude 小站</h2>' +
      '<p class="info-lead">给 Mika 的小站：看看行情、翻翻表情、玩玩模拟盘，也能请她喝点什么。</p>' +
      '<div class="info-list">' +
        '<div class="info-item"><b>赞赏</b><span>挑一杯咖啡或一罐茶，扫微信赞赏码请她喝。</span></div>' +
        '<div class="info-item"><b>表情</b><span>九个 Q 版小表情，点开放大，再点一下就存走。</span></div>' +
        '<div class="info-item"><b>行情</b><span>Yahoo Finance 的 K 线、汇率和相关新闻。</span></div>' +
        '<div class="info-item"><b>模拟</b><span>十万虚拟资金练手，股票不加杠杆，汇率可加杠杆。</span></div>' +
        '<div class="info-item"><b>收盘</b><span>每天闭市的总结图，还有各市场开市时间。</span></div>' +
      '</div>' +
      '<div class="info-feedback">' +
        '<h3>留个话</h3>' +
        '<p class="info-hint">有什么建议或 bug，直接写在这里发给我～</p>' +
        '<form id="infoFeedback" action="https://formspree.io/f/xzerbron" method="POST">' +
          '<input type="hidden" name="_subject" value="Claude 小站 · 用户反馈" />' +
          '<textarea name="message" required placeholder="想说什么都行，bug 也可以～"></textarea>' +
          '<div class="info-fb-actions">' +
            '<button class="btn btn-primary" type="submit">发送</button>' +
            '<span class="info-msg" id="infoMsg"></span>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</div>';
  document.body.appendChild(mask);

  var panel = mask.querySelector('.info-panel');
  function open() { mask.classList.add('open'); }
  function close() { mask.classList.remove('open'); }

  btn.addEventListener('click', open);
  mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
  mask.querySelector('.info-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mask.classList.contains('open')) close();
  });

  if (/[?&]info=1/.test(location.search)) open();

  var form = mask.querySelector('#infoFeedback');
  var msg = mask.querySelector('#infoMsg');
  var submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    if (!String(fd.get('message') || '').trim()) { msg.textContent = '内容还没写呢～'; return; }
    var old = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '发送中…';
    msg.textContent = '';
    msg.style.color = '';
    fetch('https://formspree.io/f/xzerbron', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!(res.ok === true || res.success === true || res.success === 'true')) {
          throw new Error((res.error || res.message || 'fail'));
        }
        msg.style.color = 'var(--green)';
        msg.textContent = '收到啦～还能继续发。';
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = old;
        setTimeout(function () { msg.textContent = ''; msg.style.color = ''; }, 3200);
      })
      .catch(function () {
        msg.textContent = '发送失败了，等会儿再试。';
        submitBtn.disabled = false;
        submitBtn.textContent = old;
      });
  });
})();
