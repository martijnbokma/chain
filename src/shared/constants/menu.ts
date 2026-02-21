/**
 * Shared menu constants and configurations
 * SSOT for all menu-related constants
 */

import type { Category, MenuOption } from '../types/menu.js';

export const MENU_CATEGORIES: Category[] = [
  {
    id: 'sync',
    title: 'Sync Operations',
    description: 'Synchronization and file management',
    icon: '🔄',
    color: 'blue'
  },
  {
    id: 'validation',
    title: 'Quality & Validation',
    description: 'Content validation and quality checks',
    icon: '✅',
    color: 'green'
  },
  {
    id: 'ai',
    title: 'AI & Intelligence',
    description: 'AI-powered analysis and enhancements',
    icon: '🤖',
    color: 'purple'
  },
  {
    id: 'management',
    title: 'Management',
    description: 'Registry, configuration and project management',
    icon: '⚙️',
    color: 'orange'
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Development tools and utilities',
    icon: '🛠️',
    color: 'gray'
  },
  {
    id: 'info',
    title: 'Information',
    description: 'Project information and status',
    icon: 'ℹ️',
    color: 'cyan'
  },
  {
    id: 'development',
    title: 'Development',
    description: 'Development and build operations',
    icon: '🚀',
    color: 'red'
  }
];

export const MENU_ICONS = {
  sync: '🔄',
  validation: '✅',
  ai: '🤖',
  management: '⚙️',
  tools: '🛠️',
  info: 'ℹ️',
  development: '🚀',
  validate: '✅',
  improve: '🔧',
  manage: '⚙️'
} as const;

export const MENU_OPTIONS: MenuOption[] = [
  { id: 'sync', title: 'Sync to Editors', description: 'Sync rules, skills, and workflows to all enabled AI editors', command: 'bun sync', category: 'sync', icon: '📤' },
  { id: 'sync-templates', title: 'Sync Templates', description: 'Two-way sync between templates and .chain directories', command: 'bun sync-templates', category: 'sync', icon: '🔄' },
  { id: 'sync-templates-to-ai-content', title: 'Sync Templates → AI Content', description: 'Sync templates directory to .chain directory', command: 'bun sync:templates:to-ai-content', category: 'sync', icon: '→' },
  { id: 'sync-ai-content-to-templates', title: 'Sync AI Content → Templates', description: 'Sync .chain directory to templates directory', command: 'bun sync:templates:from-ai-content', category: 'sync', icon: '←' },
  { id: 'sync-status', title: 'Sync Status', description: 'Show sync status between templates and .chain', command: 'bun sync:status', category: 'sync', icon: '📊' },
  { id: 'conflict-resolution', title: 'Conflict Resolution', description: 'Analyze and resolve file conflicts based on timestamps', command: 'bun conflict:resolution', category: 'sync', icon: '🔧' },
  { id: 'smart-sync', title: 'Smart Sync', description: 'Intelligent sync with content hashing and conflict detection', command: 'bun smart-sync', category: 'sync', icon: '🧠' },
  { id: 'resolve-conflicts', title: 'Resolve Conflicts', description: 'AI-powered conflict resolution for sync conflicts', command: 'bun resolve-conflicts', category: 'sync', icon: '🤝' },
  { id: 'realtime-sync', title: 'Real-time Sync', description: 'Start real-time file watching and instant sync', command: 'bun realtime-sync', category: 'sync', icon: '⚡' },
  { id: 'validate-prompts', title: 'Validate Prompts', description: 'Check prompt quality against standards and best practices', command: 'bun validate-prompts', category: 'validation', icon: '📝' },
  { id: 'ai', title: 'AI Commands', description: 'AI-powered content analysis and enhancement tools', command: 'bun ai', category: 'ai', icon: '🤖' },
  { id: 'improve-prompts', title: 'Improve Prompts', description: 'Auto-add missing sections and examples to prompts', command: 'bun improve-prompts', category: 'ai', icon: '✨' },
  { id: 'init', title: 'Initialize Project', description: 'Initialize chain configuration in current project', command: 'bun init', category: 'management', icon: '🆕' },
  { id: 'generate-context', title: 'Generate Context', description: 'Generate rich PROJECT.md with detected architecture', command: 'bun generate-context', category: 'management', icon: '📋' },
  { id: 'watch', title: 'Watch & Auto-Sync', description: 'Watch for changes and automatically sync files', command: 'bun watch', category: 'management', icon: '👀' },
  { id: 'promote', title: 'Promote Content', description: 'Promote local content to shared source of truth', command: 'bun promote', category: 'management', icon: '⬆️' },
  { id: 'registry', title: 'Registry Management', description: 'Global content registry management and statistics', command: 'bun registry', category: 'management', icon: '📊' },
  { id: 'performance', title: 'Performance Tools', description: 'Performance monitoring and optimization tools', command: 'bun performance', category: 'management', icon: '⚡' },
  { id: 'clean', title: 'Clean Project', description: 'Remove all generated content and configurations', command: 'bun clean', category: 'management', icon: '🧹' },
  { id: 'sync-all', title: 'Sync All Projects', description: 'Sync all projects in a monorepo (finds nested chain.yaml files)', command: 'bun sync-all', category: 'tools', icon: '🌐' },
  { id: 'validate', title: 'Validate Configuration', description: 'Validate chain configuration and content structure', command: 'bun validate', category: 'info', icon: '✅' },
  { id: 'help', title: 'Show Help', description: 'Display all available chain commands and options', command: 'bun --help', category: 'info', icon: '❓' },
  { id: 'version', title: 'Show Version', description: 'Display chain version information', command: 'bun --version', category: 'info', icon: '🏷️' },
  { id: 'build', title: 'Build Project', description: 'Build the Chain project and generate distribution files', command: 'bun run build', category: 'development', icon: '🔨' },
  { id: 'dev', title: 'Development Mode', description: 'Start development server with file watching', command: 'bun run dev', category: 'development', icon: '👨‍💻' },
  { id: 'start', title: 'Start Application', description: 'Start the chain application', command: 'bun run start', category: 'development', icon: '▶️' },
  { id: 'test', title: 'Run Tests', description: 'Run the test suite with Vitest', command: 'bun run test', category: 'development', icon: '🧪' },
  { id: 'test-run', title: 'Run Tests Once', description: 'Run tests without watching for file changes', command: 'bun run test:run', category: 'development', icon: '🏃' },
  { id: 'test-coverage', title: 'Test Coverage', description: 'Run tests with coverage reporting', command: 'bun run test:coverage', category: 'development', icon: '📈' },
  { id: 'typecheck', title: 'Type Check', description: 'Run TypeScript type checking without emitting files', command: 'bun run typecheck', category: 'development', icon: '🔍' },
  { id: 'lint', title: 'Lint Code', description: 'Run linting to check code quality and style', command: 'bun run lint', category: 'development', icon: '🔧' },
];
