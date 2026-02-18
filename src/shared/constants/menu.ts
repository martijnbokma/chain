/**
 * Shared menu constants and configurations
 * SSOT for all menu-related constants
 */

import type { Category } from '../types/menu.js';

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

export const MENU_COLORS = {
  blue: 'blue',
  green: 'green',
  purple: 'purple',
  orange: 'orange',
  gray: 'gray',
  cyan: 'cyan',
  red: 'red'
} as const;
