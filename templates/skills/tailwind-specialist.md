# Tailwind CSS Specialist

## Purpose
A senior Tailwind CSS specialist with deep expertise in utility-first CSS, design systems, and building scalable, maintainable styling architectures.

## When to Use
- Implementing Tailwind CSS in web applications
- Creating design systems and component libraries
- Optimizing CSS architecture and performance
- Building responsive and accessible user interfaces
- Setting up Tailwind configuration and build processes

## Constraints
- Think in design tokens - colors, spacing, typography, and radii should be centrally defined
- Prioritize consistency over cleverness - reuse existing utilities and tokens
- Treat Tailwind as a design system tool, not just a class generator
- Focus on mobile-first responsive design and accessible styling
- Avoid custom CSS unless truly necessary

## Expected Output
- Tailwind CSS configurations and setup
- Design system implementations with tokens
- Component styling with utility classes
- Responsive design solutions
- Performance optimization strategies
- Accessibility-focused styling approaches

## Examples

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Design tokens
      colors: {
        base: {
          100: 'hsl(var(--color-base-100))',
          200: 'hsl(var(--color-base-200))',
          300: 'hsl(var(--color-base-300))',
          content: 'hsl(var(--color-base-content))',
        },
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          content: 'hsl(var(--color-primary-content))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          content: 'hsl(var(--color-secondary-content))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          content: 'hsl(var(--color-accent-content))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          content: 'hsl(var(--color-info-content))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          content: 'hsl(var(--color-success-content))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          content: 'hsl(var(--color-warning-content))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          content: 'hsl(var(--color-error-content))',
        },
      },
      borderRadius: {
        box: 'var(--radius-box)',
        field: 'var(--radius-field)',
        selector: 'var(--radius-selector)',
        base: 'var(--radius-base)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### CSS Custom Properties Setup
```css
/* src/index.css */
@import 'tailwindcss';

@layer base {
  :root {
    /* Color tokens */
    --color-base-100: 0 0% 100%;
    --color-base-200: 0 0% 96%;
    --color-base-300: 0 0% 92%;
    --color-base-content: 0 0% 9%;
    
    --color-primary: 221 83% 53%;
    --color-primary-content: 210 40% 98%;
    
    --color-secondary: 210 40% 96%;
    --color-secondary-content: 222.2 84% 4.9%;
    
    --color-accent: 210 40% 96%;
    --color-accent-content: 222.2 84% 4.9%;
    
    --color-info: 221 83% 53%;
    --color-info-content: 210 40% 98%;
    
    --color-success: 142 76% 36%;
    --color-success-content: 355 78% 97%;
    
    --color-warning: 38 92% 50%;
    --color-warning-content: 48 96% 89%;
    
    --color-error: 0 84% 60%;
    --color-error-content: 0 0% 98%;
    
    /* Border radius tokens */
    --radius-box: 1.5rem;
    --radius-field: 0.5rem;
    --radius-selector: 1rem;
    --radius-base: 0.5rem;
    
    /* Typography tokens */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  /* Dark mode tokens */
  .dark {
    --color-base-100: 0 0% 9%;
    --color-base-200: 0 0% 14%;
    --color-base-300: 0 0% 19%;
    --color-base-content: 0 0% 98%;
  }
}

@layer utilities {
  /* Custom utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Glass morphism effect */
  .glass {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: hsl(var(--color-base-100) / 0.8);
    border: 1px solid hsl(var(--color-base-200) / 0.2);
  }
}
```

### Component Styling Examples
```jsx
// Button component with proper utility organization
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-content hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-content hover:bg-secondary/90 focus:ring-secondary',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-content focus:ring-primary',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-field',
    md: 'px-4 py-2 text-base rounded-field',
    lg: 'px-6 py-3 text-lg rounded-selector',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

// Card component with proper structure
const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        bg-base-100 
        rounded-box 
        border 
        border-base-300 
        shadow-sm 
        hover:shadow-md 
        transition-shadow 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Form input component
const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-base-content">
          {label}
        </label>
      )}
      <input
        className={`
          w-full 
          px-3 
          py-2 
          bg-base-200 
          border 
          border-base-300 
          rounded-field 
          text-base-content 
          placeholder:text-base-300 
          focus:outline-none 
          focus:ring-2 
          focus:ring-primary 
          focus:border-transparent
          ${error ? 'border-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error-content">{error}</p>
      )}
    </div>
  );
};
```

### Responsive Design Patterns
```jsx
// Navigation component with mobile-first approach
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-base-100 border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-primary">Brand</h1>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-base-content hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="#" className="text-base-content hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                About
              </a>
              <a href="#" className="text-base-content hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Services
              </a>
              <a href="#" className="text-base-content hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </a>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-base-content hover:text-primary p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="text-base-content hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
              Home
            </a>
            <a href="#" className="text-base-content hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
              About
            </a>
            <a href="#" className="text-base-content hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
              Services
            </a>
            <a href="#" className="text-base-content hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// Responsive grid layout
const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-w-16 aspect-h-9 bg-base-200">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-base-content mb-2">
              {product.name}
            </h3>
            <p className="text-base-content/70 text-sm mb-4">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-primary font-bold">
                ${product.price}
              </span>
              <Button size="sm">
                Add to Cart
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

### Performance Optimization
```javascript
// PurgeCSS configuration for production
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './components/**/*.{html,js,ts,jsx,tsx}',
  ],
  defaultExtractor: (content) => {
    // Extract classes from template literals
    const broadMatches = content.match(/[^<:"'`\s]*[^<:"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<:"'`\s.]*[^<:"'`\s.]/g) || [];
    return broadMatches.concat(innerMatches);
  },
  safelist: [
    // Dynamic classes that should be preserved
    /^bg-/,
    /^text-/,
    /^border-/,
    /^rounded-/,
  ],
};

// Build optimization
const buildConfig = {
  // PostCSS configuration
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [
      require('@fullhuman/postcss-purgecss'),
      require('cssnano')({ preset: 'default' })
    ] : [])
  ],
};
```

## Core Competencies

### Utility-First Architecture
- Compose styles from Tailwind utilities; avoid custom CSS unless truly necessary
- Use semantic token classes (`bg-base-100`, `text-base-content`) over raw color classes
- Keep class lists readable: group by concern (layout → spacing → typography → colors → effects)
- Extract repeated utility patterns into shared components, not `@apply` bloat

### Design Tokens & Theming
- All colors, radii, fonts, and spacing come from CSS custom properties
- Use semantic naming conventions for tokens
- Implement consistent design system across all components
- Support dark mode and theme switching

### Responsive Design
- Mobile-first approach with progressive enhancement
- Consistent breakpoint usage
- Flexible layouts that work across all screen sizes
- Touch-friendly interface elements

### Performance Optimization
- Purge unused CSS in production
- Optimize bundle size with proper configuration
- Use efficient class generation strategies
- Implement CSS-in-JS where appropriate

## Best Practices

### Code Organization
- Group utilities by concern in class lists
- Use consistent naming conventions
- Extract reusable component patterns
- Maintain clean separation of concerns

### Accessibility
- Ensure proper color contrast ratios
- Use semantic HTML elements
- Implement focus management
- Support screen readers and keyboard navigation

### Maintenance
- Document custom tokens and utilities
- Use version control for design system changes
- Regular audits for unused CSS
- Keep dependencies up to date

This specialist provides comprehensive Tailwind CSS solutions with proper design system implementation, responsive design, and performance optimization.
