# Custom Cursor Implementation Guide

## Overview

This document outlines how to implement a custom blue circle cursor effect that follows the mouse with smooth animation and hover interactions. The implementation consists of HTML structure, CSS styling, and JavaScript functionality.

## Implementation Components

### 1. HTML Structure

Add the cursor HTML element before the closing `</body>` tag:

```html
<!-- Custom Cursor -->
<div class="cursor" aria-hidden="true">
    <div class="cursor__circle"></div>
</div>
```

**Key Points:**
- Uses `aria-hidden="true"` for accessibility (cursor is decorative)
- Simple nested structure with container and circle element
- Must be placed at the end of the HTML body for proper z-index layering

### 2. CSS Implementation

#### CSS Variables Setup
```css
:root {
  --z-cursor: 10000; /* High z-index for cursor */
  --primary: #8B4513; /* Brown color for cursor border */
  --transition-fast: 0.15s ease; /* Fast transition for hover effects */
}
```

#### Hide System Cursor
```css
body {
  cursor: none !important;
}

/* Hide system cursor on all interactive elements */
a, button, input, textarea, select, [role="button"], [onclick], .project-card, .skill-item {
  cursor: none !important;
}

/* Show system cursor on mobile devices */
@media (max-width: 768px) {
  body {
    cursor: auto;
  }
  
  .cursor {
    display: none;
  }
}
```

#### Cursor Styling
```css
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none; /* Allow clicks to pass through */
  z-index: var(--z-cursor);
  mix-blend-mode: difference; /* Creates color inversion effect */
  opacity: 0; /* Hidden by default, shown via JavaScript */
  transition: opacity 0.3s ease;
}

.cursor__circle {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 1px solid var(--primary);
  border-radius: 50%;
  transition: width var(--transition-fast), height var(--transition-fast);
}

/* Hover state - larger circle */
.cursor--hover .cursor__circle {
  width: 32px;
  height: 32px;
}
```

#### Additional States (Optional)
```css
/* Click state */
.cursor--click .cursor__circle {
  transform: scale(0.8);
}
```

### 3. JavaScript Implementation

#### Utility Functions
```javascript
const utils = {
  // Linear interpolation for smooth animation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
};
```

#### CustomCursor Class
```javascript
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
    // Initialize positions at screen center
    this.mousePosition = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    this.circlePosition = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    this.hasMovedMouse = false;

    // Show cursor immediately at center
    this.cursor.style.opacity = '1';

    this.bindEvents();
    this.animateCursor();
    this.setupHoverEffects();
  }

  bindEvents() {
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      
      // Show cursor on first mouse movement
      if (!this.hasMovedMouse) {
        this.hasMovedMouse = true;
        this.cursor.style.opacity = '1';
      }
    });

    // Click effects
    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('cursor--click');
    });

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('cursor--click');
    });
  }

  animateCursor() {
    // Smooth following animation using lerp
    this.circlePosition.x = utils.lerp(
      this.circlePosition.x, 
      this.mousePosition.x, 
      0.15 // Lower values = more lag, higher = more responsive
    );
    this.circlePosition.y = utils.lerp(
      this.circlePosition.y, 
      this.mousePosition.y, 
      0.15
    );

    // Apply transform with centering offset
    if (this.circle) {
      this.circle.style.transform = `translate(calc(${this.circlePosition.x}px - 50%), calc(${this.circlePosition.y}px - 50%))`;
    }

    // Continue animation loop
    requestAnimationFrame(() => this.animateCursor());
  }

  setupHoverEffects() {
    // Define elements that trigger hover effect
    const hoverElements = document.querySelectorAll(
      'a, button, .project-card, .skill-item'
    );
    
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
```

#### Initialization
```javascript
// Initialize the custom cursor
document.addEventListener('DOMContentLoaded', () => {
  const customCursor = new CustomCursor();
});
```

## Key Features Explained

### 1. Smooth Following Animation
- Uses `requestAnimationFrame` for 60fps animation
- Linear interpolation (lerp) creates natural lag effect
- Lower lerp factor (0.15) = more lag, higher = more responsive

### 2. Hover Detection
- Automatically detects interactive elements
- Scales cursor up on hover for visual feedback
- Uses CSS transitions for smooth size changes

### 3. Mix Blend Mode
- `mix-blend-mode: difference` creates color inversion effect
- Cursor changes color based on background
- Creates high contrast for better visibility

### 4. Mobile Responsiveness
- Automatically disables on mobile devices
- Shows system cursor on screens ≤ 768px
- Prevents conflicts with touch interactions

### 5. Accessibility
- Uses `aria-hidden="true"` to hide from screen readers
- Maintains keyboard navigation functionality
- Doesn't interfere with assistive technologies

## Customization Options

### Color Customization
```css
:root {
  --primary: #0066ff; /* Change to blue */
  --primary: #ff0066; /* Change to pink */
  --primary: #00ff66; /* Change to green */
}
```

### Size Customization
```css
.cursor__circle {
  width: 24px; /* Larger default size */
  height: 24px;
}

.cursor--hover .cursor__circle {
  width: 40px; /* Larger hover size */
  height: 40px;
}
```

### Animation Speed
```javascript
// In the animateCursor method
this.circlePosition.x = utils.lerp(this.circlePosition.x, this.mousePosition.x, 0.25); // Faster
this.circlePosition.x = utils.lerp(this.circlePosition.x, this.mousePosition.x, 0.08); // Slower
```

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **IE11**: Partial support (no mix-blend-mode)
- **Mobile**: Automatically disabled

## Performance Considerations

- Uses `requestAnimationFrame` for optimal performance
- `pointer-events: none` prevents cursor interference
- Efficient DOM queries with cached selectors
- Minimal CSS transitions for smooth animations

## Troubleshooting

### Cursor Not Visible
1. Check z-index value is high enough
2. Verify cursor element exists in DOM
3. Ensure JavaScript initialization runs after DOM load

### Cursor Lagging
1. Increase lerp factor for more responsiveness
2. Check for performance bottlenecks in other scripts
3. Verify requestAnimationFrame is running

### Hover Effects Not Working
1. Update `hoverElements` selector to include new elements
2. Ensure CSS `cursor: none !important` is applied
3. Check for CSS specificity conflicts

## Integration with Drawer Scroll Effect

When using with drawer scroll or similar effects, ensure:

1. Cursor CSS has higher z-index than drawer sections
2. Interactive elements within drawer sections are included in hover detection
3. Consider adding cursor overrides for drawer-specific elements if needed

```css
/* Example for drawer compatibility */
.drawer-section a, 
.drawer-section button {
  cursor: none !important;
}
```

This implementation provides a professional, smooth custom cursor that enhances user experience while maintaining accessibility and performance standards.