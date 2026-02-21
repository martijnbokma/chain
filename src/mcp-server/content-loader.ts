import { join } from 'path';
import type { ContentFile, ToolkitConfig } from '../core/types.js';
import {
  CONTENT_DIR,
  RULES_DIR,
  SKILLS_DIR,
  WORKFLOWS_DIR,
  PROJECT_CONTEXT_FILE,
} from '../core/types.js';
import { resolveContentSources } from '../sync/content-resolver.js';
import { findMarkdownFiles, fileExists, readTextFile } from '../utils/file-ops.js';

export interface LoadedContent {
  rules: ContentFile[];
  skills: ContentFile[];
  workflows: ContentFile[];
  projectContext: string;
}

/**
 * Loads and merges content from .chain/ and content_sources.
 * Local .chain/ files override external content (same merge logic as sync).
 */
export async function loadChainContent(
  projectRoot: string,
  config: ToolkitConfig,
): Promise<LoadedContent> {
  const contentDir = join(projectRoot, CONTENT_DIR);
  const external = await resolveContentSources(
    projectRoot,
    config.content_sources ?? [],
    { silent: true },
  );

  const rules = await mergeContent(
    contentDir,
    RULES_DIR,
    external.rules,
  );
  const skills = await mergeContent(
    contentDir,
    SKILLS_DIR,
    external.skills,
  );
  const workflows = await mergeContent(
    contentDir,
    WORKFLOWS_DIR,
    external.workflows,
  );

  let projectContext = '';
  const projectContextPath = join(contentDir, PROJECT_CONTEXT_FILE);
  if (await fileExists(projectContextPath)) {
    const raw = await readTextFile(projectContextPath);
    const stripped = raw.replace(/<!--.*?-->/gs, '').trim();
    if (stripped.length > 0) {
      projectContext = raw.trim();
    }
  }

  return {
    rules,
    skills,
    workflows,
    projectContext,
  };
}

async function mergeContent(
  contentDir: string,
  dir: string,
  externalFiles: ContentFile[],
): Promise<ContentFile[]> {
  const localDir = join(contentDir, dir);
  let localFiles: ContentFile[] = [];
  try {
    localFiles = await findMarkdownFiles(localDir, localDir);
  } catch {
    // Directory doesn't exist
  }

  const localPaths = new Set(localFiles.map((f) => f.relativePath));
  return [
    ...externalFiles.filter((f) => !localPaths.has(f.relativePath)),
    ...localFiles,
  ];
}
