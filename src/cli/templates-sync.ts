import { Command } from 'commander';
import { syncTemplatesWithAiContent, printSyncResult } from '../sync/templates-sync.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';

export const templatesSyncCommand = new Command('templates-sync')
  .description('Sync templates/ with .chain/ (newest file wins)')
  .option('-d, --dry-run', 'Show what would be synced without making changes')
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('Syncing templates/ with .chain/');
      
      const result = await syncTemplatesWithAiContent(projectRoot, options.dryRun);
      
      if (options.dryRun) {
        log.header('Dry run completed - no changes made');
      }
      
      printSyncResult(result);

      if (result.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      log.error(`Templates sync failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
