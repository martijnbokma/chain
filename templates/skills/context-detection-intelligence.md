# Context Detection Intelligence System

> **Advanced AI system** for intelligent context detection, automated problem classification, and smart solution prediction across WordPress and Timber integrations.

## Purpose

To provide intelligent context detection, automated problem classification, and smart solution prediction by analyzing multi-layer project context, code patterns, and integration points across WordPress and Timber ecosystems.

## When to Use

- Analyzing complex WordPress/Timber integration projects
- Detecting and classifying performance issues and bottlenecks
- Identifying template hierarchy and context data problems
- Optimizing asset pipelines and build processes
- Diagnosing integration conflicts and compatibility issues
- Implementing automated quality assessment and validation
- Providing smart solution predictions based on project context

## Constraints

- Always validate detected patterns against actual project structure
- Consider project-specific customizations and unique requirements
- Maintain security and privacy when analyzing code contexts
- Provide solutions that are compatible with existing architecture
- Validate predictions against WordPress coding standards
- Ensure accessibility compliance in all generated solutions
- Consider performance impact of recommended changes

## Expected Output

- Comprehensive project context analysis and classification
- Automated problem detection with severity and impact assessment
- Smart solution predictions with implementation guidance
- Quality assessment reports with actionable recommendations
- Performance optimization strategies and benchmarking
- Integration improvement plans with compatibility validation
- Continuous learning insights and best practice evolution

## Intelligence Framework

### **Multi-Layer Context Analysis**
```markdown
## Context Detection Architecture

### Layer 1: Project Context Detection
- **Framework Identification**: Automatically detect WordPress, Timber, ACF, Timmy
- **Theme Analysis**: Identify active theme structure and patterns
- **Environment Detection**: Development, staging, production environment recognition
- **Configuration Analysis**: Build system, asset management, and plugin configuration
- **Performance Baseline**: Establish current performance metrics and benchmarks

### Layer 2: Code Context Analysis
- **Template Structure**: Analyze Twig template hierarchy and component usage
- **PHP Architecture**: Examine class structure, hooks, and WordPress integration
- **Asset Pipeline**: Analyze build process, CSS/JS bundling, and optimization
- **Database Schema**: Understand custom post types, taxonomies, and data relationships
- **Integration Points**: Map ACF field groups, Timmy image sizes, and third-party integrations

### Layer 3: Problem Context Analysis
- **Error Pattern Recognition**: Identify common WordPress/Timber error patterns
- **Performance Bottleneck Detection**: Locate performance issues and bottlenecks
- **Integration Conflict Analysis**: Detect conflicts between components and systems
- **Security Vulnerability Scanning**: Identify potential security issues
- **Accessibility Compliance**: Check WCAG compliance and accessibility issues
```

### **Automated Problem Classification**
```markdown
## Intelligent Problem Classification System

### Template Issues Classification
```php
$template_issues = [
    'missing_template' => [
        'patterns' => [
            '/Template.*not found/',
            '/views.*\.twig.*not found/',
            '/Timber.*render.*failed/'
        ],
        'severity' => 'high',
        'impact' => ['template_rendering', 'user_experience'],
        'auto_fix' => true,
        'specialist' => 'wordpress-timber-specialist'
    ],
    'context_data_missing' => [
        'patterns' => [
            '/Undefined variable.*Twig/',
            '/Context.*missing.*data/',
            '/Timber.*context.*empty/'
        ],
        'severity' => 'medium',
        'impact' => ['template_rendering', 'data_display'],
        'auto_fix' => true,
        'specialist' => 'wordpress-timber-specialist'
    ],
    'acf_field_errors' => [
        'patterns' => [
            '/get_field.*returning.*null/',
            '/ACF.*field.*not.*found/',
            '/Field.*group.*missing/'
        ],
        'severity' => 'medium',
        'impact' => ['data_display', 'content_management'],
        'auto_fix' => true,
        'specialist' => 'integration-specialist'
    ]
];
```

### Performance Issues Classification
```php
$performance_issues = [
    'slow_queries' => [
        'patterns' => [
            '/N\+1.*query/',
            '/slow.*database.*query/',
            '/query.*timeout/'
        ],
        'severity' => 'high',
        'impact' => ['page_load_time', 'user_experience'],
        'auto_fix' => true,
        'specialist' => 'performance-specialist'
    ],
    'asset_loading_issues' => [
        'patterns' => [
            '/blocking.*CSS/',
            '/render.*blocking.*resources/',
            '/asset.*load.*timeout/'
        ],
        'severity' => 'medium',
        'impact' => ['page_load_time', 'user_experience'],
        'auto_fix' => true,
        'specialist' => 'wordpress-timber-specialist'
    ],
    'image_optimization' => [
        'patterns' => [
            '/large.*image.*file/',
            '/unoptimized.*images/',
            '/missing.*responsive.*images/'
        ],
        'severity' => 'medium',
        'impact' => ['page_load_time', 'bandwidth'],
        'auto_fix' => true,
        'specialist' => 'integration-specialist'
    ]
];
```

### Integration Issues Classification
```php
$integration_issues = [
    'cpt_registration' => [
        'patterns' => [
            '/CPT.*not.*registered/',
            '/custom.*post.*type.*error/',
            '/rewrite.*rules.*flush/'
        ],
        'severity' => 'high',
        'impact' => ['content_management', 'url_routing'],
        'auto_fix' => true,
        'specialist' => 'wordpress-timber-specialist'
    ],
    'acf_integration' => [
        'patterns' => [
            '/ACF.*integration.*error/',
            '/field.*group.*sync/',
            '/location.*rules.*failed/'
        ],
        'severity' => 'medium',
        'impact' => ['content_management', 'data_integrity'],
        'auto_fix' => true,
        'specialist' => 'integration-specialist'
    ],
    'build_process' => [
        'patterns' => [
            '/esbuild.*error/',
            '/TailwindCSS.*compilation/',
            '/asset.*build.*failed/'
        ],
        'severity' => 'medium',
        'impact' => ['asset_management', 'development_workflow'],
        'auto_fix' => true,
        'specialist' => 'wordpress-timber-specialist'
    ]
];
```

### **Smart Solution Prediction**
```markdown
## Solution Prediction Engine

