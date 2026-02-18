import { stat } from 'fs/promises';
import { join } from 'path';
import { log } from '../utils/logger.js';
import { readTextFile, writeTextFile, fileExists } from '../utils/file-ops.js';

export interface FileConflict {
  path: string;
  localTime: Date;
  remoteTime: Date;
  localSize: number;
  remoteSize: number;
  resolution: 'local' | 'remote' | 'manual';
}

export class ConflictResolver {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async resolveFileConflicts(
    localPath: string, 
    remotePath: string
  ): Promise<{ action: string; reason: string }> {
    const localExists = await fileExists(localPath);
    const remoteExists = await fileExists(remotePath);

    // Case 1: Only local exists
    if (localExists && !remoteExists) {
      return { action: 'copy-local-to-remote', reason: 'Local file only' };
    }

    // Case 2: Only remote exists
    if (!localExists && remoteExists) {
      return { action: 'copy-remote-to-local', reason: 'Remote file only' };
    }

    // Case 3: Both exist - check timestamps
    if (localExists && remoteExists) {
      const localStats = await stat(localPath);
      const remoteStats = await stat(remotePath);

      const localTime = localStats.mtime;
      const remoteTime = remoteStats.mtime;

      // If remote is newer, keep remote
      if (remoteTime > localTime) {
        return { 
          action: 'copy-remote-to-local', 
          reason: `Remote is newer (${remoteTime.toISOString()} > ${localTime.toISOString()})` 
        };
      }

      // If local is newer, keep local
      if (localTime > remoteTime) {
        return { 
          action: 'copy-local-to-remote', 
          reason: `Local is newer (${localTime.toISOString()} > ${remoteTime.toISOString()})` 
        };
      }

      // Same timestamp - check content
      const localContent = await readTextFile(localPath);
      const remoteContent = await readTextFile(remotePath);

      if (localContent === remoteContent) {
        return { action: 'no-action', reason: 'Files are identical' };
      }

      // Same timestamp but different content - prefer remote (source of truth)
      return { 
        action: 'copy-remote-to-local', 
        reason: 'Same timestamp, different content - preferring remote (source of truth)' 
      };
    }

    return { action: 'no-action', reason: 'No files exist' };
  }

  async syncWithConflictResolution(
    sourceDir: string, 
    targetDir: string, 
    direction: 'push' | 'pull'
  ): Promise<{
    copied: string[];
    skipped: string[];
    conflicts: FileConflict[];
  }> {
    const result: { copied: string[]; skipped: string[]; conflicts: FileConflict[] } = { 
      copied: [], 
      skipped: [], 
      conflicts: [] 
    };

    // Get all files in both directories
    const sourceFiles = await this.getAllFiles(sourceDir);
    const targetFiles = await this.getAllFiles(targetDir);

    // Process all unique files
    const allFiles = new Set([...sourceFiles, ...targetFiles]);

    for (const relativePath of allFiles) {
      const sourcePath = join(sourceDir, relativePath);
      const targetPath = join(targetDir, relativePath);

      try {
        const resolution = await this.resolveFileConflicts(sourcePath, targetPath);

        switch (resolution.action) {
          case 'copy-remote-to-local':
            if (direction === 'pull') {
              await this.copyFile(sourcePath, targetPath);
              result.copied.push(relativePath);
              log.synced(`remote → local`, relativePath);
            } else {
              result.skipped.push(relativePath);
              log.info(`skipped (push direction) ${relativePath}`);
            }
            break;

          case 'copy-local-to-remote':
            if (direction === 'push') {
              await this.copyFile(targetPath, sourcePath);
              result.copied.push(relativePath);
              log.synced(`local → remote`, relativePath);
            } else {
              result.skipped.push(relativePath);
              log.info(`skipped (pull direction) ${relativePath}`);
            }
            break;

          case 'no-action':
            result.skipped.push(relativePath);
            break;
        }

        log.info(resolution.reason);
      } catch (error) {
        log.warn(`Failed to process ${relativePath}: ${error}`);
        result.skipped.push(relativePath);
      }
    }

    return result;
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const { findMarkdownFiles } = await import('../utils/file-ops.js');
    try {
      const files = await findMarkdownFiles(dir, dir);
      return files.map(f => f.relativePath);
    } catch {
      return [];
    }
  }

  private async copyFile(source: string, target: string): Promise<void> {
    const content = await readTextFile(source);
    await writeTextFile(target, content);
  }

  async getConflictSummary(
    localDir: string, 
    remoteDir: string
  ): Promise<{
    newerInLocal: string[];
    newerInRemote: string[];
    identical: string[];
    onlyInLocal: string[];
    onlyInRemote: string[];
  }> {
    const summary: {
      newerInLocal: string[];
      newerInRemote: string[];
      identical: string[];
      onlyInLocal: string[];
      onlyInRemote: string[];
    } = {
      newerInLocal: [],
      newerInRemote: [],
      identical: [],
      onlyInLocal: [],
      onlyInRemote: []
    };

    const localFiles = await this.getAllFiles(localDir);
    const remoteFiles = await this.getAllFiles(remoteDir);

    const allFiles = new Set([...localFiles, ...remoteFiles]);

    for (const relativePath of allFiles) {
      const localPath = join(localDir, relativePath);
      const remotePath = join(remoteDir, relativePath);

      const localExists = await fileExists(localPath);
      const remoteExists = await fileExists(remotePath);

      if (!localExists && remoteExists) {
        summary.onlyInRemote.push(relativePath);
      } else if (localExists && !remoteExists) {
        summary.onlyInLocal.push(relativePath);
      } else if (localExists && remoteExists) {
        const resolution = await this.resolveFileConflicts(localPath, remotePath);
        
        if (resolution.action === 'copy-local-to-remote') {
          summary.newerInLocal.push(relativePath);
        } else if (resolution.action === 'copy-remote-to-local') {
          summary.newerInRemote.push(relativePath);
        } else if (resolution.action === 'no-action') {
          summary.identical.push(relativePath);
        }
      }
    }

    return summary;
  }
}
