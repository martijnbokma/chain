import { join, relative, extname } from 'path';
import { stat, readFile, writeFile } from 'fs/promises';
import type { ContentFile } from '../core/types.js';
import { findMarkdownFiles, ensureDir, writeTextFile } from '../utils/file-ops.js';
import { log } from '../utils/logger.js';

interface SyncConflict {
  templatePath: string;
  aiContentPath: string;
  templateMtime: Date;
  aiContentMtime: Date;
  winner: 'template' | 'ai-content';
}

interface SyncResult {
  copied: Array<{ from: string; to: string }>;
  updated: Array<{ path: string; reason: string }>;
  conflicts: SyncConflict[];
  errors: string[];
}

/**
 * Synchronizes templates/ with .chain/ using newest-wins logic
 */
export async function syncTemplatesWithAiContent(
  projectRoot: string,
  dryRun: boolean = false
): Promise<SyncResult> {
  const result: SyncResult = {
    copied: [],
    updated: [],
    conflicts: [],
    errors: []
  };

  const templatesDir = join(projectRoot, 'templates');
  const aiContentDir = join(projectRoot, '.chain');

  const contentTypes = ['rules', 'skills', 'workflows'];
  
  // Handle PROJECT.md / project-context.md
  await syncProjectContext(projectRoot, result, dryRun);

  // Sync each content type
  for (const contentType of contentTypes) {
    await syncContentType(templatesDir, aiContentDir, contentType as 'rules' | 'skills' | 'workflows', result, dryRun);
  }

  return result;
}

async function syncProjectContext(
  projectRoot: string,
  result: SyncResult,
  dryRun: boolean
): Promise<void> {
  const templatesProjectContext = join(projectRoot, 'templates', 'project-context.md');
  const aiContentProjectContext = join(projectRoot, '.chain', 'PROJECT.md');

  try {
    const templateExists = await fileExists(templatesProjectContext);
    const aiContentExists = await fileExists(aiContentProjectContext);

    if (!templateExists && !aiContentExists) {
      return;
    }

    if (templateExists && !aiContentExists) {
      // Copy template to .chain
      if (!dryRun) {
        await ensureDir(join(projectRoot, '.chain'));
        const content = await readFile(templatesProjectContext, 'utf-8');
        await writeFile(aiContentProjectContext, content, 'utf-8');
      }
      result.copied.push({ from: templatesProjectContext, to: aiContentProjectContext });
      result.updated.push({ path: aiContentProjectContext, reason: 'Copied from templates' });
      log.info(`✓ templates/project-context.md → .chain/PROJECT.md`);
    } else if (!templateExists && aiContentExists) {
      // Copy .chain to templates
      if (!dryRun) {
        await ensureDir(join(projectRoot, 'templates'));
        const content = await readFile(aiContentProjectContext, 'utf-8');
        await writeFile(templatesProjectContext, content, 'utf-8');
      }
      result.copied.push({ from: aiContentProjectContext, to: templatesProjectContext });
      result.updated.push({ path: templatesProjectContext, reason: 'Copied from .chain' });
      log.info(`✓ .chain/PROJECT.md → templates/project-context.md`);
    } else {
      // Both exist - compare modification times
      const templateStat = await stat(templatesProjectContext);
      const aiContentStat = await stat(aiContentProjectContext);

      if (templateStat.mtime > aiContentStat.mtime) {
        // Template is newer
        if (!dryRun) {
          const content = await readFile(templatesProjectContext, 'utf-8');
          await writeFile(aiContentProjectContext, content, 'utf-8');
        }
        result.updated.push({ path: aiContentProjectContext, reason: 'Template is newer' });
        log.info(`✓ templates/project-context.md → .chain/PROJECT.md`);
      } else if (aiContentStat.mtime > templateStat.mtime) {
        // .chain is newer
        if (!dryRun) {
          const content = await readFile(aiContentProjectContext, 'utf-8');
          await writeFile(templatesProjectContext, content, 'utf-8');
        }
        result.updated.push({ path: templatesProjectContext, reason: '.chain is newer' });
        log.info(`✓ .chain/PROJECT.md → templates/project-context.md`);
      }
    }
  } catch (error) {
    const msg = `Failed to sync project context: ${error instanceof Error ? error.message : error}`;
    log.error(msg);
    result.errors.push(msg);
  }
}

