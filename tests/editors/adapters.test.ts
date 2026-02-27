import { describe, it, expect } from 'vitest';
import { getAllAdapters, getAdapter, getEnabledAdapters, getAllEditorDirs } from '../../src/editors/registry.js';
import { AUTO_GENERATED_MARKER } from '../../src/core/types.js';
import type { ToolkitConfig } from '../../src/core/types.js';

const configWithStack: ToolkitConfig = {
  version: '1.0',
  editors: {},
  metadata: { name: 'MyApp', description: 'A cool app' },
  tech_stack: {
    language: 'TypeScript',
    framework: 'Next.js',
    database: 'PostgreSQL',
  },
};

const configMinimal: ToolkitConfig = {
  version: '1.0',
  editors: {},
};

describe('Editor Adapters — generateEntryPointContent', () => {
  const adaptersWithEntryPoint = getAllAdapters().filter((a) => a.entryPoint && a.generateEntryPointContent);

  it('should have adapters with entry points', () => {
    expect(adaptersWithEntryPoint.length).toBeGreaterThanOrEqual(1);
  });

  for (const adapter of adaptersWithEntryPoint) {
    describe(adapter.name, () => {
      it('should include AUTO_GENERATED_MARKER', () => {
        const content = adapter.generateEntryPointContent!(configWithStack);
        expect(content).toContain(AUTO_GENERATED_MARKER);
      });

      it('should include project name from config', () => {
        const content = adapter.generateEntryPointContent!(configWithStack);
        expect(content).toContain('MyApp');
      });

      it('should use fallback name when metadata is missing', () => {
        const content = adapter.generateEntryPointContent!(configMinimal);
        expect(content).toContain('Project');
      });

      it('should include tech stack when provided', () => {
        const content = adapter.generateEntryPointContent!(configWithStack);
        expect(content).toContain('TypeScript');
        expect(content).toContain('Next.js');
      });

      it('should return non-empty string', () => {
        const content = adapter.generateEntryPointContent!(configMinimal);
        expect(content.length).toBeGreaterThan(0);
      });

      it('should include description when provided', () => {
        const content = adapter.generateEntryPointContent!(configWithStack);
        expect(content).toContain('A cool app');
      });
    });
  }
});

describe('Editor Adapters — generateFrontmatter', () => {
  const adaptersWithFrontmatter = getAllAdapters().filter((a) => a.generateFrontmatter);

  it('should have at least 1 adapter with frontmatter support', () => {
    expect(adaptersWithFrontmatter.length).toBeGreaterThanOrEqual(1);
  });

  for (const adapter of adaptersWithFrontmatter) {
    describe(adapter.name, () => {
      it('should return valid YAML frontmatter', () => {
        const fm = adapter.generateFrontmatter!('my-skill');
        expect(fm).toContain('---');
        expect(fm.length).toBeGreaterThan(0);
      });

      it('should not crash with description argument', () => {
        const fm = adapter.generateFrontmatter!('test', 'A test skill');
        expect(fm.length).toBeGreaterThan(0);
      });
    });
  }
});

describe('Editor Adapters — kiro (custom generateEntryPointContent)', () => {
  it('should generate entry point with project name', () => {
    const kiro = getAdapter('kiro')!;
    const content = kiro.generateEntryPointContent!(configWithStack);
    expect(content).toContain(AUTO_GENERATED_MARKER);
    expect(content).toContain('MyApp');
    expect(content).toContain('Project Steering');
  });

  it('should include tech stack', () => {
    const kiro = getAdapter('kiro')!;
    const content = kiro.generateEntryPointContent!(configWithStack);
    expect(content).toContain('TypeScript');
    expect(content).toContain('Next.js');
    expect(content).toContain('Project Context');
  });

  it('should include description', () => {
    const kiro = getAdapter('kiro')!;
    const content = kiro.generateEntryPointContent!(configWithStack);
    expect(content).toContain('A cool app');
  });

  it('should use fallback name when no metadata', () => {
    const kiro = getAdapter('kiro')!;
    const content = kiro.generateEntryPointContent!(configMinimal);
    expect(content).toContain('Project');
  });

  it('should handle config without tech_stack', () => {
    const kiro = getAdapter('kiro')!;
    const content = kiro.generateEntryPointContent!(configMinimal);
    expect(content).not.toContain('Project Context');
  });
});

describe('Editor Adapters — base-adapter wrapContent', () => {
  it('should wrap content with auto-generated marker and source path', () => {
    // All adapters inherit wrapContent from BaseEditorAdapter
    const cursor = getAdapter('cursor')! as any;
    if (typeof cursor.wrapContent === 'function') {
      const result = cursor.wrapContent('# My Rule', '.chain/rules/test.md');
      expect(result).toContain(AUTO_GENERATED_MARKER);
      expect(result).toContain('Source: .chain/rules/test.md');
      expect(result).toContain('# My Rule');
    }
  });
});

