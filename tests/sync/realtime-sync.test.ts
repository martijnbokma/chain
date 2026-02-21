import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { RealtimeSyncEngine } from '../../src/sync/realtime-sync.js';

describe('RealtimeSyncEngine', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'realtime-sync-'));
    await mkdir(join(projectRoot, 'templates'), { recursive: true });
    await mkdir(join(projectRoot, '.chain'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should instantiate with options', () => {
    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain',
      debounceDelay: 500
    });

    expect(engine).toBeDefined();
    expect(engine.isActive()).toBe(false);
  });

  it('should return initial stats before start', () => {
    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain'
    });

    const stats = engine.getStats();

    expect(stats.filesWatched).toBe(0);
    expect(stats.eventsProcessed).toBe(0);
    expect(stats.syncsPerformed).toBe(0);
    expect(stats.conflictsResolved).toBe(0);
    expect(stats.averageSyncTime).toBe(0);
    expect(stats.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return empty queue status before start', () => {
    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain'
    });

    const status = engine.getQueueStatus();

    expect(status.pending).toBe(0);
    expect(status.processing).toEqual([]);
  });

  it('should start and stop', async () => {
    await writeFile(join(projectRoot, 'templates', 'rule.md'), '# Rule');

    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain',
      debounceDelay: 100,
      autoResolve: 'source',
      enableAI: false
    });

    await engine.start();
    expect(engine.isActive()).toBe(true);

    const stats = engine.getStats();
    expect(stats.filesWatched).toBeGreaterThanOrEqual(0);

    await engine.stop();
    expect(engine.isActive()).toBe(false);
  });

  it('should emit started and stopped events', async () => {
    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain',
      debounceDelay: 100,
      autoResolve: 'source',
      enableAI: false
    });

    let startedEmitted = false;
    let stoppedEmitted = false;

    engine.on('started', () => { startedEmitted = true; });
    engine.on('stopped', () => { stoppedEmitted = true; });

    await engine.start();
    expect(startedEmitted).toBe(true);

    await engine.stop();
    expect(stoppedEmitted).toBe(true);
  });

  it('should emit initial-sync event with result', async () => {
    await writeFile(join(projectRoot, 'templates', 'test.md'), '# Test');

    const engine = new RealtimeSyncEngine(projectRoot, {
      sourceDir: 'templates',
      targetDir: '.chain',
      debounceDelay: 100,
      autoResolve: 'source',
      enableAI: false
    });

    let initialSyncResult: { added: string[] } | null = null;
    engine.on('initial-sync', (result) => {
      initialSyncResult = result;
    });

    await engine.start();
    await engine.stop();

    expect(initialSyncResult).toBeDefined();
    expect(initialSyncResult?.added).toContain('test.md');
  });
});
