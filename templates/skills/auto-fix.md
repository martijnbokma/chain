# Auto Fix Command

Automatically diagnose, fix, and resolve problems by analyzing error messages and assigning the appropriate specialist.

## Purpose

To provide automated error diagnosis, specialist assignment, and fix implementation for common software issues and bugs.

## When to Use

- User reports any error or bug
- System encounters unexpected behavior
- Tests fail or build breaks
- Performance issues detected
- Security vulnerabilities found
- User asks: "fix this", "solve this problem", "resolve error", "auto-fix"

## Constraints

- Never apply destructive fixes without confirmation
- Always use minimal impact fixes first
- Defer to specialist expertise for complex issues
- Require verification for all applied fixes
- Maintain rollback capability for all changes
- Document all fixes for future reference

## Expected Output

- Comprehensive error classification and root cause analysis
- Automatic specialist assignment based on error patterns
- Applied fix solutions with specific code changes
- Verification results and test outcomes
- Prevention strategies and monitoring recommendations
- Documentation of all changes made

## How

### 1. Error Analysis & Classification
```php
// Error pattern matching for specialist assignment
$error_patterns = [
    'wordpress' => [
        'patterns' => ['/wp-content/', 'WordPress', 'WP_Error', 'wp_'],
        'specialist' => 'wordpress-timber-specialist'
    ],
    'php' => [
        'patterns' => ['PHP Fatal error', 'Parse error', 'Call to undefined function', 'Class.*not found'],
        'specialist' => 'php-backend'
    ],
    'javascript' => [
        'patterns' => ['JavaScript error', 'Uncaught', 'ReferenceError', 'TypeError', 'SyntaxError'],
        'specialist' => 'frontend-javascript'
    ],
    'css' => [
        'patterns' => ['CSS error', 'Invalid CSS', 'Tailwind', 'DaisyUI'],
        'specialist' => 'css-tailwind'
    ],
    'database' => [
        'patterns' => ['MySQL', 'database', 'SQL', 'wpdb', 'Table.*not found'],
        'specialist' => 'database-specialist'
    ],
    'performance' => [
        'patterns' => ['slow', 'timeout', 'memory', 'performance', 'optimization'],
        'specialist' => 'performance-specialist'
    ],
    'security' => [
        'patterns' => ['security', 'vulnerability', 'XSS', 'SQL injection', 'authentication'],
        'specialist' => 'security-specialist'
    ],
    'accessibility' => [
        'patterns' => ['a11y', 'WCAG', 'accessibility', 'screen reader', 'ARIA'],
        'specialist' => 'accessibility-specialist'
    ],
    'build' => [
        'patterns' => ['build', 'compile', 'esbuild', 'Tailwind', 'PostCSS'],
        'specialist' => 'build-tools-devops'
    ]
];
```

### 2. Automatic Specialist Assignment
Based on error message analysis, automatically assign the most appropriate specialist:

#### WordPress/Timber Issues
- **Triggers**: WordPress errors, Timber template issues, ACF problems
- **Specialist**: `wordpress-timber-specialist`
- **Common Fixes**: Template path corrections, context data issues, hook timing

#### PHP Backend Issues  
- **Triggers**: PHP syntax errors, class autoloading, memory issues
- **Specialist**: `php-backend`
- **Common Fixes**: Syntax corrections, namespace issues, dependency injection

#### Frontend JavaScript Issues
- **Triggers**: JavaScript runtime errors, module loading, DOM issues
- **Specialist**: `frontend-javascript`
- **Common Fixes**: Script loading order, event handlers, async/await

#### CSS/Styling Issues
- **Triggers**: Tailwind compilation, responsive design, component styling
- **Specialist**: `css-tailwind`
- **Common Fixes**: Class name conflicts, build configuration, responsive breakpoints

#### Database Issues
- **Triggers**: Query failures, table errors, connection issues
- **Specialist**: `database-specialist`
- **Common Fixes**: Query optimization, table structure, connection handling

### 3. Fix Implementation Strategy

#### Phase 1: Immediate Diagnosis
```markdown
## Error Analysis
**Error Type**: [Classified error category]
**Affected Specialist**: [Assigned specialist]
**Severity**: [Critical/High/Medium/Low]
**Impact**: [What functionality is broken]
```

#### Phase 2: Root Cause Investigation
- Examine stack traces and error locations
- Check recent changes (git diff)
- Verify configuration files
- Test in isolation

