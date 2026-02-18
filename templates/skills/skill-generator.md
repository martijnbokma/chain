# Skill Generator

> Dynamic skill generation system that combines universal patterns with project-specific configurations to create customized skills for any project type.

## Purpose

To dynamically generate customized skills that combine universal patterns with project-specific configurations, creating tailored AI agent capabilities for any project type or framework.

## When to Use

- Creating project-specific skills based on detected frameworks
- Generating customized auto-fix and debugging capabilities
- Adapting universal skills to specific project contexts
- Building framework-specific specialist skills
- Automating skill creation for new projects
- Updating existing skills with new patterns and configurations
- Creating batch skill generation workflows

## Constraints

- Always validate generated skills against quality standards
- Ensure generated skills follow established templates and patterns
- Maintain compatibility with existing AI agent ecosystems
- Validate framework detection before generating specific skills
- Test generated skills for syntax and structure correctness
- Ensure proper integration with Chain sync processes
- Maintain security and privacy in skill generation

## Expected Output

- Dynamically generated skill files tailored to project frameworks
- Framework-specific specialist skills and configurations
- Template-based skill generation with customization
- Integration scripts for Chain compatibility
- Validation reports for generated skills
- Configuration files for skill customization
- Documentation for generated skill usage and maintenance

## Generation Process

### 1. Configuration Loading
```javascript
class SkillGenerator {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.config = null;
        this.framework = null;
    }
    
    async initialize() {
        // Load universal configuration
        await this.loadUniversalConfig();
        
        // Detect framework
        await this.detectFramework();
        
        // Load project-specific overrides
        await this.loadProjectOverrides();
        
        // Merge configurations
        this.mergeConfigurations();
    }
    
    async loadUniversalConfig() {
        this.universalConfig = {
            errorPatterns: await this.loadFile('core/universal-skills/error-analysis.md'),
            template: await this.loadFile('core/templates/skill-template.md'),
            frameworkDetection: await this.loadFile('core/framework-agnostic/framework-detection.md')
        };
    }
    
    async detectFramework() {
        const detector = new FrameworkDetector(this.projectPath);
        const frameworks = await detector.detect();
        this.framework = frameworks.find(f => f.primary)?.framework || frameworks[0]?.framework || 'generic';
    }
    
    async loadProjectOverrides() {
        this.projectOverrides = {
            errorPatterns: await this.loadFile('overrides/error-patterns.md'),
            buildCommands: await this.loadFile('overrides/build-commands.md'),
            testingSetup: await this.loadFile('overrides/testing-setup.md')
        };
    }
}
```

### 2. Template Processing
```javascript
class TemplateProcessor {
    constructor(config, framework, projectOverrides) {
        this.config = config;
        this.framework = framework;
        this.projectOverrides = projectOverrides;
    }
    
    generateSkill(skillType) {
        const template = this.config.template;
        
        // Replace template variables
        let skillContent = template
            .replace(/{{SKILL_NAME}}/g, this.generateSkillName(skillType))
            .replace(/{{DESCRIPTION}}/g, this.generateDescription(skillType))
            .replace(/{{TRIGGERS}}/g, this.generateTriggers(skillType))
            .replace(/{{FRAMEWORK_SPECIFICS}}/g, this.generateFrameworkSpecifics(skillType))
            .replace(/{{FRAMEWORK_SPECIALISTS}}/g, this.generateFrameworkSpecialists(skillType));
        
        return skillContent;
    }
    
    generateSkillName(skillType) {
        const frameworkName = this.framework.charAt(0).toUpperCase() + this.framework.slice(1);
        return `${frameworkName} ${skillType.charAt(0).toUpperCase() + skillType.slice(1)}`;
    }
    
    generateDescription(skillType) {
        const descriptions = {
            'auto-fix': `Automatically diagnose, fix, and resolve ${this.framework} problems by analyzing error messages and assigning the appropriate specialist.`,
            'debug': `Systematic debugging approach for ${this.framework} applications with comprehensive error analysis and resolution strategies.`,
            'optimize': `Performance optimization for ${this.framework} applications including database queries, asset loading, and caching strategies.`
        };
        
        return descriptions[skillType] || `${skillType} skill for ${this.framework} applications`;
    }
    
    generateTriggers(skillType) {
        const triggers = {
            'auto-fix': [
                `User reports any ${this.framework} error or bug`,
                `System encounters unexpected ${this.framework} behavior`,
                `Tests fail or build breaks in ${this.framework}`,
                `Performance issues detected in ${this.framework}`,
                `Security vulnerabilities found in ${this.framework}`,
                `User asks: "fix this", "solve this problem", "resolve error", "auto-fix"`
            ],
            'debug': [
                `${this.framework} errors need systematic investigation`,
                `Complex ${this.framework} issues require deep analysis`,
                `${this.framework} performance problems need diagnosis`,
                `${this.framework} integration issues need troubleshooting`
            ]
        };
        
        return (triggers[skillType] || []).map(trigger => `- ${trigger}`).join('\n');
    }
    
    generateFrameworkSpecifics(skillType) {
        const specifics = this.projectOverrides.errorPatterns || '';
        
        if (skillType === 'auto-fix') {
            return `
