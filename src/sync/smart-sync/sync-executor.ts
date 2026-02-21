import { readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { writeTextFile, ensureDir } from '../../utils/file-ops.js';
import { log } from '../../utils/logger.js';
import type { AIConflictResolver } from '../ai-conflict-resolver.js';
import type { ContentRegistry } from '../content-registry.js';
import type { ConflictDetails, ConflictResolutionOptions, MergeResult } from '../ai-conflict-resolver.js';
import type { DirectoryComparison } from '../smart-sync-types.js';
import type { SmartSyncResult, SyncContentMetadata } from '../smart-sync-types.js';

export interface SyncExecutorDeps {
  contentRegistry: ContentRegistry;
  conflictResolver: AIConflictResolver;
  getFileMetadata: (filePath: string) => Promise<{ path: string; hash: string } | undefined>;
  safeRemoveFile: (filePath: string) => Promise<void>;
}

export interface SyncExecutorOptions {
  dryRun?: boolean;
  resolveConflicts?: 'source' | 'target' | 'prompt';
}

/**
 * Executes sync operations: add, update, remove, and conflict resolution
 */
export class SyncExecutor {
  constructor(private deps: SyncExecutorDeps) {}

  async execute(
    comparison: DirectoryComparison,
    targetDir: string,
    options: SyncExecutorOptions,
    metadataCache: Map<string, SyncContentMetadata>,
  ): Promise<SmartSyncResult> {
    const result: SmartSyncResult = {
      added: [],
      updated: [],
      removed: [],
      conflicts: [],
      errors: [],
    };

    for (const addition of comparison.toAdd) {
      await this.processAddition(addition, targetDir, options, metadataCache, result);
    }

    for (const update of comparison.toUpdate) {
      await this.processUpdate(update, options, metadataCache, result);
    }

    for (const removal of comparison.toRemove) {
      await this.processRemoval(removal, options, result);
    }

    for (const conflict of comparison.conflicts) {
      await this.processConflict(conflict, options, metadataCache, result);
    }

    return result;
  }

  private async processAddition(
    addition: DirectoryComparison['toAdd'][0],
    targetDir: string,
    options: SyncExecutorOptions,
    metadataCache: Map<string, SyncContentMetadata>,
    result: SmartSyncResult,
  ): Promise<void> {
    if (!options.dryRun) {
      const targetPath = join(targetDir, addition.relativePath);
      await ensureDir(join(targetPath, '..'));
      await writeTextFile(targetPath, addition.content);
      await this.registerContent(addition.relativePath, addition.content, 'addition');
      metadataCache.set(addition.relativePath, {
        hash: this.calculateHash(addition.content),
        lastSync: new Date(),
        source: 'smart-sync',
        conflicts: 0,
      });
    }
    result.added.push(addition.relativePath);
    log.synced(`+ ${addition.relativePath}`, 'target');
  }

  private async processUpdate(
    update: DirectoryComparison['toUpdate'][0],
    options: SyncExecutorOptions,
    metadataCache: Map<string, SyncContentMetadata>,
    result: SmartSyncResult,
  ): Promise<void> {
    if (!options.dryRun) {
      await writeTextFile(update.targetPath, update.sourceContent);
      await this.registerContent(update.relativePath, update.sourceContent, 'update');
      metadataCache.set(update.relativePath, {
        hash: this.calculateHash(update.sourceContent),
        lastSync: new Date(),
        source: 'smart-sync',
        conflicts: 0,
      });
    }
    result.updated.push(update.relativePath);
    log.synced(`~ ${update.relativePath}`, 'updated');
  }

  private async processRemoval(
    removal: DirectoryComparison['toRemove'][0],
    options: SyncExecutorOptions,
    result: SmartSyncResult,
  ): Promise<void> {
    if (!options.dryRun) {
      try {
        await this.deps.safeRemoveFile(removal.targetPath);
        log.success(`Removed: ${removal.relativePath}`);
      } catch (error) {
        log.warn(
          `Failed to remove ${removal.relativePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    result.removed.push(removal.relativePath);
    log.synced(`- ${removal.relativePath}`, 'removed');
  }

  private async processConflict(
    conflict: DirectoryComparison['conflicts'][0],
    options: SyncExecutorOptions,
    metadataCache: Map<string, SyncContentMetadata>,
    result: SmartSyncResult,
  ): Promise<void> {
    if (options.resolveConflicts === 'source' || options.resolveConflicts === 'target') {
      if (options.resolveConflicts === 'source' && !options.dryRun) {
        const sourceContent = await readFile(conflict.sourcePath, 'utf8');
        await writeTextFile(conflict.targetPath, sourceContent);
        log.warn(`Resolved conflict using source: ${conflict.relativePath}`);
      } else if (options.resolveConflicts === 'target') {
        log.warn(`Resolved conflict using target: ${conflict.relativePath}`);
      }
      return;
    }

    const sourceMetadata = await this.deps.getFileMetadata(conflict.sourcePath);
    const targetMetadata = await this.deps.getFileMetadata(conflict.targetPath);
    if (!sourceMetadata || !targetMetadata) return;

    try {
      const conflictDetails = await Promise.race([
        this.deps.conflictResolver.detectConflict(conflict.sourcePath, conflict.targetPath),
        new Promise<ConflictDetails>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000),
        ),
      ]);

      const resolutionOptions: ConflictResolutionOptions = {
        strategy: 'ai-assisted',
        preferLocal: false,
        interactive: options.resolveConflicts === 'prompt',
      };

      const mergeResult = await Promise.race([
        this.deps.conflictResolver.performAIMerge(conflictDetails, resolutionOptions),
        new Promise<MergeResult>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000),
        ),
      ]);

      if (mergeResult.conflicts.length === 0 || options.resolveConflicts !== 'prompt') {
        if (!options.dryRun) {
          await writeTextFile(conflict.targetPath, mergeResult.mergedContent);
          log.info(
            `AI-resolved conflict: ${conflict.relativePath} (${mergeResult.confidence.toFixed(2)} confidence)`,
          );
        }
      } else {
        result.conflicts.push({
          path: conflict.relativePath,
          localHash: sourceMetadata.hash,
          remoteHash: targetMetadata.hash,
          reason: `${conflict.reason} - AI merge left ${mergeResult.conflicts.length} unresolved conflicts`,
        });
      }
    } catch {
      result.conflicts.push({
        path: conflict.relativePath,
        localHash: sourceMetadata.hash,
        remoteHash: targetMetadata.hash,
        reason: conflict.reason,
      });
    }
  }

  private calculateHash(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  private detectContentType(path: string): 'rule' | 'skill' | 'workflow' {
    if (path.includes('/rules/') || path.includes('rules/')) return 'rule';
    if (path.includes('/skills/') || path.includes('skills/')) return 'skill';
    if (path.includes('/workflows/') || path.includes('workflows/')) return 'workflow';
    return 'skill';
  }

  private async registerContent(
    relativePath: string,
    content: string,
    operation: 'addition' | 'update',
  ): Promise<void> {
    try {
      const type = this.detectContentType(relativePath);
      const source = operation === 'addition' ? 'local' : 'external';
      await this.deps.contentRegistry.registerContent(content, relativePath, type, { source });
    } catch (error) {
      log.warn(`Failed to register content ${relativePath}: ${error}`);
    }
  }
}
