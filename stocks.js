(function () {
  'use strict';

  var PROXIES = [
    function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function (u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); }
  ];
  var BASE = 'https://query1.finance.yahoo.com';
  var mem = {};
  var TTL = 45 * 1000;

  function getCached(k) { var c = mem[k]; return c && Date.now() - c.t < TTL ? c.v : null; }
  function putCached(k, v) { mem[k] = { t: Date.now(), v: v }; }

  function fetchYahoo(path) {
    var key = 'y:' + path;
    var hit = getCached(key);
    if (hit) return Promise.resolve(hit);
    var url = BASE + path, idx = 0;
    function attempt() {
      if (idx >= PROXIES.length) return Promise.reject(new Error('proxy'));
      var p = PROXIES[idx++](url);
      return fetch(p, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (d) { putCached(key, d); return d; })
        .catch(function () { return attempt(); });
    }
    return attempt();
  }

  var chartEl = document.getElementById('chart');
  var statusEl = document.getElementById('chartStatus');
  var hasLib = typeof window.LightweightCharts !== 'undefined';
  var chart = null, series = null;

  /* 红涨蓝跌 */
  var UP = '#C0392B', DOWN = '#2F6FD0';

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
      upColor: UP, downColor: DOWN, borderVisible: false,
      wickUpColor: UP, wickDownColor: DOWN
    });
  } else {
    statusEl.textContent = '图表库没加载出来，检查网络后刷新。';
  }

  var state = { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', price: null, range: '1mo', interval: '1d' };

  function fmtPrice(p, cur) {
    if (p == null || isNaN(p)) return '--';
    var v = p >= 100 ? p.toFixed(2) : p.toFixed(4);
    return (cur === 'CNY' ? '¥ ' : cur === 'USD' ? '$ ' : '') + v;
  }

  function updateQuote(meta) {
    state.price = meta.regularMarketPrice;
    var prev = meta.chartPreviousClose || meta.previousClose;
    document.getElementById('chartSym').textContent = state.symbol;
    document.getElementById('chartName').textContent = state.name || '';
    document.getElementById('chartPrice').textContent = fmtPrice(state.price, state.currency);
    var chgEl = document.getElementById('chartChg');
    if (state.price != null && prev) {
      var pct = (state.price - prev) / prev * 100;
      chgEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(2) + '%';
      chgEl.className = pct >= 0 ? 'chg up' : 'chg down';
    } else {
      chgEl.textContent = '--'; chgEl.className = 'chg';
    }
  }

  function loadChart(sym, range, interval) {
    if (!hasLib) return;
    statusEl.textContent = '加载中…';
    var path = '/v8/finance/chart/' + encodeURIComponent(sym) + '?range=' + range + '&interval=' + (interval || '1d');
    fetchYahoo(path).then(function (d) {
      var r = d.chart && d.chart.result && d.chart.result[0];
      if (!r) throw new Error('no data');
      state.symbol = r.meta.symbol || sym;
      state.name = r.meta.shortName || r.meta.longName || state.name;
      state.currency = r.meta.currency || 'USD';
      var ts = r.timestamp || [], q = r.indicators.quote[0] || {}, candles = [];
      for (var i = 0; i < ts.length; i++) {
        if (q.open[i] == null || q.close[i] == null) continue;
        candles.push({ time: ts[i], open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i] });
      }
      if (!candles.length) throw new Error('empty');
      series.setData(candles);
      chart.timeScale().fitContent();
      updateQuote(r.meta);
      statusEl.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }) + ' · Yahoo Finance';
      loadNews(state.symbol);
    }).catch(function () {
      statusEl.textContent = '加载失败了，等半分钟再试（公共代理可能限流）。';
    });
  }

  var QUICK = [
    ['AAPL', '苹果'], ['TSLA', '特斯拉'], ['NVDA', '英伟达'], ['MSFT', '微软'],
    ['BTC-USD', '比特币'], ['GC=F', '黄金'], ['000001.SS', '上证指数'], ['^GSPC', '标普500']
  ];
  var quickEl = document.getElementById('quickList');
  QUICK.forEach(function (it) {
    var b = document.createElement('button');
    b.className = 'chip'; b.textContent = it[0]; b.title = it[1];
    b.addEventListener('click', function () { state.name = it[1]; loadChart(it[0], state.range, state.interval); resultsEl.hidden = true; });
    quickEl.appendChild(b);
  });

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
        if (!quotes.length) { resultsEl.innerHTML = '<div class="sr-empty">没找到，换个词试试。</div>'; return; }
        resultsEl.innerHTML = '';
        quotes.forEach(function (it) {
          var row = document.createElement('button');
          row.className = 'sr-row';
          row.innerHTML = '<b>' + it.symbol + '</b><span>' + (it.shortname || it.longname || '') +
            '</span><em>' + (it.exchDisp || it.exchange || '') + '</em>';
          row.addEventListener('click', function () {
            state.name = it.shortname || it.longname || '';
            loadChart(it.symbol, state.range, state.interval);
            searchInput.value = it.symbol;
            resultsEl.hidden = true;
          });
          resultsEl.appendChild(row);
        });
      })
      .catch(function () { resultsEl.innerHTML = '<div class="sr-empty">搜索失败，代理可能被限流了。</div>'; });
  }
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });

  document.getElementById('ranges').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-range]');
    if (!b) return;
    state.range = b.getAttribute('data-range');
    state.interval = state.range === '60m' ? '60m' : (state.range === '5d' ? '30m' : '1d');
    if (state.range === '60m') state.range = '1mo';
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    loadChart(state.symbol, state.range, state.interval);
  });

  /* FX */
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
          var m = d.chart.result[0].meta, p = m.regularMarketPrice, prev = m.chartPreviousClose;
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

  /* news */
  function loadNews(sym) {
    var list = document.getElementById('newsList');
    document.getElementById('newsFor').textContent = sym;
    list.innerHTML = '<div class="news-empty">加载中…</div>';
    fetchYahoo('/v1/finance/search?q=' + encodeURIComponent(sym) + '&quotesCount=1&newsCount=8')
      .then(function (d) {
        var news = d.news || [];
        list.innerHTML = '';
        if (!news.length) {
          list.innerHTML = '<div class="news-empty">这只暂时没有相关新闻。</div>';
          return;
        }
        news.forEach(function (n) {
          var a = document.createElement('a');
          a.className = 'news-item';
          a.href = n.link || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          var when = n.providerPublishTime ? new Date(n.providerPublishTime * 1000) : null;
          a.innerHTML = '<span class="news-title">' + (n.title || '') + '</span>' +
            '<span class="news-meta">' + (n.publisher || '') +
            (when ? ' · ' + when.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '') +
            '</span>';
          list.appendChild(a);
        });
      })
      .catch(function () { list.innerHTML = '<div class="news-empty">新闻加载失败，稍后再试。</div>'; });
  }

  loadChart('AAPL', state.range, state.interval);
  loadFx();
})();
