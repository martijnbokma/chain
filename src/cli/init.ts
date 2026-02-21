import { join } from "path";
import { homedir } from "os";
import { readdir } from "fs/promises";
import yaml from "js-yaml";
import * as p from "@clack/prompts";
import {
  CONFIG_FILENAME,
  CONTENT_DIR,
  SKILLS_DIR,
  RULES_DIR,
  WORKFLOWS_DIR,
  OVERRIDES_DIR,
  PROJECT_CONTEXT_FILE,
} from "../core/types.js";
import type { ToolkitConfig } from "../core/types.js";
import { configExists, loadConfig } from "../core/config-loader.js";
import {
  ensureDir,
  writeTextFile,
  fileExists,
  readTextFile,
  getPackageRoot,
} from "../utils/file-ops.js";
import { log } from "../utils/logger.js";
import { runSync } from "../sync/syncer.js";
import { generateProjectContext } from "../sync/project-context.js";
import { analyzeProject } from "../sync/analyzers/index.js";
import { generateRichProjectContext } from "../sync/context-generator.js";
import { installPreCommitHook } from "../utils/git-hooks.js";
import { addSyncScripts } from "../utils/package-scripts.js";
import { isCancelled } from "./init/prompt-helpers.js";
import { runQuickSetup } from "./init/quick-setup.js";
import { runAdvancedSetup } from "./init/advanced-setup.js";

/**
 * Setup shared content hub at ~/.chain
 */
async function setupSharedContentHub(): Promise<void> {
  const sharedHubPath = join(homedir(), '.chain');
  
  // Create the main directory structure
  await ensureDir(sharedHubPath);
  await ensureDir(join(sharedHubPath, RULES_DIR));
  await ensureDir(join(sharedHubPath, SKILLS_DIR));
  await ensureDir(join(sharedHubPath, WORKFLOWS_DIR));
  await ensureDir(join(sharedHubPath, OVERRIDES_DIR));
  
  // Copy templates from the package
  const packageRoot = getPackageRoot();
  
  // Copy skills
  await copyTemplates('skills', sharedHubPath, SKILLS_DIR);
  
  // Copy workflows  
  await copyTemplates('workflows', sharedHubPath, WORKFLOWS_DIR);
  
  // Copy rules
  await copyTemplates('rules', sharedHubPath, RULES_DIR);
  
  // Create a README for the shared hub
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
    path: ~/.chain
    include: [rules, skills, workflows]
\`\`\`

## Managing Content

Edit files directly in this directory to update shared content across all projects.

Use \`chain promote <file>\` in any project to promote local content to this shared hub.
`;
  
  await writeTextFile(join(sharedHubPath, 'README.md'), readmeContent);
}

const EXAMPLE_RULE = `# Project Conventions

## Code Style
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused

## Error Handling
- Handle errors gracefully
- Never expose sensitive information in error messages

## Testing
- Write tests for new functionality
- Maintain existing test coverage
`;

async function copyTemplates(
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
  } catch {
    // Templates dir doesn't exist — skip silently
  }
}

