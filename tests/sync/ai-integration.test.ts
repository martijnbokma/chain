import { describe, it, expect, beforeEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { AIIntegration } from '../../src/sync/ai-integration.js';

describe('AIIntegration', () => {
  let projectRoot: string;
  let ai: AIIntegration;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'ai-integration-'));
    ai = new AIIntegration(projectRoot, {
      provider: 'local',
      model: 'mock',
    });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('should analyze content and return structured result', async () => {
    const content = '# My Skill\nDo something useful.';
    const result = await ai.analyzeContent(content, 'skills/my-skill.md');

    expect(result.quality).toBeDefined();
    expect(result.quality.score).toBeGreaterThanOrEqual(1);
    expect(result.quality.score).toBeLessThanOrEqual(10);
    expect(result.content.purpose).toBeDefined();
    expect(result.content.category).toMatch(/skill|rule|workflow/);
    expect(result.relationships).toBeDefined();
    expect(result.improvements).toBeDefined();
  });

  it('should perform AI merge and return merged content', async () => {
    const local = '# Local\nVersion A';
    const remote = '# Remote\nVersion B';

    const result = await ai.performAIMerge(local, remote);

    expect(result.mergedContent).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.conflicts).toBeInstanceOf(Array);
    expect(result.improvements).toBeInstanceOf(Array);
  });

  it('should suggest improvements', async () => {
    const content = '# Skill\nBasic content.';
    const suggestions = await ai.suggestImprovements(content, 'skills/basic.md');

    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should generate summary', async () => {
    const content = '# My Rule\nDo the right thing.';
    const summary = await ai.generateSummary(content);

    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });

  it('should extract metadata', async () => {
    const content = '# Skill\nContent with tags.';
    const meta = await ai.extractMetadata(content);

    expect(meta.tags).toBeInstanceOf(Array);
    expect(meta.category).toBeDefined();
    expect(meta.complexity).toMatch(/low|medium|high/);
    expect(meta.purpose).toBeDefined();
  });

  it('should return valid result structure for any content', async () => {
    const content = 'x';
    const result = await ai.analyzeContent(content, 'skills/minimal.md');

    expect(result.quality).toBeDefined();
    expect(result.quality.score).toBeGreaterThanOrEqual(1);
    expect(result.content.category).toMatch(/skill|rule|workflow/);
    expect(Array.isArray(result.improvements)).toBe(true);
  });
});