async function syncContentType(
  templatesDir: string,
  aiContentDir: string,
  contentType: 'rules' | 'skills' | 'workflows',
  result: SyncResult,
  dryRun: boolean
): Promise<void> {
  const templatesContentDir = join(templatesDir, contentType);
  const aiContentContentDir = join(aiContentDir, contentType);

  try {
    // Get all files in both directories
    const templateFiles = await findMarkdownFiles(templatesContentDir, templatesContentDir);
    const aiContentFiles = await findMarkdownFiles(aiContentContentDir, aiContentContentDir);

    // Create a map of all files by relative path
    const allFiles = new Map<string, { template?: ContentFile; aiContent?: ContentFile }>();

    // Add template files
    for (const file of templateFiles) {
      const key = file.relativePath;
      if (!allFiles.has(key)) {
        allFiles.set(key, {});
      }
      allFiles.get(key)!.template = file;
    }

    // Add .chain files
    for (const file of aiContentFiles) {
      const key = file.relativePath;
      if (!allFiles.has(key)) {
        allFiles.set(key, {});
      }
      allFiles.get(key)!.aiContent = file;
    }

    // Process each file
    for (const [relativePath, files] of allFiles) {
      await syncFile(
        templatesDir,
        aiContentDir,
        contentType,
        relativePath,
        files,
        result,
        dryRun
      );
    }
  } catch (error) {
    const msg = `Failed to sync ${contentType}: ${error instanceof Error ? error.message : error}`;
    log.error(msg);
    result.errors.push(msg);
  }
}

async function syncFile(
  templatesDir: string,
  aiContentDir: string,
  contentType: string,
  relativePath: string,
  files: { template?: ContentFile; aiContent?: ContentFile },
  result: SyncResult,
  dryRun: boolean
): Promise<void> {
  const templatePath = files.template ? join(templatesDir, contentType, relativePath) : null;
  const aiContentPath = files.aiContent ? join(aiContentDir, contentType, relativePath) : null;

  try {
    if (templatePath && !aiContentPath) {
      // Only exists in templates - copy to .chain
      const targetPath = join(aiContentDir, contentType, relativePath);
      if (!dryRun) {
        await ensureDir(join(aiContentDir, contentType, relativePath, '..'));
        await writeTextFile(targetPath, files.template!.content);
      }
      result.copied.push({ from: templatePath, to: targetPath });
      result.updated.push({ path: targetPath, reason: 'Copied from templates' });
      log.info(`✓ templates/${contentType}/${relativePath} → .chain/${contentType}/${relativePath}`);
    } else if (!templatePath && aiContentPath) {
      // Only exists in .chain - copy to templates
      const targetPath = join(templatesDir, contentType, relativePath);
      if (!dryRun) {
        await ensureDir(join(templatesDir, contentType, relativePath, '..'));
        await writeTextFile(targetPath, files.aiContent!.content);
      }
      result.copied.push({ from: aiContentPath, to: targetPath });
      result.updated.push({ path: targetPath, reason: 'Copied from .chain' });
      log.info(`✓ .chain/${contentType}/${relativePath} → templates/${contentType}/${relativePath}`);
    } else if (templatePath && aiContentPath) {
      // Exists in both - compare modification times
      const templateStat = await stat(templatePath);
      const aiContentStat = await stat(aiContentPath);

      if (templateStat.mtime > aiContentStat.mtime) {
        // Template is newer
        if (!dryRun) {
          await writeTextFile(aiContentPath, files.template!.content);
        }
        result.updated.push({ path: aiContentPath, reason: 'Template is newer' });
        log.info(`✓ templates/${contentType}/${relativePath} → .chain/${contentType}/${relativePath}`);
      } else if (aiContentStat.mtime > templateStat.mtime) {
        // .chain is newer
        if (!dryRun) {
          await writeTextFile(templatePath, files.aiContent!.content);
        }
        result.updated.push({ path: templatePath, reason: '.chain is newer' });
        log.info(`✓ .chain/${contentType}/${relativePath} → templates/${contentType}/${relativePath}`);
      }
    }
  } catch (error) {
    const msg = `Failed to sync ${relativePath}: ${error instanceof Error ? error.message : error}`;
    log.error(msg);
    result.errors.push(msg);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function printSyncResult(result: SyncResult): void {
  const total = result.copied.length + result.updated.length;
  
  if (total > 0) {
    log.success(`\n✅ Sync completed: ${total} files processed`);
    log.info(`📁 Copied: ${result.copied.length} files`);
    log.info(`🔄 Updated: ${result.updated.length} files`);
  } else {
    log.info(`\n✅ No sync needed - all files are up to date`);
  }

  if (result.conflicts.length > 0) {
    log.warn(`⚠️  Found ${result.conflicts.length} conflicts`);
  }

  if (result.errors.length > 0) {
    log.error(`❌ ${result.errors.length} errors occurred`);
    for (const error of result.errors) {
      log.error(`  ${error}`);
    }
  }
}
