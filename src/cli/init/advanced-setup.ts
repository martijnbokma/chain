import { join, resolve, relative } from "path";
import { createRequire } from "module";
import * as p from "@clack/prompts";
import type { ToolkitConfig } from "../../core/types.js";
import { RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR, OVERRIDES_DIR } from "../../core/types.js";
import { fileExists, ensureDir, expandHomePath, writeTextFile } from "../../utils/file-ops.js";
import { copyTemplates } from "../../utils/template-copier.js";
import {
  isCancelled,
  askProjectName,
  askTechStackWithDetection,
  askEditors,
} from "./prompt-helpers.js";
import { detectLinkedPackage } from "./quick-setup.js";

export async function runAdvancedSetup(
  projectRoot: string,
  existing?: Partial<ToolkitConfig>,
): Promise<Record<string, unknown> | null> {
  const config: Record<string, unknown> = { version: "1.0" };
  const prev = existing || {};

  // --- 1. Project metadata ---
  const name = await askProjectName(projectRoot, prev);
  if (name === null) return null;

  const description = await p.text({
    message: "Description (optional)",
    initialValue: prev.metadata?.description || "",
    placeholder: "A short description of your project",
  });
  if (isCancelled(description)) return null;

  config.metadata = { name, description };

  // --- 2. Tech stack (auto-detect as defaults, manual override) ---
  const techStack = await askTechStackWithDetection(projectRoot, prev, "advanced");
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
    (s): s is Record<string, unknown> =>
      typeof s === "object" && s !== null && (s as { name?: string }).name !== "chain",
  );
  config.mcp_servers = [chainMcp, ...others];

  // --- 4. Content sources (advanced only) ---
  const prevSource = prev.content_sources?.[0];
  const hasPrevSource = !!prevSource;

  p.note(
    "A shared content source lets you reuse the same rules, skills,\n" +
      "and workflows across multiple projects. New files you add locally\n" +
      "are automatically synced back to the shared source.",
    "Shared content source",
  );

  const wantSsot = await p.confirm({
    message:
      "Do you have a shared folder or package with reusable rules/skills?",
    initialValue: hasPrevSource,
  });
  if (isCancelled(wantSsot)) return null;

  if (wantSsot) {
    // Auto-detect linked chain package
    const linkedPath = await detectLinkedPackage(projectRoot);

    const sourceType = await p.select({
      message: "Where are the shared rules/skills stored?",
      options: [
        {
          value: "local",
          label: "Local folder",
          hint: linkedPath
            ? `detected linked package at ${linkedPath}`
            : "a folder on your machine, e.g. ../shared-rules",
        },
        {
          value: "package",
          label: "npm package",
          hint: "an installed package, e.g. @company/ai-rules",
        },
      ],
      initialValue: prevSource?.type || (linkedPath ? "local" : undefined),
    });
    if (isCancelled(sourceType)) return null;

    if (sourceType === "package") {
      const packageName = await p.text({
        message: "Package name",
        initialValue:
          prevSource?.type === "package" ? prevSource.name : undefined,
        placeholder: "@company/ai-rules",
      });
      if (isCancelled(packageName)) return null;
      if (packageName) {
        config.content_sources = [{ type: "package", name: packageName }];
      }
    } else {
      const prevPath =
        prevSource?.type === "local" ? prevSource.path : undefined;

      // Build path options, avoiding duplicates
      const knownPaths = new Set<string>();
      const pathOptions: { value: string; label: string; hint?: string }[] = [];

      const addOption = (path: string, hint: string) => {
        if (knownPaths.has(path)) return;
        knownPaths.add(path);
        pathOptions.push({ value: path, label: path, hint });
      };

      // 1. Linked package (highest priority)
      if (linkedPath) {
        addOption(linkedPath, "detected via bun/npm link");
      }

      // 2. Previously configured path
      if (prevPath) {
        addOption(prevPath, "current");
      }

      // 3. Default fallback (visible directory)
      addOption("~/chain-hub", "default visible (recommended)");
      addOption("~/Dropbox/Code/chain-hub", "Dropbox synced");
      addOption("~/.chain-hub", "hidden but accessible");
      addOption("../chain", "relative to project");

      // 4. Custom option
      pathOptions.push({ value: "__custom__", label: "Custom path..." });

      // Pre-select: linked > previous > first option
      const initialValue = linkedPath || prevPath || pathOptions[0]?.value;

      const localPath = await p.select({
        message: "Path to the shared folder",
        options: pathOptions,
        initialValue,
      });
      if (isCancelled(localPath)) return null;

      let finalPath = localPath as string;
      if (localPath === "__custom__") {
        const custom = await p.text({
          message: "Custom path (relative to this project)",
          initialValue: prevPath || undefined,
          placeholder: "../my-shared-rules",
        });
        if (isCancelled(custom)) return null;
        finalPath = custom as string;
      }
      if (finalPath) {
        // Check if this is a tilde path that should trigger hub creation
        const shouldCreateHub = finalPath.startsWith('~/') && !finalPath.startsWith('../');
        
        if (shouldCreateHub) {
          console.log('🔍 DEBUG: Advanced setup - creating hub at:', finalPath);
          const expandedPath = expandHomePath(finalPath);
          console.log('🔍 DEBUG: Expanded path:', expandedPath);
          
          // Check if skills directory already exists
          const skillsPath = join(expandedPath, SKILLS_DIR);
          const alreadyPopulated = await fileExists(skillsPath);
          console.log('🔍 DEBUG: Already populated?', alreadyPopulated);
          
          if (!alreadyPopulated) {
            const spinner = p.spinner();
            spinner.start(`Creating chain hub at ${finalPath}...`);
            
            try {
              // Create directory structure
              await ensureDir(expandedPath);
              await ensureDir(join(expandedPath, RULES_DIR));
              await ensureDir(join(expandedPath, SKILLS_DIR));
              await ensureDir(join(expandedPath, WORKFLOWS_DIR));
              await ensureDir(join(expandedPath, OVERRIDES_DIR));
              
              // Copy templates
              console.log('🔍 DEBUG: Copying templates...');
              await copyTemplates(SKILLS_DIR, expandedPath, SKILLS_DIR);
              await copyTemplates(WORKFLOWS_DIR, expandedPath, WORKFLOWS_DIR);
              await copyTemplates(RULES_DIR, expandedPath, RULES_DIR);
              console.log('🔍 DEBUG: Templates copied');
              
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
    path: ${finalPath}
    include: [rules, skills, workflows]
\`\`\`

## Managing Content

Edit files directly in this directory to update shared content across all projects.

Use \`chain promote <file>\` in any project to promote local content to this shared hub.
`;
              await writeTextFile(join(expandedPath, 'README.md'), readmeContent);
              
              spinner.stop(`✅ Chain hub created and populated at ${finalPath}`);
            } catch (error) {
              spinner.stop(`❌ Failed to create chain hub`);
              console.error('Error details:', error);
            }
          } else {
            p.log.info(`Chain hub already exists at ${finalPath}`);
          }
        }
        
        config.content_sources = [{ type: "local", path: finalPath }];
      }
    }
  }

  return config;
}
