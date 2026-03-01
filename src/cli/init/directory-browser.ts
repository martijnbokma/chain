import { join } from 'path';
import { readdir } from 'fs/promises';
import * as p from '@clack/prompts';
import { expandHomePath, fileExists } from '../../utils/file-ops.js';

/**
 * Interactive directory browser for selecting a path
 * Starts from a base directory and allows navigation through subdirectories
 */
export async function browseDirectory(
  startPath: string,
  prompt: string = 'Select directory'
): Promise<string | null> {
  let currentPath = expandHomePath(startPath);
  
  while (true) {
    // Read directories in current path
    const entries = await readdir(currentPath, { withFileTypes: true });
    const directories = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort();
    
    // Build options
    const options: Array<{ value: string; label: string; hint?: string }> = [];
    
    // Add "Use this directory" option
    const relativePath = currentPath.replace(expandHomePath('~'), '~');
    options.push({ 
      value: '__select__', 
      label: `✓ Use: ${relativePath}`,
      hint: 'Select this directory'
    });
    
    // Add parent directory option if not at root
    if (currentPath !== expandHomePath('~') && currentPath !== '/') {
      options.push({ 
        value: '__parent__', 
        label: '↑ Parent directory',
        hint: 'Go up one level'
      });
    }
    
    // Add subdirectories
    for (const dir of directories) {
      options.push({ 
        value: dir, 
        label: `📁 ${dir}`,
        hint: 'Enter this directory'
      });
    }
    
    // Add option to create new subdirectory
    options.push({ 
      value: '__new__', 
      label: '+ Create new subdirectory...',
      hint: 'Create a new folder here'
    });
    
    // Add cancel option
    options.push({ 
      value: '__cancel__', 
      label: '✕ Cancel',
      hint: 'Go back to path selection'
    });
    
    const choice = await p.select({
      message: `${prompt} (current: ${relativePath})`,
      options,
    });
    
    if (p.isCancel(choice)) return null;
    
    if (choice === '__select__') {
      return relativePath;
    } else if (choice === '__cancel__') {
      return null;
    } else if (choice === '__parent__') {
      currentPath = join(currentPath, '..');
    } else if (choice === '__new__') {
      const newDirName = await p.text({
        message: 'New directory name:',
        placeholder: 'my-folder',
        validate: (value) => {
          if (!value) return 'Directory name is required';
          if (value.includes('/')) return 'Directory name cannot contain /';
          if (value.startsWith('.')) return 'Directory name cannot start with .';
          return undefined;
        }
      });
      
      if (p.isCancel(newDirName)) continue;
      
      currentPath = join(currentPath, newDirName as string);
      return currentPath.replace(expandHomePath('~'), '~');
    } else {
      currentPath = join(currentPath, choice as string);
    }
  }
}
