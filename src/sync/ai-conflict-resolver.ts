import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { log } from '../utils/logger.js';
import type {
  ConflictDetails,
  ConflictResolutionOptions,
  MergeResult
} from './ai-conflict-resolver-types.js';

export type {
  ConflictDetails,
  ConflictResolutionOptions,
  MergeResult
} from './ai-conflict-resolver-types.js';

/**
 * AI-powered conflict resolution with 3-way merge capabilities
 */
export class AIConflictResolver {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Calculate SHA-256 hash of content
   */
  private calculateHash(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Detect conflict type and prepare for resolution
   */
  async detectConflict(
    localPath: string,
    remotePath: string,
    basePath?: string
  ): Promise<ConflictDetails> {
    const localContent = await readFile(localPath, 'utf8');
    const remoteContent = await readFile(remotePath, 'utf8');
    const baseContent = basePath ? await readFile(basePath, 'utf8').catch(() => '') : '';

    const localHash = this.calculateHash(localContent);
    const remoteHash = this.calculateHash(remoteContent);
    const baseHash = baseContent ? this.calculateHash(baseContent) : '';

    // Determine conflict type
    let changeType: ConflictDetails['changeType'];
    
    if (baseContent && localHash !== baseHash && remoteHash !== baseHash) {
      changeType = 'both-modified';
    } else if (localHash === remoteHash) {
      // No actual conflict - identical content
      changeType = 'content-conflict';
    } else {
      changeType = 'structural-conflict';
    }

    return {
      path: basename(localPath),
      localContent,
      remoteContent,
      baseContent: baseContent || undefined,
      localHash,
      remoteHash,
      baseHash: baseHash || undefined,
      changeType
    };
  }

  /**
   * Perform AI-assisted 3-way merge
   */
  async performAIMerge(
    conflict: ConflictDetails,
    options: ConflictResolutionOptions = { strategy: 'ai-assisted' }
  ): Promise<MergeResult> {
    const { localContent, remoteContent, baseContent, changeType } = conflict;

    // Simple AI merge logic (can be enhanced with actual AI integration)
    const result = await this.analyzeAndMerge(conflict, options);

    return result;
  }

  /**
   * Analyze conflict and attempt intelligent merge
   */
  private async analyzeAndMerge(
    conflict: ConflictDetails,
    options: ConflictResolutionOptions
  ): Promise<MergeResult> {
    const { localContent, remoteContent, baseContent, changeType } = conflict;
    
    switch (changeType) {
      case 'both-modified':
        return this.mergeBothModified(conflict, options);
      
      case 'content-conflict':
        return this.mergeContentConflict(conflict, options);
      
      case 'structural-conflict':
        return this.mergeStructuralConflict(conflict, options);
      
      default:
        throw new Error(`Unknown conflict type: ${changeType}`);
    }
  }

  /**
   * Handle both-modified conflicts with 3-way merge
   */
  private async mergeBothModified(
    conflict: ConflictDetails,
    options: ConflictResolutionOptions
  ): Promise<MergeResult> {
    const { localContent, remoteContent, baseContent } = conflict;

    // Simple 3-way merge algorithm
    const localLines = localContent.split('\n');
    const remoteLines = remoteContent.split('\n');
    const baseLines = baseContent!.split('\n');

    const mergedLines: string[] = [];
    const conflicts: string[] = [];
    let confidence = 1.0;

    for (let i = 0; i < Math.max(localLines.length, remoteLines.length, baseLines.length); i++) {
      const localLine = localLines[i] || '';
      const remoteLine = remoteLines[i] || '';
      const baseLine = baseLines[i] || '';

      if (localLine === baseLine && remoteLine === baseLine) {
        // No changes in either
        mergedLines.push(localLine);
      } else if (localLine === baseLine) {
        // Only remote changed
        mergedLines.push(remoteLine);
      } else if (remoteLine === baseLine) {
        // Only local changed
        mergedLines.push(localLine);
      } else if (localLine === remoteLine) {
        // Both changed to same thing
        mergedLines.push(localLine);
      } else {
        // Conflict - both changed differently
        const conflictMarker = `<<<<<<< LOCAL\n${localLine}\n=======\n${remoteLine}\n>>>>>>> REMOTE`;
        mergedLines.push(conflictMarker);
        conflicts.push(`Line ${i + 1}: Different changes`);
        confidence *= 0.8;
      }
    }

    const mergedContent = mergedLines.join('\n');

    return {
      mergedContent,
      conflicts,
      resolution: conflicts.length > 0 ? 'manual' : 'auto',
      confidence,
      explanation: `3-way merge completed with ${conflicts.length} conflicts`
    };
  }

  /**
   * Handle content conflicts (identical hashes)
   */
  private async mergeContentConflict(
    conflict: ConflictDetails,
    options: ConflictResolutionOptions
  ): Promise<MergeResult> {
    // Content is identical, no actual conflict
    return {
      mergedContent: conflict.localContent,
      conflicts: [],
      resolution: 'auto',
      confidence: 1.0,
      explanation: 'Content is identical - no conflict'
    };
  }

  /**
   * Handle structural conflicts
   */
  private async mergeStructuralConflict(
    conflict: ConflictDetails,
    options: ConflictResolutionOptions
  ): Promise<MergeResult> {
    const { localContent, remoteContent } = conflict;

    // Simple strategy: prefer one side based on options
    let mergedContent: string;
    let explanation: string;

    if (options.preferLocal) {
      mergedContent = localContent;
      explanation = 'Preferred local content';
    } else {
      mergedContent = remoteContent;
      explanation = 'Preferred remote content';
    }

    return {
      mergedContent,
      conflicts: [],
      resolution: 'auto',
      confidence: 0.7,
      explanation
    };
  }

  /**
   * Interactive conflict resolution with user prompts
   */
  async resolveInteractively(
    conflict: ConflictDetails
  ): Promise<MergeResult> {
    log.header(`Resolving conflict: ${conflict.path}`);
    log.info(`Change type: ${conflict.changeType}`);
    
    // Show diff summary
    await this.showConflictSummary(conflict);

    // Interactive prompt (simplified - would use @clack/prompts in real implementation)
    log.warn('\n⚠️  Interactive conflict resolution not fully implemented');
    log.info('Available strategies:');
    log.info('  1. Use local version');
    log.info('  2. Use remote version');
    log.info('  3. Attempt AI merge');
    log.info('  4. Manual edit');

    // For now, default to AI merge
    return this.performAIMerge(conflict, { strategy: 'ai-assisted' });
  }

  /**
   * Show conflict summary for user
   */
  private async showConflictSummary(conflict: ConflictDetails): Promise<void> {
    const { localContent, remoteContent, baseContent } = conflict;
    
    log.info(`\n📊 Conflict Analysis:`);
    log.info(`  Local lines: ${localContent.split('\n').length}`);
    log.info(`  Remote lines: ${remoteContent.split('\n').length}`);
    if (baseContent) {
      log.info(`  Base lines: ${baseContent.split('\n').length}`);
    }

    // Show first few lines of each version
    const previewLines = 3;
    log.info(`\n📄 Local preview:`);
    localContent.split('\n').slice(0, previewLines).forEach((line, i) => {
      log.info(`  ${i + 1}: ${line}`);
    });

    log.info(`\n📄 Remote preview:`);
    remoteContent.split('\n').slice(0, previewLines).forEach((line, i) => {
      log.info(`  ${i + 1}: ${line}`);
    });
  }

  /**
   * Batch resolve multiple conflicts
   */
  async resolveBatchConflicts(
    conflicts: ConflictDetails[],
    options: ConflictResolutionOptions = { strategy: 'ai-assisted' }
  ): Promise<MergeResult[]> {
    const results: MergeResult[] = [];

    for (const conflict of conflicts) {
      try {
        let result: MergeResult;

        if (options.interactive) {
          result = await this.resolveInteractively(conflict);
        } else {
          result = await this.performAIMerge(conflict, options);
        }

        results.push(result);
        log.info(`✅ Resolved: ${conflict.path} (${result.resolution})`);
      } catch (error) {
        log.error(`❌ Failed to resolve ${conflict.path}: ${error}`);
        results.push({
          mergedContent: conflict.localContent,
          conflicts: [`Resolution failed: ${error}`],
          resolution: 'manual',
          confidence: 0,
          explanation: 'Resolution failed - requires manual intervention'
        });
      }
    }

    return results;
  }
}
