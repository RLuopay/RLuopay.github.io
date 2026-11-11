(function () {
  'use strict';

  var PROXIES = [
    function (u) { return 'https://api.cors.lol/?url=' + encodeURIComponent(u); },
    function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); }
  ];
  var BASE = 'https://query1.finance.yahoo.com';
  var mem = {}, TTL = 40 * 1000;
  function cached(k) { var c = mem[k]; return c && Date.now() - c.t < TTL ? c.v : null; }
  function setCache(k, v) { mem[k] = { t: Date.now(), v: v }; }
  function fetchYahoo(path) {
    var k = 'y:' + path, hit = cached(k);
    if (hit) return Promise.resolve(hit);
    var url = BASE + path, idx = 0;
    function tryNext() {
      if (idx >= PROXIES.length) return Promise.reject(new Error('proxy'));
      return fetch(PROXIES[idx++](url), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (d) { setCache(k, d); return d; })
        .catch(tryNext);
    }
    return tryNext();
  }

  var SIM_KEY = 'claudeSimV2';
  var START = 100000;
  var account = { cash: START, lots: [] };

  try {
    var saved = JSON.parse(localStorage.getItem(SIM_KEY) || 'null');
    if (saved && typeof saved.cash === 'number' && Array.isArray(saved.lots)) account = saved;
  } catch (e) {}

  function save() { try { localStorage.setItem(SIM_KEY, JSON.stringify(account)); } catch (e) {} }

  var money = function (v) { return (v < 0 ? '-¥ ' : '¥ ') + Math.abs(Math.round(v)).toLocaleString('en-US'); };

  /* ---------- prices ---------- */
  var prices = {}; // symbol -> {price, currency, ts}

  function quoteKey(sym) { return 'quote:' + sym; }


  var SNAP = null;
  function snapKey(sym) { return sym.replace('^', '').replace(/[=.]/g, '_'); }
  function loadSnapshot() {
    if (SNAP) return Promise.resolve(SNAP);
    return fetch('assets/data/snapshot.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { SNAP = d; return d; })
      .catch(function () { return null; });
  }

  var FX_MAP = { 'CNY=X': 'USD', 'EURCNY=X': 'EUR', 'JPYCNY=X': 'JPY', 'HKDCNY=X': 'HKD' };
  var fxRates = null, fxAt = 0;

  function loadFxRates() {
    if (fxRates && Date.now() - fxAt < 6 * 3600 * 1000) return Promise.resolve(fxRates);
    return fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { fxRates = d.rates || {}; fxAt = Date.now(); return fxRates; });
  }

  function fxValue(sym) {
    return loadFxRates().then(function (r) {
      if (sym === 'CNY=X') return r.CNY;
      if (sym === 'EURCNY=X') return r.CNY / r.EUR;
      if (sym === 'JPYCNY=X') return r.CNY / r.JPY;
      if (sym === 'HKDCNY=X') return r.CNY / r.HKD;
      return null;
    });
  }

  function loadPrice(sym) {
    var age = prices[sym] && Date.now() - prices[sym].ts < 30 * 1000;
    if (age) return Promise.resolve(prices[sym]);
    if (FX_MAP[sym]) {
      return fxValue(sym).then(function (v) {
        var obj = { price: v, currency: 'CNY', ts: Date.now() };
        prices[sym] = obj;
        return obj;
      });
    }
    return fetchYahoo('/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=5m')
      .then(function (d) {
        var m = d.chart.result[0].meta;
        var obj = { price: m.regularMarketPrice, currency: m.currency, ts: Date.now(), stale: false };
        prices[sym] = obj;
        return obj;
      })
      .catch(function () {
        return loadSnapshot().then(function (snap) {
          var item = snap && snap[snapKey(sym)];
          if (!item || item.price == null) throw new Error('no price');
          var obj = { price: item.price, currency: item.currency, ts: Date.now(), stale: true };
          prices[sym] = obj;
          return obj;
        });
      });
  }

  /* ---------- stock pane ---------- */
  var stockSel = document.getElementById('stockSel');
  var stockPriceEl = document.getElementById('stockPrice');
  var stockQtyEl = document.getElementById('stockQty');

  function refreshStockPrice() {
    stockPriceEl.textContent = '…';
    loadPrice(stockSel.value)
      .then(function (q) { stockPriceEl.textContent = (q.currency === 'CNY' ? '¥ ' : '$ ') + q.price.toFixed(2); })
      .catch(function () { stockPriceEl.textContent = '失败'; });
  }

  function stockTrade(dir) {
    var sym = stockSel.value;
    var qty = Number(stockQtyEl.value);
    if (!qty || qty <= 0) { toast('数量要大于 0 呀。'); return; }
    var q = prices[sym];
    if (!q || !q.price) { toast('价格还没加载好，等一下。'); refreshStockPrice(); return; }
    var price = q.price;
    var cost = price * qty;
    if (dir === 'long') {
      account.cash -= cost;
    } else {
      account.cash += cost;
    }
    account.lots.push({
      id: Date.now() + Math.random(),
      kind: 'stock', symbol: sym, dir: dir,
      qty: qty, margin: cost, lev: 1, entry: price, cur: price
    });
    save(); render();
    toast((dir === 'long' ? '买入' : '卖出') + ' ' + sym + ' ' + qty + ' 股 @ ' + price.toFixed(2));
  }

  /* ---------- fx pane ---------- */
  var fxSel = document.getElementById('fxSel');
  var fxPriceEl = document.getElementById('fxPrice');
  var fxMarginEl = document.getElementById('fxMargin');
  var fxLevEl = document.getElementById('fxLev');
  var fxLevVal = document.getElementById('fxLevVal');
  var fxDir = 'long';

  function refreshFxPrice() {
    fxPriceEl.textContent = '…';
    loadPrice(fxSel.value)
      .then(function (q) { fxPriceEl.textContent = q.price.toFixed(4); })
      .catch(function () { fxPriceEl.textContent = '失败'; });
  }

  function syncFxLev() {
    var lev = Number(fxLevEl.value);
    fxLevVal.textContent = lev + '×';
    document.getElementById('fxHint').textContent =
      '反向 ' + (100 / lev).toFixed(2) + '% 就爆仓，保证金率低于 20% 会被强制平仓。';
  }
  fxLevEl.addEventListener('input', syncFxLev);

  document.getElementById('fxDir').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-dir]');
    if (!b) return;
    fxDir = b.getAttribute('data-dir');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
    b.classList.add('on');
  });

  function openFx() {
    var sym = fxSel.value;
    var q = prices[sym];
    if (!q || !q.price) { toast('汇率还没加载好。'); refreshFxPrice(); return; }
    var margin = Number(fxMarginEl.value);
    var lev = Number(fxLevEl.value);
    if (!margin || margin < 10) { toast('保证金至少 10 元。'); return; }
    if (margin > account.cash) { toast('现金不够，先少开一点。'); return; }
    var price = q.price;
    account.cash -= margin;
    account.lots.push({
      id: Date.now() + Math.random(),
      kind: 'fx', symbol: sym, dir: fxDir,
      qty: margin * lev / price, margin: margin, lev: lev, entry: price, cur: price
    });
    save(); render();
    toast('开仓：' + sym + ' ' + (fxDir === 'long' ? '做多' : '做空') + ' ' + lev + '×');
  }

  /* ---------- lots ---------- */
  function lotPnl(l) {
    if (!l.entry || !l.cur) return 0;
    if (l.kind === 'stock') {
      return (l.dir === 'long' ? 1 : -1) * (l.cur - l.entry) * l.qty;
    }
    var k = (l.cur / l.entry - 1) * (l.dir === 'long' ? 1 : -1);
    return l.margin * l.lev * k;
  }

  function marginRatio(l) {
    if (!l.margin) return 100;
    return (l.margin + lotPnl(l)) / l.margin * 100;
  }

  function liquidate(id) {
    var i = account.lots.findIndex(function (l) { return l.id === id; });
    if (i < 0) return;
    var l = account.lots[i];
    var pnl = lotPnl(l);
    if (l.kind === 'stock') {
      // closing a stock lot: buy back short or sell long
      account.cash += l.margin + pnl;
    } else {
      account.cash += Math.max(l.margin + pnl, 0);
    }
    account.lots.splice(i, 1);
    save(); render();
  }

  function checkLiquidation() {
    var killed = [];
    account.lots.forEach(function (l) {
      var ratio = marginRatio(l);
      var floor = l.kind === 'stock' ? 25 : 20;
      if (ratio <= floor) killed.push(l);
    });
    if (!killed.length) return;
    killed.forEach(function (l) {
      var i = account.lots.indexOf(l);
      if (i > -1) account.lots.splice(i, 1);
      if (l.kind === 'stock') {
        account.cash += Math.max(l.margin + lotPnl(l), 0);
      }
      toast(l.symbol + ' 保证金率过低，被强制平仓了。', 'warn');
    });
    save();
  }

  /* ---------- render ---------- */
  function render() {
    var marginSum = 0, pnlSum = 0;
    account.lots.forEach(function (l) {
      marginSum += l.margin;
      pnlSum += lotPnl(l);
    });
    var equity = account.cash + marginSum + pnlSum;

    var cashEl = document.getElementById('acctCash');
    cashEl.textContent = money(account.cash);
    cashEl.className = account.cash < 0 ? 'neg' : '';
    document.getElementById('acctMargin').textContent = money(marginSum);
    var equityEl = document.getElementById('acctEquity');
    equityEl.textContent = money(equity);
    equityEl.className = equity < 0 ? 'neg' : '';
    var pnlEl = document.getElementById('acctPnl');
    pnlEl.textContent = (pnlSum >= 0 ? '+' : '') + money(pnlSum);
    pnlEl.className = pnlSum >= 0 ? 'up' : 'down';

    document.getElementById('moodImg').src = pnlSum >= 0 ? 'assets/sim/earn.webp' : 'assets/sim/loss.webp';
    document.getElementById('moodImg').alt = pnlSum >= 0 ? '盈利' : '亏损';

    var box = document.getElementById('positions');
    if (!account.lots.length) {
      box.innerHTML = '<div class="pos-empty">还没有持仓</div>';
      document.getElementById('posMeta').textContent = '保证金率低于 20% 会被强平';
      return;
    }
    box.innerHTML = '';
    account.lots.forEach(function (l) {
      var pnl = lotPnl(l);
      var ratio = marginRatio(l);
      var el = document.createElement('div');
      el.className = 'pos-item';
      var dirTxt = l.kind === 'stock' ? (l.dir === 'long' ? '买入' : '卖空') : (l.dir === 'long' ? '多' : '空');
      var levTxt = l.kind === 'stock' ? '' : ' ' + l.lev + '×';
      el.innerHTML =
        '<div class="pos-top"><b>' + l.symbol + '</b><span class="pos-dir ' + l.dir + '">' +
        dirTxt + levTxt + '</span></div>' +
        '<div class="pos-line">' + (l.kind === 'stock' ? l.qty + ' 股' : '名义 ' + (l.qty * l.entry).toFixed(0)) +
        ' · 开仓 ' + l.entry.toFixed(l.kind === 'stock' ? 2 : 4) +
        ' · 现价 ' + (l.cur ? l.cur.toFixed(l.kind === 'stock' ? 2 : 4) : '--') + '</div>' +
        '<div class="pos-line">保证金 ' + money(l.margin) + ' · 保证金率 ' +
        '<b class="' + (ratio < 40 ? 'down' : '') + '">' + ratio.toFixed(1) + '%</b></div>' +
        '<div class="pos-line pnl ' + (pnl >= 0 ? 'up' : 'down') + '">' +
        (pnl >= 0 ? '+' : '') + pnl.toFixed(1) + '</div>';
      var btn = document.createElement('button');
      btn.className = 'btn btn-ghost pos-close';
      btn.textContent = '平仓';
      btn.addEventListener('click', function () { liquidate(l.id); });
      el.appendChild(btn);
      box.appendChild(el);
    });
    document.getElementById('posMeta').textContent = account.lots.length + ' 笔持仓 · 保证金率低于 20% 会被强平';
  }

  /* ---------- refresh positions ---------- */
  function refreshAll() {
    var syms = {};
    account.lots.forEach(function (l) { syms[l.symbol] = true; });
    var list = Object.keys(syms);
    if (!list.length) { render(); return; }
    Promise.all(list.map(function (s) {
      return loadPrice(s).then(function (q) {
        account.lots.forEach(function (l) { if (l.symbol === s) l.cur = q.price; });
      }).catch(function () {});
    })).then(function () {
      checkLiquidation();
      save();
      render();
    });
  }

  /* ---------- toast ---------- */
  var toastEl = document.createElement('div');
  toastEl.className = 'toast';
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind === 'warn' ? ' warn' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, 3400);
  }

  /* ---------- wiring ---------- */
  stockSel.addEventListener('change', refreshStockPrice);
  fxSel.addEventListener('change', refreshFxPrice);
  document.getElementById('stockBuy').addEventListener('click', function () { stockTrade('long'); });
  document.getElementById('stockSell').addEventListener('click', function () { stockTrade('short'); });
  document.getElementById('fxOpen').addEventListener('click', openFx);
  document.getElementById('resetSim').addEventListener('click', function () {
    account = { cash: START, lots: [] };
    save(); render(); toast('账户重置成 10 万了。');
  });

  document.getElementById('simTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    var tab = b.getAttribute('data-tab');
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    document.getElementById('paneStock').hidden = tab !== 'stock';
    document.getElementById('paneFx').hidden = tab !== 'fx';
  });

  syncFxLev();
  refreshStockPrice();
  refreshFxPrice();
  render();
  refreshAll();
  setInterval(refreshAll, 45000);
  setInterval(function () { refreshStockPrice(); refreshFxPrice(); }, 60000);
})();
