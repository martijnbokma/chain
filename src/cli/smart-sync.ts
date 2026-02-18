import { Command } from 'commander';
import { SmartSyncEngine } from '../sync/smart-sync.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';
import { join } from 'path';

export const smartSyncCommand = new Command('smart-sync')
  .description('Smart sync using content hashing instead of timestamps')
  .option('-d, --dry-run', 'Preview changes without making them', false)
  .option('-s, --source <path>', 'Source directory (default: templates)', 'templates')
  .option('-t, --target <path>', 'Target directory (default: .chain)', '.chain')
  .option('--resolve-conflicts <strategy>', 'Conflict resolution strategy: source|target|prompt', 'prompt')
  .option('--status', 'Show sync status only', false)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const sourceDir = join(projectRoot, options.source);
      const targetDir = join(projectRoot, options.target);

      const engine = new SmartSyncEngine(projectRoot);
      
      if (options.status) {
        const status = await engine.getSyncStatus(sourceDir, targetDir);
        log.header('Sync Status');
        log.info(`Source: ${options.source}`);
        log.info(`Target: ${options.target}`);
        log.info(`Ahead: ${status.ahead} files`);
        log.info(`Behind: ${status.behind} files`);
        log.info(`Conflicts: ${status.conflicts} files`);
        
        if (status.conflicts > 0) {
          log.warn('\n⚠️  Conflicts detected - run with --resolve-conflicts to fix');
        }
        return;
      }

      log.header(`Smart Sync: ${options.source} → ${options.target}`);
      
      const result = await engine.smartSync(sourceDir, targetDir, {
        dryRun: options.dryRun,
        resolveConflicts: options.resolveConflicts,
        preserveMetadata: true
      });

      // Print results
      const total = result.added.length + result.updated.length + result.removed.length;
      
      if (total > 0) {
        log.success(`\n✅ Smart sync completed: ${total} files processed`);
        log.info(`📁 Added: ${result.added.length} files`);
        log.info(`🔄 Updated: ${result.updated.length} files`);
        log.info(`🗑️  Removed: ${result.removed.length} files`);
      } else {
        log.info(`\n✅ No sync needed - all files are up to date`);
      }

      if (result.conflicts.length > 0) {
        log.warn(`\n⚠️  Found ${result.conflicts.length} conflicts:`);
        for (const conflict of result.conflicts) {
          log.warn(`  📄 ${conflict.path} - ${conflict.reason}`);
        }
        log.warn(`\nRun with --resolve-conflicts=source or --resolve-conflicts=target to resolve`);
      }

      if (result.errors.length > 0) {
        log.error(`\n❌ ${result.errors.length} errors occurred:`);
        for (const error of result.errors) {
          log.error(`  ${error}`);
        }
        process.exit(1);
      }

      if (options.dryRun) {
        log.header('Dry run completed - no changes made');
      }

      // Force exit to prevent hanging
      if (result.errors.length === 0) {
        process.exit(0);
      }

    } catch (error) {
      log.error(`Smart sync failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
