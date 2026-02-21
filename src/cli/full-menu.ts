#!/usr/bin/env bun

import { Command } from "commander";
import { select, confirm, text } from "@clack/prompts";
import type { MenuOption, Category } from "../shared/types/menu.js";
import { MENU_CATEGORIES, MENU_OPTIONS } from "../shared/constants/menu.js";

const categories: Category[] = MENU_CATEGORIES;
const menuOptions: MenuOption[] = MENU_OPTIONS;

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
    ],
    initialValue: categories[0]?.id,
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
      ],
      initialValue: options[0]?.id,
    });
    
    if (choice === 'back') {
      return;
    }
    
    const option = options.find(opt => opt.id === choice);
    if (option) {
      const confirmed = await confirm({
        message: `${option.icon} Execute: ${option.title}\n${option.description}\n\nCommand: ${option.command}\n\nContinue?`,
        initialValue: true,
      });
      
      if (confirmed) {
        await executeCommand(option.command);
      }
      
      const continueChoice = await confirm({
        message: 'Continue in this category?',
        initialValue: true,
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
    options: quickActions,
    initialValue: 'smart-sync',
  });
  
  if (action === 'back') {
    return;
  }
  
  if (action === 'custom') {
    const customCommand = await text({
      message: 'Enter command to execute:',
      initialValue: 'bun smart-sync --dry-run',
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
    initialValue: 'bun smart-sync --dry-run',
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
      message: 'Continue with the menu?',
      initialValue: true,
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
