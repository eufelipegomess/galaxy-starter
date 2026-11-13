/* Galaxy Media — página de prévia */
(function () {
  'use strict';

  var WA = '5571996723809';
  var TOTAL = 21; // páginas em assets/portfolio (NN-640.webp / NN-960.webp)
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function (ev, data) { if (window.fbq) window.fbq('track', ev, data); };
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Carrossel do hero ---------- */
  $$('[data-marq]').forEach(function (row, r) {
    var ids = row.dataset.marq.split(',');
    var items = ids.map(function (n, i) {
      var id = pad(+n);
      // A primeira fileira carrega já; a segunda, quando o navegador quiser.
      return '<div class="mq frame"><div class="frame-bar"><i></i><i></i><i></i></div>' +
        '<img src="assets/portfolio/' + id + '-640.webp" alt="" width="640" height="303" decoding="async"' + (r || i > 4 ? ' loading="lazy"' : '') + '></div>';
    }).join('');
    row.innerHTML = '<div class="marq-track">' + items + items + '</div>';
  });

  /* ---------- Revelar ao rolar ---------- */
  if (hasIO && !calm) {
    document.documentElement.classList.add('rv');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(countUp);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  function countUp(el) {
    var end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Site ao vivo (iframe) ---------- */
  var live = $('[data-live]');
  if (live) {
    var frame = $('iframe', live), hint = $('[data-live-hint]');
    var DESK = 1366; // largura simulada no computador; no celular mostra a versão mobile
    var fit = function () {
      var w = live.clientWidth, h = live.clientHeight;
      var s = w < 560 ? 1 : w / DESK;
      frame.style.width = (w / s) + 'px';
      frame.style.height = (h / s) + 'px';
      frame.style.transform = s === 1 ? '' : 'scale(' + s + ')';
    };
    var load = function () { if (!frame.src) { frame.src = frame.dataset.src; fit(); } };
    fit();
    addEventListener('resize', fit);
    live.addEventListener('pointerenter', function () { hint.classList.add('off'); });
    live.addEventListener('touchstart', function () { hint.classList.add('off'); }, { passive: true });
    // Só carrega o site de fora quando a seção está chegando na tela.
    if (hasIO) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(live);
    else load();
  }

  /* ---------- Galeria de projetos ---------- */
  var gal = $('[data-gal]');
  if (gal) {
    var gt = $('[data-gal-track]', gal), gn = $('[data-gal-n]', gal), html = '';
    for (var n = 1; n <= TOTAL; n++) {
      var id = pad(n);
      html += '<figure class="gc frame"><div class="frame-bar"><i></i><i></i><i></i></div>' +
        '<img src="assets/portfolio/' + id + '-960.webp" srcset="assets/portfolio/' + id + '-640.webp 640w, assets/portfolio/' + id + '-960.webp 960w" sizes="(max-width: 860px) 82vw, 720px" alt="Página desenvolvida pela Galaxy Media" width="960" height="455" loading="lazy" decoding="async"></figure>';
    }
    gt.innerHTML = html;
    var cards = $$('.gc', gt), cur = -1, raf = 0;
    var mark = function () {
      raf = 0;
      var mid = gt.getBoundingClientRect().left + gt.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      if (best === cur) return;
      cur = best;
      cards.forEach(function (c, i) { c.classList.toggle('on', i === best); });
      gn.textContent = pad(best + 1);
    };
    gt.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    var goTo = function (i) {
      var c = cards[(i + TOTAL) % TOTAL];
      gt.scrollTo({ left: c.offsetLeft - (gt.clientWidth - c.offsetWidth) / 2, behavior: calm ? 'auto' : 'smooth' });
    };
    $('[data-gal-prev]', gal).addEventListener('click', function () { goTo(cur - 1); });
    $('[data-gal-next]', gal).addEventListener('click', function () { goTo(cur + 1); });
    gt.addEventListener('click', function (e) { var c = e.target.closest('.gc'); if (c) goTo(cards.indexOf(c)); });
    gt.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); }
    });
    mark();
  }

  /* ---------- FAQ: um aberto por vez (para navegadores sem details[name]) ---------- */
  var faqs = $$('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Barra fixa (mobile): some no hero e no CTA final ---------- */
  var dock = $('[data-dock]'), hero = $('.hero'), cta = $('.sec-cta');
  if (dock && hasIO) {
    var vis = new Map([[hero, true], [cta, false]]);
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target, e.isIntersecting); });
      dock.classList.toggle('show', !vis.get(hero) && !vis.get(cta));
    });
    dio.observe(hero); dio.observe(cta);
  }

  /* ---------- Links diretos de WhatsApp ---------- */
  $$('[data-wa]').forEach(function (a) {
    a.addEventListener('click', function () { track('Contact', { content_name: a.dataset.wa }); });
  });

  /* ---------- Briefing da prévia ---------- */
  var dlg = $('[data-quiz-dialog]'), form = $('[data-qz]');
  if (!dlg || !form) return;
  var steps = $$('[data-step]', form), segs = $$('[data-qz-segs] i'), count = $('[data-qz-count]');
  var back = $('[data-qz-back]'), otherBox = $('[data-other-box]', form), err = $('[data-qz-err]');
  var next = $('[data-qz-next]', form);
  var at = 0, origin = '';

  function go(i) {
    at = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (s, k) { s.hidden = k !== at; });
    segs.forEach(function (s, k) { s.classList.toggle('on', k <= at); });
    count.textContent = (at + 1) + '/' + steps.length + ' · ' + steps[at].dataset.label;
    back.style.visibility = at ? 'visible' : 'hidden';
    if (at === steps.length - 1) setTimeout(function () { form.empresa.focus(); }, 60);
  }

  $$('[data-quiz]').forEach(function (b) {
    b.addEventListener('click', function () {
      origin = b.dataset.quiz;
      go(0);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      document.documentElement.classList.add('lock');
      track('ViewContent', { content_name: 'Briefing prévia (' + origin + ')' });
    });
  });
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  $('[data-qz-close]').addEventListener('click', close);
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('lock'); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  back.addEventListener('click', function () { go(at - 1); });

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type !== 'radio') return;
    if (t.name === 'ramo') {
      otherBox.hidden = !t.hasAttribute('data-other');
      if (!otherBox.hidden) { form.ramo_outro.focus(); return; }
    }
    setTimeout(function () { go(at + 1); }, 260);
  });
  next.addEventListener('click', function () {
    if (!form.ramo_outro.value.trim()) { form.ramo_outro.focus(); return; }
    go(at + 1);
  });
  form.ramo_outro.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); next.click(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = function (n) { var c = form.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ''; };
    var empresa = form.empresa.value.trim();
    if (!empresa) { err.hidden = false; form.empresa.focus(); return; }
    err.hidden = true;
    var ig = form.instagram.value.replace(/[\s@]/g, '');
    var ramo = val('ramo') || form.ramo_outro.value.trim();
    var lines = ['Olá! Acabei de preencher o briefing e quero receber a prévia do meu site.', '', '*Empresa:* ' + empresa];
    if (ig) lines.push('*Instagram:* @' + ig);
    lines.push('*Presença online:* ' + val('site'), '*Segmento:* ' + ramo, '*Papel do site:* ' + val('objetivo'), '*Momento:* ' + val('prazo'));
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
    track('Lead', { content_name: 'Prévia', content_category: ramo });
    track('Contact', { content_name: 'Prévia (' + origin + ')' });
    // Pequena espera para o Pixel enviar antes de sair da página.
    setTimeout(function () { location.href = url; }, 300);
  });
})();
