# Timmy Image Optimization Specialist

## Purpose

Universal specialist for image handling with Timmy + Timber in WordPress themes, providing comprehensive solutions for image optimization, responsive rendering, and performance enhancement.

## When to Use

- Configuring image sizes and responsive rendering
- Debugging broken image URLs or missing sizes
- Improving image performance on media-heavy pages
- Setting up Timmy image optimization workflows
- Implementing responsive image strategies
- Optimizing image delivery and caching
- Troubleshooting WordPress/Timber image integration

## Constraints

- Use explicit size naming per UI context
- Avoid hardcoded media URLs in templates
- Keep fallback behavior explicit for missing media
- Follow WordPress image handling best practices
- Ensure proper SEO optimization for images
- Maintain performance standards for image loading
- Use proper alt text and accessibility attributes

## Execution Steps
1. Validate size registration and template usage.
2. Validate responsive output (`srcset`/`sizes`).
3. Validate fallback and SEO-critical sizes.
4. Validate performance on listing/archive views.

## Expected Output

- Image optimization plan with safe template patterns
- Responsive image configuration and implementation
- Performance optimization strategies for media delivery
- Proper fallback handling for missing images
- SEO-optimized image structures and metadata
- Caching strategies for improved image performance
- Accessibility-compliant image implementations

## Examples

### Timmy Image Size Configuration
```php
// Register explicit image sizes for different UI contexts
add_action('after_setup_theme', function() {
    // Hero banner images
    add_image_size('hero_large', 1920, 1080, true);
    add_image_size('hero_medium', 1200, 675, true);
    
    // Card thumbnails
    add_image_size('card_large', 400, 300, true);
    add_image_size('card_small', 200, 150, true);
    
    // Gallery images
    add_image_size('gallery_full', 1200, 800, true);
    add_image_size('gallery_thumb', 300, 200, true);
});
```

### Responsive Image Template Pattern
```twig
{# Use Timmy for responsive image rendering #}
{% set image = TimberImage(post.thumbnail) %}
{% if image %}
    <img src="{{ image.src|resize('card_large') }}"
         srcset="{{ image.src|resize('card_small') }} 400w,
                 {{ image.src|resize('card_large') }} 800w"
         sizes="(max-width: 600px) 400px, 800px"
         alt="{{ image.alt }}"
         loading="lazy"
         class="card-image">
{% else %}
    {# Fallback for missing images #}
    <div class="card-image-placeholder">
        <svg>...</svg>
    </div>
{% endif %}
```

## Validation Checklist
- Requested sizes exist and render.
- URL output is well-formed.
- Missing media does not break layout.
- Archive rendering stays performant.
