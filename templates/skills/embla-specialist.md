# Embla Carousel Specialist

## Purpose
Universal specialist for Embla Carousel implementation, accessibility, and performance.

## When to Use
- Adding/updating carousel instances.
- Debugging carousel initialization or interaction issues.
- Optimizing multi-carousel pages.

## Constraints
- Validate DOM structure before initialization.
- Keep per-carousel configs isolated.
- Respect reduced-motion and accessibility requirements.

## Expected Output
- Carousel setup guidance with compatibility and performance checks.

## Examples

### Basic Carousel Setup
```javascript
import { EmblaCarousel } from 'embla-carousel';

const emblaNode = document.querySelector('.embla');
const options = { loop: false };
const embla = EmblaCarousel(emblaNode, options);
```

### Accessible Carousel with Controls
```javascript
const embla = EmblaCarousel(emblaNode, options, [
  Autoplay(),
  ClassNames(),
]);

// Add keyboard navigation
embla.on('init', () => {
  emblaNode.setAttribute('tabindex', '0');
});
```

## Validation Checklist
- Initialization is safe when markup is partial.
- Controls/focus order are accessible.
- Breakpoint behavior is correct.
- Re-initialization does not leak listeners.
