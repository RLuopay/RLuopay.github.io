(function () {
  'use strict';

  var PROXIES = [
    function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function (u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); }
  ];
  var BASE = 'https://query1.finance.yahoo.com';

  function fetchYahoo(path) {
    var url = BASE + path, idx = 0;
    function next() {
      if (idx >= PROXIES.length) return Promise.reject(new Error('proxy'));
      return fetch(PROXIES[idx++](url), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .catch(next);
    }
    return next();
  }

  var INDEXES = [
    ['标普 500', '^GSPC'],
    ['纳斯达克', '^IXIC'],
    ['道琼斯', '^DJI'],
    ['上证指数', '000001.SS'],
    ['恒生指数', '^HSI']
  ];
  var UP = '#C0392B', DOWN = '#2F6FD0';

  var rows = [];

  function loadOne(name, sym) {
    return fetchYahoo('/v8/finance/chart/' + encodeURIComponent(sym) + '?range=5d&interval=1d')
      .then(function (d) {
        var m = d.chart.result[0].meta;
        var price = m.regularMarketPrice;
        var prev = m.chartPreviousClose || m.previousClose;
        var pct = prev && price ? (price - prev) / prev * 100 : 0;
        return { name: name, sym: sym, price: price, pct: pct };
      })
      .catch(function () { return { name: name, sym: sym, price: null, pct: 0, failed: true }; });
  }

  var canvas = document.getElementById('closeCanvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var cssW = Math.min(canvas.parentElement.clientWidth - 40, 1000);
    var cssH = Math.round(cssW * 0.42);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var w = cssW, h = cssH;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    var today = new Date();
    var dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    document.getElementById('closeDate').textContent = dateStr + ' 收盘 · 数据来自 Yahoo Finance';

    ctx.fillStyle = '#1B1A19';
    ctx.font = '700 ' + Math.round(w * 0.032) + 'px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('闭市总结 · ' + dateStr, w * 0.04, h * 0.12);

    var n = rows.length || 1;
    var top = h * 0.2, rowH = (h * 0.72) / n;
    var labelW = w * 0.2, barX = w * 0.36, barW = w * 0.5, mid = barX + barW / 2;
    var maxPct = 1;
    rows.forEach(function (r) { maxPct = Math.max(maxPct, Math.abs(r.pct)); });

    ctx.strokeStyle = '#EAE5E0';
    ctx.beginPath(); ctx.moveTo(mid, top); ctx.lineTo(mid, top + rowH * n); ctx.stroke();

    rows.forEach(function (r, i) {
      var y = top + rowH * i + rowH / 2;
      ctx.fillStyle = '#1B1A19';
      ctx.font = '500 ' + Math.round(w * 0.019) + 'px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.name, w * 0.04, y + 6);

      var len = Math.abs(r.pct) / maxPct * (barW / 2);
      ctx.fillStyle = r.pct >= 0 ? UP : DOWN;
      if (r.pct >= 0) ctx.fillRect(mid, y - rowH * 0.18, len, rowH * 0.36);
      else ctx.fillRect(mid - len, y - rowH * 0.18, len, rowH * 0.36);

      ctx.fillStyle = r.pct >= 0 ? UP : DOWN;
      ctx.font = '600 ' + Math.round(w * 0.02) + 'px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      var txt = (r.failed ? '--' : (r.pct >= 0 ? '+' : '') + r.pct.toFixed(2) + '%');
      ctx.fillText(txt, barX + barW + w * 0.02, y + 6);
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8A8580';
    ctx.font = '400 ' + Math.round(w * 0.015) + 'px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('红涨蓝跌 · 数据仅供参考', w * 0.04, h - h * 0.05);
  }

  function loadAll() {
    rows = [];
    Promise.all(INDEXES.map(function (x) { return loadOne(x[0], x[1]); }))
      .then(function (res) {
        rows = res;
        draw();
        var failed = res.filter(function (r) { return r.failed; }).length;
        document.getElementById('closeNote').textContent = failed
          ? '有 ' + failed + ' 个指数没拉到，换一会儿再刷新试试。'
          : '数据来自 Yahoo Finance，指数收盘价可能有延迟。';
      });
  }

  document.getElementById('saveImg').addEventListener('click', function () {
    var a = document.createElement('a');
    a.download = 'market-close-' + Date.now() + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  window.addEventListener('resize', function () { if (rows.length) draw(); });
  loadAll();
})();
