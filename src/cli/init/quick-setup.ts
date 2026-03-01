import { join, resolve, relative } from "path";
import { homedir } from "os";
import { createRequire } from "module";
import * as p from "@clack/prompts";
import type { ToolkitConfig } from "../../core/types.js";
import { RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR, OVERRIDES_DIR } from "../../core/types.js";
import { fileExists, ensureDir, expandHomePath, writeTextFile } from "../../utils/file-ops.js";
import { copyTemplates } from "../../utils/template-copier.js";
import { browseDirectory } from "./directory-browser.js";
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
    console.log('🔍 DEBUG: useSharedContent is TRUE, showing path selection...');
    const pathChoice = await p.select({
      message: 'Where should your shared content be stored?',
      options: [
        { value: '~/chain-hub', label: '~/chain-hub', hint: 'Visible directory in home (recommended)' },
        { value: '~/Documents/chain-hub', label: '~/Documents/chain-hub', hint: 'In Documents folder' },
        { value: '~/Dropbox/chain-hub', label: '~/Dropbox/chain-hub', hint: 'Synced via Dropbox' },
        { value: '__browse_dropbox__', label: '📁 Browse Dropbox...', hint: 'Navigate through Dropbox folders' },
        { value: '~/Library/Mobile Documents/com~apple~CloudDocs/chain-hub', label: '~/iCloud/chain-hub', hint: 'Synced via iCloud Drive' },
        { value: '__browse_icloud__', label: '📁 Browse iCloud...', hint: 'Navigate through iCloud folders' },
        { value: '~/OneDrive/chain-hub', label: '~/OneDrive/chain-hub', hint: 'Synced via OneDrive' },
        { value: '__browse_onedrive__', label: '📁 Browse OneDrive...', hint: 'Navigate through OneDrive folders' },
        { value: '~/Google Drive/chain-hub', label: '~/Google Drive/chain-hub', hint: 'Synced via Google Drive' },
        { value: '__browse_gdrive__', label: '📁 Browse Google Drive...', hint: 'Navigate through Google Drive folders' },
        { value: '__browse_home__', label: '📁 Browse home directory...', hint: 'Navigate through your folders' },
        { value: '~/.chain-hub', label: '~/.chain-hub', hint: 'Hidden but visible with ls -la' },
        { value: '__custom__', label: 'Custom path...', hint: 'Type your own path' },
      ],
      initialValue: '~/chain-hub',
    });
    console.log('🔍 DEBUG: pathChoice =', pathChoice);
    if (isCancelled(pathChoice)) return null;

    let sharedPath: string;
    if (pathChoice === '__browse_dropbox__') {
      const browsedPath = await browseDirectory('~/Dropbox', 'Select location for chain-hub');
      if (!browsedPath) return null;
      sharedPath = browsedPath;
    } else if (pathChoice === '__browse_icloud__') {
      const browsedPath = await browseDirectory('~/Library/Mobile Documents/com~apple~CloudDocs', 'Select location for chain-hub');
      if (!browsedPath) return null;
      sharedPath = browsedPath;
    } else if (pathChoice === '__browse_onedrive__') {
      const browsedPath = await browseDirectory('~/OneDrive', 'Select location for chain-hub');
      if (!browsedPath) return null;
      sharedPath = browsedPath;
    } else if (pathChoice === '__browse_gdrive__') {
      const browsedPath = await browseDirectory('~/Google Drive', 'Select location for chain-hub');
      if (!browsedPath) return null;
      sharedPath = browsedPath;
    } else if (pathChoice === '__browse_home__') {
      const browsedPath = await browseDirectory('~', 'Select location for chain-hub');
      if (!browsedPath) return null;
      sharedPath = browsedPath;
    } else if (pathChoice === '__custom__') {
      const customPath = await p.text({
        message: 'Enter custom path for shared content:',
        placeholder: '~/my-custom-path',
      });
      if (isCancelled(customPath)) return null;
      sharedPath = customPath;
    } else {
      sharedPath = pathChoice;
    }

    // Create and populate shared directory
    console.log('🔍 DEBUG: sharedPath =', sharedPath);
    const expandedPath = expandHomePath(sharedPath);
    console.log('🔍 DEBUG: expandedPath =', expandedPath);
    
    // Check if skills directory already exists (indicates hub is already populated)
    const skillsPath = join(expandedPath, SKILLS_DIR);
    console.log('🔍 DEBUG: checking if exists:', skillsPath);
    const alreadyPopulated = await fileExists(skillsPath);
    console.log('🔍 DEBUG: alreadyPopulated =', alreadyPopulated);
    
    if (!alreadyPopulated) {
      console.log('🔍 DEBUG: Starting hub creation...');
      const spinner = p.spinner();
      spinner.start(`Creating chain hub at ${sharedPath}...`);
      
      try {
        // Create directory structure
        await ensureDir(expandedPath);
        await ensureDir(join(expandedPath, RULES_DIR));
        await ensureDir(join(expandedPath, SKILLS_DIR));
        await ensureDir(join(expandedPath, WORKFLOWS_DIR));
        await ensureDir(join(expandedPath, OVERRIDES_DIR));
        
        // Copy templates from package
        console.log('🔍 DEBUG: Copying skills...');
        await copyTemplates(SKILLS_DIR, expandedPath, SKILLS_DIR);
        console.log('🔍 DEBUG: Skills copied');
        
        console.log('🔍 DEBUG: Copying workflows...');
        await copyTemplates(WORKFLOWS_DIR, expandedPath, WORKFLOWS_DIR);
        console.log('🔍 DEBUG: Workflows copied');
        
        console.log('🔍 DEBUG: Copying rules...');
        await copyTemplates(RULES_DIR, expandedPath, RULES_DIR);
        console.log('🔍 DEBUG: Rules copied');
        
        // Create README
        const readmeContent = `# Shared AI Content Hub

This directory contains shared AI rules, skills, and workflows that can be used across multiple projects.

## Structure

- \`rules/\` - Shared development rules and conventions
- \`skills/\` - Shared AI skills and commands  
- \`workflows/\` - Shared development workflows
- \`overrides/\` - Editor-specific overrides

## Usage

To use this shared hub in a project, add to your \`chain.yaml\`:

\`\`\`yaml
content_sources:
  - type: local
    path: ${sharedPath}
    include: [rules, skills, workflows]
\`\`\`

## Managing Content

Edit files directly in this directory to update shared content across all projects.

Use \`chain promote <file>\` in any project to promote local content to this shared hub.
`;
        await writeTextFile(join(expandedPath, 'README.md'), readmeContent);
        
        spinner.stop(`✅ Chain hub created and populated at ${sharedPath}`);
      } catch (error) {
        spinner.stop(`❌ Failed to create chain hub`);
        console.error('Error details:', error);
        throw error;
      }
    } else {
      p.log.info(`Chain hub already exists at ${sharedPath}`);
    }

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
