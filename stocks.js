(function () {
  'use strict';

  var PROXIES = [
    function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function (u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); }
  ];
  var BASE = 'https://query1.finance.yahoo.com';
  var mem = {};
  var TTL = 45 * 1000;

  function getCached(key) {
    var c = mem[key];
    if (c && Date.now() - c.t < TTL) return c.v;
    return null;
  }
  function putCached(key, v) { mem[key] = { t: Date.now(), v: v }; }

  function fetchYahoo(path) {
    var key = 'y:' + path;
    var hit = getCached(key);
    if (hit) return Promise.resolve(hit);
    var url = BASE + path;
    var idx = 0;
    function attempt() {
      if (idx >= PROXIES.length) return Promise.reject(new Error('proxy failed'));
      var proxied = PROXIES[idx++](url);
      return fetch(proxied, { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          return r.json();
        })
        .then(function (data) {
          putCached(key, data);
          return data;
        })
        .catch(function () { return attempt(); });
    }
    return attempt();
  }

  /* ---------- chart ---------- */
  var chartEl = document.getElementById('chart');
  var statusEl = document.getElementById('chartStatus');
  var hasLib = typeof window.LightweightCharts !== 'undefined';
  var chart = null, series = null;

  if (hasLib) {
    chart = LightweightCharts.createChart(chartEl, {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#7A7572',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
      },
      grid: { vertLines: { color: '#EAE5E0' }, horzLines: { color: '#EAE5E0' } },
      rightPriceScale: { borderColor: '#D6D1CE' },
      timeScale: { borderColor: '#D6D1CE', timeVisible: true },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal }
    });
    series = chart.addCandlestickSeries({
      upColor: '#2F7D4F', downColor: '#B34A32', borderVisible: false,
      wickUpColor: '#2F7D4F', wickDownColor: '#B34A32'
    });
  } else {
    statusEl.textContent = '图表库没加载出来，检查一下网络再刷新。';
  }

  var state = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currency: 'USD',
    price: null,
    prevClose: null,
    range: '1mo'
  };

  function fmtPrice(p, currency) {
    if (p == null || isNaN(p)) return '--';
    var v = p >= 100 ? p.toFixed(2) : p.toFixed(4);
    var prefix = currency === 'CNY' ? '¥ ' : currency === 'USD' ? '$ ' : '';
    return prefix + v;
  }

  function updateQuote(meta) {
    var price = meta.regularMarketPrice;
    var prev = meta.chartPreviousClose || meta.previousClose;
    state.price = price;
    state.prevClose = prev;
    document.getElementById('chartSym').textContent = state.symbol;
    document.getElementById('chartName').textContent = state.name || '';
    document.getElementById('chartPrice').textContent = fmtPrice(price, state.currency);
    var chgEl = document.getElementById('chartChg');
    if (price != null && prev) {
      var pct = (price - prev) / prev * 100;
      chgEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(2) + '%';
      chgEl.className = pct >= 0 ? 'chg up' : 'chg down';
    } else {
      chgEl.textContent = '--';
      chgEl.className = 'chg';
    }
    updateSimPrices(state.symbol, price);
  }

  function loadChart(sym, range) {
    if (!hasLib) return;
    statusEl.textContent = '加载中…';
    var path = '/v8/finance/chart/' + encodeURIComponent(sym) +
      '?range=' + range + '&interval=' + (range === '5d' ? '30m' : '1d');
    fetchYahoo(path).then(function (d) {
      var r = d.chart && d.chart.result && d.chart.result[0];
      if (!r) throw new Error('no data');
      state.symbol = r.meta.symbol || sym;
      state.name = r.meta.shortName || r.meta.longName || '';
      state.currency = r.meta.currency || 'USD';
      var ts = r.timestamp || [];
      var q = r.indicators.quote[0] || {};
      var candles = [];
      for (var i = 0; i < ts.length; i++) {
        if (q.open[i] == null || q.close[i] == null) continue;
        candles.push({
          time: ts[i],
          open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i]
        });
      }
      if (!candles.length) throw new Error('empty');
      series.setData(candles);
      chart.timeScale().fitContent();
      series.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      updateQuote(r.meta);
      statusEl.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }) +
        ' · 数据来自 Yahoo Finance';
    }).catch(function () {
      statusEl.textContent = '加载失败了，稍等一下再试（公共代理可能会限流）。';
    });
  }

  /* ---------- quick list & search ---------- */
  var QUICK = [
    ['AAPL', '苹果'], ['TSLA', '特斯拉'], ['NVDA', '英伟达'],
    ['MSFT', '微软'], ['BTC-USD', '比特币'], ['GC=F', '黄金'],
    ['000001.SS', '上证指数'], ['^GSPC', '标普500']
  ];
  var quickEl = document.getElementById('quickList');
  QUICK.forEach(function (item) {
    var b = document.createElement('button');
    b.className = 'chip';
    b.textContent = item[0];
    b.title = item[1];
    b.addEventListener('click', function () { switchSymbol(item[0], item[1]); });
    quickEl.appendChild(b);
  });

  function switchSymbol(sym, name) {
    state.name = name || '';
    loadChart(sym, state.range);
    document.getElementById('searchResults').hidden = true;
  }

  var searchInput = document.getElementById('searchInput');
  var resultsEl = document.getElementById('searchResults');

  function doSearch() {
    var q = searchInput.value.trim();
    if (!q) return;
    resultsEl.hidden = false;
    resultsEl.innerHTML = '<div class="sr-empty">搜索中…</div>';
    fetchYahoo('/v1/finance/search?q=' + encodeURIComponent(q) + '&quotesCount=8&newsCount=0')
      .then(function (d) {
        var quotes = (d.quotes || []).filter(function (x) { return x.symbol; });
        if (!quotes.length) {
          resultsEl.innerHTML = '<div class="sr-empty">没找到，换个词试试。</div>';
          return;
        }
        resultsEl.innerHTML = '';
        quotes.forEach(function (it) {
          var row = document.createElement('button');
          row.className = 'sr-row';
          row.innerHTML = '<b>' + it.symbol + '</b><span>' +
            (it.shortname || it.longname || '') + '</span>' +
            '<em>' + (it.exchDisp || it.exchange || '') + '</em>';
          row.addEventListener('click', function () {
            switchSymbol(it.symbol, it.shortname || it.longname || '');
            searchInput.value = it.symbol;
          });
          resultsEl.appendChild(row);
        });
      })
      .catch(function () {
        resultsEl.innerHTML = '<div class="sr-empty">搜索失败，代理可能被限流了。</div>';
      });
  }
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });

  document.getElementById('ranges').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-range]');
    if (!b) return;
    state.range = b.getAttribute('data-range');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    loadChart(state.symbol, state.range);
  });

  /* ---------- FX ---------- */
  var FX = [['USD / CNY', 'CNY=X'], ['EUR / CNY', 'EURCNY=X'], ['JPY / CNY', 'JPYCNY=X'], ['HKD / CNY', 'HKDCNY=X']];
  function loadFx() {
    var grid = document.getElementById('fxGrid');
    grid.innerHTML = '';
    FX.forEach(function (pair) {
      var card = document.createElement('div');
      card.className = 'card fx-card';
      card.innerHTML = '<div class="fx-pair">' + pair[0] + '</div><div class="fx-val">--</div><div class="fx-chg">加载中</div>';
      grid.appendChild(card);
      fetchYahoo('/v8/finance/chart/' + encodeURIComponent(pair[1]) + '?range=5d&interval=1d')
        .then(function (d) {
          var m = d.chart.result[0].meta;
          var p = m.regularMarketPrice;
          var prev = m.chartPreviousClose;
          card.querySelector('.fx-val').textContent = p != null ? p.toFixed(4) : '--';
          var chg = card.querySelector('.fx-chg');
          if (p != null && prev) {
            var pc = (p - prev) / prev * 100;
            chg.textContent = (pc >= 0 ? '+' : '') + pc.toFixed(2) + '%';
            chg.className = 'fx-chg ' + (pc >= 0 ? 'up' : 'down');
          } else { chg.textContent = ''; }
        })
        .catch(function () { card.querySelector('.fx-chg').textContent = '加载失败'; });
    });
  }

  /* ---------- simulated account ---------- */
  var SIM_KEY = 'claudeSimAccount';
  var sim = { cash: 100000, positions: [] };
  try { var raw = JSON.parse(localStorage.getItem(SIM_KEY) || 'null'); if (raw && typeof raw.cash === 'number') sim = raw; } catch (e) {}

  function saveSim() { try { localStorage.setItem(SIM_KEY, JSON.stringify(sim)); } catch (e) {} }

  function posPnl(p) {
    if (!p.cur || !p.entry) return 0;
    var k = (p.cur / p.entry - 1) * (p.dir === 'long' ? 1 : -1);
    return p.margin * p.lev * k;
  }
  function liqPrice(p) {
    return p.dir === 'long' ? p.entry * (1 - 1 / p.lev) : p.entry * (1 + 1 / p.lev);
  }

  var money = function (v) { return '¥ ' + Math.round(v).toLocaleString('en-US'); };

  function renderSim() {
    var pnlSum = 0;
    sim.positions.forEach(function (p) { pnlSum += posPnl(p); });
    document.getElementById('simCash').textContent = money(sim.cash);
    document.getElementById('simEquity').textContent = money(sim.cash + pnlSum);
    document.getElementById('posCount').textContent = sim.positions.length ? '(' + sim.positions.length + ')' : '';

    var box = document.getElementById('positions');
    if (!sim.positions.length) {
      box.innerHTML = '<div class="pos-empty">还没有持仓</div>';
      return;
    }
    box.innerHTML = '';
    sim.positions.forEach(function (p) {
      var pnl = posPnl(p);
      var pct = p.margin ? pnl / p.margin * 100 : 0;
      var el = document.createElement('div');
      el.className = 'pos-item';
      el.innerHTML =
        '<div class="pos-top"><b>' + p.symbol + '</b><span class="pos-dir ' + p.dir + '">' +
        (p.dir === 'long' ? '多' : '空') + ' ' + p.lev + '×</span></div>' +
        '<div class="pos-line">开仓 ' + p.entry.toFixed(2) + ' · 现价 ' + (p.cur ? p.cur.toFixed(2) : '--') + '</div>' +
        '<div class="pos-line">保证金 ' + money(p.margin) + ' · 爆仓 ' + liqPrice(p).toFixed(2) + '</div>' +
        '<div class="pos-line pnl ' + (pnl >= 0 ? 'up' : 'down') + '">' +
        (pnl >= 0 ? '+' : '') + pnl.toFixed(1) + ' (' + (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%)</div>';
      var btn = document.createElement('button');
      btn.className = 'btn btn-ghost pos-close';
      btn.textContent = '平仓';
      btn.addEventListener('click', function () { closePos(p.id); });
      el.appendChild(btn);
      box.appendChild(el);
    });
  }

  function updateSimPrices(symbol, price) {
    if (price == null) return;
    var changed = false;
    sim.positions.forEach(function (p) {
      if (p.symbol === symbol) {
        p.cur = price;
        changed = true;
        if (posPnl(p) <= -p.margin) {
          // liquidated
          p.liq = true;
        }
      }
    });
    var blown = sim.positions.filter(function (p) { return p.liq; });
    if (blown.length) {
      blown.forEach(function (p) {
        toast(p.symbol + ' ' + (p.dir === 'long' ? '多' : '空') + ' ' + p.lev + '× 爆仓了，保证金没了。');
      });
      sim.positions = sim.positions.filter(function (p) { return !p.liq; });
    }
    if (changed || blown.length) { saveSim(); renderSim(); }
  }

  function closePos(id) {
    var i = sim.positions.findIndex(function (p) { return p.id === id; });
    if (i < 0) return;
    var p = sim.positions[i];
    var pnl = Math.max(posPnl(p), -p.margin);
    sim.cash += p.margin + pnl;
    sim.positions.splice(i, 1);
    saveSim();
    renderSim();
  }

  var dir = 'long';
  var dirSwitch = document.getElementById('dirSwitch');
  dirSwitch.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-dir]');
    if (!b) return;
    dir = b.getAttribute('data-dir');
    Array.prototype.forEach.call(dirSwitch.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
    b.classList.add('on');
  });

  var levEl = document.getElementById('simLev');
  var levVal = document.getElementById('levVal');
  function syncLev() {
    var lev = Number(levEl.value);
    levVal.textContent = lev + '×';
    var margin = Number(document.getElementById('simMargin').value) || 0;
    var hint = document.getElementById('simHint');
    hint.textContent = lev >= 100
      ? '反方向 ' + (100 / lev).toFixed(2) + '% 就爆仓，' + lev + '× 纯属玩玩。'
      : '开仓后反向 ' + (100 / lev).toFixed(1) + '% 就爆仓。';
  }
  levEl.addEventListener('input', syncLev);
  syncLev();

  document.getElementById('openPos').addEventListener('click', function () {
    if (!state.price) { toast('行情还没加载好，等一下。'); return; }
    var margin = Number(document.getElementById('simMargin').value);
    var lev = Number(levEl.value);
    if (!margin || margin < 10) { toast('保证金至少 10 元呀。'); return; }
    if (margin > sim.cash) { toast('现金不够，先少开一点。'); return; }
    sim.cash -= margin;
    sim.positions.push({
      id: Date.now() + Math.random(),
      symbol: state.symbol,
      dir: dir,
      lev: lev,
      margin: margin,
      entry: state.price,
      cur: state.price
    });
    saveSim();
    renderSim();
    toast('开仓成功：' + state.symbol + ' ' + (dir === 'long' ? '做多' : '做空') + ' ' + lev + '×');
  });

  document.getElementById('resetSim').addEventListener('click', function () {
    sim = { cash: 100000, positions: [] };
    saveSim();
    renderSim();
    toast('账户重置成 10 万了。');
  });

  /* ---------- toast ---------- */
  var toastEl = document.createElement('div');
  toastEl.className = 'toast';
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------- boot ---------- */
  loadChart('AAPL', state.range);
  loadFx();
  renderSim();
  setInterval(function () {
    if (state.price != null) {
      // refresh quote for current symbol
      loadChart(state.symbol, state.range);
    }
  }, 60000);
})();