export async function runInit(
  projectRoot: string,
  force: boolean,
  advanced: boolean = false,
  shared: boolean = false,
): Promise<void> {
  try {
    const exists = await configExists(projectRoot);
    if (exists && !force) {
      log.warn(
        "Chain is already initialized. Use --force to reinitialize.",
      );
      return;
    }

    // Handle shared content hub setup
    if (shared) {
      p.intro("🚀 Chain shared content hub setup");
      
      const s = p.spinner();
      s.start("Creating shared content hub...");
      
      try {
        await setupSharedContentHub();
        s.stop("✅ Shared content hub created at ~/.chain");
        
        p.note(
          `Shared content hub created at ~/.chain\n\nYou can now use this hub across multiple projects by adding:\n\ncontent_sources:\n  - type: local\n    path: ~/.chain\n    include: [rules, skills, workflows]`,
          "Next Steps"
        );
        
        p.outro("Shared content hub is ready!");
        return;
      } catch (error) {
        s.stop('Failed to create shared content hub');
        p.cancel(
          `Failed to create shared content hub: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    }

    const configPath = join(projectRoot, CONFIG_FILENAME);
    let finalConfig: Record<string, unknown>;

    // Load existing config as defaults for re-init
    let existing: Partial<ToolkitConfig> | undefined;
    if (force && exists) {
      try {
        const existingContent = await readTextFile(configPath);
        existing = yaml.load(existingContent) as Partial<ToolkitConfig>;
      } catch {
        // Existing config is invalid — start fresh
      }
    }

    // Use advanced mode if explicitly requested, or if re-init with existing content sources
    const useAdvanced =
      advanced ||
      (existing?.content_sources && existing.content_sources.length > 0);

    if (useAdvanced) {
      p.intro(
        force
          ? "🔄 Chain re-init (advanced)"
          : "🚀 Chain setup (advanced)",
      );
    } else {
      p.intro(force ? "🔄 Chain re-init" : "🚀 Chain setup");
    }

    const result = useAdvanced
      ? await runAdvancedSetup(projectRoot, existing)
      : await runQuickSetup(projectRoot, existing);
    if (!result) {
      p.cancel("Setup cancelled.");
      process.exit(0);
    }
    finalConfig = result;

    // Write config
    const s = p.spinner();
    s.start("Setting up project...");

    const configContent = yaml.dump(finalConfig, {
      indent: 2,
      lineWidth: 100,
      quotingType: '"',
    });
    await writeTextFile(configPath, configContent);

    // Create content directories
    const contentDir = join(projectRoot, CONTENT_DIR);
    const dirs = [
      join(contentDir, RULES_DIR),
      join(contentDir, SKILLS_DIR),
      join(contentDir, WORKFLOWS_DIR),
      join(contentDir, OVERRIDES_DIR),
    ];

    for (const dir of dirs) {
      await ensureDir(dir);
    }

    // Create example files if they don't exist
    const exampleRulePath = join(
      contentDir,
      RULES_DIR,
      "project-conventions.md",
    );
    if (!(await fileExists(exampleRulePath))) {
      await writeTextFile(exampleRulePath, EXAMPLE_RULE);
    }

    // Generate PROJECT.md
    const projectContextPath = join(contentDir, PROJECT_CONTEXT_FILE);
    const projectContextExists = await fileExists(projectContextPath);
    let writeProjectContext = !projectContextExists;

    if (projectContextExists && force) {
      s.stop("");
      const overwrite = await p.confirm({
        message: `${CONTENT_DIR}/${PROJECT_CONTEXT_FILE} already exists. Regenerate it?`,
        initialValue: false,
      });
      if (isCancelled(overwrite)) {
        p.cancel("Setup cancelled.");
        process.exit(0);
      }
      writeProjectContext = !!overwrite;
      s.start("Setting up project...");
    }

    if (writeProjectContext) {
      // Try rich auto-generation first, fall back to template
      try {
        const analysis = await analyzeProject(projectRoot, finalConfig as ToolkitConfig);
        const richContext = generateRichProjectContext(analysis);
        await writeTextFile(projectContextPath, richContext);
      } catch {
        const projectContext = await generateProjectContext(
          finalConfig,
          projectRoot,
        );
        await writeTextFile(projectContextPath, projectContext);
      }
    }

    // Copy built-in skill and workflow templates
    await copyTemplates("skills", contentDir, SKILLS_DIR);
    await copyTemplates("workflows", contentDir, WORKFLOWS_DIR);

    // Add sync scripts to package.json
    const scriptsAdded = await addSyncScripts(projectRoot);

    // Install pre-commit hook
    const hookInstalled = await installPreCommitHook(projectRoot);

    s.stop("Project initialized!");

    const created = [
      `${CONFIG_FILENAME} — project configuration`,
      `${CONTENT_DIR}/${PROJECT_CONTEXT_FILE} — project context (included in all entry points)`,
      `${CONTENT_DIR}/rules/ — project rules`,
      `${CONTENT_DIR}/skills/ — AI skills/commands`,
      `${CONTENT_DIR}/workflows/ — dev workflows`,
      `${CONTENT_DIR}/overrides/ — editor-specific overrides`,
    ];
    if (scriptsAdded) {
      created.push(
        "package.json — added sync, sync:dry, and sync:watch scripts",
      );
    }
    if (hookInstalled) {
      created.push(".git/hooks/pre-commit — auto-sync on commit");
    }

    p.note(created.join("\n"), "Created");

    // Auto-run sync to generate editor files immediately
    s.start("Syncing to editors...");
    try {
      const config = await loadConfig(projectRoot);
      const syncResult = await runSync(projectRoot, config);
      s.stop(`Synced ${syncResult.synced.length} file(s) to editors`);
    } catch (syncError) {
      s.stop('Sync skipped — run "chain sync" manually');
      log.dim(
        syncError instanceof Error ? syncError.message : String(syncError),
      );
    }

    p.outro("Done! Your editors are ready.");
  } catch (error) {
    p.cancel(
      `Failed to initialize: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
