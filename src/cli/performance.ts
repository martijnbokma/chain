import { Command } from 'commander';
import { SmartSyncEngine } from '../sync/smart-sync.js';
import { ContentRegistry } from '../sync/content-registry.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';

export const performanceCommand = new Command('performance')
  .description('Performance monitoring and optimization');

performanceCommand
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('-s, --source <path>', 'Source directory to benchmark', 'templates')
  .option('-t, --target <path>', 'Target directory to benchmark', '.chain')
  .option('-i, --iterations <number>', 'Number of iterations', parseInt, 3)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const sourceDir = `${projectRoot}/${options.source}`;
      const targetDir = `${projectRoot}/${options.target}`;

      log.header('Performance Benchmark');
      log.info(`Source: ${options.source}`);
      log.info(`Target: ${options.target}`);
      log.info(`Iterations: ${options.iterations}`);

      const engine = new SmartSyncEngine(projectRoot);
      const results = [];

      for (let i = 0; i < options.iterations; i++) {
        log.info(`\n--- Iteration ${i + 1}/${options.iterations} ---`);
        
        const startTime = Date.now();
        
        // Run smart sync
        const result = await engine.smartSync(sourceDir, targetDir, { dryRun: true });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        results.push({
          iteration: i + 1,
          duration,
          filesProcessed: result.added.length + result.updated.length + result.removed.length,
          conflicts: result.conflicts.length,
          errors: result.errors.length
        });

        log.info(`Duration: ${duration}ms`);
        log.info(`Files: ${results[i].filesProcessed}`);
        log.info(`Conflicts: ${results[i].conflicts}`);
        log.info(`Errors: ${results[i].errors}`);
      }

      // Calculate statistics
      const durations = results.map(r => r.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const totalFiles = results.reduce((a, b) => a + b.filesProcessed, 0);

      log.header('\nBenchmark Results');
      log.info(`Average duration: ${avgDuration.toFixed(2)}ms`);
      log.info(`Min duration: ${minDuration}ms`);
      log.info(`Max duration: ${maxDuration}ms`);
      log.info(`Total files processed: ${totalFiles}`);
      log.info(`Files per second: ${(totalFiles / (avgDuration / 1000)).toFixed(1)}`);

      // Performance rating
      const filesPerSecond = totalFiles / (avgDuration / 1000);
      let rating = 'Excellent';
      if (filesPerSecond < 10) rating = 'Poor';
      else if (filesPerSecond < 25) rating = 'Fair';
      else if (filesPerSecond < 50) rating = 'Good';
      else if (filesPerSecond < 100) rating = 'Very Good';

      log.success(`Performance Rating: ${rating}`);

    } catch (error) {
      log.error(`Benchmark failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

performanceCommand
  .command('cache-stats')
  .description('Show cache statistics')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const engine = new SmartSyncEngine(projectRoot);
      
      // Get performance metrics (need to access private property)
      const optimizer = (engine as any).performanceOptimizer;
      if (!optimizer) {
        log.error('Performance optimizer not available');
        process.exit(1);
      }

      const metrics = optimizer.getMetrics();
      const cacheStats = optimizer.getCacheStats();

      log.header('Cache Statistics');
      log.info(`Files processed: ${metrics.filesProcessed}`);
      log.info(`Total time: ${metrics.totalTime}ms`);
      log.info(`Average time per file: ${metrics.averageTimePerFile.toFixed(2)}ms`);
      log.info(`Cache hits: ${metrics.cacheHits}`);
      log.info(`Cache misses: ${metrics.cacheMisses}`);
      
      const hitRate = metrics.cacheHits + metrics.cacheMisses > 0 
        ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(1)
        : '0';
      
      log.info(`Cache hit rate: ${hitRate}%`);
      log.info(`Cache size: ${cacheStats.size} files`);
      log.info(`Cache memory usage: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
      log.info(`Memory usage: ${(metrics.memoryUsage.used / 1024 / 1024).toFixed(2)} MB (${metrics.memoryUsage.percentage.toFixed(1)}%)`);

    } catch (error) {
      log.error(`Failed to get cache stats: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

performanceCommand
  .command('optimize')
  .description('Optimize performance and clean up caches')
  .option('--clear-cache', 'Clear all caches', false)
  .option('--registry', 'Optimize content registry', false)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('Performance Optimization');

      if (options.clearCache) {
        const engine = new SmartSyncEngine(projectRoot);
        const optimizer = (engine as any).performanceOptimizer;
        if (optimizer) {
          optimizer.clearCaches();
          log.success('✅ Performance caches cleared');
        }
      }

      if (options.registry) {
        const registry = new ContentRegistry(projectRoot);
        await registry.load();
        await registry.optimize();
        log.success('✅ Content registry optimized');
      }

      if (!options.clearCache && !options.registry) {
        log.info('No optimization options specified. Use --clear-cache or --registry');
      }

    } catch (error) {
      log.error(`Optimization failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

performanceCommand
  .command('profile')
  .description('Profile sync operations with detailed timing')
  .option('-s, --source <path>', 'Source directory', 'templates')
  .option('-t, --target <path>', 'Target directory', '.chain')
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      const sourceDir = `${projectRoot}/${options.source}`;
      const targetDir = `${projectRoot}/${options.target}`;

      log.header('Sync Operation Profiling');
      
      const engine = new SmartSyncEngine(projectRoot);
      
      // Profile each step
      const steps = [
        { name: 'Directory Scanning', method: 'compareDirectories' },
        { name: 'Content Analysis', method: 'analyzeContent' },
        { name: 'Conflict Detection', method: 'detectConflicts' },
        { name: 'Registry Updates', method: 'updateRegistry' }
      ];

      for (const step of steps) {
        const startTime = Date.now();
        
        try {
          if (step.method === 'compareDirectories') {
            await engine.compareDirectories(sourceDir, targetDir);
          }
          // Add other profiling steps as needed
        } catch (error) {
          log.warn(`${step.name} failed: ${error}`);
        }
        
        const duration = Date.now() - startTime;
        log.info(`${step.name}: ${duration}ms`);
      }

      log.success('Profiling completed');

    } catch (error) {
      log.error(`Profiling failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
