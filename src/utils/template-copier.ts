import { join } from 'path';
import { readdir } from 'fs/promises';
import { readTextFile, writeTextFile, fileExists, getPackageRoot } from './file-ops.js';

/**
 * Recursively copies template files from the package templates directory
 * to a target directory, skipping files that already exist.
 */
export async function copyTemplates(
  templateSubdir: string,
  contentDir: string,
  targetSubdir: string,
): Promise<void> {
  const packageRoot = getPackageRoot();
  const templatesDir = join(packageRoot, "templates", templateSubdir);
  const targetDir = join(contentDir, targetSubdir);

  try {
    const entries = await readdir(templatesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await copyTemplates(
          join(templateSubdir, entry.name),
          contentDir,
          join(targetSubdir, entry.name),
        );
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const targetPath = join(targetDir, entry.name);
        if (await fileExists(targetPath)) continue;

        const content = await readTextFile(join(templatesDir, entry.name));
        await writeTextFile(targetPath, content);
      }
    }
  } catch (error) {
    // Templates directory might not exist for this category, that's ok
  }
}
