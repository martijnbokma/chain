import type { EditorAdapter, EditorDirectories, ToolkitConfig } from '../core/types.js';
import { AUTO_GENERATED_MARKER } from '../core/types.js';

export abstract class BaseEditorAdapter implements EditorAdapter {
  abstract name: string;
  abstract directories: EditorDirectories;
  abstract fileNaming: 'flat' | 'subdirectory';

  entryPoint?: string;
  mcpConfigPath?: string;

  /** Title suffix appended after project name, e.g. "Cursor Rules" → "# MyApp — Cursor Rules" */
  protected entryPointTitle?: string;
  /** Heading for the tech stack section. Defaults to 'Tech Stack'. */
  protected techStackHeading = 'Tech Stack';
  /** Closing message shown after tech stack. Set to undefined to omit. */
  protected closingMessage: string | undefined =
    '## Rules & Skills\n\nThis project uses ai-toolkit to manage AI editor configurations.\nRules and skills are automatically synced from `.chain/`.';
  /** Whether to include a `---` separator after the title block. Defaults to true. */
  protected hasSeparator = true;

  generateFrontmatter?(skillName: string, description?: string): string;

  protected buildTitle(config: ToolkitConfig): string {
    const name = config.metadata?.name || 'Project';
    return this.entryPointTitle ? `# ${name} — ${this.entryPointTitle}` : `# ${name}`;
  }

  protected buildTechStackSection(config: ToolkitConfig): string[] {
    if (!config.tech_stack) return [];
    
    const stack = Object.entries(config.tech_stack).filter(([, v]) => v);
    if (stack.length === 0) return [];

    const lines: string[] = [`## ${this.techStackHeading}`, ''];
    for (const [key, value] of stack) {
      lines.push(`- **${key}**: ${value}`);
    }
    lines.push('');
    return lines;
  }

  generateEntryPointContent(config: ToolkitConfig): string {
    const lines: string[] = [AUTO_GENERATED_MARKER, ''];

    // Title and description
    lines.push(this.buildTitle(config));
    if (config.metadata?.description) {
      lines.push('', config.metadata.description);
    }

    // Separator
    lines.push(this.hasSeparator ? '' : '', ...this.hasSeparator ? ['---', ''] : ['']);

    // Tech stack
    lines.push(...this.buildTechStackSection(config));

    // Closing message
    if (this.closingMessage) {
      lines.push(this.closingMessage, '');
    }

    return lines.join('\n');
  }

  wrapContent(content: string, sourcePath: string): string {
    return [
      AUTO_GENERATED_MARKER,
      `<!-- Source: ${sourcePath} -->`,
      '',
      content,
    ].join('\n');
  }
}
