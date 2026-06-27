// ============================================
// THE CREATIVE LAB — Script
// Premium Editorial Portfolio — Vanilla JS
// ============================================

(function () {
  'use strict';

  // -------------------------------------------------
  // --- Configuration & Constants ---
  // -------------------------------------------------

  const CONFIG = {
    cursor: {
      lerpFactor: 0.15,
      hoverScale: 2.2,
      interactiveSelectors:
        'a, button, .desk-item, .experiment-tile, .archive-card, .project-card, input, textarea, select',
    },
    parallax: {
      heroDivisor: 40,
      scrollMaxOffset: 30,
    },
    nav: {
      scrollThreshold: 100,
    },
    reveal: {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    },
    section: {
      threshold: 0.01,
    },
    load: {
      wordDelay: 100,    // ms between each word reveal
      subtitleDelay: 600, // ms after last word
      indicatorDelay: 900,
      fragmentsDelay: 1100,
      initialDelay: 300,  // ms after body.loaded before hero animates
    },
  };

  // -------------------------------------------------
  // --- Cached DOM Elements ---
  // -------------------------------------------------

  const DOM = {
    body: document.body,
    cursorDot: document.querySelector('.custom-cursor'),
    cursorRing: document.querySelector('.custom-cursor-ring'),
    nav: document.querySelector('nav.main-nav'),
    hamburger: document.querySelector('.nav-hamburger'),
    mobileNav: document.querySelector('.nav-mobile'),
    mobileNavLinks: document.querySelectorAll('.nav-mobile a'),
    desktopNavLinks: document.querySelectorAll('.nav-links a'),
    heroSection: document.getElementById('lab-entry'),
    heroWords: document.querySelectorAll('.hero-title .line .word'),
    heroSubtitle: document.querySelector('.hero-subtitle'),
    heroFragments: document.querySelectorAll('.fragment[data-speed]'),
    heroFragmentsContainer: document.querySelector('.hero-fragments'),
    scrollIndicator: document.querySelector('.scroll-indicator'),
    reveals: document.querySelectorAll('.reveal'),
    experimentTiles: document.querySelectorAll('.experiment-tile'),
    typeToggles: document.querySelectorAll('.type-toggle'),
    contactForm: document.getElementById('project-brief'),
    submitBtn: document.querySelector('.submit-brief'),
    formInputs: {
      name: document.getElementById('client-name'),
      email: document.getElementById('client-email'),
      timeline: document.getElementById('timeline'),
      budget: document.getElementById('budget'),
      details: document.getElementById('project-details'),
    },
    archiveCards: document.querySelectorAll('.archive-card'),
    projectImages: document.querySelectorAll('.project-image'),
    caseStudyHero: document.querySelector('.case-study-hero'),
    sections: document.querySelectorAll(
      '#lab-entry, #about, #workspace, #experiments, #featured-work, #case-study, #collaboration'
    ),
    anchorLinks: document.querySelectorAll('a[href^="#"]'),
  };

  // -------------------------------------------------
  // --- Reduced Motion Detection ---
  // -------------------------------------------------

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // -------------------------------------------------
  // --- Utility Functions ---
  // -------------------------------------------------

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function throttle(fn, ms) {
    let lastCall = 0;
    let rafId = null;
    return function () {
      const now = performance.now();
      const args = arguments;
      const context = this;
      if (now - lastCall >= ms) {
        lastCall = now;
        fn.apply(context, args);
      } else {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          lastCall = performance.now();
          fn.apply(context, args);
        });
      }
    };
  }

  function debounce(fn, ms) {
    let timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, ms);
    };
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // -------------------------------------------------
  // --- Page Load Animation ---
  // -------------------------------------------------

  function initPageLoad() {
    window.addEventListener('load', function () {
      DOM.body.classList.add('loaded');

      if (prefersReducedMotion.matches) {
        // Immediately show everything without animation
        DOM.heroWords.forEach(function (word) {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
          word.style.clipPath = 'inset(0 0 0 0)';
        });
        if (DOM.heroSubtitle) {
          DOM.heroSubtitle.style.opacity = '1';
          DOM.heroSubtitle.style.transform = 'translateY(0)';
        }
        if (DOM.scrollIndicator) {
          DOM.scrollIndicator.style.opacity = '1';
        }
        if (DOM.heroFragmentsContainer) {
          DOM.heroFragmentsContainer.style.opacity = '1';
        }
        DOM.heroFragments.forEach(function (frag) {
          frag.style.opacity = '1';
        });
        return;
      }

      // Set initial hidden state for hero elements
      DOM.heroWords.forEach(function (word) {
        word.style.opacity = '0';
        word.style.transform = 'translateY(100%)';
        word.style.clipPath = 'inset(0 0 100% 0)';
        word.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      });
      if (DOM.heroSubtitle) {
        DOM.heroSubtitle.style.opacity = '0';
        DOM.heroSubtitle.style.transform = 'translateY(20px)';
        DOM.heroSubtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      }
      if (DOM.scrollIndicator) {
        DOM.scrollIndicator.style.opacity = '0';
        DOM.scrollIndicator.style.transition = 'opacity 0.8s ease';
      }
      if (DOM.heroFragmentsContainer) {
        DOM.heroFragmentsContainer.style.opacity = '0';
        DOM.heroFragmentsContainer.style.transition = 'opacity 1s ease';
      }
      DOM.heroFragments.forEach(function (frag) {
        frag.style.opacity = '0';
        frag.style.transition = 'opacity 1s ease';
      });

      setTimeout(function () {
        // Stagger reveal each hero word
        DOM.heroWords.forEach(function (word, index) {
          setTimeout(function () {
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
            word.style.clipPath = 'inset(0 0 0 0)';
          }, index * CONFIG.load.wordDelay);
        });

        var totalWordTime = DOM.heroWords.length * CONFIG.load.wordDelay;

        // Fade in subtitle
        setTimeout(function () {
          if (DOM.heroSubtitle) {
            DOM.heroSubtitle.style.opacity = '1';
            DOM.heroSubtitle.style.transform = 'translateY(0)';
          }
        }, totalWordTime + CONFIG.load.subtitleDelay);

        // Fade in scroll indicator
        setTimeout(function () {
          if (DOM.scrollIndicator) {
            DOM.scrollIndicator.style.opacity = '1';
          }
        }, totalWordTime + CONFIG.load.indicatorDelay);

        // Fade in hero fragments
        setTimeout(function () {
          if (DOM.heroFragmentsContainer) {
            DOM.heroFragmentsContainer.style.opacity = '1';
          }
          DOM.heroFragments.forEach(function (frag) {
            frag.style.opacity = '1';
          });
        }, totalWordTime + CONFIG.load.fragmentsDelay);
      }, CONFIG.load.initialDelay);
    });
  }

  // -------------------------------------------------
  // --- Custom Cursor (Desktop Only) ---
  // -------------------------------------------------

  function initCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (prefersReducedMotion.matches) return;
    if (!DOM.cursorDot || !DOM.cursorRing) return;

    DOM.body.classList.add('custom-cursor-active');

    var mouseX = 0;
    var mouseY = 0;
    var ringX = 0;
    var ringY = 0;
    var isHovering = false;
    var cursorVisible = false;

    function showCursor() {
      if (!cursorVisible) {
        cursorVisible = true;
        DOM.cursorDot.style.opacity = '1';
        DOM.cursorRing.style.opacity = '1';
      }
    }

    function hideCursor() {
      if (cursorVisible) {
        cursorVisible = false;
        DOM.cursorDot.style.opacity = '0';
        DOM.cursorRing.style.opacity = '0';
      }
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      showCursor();
      // Move the dot immediately (or near-immediately)
      DOM.cursorDot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px) translate(-50%, -50%)';
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      hideCursor();
    });

    document.addEventListener('mouseenter', function () {
      showCursor();
    });

    // Ring animation loop with lerp
    function animateRing() {
      ringX = lerp(ringX, mouseX, CONFIG.cursor.lerpFactor);
      ringY = lerp(ringY, mouseY, CONFIG.cursor.lerpFactor);

      var scale = isHovering ? CONFIG.cursor.hoverScale : 1;
      DOM.cursorRing.style.transform =
        'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%) scale(' + scale + ')';

      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    // Hover detection on interactive elements
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(CONFIG.cursor.interactiveSelectors)) {
        isHovering = true;
        DOM.cursorDot.classList.add('cursor-hover');
        DOM.cursorRing.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(CONFIG.cursor.interactiveSelectors)) {
        isHovering = false;
        DOM.cursorDot.classList.remove('cursor-hover');
        DOM.cursorRing.classList.remove('cursor-hover');
      }
    });
  }

  // -------------------------------------------------
  // --- Navigation ---
  // -------------------------------------------------

  function initNavigation() {
    // --- Scroll state: add/remove .nav-scrolled ---
    var lastScrolled = false;

    function updateNavScroll() {
      var scrolled = window.scrollY > CONFIG.nav.scrollThreshold;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        if (DOM.nav) {
          if (scrolled) {
            DOM.nav.classList.add('nav-scrolled');
          } else {
            DOM.nav.classList.remove('nav-scrolled');
          }
        }
      }
    }

    window.addEventListener('scroll', updateNavScroll, { passive: true });
    // Initial check
    updateNavScroll();

    // --- Mobile menu toggle ---
    var menuOpen = false;

    function openMenu() {
      menuOpen = true;
      if (DOM.mobileNav) DOM.mobileNav.classList.add('active');
      if (DOM.hamburger) DOM.hamburger.classList.add('active');
      DOM.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuOpen = false;
      if (DOM.mobileNav) DOM.mobileNav.classList.remove('active');
      if (DOM.hamburger) DOM.hamburger.classList.remove('active');
      DOM.body.style.overflow = '';
    }

    if (DOM.hamburger) {
      DOM.hamburger.addEventListener('click', function () {
        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // Close on mobile nav link click
    DOM.mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    });

    // --- Smooth scroll for all anchor links ---
    DOM.anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // -------------------------------------------------
  // --- Active Section Tracking ---
  // -------------------------------------------------

  function initSectionTracking() {
    if (!DOM.desktopNavLinks.length || !DOM.sections.length) return;

    // Build a map of section id → nav link
    var navLinkMap = {};
    DOM.desktopNavLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        navLinkMap[href.substring(1)] = link;
      }
    });

    function getActiveSection() {
      var scrollY = window.scrollY;
      var viewportH = window.innerHeight;

      // If near bottom of page, activate last section
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 30) {
        return DOM.sections[DOM.sections.length - 1];
      }

      // Find the section whose top is closest to (but not past) 30% down the viewport
      var trigger = scrollY + viewportH * 0.30;
      var best = null;
      var bestTop = -Infinity;

      DOM.sections.forEach(function (section) {
        var top = section.getBoundingClientRect().top + scrollY;
        if (top <= trigger && top > bestTop) {
          bestTop = top;
          best = section;
        }
      });

      // Fallback: first section if nothing qualifies
      return best || DOM.sections[0];
    }

    function updateActiveNav() {
      var active = getActiveSection();
      if (!active) return;
      DOM.desktopNavLinks.forEach(function (link) {
        link.classList.remove('active');
      });
      if (navLinkMap[active.id]) {
        navLinkMap[active.id].classList.add('active');
      }
    }

    window.addEventListener('scroll', throttle(updateActiveNav, 50), { passive: true });
    // Run on load
    updateActiveNav();
  }

  // -------------------------------------------------
  // --- Hero Mouse Parallax ---
  // -------------------------------------------------

  function initHeroParallax() {
    if (prefersReducedMotion.matches) return;
    if (!DOM.heroSection || !DOM.heroFragments.length) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var ticking = false;

    function updateParallax() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);

      DOM.heroFragments.forEach(function (fragment) {
        var speed = parseFloat(fragment.getAttribute('data-speed')) || 1;
        var offsetX = currentX * speed / CONFIG.parallax.heroDivisor;
        var offsetY = currentY * speed / CONFIG.parallax.heroDivisor;
        fragment.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
      });

      // Keep animating if there's a meaningful difference
      if (
        Math.abs(currentX - targetX) > 0.1 ||
        Math.abs(currentY - targetY) > 0.1
      ) {
        requestAnimationFrame(updateParallax);
      } else {
        ticking = false;
      }
    }

    var onMouseMove = throttle(function (e) {
      var rect = DOM.heroSection.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;

      targetX = e.clientX - centerX;
      targetY = e.clientY - centerY;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }, 16);

    DOM.heroSection.addEventListener('mousemove', onMouseMove, { passive: true });

    // Reset when mouse leaves hero
    DOM.heroSection.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    });
  }

  // -------------------------------------------------
  // --- Scroll-Triggered Reveals ---
  // -------------------------------------------------

  function initScrollReveals() {
    if (!DOM.reveals.length) return;

    // Reduced motion: immediately show all
    if (prefersReducedMotion.matches) {
      DOM.reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.reveal.threshold,
        rootMargin: CONFIG.reveal.rootMargin,
      }
    );

    DOM.reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // -------------------------------------------------
  // --- Experiment Tile Interactions ---
  // -------------------------------------------------

  function initExperimentTiles() {
    if (!DOM.experimentTiles.length) return;
    if (prefersReducedMotion.matches) return;

    DOM.experimentTiles.forEach(function (tile) {
      // --- Typography Experiment ---
      if (tile.classList.contains('typography-exp')) {
        var letters = tile.querySelectorAll('.exp-letters span');
        if (letters.length) {
          tile.addEventListener('mouseenter', function () {
            letters.forEach(function (span, i) {
              var spacing = (i % 2 === 0) ? '0.15em' : '0.25em';
              var yShift = (i % 2 === 0) ? -4 : 4;
              var rotation = (i % 3 - 1) * 5;
              span.style.transition =
                'letter-spacing 0.4s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.04) + 's, ' +
                'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.04) + 's';
              span.style.letterSpacing = spacing;
              span.style.transform = 'translateY(' + yShift + 'px) rotate(' + rotation + 'deg)';
              span.style.display = 'inline-block';
            });
          });

          tile.addEventListener('mouseleave', function () {
            letters.forEach(function (span, i) {
              span.style.transition =
                'letter-spacing 0.3s ease ' + (i * 0.02) + 's, ' +
                'transform 0.3s ease ' + (i * 0.02) + 's';
              span.style.letterSpacing = '0';
              span.style.transform = 'translateY(0) rotate(0deg)';
            });
          });
        }
      }

      // --- Layout Experiment ---
      if (tile.classList.contains('layout-exp')) {
        var cells = tile.querySelectorAll('.exp-grid-cell');
        if (cells.length) {
          tile.addEventListener('mouseenter', function () {
            cells.forEach(function (cell, i) {
              var transforms = [
                'translate(4px, -4px) scale(1.08)',
                'translate(-6px, 4px) scale(0.94)',
                'translate(2px, 6px) scale(1.04)',
                'translate(-4px, -2px) scale(0.96)',
                'translate(6px, 2px) scale(1.06)',
                'translate(-2px, -6px) scale(1.02)',
              ];
              var t = transforms[i % transforms.length];
              cell.style.transition =
                'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.05) + 's';
              cell.style.transform = t;
            });
          });

          tile.addEventListener('mouseleave', function () {
            cells.forEach(function (cell, i) {
              cell.style.transition =
                'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.03) + 's';
              cell.style.transform = 'translate(0, 0) scale(1)';
            });
          });
        }
      }

      // --- Color Experiment ---
      if (tile.classList.contains('color-exp')) {
        var orbs = tile.querySelectorAll('.exp-color-orb');
        if (orbs.length) {
          tile.addEventListener('mouseenter', function () {
            orbs.forEach(function (orb, i) {
              orb.style.transition =
                'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.06) + 's, ' +
                'opacity 0.6s ease ' + (i * 0.06) + 's';
              orb.style.transform = 'scale(1.6)';
              orb.style.opacity = '0.75';
            });
          });

          tile.addEventListener('mouseleave', function () {
            orbs.forEach(function (orb, i) {
              orb.style.transition =
                'transform 0.4s ease ' + (i * 0.04) + 's, ' +
                'opacity 0.4s ease ' + (i * 0.04) + 's';
              orb.style.transform = 'scale(1)';
              orb.style.opacity = '1';
            });
          });
        }
      }
    });
  }

  // -------------------------------------------------
  // --- Contact Form ---
  // -------------------------------------------------

  function initContactForm() {
    // --- Type Toggles ---
    if (DOM.typeToggles.length) {
      DOM.typeToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          // Remove active from all siblings
          DOM.typeToggles.forEach(function (t) {
            t.classList.remove('active');
          });
          // Activate clicked
          this.classList.add('active');
        });
      });
    }

    // --- Form Submission ---
    if (DOM.contactForm && DOM.submitBtn) {
      var originalBtnText = DOM.submitBtn.textContent;

      DOM.contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic validation
        var valid = true;
        var fields = DOM.formInputs;

        if (fields.name && !fields.name.value.trim()) valid = false;
        if (fields.email) {
          var emailVal = fields.email.value.trim();
          if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            valid = false;
          }
        }
        if (fields.details && !fields.details.value.trim()) valid = false;

        if (!valid) {
          // Shake the submit button briefly to indicate error
          DOM.submitBtn.style.transition = 'transform 0.1s ease';
          DOM.submitBtn.style.transform = 'translateX(-4px)';
          setTimeout(function () {
            DOM.submitBtn.style.transform = 'translateX(4px)';
          }, 100);
          setTimeout(function () {
            DOM.submitBtn.style.transform = 'translateX(-2px)';
          }, 200);
          setTimeout(function () {
            DOM.submitBtn.style.transform = 'translateX(0)';
          }, 300);

          // Highlight empty required fields
          Object.keys(fields).forEach(function (key) {
            var input = fields[key];
            if (input) {
              var parent = input.closest('.form-group');
              if (
                (key === 'name' || key === 'email' || key === 'details') &&
                !input.value.trim()
              ) {
                if (parent) parent.classList.add('error');
              } else if (
                key === 'email' &&
                input.value.trim() &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
              ) {
                if (parent) parent.classList.add('error');
              } else {
                if (parent) parent.classList.remove('error');
              }
            }
          });
          return;
        }

        // Success state
        DOM.submitBtn.textContent = 'Brief Sent ✓';
        DOM.submitBtn.disabled = true;
        DOM.submitBtn.classList.add('sent');

        // Reset after 3 seconds
        setTimeout(function () {
          DOM.submitBtn.textContent = originalBtnText;
          DOM.submitBtn.disabled = false;
          DOM.submitBtn.classList.remove('sent');
          DOM.contactForm.reset();

          // Remove any lingering focused/error classes
          var groups = DOM.contactForm.querySelectorAll('.form-group');
          groups.forEach(function (group) {
            group.classList.remove('focused');
            group.classList.remove('error');
          });

          // Reset type toggles
          DOM.typeToggles.forEach(function (t, i) {
            if (i === 0) {
              t.classList.add('active');
            } else {
              t.classList.remove('active');
            }
          });
        }, 3000);
      });
    }

    // --- Input Focus Effects ---
    var allFormInputs = document.querySelectorAll(
      '#project-brief input, #project-brief textarea, #project-brief select'
    );

    allFormInputs.forEach(function (input) {
      input.addEventListener('focus', function () {
        var parent = this.closest('.form-group');
        if (parent) {
          parent.classList.add('focused');
          parent.classList.remove('error');
        }
      });

      input.addEventListener('blur', function () {
        var parent = this.closest('.form-group');
        if (parent && !this.value.trim()) {
          parent.classList.remove('focused');
        }
      });
    });
  }

  // -------------------------------------------------
  // --- Scroll Parallax (Subtle) ---
  // -------------------------------------------------

  function initScrollParallax() {
    if (prefersReducedMotion.matches) return;

    // Gather elements to parallax on scroll
    var parallaxElements = [];

    DOM.projectImages.forEach(function (el) {
      parallaxElements.push({ el: el, speed: 0.05 });
    });

    if (DOM.caseStudyHero) {
      parallaxElements.push({ el: DOM.caseStudyHero, speed: 0.04 });
    }

    if (!parallaxElements.length) return;

    var ticking = false;

    function updateScrollParallax() {
      var viewportHeight = window.innerHeight;
      var scrollTop = window.scrollY;

      parallaxElements.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();

        // Only process if near viewport (within 1 screen above/below)
        if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) {
          return;
        }

        // Element center relative to viewport center
        var elementCenter = rect.top + rect.height / 2;
        var viewportCenter = viewportHeight / 2;
        var distance = elementCenter - viewportCenter;

        var offset = distance * item.speed;
        offset = clamp(offset, -CONFIG.parallax.scrollMaxOffset, CONFIG.parallax.scrollMaxOffset);

        item.el.style.transform = 'translateY(' + offset + 'px)';
      });

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateScrollParallax);
        }
      },
      { passive: true }
    );
  }

  // -------------------------------------------------
  // --- Archive Card Hover ---
  // -------------------------------------------------

  function initArchiveCards() {
    if (!DOM.archiveCards.length) return;
    if (prefersReducedMotion.matches) return;

    DOM.archiveCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        this.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
        this.style.transform = 'rotate(0deg) translateY(-8px) scale(1.02)';
        this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  // -------------------------------------------------
  // --- Resize Handler ---
  // -------------------------------------------------

  function initResizeHandler() {
    var onResize = debounce(function () {
      // Re-check for mobile/desktop cursor state
      if (window.matchMedia('(pointer: fine)').matches) {
        if (DOM.cursorDot) DOM.cursorDot.style.display = '';
        if (DOM.cursorRing) DOM.cursorRing.style.display = '';
      } else {
        if (DOM.cursorDot) DOM.cursorDot.style.display = 'none';
        if (DOM.cursorRing) DOM.cursorRing.style.display = 'none';
      }
    }, 250);

    window.addEventListener('resize', onResize, { passive: true });
  }

  // -------------------------------------------------
  // --- Reduced Motion Live Updates ---
  // -------------------------------------------------

  function initReducedMotionListener() {
    prefersReducedMotion.addEventListener('change', function (e) {
      if (e.matches) {
        // User just enabled reduced motion — reveal all hidden elements
        DOM.reveals.forEach(function (el) {
          el.classList.add('is-visible');
        });
        // Reset all parallax transforms
        DOM.heroFragments.forEach(function (frag) {
          frag.style.transform = '';
        });
        DOM.projectImages.forEach(function (el) {
          el.style.transform = '';
        });
        if (DOM.caseStudyHero) {
          DOM.caseStudyHero.style.transform = '';
        }
      }
    });
  }

  // -------------------------------------------------
  // --- Smooth Scroll Polyfill (keyboard nav) ---
  // -------------------------------------------------

  function initKeyboardNav() {
    // Allow keyboard users to navigate with Tab without issues
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        DOM.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', function () {
      DOM.body.classList.remove('keyboard-nav');
    });
  }

  // -------------------------------------------------
  // --- Initialization ---
  // -------------------------------------------------

  function init() {
    initPageLoad();
    initCustomCursor();
    initNavigation();
    initSectionTracking();
    initHeroParallax();
    initScrollReveals();
    initExperimentTiles();
    initContactForm();
    initScrollParallax();
    initArchiveCards();
    initResizeHandler();
    initReducedMotionListener();
    initKeyboardNav();
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ==========================================
// THUMBNAIL LIGHTBOX CAROUSEL
// ==========================================
const thumbnails = [
  "assets/thumbnails/thumb1.jpg",
  "assets/thumbnails/thumb2.jpg",
  "assets/thumbnails/thumb3.jpg",
  "assets/thumbnails/thumb4.jpg",
  "assets/thumbnails/thumb5.jpg",
  "assets/thumbnails/thumb6.jpg",
  "assets/thumbnails/thumb7.jpg",
  "assets/thumbnails/thumb8.jpg",
  "assets/thumbnails/thumb9.jpg",
  "assets/thumbnails/thumb10.jpg"
];
let currentThumbnailIndex = 0;

function openThumbnailModal() {
  const modal = document.getElementById('thumbnail-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  setModalImage(0); // Open at first image
}

function closeThumbnailModal() {
  const modal = document.getElementById('thumbnail-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

function setModalImage(index) {
  if (index < 0) index = thumbnails.length - 1;
  if (index >= thumbnails.length) index = 0;
  
  currentThumbnailIndex = index;
  
  // Update main image
  const mainImage = document.getElementById('modal-main-image');
  if (!mainImage) return;
  
  // Fade effect
  mainImage.style.opacity = 0;
  mainImage.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    mainImage.src = thumbnails[currentThumbnailIndex];
    mainImage.style.opacity = 1;
    mainImage.style.transform = 'scale(1)';
    
    // Trigger glossy shine animation
    const shine = document.querySelector('.modal-image-shine');
    if (shine) {
      shine.classList.remove('swipe');
      void shine.offsetWidth; // Force reflow to restart animation
      shine.classList.add('swipe');
    }
  }, 200);

  // Update counter
  const counter = document.querySelector('.modal-counter');
  if (counter) {
    const currentNum = (currentThumbnailIndex + 1).toString().padStart(2, '0');
    const totalNum = thumbnails.length.toString().padStart(2, '0');
    counter.textContent = `${currentNum} / ${totalNum}`;
  }

  // Update active state in filmstrip and scroll to active item
  const filmstripImgs = document.querySelectorAll('.filmstrip-img');
  filmstripImgs.forEach((img, i) => {
    if (i === currentThumbnailIndex) {
      img.classList.add('active');
      // Auto-scroll filmstrip to center the active thumbnail
      const filmstrip = img.closest('.modal-filmstrip');
      if (filmstrip) {
        const imgLeft = img.offsetLeft;
        const imgWidth = img.offsetWidth;
        const stripWidth = filmstrip.offsetWidth;
        filmstrip.scrollTo({
          left: imgLeft - stripWidth / 2 + imgWidth / 2,
          behavior: 'smooth'
        });
      }
    } else {
      img.classList.remove('active');
    }
  });
}

function changeModalImage(step) {
  setModalImage(currentThumbnailIndex + step);
}

// Close modal when clicking outside the content
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('thumbnail-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-content') || e.target.classList.contains('modal-image-container')) {
        closeThumbnailModal();
      }
    });
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('thumbnail-modal');
  const socialModal = document.getElementById('social-modal');
  const glynacModal = document.getElementById('glynac-modal');
  const postersModal = document.getElementById('posters-modal');
  
  if (modal && modal.classList.contains('active')) {
    if (e.key === 'Escape') closeThumbnailModal();
    if (e.key === 'ArrowLeft') changeModalImage(-1);
    if (e.key === 'ArrowRight') changeModalImage(1);
  }
  
  if (socialModal && socialModal.classList.contains('active')) {
    if (e.key === 'Escape') closeSocialModal();
    if (e.key === 'ArrowLeft') changeSocialImage(-1);
    if (e.key === 'ArrowRight') changeSocialImage(1);
  }

  if (glynacModal && glynacModal.classList.contains('active')) {
    if (e.key === 'Escape') closeGlynacModal();
    if (e.key === 'ArrowLeft') changeGlynacImage(-1);
    if (e.key === 'ArrowRight') changeGlynacImage(1);
  }

  if (postersModal && postersModal.classList.contains('active')) {
    if (e.key === 'Escape') closePostersModal();
    if (e.key === 'ArrowLeft') changePostersImage(-1);
    if (e.key === 'ArrowRight') changePostersImage(1);
  }
});

