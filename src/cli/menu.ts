#!/usr/bin/env bun

import { Command } from "commander";
import { execSync } from "child_process";
import { select, confirm, text } from "@clack/prompts";
import { log } from "../utils/logger.js";
import type { MenuOption, MenuCategory } from "../shared/types/menu.js";

// Type guard for string values
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

const menuOptions: MenuOption[] = [
  // Sync Options
  {
    id: 'sync',
    title: 'Sync to Editors',
    description: 'Sync rules, skills, and workflows to all enabled AI editors',
    command: 'bun sync',
    category: 'sync' as MenuCategory
  },
  {
    id: 'sync-dry',
    title: 'Sync (Dry Run)',
    description: 'Preview sync changes without writing files',
    command: 'bun sync --dry-run',
    category: 'sync' as MenuCategory
  },
  {
    id: 'sync-templates',
    title: 'Sync Templates',
    description: 'Two-way sync between templates and .chain',
    command: 'bun sync-templates',
    category: 'sync' as MenuCategory
  },
  {
    id: 'smart-sync',
    title: 'Smart Sync',
    description: 'Intelligent sync with content hashing and conflict detection',
    command: 'bun smart-sync',
    category: 'sync' as MenuCategory
  },
  {
    id: 'smart-sync-status',
    title: 'Smart Sync Status',
    description: 'Show detailed sync status and statistics',
    command: 'bun smart-sync --status',
    category: 'sync' as MenuCategory
  },
  {
    id: 'realtime-sync',
    title: 'Real-time Sync',
    description: 'Start real-time file watching and instant sync',
    command: 'bun realtime-sync start',
    category: 'sync' as MenuCategory
  },
  {
    id: 'realtime-test',
    title: 'Test Real-time Sync',
    description: 'Test real-time sync functionality',
    command: 'bun realtime-sync test',
    category: 'sync' as MenuCategory
  },
  
  // Conflict Resolution
  {
    id: 'resolve-conflicts',
    title: 'Resolve Conflicts',
    description: 'AI-powered conflict resolution for sync conflicts',
    command: 'bun resolve-conflicts',
    category: 'sync' as MenuCategory
  },
  {
    id: 'ai-merge',
    title: 'AI Merge',
    description: 'AI-assisted merge of conflicting files',
    command: 'bun ai merge',
    category: 'sync' as MenuCategory
  },
  
  // Validate Options
  {
    id: 'validate',
    title: 'Validate Configuration',
    description: 'Validate chain configuration and content',
    command: 'bun validate',
    category: 'validate' as MenuCategory
  },
  {
    id: 'validate-prompts',
    title: 'Validate Prompts',
    description: 'Check prompt quality against standards',
    command: 'bun validate-prompts --toolkit-mode',
    category: 'validate' as MenuCategory
  },
  
  // AI & Improve Options
  {
    id: 'ai-analyze',
    title: 'AI Content Analysis',
    description: 'Analyze content quality and characteristics with AI',
    command: 'bun ai analyze',
    category: 'improve' as MenuCategory
  },
  {
    id: 'ai-improve',
    title: 'AI Improvement Suggestions',
    description: 'Get AI suggestions for content improvement',
    command: 'bun ai improve',
    category: 'improve' as MenuCategory
  },
  {
    id: 'ai-summarize',
    title: 'AI Content Summary',
    description: 'Generate AI summary of content',
    command: 'bun ai summarize',
    category: 'improve' as MenuCategory
  },
  {
    id: 'improve-prompts',
    title: 'Improve Prompts',
    description: 'Auto-add missing sections and examples to prompts',
    command: 'bun improve-prompts --auto',
    category: 'improve' as MenuCategory
  },
  {
    id: 'improve-prompts-dry',
    title: 'Improve Prompts (Dry Run)',
    description: 'Preview prompt improvements without modifying files',
    command: 'bun improve-prompts --dry-run',
    category: 'improve' as MenuCategory
  },
  
  // Registry & Management
  {
    id: 'registry-stats',
    title: 'Registry Statistics',
    description: 'Show global content registry statistics',
    command: 'bun registry stats',
    category: 'manage' as MenuCategory
  },
  {
    id: 'registry-search',
    title: 'Search Registry',
    description: 'Search content in global registry',
    command: 'bun registry search',
    category: 'manage' as MenuCategory
  },
  {
    id: 'registry-conflicts',
    title: 'Registry Conflicts',
    description: 'Detect and show content conflicts',
    command: 'bun registry conflicts',
    category: 'manage' as MenuCategory
  },
  {
    id: 'registry-optimize',
    title: 'Optimize Registry',
    description: 'Optimize content registry and clean up old entries',
    command: 'bun registry optimize',
    category: 'manage' as MenuCategory
  },
  {
    id: 'init',
    title: 'Initialize Project',
    description: 'Initialize chain in current project',
    command: 'bun init',
    category: 'manage' as MenuCategory
  },
  {
    id: 'generate-context',
    title: 'Generate Context',
    description: 'Generate rich PROJECT.md with detected architecture',
    command: 'bun generate-context',
    category: 'manage' as MenuCategory
  },
  {
    id: 'watch',
    title: 'Watch & Auto-Sync',
    description: 'Watch for changes and auto-sync',
    command: 'bun watch',
    category: 'manage' as MenuCategory
  },
  
  // Performance & Info
  {
    id: 'performance-benchmark',
    title: 'Performance Benchmark',
    description: 'Run performance benchmarks for sync operations',
    command: 'bun performance benchmark',
    category: 'info' as MenuCategory
  },
  {
    id: 'performance-cache',
    title: 'Cache Statistics',
    description: 'Show cache statistics and memory usage',
    command: 'bun performance cache-stats',
    category: 'info' as MenuCategory
  },
  {
    id: 'performance-optimize',
    title: 'Optimize Performance',
    description: 'Optimize performance and clean up caches',
    command: 'bun performance optimize',
    category: 'info' as MenuCategory
  },
  {
    id: 'status',
    title: 'Sync Status',
    description: 'Show sync status between templates and .chain',
    command: 'bun sync-status',
    category: 'info' as MenuCategory
  },
  {
    id: 'help',
    title: 'Show All Commands',
    description: 'Display all available chain commands',
    command: 'bun --help',
    category: 'info' as MenuCategory
  }
];

