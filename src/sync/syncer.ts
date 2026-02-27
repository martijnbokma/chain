import { join, normalize, relative } from 'path';
import type { ToolkitConfig, SyncResult, SyncOptions } from '../core/types.js';
import { CONTENT_DIR } from '../core/types.js';
import { getEnabledAdapters } from '../editors/registry.js';
import { log } from '../utils/logger.js';
import { updateGitignore } from './gitignore.js';
import { syncEditorSettings } from './settings-syncer.js';
import { generateMCPConfigs } from './mcp-generator.js';
import { cleanupRemovedTemplates } from './template-cleanup.js';

/**
 * MCP-only sync: generates MCP configs and editor settings only.
 * Content (rules, skills, workflows) is served live via the Chain MCP server.
 */
export async function runSync(
  projectRoot: string,
  config: ToolkitConfig,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const { dryRun = false } = options;
  const result: SyncResult = {
    synced: [],
    skipped: [],
    removed: [],
    errors: [],
    pendingOrphans: [],
    ssotOrphans: [],
    ssotDiffs: [],
    mcpConfigsUpdated: 0,
    settingsUpdated: 0,
    gitignoreUpdated: false,
    mcpConfigPaths: [],
    gitignorePaths: [],
    settingsPaths: [],
  };

  const adapters = getEnabledAdapters(config);
  const mcpAdapters = adapters.filter((a) => a.mcpConfigPath);

  if (mcpAdapters.length === 0 && !config.settings) {
    log.warn('No MCP-capable editors enabled and no settings. Nothing to sync.');
    return result;
  }

  const modeLabel = dryRun ? ' (dry-run)' : '';
  log.header(`Syncing MCP configs${modeLabel}`);

  // 1. Clean up .chain files that were removed from templates
  const contentDir = join(projectRoot, CONTENT_DIR);
  const removedTemplates = await cleanupRemovedTemplates(contentDir, dryRun);
  if (removedTemplates.length > 0) {
    result.removed.push(...removedTemplates);
  }

  // 2. Generate MCP configs (only for adapters with mcpConfigPath)
  if (config.mcp_servers && config.mcp_servers.length > 0 && mcpAdapters.length > 0) {
    await generateMCPConfigs(projectRoot, mcpAdapters, config, result, dryRun);
    result.mcpConfigsUpdated = mcpAdapters.length;
    result.mcpConfigPaths = mcpAdapters.map((a) => a.mcpConfigPath!).filter(Boolean);
  }

  // 3. Sync editor settings (.editorconfig, .vscode/settings.json)
  if (config.settings) {
    const settingsFiles = await syncEditorSettings(projectRoot, config, dryRun);
    result.synced.push(...settingsFiles.map((f) => normalize(f)));
    result.settingsUpdated = settingsFiles.length;
    result.settingsPaths = settingsFiles.map((f) => relative(projectRoot, f));
  }

  // 4. Update .gitignore
  if (mcpAdapters.length > 0) {
    result.gitignorePaths = mcpAdapters.map((a) => a.mcpConfigPath!).filter(Boolean).sort();
    if (!dryRun) {
      await updateGitignore(projectRoot, mcpAdapters);
      result.gitignoreUpdated = true;
    } else {
      log.dryRun('would update', '.gitignore');
      result.gitignoreUpdated = true;
    }
  }

  return result;
}


