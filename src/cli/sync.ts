import { createInterface } from 'readline';
import { unlink, copyFile } from 'fs/promises';
import type { SyncOptions } from '../core/types.js';
import { loadConfig } from '../core/config-loader.js';
import { runSync } from '../sync/syncer.js';
import { removeOrphanFile } from '../sync/cleanup.js';
import { log, createSpinner } from '../utils/logger.js';
import { ErrorHandlers, formatError } from '../utils/error-handler.js';

function askYesNo(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

export async function runSyncCommand(
  projectRoot: string,
  options: SyncOptions = {},
): Promise<void> {
  const spinner = createSpinner('Loading configuration...');
  spinner.start();

  try {
    const config = await loadConfig(projectRoot);
    spinner.succeed('Configuration loaded');

    const result = await runSync(projectRoot, config, options);

    log.info('');
    log.header(options.dryRun ? 'Dry-Run Summary' : 'Sync Summary');
    log.success(`${options.dryRun ? 'Would sync' : 'Synced'}: ${result.synced.length} file(s)`);

    if (result.removed.length > 0) {
      log.warn(`Removed: ${result.removed.length} orphaned file(s)`);
    }

    // Handle pending orphans with user confirmation or auto-remove
    if (result.pendingOrphans.length > 0 && !options.dryRun) {
      log.info('');
      log.warn(`Found ${result.pendingOrphans.length} orphaned file(s) — no longer in .chain/:`);
      
      const shouldAutoRemove = options.autoRemoveOrphans || options.yes;
      
      for (const orphan of result.pendingOrphans) {
        let confirmed = false;
        
        if (shouldAutoRemove) {
          confirmed = true;
          log.dim(`  🗑 ${orphan.relativePath} — auto-removing...`);
        } else {
          confirmed = await askYesNo(`  🗑 ${orphan.relativePath} — remove? (y/n) `);
        }
        
        if (confirmed) {
          const success = await removeOrphanFile(orphan);
          if (success) {
            result.removed.push(orphan.relativePath);
          }
        } else {
          log.dim(`  Skipped ${orphan.relativePath}`);
        }
      }
    }

    if (result.errors.length > 0) {
      log.error(`Errors: ${result.errors.length}`);
      for (const err of result.errors) {
        log.dim(err);
      }
      process.exit(1);
    }

    let needsResync = false;

    if (result.ssotDiffs.length > 0) {
      log.info('');
      log.warn(`Found ${result.ssotDiffs.length} file(s) out of sync with SSOT:`);
      
      const shouldAutoYes = options.yes;
      
      for (const diff of result.ssotDiffs) {
        if (diff.direction === 'local-newer') {
          let confirmed = false;
          
          if (shouldAutoYes) {
            confirmed = true;
            log.dim(`  ⚠ ${diff.category}/${diff.name}.md — auto-updating SSOT...`);
          } else {
            confirmed = await askYesNo(`  ⚠ ${diff.category}/${diff.name}.md — local is newer. Update SSOT? (y/n) `);
          }
          
          if (confirmed) {
            try {
              await copyFile(diff.localPath, diff.ssotPath);
              log.success(`  Updated ${diff.category}/${diff.name}.md in SSOT`);
            } catch (err) {
              log.error(`  Failed to update: ${err instanceof Error ? err.message : err}`);
            }
          } else {
            log.dim(`  Skipped ${diff.category}/${diff.name}.md`);
          }
        } else {
          let confirmed = false;
          
          if (shouldAutoYes) {
            confirmed = true;
            log.dim(`  ⚠ ${diff.category}/${diff.name}.md — auto-updating local...`);
          } else {
            confirmed = await askYesNo(`  ⚠ ${diff.category}/${diff.name}.md — SSOT is newer. Update local? (y/n) `);
          }
          
          if (confirmed) {
            try {
              await copyFile(diff.ssotPath, diff.localPath);
              log.success(`  Updated ${diff.category}/${diff.name}.md locally`);
              needsResync = true;
            } catch (err) {
              log.error(`  Failed to update: ${err instanceof Error ? err.message : err}`);
            }
          } else {
            log.dim(`  Skipped ${diff.category}/${diff.name}.md`);
          }
        }
      }
    }

    if (result.ssotOrphans.length > 0) {
      log.info('');
      log.warn(`Found ${result.ssotOrphans.length} SSOT orphan(s) — exists in SSOT but removed locally:`);
      for (const orphan of result.ssotOrphans) {
        const confirmed = await askYesNo(`  ⚠ ${orphan.category}/${orphan.name}.md — remove from SSOT? (y/n) `);
        if (confirmed) {
          try {
            await unlink(orphan.absolutePath);
            log.success(`  Removed ${orphan.category}/${orphan.name}.md from SSOT`);
            needsResync = true;
          } catch (err) {
            log.error(`  Failed to remove: ${err instanceof Error ? err.message : err}`);
          }
        } else {
          log.dim(`  Skipped ${orphan.category}/${orphan.name}.md`);
        }
      }
    }

    if (needsResync && !options.dryRun) {
      log.info('');
      log.info('Re-syncing to reflect changes...');
      const resyncResult = await runSync(projectRoot, config, options);
      log.success(`Re-synced: ${resyncResult.synced.length} file(s)`);
      if (resyncResult.removed.length > 0) {
        log.warn(`Removed: ${resyncResult.removed.length} orphaned file(s)`);
      }
    }

    log.info('');
    log.success('Sync complete!');
  } catch (error) {
    spinner.fail('Sync failed');
    
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        const chainError = ErrorHandlers.fileNotFound(
          error.message.split('ENOENT: ')[1]?.split(',')[0] || 'unknown file',
          'during sync operation'
        );
        log.error(formatError(chainError));
      } else if (error.message.includes('EACCES')) {
        const chainError = ErrorHandlers.permissionError('write files during sync');
        log.error(formatError(chainError));
      } else if (error.message.includes('chain.yaml')) {
        const chainError = ErrorHandlers.configError(error.message);
        log.error(formatError(chainError));
      } else {
        // Generic sync error
        const chainError = ErrorHandlers.syncError(error.message);
        log.error(formatError(chainError));
      }
    } else {
      log.error(String(error));
    }
    
    process.exit(1);
  }
}
