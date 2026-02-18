import { log } from "../utils/logger.js";
import { rmSync, existsSync } from "fs";
import { join } from "path";

export interface CleanOptions {
  dryRun?: boolean;
  force?: boolean;
}

const GENERATED_PATHS = [
  ".cursor",
  ".claude", 
  ".windsurf",
  ".ai-sync",
  ".chain",
  ".cursorrules",
  "CLAUDE.md",
  "WINDSURF.md",
  ".editorconfig",
  ".vscode"
];

export async function runCleanCommand(projectDir: string, options: CleanOptions = {}) {
  log.info("🧹 Cleaning generated content...");
  
  let removedCount = 0;
  let totalSize = 0;

  for (const path of GENERATED_PATHS) {
    const fullPath = join(projectDir, path);
    
    if (existsSync(fullPath)) {
      if (options.dryRun) {
        log.info(`Would remove: ${path}`);
        removedCount++;
      } else {
        try {
          rmSync(fullPath, { recursive: true, force: true });
          log.removed(`${path}`);
          removedCount++;
        } catch (error) {
          log.error(`Failed to remove ${path}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  if (removedCount === 0) {
    log.info("✨ No generated content found to clean");
  } else {
    const action = options.dryRun ? "Would remove" : "Removed";
    log.success(`${action} ${removedCount} generated items`);
  }

  return { removedCount, totalSize };
}
