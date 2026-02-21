import { readFile, stat, copyFile, unlink } from 'fs/promises';
import { join } from 'path';
import { ensureDir, writeTextFile } from '../../utils/file-ops.js';
import { log } from '../../utils/logger.js';
import { AIConflictResolver } from '../ai-conflict-resolver.js';
import { ContentRegistry } from '../content-registry.js';
import { PerformanceOptimizer, SmartFileWatcher } from '../performance-optimizer.js';
import { DirectoryComparator } from './directory-comparator.js';
import { SyncExecutor } from './sync-executor.js';
import type { ContentHash, SyncContentMetadata, SmartSyncResult } from '../smart-sync-types.js';

/**
 * Smart sync engine using content hashing instead of modification time
 */
export class SmartSyncEngine {
  private projectRoot: string;
  private metadataCache: Map<string, SyncContentMetadata> = new Map();
  private conflictResolver: AIConflictResolver;
  private contentRegistry: ContentRegistry;
  private performanceOptimizer: PerformanceOptimizer;
  private directoryComparator: DirectoryComparator;
  private syncExecutor: SyncExecutor;
  private fileWatcher?: SmartFileWatcher;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.conflictResolver = new AIConflictResolver(projectRoot);
    this.contentRegistry = new ContentRegistry(projectRoot);
    this.performanceOptimizer = new PerformanceOptimizer();
    this.directoryComparator = new DirectoryComparator({
      performanceOptimizer: this.performanceOptimizer,
    });
    this.syncExecutor = new SyncExecutor({
      contentRegistry: this.contentRegistry,
      conflictResolver: this.conflictResolver,
      getFileMetadata: this.getFileMetadata.bind(this),
      safeRemoveFile: this.safeRemoveFile.bind(this),
    });
    this.initializeRegistry();
  }

  private async initializeRegistry(): Promise<void> {
    try {
      await this.contentRegistry.load();
    } catch (error) {
      log.warn(`Failed to load content registry: ${error}`);
    }
  }

  async scanDirectory(dirPath: string): Promise<Map<string, ContentHash>> {
    return this.directoryComparator.scanDirectory(dirPath);
  }

  async compareDirectories(
    sourceDir: string,
    targetDir: string,
  ): Promise<{
    toAdd: Array<{ relativePath: string; sourcePath: string; content: string }>;
    toUpdate: Array<{
      relativePath: string;
      sourcePath: string;
      targetPath: string;
      sourceContent: string;
      targetContent: string;
    }>;
    toRemove: Array<{ relativePath: string; targetPath: string }>;
    conflicts: Array<{
      relativePath: string;
      sourcePath: string;
      targetPath: string;
      reason: string;
    }>;
  }> {
    return this.directoryComparator.compareDirectories(
      sourceDir,
      targetDir,
      this.metadataCache,
    );
  }

  async smartSync(
    sourceDir: string,
    targetDir: string,
    options: {
      dryRun?: boolean;
      resolveConflicts?: 'source' | 'target' | 'prompt';
      preserveMetadata?: boolean;
    } = {},
  ): Promise<SmartSyncResult> {
    try {
      const comparison = await this.compareDirectories(sourceDir, targetDir);
      const result = await this.syncExecutor.execute(
        comparison,
        targetDir,
        {
          dryRun: options.dryRun,
          resolveConflicts: options.resolveConflicts,
        },
        this.metadataCache,
      );
      return result;
    } catch (error) {
      const msg = `Smart sync failed: ${error instanceof Error ? error.message : error}`;
      log.error(msg);
      return {
        added: [],
        updated: [],
        removed: [],
        conflicts: [],
        errors: [msg],
      };
    } finally {
      try {
        await this.saveMetadata();
        if (this.fileWatcher) {
          await this.fileWatcher.stopAll();
        }
      } catch (cleanupError) {
        log.warn(`Cleanup warning: ${cleanupError}`);
      }
    }
  }

  async getSyncStatus(
    sourceDir: string,
    targetDir: string,
  ): Promise<{ ahead: number; behind: number; diverged: number; conflicts: number }> {
    const comparison = await this.compareDirectories(sourceDir, targetDir);
    return {
      ahead: comparison.toAdd.length + comparison.toUpdate.length,
      behind: comparison.toRemove.length,
      diverged: comparison.conflicts.length,
      conflicts: comparison.conflicts.length,
    };
  }

  async loadMetadata(): Promise<void> {
    try {
      const cacheFile = join(this.projectRoot, '.chain', 'smart-sync-metadata.json');
      const content = await readFile(cacheFile, 'utf-8');
      const metadata = JSON.parse(content);
      for (const [path, data] of Object.entries(metadata)) {
        this.metadataCache.set(path, data as SyncContentMetadata);
      }
      log.info(`Loaded metadata for ${this.metadataCache.size} files`);
    } catch {
      log.dim('No existing metadata cache found');
    }
  }

  async saveMetadata(): Promise<void> {
    try {
      const cacheDir = join(this.projectRoot, '.chain');
      await ensureDir(cacheDir);
      const cacheFile = join(cacheDir, 'smart-sync-metadata.json');
      const metadata = Object.fromEntries(this.metadataCache);
      await writeTextFile(cacheFile, JSON.stringify(metadata, null, 2));
      log.dim(`Saved metadata for ${this.metadataCache.size} files`);
    } catch (error) {
      log.warn(`Failed to save metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getFileMetadata(filePath: string): Promise<{ path: string; hash: string } | undefined> {
    const hash = await this.directoryComparator.getFileMetadata(filePath);
    return hash ? { path: hash.path, hash: hash.hash } : undefined;
  }

  private async safeRemoveFile(filePath: string): Promise<void> {
    try {
      await stat(filePath);
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await copyFile(filePath, backupPath);
      await unlink(filePath);
      log.dim(`Created backup: ${backupPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        log.warn(`File not found: ${filePath}`);
        return;
      }
      throw error;
    }
  }
}
