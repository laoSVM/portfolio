/**
 * Portfolio JavaScript - Optimized & Clean
 * Features: Custom cursor, drawer scroll effect, particle system, and project filtering
 */

// ==========================================================================
// Utility Functions
// ==========================================================================

const utils = {
  // Linear interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
};

// ==========================================================================
// Custom Cursor
// ==========================================================================

class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
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
    const hoverElements = document.querySelectorAll('a, button, .drawer-project-card, .drawer-filter-btn, .nav-dot, .projects-scrollbar-thumb, .projects-scrollbar');
    
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
// Drawer Scroll Effect System
// ==========================================================================

class DrawerScrollEffect {
  constructor() {
    this.sections = Array.from(document.querySelectorAll('.drawer-section'));
    this.navDotsContainer = document.getElementById('navDots');
    this.scrollIndicator = document.getElementById('scrollIndicator');
    this.TOTAL_SECTIONS = this.sections.length;
    this.SECTION_HEIGHT = window.innerHeight * 1.2;
    this.navDots = [];
    
    this.init();
  }

  init() {
    if (this.sections.length === 0) return;
    
    this.createNavDots();
    this.bindEvents();
    this.initPositions();
    this.handleScroll();
  }

  createNavDots() {
    if (!this.navDotsContainer) return;
    
    this.sections.forEach((section, i) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.dataset.sectionId = section.id;
      dot.addEventListener('click', () => {
        this.scrollToSection(section.id);
      });
      this.navDotsContainer.appendChild(dot);
    });
    this.navDots = Array.from(document.querySelectorAll('.nav-dot'));
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    window.addEventListener('resize', () => {
      this.SECTION_HEIGHT = window.innerHeight * 1.2;
      this.initPositions();
      this.handleScroll();
    });
    
    // Handle anchor link navigation
    this.setupAnchorLinkHandling();
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.updateActiveNavDot();
    this.updateSectionTransforms(scrollTop);
    this.updateScrollIndicator(scrollTop);
  }

  updateActiveNavDot() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const currentSectionFloat = scrollTop / this.SECTION_HEIGHT;
    const currentSectionIndex = Math.round(currentSectionFloat);
    
    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSectionIndex);
    });
  }

  updateSectionTransforms(scrollTop) {
    // Reset all contents to visible by default
    this.sections.forEach((s) => {
      const c = s.querySelector('.section-content');
      if (c) c.style.opacity = '1';
    });

    this.sections.forEach((section, index) => {
      const content = section.querySelector('.section-content');
      
      // First section: keep background fixed, fade content as we scroll away
      if (index === 0) {
        section.style.transform = 'translateY(0)';
        const fadeProgress = this.clamp(scrollTop / this.SECTION_HEIGHT, 0, 1);
        if (content) content.style.opacity = String(Math.max(0, 1 - fadeProgress * 0.95));
        return;
      }

      const sectionStart = (index - 1) * this.SECTION_HEIGHT;
      const sectionEnd = index * this.SECTION_HEIGHT;

      // Before we reach the section: keep it positioned below viewport
      if (scrollTop < sectionStart) {
        section.style.transform = 'translateY(100vh)';
        return;
      }

      // While the section is sliding up into view
      if (scrollTop >= sectionStart && scrollTop <= sectionEnd) {
        const slideProgress = this.clamp((scrollTop - sectionStart) / this.SECTION_HEIGHT, 0, 1);
        const translateY = (1 - slideProgress) * 100;
        section.style.transform = `translateY(${translateY}vh)`;

        // Fade ONLY the previous section's content
        const prevContent = this.sections[index - 1].querySelector('.section-content');
        if (prevContent) prevContent.style.opacity = String(Math.max(0, 1 - slideProgress * 0.95));

        // Incoming section content stays visible
        if (content) content.style.opacity = '1';
        return;
      }

      // Fully in view
      if (scrollTop > sectionEnd) {
        section.style.transform = 'translateY(0)';
        if (content) content.style.opacity = '1';
      }
    });
  }

  updateScrollIndicator(scrollTop) {
    if (this.scrollIndicator) {
      this.scrollIndicator.style.opacity = (scrollTop > 100 ? '0' : '1');
    }
  }

  initPositions() {
    this.SECTION_HEIGHT = window.innerHeight * 1.2;
    this.sections.forEach((s, i) => {
      if (i === 0) {
        s.style.transform = 'translateY(0)';
      } else {
        s.style.transform = 'translateY(100vh)';
      }
      const c = s.querySelector('.section-content');
      if (c) c.style.opacity = '1';
    });
  }

  clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  setupAnchorLinkHandling() {
    // Handle anchor links in navigation
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
      });
    });
  }

  scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;
    
    // Find the index of the target section
    const sectionIndex = this.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) return;
    
    // Calculate scroll position based on section index and scroll smoothly
    const scrollPosition = sectionIndex * this.SECTION_HEIGHT;
    window.scrollTo({ 
      top: scrollPosition, 
      behavior: 'smooth' 
    });
  }
}

