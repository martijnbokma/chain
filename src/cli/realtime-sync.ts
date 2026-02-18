import { Command } from 'commander';
import { RealtimeSyncEngine } from '../sync/realtime-sync.js';
import { log } from '../utils/logger.js';
import { findProjectRoot } from '../utils/file-ops.js';

export const realtimeSyncCommand = new Command('realtime-sync')
  .description('Real-time sync with file watching');

realtimeSyncCommand
  .command('start')
  .description('Start real-time sync')
  .option('-s, --source <path>', 'Source directory', 'templates')
  .option('-t, --target <path>', 'Target directory', '.chain')
  .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', parseInt)
  .option('-r, --resolve <strategy>', 'Conflict resolution strategy', 'prompt')
  .option('--no-ai', 'Disable AI-assisted conflict resolution')
  .option('-b, --batch <size>', 'Batch size for processing', parseInt)
  .option('--stats', 'Show detailed statistics', false)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('Real-time Sync Starting...');

      const syncEngine = new RealtimeSyncEngine(projectRoot, {
        sourceDir: options.source,
        targetDir: options.target,
        debounceDelay: options.debounce,
        autoResolve: options.resolve,
        enableAI: options.ai,
        batchSize: options.batch
      });

      // Set up event listeners
      syncEngine.on('started', () => {
        log.success('✅ Real-time sync is now active');
        log.info('Press Ctrl+C to stop');
      });

      syncEngine.on('sync', (event) => {
        if (options.stats) {
          log.info(`⚡ Synced: ${event.filePath} (${event.duration}ms)`);
        }
      });

      syncEngine.on('error', (error) => {
        log.error(`Sync error: ${error}`);
      });

      syncEngine.on('stats', (stats) => {
        if (options.stats) {
          // Stats are already logged by the engine
        }
      });

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        log.info('\n🛑 Stopping real-time sync...');
        await syncEngine.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        log.info('\n🛑 Stopping real-time sync...');
        await syncEngine.stop();
        process.exit(0);
      });

      // Start the sync engine
      await syncEngine.start();

      // Keep the process running
      process.stdin.resume();

    } catch (error) {
      log.error(`Failed to start real-time sync: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

realtimeSyncCommand
  .command('status')
  .description('Show real-time sync status')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('Real-time Sync Status');
      log.info('Real-time sync is not running (use "realtime-sync start" to begin)');

    } catch (error) {
      log.error(`Failed to get status: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

realtimeSyncCommand
  .command('test')
  .description('Test real-time sync with a temporary file')
  .option('-s, --source <path>', 'Source directory', 'templates')
  .option('-t, --target <path>', 'Target directory', '.chain')
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('Testing Real-time Sync');

      const syncEngine = new RealtimeSyncEngine(projectRoot, {
        sourceDir: options.source,
        targetDir: options.target,
        debounceDelay: 100, // Short delay for testing
        autoResolve: 'source',
        enableAI: false,
        batchSize: 1
      });

      // Create test file
      const testFilePath = `${projectRoot}/${options.source}/test-realtime-sync.md`;
      const testContent = `# Test Real-time Sync
Created: ${new Date().toISOString()}
This is a test file for real-time sync functionality.

## Purpose
Test that file changes are detected and synced immediately.

## Expected Behavior
- File should be detected when created
- Should be synced to target directory
- Changes should trigger immediate sync
`;

      log.info(`Creating test file: ${testFilePath}`);

      // Set up event listener
      let syncDetected = false;
      syncEngine.on('sync', (event) => {
        if (event.filePath.includes('test-realtime-sync')) {
          syncDetected = true;
          log.success(`✅ Sync detected: ${event.filePath} (${event.duration}ms)`);
        }
      });

      // Start sync engine
      await syncEngine.start();

      // Wait a bit for startup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Write test file
      await import('fs/promises').then(({ writeFile }) => 
        writeFile(testFilePath, testContent)
      );

      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update file
      const updatedContent = testContent + '\n\n## Update\nThis content was added to test update detection.\n';
      await import('fs/promises').then(({ writeFile }) => 
        writeFile(testFilePath, updatedContent)
      );

      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clean up
      await import('fs/promises').then(({ unlink }) => 
        unlink(testFilePath).catch(() => {}) // Ignore errors
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stop sync engine
      await syncEngine.stop();

      if (syncDetected) {
        log.success('✅ Real-time sync test passed!');
      } else {
        log.warn('⚠️  No sync events detected (this might be normal)');
      }

    } catch (error) {
      log.error(`Test failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

realtimeSyncCommand
  .command('monitor')
  .description('Monitor file changes without syncing')
  .option('-s, --source <path>', 'Source directory', 'templates')
  .option('-t, --target <path>', 'Target directory', '.chain')
  .option('-d, --duration <seconds>', 'Monitor duration in seconds', parseInt)
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        log.error('Not an Chain project (no chain.yaml found)');
        process.exit(1);
      }

      log.header('File Change Monitor');
      log.info(`Monitoring: ${options.source} and ${options.target}`);
      log.info(`Duration: ${options.duration || 'infinite'} seconds`);
      log.info('Press Ctrl+C to stop early');

      const syncEngine = new RealtimeSyncEngine(projectRoot, {
        sourceDir: options.source,
        targetDir: options.target,
        debounceDelay: 200,
        autoResolve: 'source',
        enableAI: false
      });

      let changeCount = 0;

      syncEngine.on('sync', (event) => {
        changeCount++;
        log.info(`📝 Change ${changeCount}: ${event.filePath}`);
      });

      await syncEngine.start();

      // Stop after duration if specified
      if (options.duration) {
        setTimeout(async () => {
          log.info(`\n⏱️  Monitor duration reached (${options.duration}s)`);
          await syncEngine.stop();
          process.exit(0);
        }, options.duration * 1000);
      }

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        log.info(`\n🛑 Monitor stopped. Total changes detected: ${changeCount}`);
        await syncEngine.stop();
        process.exit(0);
      });

      process.stdin.resume();

    } catch (error) {
      log.error(`Monitor failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
