import { describe, it, expect } from 'vitest';
import { generateRichProjectContext } from '../../src/sync/context-generator.js';
import type { ProjectAnalysis } from '../../src/sync/analyzers/index.js';

function minimalAnalysis(overrides: Partial<ProjectAnalysis> = {}): ProjectAnalysis {
  return {
    projectName: 'TestProject',
    description: 'A test project',
    packageInfo: null,
    dependencies: null,
    scripts: null,
    architecture: {
      srcDir: 'src',
      isFeatureBased: false,
      features: [],
      hasSharedDir: false,
      sharedSubdirs: [],
      contexts: [],
      layouts: [],
      pages: [],
      hooks: [],
      entryPoints: ['main.tsx'],
      configFiles: ['tsconfig.json'],
      directoryTree: [
        { name: 'src', type: 'directory', children: [{ name: 'main.tsx', type: 'file' }] },
      ],
      patterns: {
        hasModularBoundaries: false,
        hasServiceLayer: false,
        hasHookLayer: false,
        hasTypeDefinitions: false,
        hasTestFiles: false,
        testPattern: 'none',
        hasI18n: false,
        i18nLanguages: [],
        componentNaming: 'mixed',
      },
    },
    database: null,
    techStack: {
      language: 'TypeScript',
      framework: '',
      database: '',
      runtime: '',
      buildTool: '',
      testing: [],
      styling: [],
      linting: [],
      uiLibrary: null,
      stateManagement: null,
      auth: [],
    },
    ...overrides,
  };
}

describe('generateRichProjectContext', () => {
  it('should return non-empty string', () => {
    const analysis = minimalAnalysis();
    const result = generateRichProjectContext(analysis);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include project name in header', () => {
    const analysis = minimalAnalysis({ projectName: 'MyApp' });
    const result = generateRichProjectContext(analysis);
    expect(result).toContain('# MyApp - Project Context');
  });

  it('should include Overview section', () => {
    const result = generateRichProjectContext(minimalAnalysis());
    expect(result).toContain('## Overview');
  });

  it('should include Technology Stack section', () => {
    const result = generateRichProjectContext(minimalAnalysis());
    expect(result).toContain('## Technology Stack');
  });

  it('should include Architecture Patterns section', () => {
    const result = generateRichProjectContext(minimalAnalysis());
    expect(result).toContain('## Architecture Patterns');
  });

  it('should include Project Structure section', () => {
    const result = generateRichProjectContext(minimalAnalysis());
    expect(result).toContain('## Project Structure');
  });

  it('should include Notes for AI Agents section', () => {
    const result = generateRichProjectContext(minimalAnalysis());
    expect(result).toContain('## Notes for AI Agents');
    expect(result).toContain('End of Project Context');
  });

  it('should include database section when database is present', () => {
    const analysis = minimalAnalysis({
      database: {
        provider: 'Supabase',
        hasMigrations: false,
        migrations: [],
        tables: [{ name: 'users', fields: ['id', 'email'], hasRLS: true }],
        hasRLS: true,
        hasEdgeFunctions: false,
        edgeFunctions: [],
        configFile: 'supabase/config.toml',
      },
    });
    const result = generateRichProjectContext(analysis);
    expect(result).toContain('## Database Schema');
    expect(result).toContain('Supabase');
    expect(result).toContain('users');
  });

  it('should include testing section when hasTestFiles is true', () => {
    const analysis = minimalAnalysis({
      architecture: {
        ...minimalAnalysis().architecture,
        patterns: {
          ...minimalAnalysis().architecture.patterns,
          hasTestFiles: true,
          testPattern: 'colocated',
        },
      },
    });
    const result = generateRichProjectContext(analysis);
    expect(result).toContain('## Testing');
  });

  it('should use description when provided', () => {
    const analysis = minimalAnalysis({ description: 'My custom description' });
    const result = generateRichProjectContext(analysis);
    expect(result).toContain('My custom description');
  });
});
