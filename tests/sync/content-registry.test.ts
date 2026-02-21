import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { ContentRegistry } from '../../src/sync/content-registry.js';

describe('ContentRegistry', () => {
  let projectRoot: string;
  let registry: ContentRegistry;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'content-registry-'));
    registry = new ContentRegistry(projectRoot);
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should initialize new registry when load fails', async () => {
    await registry.load();

    const stats = registry.getStats();
    expect(stats.totalItems).toBe(0);
    expect(stats.conflicts).toBe(0);
    expect(stats.orphans).toBe(0);
  });

  it('should register content and return id', async () => {
    const content = '# My Skill\nDo something useful.';
    const id = await registry.registerContent(content, 'skills/my-skill.md', 'skill');

    expect(id).toBeDefined();
    expect(id).toHaveLength(64);

    const meta = registry.getContent(id);
    expect(meta).toBeDefined();
    expect(meta?.name).toBe('my-skill');
    expect(meta?.type).toBe('skill');
    expect(meta?.version).toBe(1);
  });

  it('should get content by path', async () => {
    await registry.registerContent('# Rule', 'rules/test-rule.md', 'rule');

    const meta = registry.getContentByPath('rules/test-rule.md');
    expect(meta).toBeDefined();
    expect(meta?.name).toBe('test-rule');
  });

  it('should find content by type', async () => {
    await registry.registerContent('# Skill', 'skills/a.md', 'skill');
    await registry.registerContent('# Rule', 'rules/b.md', 'rule');

    const skills = registry.findContent({ type: 'skill' });
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('a');

    const rules = registry.findContent({ type: 'rule' });
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe('b');
  });

  it('should return stats', async () => {
    await registry.registerContent('# A', 'skills/a.md', 'skill');
    await registry.registerContent('# B', 'rules/b.md', 'rule');

    const stats = registry.getStats();
    expect(stats.totalItems).toBe(2);
    expect(stats.byType.skill).toBe(1);
    expect(stats.byType.rule).toBe(1);
  });

  it('should persist and load registry', async () => {
    await registry.registerContent('# Persisted', 'skills/persist.md', 'skill');
    await registry.save();

    const registry2 = new ContentRegistry(projectRoot);
    await registry2.load();

    const meta = registry2.getContentByPath('skills/persist.md');
    expect(meta).toBeDefined();
    expect(meta?.name).toBe('persist');
  });

  it('should increment version on re-register', async () => {
    const content = '# Same content';
    const id1 = await registry.registerContent(content, 'skills/v.md', 'skill');
    const id2 = await registry.registerContent(content, 'skills/v.md', 'skill');

    expect(id1).toBe(id2);
    const meta = registry.getContent(id1);
    expect(meta?.version).toBe(2);
  });
});
