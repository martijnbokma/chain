import { Command } from 'commander';
import { ContentRegistry } from '../sync/content-registry.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';
import { join } from 'path';

export const registryCommand = new Command('registry')
  .description('Global content registry management');

registryCommand
  .command('stats')
  .description('Show content registry statistics')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const stats = registry.getStats();
      
      log.header('Content Registry Statistics');
      log.info(`Total items: ${stats.totalItems}`);
      log.info(`Average quality: ${stats.averageQuality.toFixed(1)}`);
      log.info(`Last updated: ${stats.lastUpdated.toLocaleString()}`);
      log.info(`Conflicts: ${stats.conflicts}`);
      log.info(`Orphans: ${stats.orphans}`);

      if (Object.keys(stats.byType).length > 0) {
        log.header('By Type:');
        for (const [type, count] of Object.entries(stats.byType)) {
          log.info(`  ${type}: ${count}`);
        }
      }

      if (Object.keys(stats.byCategory).length > 0) {
        log.header('By Category:');
        for (const [category, count] of Object.entries(stats.byCategory)) {
          log.info(`  ${category}: ${count}`);
        }
      }

    } catch (error) {
      log.error(`Failed to get registry stats: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

registryCommand
  .command('search')
  .description('Search content in registry')
  .option('-t, --type <type>', 'Filter by type: rule|skill|workflow')
  .option('-c, --category <category>', 'Filter by category')
  .option('--tag <tag>', 'Filter by tag (can be used multiple times)')
  .option('--min-quality <score>', 'Minimum quality score', parseFloat)
  .option('--limit <number>', 'Limit results', parseInt)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const results = registry.findContent({
        type: options.type as any,
        category: options.category,
        tags: options.tag ? [options.tag] : undefined,
        minQuality: options.minQuality
      });

      if (options.limit) {
        results.splice(options.limit);
      }

      log.header(`Search Results (${results.length} items)`);
      
      for (const item of results) {
        log.info(`\n📄 ${item.name} (${item.type})`);
        log.info(`   Path: ${item.path}`);
        log.info(`   Category: ${item.category || 'uncategorized'}`);
        log.info(`   Quality: ${item.quality.score}/10`);
        log.info(`   Tags: ${item.tags.join(', ') || 'none'}`);
        log.info(`   Version: v${item.version}`);
        log.info(`   Updated: ${item.updatedAt.toLocaleDateString()}`);
      }

      if (results.length === 0) {
        log.info('No results found.');
      }

    } catch (error) {
      log.error(`Search failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

registryCommand
  .command('conflicts')
  .description('Detect and show content conflicts')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const conflicts = registry.detectConflicts();
      
      if (conflicts.length === 0) {
        log.success('✅ No conflicts found!');
        return;
      }

      log.warn(`⚠️  Found ${conflicts.length} conflicts:`);
      
      for (const conflict of conflicts) {
        log.warn(`\n🔍 ${conflict.type}:`);
        for (const item of conflict.items) {
          log.warn(`  📄 ${item.name} (${item.path})`);
          log.warn(`     ID: ${item.id.substring(0, 8)}...`);
          log.warn(`     Quality: ${item.quality.score}/10`);
        }
      }

    } catch (error) {
      log.error(`Conflict detection failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

registryCommand
  .command('orphans')
  .description('Find orphaned content (no dependencies or dependents)')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const orphans = registry.detectOrphans();
      
      if (orphans.length === 0) {
        log.success('✅ No orphaned content found!');
        return;
      }

      log.warn(`⚠️  Found ${orphans.length} orphaned items:`);
      
      for (const orphan of orphans) {
        log.warn(`\n📄 ${orphan.name} (${orphan.type})`);
        log.warn(`   Path: ${orphan.path}`);
        log.warn(`   Category: ${orphan.category || 'uncategorized'}`);
        log.warn(`   Quality: ${orphan.quality.score}/10`);
        log.warn(`   Last updated: ${orphan.updatedAt.toLocaleDateString()}`);
      }

    } catch (error) {
      log.error(`Orphan detection failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

registryCommand
  .command('deps <id>')
  .description('Show dependency graph for content')
  .option('--depth <number>', 'Maximum depth to traverse', parseInt)
  .action(async (id, options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const content = registry.getContent(id);
      if (!content) {
        log.error(`Content not found: ${id}`);
        process.exit(1);
      }

      const graph = registry.getDependencyGraph(id);
      
      log.header(`Dependency Graph: ${content.name}`);
      log.info(`Path: ${content.path}`);
      log.info(`Type: ${content.type}`);
      log.info(`Quality: ${content.quality.score}/10`);

      if (graph.direct.length > 0) {
        log.header(`Direct Dependencies (${graph.direct.length}):`);
        for (const dep of graph.direct) {
          log.info(`  📄 ${dep.name} (${dep.type}) - Quality: ${dep.quality.score}/10`);
        }
      }

      if (graph.indirect.length > 0) {
        log.header(`Indirect Dependencies (${graph.indirect.length}):`);
        for (const dep of graph.indirect.slice(0, 10)) { // Limit to 10 for readability
          log.info(`  📄 ${dep.name} (${dep.type}) - Quality: ${dep.quality.score}/10`);
        }
        if (graph.indirect.length > 10) {
          log.info(`  ... and ${graph.indirect.length - 10} more`);
        }
      }

      if (graph.dependents.length > 0) {
        log.header(`Dependents (${graph.dependents.length}):`);
        for (const dependent of graph.dependents) {
          log.info(`  📄 ${dependent.name} (${dependent.type}) - Quality: ${dependent.quality.score}/10`);
        }
      }

      if (graph.direct.length === 0 && graph.indirect.length === 0 && graph.dependents.length === 0) {
        log.info('No dependencies or dependents found.');
      }

    } catch (error) {
      log.error(`Dependency analysis failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

registryCommand
  .command('optimize')
  .description('Optimize registry by removing old entries')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const registry = new ContentRegistry(projectRoot);
      await registry.load();

      const beforeStats = registry.getStats();
      
      log.header('Registry Optimization');
      log.info(`Before: ${beforeStats.totalItems} items`);

      await registry.optimize();

      const afterStats = registry.getStats();
      log.info(`After: ${afterStats.totalItems} items`);
      log.success(`Removed ${beforeStats.totalItems - afterStats.totalItems} old entries`);

    } catch (error) {
      log.error(`Optimization failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
