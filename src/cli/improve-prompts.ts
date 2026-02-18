import { Command } from "commander";
import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { log } from '../utils/logger.js';
import { PromptQualityValidator } from './validate-prompts.js';

interface PromptImprovement {
  filePath: string;
  issues: string[];
  improvements: string[];
  originalContent: string;
  improvedContent: string;
}

const requiredSections = {
  skills: ["Purpose", "When to Use", "Constraints", "Expected Output"],
  rules: ["Purpose", "When to Apply", "Constraints", "Expected Output", "Quality Gates"]
};

const sectionTemplates = {
  skills: {
    purpose: (title: string) => `## Purpose\n\nTo ${title.toLowerCase().replace(/^(a|an|the) /i, '')} by providing expert guidance and best practices for optimal outcomes.`,
    whenToUse: (title: string) => `## When to Use\n\n- When working with ${title.toLowerCase()}\n- Need expert guidance in this domain\n- Implementing best practices and standards\n- Troubleshooting issues in this area\n- Optimizing workflows and processes`,
    constraints: (title: string) => `## Constraints\n\n- Follow established best practices and industry standards\n- Ensure accessibility and security compliance\n- Maintain consistency with project conventions\n- Consider performance and scalability implications\n- Validate solutions before implementation`,
    expectedOutput: (title: string) => `## Expected Output\n\n- Expert recommendations and guidance\n- Best practice implementations and examples\n- Optimized solutions following industry standards\n- Clear documentation and explanations\n- Actionable insights and improvement strategies`
  },
  rules: {
    purpose: (title: string) => `## Purpose\n\nTo establish ${title.toLowerCase().replace(/^(a|an|the) /i, '')} that ensure consistency, quality, and best practices across all development work.`,
    whenToApply: (title: string) => `## When to Apply\n\n- During all development activities\n- When reviewing code and documentation\n- When making architectural decisions\n- When setting up new projects or features\n- During code reviews and quality checks`,
    constraints: (title: string) => `## Constraints\n\n- Must be followed consistently across all work\n- Cannot be overridden without explicit justification\n- Applies to all team members and contributors\n- Must be enforced through code reviews and automation`,
    expectedOutput: (title: string) => `## Expected Output\n\n- Consistent, high-quality deliverables\n- Reduced technical debt and maintenance overhead\n- Improved team collaboration and knowledge sharing\n- Clear standards and guidelines for all work`,
    qualityGates: (title: string) => `## Quality Gates\n\n- All code must pass automated quality checks\n- Documentation must be complete and up-to-date\n- Security and accessibility requirements must be met\n- Performance standards must be maintained`
  }
};

function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : "Untitled";
}

function determineFileType(filePath: string): 'skills' | 'rules' | null {
  if (filePath.includes('/skills/') || filePath.includes('skills/')) return 'skills';
  if (filePath.includes('/rules/') || filePath.includes('rules/')) return 'rules';
  return null;
}

function addMissingSections(content: string, fileType: 'skills' | 'rules', missingSections: string[]): string {
  const title = extractTitle(content);
  const lines = content.split('\n');
  const result = [...lines];
  
  // Find where to insert sections (after the title and description)
  let insertIndex = 1;
  while (insertIndex < result.length && !result[insertIndex].startsWith('##')) {
    insertIndex++;
  }
  
  // Add missing sections in the correct order
  const sectionsToAdd = missingSections.filter(section => 
    !content.includes(`## ${section}`)
  );
  
  for (const section of sectionsToAdd) {
    const sectionKey = section.toLowerCase().replace(/\s+/g, '');
    const templates = sectionTemplates[fileType];
    const template = templates[sectionKey as keyof typeof templates];
    
    if (template) {
      const sectionContent = template(title);
      result.splice(insertIndex, 0, sectionContent);
      insertIndex++;
    }
  }
  
  return result.join('\n');
}

function addExamplesIfNeeded(content: string, fileType: 'skills' | 'rules'): string {
  if (content.includes('## Examples')) return content;
  
  const title = extractTitle(content);
  const lines = content.split('\n');
  
  // Find the end of the file to add examples
  let insertIndex = lines.length;
  
  // Add examples section
  const examplesSection = `\n## Examples\n\n### Basic Usage\n\`\`\`\n// Example implementation for ${title}\n// This demonstrates the core concepts and best practices\n\`\`\`\n\n### Advanced Pattern\n\`\`\`\n// Advanced usage pattern\n// Shows more complex scenarios and optimizations\n\`\`\`\n`;
  
  lines.splice(insertIndex, 0, examplesSection);
  
  return lines.join('\n');
}

