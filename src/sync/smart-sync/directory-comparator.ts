import { stat, readFile } from 'fs/promises';
import { relative } from 'path';
import { findMarkdownFiles } from '../../utils/file-ops.js';
import { log } from '../../utils/logger.js';
import type { PerformanceOptimizer } from '../performance-optimizer.js';
import type { DirectoryComparison } from '../smart-sync-types.js';
import type { ContentHash, SyncContentMetadata } from '../smart-sync-types.js';

export interface DirectoryComparatorDeps {
  performanceOptimizer: PerformanceOptimizer;
}

/**
 * Compares directories and detects add/update/remove/conflict changes
 */
export class DirectoryComparator {
  constructor(private deps: DirectoryComparatorDeps) {}

  async scanDirectory(
    dirPath: string,
  ): Promise<Map<string, ContentHash>> {
    const files = await findMarkdownFiles(dirPath, dirPath);
    const fileMap = new Map<string, ContentHash>();

    const results = await this.deps.performanceOptimizer.processFilesInParallel<ContentHash>(
      files.map((f) => f.absolutePath),
      async (filePath, content) => {
        const stats = await stat(filePath);
        const hash = this.deps.performanceOptimizer.calculateHash(content);
        return {
          path: filePath,
          relativePath: relative(dirPath, filePath),
          hash,
          mtime: stats.mtime,
          size: content.length,
        };
      },
      {
        batchSize: 20,
        maxConcurrency: 10,
        progressCallback: (completed, total) => {
          if (completed % 10 === 0 || completed === total) {
            log.info(`Scanning: ${completed}/${total} files`);
          }
        },
      },
    );

    for (const result of results) {
      if (result?.relativePath) {
        fileMap.set(result.relativePath, result);
      }
    }

    return fileMap;
  }

  async getFileMetadata(filePath: string): Promise<ContentHash | undefined> {
    try {
      const content = await this.deps.performanceOptimizer.readFileWithCache(filePath);
      const stats = await stat(filePath);
      const hash = this.deps.performanceOptimizer.calculateHash(content.content);
      return {
        path: filePath,
        relativePath: filePath,
        hash,
        mtime: stats.mtime,
        size: content.content.length,
      };
    } catch (error) {
      log.warn(`Failed to get metadata for ${filePath}: ${error}`);
      return undefined;
    }
  }

  async compareDirectories(
    sourceDir: string,
    targetDir: string,
    metadataCache: Map<string, SyncContentMetadata>,
  ): Promise<DirectoryComparison> {
    const sourceFiles = await this.scanDirectory(sourceDir);
    const targetFiles = await this.scanDirectory(targetDir);

    const result: DirectoryComparison = {
      toAdd: [],
      toUpdate: [],
      toRemove: [],
      conflicts: [],
    };

    for (const [relativePath, sourceFile] of sourceFiles) {
      if (!targetFiles.has(relativePath)) {
        const content = await readFile(sourceFile.path, 'utf8');
        result.toAdd.push({
          relativePath,
          sourcePath: sourceFile.path,
          content,
        });
      }
    }

    for (const [relativePath, targetFile] of targetFiles) {
      if (!sourceFiles.has(relativePath)) {
        result.toRemove.push({
          relativePath,
          targetPath: targetFile.path,
        });
      }
    }

    for (const [relativePath, sourceFile] of sourceFiles) {
      const targetFile = targetFiles.get(relativePath);
      if (!targetFile) continue;

      if (sourceFile.hash === targetFile.hash) continue;

      const sourceContent = await readFile(sourceFile.path, 'utf8');
      const targetContent = await readFile(targetFile.path, 'utf8');
      const sourceMetadata = metadataCache.get(relativePath);
      const targetMetadata = metadataCache.get(`target:${relativePath}`);

      const isConflict =
        sourceMetadata &&
        targetMetadata &&
        sourceMetadata.lastSync &&
        targetMetadata.lastSync &&
        sourceFile.mtime > sourceMetadata.lastSync &&
        targetFile.mtime > targetMetadata.lastSync;

      if (isConflict) {
        result.conflicts.push({
          relativePath,
          sourcePath: sourceFile.path,
          targetPath: targetFile.path,
          reason: 'Both files modified since last sync',
        });
      } else {
        result.toUpdate.push({
          relativePath,
          sourcePath: sourceFile.path,
          targetPath: targetFile.path,
          sourceContent,
          targetContent,
        });
      }
    }

    return result;
  }
}
