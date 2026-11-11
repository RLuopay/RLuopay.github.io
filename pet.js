(function () {
  'use strict';

  var DEFAULT = 2;
  var PAID_IMG = 'assets/pet/pet7.webp';
  var PAID_IDX = 6;

  function isPaid() { try { return localStorage.getItem('claudePaid') === '1'; } catch (e) { return false; } }
  function markPaid() { try { localStorage.setItem('claudePaid', '1'); } catch (e) {} }

  var PETS = [
    {
      src: 'assets/pet/pet1.webp',
      text: {
        'zh-Hans': ['哼，才不是等你呢。', '再不来我就自己玩了…', '戳那么重干嘛啦！', '今天也是我等你哦。', '别笑，我认真的。'],
        'zh-Hant': ['哼，才不是等你呢。', '再不來我就自己玩了…', '戳那麼重幹嘛啦！', '今天也是我等你哦。', '別笑，我認真的。'],
        'en': ['Hmph, I was not waiting for you.', 'I would have played alone…', 'Why poke so hard!', 'I waited for you today too.', 'Do not laugh, I mean it.']
      }
    },
    {
      src: 'assets/pet/pet2.webp',
      text: {
        'zh-Hans': ['谢谢主人～最喜欢你了。', '今天也要开开心心的哦。', '帮你许了个小愿望。', '我很好哄的，真的。', '嘿嘿，被戳到心里啦。'],
        'zh-Hant': ['謝謝主人～最喜歡你了。', '今天也要開開心心的哦。', '幫你許了個小願望。', '我很好哄的，真的。', '嘿嘿，被戳到心裡啦。'],
        'en': ['Thank you~ I like you the most.', 'Be happy today too.', 'I made a little wish for you.', 'I am easy to please, really.', 'Hehe, you poked my heart.']
      }
    },
    {
      src: 'assets/pet/pet3.webp',
      text: {
        'zh-Hans': ['有事就戳我一下。', '我是这里的小管家。', '要不要看看套餐呀？', '书拿反了…才没有。', '今天也好好陪着你。'],
        'zh-Hant': ['有事就戳我一下。', '我是這裡的小管家。', '要不要看看套餐呀？', '書拿反了…才沒有。', '今天也好好陪著你。'],
        'en': ['Poke me if you need anything.', 'I am the little caretaker here.', 'Wanna see the plans?', 'The book is upside down… no it is not.', 'I will stay with you today too.']
      }
    },
    {
      src: 'assets/pet/pet4.webp',
      text: {
        'zh-Hans': ['偷偷吃一口，不给你。', '面包比作业香。', '饿了吧？我也饿。', '吃完这口就干活！', '不许笑我吃相。'],
        'zh-Hant': ['偷偷吃一口，不給你。', '麵包比作業香。', '餓了吧？我也餓。', '吃完這口就幹活！', '不許笑我吃相。'],
        'en': ['Just one bite, not for you.', 'Bread beats homework.', 'Hungry? Me too.', 'One more bite then work!', 'Do not laugh at my manners.']
      }
    },
    {
      src: 'assets/pet/pet5.webp',
      text: {
        'zh-Hans': ['哼哼～今天心情超好。', '唱歌给你听要不要？', '啦啦啦～', '转个圈给你看。', '开心的时候要分享呀。'],
        'zh-Hant': ['哼哼～今天心情超好。', '唱歌給你聽要不要？', '啦啦啦～', '轉個圈給你看。', '開心的時候要分享呀。'],
        'en': ['Humming~ I am in a great mood today.', 'Want me to sing?', 'La la la~', 'Watch me twirl.', 'Share the joy.']
      }
    },
    {
      src: 'assets/pet/pet6.webp',
      text: {
        'zh-Hans': ['在想人生的意义…还是算了。', '无聊的时候就这么坐着。', '你忙你的，我陪你。', '偷看一下你在干嘛。', '发呆也是工作的一部分。'],
        'zh-Hant': ['在想人生的意義…還是算了。', '無聊的時候就這麼坐著。', '你忙你的，我陪你。', '偷看一下你在幹嘛。', '發呆也是工作的一部分。'],
        'en': ['Thinking about life… never mind.', 'Just sitting when bored.', 'Do your thing, I am here.', 'Peeking at what you do.', 'Spacing out is part of the job.']
      }
    },
    {
      src: 'assets/pet/pet7.webp',
      text: {
        'zh-Hans': ['哇！这个好好玩！', '你刚才说什么？再说一遍！', '真的吗真的吗？', '眼睛在发光呢～', '好厉害，再来一次！'],
        'zh-Hant': ['哇！這個好好玩！', '你剛才說什麼？再說一遍！', '真的嗎真的嗎？', '眼睛在發光呢～', '好厲害，再來一次！'],
        'en': ['Wow! This is fun!', 'What did you say? Again!', 'Really really?', 'My eyes are shining~', 'Amazing, do it again!']
      }
    },
    {
      src: 'assets/pet/pet8.webp',
      text: {
        'zh-Hans': ['这个字念什么来着…', '看不懂，但装懂。', '你懂的话教教我嘛。', '书里怎么没有写你？', '疑惑中，请稍后再问。'],
        'zh-Hant': ['這個字念什麼來著…', '看不懂，但裝懂。', '你懂的話教教我嘛。', '書裡怎麼沒有寫你？', '疑惑中，請稍後再問。'],
        'en': ['How do you read this…', 'I do not get it, but I will pretend.', 'Teach me if you know.', 'Why is it not about you?', 'Confused, try later.']
      }
    },
    {
      src: 'assets/pet/pet9.webp',
      text: {
        'zh-Hans': ['送你一朵花，别嫌弃。', '花香很淡，我很喜欢。', '许愿要闭上眼哦。', '今天也要香香的。', '花开得很好，像你一样。'],
        'zh-Hant': ['送你一朵花，別嫌棄。', '花香很淡，我很喜歡。', '許願要閉上眼哦。', '今天也要香香的。', '花開得很好，像你一樣。'],
        'en': ['A flower for you, do not refuse.', 'The scent is faint, I like it.', 'Close your eyes to wish.', 'Stay fragrant today.', 'The flower blooms like you.']
      }
    }
  ];

  var HAPPY = {
    'zh-Hans': ['哇！你真好！', '谢谢主人～我最喜欢你了！', '收到啦！今天也元气满满！', '你真的太温柔了…', '诶嘿，我会好好努力的！', '主人破费啦，抱抱～', '这么多心意，我记住啦！', '好开心，转个圈给你看！', '下次也要来找我哦～', '有你在我就不怕啦！'],
    'zh-Hant': ['哇！你真好！', '謝謝主人～我最喜歡你了！', '收到啦！今天也元氣滿滿！', '你真的太溫柔了…', '欸嘿，我會好好努力的！', '主人破費啦，抱抱～', '這麼多心意，我記住啦！', '好開心，轉個圈給你看！', '下次也要來找我哦～', '有你在我就不怕啦！'],
    'en': ['Wow! You are so kind!', 'Thank you~ I like you the most!', 'Got it! Full of energy today!', 'You are so sweet…', 'Hehe, I will do my best!', 'You spent so much, hug~', 'I will remember this!', 'So happy, watch me twirl!', 'Come find me again~', 'With you I am not scared!']
  };

  function curLang() {
    var l = document.documentElement.getAttribute('lang') || '';
    var stored = '';
    try { stored = localStorage.getItem('claudeLang') || ''; } catch (e) {}
    if (stored === 'en' || l === 'en') return 'en';
    if (stored === 'zh-Hant' || l === 'zh-Hant') return 'zh-Hant';
    return 'zh-Hans';
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ---------- shared behavior ---------- */
  function avatar(root, imgEl, bubble, opts) {
    opts = opts || {};
    var cur = DEFAULT;
    var backTimer = null;
    var hideTimer = null;

    function say(text) {
      if (!bubble) return;
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('show'); }, 4200);
    }

    function render(idx, animate) {
      if (!imgEl) return;
      imgEl.classList.remove('fade');
      void imgEl.offsetWidth;
      imgEl.src = PETS[idx].src;
      if (animate) imgEl.classList.add('fade');
      cur = idx;
    }

    function poke() {
      var n = cur;
      if (opts.paidFixed) {
        var fixedTexts = PETS[PAID_IDX].text[curLang()] || PETS[PAID_IDX].text['zh-Hans'];
        say(pick(fixedTexts));
        root.classList.remove('wiggle');
        void root.offsetWidth;
        root.classList.add('wiggle');
        setTimeout(function () { root.classList.remove('wiggle'); }, 560);
        return;
      }
      while (PETS.length > 1 && n === cur) n = Math.floor(Math.random() * PETS.length);
      render(n, true);
      say(pick(PETS[n].text[curLang()] || PETS[n].text['zh-Hans']));
      root.classList.remove('wiggle');
      void root.offsetWidth;
      root.classList.add('wiggle');
      setTimeout(function () { root.classList.remove('wiggle'); }, 560);
      clearTimeout(backTimer);
      backTimer = setTimeout(function () {
        render(DEFAULT, true);
        var d = PETS[DEFAULT].text[curLang()] || PETS[DEFAULT].text['zh-Hans'];
        say(d[Math.floor(Math.random() * d.length)]);
      }, 5000);
    }


    var paidTimer = null;
    function setPaid() {
      opts.paidFixed = true;
      clearTimeout(backTimer);
      clearTimeout(paidTimer);
      if (imgEl) {
        imgEl.src = PAID_IMG;
        imgEl.classList.remove('fade');
        void imgEl.offsetWidth;
        imgEl.classList.add('fade');
      }
      paidTimer = setTimeout(function () {
        opts.paidFixed = false;
        render(DEFAULT, true);
      }, 8000);
    }

    var d = PETS[DEFAULT].text[curLang()] || PETS[DEFAULT].text['zh-Hans'];
    say(d[Math.floor(Math.random() * d.length)]);
    return { poke: poke, say: say, setPaid: setPaid };
  }

  /* ---------- home page hero pet ---------- */
  var hero = document.getElementById('pet');
  var heroImg = document.getElementById('petImg');
  var heroBubble = document.getElementById('petBubble');

  if (hero && heroImg) {
    var pet = avatar(hero, heroImg, heroBubble, {});
    hero.addEventListener('click', function () { pet.poke(); });
    hero.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pet.poke(); }
    });
    setTimeout(function () {
    var r = el.getBoundingClientRect();
    if (r.right < 8 || r.bottom < 8 || r.left > window.innerWidth - 8 || r.top > window.innerHeight - 8 || r.width === 0) {
      el.style.left = 'auto';
      el.style.top = 'auto';
      el.style.right = '22px';
      el.style.bottom = '22px';
      try { localStorage.removeItem('claudePetPos'); } catch (e) {}
    }
  }, 800);

  window.petCelebrate = function () {
      var t = HAPPY[curLang()] || HAPPY['zh-Hans'];
      pet.say(pick(t));
    };
    return;
  }

  /* ---------- floating pet on other pages ---------- */
  if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) {
    /* still show, smaller */
  }

  var big = document.body.getAttribute('data-pet') === 'big';
  if (!big) return; /* floating pet only on the recharge page */

  var el = document.createElement('div');
  el.className = 'float-pet' + (big ? ' big' : '');
  el.style.cssText = big
    ? 'position:fixed;right:22px;bottom:22px;width:160px;height:170px;z-index:880;'
    : 'position:fixed;right:22px;bottom:22px;width:96px;height:104px;z-index:880;';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', 'Claude pet');
  el.innerHTML =
    '<div class="float-pet-bubble" data-i18n-skip="1"></div>' +
    '<img class="float-pet-img" src="assets/pet/pet3.webp" alt="Claude" />';

  var img = el.querySelector('.float-pet-img');
  var bub = el.querySelector('.float-pet-bubble');

  /* restore saved position */
  try {
    var pos = JSON.parse(localStorage.getItem('claudePetPos') || 'null');
    var inView = pos && typeof pos.x === 'number' &&
      pos.x > -10 && pos.y > -10 &&
      pos.x < window.innerWidth - 40 && pos.y < window.innerHeight - 40;
    if (inView) {
      el.style.left = pos.x + 'px';
      el.style.top = pos.y + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
  } catch (e) {}

  document.body.appendChild(el);

  try { localStorage.removeItem('claudePaid'); } catch (e) {}
  var petApi = avatar(el, img, bub, {});

  if (big) {
    el.addEventListener('click', function () { petApi.poke(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); petApi.poke(); }
    });
  }

  /* drag (small pet only) */
  var drag = { down: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 };
  if (!big) el.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    drag.down = true;
    drag.moved = false;
    drag.sx = e.clientX;
    drag.sy = e.clientY;
    var r = el.getBoundingClientRect();
    drag.ox = e.clientX - r.left;
    drag.oy = e.clientY - r.top;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  if (!big) el.addEventListener('pointermove', function (e) {
    if (!drag.down) return;
    var dx = e.clientX - drag.sx;
    var dy = e.clientY - drag.sy;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    var nx = e.clientX - drag.ox;
    var ny = e.clientY - drag.oy;
    nx = Math.max(4, Math.min(nx, window.innerWidth - el.offsetWidth - 4));
    ny = Math.max(4, Math.min(ny, window.innerHeight - el.offsetHeight - 4));
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  });
  if (!big) el.addEventListener('pointerup', function (e) {
    if (!drag.down) return;
    drag.down = false;
    if (!drag.moved) {
      petApi.poke();
    } else {
      try {
        var r = el.getBoundingClientRect();
        localStorage.setItem('claudePetPos', JSON.stringify({ x: r.left, y: r.top }));
      } catch (err) {}
    }
  });
  if (!big) el.addEventListener('pointercancel', function () { drag.down = false; });

  setTimeout(function () {
    var r = el.getBoundingClientRect();
    if (r.right < 8 || r.bottom < 8 || r.left > window.innerWidth - 8 || r.top > window.innerHeight - 8 || r.width === 0) {
      el.style.left = 'auto';
      el.style.top = 'auto';
      el.style.right = '22px';
      el.style.bottom = '22px';
      try { localStorage.removeItem('claudePetPos'); } catch (e) {}
    }
  }, 800);

  window.petCelebrate = function () {
    petApi.setPaid();
    img.classList.remove('fade');
    void img.offsetWidth;
    img.classList.add('fade');
    var t = HAPPY[curLang()] || HAPPY['zh-Hans'];
    petApi.say(pick(t));
  };

  /* paid=1 -> celebrate */
  try {
    if (/[?&]paid=1/.test(location.search)) {
      setTimeout(function () { window.petCelebrate(); }, 900);
    }
  } catch (e) {}
})();