#### Phase 3: Automated Fix Application
```php
// Example fix patterns
$fix_patterns = [
    'missing_include' => [
        'detect' => '/Call to undefined function|Class.*not found/',
        'fix' => 'Add missing include/require statement',
        'auto_apply' => true
    ],
    'syntax_error' => [
        'detect' => '/Parse error|syntax error/',
        'fix' => 'Correct PHP syntax',
        'auto_apply' => true
    ],
    'template_not_found' => [
        'detect' => '/template.*not found|Twig.*Error/',
        'fix' => 'Create missing template or fix path',
        'auto_apply' => true
    ]
];
```

#### Phase 4: Verification & Testing
- Run automated tests
- Manual verification of fix
- Performance impact assessment
- Regression testing

### 4. Common Fix Patterns by Specialist

#### WordPress/Timber Specialist Fixes
```php
// Common WordPress fixes
1. Fix template hierarchy issues
2. Correct Timber context data
3. Resolve ACF field display problems
4. Fix custom post type registration
5. Resolve hook timing issues
```

#### PHP Backend Specialist Fixes
```php
// Common PHP fixes
1. Fix class autoloading issues
2. Correct namespace declarations
3. Resolve dependency injection problems
4. Fix memory limit issues
5. Correct error handling
```

#### Frontend JavaScript Specialist Fixes
```javascript
// Common JS fixes
1. Fix module import/export issues
2. Correct async/await usage
3. Resolve DOM manipulation timing
4. Fix event listener problems
5. Correct API call handling
```

#### CSS/Tailwind Specialist Fixes
```css
/* Common CSS fixes */
1. Fix Tailwind class compilation
2. Resolve responsive breakpoint issues
3. Fix component styling conflicts
4. Correct build configuration
5. Resolve CSS specificity issues
```

### 5. Auto-Fix Commands

#### Quick Fix Mode
```bash
# Auto-fix common issues with single command
/fix [error_message]
```

#### Deep Analysis Mode
```bash
# Comprehensive analysis and fix
/fix --deep [error_message]
```

#### Specialist-Specific Fix
```bash
# Force specific specialist
/fix --specialist=wordpress [error_message]
```

### 6. Integration with Existing Skills

This auto-fix skill coordinates with:
- **debug-assistant**: For systematic debugging approach
- **code-review**: For validation of fixes
- **refactor**: When fixes require refactoring
- **testing**: For verification of fixes

### 7. Error Recovery Procedures

#### Critical Errors (Site Down)
1. Immediate rollback to last working state
2. Apply emergency fix
3. Verify site functionality
4. Implement permanent solution

#### High Priority Errors (Feature Broken)
1. Isolate affected functionality
2. Apply targeted fix
3. Test feature specifically
4. Monitor for side effects

#### Medium Priority Errors (UI Issues)
1. Identify visual/functional impact
2. Apply cosmetic/functional fix
3. Verify user experience
4. Document for future reference

### 8. Prevention & Monitoring

#### Automated Monitoring
```php
// Error tracking setup
$error_monitoring = [
    'log_errors' => true,
    'alert_threshold' => 5, // Alert after 5 similar errors
    'auto_fix_enabled' => true,
    'specialist_assignment' => 'automatic'
];
```

#### Prevention Strategies
- Code review integration
- Automated testing pipeline
- Performance monitoring
- Security scanning

## Output Format

```markdown
## Auto-Fix Report

### Error Classification
**Type**: [Error category]
**Specialist**: [Assigned specialist]
**Severity**: [Critical/High/Medium/Low]

### Root Cause Analysis
**Problem**: [What went wrong]
**Location**: [File and line number]
**Impact**: [Affected functionality]

### Applied Fix
**Solution**: [What was fixed]
**Changes Made**: [Specific code changes]
**Files Modified**: [List of changed files]

### Verification
**Tests Run**: [Test commands executed]
**Results**: [Pass/Fail status]
**Manual Check**: [Verification steps]

### Prevention
**Monitoring**: [How to prevent recurrence]
**Documentation**: [Knowledge base updates]
```

## Key Rules

- **Safety First**: Never apply destructive fixes without confirmation
- **Minimal Impact**: Use smallest possible fix
- **Specialist Expertise**: Always defer to assigned specialist
- **Verification Required**: All fixes must be tested
- **Documentation**: Record all fixes for future reference
- **Rollback Ready**: Always have rollback plan

## Emergency Procedures

### Site Down Emergency
1. Immediately identify breaking change
2. Rollback to last working commit
3. Apply emergency patch
4. Verify site functionality
5. Schedule permanent fix

### Security Emergency
1. Isolate vulnerable code
2. Apply security patch immediately
3. Scan for related vulnerabilities
4. Update security monitoring
5. Document security incident

This auto-fix skill provides comprehensive error resolution with automatic specialist assignment, ensuring fast and accurate problem resolution while maintaining system stability and security.
