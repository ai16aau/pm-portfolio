(function () {
  var root = document.documentElement;

  /* ---------- theme ---------- */
  var btn = document.getElementById('themeBtn');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function label() {
    if (btn) btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (btn) {
    label();
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pow-theme', next); } catch (e) {}
      label();
    });
  }

  /* ---------- gallery ---------- */
  var g = document.querySelector('[data-gallery]');
  if (g) {
    var items = [].slice.call(g.querySelectorAll('.g-item'));
    var prev = document.querySelector('[data-gallery-prev]');
    var next = document.querySelector('[data-gallery-next]');
    var count = document.querySelector('[data-gallery-count]');
    function current() {
      var left = g.getBoundingClientRect().left + parseFloat(getComputedStyle(g).scrollPaddingLeft || 0);
      var best = 0, bestD = Infinity;
      items.forEach(function (it, i) {
        var d = Math.abs(it.getBoundingClientRect().left - left);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function update() {
      var i = current();
      if (count) count.textContent = (i + 1) + ' / ' + items.length;
      if (prev) prev.disabled = g.scrollLeft < 4;
      if (next) next.disabled = g.scrollLeft + g.clientWidth >= g.scrollWidth - 4;
    }
    function go(d) {
      var i = Math.max(0, Math.min(items.length - 1, current() + d));
      var target = items[i];
      var pad = parseFloat(getComputedStyle(g).scrollPaddingLeft || 0);
      g.scrollTo({ left: target.offsetLeft - pad, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    g.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // drag to scroll with a mouse
    var down = false, startX = 0, startL = 0, moved = false;
    g.addEventListener('mousedown', function (e) { down = true; moved = false; startX = e.pageX; startL = g.scrollLeft; g.classList.add('dragging'); });
    window.addEventListener('mouseup', function () { if (down) { down = false; g.classList.remove('dragging'); } });
    g.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      g.scrollLeft = startL - dx;
    });
    g.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    update();
    window.addEventListener('resize', update);
  }
})();
