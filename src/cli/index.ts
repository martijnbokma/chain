import { Command } from "commander";
import { runInit } from "./init.js";
import { runSyncCommand } from "./sync.js";
import { runValidateCommand } from "./validate.js";
import { runWatchCommand } from "./watch.js";
import { runMonorepoSyncCommand } from "./sync-all.js";
import { runPromote } from "./promote.js";
import { runGenerateContext } from "./generate-context.js";
import { runCleanCommand } from "./clean.js";
import { runDoctor } from "./doctor.js";
import { runUpdate } from "./update.js";
import { runTemplateSyncCommand, runTemplateSyncToAiContentCommand, runAiContentToTemplatesCommand, runSyncStatusCommand, runConflictResolutionCommand } from "./template-sync-cli.js";
import { validatePromptsCommand } from "./validate-prompts-cli.js";
import { smartSyncCommand } from "./smart-sync.js";
import { resolveConflictsCommand } from "./resolve-conflicts.js";
import { registryCommand } from "./registry.js";
import { performanceCommand } from "./performance.js";
import { realtimeSyncCommand } from "./realtime-sync.js";
import { improvePromptsCommand } from "./improve-prompts.js";
import { templatesSyncCommand } from "./templates-sync.js";
import { menuCommand } from "./menu.js";
import { fullMenuCommand } from "./full-menu.js";

const program = new Command();

program
  .name("chain")
  .description(
    "Universal AI chain — sync rules, skills, and workflows to all AI editors from a single source of truth",
  )
  .version("0.1.0");

program
  .command("init")
  .description("Initialize chain in the current project")
  .option("-f, --force", "Overwrite existing configuration", false)
  .option(
    "-a, --advanced",
    "Full setup wizard with content sources and detailed tech stack",
    false,
  )
  .option(
    "-s, --shared",
    "Create shared content hub at ~/.chain for cross-project sync",
    false,
  )
  .action(async (options) => {
    await runInit(process.cwd(), options.force, options.advanced, options.shared);
  });

program
  .command("sync")
  .description("Sync rules, skills, and workflows to all enabled editors")
  .option("-n, --dry-run", "Preview changes without writing files", false)
  .option("-y, --yes", "Automatically answer yes to all prompts", false)
  .option("--auto-remove-orphans", "Automatically remove orphaned files", false)
  .action(async (options) => {
    await runSyncCommand(process.cwd(), { 
      dryRun: options.dryRun,
      yes: options.yes,
      autoRemoveOrphans: options.autoRemoveOrphans
    });
  });

program
  .command("validate")
  .description("Validate configuration and content")
  .action(async () => {
    await runValidateCommand(process.cwd());
  });

program
  .command("watch")
  .description("Watch for changes and auto-sync")
  .action(async () => {
    await runWatchCommand(process.cwd());
  });

program
  .command("sync-all")
  .description(
    "Sync all projects in a monorepo (finds nested chain.yaml files)",
  )
  .option("-n, --dry-run", "Preview changes without writing files", false)
  .action(async (options) => {
    await runMonorepoSyncCommand(process.cwd(), { dryRun: options.dryRun });
  });

program
  .command("promote")
  .description(
    "Promote a local skill/workflow/rule to the shared SSOT (content source)",
  )
  .argument("<file>", "Path to the file to promote (e.g. skills/my-skill.md)")
  .option("-f, --force", "Overwrite if already exists in SSOT", false)
  .action(async (file, options) => {
    await runPromote(process.cwd(), file, options.force);
  });

program
  .command("generate-context")
  .description(
    "Analyze the project and generate a rich PROJECT.md with detected architecture, dependencies, and patterns",
  )
  .option(
    "-f, --force",
    "Overwrite existing PROJECT.md even if it has content",
    false,
  )
  .action(async (options) => {
    await runGenerateContext(process.cwd(), { force: options.force });
  });

program
  .command("clean")
  .description("Remove all generated content (editor configs, .chain, etc.)")
  .option("-n, --dry-run", "Preview what would be removed without actually deleting", false)
  .option("-f, --force", "Skip confirmation prompts", false)
  .action(async (options) => {
    await runCleanCommand(process.cwd(), { dryRun: options.dryRun, force: options.force });
  });

program
  .command("doctor")
  .description("Diagnose common issues and configuration problems")
  .action(async () => {
    await runDoctor(process.cwd());
  });

program
  .command("update")
  .description("Check for and install Chain updates")
  .option("-c, --check", "Only check for updates, don't install", false)
  .option("-n, --dry-run", "Preview what would be updated", false)
  .action(async (options) => {
    await runUpdate(options);
  });

program
  .command("sync-templates")
  .description("Two-way sync between templates and .chain")
  .action(async () => {
    await runTemplateSyncCommand(process.cwd());
  });

program
  .command("sync-templates-to-ai-content")
  .description("Sync templates → .chain")
  .action(async () => {
    await runTemplateSyncToAiContentCommand(process.cwd());
  });

program
  .command("sync-ai-content-to-templates")
  .description("Sync .chain → templates")
  .action(async () => {
    await runAiContentToTemplatesCommand(process.cwd());
  });

program
  .command("sync-status")
  .description("Show sync status between templates and .chain")
  .action(async () => {
    await runSyncStatusCommand(process.cwd());
  });

program
  .command("conflict-resolution")
  .description("Analyze and resolve file conflicts based on timestamps")
  .action(async () => {
    await runConflictResolutionCommand(process.cwd());
  });

// Add the new templates-sync command
program.addCommand(templatesSyncCommand);

// Add the validate-prompts command
program.addCommand(validatePromptsCommand);

// Add the smart-sync command
program.addCommand(smartSyncCommand);

// Add the resolve-conflicts command
program.addCommand(resolveConflictsCommand);

// Add the registry command
program.addCommand(registryCommand);

// Add the performance command
program.addCommand(performanceCommand);

// Add the realtime-sync command
program.addCommand(realtimeSyncCommand);

// Add the improve-prompts command
program.addCommand(improvePromptsCommand);

// Add the menu command
program.addCommand(menuCommand);

// Add the full menu command (complete with all scripts)
program.addCommand(fullMenuCommand);

program.parse();
