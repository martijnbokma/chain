import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { log } from '../utils/logger.js';

interface ValidationResult {
  filePath: string;
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

interface QualityStandard {
  requiredSections: {
    skills: string[];
    rules: string[];
  };
  scoring: {
    sectionCompleteness: number;
    examplesPresence: number;
    clarityScore: number;
  };
}

export class PromptQualityValidator {
  private projectPath: string;
  private qualityStandard: QualityStandard;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.qualityStandard = {
      requiredSections: {
        skills: ['Purpose', 'When to Use', 'Constraints', 'Expected Output'],
        rules: ['Purpose', 'When to Apply', 'Constraints', 'Expected Output', 'Quality Gates']
      },
      scoring: {
        sectionCompleteness: 4,
        examplesPresence: 2,
        clarityScore: 4
      }
    };
  }

  async validateAll(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    try {
      // Validate skills
      const skillsDir = join(this.projectPath, '.chain/skills');
      if (await this.directoryExists(skillsDir)) {
        const skillFiles = await this.findMarkdownFiles(skillsDir);
        for (const file of skillFiles) {
          const result = await this.validateFile(file, 'skills');
          results.push(result);
        }
      }

      // Validate rules
      const rulesDir = join(this.projectPath, '.chain/rules');
      if (await this.directoryExists(rulesDir)) {
        const ruleFiles = await this.findMarkdownFiles(rulesDir);
        for (const file of ruleFiles) {
          const result = await this.validateFile(file, 'rules');
          results.push(result);
        }
      }

      // Also check templates directory for toolkit development
      const templateSkillsDir = join(this.projectPath, 'templates/skills');
      if (await this.directoryExists(templateSkillsDir)) {
        const skillFiles = await this.findMarkdownFiles(templateSkillsDir);
        for (const file of skillFiles) {
          const result = await this.validateFile(file, 'skills');
          results.push(result);
        }
      }

      const templateRulesDir = join(this.projectPath, 'templates/rules');
      if (await this.directoryExists(templateRulesDir)) {
        const ruleFiles = await this.findMarkdownFiles(templateRulesDir);
        for (const file of ruleFiles) {
          const result = await this.validateFile(file, 'rules');
          results.push(result);
        }
      }
    } catch (error) {
      log.error(`Error during validation: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  private async validateFile(filePath: string, fileType: 'skills' | 'rules'): Promise<ValidationResult> {
    const content = await readFile(filePath, 'utf-8');
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check for required sections
    const requiredSections = this.qualityStandard.requiredSections[fileType];
    const missingSections = requiredSections.filter(section => !content.includes(`## ${section}`));
    
    if (missingSections.length > 0) {
      issues.push(`Missing required sections: ${missingSections.join(', ')}`);
      suggestions.push(`Add sections: ${missingSections.join(', ')}`);
    } else {
      score += this.qualityStandard.scoring.sectionCompleteness;
    }

    // Check for examples (skills only)
    if (fileType === 'skills') {
      if (!content.includes('## Examples') && !content.includes('### Examples')) {
        issues.push('Missing examples or code samples');
        suggestions.push('Add examples section with practical code samples');
      } else {
        score += this.qualityStandard.scoring.examplesPresence;
      }
    }

    // Check for quality gates (rules only)
    if (fileType === 'rules') {
      if (!content.includes('## Quality Gates') && !content.includes('### Quality Gates')) {
        issues.push('Missing quality gates section');
        suggestions.push('Add quality gates section to define acceptance criteria');
      }
    }

    // Check content clarity and length
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 10) {
      issues.push('Content seems too brief');
      suggestions.push('Expand content with more detailed explanations');
    } else {
      score += this.qualityStandard.scoring.clarityScore;
    }

    // Check for proper markdown structure
    if (!content.match(/^#\s+.+$/m)) {
      issues.push('Missing or improperly formatted title');
      suggestions.push('Add a proper title with # Title format');
    }

    const passed = issues.length === 0 && score >= 7;

    return {
      filePath,
      passed,
      score: Math.min(score, 10),
      issues,
      suggestions
    };
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      await readdir(path);
      return true;
    } catch {
      return false;
    }
  }

  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(join(dir, entry.name));
      }
    }
    
    return files;
  }
}
