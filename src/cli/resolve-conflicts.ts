import { Command } from 'commander';
import { AIConflictResolver } from '../sync/ai-conflict-resolver.js';
import { SmartSyncEngine } from '../sync/smart-sync.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';
import { join } from 'path';

export const resolveConflictsCommand = new Command('resolve-conflicts')
  .description('AI-powered conflict resolution for sync conflicts')
  .option('-s, --source <path>', 'Source directory (default: templates)', 'templates')
  .option('-t, --target <path>', 'Target directory (default: .chain)', '.chain')
  .option('--strategy <strategy>', 'Resolution strategy: auto|manual|ai-assisted|interactive', 'ai-assisted')
  .option('--dry-run', 'Preview conflict resolution without applying changes', false)
  .option('--batch', 'Process all conflicts automatically', false)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const sourceDir = join(projectRoot, options.source);
      const targetDir = join(projectRoot, options.target);

      log.header('AI Conflict Resolution');
      log.info(`Source: ${options.source}`);
      log.info(`Target: ${options.target}`);
      log.info(`Strategy: ${options.strategy}`);

      // First, get sync status to identify conflicts
      const syncEngine = new SmartSyncEngine(projectRoot);
      const comparison = await syncEngine.compareDirectories(sourceDir, targetDir);
      
      if (comparison.conflicts.length === 0) {
        log.success('✅ No conflicts found!');
        return;
      }

      log.warn(`\n⚠️  Found ${comparison.conflicts.length} conflicts:`);
      for (const conflict of comparison.conflicts) {
        log.warn(`  📄 ${conflict.relativePath} - ${conflict.reason}`);
      }

      if (options.dryRun) {
        log.header('Dry run completed - no changes made');
        return;
      }

      // Initialize AI conflict resolver
      const conflictResolver = new AIConflictResolver(projectRoot);

      // Process conflicts
      const conflictDetails = [];
      for (const conflict of comparison.conflicts) {
        try {
          const details = await conflictResolver.detectConflict(
            conflict.sourcePath,
            conflict.targetPath
          );
          conflictDetails.push(details);
        } catch (error) {
          log.error(`Failed to analyze conflict ${conflict.relativePath}: ${error}`);
        }
      }

      if (conflictDetails.length === 0) {
        log.error('No conflicts could be analyzed');
        process.exit(1);
      }

      // Resolve conflicts
      log.header(`Resolving ${conflictDetails.length} conflicts...`);
      
      const resolutionOptions = {
        strategy: options.strategy as any,
        interactive: options.strategy === 'interactive'
      };

      const results = await conflictResolver.resolveBatchConflicts(
        conflictDetails,
        resolutionOptions
      );

      // Apply resolutions
      let resolvedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const conflict = comparison.conflicts[i];
        
        if (result.conflicts.length === 0) {
          // Apply the successful merge
          try {
            await import('../utils/file-ops.js').then(({ writeTextFile }) => 
              writeTextFile(conflict.targetPath, result.mergedContent)
            );
            resolvedCount++;
            log.success(`✅ Resolved: ${conflict.relativePath} (${result.confidence.toFixed(2)} confidence)`);
            log.info(`   ${result.explanation}`);
          } catch (error) {
            failedCount++;
            log.error(`❌ Failed to apply resolution for ${conflict.relativePath}: ${error}`);
          }
        } else {
          failedCount++;
          log.warn(`⚠️  Partial resolution: ${conflict.relativePath}`);
          log.warn(`   ${result.explanation}`);
          for (const conflict of result.conflicts) {
            log.warn(`   - ${conflict}`);
          }
        }
      }

      // Summary
      log.header(`Resolution Summary`);
      log.success(`Fully resolved: ${resolvedCount} files`);
      if (failedCount > 0) {
        log.warn(`Partially resolved/failed: ${failedCount} files`);
      }

      if (failedCount > 0) {
        log.warn('\n💡 Tips for remaining conflicts:');
        log.warn('  • Run with --strategy=interactive for manual resolution');
        log.warn('  • Edit files manually and run sync again');
        log.warn('  • Use --strategy=auto to prefer one side automatically');
      }

    } catch (error) {
      log.error(`Conflict resolution failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
