/**
 * Types for the smart sync engine
 */

export interface ContentHash {
  path: string;
  relativePath: string;
  hash: string;
  mtime: Date;
  size: number;
}

export interface SyncContentMetadata {
  hash: string;
  lastSync?: Date;
  source?: string;
  quality?: number;
  conflicts?: number;
}

export interface SmartSyncResult {
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

export interface DirectoryComparison {
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
}