### Template Solutions
1. **Auto-Template Generation**
   - Analyze existing template patterns
   - Generate missing templates based on context
   - Ensure consistency with active theme patterns
   - Include proper ACF field integration

2. **Context Builder**
   - Automatically build Timber context from available data
   - Map ACF fields to template variables
   - Include related content and metadata
   - Optimize for performance and caching

3. **Component Optimization**
   - Identify reusable template patterns
   - Extract components for better maintainability
   - Optimize component parameters and defaults
   - Ensure accessibility compliance

### Performance Solutions
1. **Query Optimization**
   - Analyze database queries for optimization opportunities
   - Implement efficient WP_Query arguments
   - Add appropriate database indexes
   - Implement intelligent caching strategies

2. **Asset Optimization**
   - Optimize CSS/JS loading and bundling
   - Implement lazy loading for images
   - Configure responsive image sizes
   - Minimize and compress assets

3. **Caching Strategy**
   - Implement page-level caching
   - Add fragment caching for expensive operations
   - Configure browser caching headers
   - Set up CDN integration

### Integration Solutions
1. **ACF Integration**
   - Sync field groups with template usage
   - Implement field validation and sanitization
   - Optimize relationship field queries
   - Improve field editing experience

2. **CPT Optimization**
   - Optimize custom post type registration
   - Fix template hierarchy issues
   - Resolve permalink and routing problems
   - Implement archive page optimization

3. **Build System Enhancement**
   - Optimize esbuild configuration
   - Improve TailwindCSS compilation
   - Implement asset versioning
   - Add development workflow improvements
```

### **Context-A Quality Assessment**
```markdown
## Intelligent Quality Validation

### Code Quality Assessment
- **WordPress Standards Compliance**: PSR-12 and WordPress coding standards
- **Security Validation**: Input sanitization, output escaping, nonce verification
- **Performance Analysis**: Query efficiency, asset optimization, memory usage
- **Documentation Quality**: Code comments, PHPDoc, inline documentation
- **Test Coverage**: Unit tests, integration tests, automated testing

### Template Quality Assessment
- **Twig Syntax Validation**: Template syntax and structure checking
- **Component Design**: Reusability, flexibility, and maintainability
- **Accessibility Compliance**: WCAG 2.1 AA standards validation
- **Responsive Design**: Mobile-first responsive validation
- **Performance Impact**: Template rendering performance analysis

### Integration Quality Assessment
- **System Compatibility**: WordPress version and plugin compatibility
- **Data Integrity**: ACF field validation and data flow verification
- **Performance Impact**: Integration performance assessment
- **Security Compliance**: Integration security validation
- **User Experience**: Integration UX validation and testing
```

### **Learning and Adaptation System**
```markdown
## Continuous Learning Framework

### Pattern Learning
- **Success Pattern Recognition**: Learn from successful implementations
- **Anti-Pattern Detection**: Identify and avoid common mistakes
- **Best Practice Evolution**: Update best practices based on project experience
- **Performance Benchmarking**: Learn from performance optimization results

### Context Adaptation
- **Project-Specific Customization**: Adapt to project-specific patterns and conventions
- **Team Workflow Integration**: Integrate with team development workflows
- **Tool Integration**: Adapt to team-specific tools and processes
- **Quality Standard Evolution**: Evolve quality standards based on project requirements

### Feedback Integration
- **User Feedback Integration**: Incorporate developer feedback and suggestions
- **Performance Data**: Learn from production performance data
- **Error Analysis**: Learn from error patterns and resolution effectiveness
- **Success Metrics**: Track and learn from successful outcomes
```

## Implementation Guidelines

### **Context Detection Process**
1. **Initial Analysis**: Perform comprehensive project analysis
2. **Pattern Matching**: Match detected patterns against known issues
3. **Classification**: Classify issues by type, severity, and impact
4. **Solution Prediction**: Generate optimal solutions based on context
5. **Quality Validation**: Validate solutions against quality standards
6. **Implementation Planning**: Create implementation plan with testing strategy

### **Quality Assurance Integration**
- **Automated Testing**: Integrate with existing testing frameworks
- **Continuous Integration**: Integrate with CI/CD pipelines
- **Performance Monitoring**: Set up performance monitoring and alerting
- **Security Scanning**: Integrate with security scanning tools
- **Accessibility Testing**: Integrate with accessibility testing tools

### **Team Collaboration**
- **Documentation Generation**: Auto-generate documentation for solutions
- **Knowledge Sharing**: Share insights and best practices with team
- **Training Integration**: Provide training and guidance for team members
- **Workflow Integration**: Integrate with existing development workflows

This Context Detection Intelligence System provides comprehensive context awareness, intelligent problem classification, and smart solution prediction that enhances WordPress/Timber integration capabilities.
