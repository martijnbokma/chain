import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { SmartSyncEngine } from '../../src/sync/smart-sync.js';

describe('SmartSyncEngine', () => {
  let projectRoot: string;
  let sourceDir: string;
  let targetDir: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'smart-sync-'));
    sourceDir = join(projectRoot, 'source');
    targetDir = join(projectRoot, 'target');
    await mkdir(sourceDir, { recursive: true });
    await mkdir(targetDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should instantiate and scan directory', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'test.md'), '# Rule');

    const engine = new SmartSyncEngine(projectRoot);
    const scanned = await engine.scanDirectory(sourceDir);

    expect(scanned.size).toBeGreaterThan(0);
    const entry = scanned.get('rules/test.md');
    expect(entry).toBeDefined();
    expect(entry?.hash).toBeDefined();
    expect(entry?.hash.length).toBe(64);
  });

  it('should compare directories and detect additions', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'new-rule.md'), '# New Rule');

    const engine = new SmartSyncEngine(projectRoot);
    const comparison = await engine.compareDirectories(sourceDir, targetDir);

    expect(comparison.toAdd.length).toBe(1);
    expect(comparison.toAdd[0].relativePath).toBe('rules/new-rule.md');
    expect(comparison.toUpdate.length).toBe(0);
    expect(comparison.toRemove.length).toBe(0);
  });

  it('should perform smart sync (additions) in dry-run', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'dry-run.md'), '# Dry Run');

    const engine = new SmartSyncEngine(projectRoot);
    const result = await engine.smartSync(sourceDir, targetDir, { dryRun: true });

    expect(result.added).toContain('rules/dry-run.md');
    expect(result.errors).toEqual([]);

    const targetFile = join(targetDir, 'rules', 'dry-run.md');
    await expect(readFile(targetFile, 'utf-8')).rejects.toThrow();
  });

  it('should perform smart sync (additions) and write files', async () => {
    await mkdir(join(sourceDir, 'rules'), { recursive: true });
    await writeFile(join(sourceDir, 'rules', 'live.md'), '# Live Sync');

    const engine = new SmartSyncEngine(projectRoot);
    const result = await engine.smartSync(sourceDir, targetDir, { dryRun: false });

    expect(result.added).toContain('rules/live.md');
    expect(result.errors).toEqual([]);

    const content = await readFile(join(targetDir, 'rules', 'live.md'), 'utf-8');
    expect(content).toBe('# Live Sync');
  });
});
