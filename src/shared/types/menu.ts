/**
 * Shared menu types and interfaces
 * SSOT for all menu-related type definitions
 */

export interface MenuOption {
  id: string;
  title: string;
  description: string;
  command: string;
  category: MenuCategory;
  icon?: string;
  badge?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export type MenuCategory = 
  | 'sync' 
  | 'validation' 
  | 'ai' 
  | 'management' 
  | 'tools' 
  | 'info' 
  | 'development'
  | 'validate'
  | 'improve'
  | 'manage';

export type MenuAction = 'run' | 'preview' | 'configure';

export interface MenuState {
  selectedCategory?: string;
  selectedOption?: string;
  isRunning: boolean;
}
