import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { AIConflictResolver } from '../../src/sync/ai-conflict-resolver.js';

describe('AIConflictResolver', () => {
  let projectRoot: string;
  let localPath: string;
  let remotePath: string;
  let basePath: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'ai-conflict-'));
    await mkdir(join(projectRoot, 'local'), { recursive: true });
    await mkdir(join(projectRoot, 'remote'), { recursive: true });
    await mkdir(join(projectRoot, 'base'), { recursive: true });

    localPath = join(projectRoot, 'local', 'file.md');
    remotePath = join(projectRoot, 'remote', 'file.md');
    basePath = join(projectRoot, 'base', 'file.md');
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should detect content-conflict when local and remote are identical', async () => {
    const content = '# Same content';
    await writeFile(localPath, content);
    await writeFile(remotePath, content);

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);

    expect(conflict.changeType).toBe('content-conflict');
    expect(conflict.localHash).toBe(conflict.remoteHash);
    expect(conflict.localContent).toBe(content);
  });

  it('should detect both-modified when local and remote differ from base', async () => {
    const baseContent = 'line1\nline2\nline3';
    const localContent = 'line1\nlocal\nline3';
    const remoteContent = 'line1\nremote\nline3';

    await writeFile(basePath, baseContent);
    await writeFile(localPath, localContent);
    await writeFile(remotePath, remoteContent);

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath, basePath);

    expect(conflict.changeType).toBe('both-modified');
    expect(conflict.baseContent).toBe(baseContent);
    expect(conflict.localHash).not.toBe(conflict.remoteHash);
    expect(conflict.localHash).not.toBe(conflict.baseHash);
  });

  it('should detect structural-conflict when no base and local differs from remote', async () => {
    await writeFile(localPath, '# Local');
    await writeFile(remotePath, '# Remote');

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);

    expect(conflict.changeType).toBe('structural-conflict');
    expect(conflict.localContent).toBe('# Local');
    expect(conflict.remoteContent).toBe('# Remote');
  });

  it('should merge content-conflict (identical) and return local', async () => {
    const content = '# Identical';
    await writeFile(localPath, content);
    await writeFile(remotePath, content);

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);
    const result = await resolver.performAIMerge(conflict);

    expect(result.mergedContent).toBe(content);
    expect(result.conflicts).toEqual([]);
    expect(result.resolution).toBe('auto');
    expect(result.confidence).toBe(1);
  });

  it('should merge structural-conflict preferring local', async () => {
    await writeFile(localPath, '# Local');
    await writeFile(remotePath, '# Remote');

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);
    const result = await resolver.performAIMerge(conflict, {
      strategy: 'auto',
      preferLocal: true
    });

    expect(result.mergedContent).toBe('# Local');
    expect(result.conflicts).toEqual([]);
    expect(result.resolution).toBe('auto');
  });

  it('should merge structural-conflict preferring remote', async () => {
    await writeFile(localPath, '# Local');
    await writeFile(remotePath, '# Remote');

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);
    const result = await resolver.performAIMerge(conflict, {
      strategy: 'auto',
      preferLocal: false
    });

    expect(result.mergedContent).toBe('# Remote');
  });

  it('should perform 3-way merge for both-modified', async () => {
    const baseContent = 'a\nb\nc';
    const localContent = 'a\nb-local\nc';
    const remoteContent = 'a\nb-remote\nc';

    await writeFile(basePath, baseContent);
    await writeFile(localPath, localContent);
    await writeFile(remotePath, remoteContent);

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath, basePath);
    const result = await resolver.performAIMerge(conflict);

    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.mergedContent).toContain('<<<<<<< LOCAL');
    expect(result.mergedContent).toContain('>>>>>>> REMOTE');
    expect(result.resolution).toBe('manual');
  });

  it('should resolve batch conflicts', async () => {
    await writeFile(localPath, '# A');
    await writeFile(remotePath, '# A');

    const resolver = new AIConflictResolver(projectRoot);
    const conflict = await resolver.detectConflict(localPath, remotePath);
    const results = await resolver.resolveBatchConflicts([conflict]);

    expect(results).toHaveLength(1);
    expect(results[0]?.mergedContent).toBe('# A');
    expect(results[0]?.conflicts).toEqual([]);
  });
});
