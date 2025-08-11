/**
 * Portfolio JavaScript - Modern, Interactive, and Performant
 * Features: Custom cursor, scroll animations, particle system, form handling, and more
 */

// ==========================================================================
// Utility Functions
// ==========================================================================

const utils = {
  // Throttle function for performance optimization
  throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },


  // Get element's offset from top of document
  getOffset(element) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  },

  // Linear interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

};

// ==========================================================================
// Loading Screen
// ==========================================================================

class LoadingScreen {
  constructor() {
    this.loadingScreen = document.querySelector('.loading-screen');
    this.progressBar = document.querySelector('.loading-screen__bar');
    
    // Prevent scrolling during loading
    document.body.style.overflow = 'hidden';
    
    this.init();
  }

  init() {
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => this.hide(), 500);
      }
      this.updateProgress(progress);
    }, 100);
  }

  updateProgress(progress) {
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
  }

  hide() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-screen--hidden');
      document.body.style.overflow = '';
      
      // Remove loading screen from DOM after animation
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.remove();
        }
      }, 600);
    }
  }
}

// ==========================================================================
// Custom Cursor
// ==========================================================================

class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    this.dot = document.querySelector('.cursor__dot');
    this.circle = document.querySelector('.cursor__circle');
    this.isMobile = window.innerWidth <= 768;
    
    if (!this.isMobile && this.cursor) {
      this.init();
    }
  }

  init() {
    this.mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.circlePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.hasMovedMouse = false;

    // Show cursor immediately at center
    this.cursor.style.opacity = '1';

    this.bindEvents();
    this.animateCursor();
    this.setupHoverEffects();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      
      // Show cursor on first mouse movement
      if (!this.hasMovedMouse) {
        this.hasMovedMouse = true;
        this.cursor.style.opacity = '1';
      }
    });

    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('cursor--click');
    });

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('cursor--click');
    });
  }

  animateCursor() {
    // Smooth following animation using lerp
    this.circlePosition.x = utils.lerp(this.circlePosition.x, this.mousePosition.x, 0.15);
    this.circlePosition.y = utils.lerp(this.circlePosition.y, this.mousePosition.y, 0.15);

    if (this.circle) {
      this.circle.style.transform = `translate(calc(${this.circlePosition.x}px - 50%), calc(${this.circlePosition.y}px - 50%))`;
    }

    requestAnimationFrame(() => this.animateCursor());
  }

  setupHoverEffects() {
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-item');
    
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.classList.add('cursor--hover');
      });

      element.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('cursor--hover');
      });
    });
  }
}

// ==========================================================================
// Particle System for Hero Background
// ==========================================================================

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    this.resize();
    this.setupCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  setupCanvas() {
    // Enable smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set line properties for smoother circles
    this.ctx.lineWidth = 0;
    this.ctx.strokeStyle = 'transparent';
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
    });
  }

  createParticles() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 20000);
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.3 + 0.3,
        baseX: 0,
        baseY: 0
      });
    }

    // Set base positions
    this.particles.forEach(particle => {
      particle.baseX = particle.x;
      particle.baseY = particle.y;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // Mouse interaction
      const dx = this.mousePosition.x - particle.x;
      const dy = this.mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 0.5;
        particle.vy -= Math.sin(angle) * force * 0.5;
      }

      // Return to base position
      particle.vx += (particle.baseX - particle.x) * 0.01;
      particle.vy += (particle.baseY - particle.y) * 0.01;

      // Apply velocity with damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Draw particle with better rendering
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = '#8B4513';
      this.ctx.beginPath();
      this.ctx.arc(Math.round(particle.x), Math.round(particle.y), particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Draw connections
      this.particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = `rgba(139, 69, 19, ${0.1 * (1 - distance / 100)})`;
          this.ctx.stroke();
        }
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================================
// Navigation
// ==========================================================================

class Navigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.navToggle = document.querySelector('.nav__toggle');
    this.navMenu = document.querySelector('.nav__menu');
    this.navLinks = document.querySelectorAll('.nav__link');
    this.sections = document.querySelectorAll('.section');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupSmoothScroll();
    this.setupActiveStates();
    this.setupNavbarHiding();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        const isOpen = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isOpen);
        this.navMenu.classList.toggle('nav__menu--open');
        document.body.style.overflow = !isOpen ? 'hidden' : 'visible';
      });
    }

    // Close mobile menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.navMenu.classList.remove('nav__menu--open');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'visible';
      });
    });
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const offsetTop = utils.getOffset(targetSection) - 80;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupActiveStates() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.setActiveLink(id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -80% 0px'
      }
    );

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  setActiveLink(activeId) {
    this.navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('nav__link--active');
      }
    });
  }

  setupNavbarHiding() {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', utils.throttle(() => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          this.nav.classList.add('nav--hidden');
        } else {
          this.nav.classList.remove('nav--hidden');
        }
      } else {
        this.nav.classList.remove('nav--hidden');
      }

      lastScrollY = currentScrollY;
    }, 100));
  }
}


