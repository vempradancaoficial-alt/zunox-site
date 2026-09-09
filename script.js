(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => {
    if (preloader && !preloader.classList.contains('is-hidden')) {
      preloader.classList.add('is-hidden');
      setTimeout(() => preloader.remove(), 600);
    }
  };
  window.addEventListener('load', () => setTimeout(hidePreloader, prefersReducedMotion ? 0 : 500));
  setTimeout(hidePreloader, 3000); // Fallback

  // Header Scroll State
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }
  }, { passive: true });

  // Mobile Menu
  const menuBtn = document.querySelector('.menu-button');
  const menu = document.querySelector('.main-menu');
  if (menuBtn && menu) {
    const toggleMenu = () => {
      const isOpen = menu.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', toggleMenu);
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menu.classList.contains('is-open')) toggleMenu();
      });
    });
  }

  // Scroll Reveal Observer
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Tilt Effect on SVG
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const tiltEl = document.querySelector('[data-tilt]');
    const heroVisual = document.querySelector('.hero-visual');
    const glow = document.querySelector('.zx-glow');
    
    if (tiltEl && heroVisual) {
      heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        // Calculate mouse position relative to center of element (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Tilt - subtle rotation
        tiltEl.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        
        // Dynamic Lighting - follows mouse slightly
        if (glow) {
          glow.style.transform = `translate(calc(-50% + ${x * 60}px), calc(-50% + ${y * 60}px))`;
          glow.style.opacity = '0.35';
        }
      });
      
      heroVisual.addEventListener('mouseleave', () => {
        tiltEl.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
        if (glow) {
          glow.style.transform = `translate(-50%, -50%)`;
          glow.style.opacity = '0.18';
        }
      });
    }
  }

  // Parallax Elements
  if (!prefersReducedMotion) {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateParallax = () => {
      parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax') || 0.2;
        el.style.transform = `translateY(${lastScrollY * speed}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }
})();