async function improvePromptFile(filePath: string): Promise<PromptImprovement> {
  const fileType = determineFileType(filePath);
  if (!fileType) {
    throw new Error(`Unknown file type: ${filePath}`);
  }
  
  const originalContent = await readFile(filePath, 'utf-8');
  let improvedContent = originalContent;
  const issues: string[] = [];
  const improvements: string[] = [];
  
  // Check for missing required sections
  const required = requiredSections[fileType];
  const missingSections = required.filter(section => !originalContent.includes(`## ${section}`));
  
  if (missingSections.length > 0) {
    issues.push(`Missing sections: ${missingSections.join(', ')}`);
    improvements.push(`Added sections: ${missingSections.join(', ')}`);
    improvedContent = addMissingSections(improvedContent, fileType, missingSections);
  }
  
  // Check for examples (only for skills)
  if (fileType === 'skills' && !originalContent.includes('## Examples')) {
    issues.push('Missing examples or code samples');
    improvements.push('Added examples section with code samples');
    improvedContent = addExamplesIfNeeded(improvedContent, fileType);
  }
  
  return {
    filePath,
    issues,
    improvements,
    originalContent,
    improvedContent
  };
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(join(dir, entry.name));
    }
  }
  
  return files;
}

async function runImprovePromptsCommand(
  projectPath: string,
  options: { dryRun?: boolean; auto?: boolean }
): Promise<void> {
  log.info("🔧 Analyzing and improving prompts...");
  
  // Find all prompt files
  const skillFiles = await findMarkdownFiles(join(projectPath, "templates/skills"));
  const ruleFiles = await findMarkdownFiles(join(projectPath, "templates/rules"));
  const allFiles = [...skillFiles, ...ruleFiles];
  
  log.info(`📁 Found ${allFiles.length} prompt files`);
  
  const improvements: PromptImprovement[] = [];
  
  for (const filePath of allFiles) {
    try {
      const improvement = await improvePromptFile(filePath);
      
      if (improvement.issues.length > 0) {
        improvements.push(improvement);
        log.info(`📝 ${filePath}: ${improvement.improvements.join(', ')}`);
      }
    } catch (error) {
      log.error(`❌ Error processing ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (improvements.length === 0) {
    log.success("✅ All prompts are already up to standard!");
    return;
  }
  
  log.info(`\n🎯 Found ${improvements.length} files to improve`);
  
  if (options.dryRun) {
    log.info("🔍 Dry run - no files will be modified");
    return;
  }
  
  if (!options.auto) {
    log.info("\n❓ Apply improvements? (y/N)");
    // In a real implementation, you'd wait for user input here
    log.info("💡 Use --auto to apply improvements automatically");
    return;
  }
  
  // Apply improvements
  for (const improvement of improvements) {
    try {
      await writeFile(improvement.filePath, improvement.improvedContent, 'utf-8');
      log.success(`✅ Improved: ${improvement.filePath}`);
    } catch (error) {
      log.error(`❌ Failed to improve ${improvement.filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  log.success(`\n🎉 Successfully improved ${improvements.length} prompt files!`);
  
  // Run validation to show results
  log.info("\n🔍 Running validation to confirm improvements...");
  try {
    const validator = new PromptQualityValidator(projectPath);
    const results = await validator.validateAll();
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    log.info(`📊 Validation Results:`);
    log.info(`   Average score: ${averageScore.toFixed(1)}/10`);
    log.info(`   Passed: ${passed}`);
    log.info(`   Failed: ${failed}`);
  } catch (error) {
    log.error(`❌ Validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const improvePromptsCommand = new Command("improve-prompts")
  .description("Automatically improve prompts by adding missing sections and examples")
  .option("-n, --dry-run", "Preview improvements without modifying files", false)
  .option("-y, --auto", "Automatically apply improvements without confirmation", false)
  .action(async (options) => {
    await runImprovePromptsCommand(process.cwd(), {
      dryRun: options.dryRun,
      auto: options.auto
    });
  });
