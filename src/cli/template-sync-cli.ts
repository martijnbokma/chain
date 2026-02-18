import { TemplateSyncManager } from '../sync/template-sync.js';
import { ConflictResolver } from '../sync/conflict-resolver.js';
import { log } from '../utils/logger.js';

export async function runTemplateSyncCommand(projectRoot: string): Promise<void> {
  const manager = new TemplateSyncManager(projectRoot);
  
  log.header('🔄 Two-Way Template Sync');
  
  // First sync templates → ai-content
  await manager.syncTemplatesToAiContent();
  
  // Then sync ai-content → templates (for new files)
  await manager.syncAiContentToTemplates();
  
  log.success('Template sync complete!');
}

export async function runTemplateSyncToAiContentCommand(projectRoot: string): Promise<void> {
  const manager = new TemplateSyncManager(projectRoot);
  await manager.syncTemplatesToAiContent();
  log.success('Templates → .chain sync complete!');
}

export async function runAiContentToTemplatesCommand(projectRoot: string): Promise<void> {
  const manager = new TemplateSyncManager(projectRoot);
  await manager.syncAiContentToTemplates();
  log.success('.chain → Templates sync complete!');
}

export async function runSyncStatusCommand(projectRoot: string): Promise<void> {
  const manager = new TemplateSyncManager(projectRoot);
  const status = await manager.getSyncStatus();
  
  log.header('📊 Template Sync Status');
  
  if (status.templatesOnly.length > 0) {
    log.info(`Only in templates: ${status.templatesOnly.length} files`);
    status.templatesOnly.forEach(file => log.info(`  - ${file}`));
  }
  
  if (status.aiContentOnly.length > 0) {
    log.info(`Only in .chain: ${status.aiContentOnly.length} files`);
    status.aiContentOnly.forEach(file => log.info(`  - ${file}`));
  }
  
  if (status.different.length > 0) {
    log.warn(`Different content: ${status.different.length} files`);
    status.different.forEach(file => log.warn(`  - ${file}`));
  }
  
  if (status.both.length > 0) {
    log.success(`In sync: ${status.both.length} files`);
  }
  
  const total = status.templatesOnly.length + status.aiContentOnly.length + status.different.length + status.both.length;
  log.info(`Total files: ${total}`);
}

export async function runConflictResolutionCommand(projectRoot: string): Promise<void> {
  const resolver = new ConflictResolver(projectRoot);
  
  log.header('🔧 Conflict Resolution Analysis');
  
  const aiContentDir = `${projectRoot}/.chain`;
  const templatesDir = `${projectRoot}/templates`;
  
  const summary = await resolver.getConflictSummary(aiContentDir, templatesDir);
  
  log.info('📊 Conflict Summary:');
  log.info(`  Only in .chain: ${summary.onlyInLocal.length} files`);
  log.info(`  Only in templates: ${summary.onlyInRemote.length} files`);
  log.info(`  Newer in .chain: ${summary.newerInLocal.length} files`);
  log.info(`  Newer in templates: ${summary.newerInRemote.length} files`);
  log.info(`  Identical: ${summary.identical.length} files`);
  
  if (summary.newerInLocal.length > 0) {
    log.warn('📝 Files newer in .chain (will be preserved):');
    summary.newerInLocal.forEach(file => log.warn(`  - ${file}`));
  }
  
  if (summary.newerInRemote.length > 0) {
    log.warn('📝 Files newer in templates (will be preserved):');
    summary.newerInRemote.forEach(file => log.warn(`  - ${file}`));
  }
  
  log.success('✅ Conflict resolution complete - newer files preserved!');
}
