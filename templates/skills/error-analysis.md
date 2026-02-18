# Universal Error Analysis

## Framework-Agnostic Error Classification

### Core Error Patterns
```javascript
// Universal error detection patterns
const universal_patterns = {
    'syntax': {
        'patterns': [
            /syntax error/i,
            /parse error/i,
            /unexpected token/i,
            /invalid syntax/i
        ],
        'severity': 'critical',
        'category': 'language'
    },
    'runtime': {
        'patterns': [
            /runtime error/i,
            /undefined/i,
            /null/i,
            /cannot read property/i,
            /call to undefined function/i
        ],
        'severity': 'high',
        'category': 'execution'
    },
    'module': {
        'patterns': [
            /module not found/i,
            /cannot resolve/i,
            /import error/i,
            /require.*not found/i
        ],
        'severity': 'high',
        'category': 'dependencies'
    },
    'network': {
        'patterns': [
            /network error/i,
            /connection refused/i,
            /timeout/i,
            /404/i,
            /500/i
        ],
        'severity': 'medium',
        'category': 'connectivity'
    },
    'permission': {
        'patterns': [
            /permission denied/i,
            /access denied/i,
            /unauthorized/i,
            /forbidden/i
        ],
        'severity': 'medium',
        'category': 'security'
    }
};
```

### Language-Specific Extensions
```javascript
// Language detection and specific patterns
const language_patterns = {
    'php': {
        'indicators': ['<?php', '.php', 'composer.json', 'wordpress', 'wp_'],
        'errors': {
            'fatal': [/PHP Fatal error/i, /Call to undefined function/i],
            'warning': [/PHP Warning/i, /deprecated/i],
            'notice': [/PHP Notice/i, /undefined variable/i]
        }
    },
    'javascript': {
        'indicators': ['.js', '.mjs', 'package.json', 'node_modules', 'npm'],
        'errors': {
            'reference': [/ReferenceError/i, /is not defined/i],
            'type': [/TypeError/i, /is not a function/i],
            'syntax': [/SyntaxError/i, /Unexpected token/i]
        }
    },
    'python': {
        'indicators': ['.py', 'requirements.txt', 'pip', 'python'],
        'errors': {
            'import': [/ImportError/i, /ModuleNotFoundError/i],
            'attribute': [/AttributeError/i, /has no attribute/i],
            'type': [/TypeError/i, /unsupported operand/i]
        }
    }
};
```

## Universal Fix Strategies

### Phase 1: Error Triage
```markdown
## Error Triage Process

### 1. Severity Assessment
- **Critical**: System completely non-functional
- **High**: Major feature broken
- **Medium**: Minor functionality affected
- **Low**: Cosmetic or warning issues

### 2. Impact Analysis
- **Scope**: Single file vs. system-wide
- **Users**: All users vs. specific scenarios
- **Data**: Data corruption vs. functionality only

### 3. Urgency Determination
- **Production**: Immediate action required
- **Staging**: Can be scheduled
- **Development**: Normal priority
```

### Phase 2: Root Cause Analysis
```markdown
## Universal RCA Methodology

### 1. Error Context Gathering
- Stack trace analysis
- Recent changes review
- Environment state check
- Dependency verification

### 2. Pattern Matching
- Historical error comparison
- Known issue identification
- Common anti-pattern detection

### 3. Hypothesis Formation
- Primary cause identification
- Contributing factors analysis
- Impact scope definition
```

### Phase 3: Fix Implementation
```markdown
## Universal Fix Implementation

### 1. Minimal Change Principle
- Smallest possible fix first
- Preserve existing functionality
- Avoid architectural changes unless necessary

### 2. Safety Measures
- Backup before changes
- Test in isolation
- Rollback plan ready

### 3. Verification Protocol
- Automated tests
- Manual verification
- Performance impact check
```

## Framework Detection Logic

### Automatic Detection
```javascript
// Framework detection patterns
const framework_patterns = {
    'wordpress': {
        'files': ['wp-config.php', 'wp-content', 'functions.php'],
        'patterns': [/wordpress/i, /wp_/i, /timber/i, /acf/i],
        'specialists': ['wordpress-timber-specialist', 'acf-specialist']
    },
    'laravel': {
        'files': ['artisan', 'composer.json', 'app/Http'],
        'patterns': [/laravel/i, /illuminate/i, /eloquent/i],
        'specialists': ['laravel-specialist', 'eloquent-specialist']
    },
    'react': {
        'files': ['package.json', 'src/', 'public/'],
        'patterns': [/react/i, /jsx/i, /component/i],
        'specialists': ['react-specialist', 'jsx-specialist']
    },
    'vue': {
        'files': ['vue.config.js', 'src/', 'components/'],
        'patterns': [/vue/i, /vuetify/i, /nuxt/i],
        'specialists': ['vue-specialist', 'component-specialist']
    }
};
```

### Dynamic Specialist Assignment
```javascript
// Specialist assignment logic
function assignSpecialist(error, context) {
    // 1. Detect framework
    const framework = detectFramework(context);
    
    // 2. Analyze error type
    const errorType = classifyError(error);
    
    // 3. Map to specialist
    const specialistMap = {
        'wordpress': {
            'php': 'wordpress-timber-specialist',
            'template': 'timber-specialist',
            'database': 'wordpress-database-specialist'
        },
        'laravel': {
            'php': 'laravel-specialist',
            'database': 'eloquent-specialist',
            'routing': 'laravel-routing-specialist'
        },
        'react': {
            'javascript': 'react-specialist',
            'component': 'react-component-specialist',
            'state': 'react-state-specialist'
        }
    };
    
    return specialistMap[framework]?.[errorType] || 'general-specialist';
}
```

## Integration Points

### 1. Template System Integration
- Load universal patterns first
- Override with project-specific patterns
- Merge specialist assignments

### 2. Dynamic Configuration
- Framework detection on load
- Specialist availability check
- Error pattern customization

### 3. Extensibility Hooks
- Custom error patterns
- Additional framework support
- Specialist registration

This universal error analysis system provides the foundation for framework-agnostic error handling while supporting project-specific customization.
