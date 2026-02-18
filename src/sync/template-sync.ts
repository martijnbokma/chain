import { join, relative } from 'path';
import { ensureDir, writeTextFile, readTextFile, fileExists, findMarkdownFiles } from '../utils/file-ops.js';
import { log } from '../utils/logger.js';
import { CONTENT_DIR, RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR } from '../core/types.js';

export class TemplateSyncManager {
  private projectRoot: string;
  private aiContentDir: string;
  private templatesDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.aiContentDir = join(projectRoot, CONTENT_DIR);
    this.templatesDir = join(projectRoot, 'templates');
  }

  async syncTemplatesToAiContent(): Promise<void> {
    log.header('Sync Templates → .chain');
    
    const categories = [
      { dir: RULES_DIR, name: 'rules' },
      { dir: SKILLS_DIR, name: 'skills' },
      { dir: WORKFLOWS_DIR, name: 'workflows' },
    ];

    for (const category of categories) {
      await this.syncCategory(category.dir, category.name, 'templates-to-ai-content');
    }
  }

  async syncAiContentToTemplates(): Promise<void> {
    log.header('Sync .chain → Templates');
    
    const categories = [
      { dir: RULES_DIR, name: 'rules' },
      { dir: SKILLS_DIR, name: 'skills' },
      { dir: WORKFLOWS_DIR, name: 'workflows' },
    ];

    for (const category of categories) {
      await this.syncCategory(category.dir, category.name, 'ai-content-to-templates');
    }
  }

  async addNewFileToTemplates(filePath: string): Promise<void> {
    const relativePath = relative(this.aiContentDir, filePath);
    const templatePath = join(this.templatesDir, relativePath);
    
    await ensureDir(join(templatePath, '..'));
    const content = await readTextFile(filePath);
    await writeTextFile(templatePath, content);
    
    log.synced(`new file → templates`, relativePath);
  }

  async getSyncStatus(): Promise<{
    templatesOnly: string[];
    aiContentOnly: string[];
    both: string[];
    different: string[];
  }> {
    const result: { templatesOnly: string[]; aiContentOnly: string[]; both: string[]; different: string[] } = { 
      templatesOnly: [], 
      aiContentOnly: [], 
      both: [], 
      different: [] 
    };
    
    const categories = [RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR];
    
    for (const category of categories) {
      const templateDir = join(this.templatesDir, category);
      const aiContentDir = join(this.aiContentDir, category);
      
      const templateFiles = await this.getFiles(templateDir);
      const aiContentFiles = await this.getFiles(aiContentDir);
      
      const templatePaths = new Set(templateFiles.map(f => f.relativePath));
      const aiContentPaths = new Set(aiContentFiles.map(f => f.relativePath));
      
      // Files only in templates
      for (const path of templatePaths) {
        if (!aiContentPaths.has(path)) {
          result.templatesOnly.push(`${category}/${path}`);
        }
      }
      
      // Files only in ai-content
      for (const path of aiContentPaths) {
        if (!templatePaths.has(path)) {
          result.aiContentOnly.push(`${category}/${path}`);
        }
      }
      
      // Files in both (check for differences)
      for (const path of templatePaths) {
        if (aiContentPaths.has(path)) {
          const templateFile = templateFiles.find(f => f.relativePath === path);
          const aiContentFile = aiContentFiles.find(f => f.relativePath === path);
          
          if (templateFile && aiContentFile) {
            if (templateFile.content !== aiContentFile.content) {
              result.different.push(`${category}/${path}`);
            } else {
              result.both.push(`${category}/${path}`);
            }
          }
        }
      }
    }
    
    return result;
  }

  private async syncCategory(categoryDir: string, categoryName: string, direction: 'templates-to-ai-content' | 'ai-content-to-templates'): Promise<void> {
    const sourceDir = direction === 'templates-to-ai-content' 
      ? join(this.templatesDir, categoryDir)
      : join(this.aiContentDir, categoryDir);
    
    const targetDir = direction === 'templates-to-ai-content'
      ? join(this.aiContentDir, categoryDir)
      : join(this.templatesDir, categoryDir);

    try {
      const sourceFiles = await findMarkdownFiles(sourceDir, sourceDir);
      
      for (const file of sourceFiles) {
        const targetPath = join(targetDir, file.relativePath);
        await ensureDir(join(targetPath, '..'));
        
        if (!(await fileExists(targetPath))) {
          await writeTextFile(targetPath, file.content);
          log.synced(`${categoryName}/${file.relativePath}`, direction === 'templates-to-ai-content' ? '.chain' : 'templates');
        } else {
          // Check if content is different
          const existingContent = await readTextFile(targetPath);
          if (existingContent !== file.content) {
            await writeTextFile(targetPath, file.content);
            log.synced(`updated ${categoryName}/${file.relativePath}`, direction === 'templates-to-ai-content' ? '.chain' : 'templates');
          }
        }
      }
      
      log.info(`Synced ${sourceFiles.length} ${categoryName} files ${direction === 'templates-to-ai-content' ? '→ .chain' : '→ templates'}`);
    } catch (error) {
      log.warn(`No ${categoryName} directory found in ${direction === 'templates-to-ai-content' ? 'templates' : '.chain'}`);
    }
  }

  private async getFiles(dir: string): Promise<Array<{ relativePath: string; content: string }>> {
    try {
      const files = await findMarkdownFiles(dir, dir);
      return files.map(f => ({
        relativePath: f.relativePath,
        content: f.content
      }));
    } catch {
      return [];
    }
  }
}
