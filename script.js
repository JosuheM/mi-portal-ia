(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Encabezado: sombra al hacer scroll ---------- */
  var header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('shadow-lg', window.scrollY > 12);
  }, { passive: true });

  /* ---------- 2. Menú móvil (hamburguesa) ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-menu-open');
  var iconClose = document.getElementById('icon-menu-close');

  function setMobileMenu(open) {
    mobileMenu.classList.toggle('hidden', !open);
    mobileMenu.classList.toggle('flex', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    document.body.classList.toggle('overflow-hidden', open);
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = !mobileMenu.classList.contains('hidden');
    setMobileMenu(!isOpen);
  });

  document.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', function () { setMobileMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      setMobileMenu(false);
      menuToggle.focus();
    }
  });

  /* ---------- 3. Búsqueda expandible (escritorio) ---------- */
  var searchToggle = document.getElementById('search-toggle');
  var searchWrapDesktop = document.getElementById('search-wrap-desktop');

  searchToggle.addEventListener('click', function () {
    var willOpen = !searchWrapDesktop.classList.contains('is-open');
    searchWrapDesktop.classList.toggle('is-open', willOpen);
    searchToggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      document.getElementById('search-input-desktop').focus();
    }
  });

  /* ---------- 4. Filtro en vivo de publicaciones ---------- */
  var articleCards = document.querySelectorAll('.article-card');
  var noResults = document.getElementById('no-results');
  var searchStatus = document.getElementById('search-status');

  function filterArticles(rawQuery) {
    var query = (rawQuery || '').trim().toLowerCase();
    var visibleCount = 0;

    articleCards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var isMatch = haystack.indexOf(query) !== -1;
      card.classList.toggle('hidden', !isMatch);
      if (isMatch) visibleCount++;
    });

    noResults.classList.toggle('hidden', visibleCount !== 0);

    searchStatus.textContent = query
      ? visibleCount + ' publicación(es) encontradas para "' + rawQuery + '"'
      : '';
  }

  document.querySelectorAll('.search-input').forEach(function (input) {
    input.addEventListener('input', function () { filterArticles(input.value); });
  });

  /* ---------- 5. Enlaces de categoría en el pie de página ---------- */
  document.querySelectorAll('.category-filter-link').forEach(function (link) {
    link.addEventListener('click', function () {
      var term = link.getAttribute('data-filter');
      var desktopInput = document.getElementById('search-input-desktop');
      var mobileInput = document.getElementById('search-input-mobile');
      if (desktopInput) {
        desktopInput.value = term;
        searchWrapDesktop.classList.add('is-open');
        searchToggle.setAttribute('aria-expanded', 'true');
      }
      if (mobileInput) { mobileInput.value = term; }
      filterArticles(term);
    });
  });

  /* ---------- 6. Reproductor de podcast (simulado) ---------- */
  var episodeButtons = document.querySelectorAll('.episode-item');
  var playPauseBtn = document.getElementById('play-pause-btn');
  var iconPlay = document.getElementById('icon-play');
  var iconPause = document.getElementById('icon-pause');
  var nowPlayingTitle = document.getElementById('now-playing-title');
  var nowPlayingGuest = document.getElementById('now-playing-guest');
  var progressBar = document.getElementById('progress-bar');
  var progressFill = document.getElementById('progress-fill');
  var timeElapsedEl = document.getElementById('time-elapsed');
  var timeTotalEl = document.getElementById('time-total');
  var playerLiveStatus = document.getElementById('player-live-status');

  var player = {
    currentIndex: 0,
    duration: parseInt(episodeButtons[0].getAttribute('data-duration'), 10),
    elapsed: 0,
    isPlaying: false,
    intervalId: null,
  };

  function formatTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = Math.floor(totalSeconds % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateProgressUI() {
    var percent = player.duration > 0 ? (player.elapsed / player.duration) * 100 : 0;
    progressFill.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(percent));
    timeElapsedEl.textContent = formatTime(player.elapsed);
    timeTotalEl.textContent = formatTime(player.duration);
  }

  function stopInterval() {
    if (player.intervalId) {
      clearInterval(player.intervalId);
      player.intervalId = null;
    }
  }

  function setPlayingIcon(isPlaying) {
    iconPlay.classList.toggle('hidden', isPlaying);
    iconPause.classList.toggle('hidden', !isPlaying);
    playPauseBtn.setAttribute('aria-pressed', String(isPlaying));
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar episodio' : 'Reproducir episodio');
  }

  function tick() {
    player.elapsed += 1;
    if (player.elapsed >= player.duration) {
      player.elapsed = player.duration;
      updateProgressUI();
      pausePlayback();
      return;
    }
    updateProgressUI();
  }

  function startPlayback() {
    player.isPlaying = true;
    setPlayingIcon(true);
    stopInterval();
    player.intervalId = setInterval(tick, 1000);
    playerLiveStatus.textContent = 'Reproduciendo: ' + nowPlayingTitle.textContent;
  }

  function pausePlayback() {
    player.isPlaying = false;
    setPlayingIcon(false);
    stopInterval();
    playerLiveStatus.textContent = 'Pausado: ' + nowPlayingTitle.textContent;
  }

  playPauseBtn.addEventListener('click', function () {
    if (player.isPlaying) { pausePlayback(); } else { startPlayback(); }
  });

  function selectEpisode(index) {
    var btn = episodeButtons[index];
    if (!btn) return;

    player.currentIndex = index;
    player.duration = parseInt(btn.getAttribute('data-duration'), 10);
    player.elapsed = 0;

    nowPlayingTitle.textContent = btn.getAttribute('data-title');
    nowPlayingGuest.textContent = btn.getAttribute('data-guest');
    updateProgressUI();

    episodeButtons.forEach(function (b, i) {
      b.classList.toggle('is-active', i === index);
      b.classList.toggle('bg-white/10', i === index);
      b.setAttribute('aria-pressed', String(i === index));
    });

    if (player.isPlaying) { startPlayback(); } else { stopInterval(); }
  }

  episodeButtons.forEach(function (btn, index) {
    btn.addEventListener('click', function () { selectEpisode(index); });
  });

  progressBar.addEventListener('click', function (e) {
    var rect = progressBar.getBoundingClientRect();
    var ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    player.elapsed = Math.round(ratio * player.duration);
    updateProgressUI();
  });

  updateProgressUI();

  /* ---------- 7. Galería con lightbox accesible ---------- */
  var galleryItems = document.querySelectorAll('.gallery-item');
  var lightbox = document.getElementById('lightbox');
  var lightboxBackdrop = document.getElementById('lightbox-backdrop');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lastFocusedElement = null;

  function openLightbox(item) {
    lastFocusedElement = document.activeElement;

    lightboxImg.src = item.getAttribute('data-img');
    lightboxImg.alt = item.getAttribute('data-title');
    lightboxTitle.textContent = item.getAttribute('data-title');
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';

    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
    lightboxImg.src = '';
    if (lastFocusedElement) { lastFocusedElement.focus(); }
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
    if (e.key === 'Tab' && !lightbox.classList.contains('hidden')) {
      // Único elemento con foco dentro del modal: el botón de cerrar.
      e.preventDefault();
      lightboxClose.focus();
    }
  });

  /* ---------- 8. Boletín informativo (simulado) ---------- */
  var newsletterForm = document.getElementById('newsletter-form');
  var newsletterMessage = document.getElementById('newsletter-message');

  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var emailInput = document.getElementById('newsletter-email');
    var value = emailInput.value.trim();
    var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (isValidEmail) {
      newsletterMessage.textContent = 'Gracias por suscribirte. Revisa tu correo para confirmar.';
      newsletterMessage.classList.remove('text-tierra');
      newsletterMessage.classList.add('text-hueso/70');
      emailInput.value = '';
    } else {
      newsletterMessage.textContent = 'Ingresa un correo electrónico válido.';
      newsletterMessage.classList.remove('text-hueso/70');
      newsletterMessage.classList.add('text-tierra');
    }
  });

  /* ---------- 9. Revelado progresivo al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    revealEls.forEach(function (el) { el.classList.add('reveal-init'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

})();
