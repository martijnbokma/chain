import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { mockProcessExit, suppressConsole } from './helpers.js';

// Mock readline to auto-answer 'y' to all prompts
vi.mock('readline', () => ({
  createInterface: () => ({
    question: (_q: string, cb: (answer: string) => void) => cb('y'),
    close: vi.fn(),
  }),
}));

describe('runSyncCommand', () => {
  let testDir: string;
  let exitSpy: ReturnType<typeof mockProcessExit>;
  let consoleSpy: ReturnType<typeof suppressConsole>;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'ai-toolkit-synccmd-'));
    exitSpy = mockProcessExit();
    consoleSpy = suppressConsole();
  });

  afterEach(async () => {
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
    await rm(testDir, { recursive: true, force: true });
  });

  async function importCommand() {
    return (await import('../../src/cli/sync.js')).runSyncCommand;
  }

  it('should fail when no config file exists', async () => {
    const runSyncCommand = await importCommand();
    await expect(runSyncCommand(testDir)).rejects.toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should sync successfully with valid config (MCP-only)', async () => {
    await writeFile(
      join(testDir, 'chain.yaml'),
      'version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\n',
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();

    const mcpJson = await readFile(join(testDir, '.cursor', 'mcp.json'), 'utf-8');
    const parsed = JSON.parse(mcpJson);
    expect(parsed.mcpServers['chain']).toBeDefined();
  });

  it('should run in dry-run mode without writing files', async () => {
    await writeFile(
      join(testDir, 'chain.yaml'),
      'version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\n',
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir, { dryRun: true });

    expect(exitSpy).not.toHaveBeenCalled();

    const { access } = await import('fs/promises');
    await expect(access(join(testDir, '.cursor', 'mcp.json'))).rejects.toThrow();
  });

  it('should complete sync without errors', async () => {
    await writeFile(
      join(testDir, 'chain.yaml'),
      'version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\n',
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should sync with content_sources configured', async () => {
    const ssotDir = join(testDir, 'ssot-source');
    await mkdir(join(ssotDir, 'rules'), { recursive: true });
    await writeFile(join(ssotDir, 'rules', 'shared.md'), '# SSOT version');

    await writeFile(
      join(testDir, 'chain.yaml'),
      `version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\ncontent_sources:\n  - type: local\n    path: "${ssotDir}"\n`,
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should show summary with synced counts', async () => {
    await writeFile(
      join(testDir, 'chain.yaml'),
      'version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\n',
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should sync with content_sources', async () => {
    const ssotDir = join(testDir, 'ssot');
    await mkdir(join(ssotDir, 'rules'), { recursive: true });
    await mkdir(join(ssotDir, 'skills'), { recursive: true });
    await mkdir(join(ssotDir, 'workflows'), { recursive: true });
    await writeFile(join(ssotDir, 'rules', 'shared.md'), '# Shared');

    await writeFile(
      join(testDir, 'chain.yaml'),
      `version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\ncontent_sources:\n  - type: local\n    path: "${ssotDir}"\n`,
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should sync with content_sources and local overrides', async () => {
    const ssotDir = join(testDir, 'ssot2');
    await mkdir(join(ssotDir, 'rules'), { recursive: true });
    await mkdir(join(ssotDir, 'skills'), { recursive: true });
    await mkdir(join(ssotDir, 'workflows'), { recursive: true });
    await writeFile(join(ssotDir, 'rules', 'shared.md'), '# SSOT');

    await writeFile(
      join(testDir, 'chain.yaml'),
      `version: "1.0"\neditors:\n  cursor: true\nmcp_servers:\n  - name: chain\n    command: npx\n    args: ["-y", "@silverfox14/chain", "mcp-server"]\ncontent_sources:\n  - type: local\n    path: "${ssotDir}"\n`,
    );
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });

    const runSyncCommand = await importCommand();
    await runSyncCommand(testDir);

    expect(exitSpy).not.toHaveBeenCalled();
  });
});
