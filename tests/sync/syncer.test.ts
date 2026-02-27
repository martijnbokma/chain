import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { runSync } from '../../src/sync/syncer.js';
import type { ToolkitConfig } from '../../src/core/types.js';

describe('Syncer (MCP-only)', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'ai-toolkit-sync-'));
    await mkdir(join(testDir, '.chain', 'rules'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'skills'), { recursive: true });
    await mkdir(join(testDir, '.chain', 'workflows'), { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  const baseConfig: ToolkitConfig = {
    version: '1.0',
    editors: { cursor: true, claude: true },
    mcp_servers: [
      { name: 'chain', command: 'npx', args: ['-y', '@silverfox14/chain', 'mcp-server'] },
    ],
  };

  it('should generate MCP configs for enabled editors', async () => {
    const result = await runSync(testDir, baseConfig);

    expect(result.errors).toEqual([]);
    expect(result.synced.length).toBeGreaterThan(0);

    const mcpJson = await readFile(join(testDir, '.cursor', 'mcp.json'), 'utf-8');
    const parsed = JSON.parse(mcpJson);
    expect(parsed.mcpServers['chain']).toBeDefined();
    expect(parsed.mcpServers['chain'].command).toBe('npx');
    expect(parsed.mcpServers['chain'].args).toEqual(['-y', '@silverfox14/chain', 'mcp-server']);
  });

  it('should generate MCP configs for multiple editors', async () => {
    const result = await runSync(testDir, baseConfig);

    expect(result.errors).toEqual([]);
    const cursorMcp = JSON.parse(await readFile(join(testDir, '.cursor', 'mcp.json'), 'utf-8'));
    const claudeMcp = JSON.parse(await readFile(join(testDir, '.claude', 'settings.json'), 'utf-8'));
    expect(cursorMcp.mcpServers['chain']).toBeDefined();
    expect(claudeMcp.mcpServers['chain']).toBeDefined();
  });

  it('should update .gitignore with MCP config paths', async () => {
    const result = await runSync(testDir, baseConfig);

    const gitignore = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('Chain managed');
    expect(gitignore).toContain('.cursor/mcp.json');
  });

  it('should sync settings when configured', async () => {
    const configWithSettings: ToolkitConfig = {
      ...baseConfig,
      settings: {
        indent_size: 2,
        indent_style: 'space',
        format_on_save: true,
      },
    };

    const result = await runSync(testDir, configWithSettings);

    expect(result.errors).toEqual([]);
    expect(result.synced.length).toBeGreaterThan(0);
  });

  it('should return early when no MCP-capable editors enabled', async () => {
    const noEditorsConfig: ToolkitConfig = {
      version: '1.0',
      editors: { cursor: false, claude: false },
      mcp_servers: baseConfig.mcp_servers,
    };

    const result = await runSync(testDir, noEditorsConfig);

    expect(result.synced).toEqual([]);
  });

  it('should return early when no mcp_servers and no settings', async () => {
    const noMcpConfig: ToolkitConfig = {
      version: '1.0',
      editors: { cursor: true },
      mcp_servers: [],
    };

    const result = await runSync(testDir, noMcpConfig);

    expect(result.synced).toEqual([]);
  });

  it('dry-run should not write files', async () => {
    const result = await runSync(testDir, baseConfig, { dryRun: true });

    expect(result.synced.length).toBeGreaterThan(0);

    const { access } = await import('fs/promises');
    await expect(access(join(testDir, '.cursor', 'mcp.json'))).rejects.toThrow();
  });

  it('should include additional mcp_servers from config', async () => {
    const configWithExtra: ToolkitConfig = {
      ...baseConfig,
      mcp_servers: [
        ...(baseConfig.mcp_servers ?? []),
        { name: 'filesystem', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', './src'] },
      ],
    };

    const result = await runSync(testDir, configWithExtra);

    const mcpJson = await readFile(join(testDir, '.cursor', 'mcp.json'), 'utf-8');
    const parsed = JSON.parse(mcpJson);
    expect(parsed.mcpServers['chain']).toBeDefined();
    expect(parsed.mcpServers['filesystem']).toBeDefined();
  });
});
