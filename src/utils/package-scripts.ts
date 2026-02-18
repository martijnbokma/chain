import { join } from 'path';
import { writeTextFile, fileExists, readTextFile } from './file-ops.js';

const SYNC_SCRIPTS: Record<string, string> = {
  sync: '@silverfox14/chain sync',
  'sync:dry': '@silverfox14/chain sync --dry-run',
  'sync:watch': '@silverfox14/chain watch',
};

export async function addSyncScripts(projectRoot: string): Promise<boolean> {
  const pkgPath = join(projectRoot, 'package.json');
  let pkg: Record<string, unknown> = {};

  if (await fileExists(pkgPath)) {
    try {
      const raw = await readTextFile(pkgPath);
      pkg = JSON.parse(raw);
    } catch {
      return false;
    }
  }

  const scripts = (pkg.scripts ?? {}) as Record<string, string>;
  let added = false;

  for (const [name, cmd] of Object.entries(SYNC_SCRIPTS)) {
    if (!scripts[name]) {
      scripts[name] = cmd;
      added = true;
    }
  }

  if (!added) return false;

  pkg.scripts = scripts;
  await writeTextFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  return true;
}
