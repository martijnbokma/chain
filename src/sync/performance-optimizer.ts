import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { log } from '../utils/logger.js';

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

/**
 * Performance optimization utilities for sync operations
 */
export class PerformanceOptimizer {
  private contentCache: Map<string, CacheEntry> = new Map();
  private hashCache: Map<string, string> = new Map();
  private metrics: PerformanceMetrics = {
    filesProcessed: 0,
    totalTime: 0,
    averageTimePerFile: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: { used: 0, total: 0, percentage: 0 }
  };
  private maxCacheSize = 1000; // Maximum number of files to cache
  private maxCacheAge = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up cache periodically
    setInterval(() => this.cleanupCache(), 60000); // Every minute
  }

  /**
   * Read file with caching
   */
  async readFileWithCache(filePath: string): Promise<{ content: string; fromCache: boolean }> {
    const startTime = Date.now();
    
    try {
      const stats = await stat(filePath);
      const cacheKey = filePath;
      const cached = this.contentCache.get(cacheKey);

      // Check if cache is valid
      if (cached && cached.mtime >= stats.mtime) {
        cached.lastAccessed = new Date();
        this.metrics.cacheHits++;
        return { content: cached.content, fromCache: true };
      }

      // Read file from disk
      const content = await readFile(filePath, 'utf8');
      const hash = this.calculateHash(content);

      // Update cache
      const entry: CacheEntry = {
        content,
        hash,
        mtime: stats.mtime,
        size: content.length,
        lastAccessed: new Date()
      };

      this.contentCache.set(cacheKey, entry);
      this.hashCache.set(hash, content);
      this.metrics.cacheMisses++;

      const duration = Date.now() - startTime;
      this.updateMetrics(duration);

      return { content, fromCache: false };
    } catch (error) {
      log.warn(`Failed to read file ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Calculate hash with caching
   */
  calculateHash(content: string): string {
    const cachedHash = this.hashCache.get(content);
    if (cachedHash) {
      return cachedHash;
    }

    const hash = createHash('sha256').update(content, 'utf8').digest('hex');
    this.hashCache.set(hash, content);
    return hash;
  }

  /**
   * Process multiple files in parallel with batching
   */
  async processFilesInParallel<T>(
    filePaths: string[],
    processor: (filePath: string, content: string) => Promise<T>,
    options: {
      batchSize?: number;
      maxConcurrency?: number;
      progressCallback?: (completed: number, total: number) => void;
    } = {}
  ): Promise<T[]> {
    const { batchSize = 10, maxConcurrency = 20, progressCallback } = options;
    const results: T[] = [];
    let completed = 0;

    // Process files in batches
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      
      // Process batch with limited concurrency
      const batchPromises = batch.map(async (filePath) => {
        try {
          const { content } = await this.readFileWithCache(filePath);
          const result = await processor(filePath, content);
          completed++;
          
          if (progressCallback) {
            progressCallback(completed, filePaths.length);
          }
          
          return result;
        } catch (error) {
          log.warn(`Failed to process ${filePath}: ${error}`);
          return null;
        }
      });

      // Wait for batch to complete with concurrency limit
      const batchResults = await this.limitConcurrency(batchPromises, maxConcurrency);
      results.push(...batchResults.filter(Boolean) as T[]);
    }

    return results;
  }

  /**
   * Limit concurrency of promises
   */
  private async limitConcurrency<T>(
    promises: Promise<T | null>[],
    maxConcurrency: number
  ): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const p = Promise.resolve(promise).then(result => {
        results.push(result);
        return;
      });

      executing.push(p);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        const index = executing.findIndex(p => p === p);
        if (index !== -1) {
          executing.splice(index, 1);
        }
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
    };

    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      filesProcessed: 0,
      totalTime: 0,
      averageTimePerFile: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: { used: 0, total: 0, percentage: 0 }
    };
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.contentCache.entries());

    // Remove old entries
    for (const [key, entry] of entries) {
      if (now - entry.lastAccessed.getTime() > this.maxCacheAge) {
        this.contentCache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.contentCache.size > this.maxCacheSize) {
      const sorted = entries
        .sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime())
        .slice(0, this.contentCache.size - this.maxCacheSize);

      for (const [key] of sorted) {
        this.contentCache.delete(key);
      }
    }

    // Clean up hash cache too
    if (this.hashCache.size > this.maxCacheSize * 2) {
      const hashEntries = Array.from(this.hashCache.entries());
      const toRemove = hashEntries.slice(0, hashEntries.length - this.maxCacheSize * 2);
      for (const [hash] of toRemove) {
        this.hashCache.delete(hash);
      }
    }

    log.info(`Cache cleanup: ${this.contentCache.size} files cached, ${this.hashCache.size} hashes cached`);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(duration: number): void {
    this.metrics.filesProcessed++;
    this.metrics.totalTime += duration;
    this.metrics.averageTimePerFile = this.metrics.totalTime / this.metrics.filesProcessed;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? this.metrics.cacheHits / totalRequests : 0;
    
    let cacheMemory = 0;
    for (const entry of this.contentCache.values()) {
      cacheMemory += entry.size;
    }

    return {
      size: this.contentCache.size,
      hitRate,
      memoryUsage: cacheMemory
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.contentCache.clear();
    this.hashCache.clear();
    this.resetMetrics();
    log.info('Performance caches cleared');
  }
}

/**
 * File watcher with debouncing and batch processing
 */
export class SmartFileWatcher {
  private watchers: Map<string, any> = new Map();
  private changeQueue: Map<string, NodeJS.Timeout> = new Map();
  private onChange: (filePath: string) => void;
  private debounceDelay = 500; // 500ms debounce

  constructor(onChange: (filePath: string) => void) {
    this.onChange = onChange;
  }

  /**
   * Watch directory for changes
   */
  async watchDirectory(dirPath: string): Promise<void> {
    try {
      const { watch } = await import('chokidar');
      
      const watcher = watch(dirPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('change', (filePath) => {
        this.handleFileChange(filePath);
      });

      watcher.on('add', (filePath) => {
        this.handleFileChange(filePath);
      });

      watcher.on('unlink', (filePath) => {
        this.handleFileChange(filePath);
      });

      this.watchers.set(dirPath, watcher);
      log.info(`Started watching: ${dirPath}`);
    } catch (error) {
      log.error(`Failed to watch directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Stop watching directory
   */
  async stopWatching(dirPath: string): Promise<void> {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(dirPath);
      log.info(`Stopped watching: ${dirPath}`);
    }
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.watchers.entries()).map(async ([path, watcher]) => {
      await watcher.close();
      log.info(`Stopped watching: ${path}`);
    });

    await Promise.all(promises);
    this.watchers.clear();
    this.changeQueue.clear();
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(filePath: string): void {
    // Clear existing timeout for this file
    const existingTimeout = this.changeQueue.get(filePath);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.onChange(filePath);
      this.changeQueue.delete(filePath);
    }, this.debounceDelay);

    this.changeQueue.set(filePath, timeout);
  }

  /**
   * Get watcher statistics
   */
  getStats(): {
    watching: number;
    pendingChanges: number;
  } {
    return {
      watching: this.watchers.size,
      pendingChanges: this.changeQueue.size
    };
  }
}
