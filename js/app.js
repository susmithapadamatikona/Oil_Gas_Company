(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const storageKey = 'stacklySession';

  function setYear() {
    qsa('[data-current-year]').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  function initLoader() {
    const loader = qs('[data-loader]');
    if (!loader) return;
    const hide = () => loader.classList.add('is-hidden');
    window.addEventListener('load', () => setTimeout(hide, 1500), { once: true });
    setTimeout(hide, 1500);
  }

  function initHeader() {
    const header = qs('[data-header]');
    const nav = qs('[data-nav]');
    const toggle = qs('[data-nav-toggle]');
    const overlay = qs('[data-overlay]');

    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && nav) {
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        overlay && overlay.classList.toggle('is-visible', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        document.body.classList.toggle('nav-open', open);
      };

      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
      overlay?.addEventListener('click', () => setOpen(false));
      qsa('[data-nav] a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
      });
    }

    const page = document.body.dataset.page;
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav-link]').forEach((link) => {
      const target = link.getAttribute('href');
      if (target === path || (path === '' && target === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
      if (page && link.dataset.page === page) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initReveal() {
    const items = qsa('[data-reveal], .page-intro__inner, .footer__grid > *');
    if (!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animations = ['fade-up', 'fade-right', 'fade-left', 'zoom-in'];
    items.forEach((item, index) => {
      if (!item.dataset.aos) item.dataset.aos = animations[index % animations.length];
      const siblingIndex = item.parentElement ? [...item.parentElement.children].indexOf(item) : 0;
      item.dataset.aosDelay = String(Math.min(Math.max(siblingIndex, 0), 4) * 70);
    });

    if (window.AOS) {
      window.AOS.init({
        duration: 720,
        easing: 'ease-out-cubic',
        once: true,
        offset: 70,
        anchorPlacement: 'top-bottom'
      });
    }
  }

  function animateNumber(el) {
    const finalValue = Number(el.dataset.count || el.textContent.replace(/[^\d]/g, '')) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * finalValue);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateNumber);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((counter) => observer.observe(counter));
  }

  function initTestimonials() {
    const track = qs('[data-testimonial-track]');
    if (!track) return;
    const slides = qsa('[data-testimonial-slide]', track);
    if (!slides.length) return;

    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
    };
    slides.forEach((slide) => {
      slide.style.minWidth = '100%';
    });
    track.style.display = 'flex';
    track.style.transition = 'transform 450ms ease';

    qs('[data-testimonial-prev]')?.addEventListener('click', () => show(index - 1));
    qs('[data-testimonial-next]')?.addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), 6000);
  }

  function initToTop() {
    const btn = qs('[data-scroll-top]');
    if (!btn) return;
    const toggle = () => btn.classList.toggle('is-visible', window.scrollY > 420);
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initPageLeave() {
    qsa('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      link.addEventListener('click', () => document.body.classList.add('page-leaving'));
    });
  }

  function initNewsletter() {
    qsa('[data-newsletter-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = qs('input[type="email"]', form);
        if (!email || !window.ecValidation.validateEmail(email.value)) {
          window.ecValidation.showFormMessage(form, 'Please enter a valid email address.', 'error');
          return;
        }
        window.ecValidation.showFormMessage(form, 'You are subscribed to Stackly updates.', 'success');
        form.reset();
      });
    });
  }

  function initContactForm() {
    const form = qs('[data-contact-form]');
    if (!form) return;
    const submitButton = qs('[type="submit"]', form);
    const fields = {
      name: qs('#contact-name', form),
      email: qs('#contact-email', form),
      phone: qs('#contact-phone', form),
      subject: qs('#contact-subject', form),
      message: qs('#contact-message', form),
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      window.ecValidation.clearFormMessages(form);
      let valid = true;

      if (!fields.name.value.trim()) {
        window.ecValidation.setFieldMessage(fields.name, 'Please enter your name.');
        valid = false;
      }
      if (!window.ecValidation.validateEmail(fields.email.value)) {
        window.ecValidation.setFieldMessage(fields.email, 'Please enter a valid email address.');
        valid = false;
      }
      if (fields.phone.value.trim() && !window.ecValidation.validatePhone(fields.phone.value)) {
        window.ecValidation.setFieldMessage(fields.phone, 'Please enter a valid phone number.');
        valid = false;
      }
      if (!fields.subject.value.trim()) {
        window.ecValidation.setFieldMessage(fields.subject, 'Please add a subject.');
        valid = false;
      }
      if (fields.message.value.trim().length < 20) {
        window.ecValidation.setFieldMessage(fields.message, 'Please add a longer message so we can help properly.');
        valid = false;
      }
      if (!valid) return;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Send Message';
        }
        window.ecValidation.showFormMessage(form, 'Thanks. Your message has been sent successfully.', 'success');
        form.reset();
      }, 900);
    });
  }

  function initMobileSubmenus() {
    qsa('[data-faq-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        if (panel) panel.hidden = !open;
      });
    });
  }

  function init() {
    setYear();
    initLoader();
    initHeader();
    initReveal();
    initCounters();
    initTestimonials();
    initToTop();
    initPageLeave();
    initNewsletter();
    initContactForm();
    initMobileSubmenus();
    document.body.classList.remove('page-loading');
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-loading', 'page-leaving');
  });
})();
