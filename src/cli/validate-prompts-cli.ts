import { Command } from 'commander';
import { PromptQualityValidator } from './validate-prompts.js';
import { log } from '../utils/logger.js';
import { findProjectRoot, fileExists } from '../utils/file-ops.js';
import { join } from 'path';

export const validatePromptsCommand = new Command('validate-prompts')
  .description('Validate prompt quality according to prompt-quality-standard.json (primarily for projects using the toolkit)')
  .option('-v, --verbose', 'Show detailed validation results', false)
  .option('--toolkit-mode', 'Validate toolkit templates (less strict)', false)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const validator = new PromptQualityValidator(projectRoot);
      const results = await validator.validateAll();
      
      if (results.length === 0) {
        log.warn('No prompt files found to validate');
        log.info('Make sure you have .chain/skills/ or .chain/rules/ directories with .md files');
        process.exit(0);
      }

      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      
      log.info(`📊 Validation Results:`);
      log.info(`   Files checked: ${results.length}`);
      log.info(`   Average score: ${averageScore.toFixed(1)}/10`);
      log.info(`   Passed: ${passed}`);
      log.info(`   Failed: ${failed}`);
      
      if (options.verbose && failed > 0) {
        log.info('\n❌ Failed validations:');
        for (const result of results.filter(r => !r.passed)) {
          log.info(`\n📝 ${result.filePath}`);
          log.info(`   Score: ${result.score}/10`);
          for (const issue of result.issues) {
            log.warn(`   • ${issue}`);
          }
          for (const suggestion of result.suggestions) {
            log.info(`   💡 ${suggestion}`);
          }
        }
      }
      
      if (failed > 0) {
        log.error('\n❌ Some prompts failed validation');
        log.info('Run with --verbose to see detailed issues and suggestions');
        process.exit(1);
      } else {
        log.success('\n✅ All prompts passed validation!');
      }
    } catch (error) {
      log.error(`Prompt validation failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
