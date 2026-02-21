import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { PerformanceOptimizer } from '../../src/sync/performance-optimizer.js';

describe('PerformanceOptimizer', () => {
  let projectRoot: string;
  let optimizer: PerformanceOptimizer;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'perf-opt-'));
    optimizer = new PerformanceOptimizer();
  });

  afterEach(async () => {
    optimizer.clearCaches();
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should read file and cache content', async () => {
    const filePath = join(projectRoot, 'test.md');
    await writeFile(filePath, '# Test');

    const first = await optimizer.readFileWithCache(filePath);
    expect(first.content).toBe('# Test');
    expect(first.fromCache).toBe(false);

    const second = await optimizer.readFileWithCache(filePath);
    expect(second.content).toBe('# Test');
    expect(second.fromCache).toBe(true);
  });

  it('should calculate hash', () => {
    const hash1 = optimizer.calculateHash('content');
    const hash2 = optimizer.calculateHash('content');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash1)).toBe(true);
  });

  it('should process files in parallel', async () => {
    await mkdir(join(projectRoot, 'rules'), { recursive: true });
    await writeFile(join(projectRoot, 'rules', 'a.md'), '# A');
    await writeFile(join(projectRoot, 'rules', 'b.md'), '# B');

    const results = await optimizer.processFilesInParallel(
      [
        join(projectRoot, 'rules', 'a.md'),
        join(projectRoot, 'rules', 'b.md'),
      ],
      async (path, content) => ({ path, content }),
    );

    expect(results).toHaveLength(2);
    const contents = results.map((r) => r.content).sort();
    expect(contents).toEqual(['# A', '# B']);
  });

  it('should return metrics', () => {
    const metrics = optimizer.getMetrics();

    expect(metrics.filesProcessed).toBeDefined();
    expect(metrics.cacheHits).toBeDefined();
    expect(metrics.cacheMisses).toBeDefined();
    expect(metrics.memoryUsage).toBeDefined();
  });

  it('should return cache stats', () => {
    const stats = optimizer.getCacheStats();

    expect(stats.size).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeLessThanOrEqual(1);
    expect(stats.memoryUsage).toBeGreaterThanOrEqual(0);
  });

  it('should clear caches', async () => {
    const filePath = join(projectRoot, 'clear.md');
    await writeFile(filePath, '# Clear');
    await optimizer.readFileWithCache(filePath);

    optimizer.clearCaches();

    const stats = optimizer.getCacheStats();
    expect(stats.size).toBe(0);
  });
});
