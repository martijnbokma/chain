import { join, resolve, isAbsolute } from "path";
import { homedir } from "os";
import { createRequire } from "module";
import type { ContentSource, ContentFile } from '../core/types.js';
import { RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR } from '../core/types.js';
import { findMarkdownFiles, fileExists } from '../utils/file-ops.js';
import { log } from '../utils/logger.js';

type ContentCategory = 'rules' | 'skills' | 'workflows';

interface ResolvedContent {
  rules: ContentFile[];
  skills: ContentFile[];
  workflows: ContentFile[];
}

export interface ResolveContentSourcesOptions {
  /** When true, suppresses log output (e.g. for MCP server stdio mode) */
  silent?: boolean;
}

/**
 * Resolves content from external sources (local paths or npm packages).
 * Merges them with the project's .chain/ files.
 */
export async function resolveContentSources(
  projectRoot: string,
  sources: ContentSource[],
  options: ResolveContentSourcesOptions = {},
): Promise<ResolvedContent> {
  const { silent = false } = options;
  const result: ResolvedContent = {
    rules: [],
    skills: [],
    workflows: [],
  };

  for (const source of sources) {
    try {
      const sourceRoot = await resolveSourcePath(projectRoot, source, { silent });
      if (!sourceRoot) {
        if (!silent) {
          log.warn(`Content source not found: ${source.type === 'local' ? source.path : source.name}`);
        }
        continue;
      }

      const categories: ContentCategory[] = source.include ?? ['rules', 'skills', 'workflows'];
      const label = source.type === 'local' ? source.path! : source.name!;

      for (const category of categories) {
        const dirName = CATEGORY_DIRS[category];
        const contentDir = join(sourceRoot, dirName);
        const exists = await fileExists(contentDir);

        if (!exists) continue;

        const files = await findMarkdownFiles(contentDir, contentDir);
        if (files.length > 0) {
          if (!silent) {
            log.info(`${label}: found ${files.length} ${category}`);
          }
          result[category].push(...files);
        }
      }
    } catch (error) {
      if (!silent) {
        log.error(
          `Failed to resolve content source: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  return result;
}

export async function resolveSourcePath(
  projectRoot: string,
  source: ContentSource,
  options: { silent?: boolean } = {},
): Promise<string | null> {
  const { silent = false } = options;

  if (source.type === 'local') {
    if (!source.path) {
      if (!silent) log.error('Local content source requires a "path" field');
      return null;
    }

    const expandedPath = source.path.startsWith("~")
      ? source.path.replace(/^~/, homedir())
      : source.path;
    const resolved = isAbsolute(expandedPath)
      ? expandedPath
      : resolve(projectRoot, expandedPath);

    const exists = await fileExists(resolved);
    if (!exists) return null;

    // Look for .chain/, templates/, or use the path directly
    const candidates = [
      join(resolved, '.chain'),
      join(resolved, 'templates'),
    ];

    for (const candidate of candidates) {
      if (await fileExists(candidate)) return candidate;
    }

    return resolved;
  }

  if (source.type === 'package') {
    if (!source.name) {
      if (!silent) log.error('Package content source requires a "name" field');
      return null;
    }

    return await resolvePackagePath(projectRoot, source.name, { silent });
  }

  return null;
}

async function resolvePackagePath(
  projectRoot: string,
  packageName: string,
  options: { silent?: boolean } = {},
): Promise<string | null> {
  const { silent = false } = options;
  try {
    // Use createRequire from the project root to find the package
    const require = createRequire(join(projectRoot, 'package.json'));
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    const packageRoot = join(packageJsonPath, '..');

    // Look for .chain/ or content/ or use package root
    const candidates = [
      join(packageRoot, '.chain'),
      join(packageRoot, 'content'),
    ];

    for (const candidate of candidates) {
      if (await fileExists(candidate)) return candidate;
    }

    return packageRoot;
  } catch {
    if (!silent) {
      log.warn(`Package "${packageName}" not found. Install it first: bun add -d ${packageName}`);
    }
    return null;
  }
}

const CATEGORY_DIRS: Record<ContentCategory, string> = {
  rules: RULES_DIR,
  skills: SKILLS_DIR,
  workflows: WORKFLOWS_DIR,
};
