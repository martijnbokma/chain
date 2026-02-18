#!/usr/bin/env bun

import { Command } from "commander";
import { select, confirm, multiselect, text } from "@clack/prompts";
import type { MenuOption, Category } from "../shared/types/menu.js";
import { MENU_CATEGORIES, MENU_ICONS } from "../shared/constants/menu.js";

const categories: Category[] = MENU_CATEGORIES;

const menuOptions: MenuOption[] = [
  // Sync Operations
  {
    id: 'sync',
    title: 'Sync to Editors',
    description: 'Sync rules, skills, and workflows to all enabled AI editors',
    command: 'bun sync',
    category: 'sync',
    icon: '📤'
  },
  {
    id: 'sync-templates',
    title: 'Sync Templates',
    description: 'Two-way sync between templates and .chain directories',
    command: 'bun sync-templates',
    category: 'sync',
    icon: '🔄'
  },
  {
    id: 'sync-templates-to-ai-content',
    title: 'Sync Templates → AI Content',
    description: 'Sync templates directory to .chain directory',
    command: 'bun sync:templates:to-ai-content',
    category: 'sync',
    icon: '→'
  },
  {
    id: 'sync-ai-content-to-templates',
    title: 'Sync AI Content → Templates',
    description: 'Sync .chain directory to templates directory',
    command: 'bun sync:templates:from-ai-content',
    category: 'sync',
    icon: '←'
  },
  {
    id: 'sync-status',
    title: 'Sync Status',
    description: 'Show sync status between templates and .chain',
    command: 'bun sync:status',
    category: 'sync',
    icon: '📊'
  },
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    description: 'Analyze and resolve file conflicts based on timestamps',
    command: 'bun conflict:resolution',
    category: 'sync',
    icon: '🔧'
  },
  {
    id: 'smart-sync',
    title: 'Smart Sync',
    description: 'Intelligent sync with content hashing and conflict detection',
    command: 'bun smart-sync',
    category: 'sync',
    icon: '🧠'
  },
  {
    id: 'resolve-conflicts',
    title: 'Resolve Conflicts',
    description: 'AI-powered conflict resolution for sync conflicts',
    command: 'bun resolve-conflicts',
    category: 'sync',
    icon: '🤝'
  },
  {
    id: 'realtime-sync',
    title: 'Real-time Sync',
    description: 'Start real-time file watching and instant sync',
    command: 'bun realtime-sync',
    category: 'sync',
    icon: '⚡'
  },

  // Validation
  {
    id: 'validate-prompts',
    title: 'Validate Prompts',
    description: 'Check prompt quality against standards and best practices',
    command: 'bun validate-prompts',
    category: 'validation',
    icon: '📝'
  },

  // AI & Intelligence
  {
    id: 'ai',
    title: 'AI Commands',
    description: 'AI-powered content analysis and enhancement tools',
    command: 'bun ai',
    category: 'ai',
    icon: '🤖'
  },
  {
    id: 'improve-prompts',
    title: 'Improve Prompts',
    description: 'Auto-add missing sections and examples to prompts',
    command: 'bun improve-prompts',
    category: 'ai',
    icon: '✨'
  },

  // Management
  {
    id: 'init',
    title: 'Initialize Project',
    description: 'Initialize chain configuration in current project',
    command: 'bun init',
    category: 'management',
    icon: '🆕'
  },
  {
    id: 'generate-context',
    title: 'Generate Context',
    description: 'Generate rich PROJECT.md with detected architecture',
    command: 'bun generate-context',
    category: 'management',
    icon: '📋'
  },
  {
    id: 'watch',
    title: 'Watch & Auto-Sync',
    description: 'Watch for changes and automatically sync files',
    command: 'bun watch',
    category: 'management',
    icon: '👀'
  },
  {
    id: 'promote',
    title: 'Promote Content',
    description: 'Promote local content to shared source of truth',
    command: 'bun promote',
    category: 'management',
    icon: '⬆️'
  },
  {
    id: 'registry',
    title: 'Registry Management',
    description: 'Global content registry management and statistics',
    command: 'bun registry',
    category: 'management',
    icon: '📊'
  },
  {
    id: 'performance',
    title: 'Performance Tools',
    description: 'Performance monitoring and optimization tools',
    command: 'bun performance',
    category: 'management',
    icon: '⚡'
  },
  {
    id: 'clean',
    title: 'Clean Project',
    description: 'Remove all generated content and configurations',
    command: 'bun clean',
    category: 'management',
    icon: '🧹'
  },

  // Tools & Utilities
  {
    id: 'sync-all',
    title: 'Sync All Projects',
    description: 'Sync all projects in a monorepo (finds nested chain.yaml files)',
    command: 'bun sync-all',
    category: 'tools',
    icon: '🌐'
  },

  // Information & Help
  {
    id: 'validate',
    title: 'Validate Configuration',
    description: 'Validate chain configuration and content structure',
    command: 'bun validate',
    category: 'info',
    icon: '✅'
  },
  {
    id: 'help',
    title: 'Show Help',
    description: 'Display all available chain commands and options',
    command: 'bun --help',
    category: 'info',
    icon: '❓'
  },
  {
    id: 'version',
    title: 'Show Version',
    description: 'Display chain version information',
    command: 'bun --version',
    category: 'info',
    icon: '🏷️'
  },

  // Development
  {
    id: 'build',
    title: 'Build Project',
    description: 'Build the Chain project and generate distribution files',
    command: 'bun run build',
    category: 'development',
    icon: '🔨'
  },
  {
    id: 'dev',
    title: 'Development Mode',
    description: 'Start development server with file watching',
    command: 'bun run dev',
    category: 'development',
    icon: '👨‍💻'
  },
  {
    id: 'start',
    title: 'Start Application',
    description: 'Start the chain application',
    command: 'bun run start',
    category: 'development',
    icon: '▶️'
  },
  {
    id: 'test',
    title: 'Run Tests',
    description: 'Run the test suite with Vitest',
    command: 'bun run test',
    category: 'development',
    icon: '🧪'
  },
  {
    id: 'test-run',
    title: 'Run Tests Once',
    description: 'Run tests without watching for file changes',
    command: 'bun run test:run',
    category: 'development',
    icon: '🏃'
  },
  {
    id: 'test-coverage',
    title: 'Test Coverage',
    description: 'Run tests with coverage reporting',
    command: 'bun run test:coverage',
    category: 'development',
    icon: '📈'
  },
  {
    id: 'typecheck',
    title: 'Type Check',
    description: 'Run TypeScript type checking without emitting files',
    command: 'bun run typecheck',
    category: 'development',
    icon: '🔍'
  },
  {
    id: 'lint',
    title: 'Lint Code',
    description: 'Run linting to check code quality and style',
    command: 'bun run lint',
    category: 'development',
    icon: '🔧'
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

function displayMainMenu(): void {
  console.clear();
  
  // Enhanced header
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    🤖 Chain Menu                     ║');
  console.log('║              Complete Interactive Interface               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const grouped = groupOptionsByCategory(menuOptions);
  
  categories.forEach((category, index) => {
    const options = grouped[category.id as keyof typeof grouped] || [];
    const count = options.length;
    
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${category.icon} ${category.title} [${count} commands]`);
    console.log(`    ${category.description}`);
    console.log('');
  });
  
  console.log(' 0. 👋 Exit');
  console.log('');
}

function displayCategoryMenu(categoryId: string): void {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;
  
  const options = menuOptions.filter(opt => opt.category === categoryId);
  
  console.clear();
  
  // Category header with color
  const colorMap: Record<string, string> = {
    blue: '🔵',
    green: '🟢', 
    purple: '🟣',
    cyan: '🔷',
    yellow: '🟡',
    gray: '⚫',
    red: '🔴'
  };
  
  console.log(`\n${colorMap[category.color] || '⚪'} ${category.title}`);
  console.log('═'.repeat(category.title.length + 2));
  console.log('');
  console.log(category.description);
  console.log('');
  
  options.forEach((option, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${option.icon} ${option.title}`);
    console.log(`    ${option.description}`);
    console.log(`    💾 ${option.command}`);
    console.log('');
  });
  
  console.log(' 0. ↩️ Back to Main Menu');
  console.log('');
}

async function executeCommand(command: string): Promise<void> {
  try {
    console.log(`\n🚀 Executing: ${command}`);
    console.log('─'.repeat(60));
    
    // Dynamic import to avoid side effects
    const { execSync } = await import('child_process');
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    if (result) {
      console.log(result);
    }
    
    console.log('─'.repeat(60));
    console.log('✅ Command completed successfully!\n');
    
  } catch (error) {
    console.log('─'.repeat(60));
    console.log('❌ Command failed with error:');
    console.log(error instanceof Error ? error.message : error);
    console.log('─'.repeat(60));
    console.log('');
  }
}

async function handleMainMenu(): Promise<string> {
  displayMainMenu();
  
  const choice = await select({
    message: 'Choose a category or action:',
    options: [
      ...categories.map(cat => ({
        value: cat.id,
        label: `${cat.icon} ${cat.title} [${menuOptions.filter(opt => opt.category === cat.id).length} commands]`
      })),
      { value: 'quick', label: '⚡ Quick Actions' },
      { value: 'custom', label: '🎯 Custom Command' },
      { value: 'exit', label: '👋 Exit' }
    ]
  });
  
  return String(choice);
}

async function handleCategoryMenu(categoryId: string): Promise<void> {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;
  
  const options = menuOptions.filter(opt => opt.category === categoryId);
  
  while (true) {
    displayCategoryMenu(categoryId);
    
    const choice = await select({
      message: `Choose a command in ${category.title}:`,
      options: [
        ...options.map(opt => ({
          value: opt.id,
          label: `${opt.icon} ${opt.title}`
        })),
        { value: 'back', label: '↩️ Back to Main Menu' }
      ]
    });
    
    if (choice === 'back') {
      return;
    }
    
    const option = options.find(opt => opt.id === choice);
    if (option) {
      const confirmed = await confirm({
        message: `${option.icon} Execute: ${option.title}\n${option.description}\n\nCommand: ${option.command}\n\nContinue?`
      });
      
      if (confirmed) {
        await executeCommand(option.command);
      }
      
      const continueChoice = await confirm({
        message: 'Continue in this category?'
      });
      
      if (!continueChoice) {
        return;
      }
    }
  }
}

async function showQuickActions(): Promise<void> {
  console.log('⚡ Quick Actions - Most Used Commands');
  console.log('');
  
  const quickActions = [
    { value: 'smart-sync', label: '🧠 Smart Sync' },
    { value: 'realtime-sync', label: '⚡ Real-time Sync' },
    { value: 'validate', label: '✅ Validate Configuration' },
    { value: 'ai', label: '🤖 AI Commands' },
    { value: 'registry', label: '📊 Registry Management' },
    { value: 'performance', label: '⚡ Performance Tools' },
    { value: 'clean', label: '🧹 Clean Project' },
    { value: 'build', label: '🔨 Build Project' },
    { value: 'test', label: '🧪 Run Tests' },
    { value: 'custom', label: '🎯 Custom Command' },
    { value: 'back', label: '↩️ Back to Main Menu' }
  ];
  
  const action = await select({
    message: 'Choose a quick action:',
    options: quickActions
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
    
    await executeCommand(typeof customCommand === 'string' ? customCommand.trim() : '');
  } else {
    const option = menuOptions.find(opt => opt.id === action);
    if (option) {
      await executeCommand(option.command);
    }
  }
}

async function showCustomCommand(): Promise<void> {
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
  
  await executeCommand(typeof customCommand === 'string' ? customCommand.trim() : '');
}

async function runFullMenu(): Promise<void> {
  while (true) {
    const choice = await handleMainMenu();
    
    if (choice === 'exit') {
      console.log('\n👋 Thanks for using Chain!');
      console.log('   See you next time! 🚀\n');
      break;
    }
    
    if (choice === 'quick') {
      await showQuickActions();
    } else if (choice === 'custom') {
      await showCustomCommand();
    } else if (choice) {
      await handleCategoryMenu(choice);
    }
    
    const continueChoice = await confirm({
      message: 'Continue with the menu?'
    });
    
    if (!continueChoice) {
      console.log('\n👋 Thanks for using Chain!');
      console.log('   See you next time! 🚀\n');
      break;
    }
  }
}

export const fullMenuCommand = new Command("menu")
  .description("Complete interactive menu with all package.json scripts and arrow key navigation")
  .option("--quick", "Show quick actions menu", false)
  .action(async (options) => {
    if (options.quick) {
      await showQuickActions();
    } else {
      await runFullMenu();
    }
  });
