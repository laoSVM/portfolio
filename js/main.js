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
    const hoverElements = document.querySelectorAll('a, button, .drawer-project-card, .drawer-filter-btn, .nav-dot');
    
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
        window.scrollTo({ top: i * this.SECTION_HEIGHT, behavior: 'smooth' });
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