// ==========================================================================
// Enhanced Particle System for Drawer Layout
// ==========================================================================

class DrawerParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    this.primaryHex = this.getCssVar('--primary') || '#8B4513';
    this.primaryRgb = this.hexToRgb(this.primaryHex) || { r: 139, g: 69, b: 19 };

    this.resize();
    this.setupCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  hexToRgb(hex) {
    const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
    if (normalized.length === 3) {
      const r = parseInt(normalized[0] + normalized[0], 16);
      const g = parseInt(normalized[1] + normalized[1], 16);
      const b = parseInt(normalized[2] + normalized[2], 16);
      return { r, g, b };
    }
    if (normalized.length === 6) {
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  setupCanvas() {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.lineWidth = 0;
    this.ctx.strokeStyle = 'transparent';
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width));
    this.canvas.height = Math.max(1, Math.round(rect.height));
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.particles = [];
      this.createParticles();
    });

    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
    });
  }

  createParticles() {
    const area = this.canvas.width * this.canvas.height;
    const count = Math.floor(area / 20000);
    for (let i = 0; i < count; i++) {
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
    this.particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const dx = this.mousePosition.x - p.x;
      const dy = this.mousePosition.y - p.y;
      const dist = Math.hypot(dx, dy);
      const maxD = 100;
      if (dist < maxD) {
        const force = (maxD - dist) / maxD;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.5;
        p.vy -= Math.sin(angle) * force * 0.5;
      }
      p.vx += (p.baseX - p.x) * 0.01;
      p.vy += (p.baseY - p.y) * 0.01;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = this.primaryHex;
      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 100) {
          const alpha = 0.1 * (1 - d / 100);
          this.ctx.strokeStyle = `rgba(${this.primaryRgb.r}, ${this.primaryRgb.g}, ${this.primaryRgb.b}, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================================
// Custom Project Scrollbar
// ==========================================================================

class CustomProjectScrollbar {
  constructor(containerSelector, scrollbarSelector) {
    this.container = document.querySelector(containerSelector);
    this.scrollbar = document.querySelector(scrollbarSelector);
    this.thumb = document.querySelector(`${scrollbarSelector} .projects-scrollbar-thumb`);
    
    if (!this.container || !this.scrollbar || !this.thumb) {
      return;
    }
    
    this.isDraggingScrollbar = false;
    this.isDraggingContent = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateScrollbar();
    
    // Show scrollbar after initialization
    requestAnimationFrame(() => {
      this.scrollbar.classList.add('projects-scrollbar--visible');
    });
  }
  
  bindEvents() {
    // Content scroll events
    this.container.addEventListener('scroll', () => this.updateScrollbar(), { passive: true });
    
    // Scrollbar dragging
    this.thumb.addEventListener('mousedown', (e) => this.startScrollbarDrag(e));
    
    // Content dragging (avoid interfering with project cards)
    this.container.addEventListener('mousedown', (e) => this.startContentDrag(e));
    
    // Global mouse events
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Click on scrollbar track
    this.scrollbar.addEventListener('click', (e) => this.handleScrollbarClick(e));
    
    // Touch support
    if ('ontouchstart' in window) {
      this.bindTouchEvents();
    }
    
    // Mouse wheel horizontal scroll
    this.container.addEventListener('wheel', (e) => this.handleWheel(e));
    
    // Keyboard navigation
    this.thumb.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Resize handler
    window.addEventListener('resize', () => this.handleResize());
  }
  
  updateScrollbar() {
    if (this.container.scrollWidth <= this.container.clientWidth) {
      this.scrollbar.style.opacity = '0';
      return;
    }
    
    const scrollPercentage = this.container.scrollLeft / 
      (this.container.scrollWidth - this.container.clientWidth);
    const thumbWidth = (this.container.clientWidth / this.container.scrollWidth) * 100;
    const thumbPosition = scrollPercentage * (100 - thumbWidth);
    
    this.thumb.style.width = `${Math.max(thumbWidth, 10)}%`;
    this.thumb.style.left = `${thumbPosition}%`;
    
    // Update ARIA values
    const scrollPercent = Math.round(scrollPercentage * 100);
    this.container.setAttribute('aria-valuenow', scrollPercent);
    this.thumb.setAttribute('aria-valuenow', scrollPercent);
    
    // Show/hide scrollbar
    this.scrollbar.classList.add('projects-scrollbar--visible');
  }
  
  startScrollbarDrag(e) {
    if (this.isMobile) return;
    
    this.isDraggingScrollbar = true;
    this.thumb.classList.add('dragging');
    this.startX = e.clientX - this.thumb.offsetLeft;
    e.preventDefault();
    e.stopPropagation();
  }
  
  startContentDrag(e) {
    if (this.isMobile) return;
    
    // Don't start drag if clicking on a project card or interactive element
    if (e.target.closest('.drawer-project-card') || 
        e.target.closest('button') || 
        e.target.closest('a')) {
      return;
    }
    
    this.isDraggingContent = true;
    this.container.classList.add('grabbing');
    this.startX = e.pageX - this.container.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
    e.preventDefault();
  }
  
  handleMouseMove(e) {
    if (this.isDraggingScrollbar) {
      e.preventDefault();
      const rect = this.scrollbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const walkPercentage = Math.max(0, Math.min(1, x / rect.width));
      const scrollPosition = walkPercentage * (this.container.scrollWidth - this.container.clientWidth);
      this.container.scrollLeft = scrollPosition;
    }
    
    if (this.isDraggingContent) {
      e.preventDefault();
      const x = e.pageX - this.container.offsetLeft;
      const walk = (x - this.startX) * 2;
      this.container.scrollLeft = this.scrollLeft - walk;
    }
  }
  
  endDrag() {
    this.isDraggingScrollbar = false;
    this.isDraggingContent = false;
    this.thumb.classList.remove('dragging');
    this.container.classList.remove('grabbing');
  }
  
  handleScrollbarClick(e) {
    if (e.target === this.thumb) return;
    
    const rect = this.scrollbar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const scrollPosition = clickPosition * (this.container.scrollWidth - this.container.clientWidth);
    
    this.container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }
  
  bindTouchEvents() {
    let touchStartX = 0;
    let touchScrollLeft = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = this.container.scrollLeft;
    }, { passive: true });
    
    this.container.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const walk = (touchStartX - x) * 1.5;
      this.container.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });
  }
  
  handleWheel(e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      this.container.scrollLeft += e.deltaY;
    }
  }
  
  handleKeydown(e) {
    const cardWidth = 280 + 32; // card width + gap from CSS
    const currentCard = Math.round(this.container.scrollLeft / cardWidth);
    const totalCards = this.container.querySelectorAll('.drawer-project-card').length;
    
    switch (e.key) {
      case 'ArrowLeft':
        if (currentCard > 0) {
          this.container.scrollTo({
            left: (currentCard - 1) * cardWidth,
            behavior: 'smooth'
          });
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (currentCard < totalCards - 1) {
          this.container.scrollTo({
            left: (currentCard + 1) * cardWidth,
            behavior: 'smooth'
          });
        }
        e.preventDefault();
        break;
      case 'Home':
        this.container.scrollTo({ left: 0, behavior: 'smooth' });
        e.preventDefault();
        break;
      case 'End':
        this.container.scrollTo({
          left: this.container.scrollWidth - this.container.clientWidth,
          behavior: 'smooth'
        });
        e.preventDefault();
        break;
    }
  }
  
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== this.isMobile) {
      // Mobile state changed, update scrollbar visibility
      if (this.isMobile) {
        this.scrollbar.style.display = 'none';
      } else {
        this.scrollbar.style.display = '';
        this.updateScrollbar();
      }
    } else if (!this.isMobile) {
      this.updateScrollbar();
    }
  }
  
  destroy() {
    // Clean up event listeners
    this.container.removeEventListener('scroll', this.updateScrollbar);
    this.thumb.removeEventListener('mousedown', this.startScrollbarDrag);
    this.container.removeEventListener('mousedown', this.startContentDrag);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.endDrag);
    this.scrollbar.removeEventListener('click', this.handleScrollbarClick);
    this.container.removeEventListener('wheel', this.handleWheel);
    this.thumb.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('resize', this.handleResize);
  }
}

// ==========================================================================
// Enhanced Project Filtering for Drawer Layout
// ==========================================================================

class DrawerProjectFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.drawer-filter-btn');
    this.projectCards = document.querySelectorAll('.drawer-project-card');
    
    if (this.filterButtons.length > 0) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        this.filterProjects(filter);
        this.setActiveFilter(button);
      });
    });
  }

  filterProjects(filter) {
    this.projectCards.forEach(card => {
      const category = card.dataset.category;
      
      if (filter === 'all' || category === filter) {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
      }
    });
  }

  setActiveFilter(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('drawer-filter-btn--active');
    });
    activeButton.classList.add('drawer-filter-btn--active');
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
      // Initialize drawer scroll components
      this.components.drawerScrollEffect = new DrawerScrollEffect();
      this.components.drawerProjectFilter = new DrawerProjectFilter();
      
      // Initialize custom project scrollbar
      this.components.customProjectScrollbar = new CustomProjectScrollbar(
        '#projectsContainer', 
        '#projectsScrollbar'
      );
      
      // Initialize drawer particle system
      const drawerCanvas = document.getElementById('drawerHeroCanvas');
      if (drawerCanvas) {
        this.components.drawerParticleSystem = new DrawerParticleSystem(drawerCanvas);
      }
      
      // Initialize custom cursor for desktop
      this.components.customCursor = new CustomCursor();

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