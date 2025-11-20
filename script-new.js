// ===== GLOBAL VARIABLES =====
let isMenuOpen = false;
let currentLanguage = 'en';

// ===== DOM ELEMENTS =====
const loadingScreen = document.getElementById('loadingScreen');
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');

// ===== LOADING SCREEN =====
// Verificar si la loading screen ya se mostró antes
const hasSeenLoadingScreen = localStorage.getItem('zenSolutions_loadingShown');

if (hasSeenLoadingScreen) {
  // Si ya se mostró antes, ocultarla inmediatamente
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
} else {
  // Si es la primera vez, mostrar la loading screen
  window.addEventListener('load', () => {
    // Simulate loading time
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          // Guardar en localStorage que ya se mostró
          localStorage.setItem('zenSolutions_loadingShown', 'true');
        }, 500);
      }
    }, 2000);
  });
}

// ===== NAVIGATION =====
// Mobile menu toggle
navToggle.addEventListener('click', () => {
  isMenuOpen = !isMenuOpen;
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = isMenuOpen ? 'hidden' : '';
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen) {
      isMenuOpen = false;
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.section-header, .about-text, .about-image, .services-grid, .work-grid, .contact-info, .contact-visual'
  );
  
  animatedElements.forEach(el => observer.observe(el));
});

// ===== LANGUAGE DETECTION AND SWITCHING =====
function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  return userLang.startsWith('es') ? 'es' : 'en';
}

function setLanguage(lang) {
  currentLanguage = lang;
  const elements = document.querySelectorAll('[data-en]');
  
  elements.forEach(element => {
    const text = element.getAttribute(`data-${lang}`);
    if (text) {
      element.textContent = text;
    }
  });
  
  // Update document language
  document.documentElement.lang = lang;
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
  const detectedLang = detectLanguage();
  setLanguage(detectedLang);
});

// ===== PARALLAX EFFECTS =====
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.hero-bg-pattern');
  
  parallaxElements.forEach(element => {
    const speed = 0.5;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// ===== SERVICE CARDS INTERACTION =====
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// ===== WORK ITEMS INTERACTION =====
// Only attach hover behaviors on devices that support hover
document.addEventListener('DOMContentLoaded', () => {
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  document.querySelectorAll('.work-item').forEach(item => {
    // Keep Online Tools overlay always visible on all devices
    const isOnlineTools = item.dataset.project === 'onlinetools';
    if (isOnlineTools) return; // Do not override with JS

    if (!supportsHover) return; // Mobile/touch: CSS keeps overlay visible

    item.addEventListener('mouseenter', () => {
      const overlay = item.querySelector('.work-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      const overlay = item.querySelector('.work-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
      }
    });
  });
});

// ===== STATISTICS COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  counters.forEach(counter => {
    const target = counter.textContent;
    const isPercentage = target.includes('%');
    const isPlus = target.includes('+');
    const isSlash = target.includes('/');
    const isX = /x/i.test(target);
    
    let numericTarget;
    if (isPercentage) {
      numericTarget = parseInt(target);
    } else if (isPlus) {
      numericTarget = parseInt(target.replace('+', ''));
    } else if (isSlash) {
      // For 24/7, just animate the first number
      numericTarget = 24;
    } else if (isX) {
      numericTarget = parseInt(target.replace(/x/i, ''));
    } else {
      numericTarget = parseInt(target);
    }
    
    let current = 0;
    const increment = numericTarget / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(timer);
      }
      
      if (isPercentage) {
        counter.textContent = Math.floor(current) + '%';
      } else if (isPlus) {
        counter.textContent = Math.floor(current) + '+';
      } else if (isSlash) {
        counter.textContent = Math.floor(current) + '/7';
      } else if (isX) {
        counter.textContent = Math.floor(current) + 'X';
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 30);
  });
}

// Trigger counter animation when about section is visible
const aboutObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      aboutObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
    aboutObserver.observe(aboutSection);
  }
});

// ===== CURSOR EFFECTS (disabled on mobile/touch) =====
document.addEventListener('DOMContentLoaded', () => {
  const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFineHover) {
    // Do not create the custom cursor on touch/mobile
    return;
  }

  // Create custom cursor
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: var(--primary-purple);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
    mix-blend-mode: difference;
  `;
  document.body.appendChild(cursor);
  
  // Cursor follow effect
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
  });
  
  // Cursor hover effects
  const hoverElements = document.querySelectorAll('a, button, .btn, .service-card, .work-item');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(2)';
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
    });
  });

  // Safety: hide cursor if a touch interaction occurs
  const hideOnTouch = () => { if (cursor) cursor.style.display = 'none'; };
  window.addEventListener('touchstart', hideOnTouch, { passive: true });
});

// ===== SCROLL PROGRESS INDICATOR =====
function createScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-purple), var(--primary-green));
    z-index: 1001;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

document.addEventListener('DOMContentLoaded', createScrollProgress);

// ===== TYPING EFFECT FOR HERO TITLE =====
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// ===== IMAGE LAZY LOADING =====
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ===== FORM VALIDATION (if you add forms later) =====
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(() => {
  // Scroll-based animations and effects
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

// ===== ACCESSIBILITY IMPROVEMENTS =====
// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    isMenuOpen = false;
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Focus management
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('focus', () => {
    link.style.outline = '2px solid var(--primary-green)';
    link.style.outlineOffset = '2px';
  });
  
  link.addEventListener('blur', () => {
    link.style.outline = 'none';
  });
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
});

// ===== ANALYTICS HELPERS =====
const sendAnalyticsEvent = (eventName, eventData = {}) => {
  if (typeof window.trackEvent === 'function') {
    window.trackEvent(eventName, eventData);
  } else {
    console.debug('Analytics event (fallback):', eventName, eventData);
  }
};

// Track important interactions
document.addEventListener('DOMContentLoaded', () => {
  // Track CTA clicks
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sendAnalyticsEvent('cta_click', { 
        text: btn.textContent?.trim(),
        href: btn.href 
      });
    });
  });
  
  // Track social media clicks
  document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', () => {
      sendAnalyticsEvent('social_click', { 
        platform: link.getAttribute('aria-label'),
        href: link.href 
      });
    });
  });
});

// ===== UTILITY FUNCTIONS =====
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features
  lazyLoadImages();
  
  // Add loading animation to images
  document.querySelectorAll('img').forEach(img => {
    // Only apply opacity animation if image hasn't loaded yet
    if (!img.complete) {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
    } else {
      // Image already loaded, ensure it's visible
      img.style.opacity = '1';
    }
  });
  
  // Smooth reveal animation for page content
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

// Set initial body opacity
document.body.style.opacity = '1';
document.body.style.transition = 'opacity 0.5s ease'; 
