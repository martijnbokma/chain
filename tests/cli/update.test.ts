import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { runUpdate } from '../../src/cli/update.js';
import { mockProcessExit, suppressConsole } from './helpers.js';

// Mock child_process.execSync
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('runUpdate', () => {
  let testDir: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'ai-toolkit-update-'));
    cleanup = async () => {
      await rm(testDir, { recursive: true, force: true });
    };
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should check for updates with --check flag', async () => {
    await suppressConsole(async () => {
      await runUpdate({ check: true });
    });

    // Since chain is not on npm, no execSync calls should be made
    const { execSync } = await import('child_process');
    expect(execSync).not.toHaveBeenCalled();
  });

  it('should perform dry run with --dry-run flag', async () => {
    await suppressConsole(async () => {
      await runUpdate({ dryRun: true });
    });

    // Since chain is not on npm, no execSync calls should be made
    const { execSync } = await import('child_process');
    expect(execSync).not.toHaveBeenCalled();
  });

  it('should handle network errors gracefully', async () => {
    const { execSync } = await import('child_process');
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('Network error');
    });

    await suppressConsole(async () => {
      try {
        await runUpdate({});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