describe('Editor Registry — custom_editors', () => {
  it('should build and enable custom editors', () => {
    const config: ToolkitConfig = {
      version: '1.0',
      editors: { 'my-editor': true },
      custom_editors: [
        {
          name: 'my-editor',
          rules_dir: '.my-editor/rules',
          skills_dir: '.my-editor/skills',
          workflows_dir: '.my-editor/workflows',
          entry_point: '.my-editorrules',
          mcp_config_path: '.my-editor/mcp.json',
          file_naming: 'flat',
        },
      ],
    };
    const enabled = getEnabledAdapters(config);
    const custom = enabled.find((a) => a.name === 'my-editor');
    expect(custom).toBeDefined();
    expect(custom!.directories.rules).toBe('.my-editor/rules');
    expect(custom!.directories.skills).toBe('.my-editor/skills');
    expect(custom!.directories.workflows).toBe('.my-editor/workflows');
    expect(custom!.entryPoint).toBe('.my-editorrules');
    expect(custom!.mcpConfigPath).toBe('.my-editor/mcp.json');
  });

  it('should generate entry point content for custom editors', () => {
    const config: ToolkitConfig = {
      version: '1.0',
      editors: { 'my-editor': true },
      metadata: { name: 'TestApp', description: 'Desc' },
      custom_editors: [
        { name: 'my-editor', rules_dir: '.my/rules', file_naming: 'flat' },
      ],
    };
    const enabled = getEnabledAdapters(config);
    const custom = enabled.find((a) => a.name === 'my-editor')!;
    const content = custom.generateEntryPointContent!(config);
    expect(content).toContain(AUTO_GENERATED_MARKER);
    expect(content).toContain('TestApp');
    expect(content).toContain('my-editor');
    expect(content).toContain('Desc');
  });

  it('should enable custom editors by default when defined', () => {
    const config: ToolkitConfig = {
      version: '1.0',
      editors: { cursor: true },
      custom_editors: [
        { name: 'my-editor', rules_dir: '.my/rules', file_naming: 'flat' },
      ],
    };
    const enabled = getEnabledAdapters(config);
    expect(enabled.some((a) => a.name === 'my-editor')).toBe(true);
    expect(enabled.some((a) => a.name === 'cursor')).toBe(true);
  });
});

describe('Editor Registry — getAllEditorDirs', () => {
  it('should return unique MCP config paths from all adapters', () => {
    const dirs = getAllEditorDirs();
    expect(dirs.length).toBeGreaterThan(0);
    expect(dirs.length).toBe(new Set(dirs).size);
    expect(dirs).toContain('.cursor/mcp.json');
    expect(dirs).toContain('.claude/settings.json');
  });
});

describe('Editor Adapters — specific adapters', () => {
  it('cursor should have correct directories', () => {
    const cursor = getAdapter('cursor')!;
    expect(cursor.directories.rules).toBe('.cursor/rules');
    expect(cursor.directories.skills).toBe('.cursor/commands');
    expect(cursor.entryPoint).toBe('.cursorrules');
    expect(cursor.mcpConfigPath).toBe('.cursor/mcp.json');
  });

  it('claude should have correct directories and frontmatter', () => {
    const claude = getAdapter('claude')!;
    expect(claude.directories.rules).toBe('.claude/rules');
    expect(claude.directories.skills).toBe('.claude/skills');
    expect(claude.entryPoint).toBe('CLAUDE.md');
    expect(claude.mcpConfigPath).toBe('.claude/settings.json');

    const fm = claude.generateFrontmatter!('code-review');
    expect(fm).toContain('name: code-review');
    expect(fm).toContain('---');
  });

  it('claude frontmatter should include description when provided', () => {
    const claude = getAdapter('claude')!;
    const fm = claude.generateFrontmatter!('review', 'Review code');
    expect(fm).toContain('name: review');
    expect(fm).toContain('description: Review code');
  });

  it('kiro should have correct directories and mcp path', () => {
    const kiro = getAdapter('kiro')!;
    expect(kiro.directories.rules).toBe('.kiro/steering');
    expect(kiro.mcpConfigPath).toBe('.kiro/settings/mcp.json');
  });

  it('roo should have mcp config path', () => {
    const roo = getAdapter('roo')!;
    expect(roo.mcpConfigPath).toBe('.roo/mcp.json');
  });

  it('amazonq should have mcp config path', () => {
    const amazonq = getAdapter('amazonq')!;
    expect(amazonq.mcpConfigPath).toBe('.amazonq/default.json');
  });
});
