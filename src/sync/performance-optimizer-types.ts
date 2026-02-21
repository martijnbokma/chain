/**
 * Types for performance optimizer
 */

export interface PerformanceMetrics {
  filesProcessed: number;
  totalTime: number;
  averageTimePerFile: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface CacheEntry {
  content: string;
  hash: string;
  mtime: Date;
  size: number;
  lastAccessed: Date;
}

export interface FileWatcher {
  on: (event: string, callback: (path: string) => void) => unknown;
  close: () => void | Promise<void>;
}
