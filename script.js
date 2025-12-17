(function(global) {
  'use strict';

  var doc = document;
  var win = window;
  var body = doc.body;
  var html = doc.documentElement;

  var debounce = function(fn, delay) {
    var timeoutId;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  };

  var throttle = function(fn, limit) {
    var lastRun = 0;
    return function() {
      var now = Date.now();
      if (now - lastRun >= limit) {
        lastRun = now;
        fn.apply(this, arguments);
      }
    };
  };

  var addClass = function(el, className) {
    if (el && el.classList) el.classList.add(className);
  };

  var removeClass = function(el, className) {
    if (el && el.classList) el.classList.remove(className);
  };

  var hasClass = function(el, className) {
    return el && el.classList && el.classList.contains(className);
  };

  var getHeaderHeight = function() {
    var header = doc.querySelector('.l-header, .navbar');
    if (header) return header.offsetHeight;
    var navHeight = getComputedStyle(doc.documentElement).getPropertyValue('--nav-h');
    return navHeight ? parseInt(navHeight) : 80;
  };

  win.__app = win.__app || {};
  var app = win.__app;

  app.init = function() {
    if (app.__initialized) return;
    app.__initialized = true;

    app.initNav();
    app.initBurgerMenu();
    app.initAnchors();
    app.initScrollSpy();
    app.initImages();
    app.initIntersectionObserver();
    app.initMicroInteractions();
    app.initForms();
    app.initScrollToTop();
    app.initCountUp();
    app.initConnectionCheck();
    app.initModalBackdrop();
    app.initRippleEffect();
  };

  app.initNav = function() {
    if (app.__navInit) return;
    app.__navInit = true;

    var nav = doc.querySelector('.c-nav, .navbar');
    var toggle = doc.querySelector('.c-nav__toggle, .navbar-toggler');
    var navList = doc.querySelector('.c-nav__list, .navbar-nav');
    var navLinks = doc.querySelectorAll('.c-nav__link, .nav-link');

    if (!nav || !toggle) return;

    var closeNav = function() {
      removeClass(nav, 'is-open');
      removeClass(navList, 'show');
      toggle.setAttribute('aria-expanded', 'false');
      removeClass(body, 'u-no-scroll');
      removeClass(toggle, 'active');
    };

    var openNav = function() {
      addClass(nav, 'is-open');
      addClass(navList, 'show');
      toggle.setAttribute('aria-expanded', 'true');
      addClass(body, 'u-no-scroll');
      addClass(toggle, 'active');
      if (navList && navList.firstElementChild) {
        var firstLink = navList.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }
    };

    var toggleNav = function() {
      if (hasClass(nav, 'is-open') || hasClass(navList, 'show')) {
        closeNav();
      } else {
        openNav();
      }
    };

    toggle.addEventListener('click', toggleNav);

    navLinks.forEach(function(link) {
      link.addEventListener('click', closeNav);
    });

    doc.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && (hasClass(nav, 'is-open') || hasClass(navList, 'show'))) {
        closeNav();
        toggle.focus();
      }
    });

    doc.addEventListener('click', function(e) {
      if ((hasClass(nav, 'is-open') || hasClass(navList, 'show')) && 
          !nav.contains(e.target) && 
          e.target !== toggle &&
          !toggle.contains(e.target)) {
        closeNav();
      }
    });

    if (navList) {
      navList.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;

        var focusableEls = navList.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (!focusableEls.length) return;

        var firstEl = focusableEls[0];
        var lastEl = focusableEls[focusableEls.length - 1];
        var activeEl = doc.activeElement;

        if (e.shiftKey && activeEl === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && activeEl === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      });
    }

    var handleResize = debounce(function() {
      var width = win.innerWidth || html.clientWidth;
      if (width >= 992) {
        closeNav();
      }
    }, 150);

    win.addEventListener('resize', handleResize, { passive: true });
  };

  app.initBurgerMenu = function() {
    if (app.__burgerInit) return;
    app.__burgerInit = true;

    var header = doc.querySelector('.l-header, .navbar, header');
    if (!header) return;

    var headerHeight = getComputedStyle(doc.documentElement).getPropertyValue('--header-h') || 
                      getComputedStyle(doc.documentElement).getPropertyValue('--nav-h') || 
                      '70px';
    
    doc.documentElement.style.setProperty('--header-h', headerHeight);

    var menuList = doc.querySelector('.c-nav__list, .navbar-nav');
    if (menuList) {
      menuList.style.height = 'calc(100vh - ' + headerHeight + ')';
    }
  };

  app.initAnchors = function() {
    if (app.__anchorsInit) return;
    app.__anchorsInit = true;

    var isHomepage = win.location.pathname === '/' || win.location.pathname === '/index.html';

    var handleAnchorClick = function(e) {
      var href = this.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      if (!href.startsWith('#')) return;

      e.preventDefault();

      var targetId = href.substring(1);
      var target = doc.getElementById(targetId);

      if (!target) return;

      var headerHeight = getHeaderHeight();
      var targetTop = target.getBoundingClientRect().top + win.pageYOffset - headerHeight;

      win.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      if (isHomepage) {
        win.history.pushState(null, null, href);
      }

      var nav = doc.querySelector('.c-nav, .navbar');
      var navList = doc.querySelector('.c-nav__list, .navbar-nav');
      if (nav && (hasClass(nav, 'is-open') || hasClass(navList, 'show'))) {
        removeClass(nav, 'is-open');
        removeClass(navList, 'show');
        removeClass(body, 'u-no-scroll');
      }
    };

    var anchorLinks = doc.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
      link.addEventListener('click', handleAnchorClick);
    });
  };

  app.initScrollSpy = function() {
    if (app.__scrollSpyInit) return;
    app.__scrollSpyInit = true;

    var navLinks = doc.querySelectorAll('.c-nav__link, .nav-link');
    var sections = [];

    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        var section = doc.querySelector(href);
        if (section) {
          sections.push({ link: link, section: section });
        }
      }
    });

    if (sections.length === 0) return;

    var updateActiveLink = throttle(function() {
      var scrollPos = win.pageYOffset + getHeaderHeight() + 100;

      for (var i = sections.length - 1; i >= 0; i--) {
        var item = sections[i];
        if (item.section.offsetTop <= scrollPos) {
          navLinks.forEach(function(link) {
            removeClass(link, 'is-active');
            link.removeAttribute('aria-current');
          });
          addClass(item.link, 'is-active');
          item.link.setAttribute('aria-current', 'page');
          return;
        }
      }
    }, 100);

    win.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  };

  app.initImages = function() {
    if (app.__imagesInit) return;
    app.__imagesInit = true;

    var images = doc.querySelectorAll('img');
    var videos = doc.querySelectorAll('video');

    images.forEach(function(img) {
      if (!img.hasAttribute('loading') && 
          !img.classList.contains('c-logo__img') && 
          !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        addClass(img, 'img-fluid');
      }

      img.addEventListener('error', function() {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect fill="#e9ecef" width="200" height="200"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#6c757d" font-size="12" font-family="system-ui">Image not found</text></svg>';
        var encoded = 'data:image/svg+xml;base64,' + btoa(svg);
        img.src = encoded;
        img.style.objectFit = 'contain';
      });
    });

    videos.forEach(function(video) {
      if (!video.hasAttribute('loading')) {
        video.setAttribute('loading', 'lazy');
      }
    });
  };

  app.initIntersectionObserver = function() {
    if (app.__ioInit) return;
    app.__ioInit = true;

    if (!('IntersectionObserver' in win)) return;

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    var animateOnScroll = function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          
          target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
          
          observer.unobserve(target);
        }
      });
    };

    var observer = new IntersectionObserver(animateOnScroll, observerOptions);

    var animatableElements = doc.querySelectorAll('.card, .c-button, img, .hero-section, .alert, section, article, .form-group');
    
    animatableElements.forEach(function(el) {
      if (!el.hasAttribute('data-no-animate')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
      }
    });
  };

  app.initMicroInteractions = function() {
    if (app.__microInit) return;
    app.__microInit = true;

    var interactiveElements = doc.querySelectorAll('.btn, .c-button, a.nav-link, .card, .badge, .alert');

    interactiveElements.forEach(function(el) {
      el.style.transition = 'all 0.3s ease-in-out';

      el.addEventListener('mouseenter', function() {
        if (this.classList.contains('card')) {
          this.style.transform = 'translateY(-8px) scale(1.02)';
          this.style.boxShadow = 'var(--shadow-xl)';
        } else if (this.classList.contains('btn') || this.classList.contains('c-button')) {
          this.style.transform = 'translateY(-2px) scale(1.05)';
          this.style.boxShadow = 'var(--shadow-lg)';
        }
      });

      el.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });

      el.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
      });

      el.addEventListener('mouseup', function() {
        this.style.transform = '';
      });
    });
  };

  app.initRippleEffect = function() {
    if (app.__rippleInit) return;
    app.__rippleInit = true;

    var rippleElements = doc.querySelectorAll('.btn, .c-button, .nav-link');

    rippleElements.forEach(function(el) {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';

      el.addEventListener('click', function(e) {
        var ripple = doc.createElement('span');
        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-effect 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        var bgColor = getComputedStyle(this).backgroundColor;
        var isLight = this.classList.contains('btn-primary') || 
                     this.classList.contains('c-button--primary') ||
                     this.classList.contains('btn-secondary') ||
                     this.classList.contains('c-button--secondary');
        
        ripple.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 58, 125, 0.3)';

        this.appendChild(ripple);

        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    });

    var style = doc.createElement('style');
    style.textContent = '@keyframes ripple-effect { to { transform: scale(4); opacity: 0; } }';
    doc.head.appendChild(style);
  };

  app.initForms = function() {
    if (app.__formsInit) return;
    app.__formsInit = true;

    var forms = doc.querySelectorAll('form, .needs-validation');

    var patterns = {
      name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\d\s+\-()]{10,20}$/,
      message: /.{10,}/
    };

    var messages = {
      name: 'Please enter a valid name (2-50 characters, letters only)',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      message: 'Message must be at least 10 characters long',
      required: 'This field is required'
    };

    var validateField = function(field) {
      var value = field.value.trim();
      var name = field.name.toLowerCase();
      var type = field.type;
      var isValid = true;
      var message = '';

      removeClass(field, 'is-invalid');
      removeClass(field, 'is-valid');

      var feedback = field.parentElement.querySelector('.invalid-feedback');
      if (feedback) feedback.remove();

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = messages.required;
      } else if (value) {
        if (name.includes('name') || name.includes('nom') || type === 'text' && field.placeholder && field.placeholder.toLowerCase().includes('name')) {
          if (!patterns.name.test(value)) {
            isValid = false;
            message = messages.name;
          }
        } else if (type === 'email' || name.includes('email') || name.includes('mail')) {
          if (!patterns.email.test(value)) {
            isValid = false;
            message = messages.email;
          }
        } else if (type === 'tel' || name.includes('phone') || name.includes('tel')) {
          if (!patterns.phone.test(value)) {
            isValid = false;
            message = messages.phone;
          }
        } else if (name.includes('message') || field.tagName.toLowerCase() === 'textarea') {
          if (!patterns.message.test(value)) {
            isValid = false;
            message = messages.message;
          }
        }
      }

      if (!isValid) {
        addClass(field, 'is-invalid');
        var feedbackEl = doc.createElement('div');
        feedbackEl.className = 'invalid-feedback';
        feedbackEl.textContent = message;
        field.parentElement.appendChild(feedbackEl);
        return false;
      } else if (value) {
        addClass(field, 'is-valid');
      }

      return true;
    };

    forms.forEach(function(form) {
      var fields = form.querySelectorAll('input, textarea, select');
      var honeypot = doc.createElement('input');
      honeypot.type = 'text';
      honeypot.name = 'website';
      honeypot.style.position = 'absolute';
      honeypot.style.left = '-9999px';
      honeypot.setAttribute('tabindex', '-1');
      honeypot.setAttribute('autocomplete', 'off');
      form.appendChild(honeypot);

      fields.forEach(function(field) {
        field.addEventListener('blur', function() {
          validateField(this);
        });

        field.addEventListener('input', debounce(function() {
          if (hasClass(this, 'is-invalid') || hasClass(this, 'is-valid')) {
            validateField(this);
          }
        }, 300));
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (honeypot.value) {
          return false;
        }

        var allValid = true;
        fields.forEach(function(field) {
          if (!validateField(field)) {
            allValid = false;
          }
        });

        if (!allValid) {
          addClass(form, 'was-validated');
          var firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return false;
        }

        var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

          setTimeout(function() {
            if (navigator.onLine) {
              app.notify('Message sent successfully!', 'success');
              form.reset();
              removeClass(form, 'was-validated');
              fields.forEach(function(field) {
                removeClass(field, 'is-valid');
                removeClass(field, 'is-invalid');
              });
              
              setTimeout(function() {
                win.location.href = 'thank_you.html';
              }, 1000);
            } else {
              app.notify('Connection error. Please check your internet connection and try again.', 'error');
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
          }, 1500);
        }
      });
    });
  };

  app.notify = function(message, type) {
    type = type || 'info';

    var container = doc.querySelector('.js-toast-container');
    if (!container) {
      container = doc.createElement('div');
      container.className = 'js-toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.maxWidth = '400px';
      body.appendChild(container);
    }

    var alertClass = type === 'error' || type === 'danger' ? 'alert-danger' : 
                     type === 'success' ? 'alert-success' : 
                     type === 'warning' ? 'alert-warning' : 'alert-info';
    
    var toast = doc.createElement('div');
    toast.className = 'alert ' + alertClass;
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = 'var(--border-radius-lg)';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.marginBottom = '1rem';
    toast.style.animation = 'slideInRight 0.3s ease-out';
    toast.style.minWidth = '300px';
    toast.innerHTML = '<strong>' + message + '</strong>';
    
    container.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(function() {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  app.initScrollToTop = function() {
    if (app.__scrollTopInit) return;
    app.__scrollTopInit = true;

    var scrollBtn = doc.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.position = 'fixed';
    scrollBtn.style.bottom = '30px';
    scrollBtn.style.right = '30px';
    scrollBtn.style.width = '50px';
    scrollBtn.style.height = '50px';
    scrollBtn.style.borderRadius = '50%';
    scrollBtn.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)';
    scrollBtn.style.color = 'white';
    scrollBtn.style.border = 'none';
    scrollBtn.style.fontSize = '24px';
    scrollBtn.style.cursor = 'pointer';
    scrollBtn.style.opacity = '0';
    scrollBtn.style.transform = 'scale(0)';
    scrollBtn.style.transition = 'all 0.3s ease-in-out';
    scrollBtn.style.zIndex = '1000';
    scrollBtn.style.boxShadow = 'var(--shadow-lg)';
    body.appendChild(scrollBtn);

    var toggleScrollBtn = throttle(function() {
      if (win.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.transform = 'scale(1)';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.transform = 'scale(0)';
      }
    }, 100);

    win.addEventListener('scroll', toggleScrollBtn, { passive: true });

    scrollBtn.addEventListener('click', function() {
      win.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    scrollBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.boxShadow = 'var(--shadow-xl)';
    });

    scrollBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = 'var(--shadow-lg)';
    });
  };

  app.initCountUp = function() {
    if (app.__countUpInit) return;
    app.__countUpInit = true;

    if (!('IntersectionObserver' in win)) return;

    var countElements = doc.querySelectorAll('[data-count]');
    if (countElements.length === 0) return;

    var animateCount = function(el) {
      var target = parseInt(el.getAttribute('data-count')) || 0;
      var duration = parseInt(el.getAttribute('data-duration')) || 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      var updateCount = function() {
        current += increment;
        if (current < target) {
          el.textContent = Math.floor(current);
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target;
        }
      };

      updateCount();
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    countElements.forEach(function(el) {
      observer.observe(el);
    });
  };

  app.initConnectionCheck = function() {
    if (app.__connectionInit) return;
    app.__connectionInit = true;

    win.addEventListener('online', function() {
      app.notify('Connection restored', 'success');
    });

    win.addEventListener('offline', function() {
      app.notify('Connection lost. Please check your internet connection.', 'warning');
    });
  };

  app.initModalBackdrop = function() {
    if (app.__modalInit) return;
    app.__modalInit = true;

    var modalTriggers = doc.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        var modalId = this.getAttribute('data-modal-trigger');
        var modal = doc.getElementById(modalId);
        
        if (!modal) return;

        var backdrop = doc.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        backdrop.style.zIndex = '1040';
        backdrop.style.opacity = '0';
        backdrop.style.transition = 'opacity 0.3s ease-in-out';
        body.appendChild(backdrop);

        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%) scale(0.7)';
        modal.style.zIndex = '1050';
        modal.style.backgroundColor = 'var(--color-background)';
        modal.style.padding = '2rem';
        modal.style.borderRadius = 'var(--border-radius-xl)';
        modal.style.boxShadow = 'var(--shadow-xl)';
        modal.style.maxWidth = '90%';
        modal.style.maxHeight = '90vh';
        modal.style.overflow = 'auto';
        modal.style.opacity = '0';
        modal.style.transition = 'all 0.3s ease-in-out';
        modal.style.display = 'block';

        setTimeout(function() {
          backdrop.style.opacity = '1';
          modal.style.opacity = '1';
          modal.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        addClass(body, 'u-no-scroll');

        var closeModal = function() {
          backdrop.style.opacity = '0';
          modal.style.opacity = '0';
          modal.style.transform = 'translate(-50%, -50%) scale(0.7)';
          
          setTimeout(function() {
            backdrop.remove();
            modal.style.display = 'none';
            removeClass(body, 'u-no-scroll');
          }, 300);
        };

        backdrop.addEventListener('click', closeModal);

        var closeBtn = modal.querySelector('[data-modal-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', closeModal);
        }

        doc.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closeModal();
          }
        });
      });
    });
  };

  var style = doc.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    .spinner-border {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 0.15em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-border 0.75s linear infinite;
    }
    .spinner-border-sm {
      width: 0.75rem;
      height: 0.75rem;
      border-width: 0.1em;
    }
    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 991px) {
      .navbar-nav {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        transform: translateX(-100%) !important;
        transition: transform 0.4s ease-in-out !important;
        background: var(--color-background) !important;
        z-index: 999 !important;
        overflow-y: auto !important;
      }
      .navbar-nav.show {
        transform: translateX(0) !important;
      }
    }
  `;
  doc.head.appendChild(style);

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})(window);