// ==========================================================================
// Scroll Animations
// ==========================================================================

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('[class*="fade-in"], [class*="slide-in"]');
    this.init();
  }

  init() {
    this.setupObserver();
    this.animateSkills();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            if (element.classList.contains('fade-in')) {
              element.classList.add('fade-in--visible');
            } else if (element.classList.contains('slide-in-left')) {
              element.classList.add('slide-in-left--visible');
            } else if (element.classList.contains('slide-in-right')) {
              element.classList.add('slide-in-right--visible');
            }

            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  animateSkills() {
    const skillBars = document.querySelectorAll('.skill-item__progress');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const skillBar = entry.target;
            const skillLevel = skillBar.getAttribute('data-skill');
            
            setTimeout(() => {
              skillBar.style.width = `${skillLevel}%`;
            }, 200);

            observer.unobserve(skillBar);
          }
        });
      },
      { threshold: 0.5 }
    );

    skillBars.forEach(bar => {
      observer.observe(bar);
    });
  }
}

// ==========================================================================
// Project Filtering
// ==========================================================================

class ProjectFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projectCards = document.querySelectorAll('.project-card');
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        this.filterProjects(filter);
        this.setActiveFilter(button);
      });
    });
  }

  filterProjects(filter) {
    this.projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      
      if (filter === 'all' || category === filter) {
        card.classList.remove('project-card--hidden');
      } else {
        card.classList.add('project-card--hidden');
      }
    });
  }

  setActiveFilter(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('filter-btn--active');
    });
    activeButton.classList.add('filter-btn--active');
  }
}

// ==========================================================================
// Contact Form
// ==========================================================================

class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact__form');
    this.inputs = document.querySelectorAll('.form-input');
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.setupValidation();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time validation
    this.inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearError(input);
      });
    });
  }

  setupValidation() {
    this.validators = {
      name: (value) => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
      },
      
      email: (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      },
      
      subject: (value) => {
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 5) return 'Subject must be at least 5 characters';
        return null;
      },
      
      message: (value) => {
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return null;
      }
    };
  }

  validateField(input) {
    const validator = this.validators[input.name];
    if (validator) {
      const error = validator(input.value);
      if (error) {
        this.showError(input, error);
        return false;
      } else {
        this.clearError(input);
        return true;
      }
    }
    return true;
  }

  showError(input, message) {
    const errorElement = document.querySelector(`#${input.id}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('form-error--show');
    }
    input.style.borderColor = '#ef4444';
  }

  clearError(input) {
    const errorElement = document.querySelector(`#${input.id}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('form-error--show');
    }
    input.style.borderColor = '';
  }

  async handleSubmit() {
    let isValid = true;
    
    // Validate all fields
    this.inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    // Show loading state
    const submitButton = this.form.querySelector('button[type="submit"]');
    submitButton.classList.add('btn--loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      this.showSuccess();
      this.form.reset();
    } catch (error) {
      // Error handling
      this.showError(null, 'Something went wrong. Please try again.');
    } finally {
      submitButton.classList.remove('btn--loading');
    }
  }

  showSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    successMessage.style.cssText = `
      padding: 16px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      margin-bottom: 16px;
      text-align: center;
    `;

    this.form.insertBefore(successMessage, this.form.firstChild);

    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }
}

// ==========================================================================
// Background Effects
// ==========================================================================

class BackgroundEffects {
  constructor() {
    this.init();
  }

  init() {
    this.setupParallax();
    this.setupMouseTrackingEffects();
  }

  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', utils.throttle(() => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    }, 16));
  }

  setupMouseTrackingEffects() {
    const trackingElements = document.querySelectorAll('.hero__visual, .about__image');
    
    trackingElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }
}


// ==========================================================================
// Main Application
// ==========================================================================

class PortfolioApp {
  constructor() {
    this.components = {};
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize loading screen first
      this.components.loadingScreen = new LoadingScreen();

      // Initialize core components
      this.components.customCursor = new CustomCursor();
      this.components.navigation = new Navigation();
      this.components.scrollAnimations = new ScrollAnimations();
      this.components.projectFilter = new ProjectFilter();
      this.components.contactForm = new ContactForm();
      this.components.backgroundEffects = new BackgroundEffects();

      // Initialize particle system for hero
      const heroCanvas = document.getElementById('heroCanvas');
      if (heroCanvas) {
        this.components.particleSystem = new ParticleSystem(heroCanvas);
      }


      // Portfolio app initialized successfully
    } catch (error) {
      console.error('Error initializing portfolio app:', error);
    }
  }
}

// ==========================================================================
// Initialize Application
// ==========================================================================

// Start the application
const app = new PortfolioApp();

// Export for potential external use
window.PortfolioApp = app;

