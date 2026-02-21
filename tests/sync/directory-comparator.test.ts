import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { DirectoryComparator } from '../../src/sync/smart-sync/directory-comparator.js';
import { PerformanceOptimizer } from '../../src/sync/performance-optimizer.js';

describe('DirectoryComparator', () => {
  let sourceDir: string;
  let targetDir: string;
  let comparator: DirectoryComparator;

  beforeEach(async () => {
    const root = await mkdtemp(join(tmpdir(), 'dir-comp-'));
    sourceDir = join(root, 'source');
    targetDir = join(root, 'target');
    await mkdir(sourceDir, { recursive: true });
    await mkdir(targetDir, { recursive: true });
    comparator = new DirectoryComparator({
      performanceOptimizer: new PerformanceOptimizer(),
    });
  });

  afterEach(async () => {
    await rm(join(sourceDir, '..'), { recursive: true, force: true });
  });

  it('should scan directory and return content hashes', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'a.md'), '# A');

    const scanned = await comparator.scanDirectory(sourceDir);

    expect(scanned.size).toBe(1);
    const entry = scanned.get('rules/a.md');
    expect(entry).toBeDefined();
    expect(entry?.hash).toHaveLength(64);
  });

  it('should detect additions', async () => {
    await mkdir(join(sourceDir, 'skills'), { recursive: true });
    await writeFile(join(sourceDir, 'skills', 'new.md'), '# New');

    const comparison = await comparator.compareDirectories(
      sourceDir,
      targetDir,
      new Map(),
    );

    expect(comparison.toAdd).toHaveLength(1);
    expect(comparison.toAdd[0].relativePath).toBe('skills/new.md');
    expect(comparison.toAdd[0].content).toBe('# New');
  });

  it('should detect removals', async () => {
    await mkdir(join(targetDir, 'rules'), { recursive: true });
    await writeFile(join(targetDir, 'rules', 'old.md'), '# Old');

    const comparison = await comparator.compareDirectories(
      sourceDir,
      targetDir,
      new Map(),
    );

    expect(comparison.toRemove).toHaveLength(1);
    expect(comparison.toRemove[0].relativePath).toBe('rules/old.md');
  });

  it('should detect updates when content differs', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await mkdir(join(targetDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'same.md'), '# Source');
    await writeFile(join(targetDir, 'rules', 'same.md'), '# Target');

    const comparison = await comparator.compareDirectories(
      sourceDir,
      targetDir,
      new Map(),
    );

    expect(comparison.toUpdate).toHaveLength(1);
    expect(comparison.toUpdate[0].relativePath).toBe('rules/same.md');
    expect(comparison.toUpdate[0].sourceContent).toBe('# Source');
    expect(comparison.toUpdate[0].targetContent).toBe('# Target');
  });
});
