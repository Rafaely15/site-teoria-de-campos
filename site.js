/* CAMPOSGRAV — comportamento compartilhado do site.
   Roda fora do ciclo de render do runtime .dc.html: todo estado visual mora em
   classes no <body>/<html> e os eventos são delegados no document, então nada
   se perde quando um componente re-renderiza (ex.: ao trocar o idioma). */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* O runtime .dc.html monta o <helmet> mais de uma vez, então este arquivo
     pode ser avaliado duas vezes no mesmo documento. Sem esta trava, cada
     listener era registrado em dobro — e o clique no hambúrguer alternava a
     classe duas vezes, voltando ao estado inicial (o menu nunca abria). */
  if (window.__CAMPOSGRAV_SITE_JS__) return;
  window.__CAMPOSGRAV_SITE_JS__ = true;

  /* Marca que o JS está ativo — o CSS só esconde os elementos de .reveal
     sob html.qc-js, para que sem JS a página apareça inteira. */
  root.classList.add('qc-js');

  /* ── idioma persistido ────────────────────────────────────────────── */
  var LANG_KEY = 'camposgrav-lang';

  window.CAMPOSGRAV = window.CAMPOSGRAV || {};

  window.CAMPOSGRAV.getLang = function () {
    try {
      var v = window.localStorage.getItem(LANG_KEY);
      if (v === 'pt' || v === 'en') return v;
    } catch (e) { /* file:// pode bloquear o storage */ }
    return 'pt';
  };

  window.CAMPOSGRAV.setLang = function (lang) {
    try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) { /* idem */ }
    root.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
  };

  root.setAttribute('lang', window.CAMPOSGRAV.getLang() === 'en' ? 'en' : 'pt-BR');

  /* ── cabeçalho: fundo sólido ao rolar ─────────────────────────────── */
  var scrolled = false;
  function onScroll() {
    var now = window.scrollY > 12;
    if (now !== scrolled) {
      scrolled = now;
      doc.body.classList.toggle('qc-scrolled', now);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── menu hambúrguer ──────────────────────────────────────────────── */
  function closeMenu() { doc.body.classList.remove('qc-menu-open'); }

  doc.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-menu-btn]');
    if (btn) {
      ev.preventDefault();
      var open = doc.body.classList.toggle('qc-menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    /* clicar num link do menu ou fora dele fecha a gaveta */
    if (doc.body.classList.contains('qc-menu-open')) {
      if (!ev.target.closest || !ev.target.closest('.site-header') || ev.target.closest('.site-nav a')) {
        closeMenu();
      }
    }
  });

  doc.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });

  /* ── animações de entrada ao rolar ────────────────────────────────── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  if (!reduce && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* Revela ao entrar em cena — e também quando o elemento já ficou ACIMA
           da janela (boundingClientRect.top < 0). Sem esta segunda condição,
           um salto de rolagem (link âncora, restauração de posição, rolagem
           rápida) passa direto por seções que nunca chegam a intersectar e
           elas ficariam invisíveis para sempre. */
        var above = entry.boundingClientRect.top < 0;
        if (!entry.isIntersecting && !above) return;
        var el = entry.target;
        /* escalona os irmãos para a seção entrar em cascata */
        var delay = above ? 0 : parseFloat(el.getAttribute('data-reveal-delay') || '0');
        el.style.transitionDelay = delay ? delay + 'ms' : '';
        el.classList.add('qc-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  }

  function scan() {
    var nodes = doc.querySelectorAll('.reveal:not(.qc-in)');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.__qcSeen) continue;
      el.__qcSeen = true;
      if (io) io.observe(el); else el.classList.add('qc-in');
    }
  }

  /* O runtime .dc.html monta (e remonta) a árvore depois deste script, então
     reescaneamos a cada mutação além do scan inicial. */
  var pending = false;
  function scheduleScan() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; scan(); });
  }

  if ('MutationObserver' in window) {
    new MutationObserver(scheduleScan).observe(doc.documentElement, { childList: true, subtree: true });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', scheduleScan);
  } else {
    scheduleScan();
  }

  /* Rede de segurança: revela o que já passou pela janela. Roda um pouco
     depois da carga e a cada rolagem, para o caso de o observer perder algo. */
  function revealPassed() {
    var nodes = doc.querySelectorAll('.reveal:not(.qc-in)');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getBoundingClientRect().top < window.innerHeight) {
        nodes[i].style.transitionDelay = '';
        nodes[i].classList.add('qc-in');
      }
    }
  }
  window.setTimeout(revealPassed, 2500);
  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; scan(); revealPassed(); });
  }, { passive: true });
})();
