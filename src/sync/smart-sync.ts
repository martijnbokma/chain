import { createHash } from 'crypto';
import { stat, readFile, copyFile, unlink } from 'fs/promises';
import { join, relative } from 'path';
import type { ContentFile, SyncResult, SyncOptions } from '../core/types.js';
import { findMarkdownFiles, writeTextFile, ensureDir } from '../utils/file-ops.js';
import { log } from '../utils/logger.js';
import { AIConflictResolver, ConflictDetails, ConflictResolutionOptions } from './ai-conflict-resolver.js';
import { ContentRegistry, ContentMetadata as RegistryContentMetadata } from './content-registry.js';
import { PerformanceOptimizer, SmartFileWatcher } from './performance-optimizer.js';

interface ContentHash {
  path: string;
  relativePath: string;
  hash: string;
  mtime: Date;
  size: number;
}

interface SyncContentMetadata {
  hash: string;
  lastSync?: Date;
  source?: string;
  quality?: number;
  conflicts?: number;
}

interface SmartSyncResult {
  added: string[];
  updated: string[];
  removed: string[];
  conflicts: Array<{
    path: string;
    localHash: string;
    remoteHash: string;
    reason: string;
  }>;
  errors: string[];
}

/**
 * Smart sync engine using content hashing instead of modification time
 */
