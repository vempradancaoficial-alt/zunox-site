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
  setTimeout(hidePreloader, 3000); 

  // Header State
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

  // Parallax Background
  if (!prefersReducedMotion) {
    const heroBg = document.querySelector('.hero-bg-parallax');
    if (heroBg) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
      }, { passive: true });
    }
  }
  
})();