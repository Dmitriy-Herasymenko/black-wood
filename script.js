  const nav = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  const galleryViewport = document.querySelector('.gallery-viewport');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryDots = document.getElementById('galleryDots');
  const gallerySlides = Array.from(galleryTrack.children);
  let galleryIndex = 0;
  let galleryPages = 1;

  function getGalleryPerView() {
    return window.innerWidth <= 640 ? 1 : 3;
  }

  function buildGalleryDots() {
    galleryDots.innerHTML = '';
    for (let i = 0; i < galleryPages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => goToGallerySlide(i));
      galleryDots.appendChild(dot);
    }
    updateGalleryDots();
  }

  function updateGalleryDots() {
    Array.from(galleryDots.children).forEach((dot, i) => {
      dot.classList.toggle('active', i === galleryIndex);
    });
  }

  function updateGallerySlider(recalcPages) {
    const pages = Math.ceil(gallerySlides.length / getGalleryPerView());
    if (recalcPages || pages !== galleryPages) {
      galleryPages = pages;
      galleryIndex = Math.min(galleryIndex, galleryPages - 1);
      buildGalleryDots();
    }
    const width = galleryViewport.clientWidth;
    galleryTrack.style.transform = `translateX(-${galleryIndex * width}px)`;
  }

  function goToGallerySlide(index) {
    galleryIndex = index;
    updateGalleryDots();
    updateGallerySlider(false);
  }

  updateGallerySlider(true);

  let galleryResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(galleryResizeTimer);
    galleryResizeTimer = setTimeout(() => updateGallerySlider(true), 150);
  });

  const GALLERY_AUTOPLAY_DELAY = 4000;
  let galleryAutoplayTimer = null;

  function startGalleryAutoplay() {
    stopGalleryAutoplay();
    galleryAutoplayTimer = setInterval(() => {
      goToGallerySlide((galleryIndex + 1) % galleryPages);
    }, GALLERY_AUTOPLAY_DELAY);
  }

  function stopGalleryAutoplay() {
    if (galleryAutoplayTimer) {
      clearInterval(galleryAutoplayTimer);
      galleryAutoplayTimer = null;
    }
  }

  startGalleryAutoplay();
  galleryViewport.addEventListener('mouseenter', stopGalleryAutoplay);
  galleryViewport.addEventListener('mouseleave', startGalleryAutoplay);
  galleryDots.addEventListener('click', startGalleryAutoplay);

  let galleryTouchStartX = null;
  galleryViewport.addEventListener('touchstart', (e) => {
    galleryTouchStartX = e.touches[0].clientX;
    stopGalleryAutoplay();
  }, { passive: true });
  galleryViewport.addEventListener('touchend', (e) => {
    if (galleryTouchStartX === null) { startGalleryAutoplay(); return; }
    const dx = e.changedTouches[0].clientX - galleryTouchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0 && galleryIndex < galleryPages - 1) goToGallerySlide(galleryIndex + 1);
      else if (dx > 0 && galleryIndex > 0) goToGallerySlide(galleryIndex - 1);
    }
    galleryTouchStartX = null;
    startGalleryAutoplay();
  });
  galleryViewport.addEventListener('touchcancel', () => {
    galleryTouchStartX = null;
    startGalleryAutoplay();
  });

  const galleryItems = gallerySlides;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.dataset.caption || '';
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  document.getElementById('openGalleryBtn').addEventListener('click', () => openLightbox(0));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => openLightbox(currentIndex - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => openLightbox(currentIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
  });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function setNavOpen(open) {
    navLinks.style.display = open ? 'flex' : 'none';
    navLinks.style.cssText += open ? 'position:absolute; top:64px; left:0; right:0; background:var(--color-espresso); flex-direction:column; padding:20px 24px; border-bottom:1px solid var(--color-walnut);' : '';
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    navToggle.textContent = open ? '✕' : '☰';
  }

  navToggle.addEventListener('click', () => {
    setNavOpen(navLinks.style.display !== 'flex');
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });
