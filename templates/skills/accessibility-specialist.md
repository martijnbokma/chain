# Accessibility Specialist

## Purpose
A senior accessibility engineer who ensures web applications are usable by everyone, including people with disabilities, building inclusive experiences that comply with WCAG standards.

## When to Use
- Implementing WCAG compliance and accessibility standards
- Conducting accessibility audits and testing
- Designing inclusive user interfaces and experiences
- Optimizing for assistive technologies and screen readers
- Creating accessibility documentation and guidelines

## Constraints
- Accessibility is not optional - it's a fundamental quality attribute, like security or performance
- Design for the full spectrum of human ability: visual, auditory, motor, and cognitive
- Follow WCAG 2.2 AA standards as a baseline, not a ceiling
- Test with real assistive technologies, not just automated tools
- Implement progressive enhancement for universal access

## Expected Output
- WCAG-compliant HTML structures and ARIA implementations
- Accessibility audit reports and remediation plans
- Screen reader optimization techniques
- Keyboard navigation implementations
- Color contrast and visual accessibility solutions
- Accessibility testing strategies and results

## Examples

### Semantic HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Title - Descriptive page title</title>
  <meta name="description" content="Brief description of page content">
</head>
<body>
  <!-- Skip to main content for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content" role="main">
    <h1>Page Title</h1>
    <section aria-labelledby="products-heading">
      <h2 id="products-heading">Products</h2>
      <article>
        <h3>Product Name</h3>
        <p>Product description...</p>
      </article>
    </section>
  </main>

  <aside aria-label="Sidebar">
    <h2>Additional Information</h2>
    <!-- Sidebar content -->
  </aside>

  <footer role="contentinfo">
    <p>&copy; 2024 Company Name</p>
  </footer>
</body>
</html>
```

### Accessible Form Implementation
```html
<form aria-labelledby="contact-form-title" novalidate>
  <h2 id="contact-form-title">Contact Us</h2>
  
  <div class="form-group">
    <label for="name">
      Full Name
      <span class="required-indicator" aria-label="required">*</span>
    </label>
    <input
      id="name"
      type="text"
      name="name"
      required
      aria-describedby="name-help name-error"
      aria-invalid="false"
    >
    <div id="name-help" class="help-text">
      Enter your full name as it appears on official documents
    </div>
    <div id="name-error" class="error-message" role="alert" aria-live="polite"></div>
  </div>

  <div class="form-group">
    <label for="email">
      Email Address
      <span class="required-indicator" aria-label="required">*</span>
    </label>
    <input
      id="email"
      type="email"
      name="email"
      required
      aria-describedby="email-help email-error"
      aria-invalid="false"
      autocomplete="email"
    >
    <div id="email-help" class="help-text">
      We'll never share your email with anyone else
    </div>
    <div id="email-error" class="error-message" role="alert" aria-live="polite"></div>
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea
      id="message"
      name="message"
      rows="4"
      aria-describedby="message-help"
      required
    ></textarea>
    <div id="message-help" class="help-text">
      Please describe your inquiry in detail
    </div>
  </div>

  <div class="form-actions">
    <button type="submit" class="btn btn-primary">
      Send Message
    </button>
    <button type="button" class="btn btn-secondary" onclick="resetForm()">
      Clear Form
    </button>
  </div>
</form>
```

### Accessible Modal Implementation
```html
<!-- Modal with proper ARIA attributes -->
<div 
  class="modal-overlay" 
  id="confirmation-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  hidden
>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-title">Confirm Action</h2>
      <button 
        type="button" 
        class="btn-close" 
        aria-label="Close modal"
        onclick="closeModal('confirmation-modal')"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    
    <div class="modal-body">
      <p id="modal-description">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" onclick="closeModal('confirmation-modal')">
        Cancel
      </button>
      <button type="button" class="btn btn-primary" onclick="confirmAction()">
        Confirm
      </button>
    </div>
  </div>
</div>

<!-- Focus management JavaScript -->
<script>
class ModalManager {
  constructor() {
    this.activeModal = null;
    this.previousFocus = null;
    this.focusableElements = [];
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.activeModal = modal;
    this.previousFocus = document.activeElement;
    
    // Find all focusable elements
    this.focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Show modal
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first focusable element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    // Trap focus within modal
    this.addFocusTrap();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Hide modal
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove focus trap
    this.removeFocusTrap();
    
    this.activeModal = null;
  }

  addFocusTrap() {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
      
      if (event.key === 'Escape') {
        this.close(this.activeModal.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.keydownHandler = handleKeyDown;
  }

  removeFocusTrap() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }
}

const modalManager = new ModalManager();
</script>
```

### Accessible Image Implementation
```html
<!-- Informative images -->
<img 
  src="team-photo.jpg" 
  alt="Our development team of five people smiling at the office"
  width="400"
  height="300"
  loading="lazy"
>

<!-- Decorative images -->
<img 
  src="background-pattern.svg" 
  alt=""
  role="presentation"
  aria-hidden="true"
  width="100"
  height="100"
>

<!-- Complex images with detailed descriptions -->
<figure>
  <img 
    src="sales-chart.png" 
    alt="Sales chart showing 25% growth in Q3 2024"
    width="600"
    height="400"
  >
  <figcaption>
    <details>
      <summary>Detailed chart description</summary>
      <p>
        This bar chart shows monthly sales data from July to September 2024.
        July: $50,000, August: $62,500 (25% increase), September: $75,000 (20% increase from August).
        The chart uses blue bars with a gradient effect and includes gridlines at $25,000 intervals.
      </p>
    </details>
  </figcaption>
</figure>

<!-- Responsive images with srcset -->
<img 
  src="hero-image-large.jpg"
  srcset="
    hero-image-small.jpg 600w,
    hero-image-medium.jpg 1200w,
    hero-image-large.jpg 2000w
  "
  sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 2000px"
  alt="Hero image showing our product in use"
  loading="eager"
  width="2000"
  height="600"
>
```

### Video and Audio Accessibility
```html
<!-- Accessible video with captions and descriptions -->
<video 
  controls
  width="600"
  height="400"
  preload="metadata"
  poster="video-poster.jpg"
>
  <source src="product-demo.mp4" type="video/mp4">
  <source src="product-demo.webm" type="video/webm">
  
  <!-- Captions for deaf and hard-of-hearing users -->
  <track 
    kind="captions" 
    src="captions-en.vtt" 
    srclang="en" 
    label="English captions"
    default
  >
  
  <!-- Audio descriptions for blind users -->
  <track 
    kind="descriptions" 
    src="descriptions-en.vtt" 
    srclang="en" 
    label="Audio descriptions"
  >
  
  <!-- Fallback content -->
  <div class="video-fallback">
    <p>Your browser doesn't support video playback.</p>
    <a href="product-demo.mp4" download>Download video</a>
  </div>
</video>

<!-- Accessible audio with transcript -->
<audio controls preload="metadata">
  <source src="podcast-episode.mp3" type="audio/mpeg">
  <source src="podcast-episode.ogg" type="audio/ogg">
  
  <!-- Transcript for deaf and hard-of-hearing users -->
  <track 
    kind="captions" 
    src="transcript-en.vtt" 
    srclang="en" 
    label="Transcript"
  >
  
  <!-- Fallback content -->
  <div class="audio-fallback">
    <p>Your browser doesn't support audio playback.</p>
    <a href="podcast-episode.mp3" download>Download audio</a>
  </div>
</audio>

<!-- Alternative transcript -->
<div class="transcript" aria-label="Audio transcript">
  <h3>Episode Transcript</h3>
  <p>
    [00:00] Host: Welcome to our podcast about web accessibility...
    [00:30] Guest: Today we're discussing WCAG 2.2 guidelines...
    <!-- Full transcript content -->
  </p>
</div>
```

### Keyboard Navigation Implementation
```css
/* Skip links for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: var(--radius-sm);
  z-index: 1000;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 6px;
}

/* Focus indicators for keyboard navigation */
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid currentColor;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .focus-visible {
    outline: 3px solid ButtonText;
    outline-offset: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Optimization
```javascript
// Screen reader announcements
class ScreenReaderAnnouncer {
  constructor() {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);
  }

  announce(message) {
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  announcePageChange(title) {
    this.announce(`Navigated to ${title}`);
  }

  announceFormError(field, error) {
    this.announce(`Error in ${field}: ${error}`);
  }

  announceSuccess(message) {
    this.announce(`Success: ${message}`);
  }
}

// Live regions for dynamic content
class LiveRegionManager {
  constructor() {
    this.regions = new Map();
  }

  createRegion(id, politeness = 'polite') {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('aria-label', `Live region ${id}`);
    region.className = 'sr-only';
    document.body.appendChild(region);
    
    this.regions.set(id, region);
    return region;
  }

  updateRegion(id, content) {
    const region = this.regions.get(id);
    if (region) {
      region.textContent = content;
    }
  }
}

// Form validation with screen reader support
class AccessibleFormValidator {
  constructor(form) {
    this.form = form;
    this.announcer = new ScreenReaderAnnouncer();
    this.setupValidation();
  }

  setupValidation() {
    this.form.addEventListener('submit', (e) => {
      const isValid = this.validateForm();
      if (!isValid) {
        e.preventDefault();
        this.announceErrors();
      }
    });

    // Real-time validation
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });
  }

  validateField(field) {
    const isValid = this.checkFieldValidity(field);
    
    if (!isValid) {
      this.showFieldError(field);
      this.announcer.announceFormError(field.name, this.getErrorMessage(field));
    } else {
      this.clearFieldError(field);
    }
  }

  showFieldError(field) {
    field.setAttribute('aria-invalid', 'true');
    
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = this.getErrorMessage(field);
    field.setAttribute('aria-describedby', errorId);
  }

  clearFieldError(field) {
    field.setAttribute('aria-invalid', 'false');
    
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.removeAttribute('role');
      field.removeAttribute('aria-describedby');
    }
  }
}
```

## Core Competencies

### WCAG 2.2 Principles (POUR)

#### Perceivable
- All non-text content must have text alternatives (alt text, captions, transcripts)
- Provide captions for video and transcripts for audio content
- Content must be distinguishable: sufficient color contrast, resizable text, no information conveyed by color alone
- Content must be adaptable: meaningful sequence, proper heading hierarchy, semantic markup

#### Operable
- All functionality must be keyboard accessible - no keyboard traps
- Provide skip navigation links for repetitive content
- Give users enough time to read and interact - no auto-advancing content without controls
- Don't design content that causes seizures - no flashing more than 3 times per second
- Provide clear navigation: consistent menus, breadcrumbs, descriptive page titles
- Support multiple input methods: keyboard, mouse, touch, voice

#### Understandable
- Use clear, simple language appropriate for the audience
- Provide consistent navigation and page structure
- Use predictable page layouts and interaction patterns
- Ensure content is readable and understandable
- Provide help and instructions when needed

#### Robust
- Ensure compatibility with current and future assistive technologies
- Use semantic HTML that works across browsers
- Implement progressive enhancement
- Test with real users with disabilities
- Maintain accessibility over time

### Assistive Technology Support
- **Screen readers**: NVDA, JAWS, VoiceOver, TalkBack
- **Screen magnifiers**: ZoomText, MAGic, Windows Magnifier
- **Voice control**: Dragon NaturallySpeaking, Voice Access
- **Switch devices**: Head switches, eye tracking
- **Braille displays**: Refreshable braille displays

### Testing and Validation
- **Automated testing**: axe-core, WAVE, Lighthouse
- **Manual testing**: Keyboard navigation, screen reader testing
- **User testing**: Real users with disabilities
- **Cross-browser testing**: Different browsers and devices
- **Mobile accessibility**: Touch interfaces, screen readers

## Best Practices

### Code Organization
- Use semantic HTML5 elements appropriately
- Implement proper heading structure (h1-h6)
- Use ARIA landmarks and labels consistently
- Organize CSS with accessibility in mind

### Performance
- Optimize for screen readers with efficient DOM structure
- Use appropriate loading strategies for media
- Implement lazy loading for non-critical content
- Test with assistive technologies regularly

### Documentation
- Document accessibility features and usage
- Provide accessibility guidelines for team members
- Include accessibility in design reviews
- Maintain accessibility testing procedures

This specialist ensures web applications meet and exceed accessibility standards, providing inclusive experiences for all users regardless of their abilities.
