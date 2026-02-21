import { join, relative } from 'path';
import { SmartSyncEngine } from './smart-sync.js';
import { ContentRegistry } from './content-registry.js';
import { SmartFileWatcher } from './performance-optimizer.js';
import { log } from '../utils/logger.js';
import { EventEmitter } from 'events';
import type {
  RealtimeSyncOptions,
  RealtimeSyncStats,
  SyncCompletedEvent,
  SyncEvent
} from './realtime-sync-types.js';

export type {
  RealtimeSyncOptions,
  RealtimeSyncStats,
  SyncCompletedEvent,
  SyncEvent
} from './realtime-sync-types.js';

/**
 * Real-time sync engine with file watching and instant synchronization
 */
export class RealtimeSyncEngine extends EventEmitter {
  private projectRoot: string;
  private smartSyncEngine: SmartSyncEngine;
  private contentRegistry: ContentRegistry;
  private fileWatcher: SmartFileWatcher;
  private options: RealtimeSyncOptions;
  private isRunning = false;
  private stats: RealtimeSyncStats;
  private syncQueue: Map<string, NodeJS.Timeout> = new Map();
  private startTime: Date;

  constructor(projectRoot: string, options: RealtimeSyncOptions) {
    super();
    this.projectRoot = projectRoot;
    this.options = {
      debounceDelay: 500,
      autoResolve: 'prompt',
      enableAI: true,
      batchSize: 5,
      ...options
    };
    
    this.smartSyncEngine = new SmartSyncEngine(projectRoot);
    this.contentRegistry = new ContentRegistry(projectRoot);
    this.fileWatcher = new SmartFileWatcher((filePath) => this.handleFileChange(filePath));
    
    this.stats = {
      filesWatched: 0,
      eventsProcessed: 0,
      syncsPerformed: 0,
      conflictsResolved: 0,
      averageSyncTime: 0,
      uptime: 0
    };
    
    this.startTime = new Date();
  }

  /**
   * Start real-time sync
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      log.warn('Real-time sync is already running');
      return;
    }

    try {
      log.header('Starting Real-time Sync');
      log.info(`Source: ${this.options.sourceDir}`);
      log.info(`Target: ${this.options.targetDir}`);
      log.info(`Debounce delay: ${this.options.debounceDelay}ms`);
      log.info(`Auto-resolve: ${this.options.autoResolve}`);
      log.info(`AI enabled: ${this.options.enableAI}`);

      // Initialize registry
      await this.contentRegistry.load();

      // Start watching directories
      await this.fileWatcher.watchDirectory(join(this.projectRoot, this.options.sourceDir));
      await this.fileWatcher.watchDirectory(join(this.projectRoot, this.options.targetDir));

      this.isRunning = true;
      this.startTime = new Date();

      // Perform initial sync
      await this.performInitialSync();

      // Start stats reporting
      this.startStatsReporting();

      log.success('✅ Real-time sync started successfully');
      this.emit('started');

    } catch (error) {
      log.error(`Failed to start real-time sync: ${error}`);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop real-time sync
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      log.warn('Real-time sync is not running');
      return;
    }

    try {
      log.info('Stopping real-time sync...');

      // Stop file watcher
      await this.fileWatcher.stopAll();

      // Clear sync queue
      for (const timeout of this.syncQueue.values()) {
        clearTimeout(timeout);
      }
      this.syncQueue.clear();

      this.isRunning = false;

      // Final stats
      this.updateStats();
      log.success('✅ Real-time sync stopped');
      this.emit('stopped');

    } catch (error) {
      log.error(`Failed to stop real-time sync: ${error}`);
      this.emit('error', error);
    }
  }

  /**
   * Handle file change events
   */
  private async handleFileChange(filePath: string): Promise<void> {
    if (!this.isRunning) return;

    this.stats.eventsProcessed++;

    // Determine event type
    const relativePath = relative(this.projectRoot, filePath);
    const isSource = relativePath.startsWith(this.options.sourceDir);
    const isTarget = relativePath.startsWith(this.options.targetDir);

    if (!isSource && !isTarget) return;

    // Debounce rapid changes
    const existingTimeout = this.syncQueue.get(filePath);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(async () => {
      await this.processFileChange(filePath, isSource ? 'source' : 'target');
      this.syncQueue.delete(filePath);
    }, this.options.debounceDelay);

    this.syncQueue.set(filePath, timeout);

    log.info(`📝 File changed: ${relativePath}`);
  }