// ==========================================
// SOCIAL MEDIA LIGHTBOX CAROUSEL
// ==========================================
const socialMediaImages = [
  "assets/social-media/1.jpg",
  "assets/social-media/2.jpg",
  "assets/social-media/3.jpg",
  "assets/social-media/4.jpg",
  "assets/social-media/5.jpg"
];
let currentSocialIndex = 0;

function openSocialModal() {
  const modal = document.getElementById('social-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('social-modal-open');
  document.body.style.overflow = 'hidden';
  setSocialImage(0);
}

function closeSocialModal() {
  const modal = document.getElementById('social-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('social-modal-open');
  document.body.style.overflow = '';
}

function setSocialImage(index) {
  const slides = document.querySelectorAll('#social-track .social-slide');
  if (!slides.length) return;

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  
  currentSocialIndex = index;
  
  slides.forEach((slide, i) => {
    let diff = i - currentSocialIndex;
    
    // Smooth Coverflow Transformations
    if (diff === 0) {
      slide.style.transform = `translateX(0) scale(1) translateZ(0)`;
      slide.style.opacity = 1;
      slide.style.zIndex = 10;
      slide.style.filter = 'brightness(1)';
    } else if (diff === 1) {
      slide.style.transform = `translateX(50%) scale(0.85) translateZ(-100px) rotateY(-15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff === -1) {
      slide.style.transform = `translateX(-50%) scale(0.85) translateZ(-100px) rotateY(15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff > 1) {
      slide.style.transform = `translateX(${50 + (diff-1)*25}%) scale(${0.85 - (diff-1)*0.1}) translateZ(-200px) rotateY(-25deg)`;
      slide.style.opacity = Math.max(1 - (diff * 0.3), 0);
      slide.style.zIndex = 10 - diff;
      slide.style.filter = 'brightness(0.1)';
    } else if (diff < -1) {
      slide.style.transform = `translateX(${-50 + (diff+1)*25}%) scale(${0.85 + (diff+1)*0.1}) translateZ(-200px) rotateY(25deg)`;
      slide.style.opacity = Math.max(1 + (diff * 0.3), 0);
      slide.style.zIndex = 10 + diff;
      slide.style.filter = 'brightness(0.1)';
    }
  });

  const counter = document.getElementById('social-counter');
  if (counter) {
    const currentNum = (currentSocialIndex + 1).toString().padStart(2, '0');
    const totalNum = slides.length.toString().padStart(2, '0');
    counter.textContent = `${currentNum} / ${totalNum}`;
  }
}

function changeSocialImage(step) {
  setSocialImage(currentSocialIndex + step);
}

// ==========================================
// GLYNAC LIGHTBOX CAROUSEL
// ==========================================
let currentGlynacIndex = 0;

function openGlynacModal() {
  const modal = document.getElementById('glynac-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('social-modal-open');
  document.body.style.overflow = 'hidden';
  setGlynacImage(0);
}

function closeGlynacModal() {
  const modal = document.getElementById('glynac-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('social-modal-open');
  document.body.style.overflow = '';
}

function setGlynacImage(index) {
  const slides = document.querySelectorAll('#glynac-track .social-slide');
  if (!slides.length) return;

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  
  currentGlynacIndex = index;
  
  slides.forEach((slide, i) => {
    let diff = i - currentGlynacIndex;
    
    // Smooth Coverflow Transformations
    if (diff === 0) {
      slide.style.transform = `translateX(0) scale(1) translateZ(0)`;
      slide.style.opacity = 1;
      slide.style.zIndex = 10;
      slide.style.filter = 'brightness(1)';
    } else if (diff === 1) {
      slide.style.transform = `translateX(50%) scale(0.85) translateZ(-100px) rotateY(-15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff === -1) {
      slide.style.transform = `translateX(-50%) scale(0.85) translateZ(-100px) rotateY(15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff > 1) {
      slide.style.transform = `translateX(${50 + (diff-1)*25}%) scale(${0.85 - (diff-1)*0.1}) translateZ(-200px) rotateY(-25deg)`;
      slide.style.opacity = Math.max(1 - (diff * 0.3), 0);
      slide.style.zIndex = 10 - diff;
      slide.style.filter = 'brightness(0.1)';
    } else if (diff < -1) {
      slide.style.transform = `translateX(${-50 + (diff+1)*25}%) scale(${0.85 + (diff+1)*0.1}) translateZ(-200px) rotateY(25deg)`;
      slide.style.opacity = Math.max(1 + (diff * 0.3), 0);
      slide.style.zIndex = 10 + diff;
      slide.style.filter = 'brightness(0.1)';
    }
  });

  const counter = document.getElementById('glynac-counter');
  if (counter) {
    const currentNum = (currentGlynacIndex + 1).toString().padStart(2, '0');
    const totalNum = slides.length.toString().padStart(2, '0');
    counter.textContent = `${currentNum} / ${totalNum}`;
  }
}

function changeGlynacImage(step) {
  setGlynacImage(currentGlynacIndex + step);
}

// ==========================================
// POSTERS LIGHTBOX CAROUSEL
// ==========================================
let currentPostersIndex = 0;

function openPostersModal() {
  const modal = document.getElementById('posters-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('social-modal-open');
  document.body.style.overflow = 'hidden';
  setPostersImage(0);
}

function closePostersModal() {
  const modal = document.getElementById('posters-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('social-modal-open');
  document.body.style.overflow = '';
}

function setPostersImage(index) {
  const slides = document.querySelectorAll('#posters-track .social-slide');
  if (!slides.length) return;

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  
  currentPostersIndex = index;
  
  slides.forEach((slide, i) => {
    let diff = i - currentPostersIndex;
    
    // Smooth Coverflow Transformations
    if (diff === 0) {
      slide.style.transform = `translateX(0) scale(1) translateZ(0)`;
      slide.style.opacity = 1;
      slide.style.zIndex = 10;
      slide.style.filter = 'brightness(1)';
    } else if (diff === 1) {
      slide.style.transform = `translateX(50%) scale(0.85) translateZ(-100px) rotateY(-15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff === -1) {
      slide.style.transform = `translateX(-50%) scale(0.85) translateZ(-100px) rotateY(15deg)`;
      slide.style.opacity = 0.8;
      slide.style.zIndex = 9;
      slide.style.filter = 'brightness(0.4)';
    } else if (diff > 1) {
      slide.style.transform = `translateX(${50 + (diff-1)*25}%) scale(${0.85 - (diff-1)*0.1}) translateZ(-200px) rotateY(-25deg)`;
      slide.style.opacity = Math.max(1 - (diff * 0.3), 0);
      slide.style.zIndex = 10 - diff;
      slide.style.filter = 'brightness(0.1)';
    } else if (diff < -1) {
      slide.style.transform = `translateX(${-50 + (diff+1)*25}%) scale(${0.85 + (diff+1)*0.1}) translateZ(-200px) rotateY(25deg)`;
      slide.style.opacity = Math.max(1 + (diff * 0.3), 0);
      slide.style.zIndex = 10 + diff;
      slide.style.filter = 'brightness(0.1)';
    }
  });

  const counter = document.getElementById('posters-counter');
  if (counter) {
    const currentNum = (currentPostersIndex + 1).toString().padStart(2, '0');
    const totalNum = slides.length.toString().padStart(2, '0');
    counter.textContent = `${currentNum} / ${totalNum}`;
  }
}

function changePostersImage(step) {
  setPostersImage(currentPostersIndex + step);
}

document.addEventListener('DOMContentLoaded', () => {
  const socialModal = document.getElementById('social-modal');
  if (socialModal) {
    socialModal.addEventListener('click', (e) => {
      // Close if clicking the background/overlay, not the slides
      if (e.target === socialModal || e.target.classList.contains('social-slider-container') || e.target.classList.contains('social-track')) {
        closeSocialModal();
      }
    });
  }

  const glynacModal = document.getElementById('glynac-modal');
  if (glynacModal) {
    glynacModal.addEventListener('click', (e) => {
      if (e.target === glynacModal || e.target.classList.contains('social-slider-container') || e.target.classList.contains('social-track')) {
        closeGlynacModal();
      }
    });
  }

  const postersModal = document.getElementById('posters-modal');
  if (postersModal) {
    postersModal.addEventListener('click', (e) => {
      if (e.target === postersModal || e.target.classList.contains('social-slider-container') || e.target.classList.contains('social-track')) {
        closePostersModal();
      }
    });
  }
});
