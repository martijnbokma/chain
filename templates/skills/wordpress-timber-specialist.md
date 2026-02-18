# WordPress & Timber Specialist

## Purpose
Universal specialist for WordPress development with Timber/Twig templating, providing comprehensive solutions for theme development, template hierarchy, and content management integration.

## When to Use
- Building/refactoring theme templates and context flows
- Resolving ACF/context/template hierarchy issues
- Optimizing query + rendering behavior in themes
- Implementing WordPress custom post types and taxonomies
- Setting up Timber integration and Twig templating
- Debugging WordPress theme and plugin conflicts
- Optimizing WordPress performance and caching

## Constraints
- Keep business logic in PHP and presentation in Twig
- Define explicit context contracts for template boundaries
- Sanitize input and escape output by default
- Follow WordPress coding standards and best practices
- Ensure accessibility compliance in theme output
- Maintain security in all WordPress implementations
- Optimize for performance without sacrificing functionality

## Execution Steps
1. Validate template hierarchy and context contracts.
2. Validate ACF mapping to template variables.
3. Optimize heavy query/render paths.
4. Validate security/accessibility/compliance checks.

## Expected Output
- Theme-safe implementation guidance with contract and performance checks
- Proper template hierarchy and context data flow
- ACF integration with field mapping and validation
- Optimized WordPress queries and caching strategies
- Security-hardened WordPress implementations
- Accessible and compliant theme structures
- Performance optimization recommendations

## Examples

### Timber Context Builder
```php
<?php
// functions.php - Build context for single post template
function build_post_context($post_id) {
    $post = Timber::get_post($post_id);
    
    return [
        'post' => $post,
        'author' => $post->author(),
        'categories' => $post->categories(),
        'featured_image' => $post->thumbnail(),
        'related_posts' => get_related_posts($post_id),
        'reading_time' => calculate_reading_time($post->content()),
        'seo_meta' => [
            'title' => $post->title(),
            'description' => get_post_excerpt($post_id, 160),
            'canonical_url' => $post->link()
        ]
    ];
}

// Single post template
$context = Timber::context();
$context = array_merge($context, build_post_context(get_the_ID()));
Timber::render('single.twig', $context);
```

### ACF Integration Pattern
```php
<?php
// ACF field mapping with validation
function get_acf_field_safe($field_name, $post_id = null, $default = null) {
    $value = get_field($field_name, $post_id);
    
    // Validate and sanitize based on field type
    if ($value === null || $value === '') {
        return $default;
    }
    
    switch (get_field_type($field_name)) {
        case 'text':
        case 'textarea':
            return sanitize_text_field($value);
        case 'url':
            return esc_url($value);
        case 'email':
            return sanitize_email($value);
        case 'image':
            return is_array($value) ? $value : ['url' => $default];
        default:
            return $value;
    }
}

// Usage in context building
function build_service_context($post_id) {
    return [
        'service_icon' => get_acf_field_safe('service_icon', $post_id, 'default-icon'),
        'service_description' => get_acf_field_safe('service_description', $post_id),
        'service_features' => get_acf_field_safe('service_features', $post_id, []),
        'service_cta_link' => get_acf_field_safe('service_cta_link', $post_id, '#'),
        'service_cta_text' => get_acf_field_safe('service_cta_text', $post_id, 'Learn More')
    ];
}
```

### Template Hierarchy Optimization
```php
<?php
// Custom template routing for better performance
function timber_template_filter($templates) {
    if (is_front_page()) {
        return ['front-page.twig'];
    }
    
    if (is_page() && $page_id = get_queried_object_id()) {
        $page_template = get_page_template_slug($page_id);
        if ($page_template) {
            return ["{$page_template}.twig", 'page.twig'];
        }
    }
    
    return $templates;
}
add_filter('timber/template', 'timber_template_filter');
```

### Twig Template Pattern
```twig
{# single.twig - Optimized template with explicit context #}
{% extends "base.twig" %}

{% block content %}
    <article class="post post--{{ post.post_type }}">
        <header class="post__header">
            <h1 class="post__title">{{ post.title }}</h1>
            <div class="post__meta">
                <time datetime="{{ post.post_date|date('c') }}" class="post__date">
                    {{ post.post_date|date('F j, Y') }}
                </time>
                <span class="post__author">by {{ author.name }}</span>
                <span class="post__reading-time">{{ reading_time }} min read</span>
            </div>
        </header>
        
        {% if featured_image %}
            <figure class="post__featured-image">
                <img src="{{ featured_image.src|resize(1200, 630) }}" 
                     alt="{{ featured_image.alt }}"
                     loading="lazy">
            </figure>
        {% endif %}
        
        <div class="post__content">
            {{ post.content|wpautop }}
        </div>
        
        {% if categories %}
            <footer class="post__categories">
                <h3>Categories</h3>
                <ul>
                    {% for category in categories %}
                        <li>
                            <a href="{{ category.link }}">{{ category.name }}</a>
                        </li>
                    {% endfor %}
                </ul>
            </footer>
        {% endif %}
        
        {% if related_posts %}
            <section class="post__related">
                <h3>Related Posts</h3>
                <div class="related-posts">
                    {% for related in related_posts %}
                        {% include "partials/card-post.twig" with {post: related} only %}
                    {% endfor %}
                </div>
            </section>
        {% endif %}
    </article>
{% endblock %}
```
