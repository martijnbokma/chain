import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { analyzeStructure } from '../../../src/sync/analyzers/structure-analyzer.js';

describe('analyzeStructure', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'structure-analyzer-'));
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should return empty structure for minimal project', async () => {
    const result = await analyzeStructure(projectRoot);

    expect(result.srcDir).toBeNull();
    expect(result.isFeatureBased).toBe(false);
    expect(result.features).toEqual([]);
    expect(result.hasSharedDir).toBe(false);
    expect(result.directoryTree).toBeDefined();
    expect(result.patterns.hasTestFiles).toBe(false);
  });

  it('should detect src directory', async () => {
    await mkdir(join(projectRoot, 'src'), { recursive: true });

    const result = await analyzeStructure(projectRoot);

    expect(result.srcDir).toBe('src');
  });

  it('should detect config files at project root', async () => {
    await writeFile(join(projectRoot, 'tsconfig.json'), '{}');
    await writeFile(join(projectRoot, 'package.json'), '{}');

    const result = await analyzeStructure(projectRoot);

    expect(result.configFiles).toContain('tsconfig.json');
  });

  it('should detect feature-based architecture', async () => {
    await mkdir(join(projectRoot, 'src', 'features', 'auth'), { recursive: true });
    await writeFile(join(projectRoot, 'src', 'features', 'auth', 'index.ts'), '');

    const result = await analyzeStructure(projectRoot);

    expect(result.isFeatureBased).toBe(true);
    expect(result.features).toHaveLength(1);
    expect(result.features[0]?.name).toBe('auth');
    expect(result.features[0]?.hasIndex).toBe(true);
    expect(result.patterns.hasModularBoundaries).toBe(true);
  });

  it('should detect shared directory', async () => {
    await mkdir(join(projectRoot, 'src', 'shared', 'utils'), { recursive: true });

    const result = await analyzeStructure(projectRoot);

    expect(result.hasSharedDir).toBe(true);
    expect(result.sharedSubdirs).toContain('utils');
  });

  it('should detect entry points', async () => {
    await mkdir(join(projectRoot, 'src'), { recursive: true });
    await writeFile(join(projectRoot, 'src', 'main.tsx'), '');

    const result = await analyzeStructure(projectRoot);

    expect(result.entryPoints).toContain('main.tsx');
  });

  it('should detect test files pattern', async () => {
    await mkdir(join(projectRoot, 'src'), { recursive: true });
    await writeFile(join(projectRoot, 'src', 'foo.test.ts'), '');

    const result = await analyzeStructure(projectRoot);

    expect(result.patterns.hasTestFiles).toBe(true);
  });

  it('should build directory tree', async () => {
    await mkdir(join(projectRoot, 'src', 'components'), { recursive: true });
    await writeFile(join(projectRoot, 'src', 'main.tsx'), '');
    await writeFile(join(projectRoot, 'src', 'components', 'Button.tsx'), '');

    const result = await analyzeStructure(projectRoot);

    expect(result.directoryTree.length).toBeGreaterThan(0);
    const srcNode = result.directoryTree.find((n) => n.name === 'src');
    expect(srcNode).toBeDefined();
    expect(srcNode?.type).toBe('directory');
    expect(srcNode?.children).toBeDefined();
  });
});
