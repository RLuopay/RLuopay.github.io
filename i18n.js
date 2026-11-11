(function () {
  'use strict';

  var LS = 'claudeLang';
  var q = {};
  try {
    var qs = location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < qs.length; i++) {
      var kv = qs[i].split('=');
      if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    }
  } catch (e) {}

  var HANT = {
    '充值': '儲值', '日志': '日誌', '行情': '行情', '模拟': '模擬', '收盘': '收盤',
    '登录': '登入', '返回首页': '回首頁', '← 返回首页': '← 回首頁',
    '给 Mika 的 Claude 花米！': '給 Mika 的 Claude 花米！',
    '查股股、充米米、查日志': '查股股、充米米、查日誌',
    '专门为供奉 Claude 大小姐开的网站^ω^': '專門為供奉 Claude 大小姐開的網站^ω^',
    '想干点啥': '想幹點啥', '点一个进去': '點一個進去',
    '充米米': '充米米', '查日志': '查日誌', '查股股': '查股股',
    '给 QQ 号开 Claude 套餐，体验、标准、无限三档，按月续。': '給 QQ 號開 Claude 套餐，體驗、標準、無限三檔，按月續。',
    '按 QQ 号查最近的开通记录和每日用量，心里有数。': '按 QQ 號查最近的開通記錄和每日用量，心裡有數。',
    '常用行情一眼看，想看实时的再点去东方财富。': '常用行情一眼看，想看實時的再點去東方財富。',
    '去看看 →': '去看看 →', '去查查 →': '去查查 →', '去瞧瞧 →': '去瞧瞧 →',
    '翻翻照片': '翻翻照片', '点一下换一张': '點一下換一張',
    '欢迎来 Claude 小站，随便逛逛～': '歡迎來 Claude 小站，隨便逛逛～',
    '今天也在好好供奉 Claude 大小姐。': '今天也在好好供奉 Claude 大小姐。',
    '查股股可以，别拿它当投资建议哦。': '查股股可以，別拿它當投資建議哦。',
    '有事就戳我一下～': '有事就戳我一下～',
    '供奉 Claude 大小姐': '供奉 Claude 大小姐',
    '按月挑一档就好': '按月挑一檔就好',
    '三档按日用次数分，随时可以停，不绑长周期。': '三檔按日用次數分，隨時可以停，不綁長週期。',
    '按品质分类': '按品質分類',
    '体验版': '體驗版', '标准版': '標準版', '无限版': '無限版', '推荐': '推薦',
    '每日 50 次对话': '每日 50 次對話', '标准模型速度': '標準模型速度', '适合偶尔用用': '適合偶爾用用',
    '每日 300 次对话': '每日 300 次對話', '优先响应通道': '優先響應通道', '支持图片理解': '支援圖片理解',
    '不限对话次数': '不限對話次數', '长上下文模式': '長上下文模式', '专属通道优先': '專屬通道優先',
    '怎么开通': '怎麼開通', '三步就完事': '三步就完事',
    '加 QQ 报号': '加 QQ 報號',
    '把要开通的 QQ 号和套餐发给小站客服。': '把要開通的 QQ 號和套餐發給小站客服。',
    '付款开通': '付款開通', '按报价付款，一般几分钟内开通成功。': '按報價付款，一般幾分鐘內開通成功。',
    '回 QQ 直接用': '回 QQ 直接用', '重新发消息即可，无需装任何插件。': '重新發訊息即可，無需裝任何插件。',
    '查查自己的': '查查自己的', '开通和用量': '開通和用量',
    '填 QQ 号就能看最近 5 条记录，订单号可以不填。': '填 QQ 號就能看最近 5 條記錄，訂單號可以不填。',
    'QQ 号': 'QQ 號', '订单号（可选）': '訂單號（可選）',
    '查询日志': '查詢日誌',
    '填好 QQ 号后点查询，会显示最近 5 次开通和用量记录。': '填好 QQ 號後點查詢，會顯示最近 5 次開通和用量記錄。',
    '演示模式：数据为本地模拟，接入后台后返回真实记录。': '演示模式：數據為本地模擬，接入後台後返回真實記錄。',
    '看行情': '看行情', 'K 线 · 汇率 · 新闻': 'K 線 · 匯率 · 新聞',
    '数据来自 Yahoo Finance（经公共代理，可能有延迟）。红涨蓝跌，看 K 线更顺手。': '數據來自 Yahoo Finance（經公共代理，可能有延遲）。紅漲藍跌，看 K 線更順手。',
    '搜索': '搜尋', '汇率': '匯率', '相关新闻': '相關新聞', '加载中…': '載入中…',
    '练手用，别当真': '練手用，別當真', '股票 · 汇率 · 杠杆': '股票 · 匯率 · 槓桿',
    '虚拟资金 10 万。股票不加杠杆（现金可以变负），汇率可加杠杆；保证金率太低会被强制平仓。': '虛擬資金 10 萬。股票不加槓桿（現金可以變負），匯率可加槓桿；保證金率太低會被強制平倉。',
    '现金': '現金', '持仓保证金': '持倉保證金', '总资产': '總資產', '总盈亏': '總盈虧',
    '重置账户': '重置帳戶', '现金变负表示你借钱在买，现实中会收利息。': '現金變負表示你借錢在買，現實中會收利息。',
    '股票投资': '股票投資', '汇率投资': '匯率投資', '标的': '標的', '现价': '現價',
    '数量（股）': '數量（股）', '买入': '買入', '卖出': '賣出',
    '股票全额买入，不加杠杆；卖出可以卖空，现金可能变负。': '股票全額買入，不加槓桿；賣出可以賣空，現金可能變負。',
    '做多': '做多', '做空': '做空', '保证金（¥）': '保證金（¥）',
    '杠杆': '槓桿', '开仓': '開倉', '持仓': '持倉',
    '保证金率低于 20% 会被强平': '保證金率低於 20% 會被強平',
    '还没有持仓': '還沒有持倉', '平仓': '平倉',
    '今天收在什么位置': '今天收在什麼位置', '一张图看完': '一張圖看完',
    '每天闭市后自动汇总主要指数涨跌，红涨蓝跌；下面还有明天几点开市。': '每天閉市後自動匯總主要指數漲跌，紅漲藍跌；下面還有明天幾點開市。',
    '闭市总结': '閉市總結', '保存图片': '儲存圖片',
    '开市时间': '開市時間', '以北京时间计': '以北京時間計',
    '市场': '市場', '开盘': '開盤', '收盘': '收盤', '备注': '備註',
    '美股': '美股', 'A 股': 'A 股', '港股': '港股', '日股': '日股', '外汇': '外匯', '加密': '加密',
    '冬令时；夏令时提前 1 小时': '冬令時；夏令時提前 1 小時',
    '午休 11:30–13:00': '午休 11:30–13:00', '午休 12:00–13:00': '午休 12:00–13:00', '午休 10:30–11:30': '午休 10:30–11:30',
    '连续交易，24 小时': '連續交易，24 小時', '7×24 不间断': '7×24 不間斷',
    '登录 / 注册': '登入 / 註冊', '昵称': '暱稱', '密码': '密碼',
    '随便取一个': '隨便取一個', '本机保存，不加密': '本機儲存，不加密',
    '账号只存在这台设备的浏览器里，换设备就没了。': '帳號只存在這台設備的瀏覽器裡，換設備就沒了。',
    '我的资料': '我的資料', '头像': '頭像', 'QQ 号 ': 'QQ 號 ', '简介': '簡介',
    '写点啥都行': '寫點啥都行', '保存': '儲存', '退出': '登出',
    '资料只保存在本机浏览器。': '資料只儲存在本機瀏覽器。',
    '把手机横过来用呀～': '把手機橫過來用呀～', '横屏之后内容更舒服': '橫屏之後內容更舒服',
    '本站仅作服务说明，行情为示例数据。': '本站僅作服務說明，行情為範例數據。',
    '行情来自 Yahoo Finance，可能有延迟；新闻为第三方内容。': '行情來自 Yahoo Finance，可能有延遲；新聞為第三方內容。',
    '总结图仅供娱乐，不构成投资建议。': '總結圖僅供娛樂，不構成投資建議。',
    '数据来自 Yahoo Finance，指数收盘价可能有延迟。': '數據來自 Yahoo Finance，指數收盤價可能有延遲。'
  };

  var EN = {
    '充值': 'Top up', '日志': 'Logs', '行情': 'Markets', '模拟': 'Sim', '收盘': 'Close',
    '登录': 'Sign in', '返回首页': 'Home', '← 返回首页': '← Home',
    '给 Mika 的 Claude 花米！': 'Claude for Mika!',
    '查股股、充米米、查日志': 'Stocks, top-ups, logs',
    '专门为供奉 Claude 大小姐开的网站^ω^': 'A little shrine for Claude ^ω^',
    '想干点啥': 'What now', '点一个进去': 'Pick one',
    '充米米': 'Top up', '查日志': 'Logs', '查股股': 'Markets',
    '给 QQ 号开 Claude 套餐，体验、标准、无限三档，按月续。': 'Open a Claude plan for a QQ ID, three tiers, monthly.',
    '按 QQ 号查最近的开通记录和每日用量，心里有数。': 'Check recent plans and daily usage by QQ ID.',
    '常用行情一眼看，想看实时的再点去东方财富。': 'Quick market glance; click for live quotes.',
    '去看看 →': 'Go →', '去查查 →': 'Check →', '去瞧瞧 →': 'Look →',
    '翻翻照片': 'Photos', '点一下换一张': 'Tap to flip',
    '欢迎来 Claude 小站，随便逛逛～': 'Welcome, look around~',
    '今天也在好好供奉 Claude 大小姐。': 'Another day serving Claude.',
    '查股股可以，别拿它当投资建议哦。': 'Not investment advice.',
    '有事就戳我一下～': 'Tap me~',
    '供奉 Claude 大小姐': 'Serving Claude', '按月挑一档就好': 'Pick a plan',
    '三档按日用次数分，随时可以停，不绑长周期。': 'Three tiers by daily usage, cancel anytime.',
    '按品质分类': 'By tier',
    '体验版': 'Trial', '标准版': 'Standard', '无限版': 'Unlimited', '推荐': 'Recommended',
    '每日 50 次对话': '50 chats/day', '标准模型速度': 'Standard speed', '适合偶尔用用': 'For occasional use',
    '每日 300 次对话': '300 chats/day', '优先响应通道': 'Priority queue', '支持图片理解': 'Vision support',
    '不限对话次数': 'Unlimited chats', '长上下文模式': 'Long context', '专属通道优先': 'Dedicated lane',
    '怎么开通': 'How it works', '三步就完事': 'Three steps',
    '加 QQ 报号': 'Send QQ ID', '把要开通的 QQ 号和套餐发给小站客服。': 'Send the QQ ID and plan to the bot.',
    '付款开通': 'Pay', '按报价付款，一般几分钟内开通成功。': 'Usually activated in a few minutes.',
    '回 QQ 直接用': 'Use in QQ', '重新发消息即可，无需装任何插件。': 'Just message again, no plugin needed.',
    '查查自己的': 'Check your', '开通和用量': 'plans and usage',
    '填 QQ 号就能看最近 5 条记录，订单号可以不填。': 'Enter your QQ ID to see the last 5 records.',
    'QQ 号': 'QQ ID', '订单号（可选）': 'Order no. (optional)',
    '查询日志': 'Query',
    '填好 QQ 号后点查询，会显示最近 5 次开通和用量记录。': 'Fill in your QQ ID and tap Query.',
    '演示模式：数据为本地模拟，接入后台后返回真实记录。': 'Demo mode: local mock data.',
    '看行情': 'Markets', 'K 线 · 汇率 · 新闻': 'Charts · FX · News',
    '数据来自 Yahoo Finance（经公共代理，可能有延迟）。红涨蓝跌，看 K 线更顺手。': 'Data from Yahoo Finance via public proxy, may be delayed. Red up, blue down.',
    '搜索': 'Search', '汇率': 'FX', '相关新闻': 'News', '加载中…': 'Loading…',
    '练手用，别当真': 'Practice only', '股票 · 汇率 · 杠杆': 'Stocks · FX · Leverage',
    '虚拟资金 10 万。股票不加杠杆（现金可以变负），汇率可加杠杆；保证金率太低会被强制平仓。': 'Virtual 100k. Stocks are unleveraged (cash can go negative); FX allows leverage. Low margin ratio triggers liquidation.',
    '现金': 'Cash', '持仓保证金': 'Margin used', '总资产': 'Equity', '总盈亏': 'P&L',
    '重置账户': 'Reset', '现金变负表示你借钱在买，现实中会收利息。': 'Negative cash means you borrowed.',
    '股票投资': 'Stocks', '汇率投资': 'FX', '标的': 'Symbol', '现价': 'Price',
    '数量（股）': 'Shares', '买入': 'Buy', '卖出': 'Sell',
    '股票全额买入，不加杠杆；卖出可以卖空，现金可能变负。': 'Full-cash stock buys, no leverage; short selling allowed, cash can go negative.',
    '做多': 'Long', '做空': 'Short', '保证金（¥）': 'Margin (¥)',
    '杠杆': 'Leverage', '开仓': 'Open', '持仓': 'Positions',
    '保证金率低于 20% 会被强平': 'Liquidated below 20% margin ratio',
    '还没有持仓': 'No positions', '平仓': 'Close',
    '今天收在什么位置': 'Where markets closed', '一张图看完': 'One chart',
    '每天闭市后自动汇总主要指数涨跌，红涨蓝跌；下面还有明天几点开市。': 'Daily close summary of major indexes, red up blue down; market hours below.',
    '闭市总结': 'Closing summary', '保存图片': 'Save image',
    '开市时间': 'Market hours', '以北京时间计': 'Beijing time',
    '市场': 'Market', '开盘': 'Open', '收盘': 'Close', '备注': 'Note',
    '美股': 'US', 'A 股': 'A-shares', '港股': 'HK', '日股': 'Japan', '外汇': 'FX', '加密': 'Crypto',
    '冬令时；夏令时提前 1 小时': 'Winter time; 1h earlier in summer',
    '午休 11:30–13:00': 'Break 11:30–13:00', '午休 12:00–13:00': 'Break 12:00–13:00', '午休 10:30–11:30': 'Break 10:30–11:30',
    '连续交易，24 小时': 'Continuous, 24h', '7×24 不间断': '7×24',
    '登录 / 注册': 'Sign in / Sign up', '昵称': 'Nickname', '密码': 'Password',
    '随便取一个': 'Pick one', '本机保存，不加密': 'Local only, not encrypted',
    '账号只存在这台设备的浏览器里，换设备就没了。': 'Stored only in this browser.',
    '我的资料': 'My profile', '头像': 'Avatar', '简介': 'Bio',
    '写点啥都行': 'Anything', '保存': 'Save', '退出': 'Sign out',
    '资料只保存在本机浏览器。': 'Saved locally only.',
    '把手机横过来用呀～': 'Rotate your phone~', '横屏之后内容更舒服': 'Landscape is comfier',
    '本站仅作服务说明，行情为示例数据。': 'For reference only.',
    '行情来自 Yahoo Finance，可能有延迟；新闻为第三方内容。': 'Yahoo Finance data may be delayed; news from third parties.',
    '总结图仅供娱乐，不构成投资建议。': 'For fun only, not investment advice.',
    '数据来自 Yahoo Finance，指数收盘价可能有延迟。': 'Yahoo Finance data may be delayed.'
  };

  var DICT = { 'zh-Hant': HANT, 'en': EN };
  var lang = q.lang || localStorage.getItem(LS) || 'zh-Hans';
  if (lang !== 'zh-Hans' && lang !== 'zh-Hant' && lang !== 'en') lang = 'zh-Hans';

  var orig = new WeakMap();

  function applyNode(node) {
    if (!orig.has(node)) orig.set(node, node.nodeValue);
    var base = orig.get(node);
    var key = base.trim();
    if (!key) return;
    if (lang === 'zh-Hans') { if (node.nodeValue !== base) node.nodeValue = base; return; }
    var d = DICT[lang];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) {
      var lead = base.match(/^\s*/)[0];
      var trail = base.match(/\s*$/)[0];
      var next = lead + d[key] + trail;
      if (node.nodeValue !== next) node.nodeValue = next;
    } else if (node.nodeValue !== base) {
      node.nodeValue = base;
    }
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { applyNode(root); return; }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var list = [];
    var n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (node) {
      var p = node.parentNode;
      if (!p) return;
      var tag = p.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'OPTION') return;
      applyNode(node);
    });
    /* attributes */
    var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label]') : [];
    Array.prototype.forEach.call(els, function (el) {
      ['placeholder', 'aria-label'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v == null) return;
        if (!el.__orig) el.__orig = {};
        if (!(attr in el.__orig)) el.__orig[attr] = v;
        var base = el.__orig[attr];
        var d = DICT[lang];
        if (lang !== 'zh-Hans' && d && Object.prototype.hasOwnProperty.call(d, base.trim())) {
          el.setAttribute(attr, d[base.trim()]);
        } else {
          el.setAttribute(attr, base);
        }
      });
    });
  }

  var pop = null;

  function closePop() {
    if (pop) { pop.remove(); pop = null; }
    document.removeEventListener('click', onOutside, true);
  }
  function onOutside(e) {
    if (!pop) return;
    if (pop.contains(e.target) || (e.target.closest && e.target.closest('.lang-ball'))) return;
    closePop();
  }

  function chooseLang(next) {
    lang = next;
    localStorage.setItem(LS, lang);
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : lang === 'zh-Hant' ? 'zh-Hant' : 'zh-CN');
    scan(document.body);
    closePop();
  }

  function openPop(anchor) {
    closePop();
    pop = document.createElement('div');
    pop.className = 'lang-pop';
    [['zh-Hans', '简体'], ['zh-Hant', '繁體'], ['en', 'English']].forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = it[1];
      if (lang === it[0]) b.className = 'on';
      b.addEventListener('click', function (e) { e.stopPropagation(); chooseLang(it[0]); });
      pop.appendChild(b);
    });
    document.body.appendChild(pop);
    var r = anchor.getBoundingClientRect();
    var pw = pop.offsetWidth || 96;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 8);
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + 6) + 'px';
    setTimeout(function () { document.addEventListener('click', onOutside, true); }, 0);
  }

  function buildBalls() {
    var nav = document.querySelector('header nav');
    if (!nav || nav.querySelector('.lang-ball')) return;
    var links = nav.querySelectorAll('a');
    Array.prototype.forEach.call(links, function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-ball';
      b.setAttribute('aria-label', 'Language / 语言 / 語言');
      b.textContent = '🌐';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (pop) { closePop(); return; }
        openPop(b);
      });
      a.parentNode.insertBefore(b, a.nextSibling);
    });
  }

  function start() {
    buildBalls();
    scan(document.body);
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : lang === 'zh-Hant' ? 'zh-Hant' : 'zh-CN');
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          if (m.type === 'characterData') { applyNode(m.target); return; }
          Array.prototype.forEach.call(m.addedNodes, function (node) {
            if (node.nodeType === 3) applyNode(node);
            else if (node.nodeType === 1) scan(node);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