export class SmartSyncEngine {
  private projectRoot: string;
  private hashCache: Map<string, ContentHash> = new Map();
  private metadataCache: Map<string, SyncContentMetadata> = new Map();
  private conflictResolver: AIConflictResolver;
  private contentRegistry: ContentRegistry;
  private performanceOptimizer: PerformanceOptimizer;
  private fileWatcher?: SmartFileWatcher;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.conflictResolver = new AIConflictResolver(projectRoot);
    this.contentRegistry = new ContentRegistry(projectRoot);
    this.performanceOptimizer = new PerformanceOptimizer();
    this.initializeRegistry();
  }

  /**
   * Initialize content registry
   */
  private async initializeRegistry(): Promise<void> {
    try {
      await this.contentRegistry.load();
    } catch (error) {
      log.warn(`Failed to load content registry: ${error}`);
    }
  }

  /**
   * Calculate SHA-256 hash of file content
   */
  private async calculateHash(content: string): Promise<string> {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Scan directory with performance optimization
   */
  async scanDirectory(dirPath: string): Promise<Map<string, ContentHash>> {
    const files = await findMarkdownFiles(dirPath, dirPath);
    const fileMap = new Map<string, ContentHash>();
    
    // Process files in parallel with performance optimization
    const results = await this.performanceOptimizer.processFilesInParallel<ContentHash>(
      files.map(f => f.absolutePath),
      async (filePath, content) => {
        const stats = await stat(filePath);
        const hash = this.performanceOptimizer.calculateHash(content);
        
        return {
          path: filePath, // Store full path for file operations
          relativePath: relative(dirPath, filePath), // Store relative path for comparisons
          hash,
          mtime: stats.mtime,
          size: content.length
        };
      },
      {
        batchSize: 20,
        maxConcurrency: 10,
        progressCallback: (completed, total) => {
          if (completed % 10 === 0 || completed === total) {
            log.info(`Scanning: ${completed}/${total} files`);
          }
        }
      }
    );

    // Convert to Map using relativePath as key
    for (const result of results) {
      if (result && result.relativePath) {
        fileMap.set(result.relativePath, result);
      }
    }

    return fileMap;
  }

  /**
   * Get file metadata
   */
  private async getFileMetadata(filePath: string): Promise<ContentHash | undefined> {
    try {
      const content = await this.performanceOptimizer.readFileWithCache(filePath);
      const stats = await stat(filePath);
      const hash = this.performanceOptimizer.calculateHash(content.content);
      
      return {
        path: filePath,
        relativePath: filePath, // Will be set by caller if needed
        hash,
        mtime: stats.mtime,
        size: content.content.length
      };
    } catch (error) {
      log.warn(`Failed to get metadata for ${filePath}: ${error}`);
      return undefined;
    }
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      await stat(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compare two directories and detect changes
   */
  async compareDirectories(
    sourceDir: string,
    targetDir: string
  ): Promise<{
    toAdd: Array<{ relativePath: string; sourcePath: string; content: string }>;
    toUpdate: Array<{ relativePath: string; sourcePath: string; targetPath: string; sourceContent: string; targetContent: string }>;
    toRemove: Array<{ relativePath: string; targetPath: string }>;
    conflicts: Array<{ relativePath: string; sourcePath: string; targetPath: string; reason: string }>;
  }> {
    const sourceFiles = await this.scanDirectory(sourceDir);
    const targetFiles = await this.scanDirectory(targetDir);

    const result = {
      toAdd: [] as Array<{ relativePath: string; sourcePath: string; content: string }>,
      toUpdate: [] as Array<{ relativePath: string; sourcePath: string; targetPath: string; sourceContent: string; targetContent: string }>,
      toRemove: [] as Array<{ relativePath: string; targetPath: string }>,
      conflicts: [] as Array<{ relativePath: string; sourcePath: string; targetPath: string; reason: string }>
    };

    // Files to add (exist in source, not in target)
    for (const [relativePath, sourceFile] of sourceFiles) {
      if (!targetFiles.has(relativePath)) {
        const content = await readFile(sourceFile.path, 'utf8');
        result.toAdd.push({
          relativePath,
          sourcePath: sourceFile.path,
          content
        });
      }
    }

    // Files to remove (exist in target, not in source)
    for (const [relativePath, targetFile] of targetFiles) {
      if (!sourceFiles.has(relativePath)) {
        result.toRemove.push({
          relativePath,
          targetPath: targetFile.path
        });
      }
    }

    // Files to update or conflicts (exist in both)
    for (const [relativePath, sourceFile] of sourceFiles) {
      const targetFile = targetFiles.get(relativePath);
      if (targetFile) {
        if (sourceFile.hash !== targetFile.hash) {
          // Content differs - check if it's a conflict
          const sourceContent = await readFile(sourceFile.path, 'utf8');
          const targetContent = await readFile(targetFile.path, 'utf8');
          
          // Simple conflict detection: if both files changed since last sync
          const sourceMetadata = this.metadataCache.get(relativePath);
          const targetMetadata = this.metadataCache.get(`target:${relativePath}`);
          
          if (sourceMetadata && targetMetadata && 
              sourceFile.mtime > sourceMetadata.lastSync! && 
              targetFile.mtime > targetMetadata.lastSync!) {
            // Both changed - conflict!
            result.conflicts.push({
              relativePath,
              sourcePath: sourceFile.path,
              targetPath: targetFile.path,
              reason: 'Both files modified since last sync'
            });
          } else {
            // Regular update
            result.toUpdate.push({
              relativePath,
              sourcePath: sourceFile.path,
              targetPath: targetFile.path,
              sourceContent,
              targetContent
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Perform smart sync between two directories
   */
  async smartSync(
    sourceDir: string,
    targetDir: string,
    options: {
      dryRun?: boolean;
      resolveConflicts?: 'source' | 'target' | 'prompt';
      preserveMetadata?: boolean;
    } = {}
  ): Promise<SmartSyncResult> {
    const result: SmartSyncResult = {
      added: [],
      updated: [],
      removed: [],
      conflicts: [],
      errors: []
    };

    try {
      const comparison = await this.compareDirectories(sourceDir, targetDir);
      
      // Process additions
      for (const addition of comparison.toAdd) {
        if (!options.dryRun) {
          const targetPath = join(targetDir, addition.relativePath);
          await ensureDir(join(targetPath, '..'));
          await writeTextFile(targetPath, addition.content);
          
          // Register content in registry
          await this.registerContent(addition.relativePath, addition.content, 'addition');
          
          // Update metadata
          this.metadataCache.set(addition.relativePath, {
            hash: await this.calculateHash(addition.content),
            lastSync: new Date(),
            source: 'smart-sync',
            quality: undefined,
            conflicts: 0
          });
        }
        result.added.push(addition.relativePath);
        log.synced(`+ ${addition.relativePath}`, 'target');
      }

      // Process updates
      for (const update of comparison.toUpdate) {
        if (!options.dryRun) {
          await writeTextFile(update.targetPath, update.sourceContent);
          
          // Register updated content in registry
          await this.registerContent(update.relativePath, update.sourceContent, 'update');
          
          // Update metadata
          this.metadataCache.set(update.relativePath, {
            hash: await this.calculateHash(update.sourceContent),
            lastSync: new Date(),
            source: 'smart-sync',
            quality: undefined,
            conflicts: 0
          });
        }
        result.updated.push(update.relativePath);
        log.synced(`~ ${update.relativePath}`, 'updated');
      }

      // Process removals
      for (const removal of comparison.toRemove) {
        if (!options.dryRun) {
          try {
            // Safe file removal with backup
            await this.safeRemoveFile(removal.targetPath);
            log.success(`Removed: ${removal.relativePath}`);
          } catch (error) {
            log.warn(`Failed to remove ${removal.relativePath}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        result.removed.push(removal.relativePath);
        log.synced(`- ${removal.relativePath}`, 'removed');
      }

      // Process conflicts
      for (const conflict of comparison.conflicts) {
        // Skip AI resolution when we have a clear strategy
        if (options.resolveConflicts === 'source' || options.resolveConflicts === 'target') {
          if (options.resolveConflicts === 'source' && !options.dryRun) {
            const sourceContent = await readFile(conflict.sourcePath, 'utf8');
            await writeTextFile(conflict.targetPath, sourceContent);
            log.warn(`Resolved conflict using source: ${conflict.relativePath}`);
          } else if (options.resolveConflicts === 'target') {
            log.warn(`Resolved conflict using target: ${conflict.relativePath}`);
          }
          continue;
        }

        const sourceMetadata = await this.getFileMetadata(conflict.sourcePath);
        const targetMetadata = await this.getFileMetadata(conflict.targetPath);
        
        if (sourceMetadata && targetMetadata) {
          // Try AI conflict resolution with timeout
          try {
            const conflictDetails = await Promise.race([
              this.conflictResolver.detectConflict(conflict.sourcePath, conflict.targetPath),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]) as any;
            
            const resolutionOptions: ConflictResolutionOptions = {
              strategy: (options.resolveConflicts as any === 'source' || options.resolveConflicts as any === 'target') ? 'auto' : 'ai-assisted',
              preferLocal: options.resolveConflicts as any === 'source',
              interactive: options.resolveConflicts === 'prompt'
            };

            const mergeResult = await Promise.race([
              this.conflictResolver.performAIMerge(conflictDetails, resolutionOptions),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]) as any;

            if (mergeResult.conflicts.length === 0 || options.resolveConflicts !== 'prompt') {
              // Apply the merge result
              if (!options.dryRun) {
                await writeTextFile(conflict.targetPath, mergeResult.mergedContent);
                log.info(`AI-resolved conflict: ${conflict.relativePath} (${mergeResult.confidence.toFixed(2)} confidence)`);
              }
            } else {
              // Still has conflicts - add to conflicts list
              result.conflicts.push({
                path: conflict.relativePath,
                localHash: sourceMetadata.hash,
                remoteHash: targetMetadata.hash,
                reason: `${conflict.reason} - AI merge left ${mergeResult.conflicts.length} unresolved conflicts`
              });
            }
          } catch (error) {
            // Fallback to simple conflict detection
            result.conflicts.push({
              path: conflict.relativePath,
              localHash: sourceMetadata.hash,
              remoteHash: targetMetadata.hash,
              reason: conflict.reason
            });
          }
        }
      }

    } catch (error) {
      const msg = `Smart sync failed: ${error instanceof Error ? error.message : error}`;
      log.error(msg);
      result.errors.push(msg);
    } finally {
      // Force cleanup and exit
      try {
        await this.saveMetadata();
        if (this.fileWatcher) {
          await this.fileWatcher.stopAll();
        }
      } catch (cleanupError) {
        log.warn(`Cleanup warning: ${cleanupError}`);
      }
    }

    return result;
  }

  /**
   * Get sync status summary
   */
  async getSyncStatus(sourceDir: string, targetDir: string): Promise<{
    ahead: number;
    behind: number;
    diverged: number;
    conflicts: number;
  }> {
    const comparison = await this.compareDirectories(sourceDir, targetDir);
    
    return {
      ahead: comparison.toAdd.length + comparison.toUpdate.length,
      behind: comparison.toRemove.length,
      diverged: comparison.conflicts.length,
      conflicts: comparison.conflicts.length
    };
  }

  /**
   * Load metadata from cache file
   */
  async loadMetadata(): Promise<void> {
    try {
      const cacheFile = join(this.projectRoot, '.chain', 'smart-sync-metadata.json');
      const content = await readFile(cacheFile, 'utf-8');
      const metadata = JSON.parse(content);
      
      // Restore metadata cache
      for (const [path, data] of Object.entries(metadata)) {
        this.metadataCache.set(path, data as SyncContentMetadata);
      }
      
      log.info(`Loaded metadata for ${this.metadataCache.size} files`);
    } catch (error) {
      // Cache file doesn't exist or is invalid - start fresh
      log.dim('No existing metadata cache found');
    }
  }

  /**
   * Save metadata to cache file
   */
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

  /**
   * Safe file removal with backup
   */
  private async safeRemoveFile(filePath: string): Promise<void> {
    try {
      // Check if file exists before removal
      await stat(filePath);
      
      // Create backup before removal (optional - could be configurable)
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await copyFile(filePath, backupPath);
      
      // Remove the original file
      await unlink(filePath);
      
      log.dim(`Created backup: ${backupPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        log.warn(`File not found: ${filePath}`);
        return; // File doesn't exist, consider it "removed"
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Register content in the global registry
   */
  private async registerContent(relativePath: string, content: string, operation: 'addition' | 'update'): Promise<void> {
    try {
      const type = this.detectContentType(relativePath);
      const source = operation === 'addition' ? 'local' : 'external';
      
      await this.contentRegistry.registerContent(
        content,
        relativePath,
        type,
        { source }
      );
    } catch (error) {
      log.warn(`Failed to register content ${relativePath}: ${error}`);
    }
  }

  /**
   * Detect content type from path
   */
  private detectContentType(path: string): 'rule' | 'skill' | 'workflow' {
    if (path.includes('/rules/') || path.includes('rules/')) return 'rule';
    if (path.includes('/skills/') || path.includes('skills/')) return 'skill';
    if (path.includes('/workflows/') || path.includes('workflows/')) return 'workflow';
    return 'skill'; // default
  }
}