function groupOptionsByCategory(options: MenuOption[]): Record<string, MenuOption[]> {
  return options.reduce((groups, option) => {
    if (!groups[option.category]) {
      groups[option.category] = [];
    }
    groups[option.category].push(option);
    return groups;
  }, {} as Record<string, MenuOption[]>);
}

function displayMenu(): void {
  console.clear();
  console.log('\n🤖 Chain Interactive Menu');
  console.log('================================');
  log.info('');
  
  const grouped = groupOptionsByCategory(menuOptions);
  
  Object.entries(grouped).forEach(([category, options]) => {
    const categoryIcons = {
      sync: '🔄',
      validate: '✅',
      improve: '🔧',
      manage: '⚙️',
      info: 'ℹ️'
    };
    
    console.log(`${categoryIcons[category as keyof typeof categoryIcons]} ${category.toUpperCase()}`);
    console.log('-'.repeat(20));
    
    options.forEach((option, index) => {
      const globalIndex = menuOptions.indexOf(option);
      console.log(`  ${globalIndex + 1}. ${option.title}`);
      console.log(`     ${option.description}`);
      log.info('');
    });
    
    log.info('');
  });
  
  console.log('0. Exit');
  log.info('');
}

async function executeCommand(command: string): Promise<void> {
  try {
    console.log(`\n🚀 Executing: ${command}`);
    console.log('─'.repeat(50));
    
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    if (result) {
      console.log(result);
    }
    
    console.log('─'.repeat(50));
    console.log('✅ Command completed successfully!\n');
    
  } catch (error) {
    console.log('─'.repeat(50));
    console.log('❌ Command failed with error:');
    console.log(error instanceof Error ? error.message : error);
    console.log('─'.repeat(50));
    log.info('');
    
    // Don't exit, just continue with the menu
  }
}

async function showQuickActions(): Promise<void> {
  console.log('⚡ Quick Actions:');
  log.info('');
  
  const action = await select({
    message: 'Choose a quick action:',
    options: [
      { value: 'smart-sync', label: '🔄 Smart Sync' },
      { value: 'realtime-sync', label: '⚡ Real-time Sync' },
      { value: 'validate-config', label: '✅ Validate Config' },
      { value: 'ai-analyze', label: '🤖 AI Analysis' },
      { value: 'resolve-conflicts', label: '🔧 Resolve Conflicts' },
      { value: 'registry-stats', label: '📊 Registry Stats' },
      { value: 'performance-benchmark', label: '⚡ Performance Check' },
      { value: 'custom', label: '🎯 Custom Command' },
      { value: 'back', label: '↩️ Back to Main Menu' }
    ]
  });
  
  if (action === 'back') {
    return;
  }
  
  if (action === 'custom') {
    const customCommand = await text({
      message: 'Enter command to execute:',
      placeholder: 'bun smart-sync --dry-run',
      validate: (value) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Command cannot be empty';
        }
        return undefined;
      }
    });
    
    await executeCommand(String(customCommand).trim());
  } else {
    const option = menuOptions.find(opt => opt.id === action);
    if (option) {
      await executeCommand(option.command);
    }
  }
}

async function runInteractiveMenu(): Promise<void> {
  while (true) {
    displayMenu();
    
    const choice = await text({
      message: 'Enter your choice (0-32) or type "quick":',
      placeholder: '1-32, 0, or "quick"',
      validate: (value) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Please enter a choice';
        }
        
        const input = value.trim().toLowerCase();
        
        if (input === '0' || input === 'exit') return undefined;
        if (input === 'quick') return undefined;
        
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > menuOptions.length) {
          return `Please enter a number between 1 and ${menuOptions.length}, 0 to exit, or "quick"`;
        }
        
        return undefined;
      }
    });
    
    const input = String(choice).trim().toLowerCase();
    
    if (input === '0' || input === 'exit') {
      log.info('👋 Goodbye!');
      break;
    }
    
    if (input === 'quick') {
      await showQuickActions();
    } else {
      const num = parseInt(input);
      const option = menuOptions[num - 1];
      
      if (option) {
        const confirmed = await confirm({
          message: `Execute: ${option.title}\n${option.description}\n\nContinue?`
        });
        
        if (confirmed) {
          await executeCommand(option.command);
        }
      }
    }
    
    if (input !== 'exit') {
      const continueChoice = await confirm({
        message: 'Continue with another action?'
      });
      
      if (!continueChoice) {
        log.info('👋 Goodbye!');
        break;
      }
    }
  }
}

export const menuCommand = new Command("menu")
  .description("Interactive menu for common chain operations")
  .option("--quick", "Show quick actions menu", false)
  .action(async (options) => {
    if (options.quick) {
      await showQuickActions();
    } else {
      await runInteractiveMenu();
    }
  });
