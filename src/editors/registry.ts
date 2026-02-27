import type { EditorAdapter, ToolkitConfig, CustomEditorConfig } from '../core/types.js';
import { AUTO_GENERATED_MARKER } from '../core/types.js';
import { CursorAdapter } from './cursor.js';
import { ClaudeAdapter } from './claude.js';
import { KiroAdapter } from './kiro.js';
import { CopilotAdapter } from './copilot.js';
import { RooAdapter } from './roo.js';
import { KiloCodeAdapter } from './kilocode.js';
import { AmazonQAdapter } from './amazonq.js';

/** MCP-only: only editors with mcpConfigPath (per-project MCP support) */
const ALL_ADAPTERS: EditorAdapter[] = [
  new CursorAdapter(),
  new ClaudeAdapter(),
  new KiroAdapter(),
  new CopilotAdapter(),
  new RooAdapter(),
  new KiloCodeAdapter(),
  new AmazonQAdapter(),
];

const adapterMap = new Map<string, EditorAdapter>(
  ALL_ADAPTERS.map((a) => [a.name, a]),
);

export function getAdapter(name: string): EditorAdapter | undefined {
  return adapterMap.get(name);
}

export function getAllAdapters(): EditorAdapter[] {
  return ALL_ADAPTERS;
}

function buildCustomAdapter(def: CustomEditorConfig): EditorAdapter {
  return {
    name: def.name,
    fileNaming: def.file_naming,
    entryPoint: def.entry_point,
    mcpConfigPath: def.mcp_config_path,
    directories: {
      rules: def.rules_dir,
      skills: def.skills_dir,
      workflows: def.workflows_dir,
    },
    generateEntryPointContent(config: ToolkitConfig): string {
      return generateCustomEntryPointContent(config, def.name);
    },
  };
}

function generateCustomEntryPointContent(config: ToolkitConfig, editorName: string): string {
  const lines: string[] = [AUTO_GENERATED_MARKER, ''];
  const name = config.metadata?.name || 'Project';
  lines.push(`# ${name} — ${editorName} Rules`, '');
  if (config.metadata?.description) lines.push(config.metadata.description, '');
  return lines.join('\n');
}

export function getEnabledAdapters(config: ToolkitConfig): EditorAdapter[] {
  const editors = config.editors ?? {};

  // Build custom adapters from config
  const customAdapters: EditorAdapter[] = (config.custom_editors ?? []).map(buildCustomAdapter);
  const allAdapters = [...ALL_ADAPTERS, ...customAdapters];

  // If no editors configured, enable all built-in (not custom — custom must be explicitly enabled)
  if (Object.keys(editors).length === 0 && customAdapters.length === 0) {
    return ALL_ADAPTERS;
  }

  return allAdapters.filter((adapter) => {
    const editorConfig = editors[adapter.name];
    if (editorConfig === undefined) {
      // Custom editors are enabled by default if defined
      return customAdapters.some((c) => c.name === adapter.name);
    }
    if (typeof editorConfig === 'boolean') return editorConfig;
    return editorConfig.enabled !== false;
  });
}

/** MCP-only: returns mcp config paths (no longer generating rules/skills dirs) */
export function getAllEditorDirs(): string[] {
  const dirs: string[] = [];
  for (const adapter of ALL_ADAPTERS) {
    if (adapter.mcpConfigPath) dirs.push(adapter.mcpConfigPath);
  }
  return [...new Set(dirs)];
}
