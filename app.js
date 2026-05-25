/* Digital Skills Workshop — interactive layer (CSP-safe, no inline handlers) */
(function () {
  'use strict';

  const TOTAL = 12;
  const INTERACTIVE = [5, 8];

  const SECTION_LABELS = {
    1:  '',
    2:  '议程 · Agenda',
    3:  '电邮 · Email',
    4:  '找工 · Job Search',
    5:  '互动 · Activity',
    6:  '找工 · Job Search',
    7:  '申请 · Applying',
    8:  '互动 · Quiz',
    9:  '申请 · Applying',
    10: '小工具 · Helper',
    11: 'CSC 服务',
    12: '资源 · Resources',
  };

  let cur = 1;

  /* ── Language toggle ─────────────────────────────────── */
  function toggleLang() {
    const isZh = document.body.classList.toggle('zh');
    try { localStorage.setItem('dsw_lang', isZh ? 'zh' : 'en'); } catch (_) {}
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    document.getElementById('langToggle').textContent = isZh ? '中文' : 'EN';
  }

  (function initLang() {
    let saved = null;
    try { saved = localStorage.getItem('dsw_lang'); } catch (_) {}
    const isZh = saved !== 'en';
    document.body.classList.toggle('zh', isZh);
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    const tog = document.getElementById('langToggle');
    if (tog) tog.textContent = isZh ? '中文' : 'EN';
  })();

  /* ── Reveal state helpers ────────────────────────────── */
  function isRevealed(n) {
    const el = document.getElementById('slide-' + n);
    if (!el) return false;
    if (n === 8) return el.dataset.phase === 'done';
    return el.dataset.phase === 'answer';
  }

  function updateNextBtn() {
    const btn = document.getElementById('nextBtn');
    const gated = INTERACTIVE.includes(cur) && !isRevealed(cur);
    btn.disabled = (cur === TOTAL) || gated;
    btn.setAttribute('aria-label', gated
      ? '请先完成本页互动 · Complete this slide first'
      : '下一页 · Next slide');
  }

  /* ── Slide 5: Activity reveal ────────────────────────── */
  function revealActivity() {
    const slide = document.getElementById('slide-5');
    slide.dataset.phase = 'answer';
    document.getElementById('ans-A').classList.add('match-1');
    document.getElementById('ans-B').classList.add('match-2');
    document.getElementById('ans-C').classList.add('match-3');
    document.getElementById('why-A').classList.add('match-1');
    document.getElementById('why-B').classList.add('match-2');
    document.getElementById('why-C').classList.add('match-3');
    document.getElementById('activity-answer').style.display = 'block';
    document.getElementById('reveal-btn-5').disabled = true;
    updateNextBtn();
  }

  /* ── Slide 8: Q1 / Q2 reveals ────────────────────────── */
  function revealQ1() {
    const slide = document.getElementById('slide-8');
    slide.dataset.phase = 'q2';
    document.getElementById('q1-answer').style.display = 'block';
    document.getElementById('q2-block').style.display = 'block';
    document.getElementById('reveal-btn-q1').disabled = true;
  }

  function revealQ2() {
    const slide = document.getElementById('slide-8');
    slide.dataset.phase = 'done';
    document.getElementById('q2-answer').style.display = 'block';
    document.getElementById('reveal-btn-q2').disabled = true;
    updateNextBtn();
  }

  /* ── Navigation ──────────────────────────────────────── */
  function showSlide(n) {
    document.querySelectorAll('.slide').forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
    });
    document.getElementById('slideCounter').textContent = n + ' / ' + TOTAL;
    document.getElementById('sectionLabel').textContent = SECTION_LABELS[n] || '';

    const dots = document.getElementById('progressDots');
    dots.innerHTML = Array.from({ length: TOTAL }, (_, i) => {
      const cls = i + 1 === n ? 'active' : i + 1 < n ? 'done' : '';
      return '<span class="dot ' + cls + '" aria-hidden="true"></span>';
    }).join('');

    document.querySelectorAll('.slide [tabindex="-1"]').forEach(el => el.removeAttribute('tabindex'));
    const heading = document.querySelector('#slide-' + n + ' h1, #slide-' + n + ' h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }

    document.getElementById('prevBtn').disabled = (n === 1);
    updateNextBtn();
  }

  function nextSlide() {
    if (INTERACTIVE.includes(cur) && !isRevealed(cur)) return;
    if (cur < TOTAL) { cur++; showSlide(cur); }
  }

  function prevSlide() {
    if (cur > 1) { cur--; showSlide(cur); }
  }

  function goHome() {
    cur = 1;
    showSlide(1);
  }

  /* ── Delegated click handler (CSP-safe) ──────────────── */
  const ACTIONS = {
    'toggle-lang': toggleLang,
    'reveal-activity': revealActivity,
    'reveal-q1': revealQ1,
    'reveal-q2': revealQ2,
    'next-slide': nextSlide,
    'prev-slide': prevSlide,
    'go-home': goHome,
  };

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    const fn = ACTIONS[action];
    if (fn) {
      e.stopPropagation();
      fn();
    }
  });

  /* ── Advance-by-tap (slides area) ────────────────────── */
  document.getElementById('slidesArea').addEventListener('click', function (e) {
    if (e.target.closest('a, button, [data-action]')) return;
    nextSlide();
  });

  /* ── Keyboard navigation ─────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault(); nextSlide();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); prevSlide();
    }
  });

  /* ── Date on title slide ─────────────────────────────── */
  (function () {
    const now = new Date();
    const dl = document.getElementById('dateLine');
    if (dl) dl.textContent = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
  })();

  /* ── QR Code (slide 12) ──────────────────────────────── */
  try {
    /* global QRCode */
    new QRCode(document.getElementById('qr-container'), {
      text: 'https://digital-skills-workshop.pages.dev/resources',
      width: 148,
      height: 148,
      colorDark: '#4f46e5',
      colorLight: '#f5f3ff'
    });
  } catch (e) {
    const el = document.getElementById('qr-container');
    if (el) el.textContent = 'digital-skills-workshop.pages.dev/resources';
  }

  /* ── Service Worker ──────────────────────────────────── */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  showSlide(1);
})();

/* print-slides-handout: capture phase so it beats deck nav/advance handlers */
document.addEventListener('click', function (e) {
  var t = e.target && e.target.closest && e.target.closest('[data-action="print"]');
  if (t) { e.stopPropagation(); e.preventDefault(); window.print(); }
}, true);
