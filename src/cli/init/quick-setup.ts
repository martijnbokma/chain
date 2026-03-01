import { join, resolve, relative } from "path";
import { homedir } from "os";
import { createRequire } from "module";
import * as p from "@clack/prompts";
import type { ToolkitConfig } from "../../core/types.js";
import { fileExists } from "../../utils/file-ops.js";
import {
  isCancelled,
  askProjectName,
  askTechStackWithDetection,
  askEditors,
} from "./prompt-helpers.js";

/**
 * Scan for common shared content source folders near the project.
 * Returns a relative path if found, or null if nothing detected.
 */
export async function detectNearbySsot(projectRoot: string): Promise<string | null> {
  // 1. Try to resolve chain as a linked/installed package
  const linkedPath = await detectLinkedPackage(projectRoot);
  if (linkedPath) return linkedPath;

  // 2. Fall back to scanning common relative paths
  const candidates = [
    "../chain",
    "../shared-ai-rules",
    "../ai-rules",
    "../shared-rules",
  ];

  for (const candidate of candidates) {
    const resolved = resolve(projectRoot, candidate);
    // Don't match the project itself
    if (resolved === projectRoot) continue;

    // Check if the candidate has .chain/ or templates/ with rules/skills
    const contentDir = join(resolved, ".chain");
    const templatesDir = join(resolved, "templates");

    if (
      (await fileExists(join(contentDir, "rules"))) ||
      (await fileExists(join(contentDir, "skills")))
    ) {
      return candidate;
    }
    if (
      (await fileExists(join(templatesDir, "rules"))) ||
      (await fileExists(join(templatesDir, "skills")))
    ) {
      return candidate;
    }
  }

  return null;
}

/**
 * Detect chain as a linked or installed package (e.g. via bun link / npm link).
 * Returns a relative path to the package root if found, or null.
 */
export async function detectLinkedPackage(projectRoot: string): Promise<string | null> {
  try {
    const require = createRequire(join(projectRoot, "package.json"));
    const packageJsonPath = require.resolve("@silverfox14/chain/package.json");
    const packageRoot = resolve(packageJsonPath, "..");

    // Don't match the project itself
    if (packageRoot === projectRoot) return null;

    // Verify it has content (rules/skills in .chain/ or templates/)
    const contentDir = join(packageRoot, ".chain");
    const templatesDir = join(packageRoot, "templates");

    const hasContent =
      (await fileExists(join(contentDir, "rules"))) ||
      (await fileExists(join(contentDir, "skills"))) ||
      (await fileExists(join(templatesDir, "rules"))) ||
      (await fileExists(join(templatesDir, "skills")));

    if (!hasContent) return null;

    // Return as relative path for consistency with other SSOT paths
    return relative(projectRoot, packageRoot) || null;
  } catch {
    // Package not installed/linked — that's fine
    return null;
  }
}

export async function runQuickSetup(
  projectRoot: string,
  existing?: Partial<ToolkitConfig>,
): Promise<Record<string, unknown> | null> {
  const config: Record<string, unknown> = { version: "1.0" };
  const prev = existing || {};

  // --- 1. Project name (auto-filled from directory) ---
  const name = await askProjectName(projectRoot, prev);
  if (name === null) return null;

  config.metadata = { name, description: prev.metadata?.description || "" };

  // --- 2. Auto-detect tech stack ---
  const techStack = await askTechStackWithDetection(projectRoot, prev, "quick");
  if (!techStack) return null;
  config.tech_stack = techStack;

  // --- 3. Editors ---
  const editors = await askEditors(prev);
  if (!editors) return null;
  config.editors = editors;

  // --- 3b. Chain MCP server (always included for MCP-only mode) ---
  const chainMcp = {
    name: "chain",
    command: "npx",
    args: ["-y", "@silverfox14/chain", "mcp-server"],
  };
  const existingMcp = Array.isArray(prev.mcp_servers) ? prev.mcp_servers : [];
  const others = existingMcp.filter(
    (s) => typeof s === "object" && s !== null && (s as { name?: string }).name !== "chain",
  );
  config.mcp_servers = [chainMcp, ...others];

  // --- 4. Cross-Project Sync Setup ---
  const useSharedContent = await p.confirm({
    message: "🔄 Share your AI skills/rules across multiple projects?",
    initialValue: false,
  });
  if (isCancelled(useSharedContent)) return null;

  if (useSharedContent) {
    const pathChoice = await p.select({
      message: 'Where should your shared content be stored?',
      options: [
        { value: '~/chain-hub', label: '~/chain-hub', hint: 'Visible directory in home (recommended)' },
        { value: '~/Documents/chain-hub', label: '~/Documents/chain-hub', hint: 'In Documents folder' },
        { value: '~/Dropbox/chain-hub', label: '~/Dropbox/chain-hub', hint: 'Synced via Dropbox' },
        { value: '~/Library/Mobile Documents/com~apple~CloudDocs/chain-hub', label: '~/iCloud/chain-hub', hint: 'Synced via iCloud Drive' },
        { value: '~/OneDrive/chain-hub', label: '~/OneDrive/chain-hub', hint: 'Synced via OneDrive' },
        { value: '~/Google Drive/chain-hub', label: '~/Google Drive/chain-hub', hint: 'Synced via Google Drive' },
        { value: '~/.chain-hub', label: '~/.chain-hub', hint: 'Hidden but visible with ls -la' },
        { value: '__custom__', label: 'Custom path...', hint: 'Enter your own path' },
      ],
      initialValue: '~/chain-hub',
    });
    if (isCancelled(pathChoice)) return null;

    let sharedPath: string;
    if (pathChoice === '__custom__') {
      const customPath = await p.text({
        message: 'Enter custom path for shared content:',
        placeholder: '~/my-custom-path',
      });
      if (isCancelled(customPath)) return null;
      sharedPath = customPath;
    } else {
      sharedPath = pathChoice;
    }

    // Create shared directory if it doesn't exist
    const { ensureDir, expandHomePath } = await import('../../utils/file-ops.js');
    const expandedPath = expandHomePath(sharedPath);
    await ensureDir(expandedPath);

    config.content_sources = [{ type: "local", path: sharedPath }];
  }

  // --- 5. Auto-detect shared content source (development mode only) ---
  // Only show for development - skip for normal npm package users
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.CHAIN_DEV_MODE === 'true';
  
  if (isDevelopment && !useSharedContent) {
    const detectedSsot = await detectNearbySsot(projectRoot);
    if (detectedSsot) {
      const useSsot = await p.confirm({
        message: `Found shared content source at ${detectedSsot}. Link it for cross-project sync?`,
        initialValue: true,
      });
      if (isCancelled(useSsot)) return null;

      if (useSsot) {
        config.content_sources = [{ type: "local", path: detectedSsot }];
      }
    }
  }

  return config;
}
