import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { installPreCommitHook } from '../../src/utils/git-hooks.js';

describe('installPreCommitHook', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'chain-hooks-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should return false when .git directory does not exist', async () => {
    const result = await installPreCommitHook(testDir);
    expect(result).toBe(false);
  });

  it('should install pre-commit hook when .git exists and no hook present', async () => {
    await mkdir(join(testDir, '.git', 'hooks'), { recursive: true });

    const result = await installPreCommitHook(testDir);
    expect(result).toBe(true);

    const hook = await readFile(join(testDir, '.git', 'hooks', 'pre-commit'), 'utf-8');
    expect(hook).toContain('@silverfox14/chain');
    expect(hook).toContain('#!/bin/sh');
  });

  it('should return false when hook already contains @silverfox14/chain', async () => {
    await mkdir(join(testDir, '.git', 'hooks'), { recursive: true });
    await writeFile(
      join(testDir, '.git', 'hooks', 'pre-commit'),
      '#!/bin/sh\n# @silverfox14/chain: existing hook\n',
    );

    const result = await installPreCommitHook(testDir);
    expect(result).toBe(false);
  });

  it('should append to existing hook that does not contain @silverfox14/chain', async () => {
    await mkdir(join(testDir, '.git', 'hooks'), { recursive: true });
    await writeFile(
      join(testDir, '.git', 'hooks', 'pre-commit'),
      '#!/bin/sh\necho "existing hook"\n',
    );

    const result = await installPreCommitHook(testDir);
    expect(result).toBe(true);

    const hook = await readFile(join(testDir, '.git', 'hooks', 'pre-commit'), 'utf-8');
    expect(hook).toContain('existing hook');
    expect(hook).toContain('@silverfox14/chain');
  });
});
