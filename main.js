/* =========================================================
   Galaxy Starter — main.js
   ========================================================= */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  var ANIM = HAS_GSAP && !RM;

  if (ANIM) {
    window.__gsReady = true;
    gsap.registerPlugin(ScrollTrigger);
  } else {
    root.classList.remove('js-anim');
  }

  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var mqDesktopPointer = window.matchMedia('(min-width: 861px) and (hover: hover) and (pointer: fine)');

  /* -------------------------------------------------------
     Timer: até 23:59:59 do dia, horário local
     ------------------------------------------------------- */
  var cdEls = $$('[data-countdown]');
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var now = new Date();
    var end = new Date(now);
    end.setHours(23, 59, 59, 999);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var v = { hms: pad(h) + ':' + pad(m) + ':' + pad(sec), h: pad(h), m: pad(m), s: pad(sec) };
    for (var i = 0; i < cdEls.length; i++) {
      var t = v[cdEls[i].getAttribute('data-countdown')];
      if (cdEls[i].textContent !== t) cdEls[i].textContent = t;
    }
    setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
  }
  tick();

  /* -------------------------------------------------------
     Hospedagem ativa até [mês/ano] = hoje + 12 meses
     ------------------------------------------------------- */
  (function () {
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var t = new Date();
    t.setMonth(t.getMonth() + 12);
    $$('[data-host-until]').forEach(function (el) { el.textContent = months[t.getMonth()] + '/' + t.getFullYear(); });
  })();

  /* -------------------------------------------------------
     Meta Pixel: Contact nos botões de WhatsApp
     ------------------------------------------------------- */
  $$('[data-plan]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', { content_name: el.getAttribute('data-plan') });
      }
    });
  });

  /* -------------------------------------------------------
     FAQ: um item aberto por vez
     ------------------------------------------------------- */
  var faq = $('[data-faq]');
  if (faq) {
    faq.addEventListener('toggle', function (e) {
      var t = e.target;
      if (t.tagName !== 'DETAILS' || !t.open) return;
      $$('details', faq).forEach(function (x) { if (x !== t) x.open = false; });
    }, true);
  }

  /* -------------------------------------------------------
     Dock mobile: aparece quando o hero sai da tela
     ------------------------------------------------------- */
  var dock = $('[data-dock]');
  var hero = $('.hero');
  if (dock && hero && 'IntersectionObserver' in window) {
    var dockBtn = $('a', dock);
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var on = !e.isIntersecting && e.boundingClientRect.top < 0;
      dock.classList.toggle('is-on', on);
      dock.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (dockBtn) dockBtn.tabIndex = on ? 0 : -1;
    }, { threshold: 0, rootMargin: '-40% 0px 0px 0px' }).observe(hero);
  }

  /* -------------------------------------------------------
     Escala das cenas (tamanho base fixo + scale)
     ------------------------------------------------------- */
  function fitStage(stage) {
    var sc = $('.scene', stage);
    if (!sc) return;
    var w = +sc.getAttribute('data-sw'), h = +sc.getAttribute('data-sh');
    var sw = stage.clientWidth, sh = stage.clientHeight;
    if (!sw || !sh) return;
    var mini = stage.classList.contains('stage-mini');
    var modal = stage.classList.contains('modal-stage');
    var k = mini ? 0.94 : 0.88;
    var max = modal ? 1.75 : (mini ? 1.15 : 1.3);
    var s = Math.min((sw * k) / w, (sh * k) / h, max);
    sc.style.setProperty('--s', s.toFixed(3));
  }
  var stages = $$('.stage');
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (entries) { entries.forEach(function (en) { fitStage(en.target); }); });
    stages.forEach(function (s) { ro.observe(s); });
  } else {
    stages.forEach(fitStage);
    window.addEventListener('resize', function () { stages.forEach(fitStage); });
  }

  /* -------------------------------------------------------
     Linha do processo: posiciona do 1º ao último número
     ------------------------------------------------------- */
  var stepsWrap = $('[data-steps]');
  function layoutStepsLine() {
    if (!stepsWrap) return;
    var line = $('.steps-line', stepsWrap);
    var nums = $$('.step-num', stepsWrap);
    if (!line || nums.length < 2) return;
    var wr = stepsWrap.getBoundingClientRect();
    var a = nums[0].getBoundingClientRect();
    var b = nums[nums.length - 1].getBoundingClientRect();
    var vertical = window.matchMedia('(max-width: 960px)').matches;
    if (vertical) {
      line.style.left = (a.left - wr.left + a.width / 2 - 1) + 'px';
      line.style.top = (a.top - wr.top + a.height / 2) + 'px';
      line.style.height = (b.top - a.top) + 'px';
      line.style.width = '2px';
      line.style.right = 'auto';
      line.style.bottom = 'auto';
    } else {
      line.style.left = (a.left - wr.left + a.width / 2) + 'px';
      line.style.top = (a.top - wr.top + a.height / 2 - 1) + 'px';
      line.style.width = (b.left - a.left) + 'px';
      line.style.height = '2px';
      line.style.right = 'auto';
      line.style.bottom = 'auto';
    }
  }
  if (stepsWrap) {
    layoutStepsLine();
    if ('ResizeObserver' in window) new ResizeObserver(layoutStepsLine).observe(stepsWrap);
    else window.addEventListener('resize', layoutStepsLine);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(layoutStepsLine);
  }

  /* -------------------------------------------------------
     Modal das cenas (desktop)
     ------------------------------------------------------- */
  var modal = $('[data-modal]');
  var modalStage = $('[data-modal-stage]');
  var modalApi = null;

  function cleanClone(node) {
    node.removeAttribute('style');
    $$('[style]', node).forEach(function (n) { n.removeAttribute('style'); });
    $$('[data-full]', node).forEach(function (n) { n.textContent = n.getAttribute('data-full'); });
    return node;
  }
  function closeModal() { if (modal && modal.open) modal.close(); }
  if (modal && typeof modal.showModal === 'function') {
    $$('.expand').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.scard');
        var src = $('.scene', card);
        if (!src) return;
        var clone = cleanClone(src.cloneNode(true));
        modalStage.innerHTML = '';
        modalStage.appendChild(clone);
        $('[data-modal-title]', modal).textContent = $('.scard-body h3', card).textContent;
        $('[data-modal-text]', modal).textContent = $('.scard-body p', card).textContent;
        modal.showModal();
        fitStage(modalStage);
        if (ANIM) {
          gsap.fromTo($('.modal-box', modal), { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
          modalApi = buildScene(clone);
          if (modalApi) {
            modalApi.main.eventCallback('onComplete', function () { if (modalApi && modalApi.idle) modalApi.idle.play(); });
            modalApi.main.play(0);
          }
        }
      });
    });
    $('[data-modal-close]', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener('close', function () {
      if (modalApi) {
        modalApi.main.kill();
        if (modalApi.idle) modalApi.idle.kill();
        modalApi = null;
      }
      modalStage.innerHTML = '';
    });
  }

  /* -------------------------------------------------------
     Carrossel do portfólio (marquee infinito em CSS)
     Sem JS ou com movimento reduzido: vira uma faixa rolável.
     ------------------------------------------------------- */
  if (!RM) {
    $$('[data-marquee]').forEach(function (row) {
      var track = $('.pf-track', row);
      $$('.pf', track).forEach(function (it) {
        var c = it.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        $$('img', c).forEach(function (img) { img.alt = ''; });
        track.appendChild(c);
      });
      row.classList.add('is-marquee');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          row.classList.toggle('is-paused', !en[0].isIntersecting);
        }).observe(row);
      }
    });
  }

  /* =======================================================
     Daqui em diante: só com GSAP e movimento permitido
     ======================================================= */
  if (!ANIM) return;

  /* -------------------------------------------------------
     Campo de estrelas (canvas)
     ------------------------------------------------------- */
  function starfield() {
    var c = $('[data-stars]');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var touch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var N = window.innerWidth < 700 ? 60 : 90;
    var w = 0, h = 0, pts = [], raf = 0, inView = true, visible = !d.hidden;
    var mx = 0, my = 0, tx = 0, ty = 0;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      pts = [];
      for (var i = 0; i < N; i++) {
        pts.push({
          x: Math.random(),
          y: Math.random() * 0.85,
          r: Math.random() * 1.1 + 0.35,
          a: Math.random() * 0.55 + 0.3,
          p: Math.random() * Math.PI * 2,
          s: Math.random() * 0.7 + 0.25,
          z: Math.random() * 0.9 + 0.1,
          c: Math.random() < 0.3 ? '186,157,255' : '251,250,255'
        });
      }
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      var sy = touch ? window.scrollY : 0;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var al = p.a * (0.5 + 0.5 * Math.sin(t * 0.001 * p.s + p.p));
        var x = p.x * w + mx * p.z * 16;
        var y = p.y * h + my * p.z * 16 - sy * p.z * 0.12;
        ctx.globalAlpha = al;
        ctx.fillStyle = 'rgb(' + p.c + ')';
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.2832);
        ctx.fill();
        if (p.r > 1.25) {
          ctx.globalAlpha = al * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, p.r * 3.2, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    function run() {
      var should = inView && visible;
      if (should && !raf) raf = requestAnimationFrame(frame);
      if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    size(); seed(); run();
    window.addEventListener('resize', function () { size(); });
    d.addEventListener('visibilitychange', function () { visible = !d.hidden; run(); });
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; run(); }).observe(c);
    if (!touch) {
      window.addEventListener('pointermove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }
  }
  starfield();

  /* -------------------------------------------------------
     Utilidades de animação
     ------------------------------------------------------- */
  function shineOnce(btn) {
    if (!btn) return;
    btn.classList.remove('shine-now');
    void btn.offsetWidth;
    btn.classList.add('shine-now');
    setTimeout(function () { btn.classList.remove('shine-now'); }, 950);
  }

  // Digitação letra por letra dentro de uma timeline
  function typeText(tl, el, pos, cps) {
    if (!el) return;
    var full = el.getAttribute('data-full');
    if (full == null) { full = el.textContent; el.setAttribute('data-full', full); }
    el.textContent = '';
    var o = { n: 0 };
    tl.to(o, {
      n: full.length,
      duration: full.length / (cps || 30),
      ease: 'none',
      onUpdate: function () { el.textContent = full.slice(0, Math.round(o.n)); }
    }, pos);
  }

  // Flutuação ociosa ±4px
  function floatTl(el, amp, dur) {
    amp = amp || 4; dur = dur || 3;
    var t = gsap.timeline({ repeat: -1 });
    t.to(el, { y: -amp, duration: dur / 2, ease: 'sine.inOut' })
     .to(el, { y: amp, duration: dur, ease: 'sine.inOut' })
     .to(el, { y: 0, duration: dur / 2, ease: 'sine.inOut' });
    return t;
  }

  function countUp(el, dur, delay) {
    var end = +el.getAttribute('data-count');
    var o = { v: 0 };
    el.textContent = '0';
    return gsap.to(o, {
      v: end, duration: dur || 1, delay: delay || 0, ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.round(o.v); }
    });
  }

  /* -------------------------------------------------------
     Cenas (padrão 3.9). Cada uma devolve { main, idle }.
     O HTML/CSS já representa o estado final.
     ------------------------------------------------------- */
  var SCENES = {
    search: function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.sc-search'), { opacity: 0, y: 10, duration: 0.5, ease: 'power3.out' });
      typeText(tl, q('[data-type]'), '-=0.1', 24);
      tl.from(qa('.res'), { opacity: 0, y: 14, duration: 0.45, stagger: 0.18, ease: 'power3.out' }, '+=0.2')
        .fromTo(q('.sc-badge-red'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '+=0.25');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    broken: function (s, q, qa) {
      var cursor = q('.sc-cursor');
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.sc-win'), { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out' })
        .from(qa('.bk'), { opacity: 0, duration: 0.3, stagger: 0.06 }, '-=0.2')
        .from(q('.sc-loading'), { opacity: 0, duration: 0.3 })
        .fromTo(cursor, { opacity: 0, x: 170, y: 150 }, { opacity: 1, x: 0, y: 0, duration: 1.1, ease: 'power2.inOut' }, '+=0.4')
        .to(cursor, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 }, '+=0.45')
        .to(q('.sc-back'), { scale: 0.86, duration: 0.1, yoyo: true, repeat: 1 }, '<')
        .fromTo(q('.sc-toast-red'), { opacity: 0, y: 10, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, '+=0.15');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    notif: function (s, q, qa) {
      var badge = q('[data-count-badge]');
      badge.textContent = '1';
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.sc-app'), { opacity: 0, y: 8, duration: 0.45, ease: 'power3.out' });
      qa('.ntf').forEach(function (n, i) {
        var at = 0.6 + i * 0.4;
        tl.from(n, { opacity: 0, y: -14, scale: 0.96, duration: 0.5, ease: 'back.out(1.4)' }, at);
        tl.call(function () { badge.textContent = String(i + 1); }, null, at);
        tl.fromTo(badge, { scale: 1.4 }, { scale: 1, duration: 0.35, ease: 'back.out(2.5)', immediateRender: false }, at);
      });
      tl.to({}, { duration: 0.6 });
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    copy: function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.doc'), { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' })
        .fromTo(q('.doc-old'), { opacity: 1 }, { opacity: 0.4, duration: 0.35 }, '+=0.55')
        .fromTo(q('.doc-strike'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, '<-0.35')
        .from(q('.doc-new').parentNode, { opacity: 0, y: 6, duration: 0.3 }, '-=0.05');
      typeText(tl, q('.doc-new [data-type]'), '>', 60);
      tl.from(qa('.doc-chips span'), { opacity: 0, y: 8, scale: 0.9, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' }, '+=0.1')
        .fromTo(q('.stamp'), { opacity: 0, scale: 1.6, rotation: -22 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.5, ease: 'back.out(1.6)' }, '+=0.15');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    host: function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.status'), { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out' })
        .from(q('.st-online'), { opacity: 0, scale: 0.8, duration: 0.35, ease: 'back.out(2)' }, '-=0.1')
        .fromTo(qa('.st-bars b'), { opacity: 0, scaleY: 0.3 }, { opacity: 1, scaleY: 1, duration: 0.3, stagger: 0.12, ease: 'power2.out' }, '+=0.1')
        .from(q('.st-foot'), { opacity: 0, y: 6, duration: 0.4 }, '-=0.2');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    support: function (s, q, qa) {
      var typing = q('.bub-typing');
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.chat'), { opacity: 0, y: 12, duration: 0.45, ease: 'power3.out' })
        .from(q('.bub-me'), { opacity: 0, y: 10, scale: 0.94, transformOrigin: '100% 100%', duration: 0.4, ease: 'back.out(1.5)' }, '+=0.1')
        .fromTo(typing, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, '+=0.4')
        .to(typing, { opacity: 0, duration: 0.2 }, '+=1.2')
        .fromTo(q('.bub-reply'), { opacity: 0, y: 6, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, transformOrigin: '0% 100%', duration: 0.4, ease: 'back.out(1.5)' }, '-=0.05')
        .fromTo(q('.tk-lilac'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, '+=0.3')
        .fromTo(q('.tk-gray'), { opacity: 1 }, { opacity: 0, duration: 0.3 }, '<');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    timeline: function (s, q, qa) {
      var dots = qa('.tl-dot i');
      var fill = q('.tl-fill');
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.tl'), { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out' })
        .from(qa('.tl-pt'), { opacity: 0, y: 6, duration: 0.3, stagger: 0.08 }, '-=0.2')
        .fromTo(fill, { scaleX: 0 }, { scaleX: 0, duration: 0.01 })
        .fromTo(dots[0], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' });
      for (var i = 1; i < dots.length; i++) {
        tl.to(fill, { scaleX: i / (dots.length - 1), duration: 0.5, ease: 'power1.inOut' })
          .fromTo(dots[i], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.05');
      }
      tl.fromTo(q('.pill-live'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, '+=0.05');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    versions: function (s, q, qa) {
      var tags = qa('.vtag'), arrows = qa('.varrow'), checks = qa('.vchk');
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.vers'), { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out' });
      tags.forEach(function (t) { tl.fromTo(t, { opacity: 0.3, scale: 0.92 }, { opacity: 0.3, scale: 0.92, duration: 0.01 }, 0); });
      arrows.forEach(function (a) { tl.fromTo(a, { opacity: 0.2, x: -4 }, { opacity: 0.2, x: -4, duration: 0.01 }, 0); });
      checks.forEach(function (c) { tl.fromTo(c, { opacity: 0, scale: 0 }, { opacity: 0, scale: 0, duration: 0.01 }, 0); });
      tags.forEach(function (t, i) {
        if (i) tl.to(arrows[i - 1], { opacity: 1, x: 0, duration: 0.3 }, '+=0.15');
        tl.to(t, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' });
        if (i && checks[i - 1]) tl.to(checks[i - 1], { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, '-=0.15');
      });
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    pay: function (s, q, qa) {
      var thumb = q('.pl-thumb'), a = q('.pl-a'), b = q('.pl-b');
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.paylink'), { opacity: 0, y: 14, duration: 0.5, ease: 'power3.out' })
        .from([q('.pl-val'), q('.pl-sub'), q('.pl-toggle'), q('.pl-btn'), q('.pl-cards')], { opacity: 0, y: 8, duration: 0.35, stagger: 0.1 }, '-=0.2');
      // Alterna sozinho a cada 2.5s
      var loop = gsap.timeline({ repeat: -1 });
      loop.to(thumb, { xPercent: 100, duration: 0.45, ease: 'power3.inOut' }, 2.05)
          .to(a, { opacity: 0, duration: 0.3 }, 2.05)
          .to(b, { opacity: 1, duration: 0.3 }, 2.2)
          .to(thumb, { xPercent: 0, duration: 0.45, ease: 'power3.inOut' }, 4.55)
          .to(b, { opacity: 0, duration: 0.3 }, 4.55)
          .to(a, { opacity: 1, duration: 0.3 }, 4.7)
          .set({}, {}, 5);
      var idle = gsap.timeline({ paused: true });
      idle.add(loop, 0).add(floatTl(q('.sc-main'), 4, 5), 0);
      return { main: tl, idle: idle };
    },

    brandkit: function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.kit'), { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' })
        .from(q('.kit-head'), { opacity: 0, duration: 0.3 }, '-=0.15')
        .fromTo(q('.kit-mark'), { opacity: 0, scale: 0.3, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' })
        .from(q('.kit-word'), { opacity: 0, x: -10, duration: 0.45, ease: 'power3.out' }, '-=0.25')
        .from(qa('.sw'), { opacity: 0, scale: 0.6, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' }, '+=0.05')
        .from(q('.kit-type'), { opacity: 0, y: 8, duration: 0.4 }, '-=0.2')
        .from(q('.kit-aa'), { opacity: 0, scale: 0.8, duration: 0.45, ease: 'back.out(1.8)' }, '-=0.15')
        .fromTo(qa('.kit-fonts .ln'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, stagger: 0.12, ease: 'power2.out' }, '-=0.2');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main')), 0);
      return { main: tl, idle: idle };
    },

    /* ---- Mini-cenas do processo ---- */
    'm-brief': function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.m-form'), { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' });
      var texts = qa('.mf-t'), checks = qa('.mf-c');
      checks.forEach(function (c) { tl.fromTo(c, { opacity: 0, scale: 0 }, { opacity: 0, scale: 0, duration: 0.01 }, 0); });
      texts.forEach(function (t, i) {
        typeText(tl, t, '+=0.1', 34);
        tl.to(checks[i], { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
      });
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main'), 3, 4), 0);
      return { main: tl, idle: idle };
    },

    'm-copy': function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.m-sheet'), { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' })
        .fromTo(qa('.ln'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, stagger: 0.14, ease: 'power2.out' })
        .fromTo(q('.stamp'), { opacity: 0, scale: 1.6, rotation: -22 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.45, ease: 'back.out(1.6)' }, '+=0.1');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main'), 3, 4), 0);
      return { main: tl, idle: idle };
    },

    'm-mood': function (s, q, qa) {
      var from = [
        { x: -34, y: -22, rotation: -14 },
        { x: 32, y: -26, rotation: 12 },
        { x: -28, y: 26, rotation: 10 },
        { x: 34, y: 22, rotation: -12 }
      ];
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.m-mood'), { opacity: 0, duration: 0.3 });
      qa('.mb').forEach(function (b, i) {
        tl.from(b, { opacity: 0, x: from[i].x, y: from[i].y, rotation: from[i].rotation, scale: 0.8, duration: 0.6, ease: 'back.out(1.4)' }, 0.15 + i * 0.14);
      });
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main'), 3, 4), 0);
      return { main: tl, idle: idle };
    },

    'm-dev': function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.from(q('.m-dev'), { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' })
        .from(qa('.md'), { opacity: 0, scaleY: 0.2, duration: 0.35, stagger: 0.12, ease: 'power2.out' })
        .fromTo(q('.md-tag'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '+=0.1');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main'), 3, 4), 0);
      return { main: tl, idle: idle };
    },

    'm-live': function (s, q, qa) {
      var tl = gsap.timeline({ paused: true });
      tl.fromTo(q('.m-toast'), { opacity: 0, scale: 0.6, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)' })
        .from(qa('.conf i'), { x: 0, y: 0, rotation: 0, scale: 0.3, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.03 }, '-=0.25');
      var idle = gsap.timeline({ paused: true });
      idle.add(floatTl(q('.sc-main'), 3, 4), 0);
      return { main: tl, idle: idle };
    }
  };

  function buildScene(sceneEl) {
    var fn = SCENES[sceneEl.getAttribute('data-scene')];
    if (!fn) return null;
    var q = function (sel) { return sceneEl.querySelector(sel); };
    var qa = function (sel) { return $$(sel, sceneEl); };
    return fn(sceneEl, q, qa);
  }

  // Controla: começa com 40% visível, pausa fora da tela, depois loop ocioso
  function controlScene(holder, sceneEl, auto) {
    var api = buildScene(sceneEl);
    if (!api) return null;
    var started = false, visible = false;
    api.main.eventCallback('onComplete', function () { if (api.idle && visible) api.idle.play(); });
    function start() {
      if (started) return;
      started = true;
      if (visible) api.main.play();
    }
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      visible = e.isIntersecting;
      holder.classList.toggle('is-paused', !visible);
      if (!visible) {
        api.main.pause();
        if (api.idle) api.idle.pause();
        return;
      }
      if (auto && e.intersectionRatio >= 0.4) start();
      if (started) {
        if (api.main.progress() < 1) api.main.play();
        else if (api.idle) api.idle.play();
      }
    }, { threshold: [0, 0.4] }).observe(holder);
    return { start: start };
  }

  $$('.scard, [data-scene-card]').forEach(function (card) {
    var sc = $('.scene', card);
    if (sc) controlScene(card, sc, true);
  });

  // Bônus: "R$ 800" riscado quando o bloco entra na tela
  var bonusStrike = $('.bonus .strike');
  if (bonusStrike) {
    gsap.fromTo(bonusStrike, { scaleX: 0 }, {
      scaleX: 1, duration: 0.6, ease: 'power2.inOut', delay: 0.4,
      scrollTrigger: { trigger: '.bonus-price', start: 'top 85%', once: true }
    });
  }

  /* -------------------------------------------------------
     Hero: timeline de entrada
     ------------------------------------------------------- */
  function splitTitle(h1) {
    var lines = $$('.line', h1);
    var orig = lines.map(function (l) { return l.innerHTML; });
    lines.forEach(function (l) {
      var words = l.textContent.trim().split(/\s+/);
      l.innerHTML = words.map(function (w) { return '<span class="w"><span class="wi">' + w + '</span></span>'; }).join(' ');
    });
    var g = $('.grad-text', h1);
    if (g) {
      g.classList.add('is-split');
      var ws = $$('.wi', g);
      var rects = ws.map(function (w) { return w.getBoundingClientRect(); });
      var L = Math.min.apply(null, rects.map(function (r) { return r.left; }));
      var R = Math.max.apply(null, rects.map(function (r) { return r.right; }));
      ws.forEach(function (w, i) {
        w.style.backgroundSize = (R - L) + 'px 100%';
        w.style.backgroundPosition = (L - rects[i].left) + 'px 0';
      });
    }
    return function restore() {
      lines.forEach(function (l, i) { l.innerHTML = orig[i]; });
      if (g) g.classList.remove('is-split');
    };
  }

  function chipsFloat() {
    $$('[data-chip], [data-toast]').forEach(function (el, i) {
      var t = gsap.timeline({ repeat: -1, delay: i * 0.35 });
      t.to(el, { y: -6, duration: 1, ease: 'sine.inOut' })
       .to(el, { y: 6, duration: 2, ease: 'sine.inOut' })
       .to(el, { y: 0, duration: 1, ease: 'sine.inOut' });
    });
  }

  // Espera a Geist (máx. 700ms) para medir as palavras com a fonte final
  var fontsReady = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 700); })]).then(heroIntro);

  function heroIntro() {
    var title = $('.hero-title');
    var restore = splitTitle(title);
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('[data-stars]', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, 0)
      .fromTo('[data-h="tag"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .set(title, { opacity: 1 }, 0.2)
      .fromTo($$('.wi', title), { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.05, onComplete: restore }, 0.2)
      .fromTo('[data-h="sub"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
      .fromTo('[data-h="ben"]', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)' }, 0.85)
      .fromTo('[data-h="price"]', { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.95)
      .fromTo('[data-h="ctas"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, onComplete: function () { shineOnce($('[data-hero-primary]')); } }, 1.05)
      .fromTo('[data-h="micro"]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2)
      .fromTo('[data-mockup]', { opacity: 0, y: 120, rotationX: 14 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.4 }, 1.0)
      .fromTo('[data-sk]', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 }, 1.6)
      .fromTo('[data-prog]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 2.2)
      .fromTo('[data-chip]', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.15 }, 2.4)
      .fromTo('[data-toast]', { opacity: 0, scale: 0.7, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, 3.6)
      .add(chipsFloat, 4.2);
  }

  // Mockup endireita de 8° para 0° no scroll (o 8° inicial vem do CSS)
  gsap.fromTo('.mockup-scroll', { rotationX: 8 }, {
    rotationX: 0, ease: 'none',
    scrollTrigger: { trigger: '.mockup-stage', start: 'top 80%', end: 'top 15%', scrub: true }
  });

  /* -------------------------------------------------------
     Revelação de seção
     ------------------------------------------------------- */
  $$('[data-reveal]').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-reveal-group]').forEach(function (g) {
    gsap.from(g.children, { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
  });

  /* -------------------------------------------------------
     Ancoragem de preço: risco + contagem até 597
     ------------------------------------------------------- */
  var cmp = $('[data-compare]');
  if (cmp) {
    var strike = $('[data-strike]', cmp);
    var priceEl = $('[data-count]', cmp);
    gsap.set(strike, { scaleX: 0 });
    priceEl.textContent = '0';
    ScrollTrigger.create({
      trigger: cmp, start: 'top 70%', once: true,
      onEnter: function () {
        var tl = gsap.timeline({ delay: 0.3 });
        tl.to(strike, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' })
          .add(countUp(priceEl, 0.8), '+=0.1');
      }
    });
  }

  /* -------------------------------------------------------
     Prova social: contadores
     ------------------------------------------------------- */
  var stats = $('.stats');
  if (stats) {
    var nums = $$('[data-count]', stats);
    nums.forEach(function (n) { n.textContent = '0'; });
    ScrollTrigger.create({
      trigger: stats, start: 'top 85%', once: true,
      onEnter: function () { nums.forEach(function (n) { countUp(n, 1.4, 0.2); }); }
    });
  }

  /* -------------------------------------------------------
     Processo: linha desenhada no scroll + mini-cenas em sequência
     ------------------------------------------------------- */
  if (stepsWrap) {
    var fill = $('[data-steps-fill]', stepsWrap);
    var stepEls = $$('.step', stepsWrap);
    var ctrls = stepEls.map(function (st) {
      var sc = $('.scene', st);
      return sc ? controlScene(st, sc, false) : null;
    });
    var playUpTo = function (p) {
      var n = ctrls.length - 1;
      ctrls.forEach(function (c, i) { if (c && p >= (i / n) * 0.98) c.start(); });
    };
    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 961px)', mob: '(max-width: 960px)' }, function (ctx) {
      var desk = ctx.conditions.desk;
      layoutStepsLine();
      gsap.fromTo(fill, desk ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, {
        scaleX: 1, scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: stepsWrap,
          start: desk ? 'top 65%' : 'top 70%',
          end: desk ? 'bottom 75%' : 'bottom 65%',
          scrub: 0.6,
          onUpdate: function (self) { playUpTo(self.progress); },
          onLeave: function () { playUpTo(1); }
        }
      });
    });
  }

  /* -------------------------------------------------------
     Tilt 3D nos cards (somente desktop)
     ------------------------------------------------------- */
  function bindTilt(card) {
    var rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    var ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 1000 });
    card.addEventListener('pointermove', function (e) {
      if (!mqDesktopPointer.matches) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 8);   // máx. 4°
      rx((0.5 - py) * 8);
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.classList.add('is-hover');
    });
    card.addEventListener('pointerleave', function () {
      rx(0); ry(0);
      card.classList.remove('is-hover');
    });
  }
  $$('[data-tilt]').forEach(bindTilt);

  // Recalcula posições após fontes/layout estabilizarem
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
