import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import * as p from '@clack/prompts';
import { fileExists, readTextFile } from '../utils/file-ops.js';
import { configExists, loadConfig } from '../core/config-loader.js';
import { CONFIG_FILENAME, CONTENT_DIR } from '../core/types.js';
import { log } from '../utils/logger.js';

interface DoctorIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
}

interface DoctorReport {
  issues: DoctorIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Run comprehensive diagnostics on Chain setup
 */
export async function runDoctor(projectRoot: string): Promise<void> {
  p.intro('🔍 Chain Doctor - Diagnosing your setup...');
  
  const report = await diagnoseProject(projectRoot);
  
  // Display results
  if (report.issues.length === 0) {
    log.success('✅ No issues found! Your Chain setup is healthy.');
    return;
  }
  
  // Group issues by type
  const errors = report.issues.filter(i => i.type === 'error');
  const warnings = report.issues.filter(i => i.type === 'warning');
  const info = report.issues.filter(i => i.type === 'info');
  
  // Display errors
  if (errors.length > 0) {
    log.error(`❌ Found ${errors.length} error(s):`);
    for (const error of errors) {
      p.note(`${error.message}${error.fix ? `\n\nFix: ${error.fix}` : ''}`, 'Error');
    }
  }
  
  // Display warnings
  if (warnings.length > 0) {
    log.warn(`⚠️  Found ${warnings.length} warning(s):`);
    for (const warning of warnings) {
      p.note(`${warning.message}${warning.fix ? `\n\nFix: ${warning.fix}` : ''}`, 'Warning');
    }
  }
  
  // Display info
  if (info.length > 0) {
    log.info(`ℹ️  Found ${info.length} info item(s):`);
    for (const item of info) {
      p.note(`${item.message}${item.fix ? `\n\nFix: ${item.fix}` : ''}`, 'Info');
    }
  }
  
  // Summary
  const summary = [
    errors.length > 0 ? `${errors.length} error(s)` : null,
    warnings.length > 0 ? `${warnings.length} warning(s)` : null,
    info.length > 0 ? `${info.length} info item(s)` : null,
  ].filter(Boolean).join(', ');
  
  if (errors.length > 0) {
    p.cancel(`🚨 Doctor found issues: ${summary}`);
    process.exit(1);
  } else if (warnings.length > 0) {
    log.warn(`⚠️  Doctor found warnings: ${summary}`);
  } else {
    log.success(`✅ Doctor completed: ${summary}`);
  }
}

/**
 * Diagnose project for common issues
 */
async function diagnoseProject(projectRoot: string): Promise<DoctorReport> {
  const issues: DoctorIssue[] = [];
  
  // Check 1: Configuration file exists
  if (!await configExists(projectRoot)) {
    issues.push({
      type: 'error',
      message: `No ${CONFIG_FILENAME} found in project root`,
      fix: 'Run `chain init` to initialize Chain in this project',
    });
  } else {
    // Check 2: Configuration is valid
    try {
      const config = await loadConfig(projectRoot);
      
      // Check 3: Has editors enabled
      const enabledEditors = Object.entries(config.editors || {}).filter(([, enabled]) => enabled);
      if (enabledEditors.length === 0) {
        issues.push({
          type: 'warning',
          message: 'No AI editors are enabled in configuration',
          fix: 'Enable editors in chain.yaml or run `chain init` to configure',
        });
      }
      
      // Check 4: Content directory exists
      const contentDir = join(projectRoot, CONTENT_DIR);
      if (!await fileExists(contentDir)) {
        issues.push({
          type: 'error',
          message: `Content directory (${CONTENT_DIR}/) does not exist`,
          fix: 'Run `chain init` to create the content directory structure',
        });
      }
      
      // Check 5: Content sources are valid
      if (config.content_sources && config.content_sources.length > 0) {
        for (const source of config.content_sources) {
          if (source.type === 'local' && source.path) {
            const resolvedPath = source.path.startsWith('~') 
              ? join(homedir(), source.path.slice(1))
              : join(projectRoot, source.path);
              
            if (!await fileExists(resolvedPath)) {
              issues.push({
                type: 'error',
                message: `Content source path does not exist: ${source.path}`,
                fix: `Create the directory at ${resolvedPath} or update the path in chain.yaml`,
              });
            }
          } else if (source.type === 'package' && source.name) {
            // Check if package is installed (basic check)
            try {
              require.resolve(source.name);
            } catch {
              issues.push({
                type: 'warning',
                message: `Content source package not installed: ${source.name}`,
                fix: `Install with: bun add -d ${source.name}`,
              });
            }
          }
        }
      }
      
    } catch (error) {
      issues.push({
        type: 'error',
        message: `Invalid configuration in ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`,
        fix: 'Fix syntax errors in chain.yaml or run `chain init --force` to recreate',
      });
    }
  }
  
  // Check 6: Shared content hub
  const sharedHubPath = join(homedir(), '.chain');
  if (await fileExists(sharedHubPath)) {
    // Check if shared hub has proper structure
    const requiredDirs = ['rules', 'skills', 'workflows'];
    for (const dir of requiredDirs) {
      const dirPath = join(sharedHubPath, dir);
      if (!await fileExists(dirPath)) {
        issues.push({
          type: 'warning',
          message: `Shared hub missing directory: ${dir}/`,
          fix: 'Run `chain init --shared --force` to recreate the shared hub',
        });
      }
    }
  }
  
  // Check 7: Common editor installations
  const editorChecks = [
    { path: '.cursor', name: 'Cursor' },
    { path: '.windsurf', name: 'Windsurf' },
    { path: '.claude', name: 'Claude Code' },
  ];
  
  for (const editor of editorChecks) {
    const editorPath = join(projectRoot, editor.path);
    if (await fileExists(editorPath)) {
      issues.push({
        type: 'info',
        message: `Found ${editor.name} configuration directory`,
        fix: 'Make sure Chain is syncing to this editor',
      });
    }
  }
  
  // Check 8: Git repository
  if (!await fileExists(join(projectRoot, '.git'))) {
    issues.push({
      type: 'info',
      message: 'Not a Git repository',
      fix: 'Initialize Git for better version control and pre-commit hooks',
    });
  }
  
  return {
    issues,
    summary: {
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length,
    },
  };
}