### ${this.framework.toUpperCase()} Specific Detection
${specifics}

### Error Pattern Matching
Based on the detected framework (${this.framework}), the system will:
1. Analyze error messages against ${this.framework}-specific patterns
2. Match against known ${this.framework} error types
3. Assign appropriate ${this.framework} specialists
4. Apply ${this.framework}-specific fix strategies
            `;
        }
        
        return specifics;
    }
    
    generateFrameworkSpecialists(skillType) {
        const specialistMatrix = this.extractSpecialistMatrix();
        const relevantSpecialists = Object.keys(specialistMatrix)
            .filter(specialist => specialist.includes(this.framework.toLowerCase()) || specialist.includes('universal'))
            .map(specialist => `- **${specialist}**: ${this.getSpecialistDescription(specialist)}`)
            .join('\n');
        
        return relevantSpecialists;
    }
    
    extractSpecialistMatrix() {
        // Extract from project overrides or use defaults
        if (this.projectOverrides.errorPatterns) {
            // Parse YAML-like structure from error patterns
            return this.parseSpecialistMatrix(this.projectOverrides.errorPatterns);
        }
        
        return this.getDefaultSpecialistMatrix();
    }
    
    getSpecialistDescription(specialist) {
        const descriptions = {
            'wordpress-timber-specialist': 'WordPress and Timber template issues',
            'acf-specialist': 'Advanced Custom Fields integration',
            'timmy-specialist': 'Image processing and optimization',
            'build-tools-specialist': 'Build system and asset management',
            'performance-specialist': 'Performance optimization',
            'security-specialist': 'Security vulnerabilities and fixes'
        };
        
        return descriptions[specialist] || 'Framework-specific expertise';
    }
}
```

### 3. Dynamic Skill Creation
```javascript
class DynamicSkillCreator {
    constructor(generator) {
        this.generator = generator;
    }
    
    async createSkill(skillType, outputPath) {
        await this.generator.initialize();
        
        const processor = new TemplateProcessor(
            this.generator.config,
            this.generator.framework,
            this.generator.projectOverrides
        );
        
        const skillContent = processor.generateSkill(skillType);
        
        // Write skill file
        await this.writeFile(outputPath, skillContent);
        
        // Create supporting files if needed
        await this.createSupportingFiles(skillType, outputPath);
        
        return {
            success: true,
            skillPath: outputPath,
            framework: this.generator.framework,
            skillType: skillType
        };
    }
    
    async createSupportingFiles(skillType, skillPath) {
        const skillDir = path.dirname(skillPath);
        
        // Create specialist files if they don't exist
        const specialists = this.extractRequiredSpecialists(skillType);
        
        for (const specialist of specialists) {
            const specialistPath = path.join(skillDir, 'specialists', `${specialist}.md`);
            if (!await this.fileExists(specialistPath)) {
                await this.createSpecialistFile(specialist, specialistPath);
            }
        }
        
        // Create configuration files
        await this.createConfigurationFiles(skillDir);
    }
    
    async createSpecialistFile(specialist, outputPath) {
        const template = await this.loadFile('core/templates/specialist-template.md');
        const specialistContent = template
            .replace(/{{SPECIALIST_NAME}}/g, specialist)
            .replace(/{{FRAMEWORK}}/g, this.generator.framework)
            .replace(/{{EXPERTISE}}/g, this.generateSpecialistExpertise(specialist));
        
        await this.writeFile(outputPath, specialistContent);
    }
    
    generateSpecialistExpertise(specialist) {
        const expertise = {
            'wordpress-timber-specialist': `
- **WordPress Theme Development**: Deep understanding of WordPress theme hierarchy
- **Timber/Twig Integration**: Expert in Timber templating engine
- **ACF Pro Integration**: Advanced Custom Fields configuration
- **Custom Post Types**: CPT registration and template hierarchy
- **Asset Management**: WordPress asset optimization
            `,
            'performance-specialist': `
- **Database Optimization**: Query optimization and caching
- **Asset Optimization**: CSS/JS minification and loading strategies
- **Caching Strategies**: WordPress caching implementations
- **Performance Monitoring**: Load time and metric analysis
- **Server Optimization**: Server-side performance tuning
            `
        };
        
        return expertise[specialist] || 'Framework-specific expertise and problem resolution';
    }
}
```

## Usage Examples

### Basic Skill Generation
```javascript
// Generate auto-fix skill for current project
const creator = new DynamicSkillCreator();
const result = await creator.createSkill('auto-fix', '.chain/skills/auto-fix.md');

console.log(`Generated ${result.skillType} skill for ${result.framework} framework`);
// Output: Generated auto-fix skill for wordpress framework
```

