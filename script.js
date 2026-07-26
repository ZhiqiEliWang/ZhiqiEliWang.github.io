(function () {
  'use strict';

  var sections = Array.prototype.slice.call(document.querySelectorAll('.cv-section'));

  /* ---------- Section rail, built from the sections themselves ---------- */
  var rail = document.getElementById('rail');
  var railLinks = {};

  if (rail) {
    var list = rail.querySelector('ol');
    sections.forEach(function (section) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + section.id;
      link.textContent = section.dataset.title || section.id;
      link.addEventListener('click', function () { section.open = true; });
      item.appendChild(link);
      list.appendChild(item);
      railLinks[section.id] = link;
    });

    // Highlight whichever section currently owns the upper third of the viewport.
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = railLinks[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(railLinks).forEach(function (id) { railLinks[id].removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-12% 0px -70% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- A section linked to directly should never arrive collapsed ---------- */
  function revealHash() {
    if (!location.hash) return;
    var target = document.querySelector(location.hash);
    if (!target) return;
    var section = target.closest('.cv-section');
    if (section) section.open = true;
  }
  revealHash();
  window.addEventListener('hashchange', revealHash);

  /* ---------- Collapse / expand everything ---------- */
  var foldAll = document.getElementById('fold-all');

  function setFoldButton(collapsed) {
    if (!foldAll) return;
    var label = collapsed ? 'Expand all sections' : 'Collapse all sections';
    foldAll.setAttribute('aria-label', label);
    foldAll.setAttribute('title', label);
    foldAll.querySelector('use').setAttribute('href', collapsed ? '#i-unfold' : '#i-fold');
  }

  if (foldAll) {
    foldAll.addEventListener('click', function () {
      var shouldCollapse = sections.some(function (s) { return s.open; });
      sections.forEach(function (s) { s.open = !shouldCollapse; });
      setFoldButton(shouldCollapse);
    });

    sections.forEach(function (section) {
      section.addEventListener('toggle', function () {
        setFoldButton(!sections.some(function (s) { return s.open; }));
      });
    });
  }

  /* ---------- Email: reassemble the address only in the live DOM ---------- */
  var emailLink = document.getElementById('email');

  if (emailLink) {
    var backwards = function (s) { return s.split('').reverse().join(''); };
    var address = backwards(emailLink.dataset.l) + String.fromCharCode(64) + backwards(emailLink.dataset.r);
    emailLink.href = 'mailto:' + address;
    // Replacing the mirrored spans with plain text keeps copy-and-paste honest.
    emailLink.querySelector('.email-text').textContent = address;
  }

  /* ---------- Links inside a summary should navigate, not fold the entry ---------- */
  document.querySelectorAll('summary a').forEach(function (link) {
    link.addEventListener('click', function (event) { event.stopPropagation(); });
  });

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      localStorage.setItem('theme', dark ? 'light' : 'dark');
      themeToggle.setAttribute('aria-label', dark ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }

  /* ---------- Portrait easter egg, carried over from the old homepage ---------- */
  var img = document.getElementById('profile-img');
  var caption = document.getElementById('profile-caption');

  if (img && caption) {
    var defaultSrc = 'images/pfp/default.jpg';
    var alternates = [
      { src: 'images/pfp/alter_ego.png', caption: 'the profile photo I use on the internet' },
      { src: 'images/pfp/badminton.jpeg', caption: 'me playing my favorite sport' }
    ];

    alternates.forEach(function (alt) { new Image().src = alt.src; });

    var show = function () {
      var pick = alternates[Math.floor(Math.random() * alternates.length)];
      img.src = pick.src;
      caption.textContent = pick.caption;
    };
    var reset = function () {
      img.src = defaultSrc;
      caption.innerHTML = '&nbsp;';
    };

    img.addEventListener('mouseenter', show);
    img.addEventListener('mouseleave', reset);
    img.addEventListener('click', show);
  }

  /* ---------- Video facades: no YouTube iframe until asked for ---------- */
  document.querySelectorAll('.embed').forEach(function (embed) {
    var button = embed.querySelector('.embed-play');
    if (!button) return;
    button.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = embed.dataset.src + '&autoplay=1';
      frame.title = embed.dataset.label || 'Embedded video';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      embed.replaceChildren(frame);
    });
  });

  /* ---------- Printing should always produce the full CV ---------- */
  var restore = [];

  window.addEventListener('beforeprint', function () {
    restore = document.querySelectorAll('details');
    restore = Array.prototype.filter.call(restore, function (d) { return !d.open; });
    restore.forEach(function (d) { d.open = true; });
  });

  window.addEventListener('afterprint', function () {
    restore.forEach(function (d) { d.open = false; });
    restore = [];
  });
})();