  /**
   * Process individual file change
   */
  private async processFileChange(filePath: string, source: 'source' | 'target'): Promise<void> {
    try {
      const startTime = Date.now();

      // Perform smart sync for this specific file
      const sourceDir = join(this.projectRoot, this.options.sourceDir);
      const targetDir = join(this.projectRoot, this.options.targetDir);

      const result = await this.smartSyncEngine.smartSync(sourceDir, targetDir, {
        dryRun: false,
        resolveConflicts: this.options.autoResolve,
        preserveMetadata: true
      });

      const duration = Date.now() - startTime;
      this.updateStats(duration);

      // Emit sync event
      const syncEvent: SyncCompletedEvent = {
        type: 'sync',
        filePath,
        duration,
        result
      };
      this.emit('sync', syncEvent);

      log.info(`⚡ Sync completed: ${relative(this.projectRoot, filePath)} (${duration}ms)`);

    } catch (error) {
      log.error(`Failed to sync ${filePath}: ${error}`);
      this.emit('error', error);
    }
  }

  /**
   * Perform initial sync when starting
   */
  private async performInitialSync(): Promise<void> {
    try {
      log.info('Performing initial sync...');

      const sourceDir = join(this.projectRoot, this.options.sourceDir);
      const targetDir = join(this.projectRoot, this.options.targetDir);

      const result = await this.smartSyncEngine.smartSync(sourceDir, targetDir, {
        dryRun: false,
        resolveConflicts: this.options.autoResolve,
        preserveMetadata: true
      });

      log.info(`Initial sync completed:`);
      log.info(`  Added: ${result.added.length} files`);
      log.info(`  Updated: ${result.updated.length} files`);
      log.info(`  Removed: ${result.removed.length} files`);
      log.info(`  Conflicts: ${result.conflicts.length} files`);

      this.emit('initial-sync', result);

    } catch (error) {
      log.error(`Initial sync failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get current statistics
   */
  getStats(): RealtimeSyncStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Update statistics
   */
  private updateStats(duration?: number): void {
    if (duration) {
      this.stats.syncsPerformed++;
      this.stats.averageSyncTime = 
        (this.stats.averageSyncTime * (this.stats.syncsPerformed - 1) + duration) / 
        this.stats.syncsPerformed;
      this.stats.lastSync = new Date();
    }

    this.stats.uptime = Date.now() - this.startTime.getTime();
    
    // Get file watcher stats
    const watcherStats = this.fileWatcher.getStats();
    this.stats.filesWatched = watcherStats.watching;
  }

  /**
   * Start periodic stats reporting
   */
  private startStatsReporting(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      this.updateStats();
      
      log.info(`📊 Real-time Sync Stats:`);
      log.info(`   Files watched: ${this.stats.filesWatched}`);
      log.info(`   Events processed: ${this.stats.eventsProcessed}`);
      log.info(`   Syncs performed: ${this.stats.syncsPerformed}`);
      log.info(`   Average sync time: ${this.stats.averageSyncTime.toFixed(2)}ms`);
      log.info(`   Uptime: ${Math.floor(this.stats.uptime / 1000)}s`);
      
      if (this.stats.lastSync) {
        const timeSinceLastSync = Date.now() - this.stats.lastSync.getTime();
        log.info(`   Last sync: ${Math.floor(timeSinceLastSync / 1000)}s ago`);
      }

      this.emit('stats', this.stats);
    }, 30000); // Every 30 seconds
  }

  /**
   * Force sync specific file
   */
  async forceSyncFile(filePath: string): Promise<void> {
    const relativePath = relative(this.projectRoot, filePath);
    const isSource = relativePath.startsWith(this.options.sourceDir);
    
    if (isSource) {
      await this.processFileChange(filePath, 'source');
    } else {
      log.warn(`File ${filePath} is not in source directory`);
    }
  }

  /**
   * Force sync all files
   */
  async forceSyncAll(): Promise<void> {
    log.info('Forcing full sync...');
    await this.performInitialSync();
  }

  /**
   * Get sync queue status
   */
  getQueueStatus(): {
    pending: number;
    processing: string[];
  } {
    return {
      pending: this.syncQueue.size,
      processing: Array.from(this.syncQueue.keys())
    };
  }

  /**
   * Check if real-time sync is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
