import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { updateGitignore } from '../../src/sync/gitignore.js';
import type { EditorAdapter } from '../../src/core/types.js';

describe('Gitignore', () => {
  let testDir: string;

  const cursorAdapter: EditorAdapter = {
    name: 'cursor',
    fileNaming: 'flat',
    entryPoint: '.cursorrules',
    mcpConfigPath: '.cursor/mcp.json',
    directories: {
      rules: '.cursor/rules',
    },
  };

  const claudeAdapter: EditorAdapter = {
    name: 'claude',
    fileNaming: 'flat',
    entryPoint: 'CLAUDE.md',
    directories: {
      rules: '.claude/rules',
      skills: '.claude/skills',
    },
  };

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'ai-toolkit-gitignore-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should create .gitignore with managed block when none exists', async () => {
    await updateGitignore(testDir, [cursorAdapter]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('Chain managed');
    expect(content).toContain('.cursor/mcp.json');
  });

  it('should append managed block to existing .gitignore', async () => {
    await writeFile(join(testDir, '.gitignore'), 'node_modules/\ndist/\n');

    await updateGitignore(testDir, [cursorAdapter]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('dist/');
    expect(content).toContain('Chain managed');
    expect(content).toContain('.cursor/mcp.json');
  });

  it('should replace existing managed block', async () => {
    const claudeWithMcp = { ...claudeAdapter, mcpConfigPath: '.claude/settings.json' };
    await updateGitignore(testDir, [cursorAdapter]);

    await updateGitignore(testDir, [cursorAdapter, claudeWithMcp]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('.cursor/mcp.json');
    expect(content).toContain('.claude/settings.json');

    const startCount = (content.match(/Chain managed \(DO NOT EDIT\)/g) || []).length;
    expect(startCount).toBe(1);
  });

  it('should include MCP config paths in gitignore', async () => {
    const claudeWithMcp = { ...claudeAdapter, mcpConfigPath: '.claude/settings.json' };
    await updateGitignore(testDir, [cursorAdapter, claudeWithMcp]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('.cursor/mcp.json');
    expect(content).toContain('.claude/settings.json');
  });

  it('should include MCP config paths in gitignore', async () => {
    await updateGitignore(testDir, [cursorAdapter]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('.cursor/mcp.json');
  });

  it('should sort paths alphabetically within managed block', async () => {
    const claudeWithMcp = { ...claudeAdapter, mcpConfigPath: '.claude/settings.json' };
    await updateGitignore(testDir, [cursorAdapter, claudeWithMcp]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    const startMarker = '# >>> Chain managed (DO NOT EDIT) >>>';
    const endMarker = '# <<< Chain managed <<<';
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);
    const block = content.substring(startIdx + startMarker.length, endIdx).trim();
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    const sorted = [...lines].sort();
    expect(lines).toEqual(sorted);
  });

  it('should preserve content outside managed block', async () => {
    await writeFile(
      join(testDir, '.gitignore'),
      'node_modules/\n\n# Custom\n*.log\n',
    );

    await updateGitignore(testDir, [cursorAdapter]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('*.log');
    expect(content).toContain('.cursor/mcp.json');
  });

  it('should deduplicate MCP config paths', async () => {
    const adapter1: EditorAdapter = {
      name: 'test',
      fileNaming: 'flat',
      mcpConfigPath: '.test/mcp.json',
      directories: { rules: '.test/rules' },
    };
    const adapter2: EditorAdapter = {
      ...adapter1,
      name: 'test2',
      mcpConfigPath: '.test/mcp.json',
    };

    await updateGitignore(testDir, [adapter1, adapter2]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    const mcpCount = (content.match(/\.test\/mcp\.json/g) || []).length;
    expect(mcpCount).toBe(1);
  });

  it('should only add mcpConfigPath for adapters that have it', async () => {
    const adapterWithoutMcp: EditorAdapter = {
      name: 'no-mcp',
      fileNaming: 'flat',
      directories: { rules: '.no-mcp/rules' },
    };
    await updateGitignore(testDir, [adapterWithoutMcp]);

    const content = await readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(content).not.toContain('.no-mcp/rules');
  });
});