### Custom Skill Generation
```javascript
// Generate custom debug skill
const creator = new DynamicSkillCreator();
const result = await creator.createSkill('debug', '.chain/skills/debug.md');

// Generate optimization skill
const optimizeResult = await creator.createSkill('optimize', '.chain/skills/optimize.md');
```

### Batch Skill Generation
```javascript
// Generate all standard skills
const skillTypes = ['auto-fix', 'debug', 'optimize', 'test', 'deploy'];
const creator = new DynamicSkillCreator();

for (const skillType of skillTypes) {
    const result = await creator.createSkill(skillType, `.chain/skills/${skillType}.md`);
    console.log(`Created ${skillType} skill: ${result.skillPath}`);
}
```

## Configuration Management

### Universal Configuration
```yaml
# core/config/universal-config.yml
universal_skills:
  auto-fix:
    description: "Universal auto-fix skill"
    template: "skill-template.md"
    required_specialists:
      - debugging-specialist
      - performance-specialist
      - security-specialist
      
  debug:
    description: "Universal debugging skill"
    template: "skill-template.md"
    required_specialists:
      - debugging-specialist
      - testing-specialist
```

### Framework-Specific Configuration
```yaml
# core/config/framework-config.yml
frameworks:
  wordpress:
    specialists:
      - wordpress-timber-specialist
      - acf-specialist
      - timmy-specialist
    error_patterns: "overrides/wordpress-error-patterns.md"
    build_commands: "overrides/wordpress-build-commands.md"
    
  laravel:
    specialists:
      - laravel-specialist
      - eloquent-specialist
      - blade-specialist
    error_patterns: "overrides/laravel-error-patterns.md"
    build_commands: "overrides/laravel-build-commands.md"
```

### Project-Specific Configuration
```yaml
# .chain/overrides/project-config.yml
project_overrides:
  custom_specialists:
    - matters-integration-specialist
    - custom-business-logic-specialist
    
  additional_error_patterns:
    custom_business_logic: /business.*logic.*error/
    
  custom_build_commands:
    deploy: "esbuild src/index.js --bundle --minify --outfile=dist/bundle.js && deploy-script"
    lint: "eslint src --fix"
```

## Integration with Chain

### Automatic Skill Generation
```javascript
// Integrate with Chain sync process
class ChainIntegration {
    static async syncSkills(projectPath) {
        const creator = new DynamicSkillCreator();
        
        // Detect current skills
        const existingSkills = await this.getExistingSkills(projectPath);
        
        // Generate missing skills
        const requiredSkills = ['auto-fix', 'debug', 'optimize'];
        
        for (const skillType of requiredSkills) {
            if (!existingSkills.includes(skillType)) {
                const result = await creator.createSkill(skillType, `${projectPath}/.chain/skills/${skillType}.md`);
                console.log(`Generated missing skill: ${result.skillPath}`);
            }
        }
        
        // Update existing skills with new patterns
        await this.updateExistingSkills(projectPath);
    }
    
    static async updateExistingSkills(projectPath) {
        const skills = await this.getAllSkills(projectPath);
        
        for (const skill of skills) {
            const generator = new SkillGenerator(projectPath);
            await generator.initialize();
            
            const processor = new TemplateProcessor(
                generator.config,
                generator.framework,
                generator.projectOverrides
            );
            
            const updatedContent = processor.generateSkill(skill.type);
            await this.writeFile(skill.path, updatedContent);
        }
    }
}
```

### CLI Integration
```bash
# Command line usage
chain generate-skill auto-fix
chain generate-skill debug --framework=wordpress
chain generate-all-skills
chain update-skills
```

## Advanced Features

### Skill Customization
```javascript
// Allow custom skill templates
class CustomSkillGenerator extends DynamicSkillCreator {
    async createCustomSkill(skillType, customTemplate, outputPath) {
        await this.generator.initialize();
        
        const processor = new TemplateProcessor(
            this.generator.config,
            this.generator.framework,
            this.generator.projectOverrides
        );
        
        const skillContent = processor.processCustomTemplate(customTemplate, skillType);
        await this.writeFile(outputPath, skillContent);
        
        return {
            success: true,
            skillPath: outputPath,
            framework: this.generator.framework,
            skillType: skillType
        };
    }
}
```

### Skill Validation
```javascript
// Validate generated skills
class SkillValidator {
    static validate(skillContent) {
        const errors = [];
        
        // Check for required sections
        const requiredSections = ['## When', '## How', '## Output Format'];
        for (const section of requiredSections) {
            if (!skillContent.includes(section)) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        
        // Check for template variables
        const templateVars = skillContent.match(/{{[^}]+}}/g);
        if (templateVars) {
            errors.push(`Unclosed template variables: ${templateVars.join(', ')}`);
        }
        
        // Check markdown syntax
        try {
            const marked = require('marked');
            marked.parse(skillContent);
        } catch (e) {
            errors.push(`Invalid markdown syntax: ${e.message}`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}
```

This skill generator provides a comprehensive system for creating customized skills that combine universal patterns with project-specific configurations, ensuring maximum flexibility and effectiveness across different project types.
