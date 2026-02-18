import { join } from 'path';
import { execSync } from 'child_process';
import * as p from '@clack/prompts';
import { readTextFile, fileExists } from '../utils/file-ops.js';
import { log } from '../utils/logger.js';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

/**
 * Check for Chain updates
 */
export async function runUpdate(options: { check?: boolean; dryRun?: boolean } = {}): Promise<void> {
  p.intro('🔄 Chain Update - Checking for updates...');
  
  try {
    const updateInfo = await getUpdateInfo();
    
    if (!updateInfo.updateAvailable) {
      log.success(`✅ You're using the latest version (${updateInfo.currentVersion})`);
      return;
    }
    
    log.info(`Current version: ${updateInfo.currentVersion}`);
    log.info(`Latest version: ${updateInfo.latestVersion}`);
    
    if (options.check) {
      log.info('Run `chain update` to install the latest version');
      return;
    }
    
    if (options.dryRun) {
      log.info('Dry run: Would update to latest version');
      return;
    }
    
    // Confirm update
    const confirmed = await p.confirm({
      message: `Update to version ${updateInfo.latestVersion}?`,
      initialValue: true,
    });
    
    if (confirmed === false) {
      p.cancel('Update cancelled');
      return;
    }
    
    // Perform update
    const s = p.spinner();
    s.start('Updating Chain...');
    
    try {
      await performUpdate();
      s.stop('✅ Update completed successfully!');
      
      p.note(
        `Chain has been updated to version ${updateInfo.latestVersion}\n\nRestart your terminal or run the command again to use the updated version.`,
        'Update Complete'
      );
      
    } catch (error) {
      s.stop('Update failed');
      log.error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
      
      p.note(
        'Try updating manually:\n' +
        '  npm install -g chain@latest\n' +
        '  # or\n' +
        '  bun add -g chain@latest',
        'Manual Update'
      );
      
      process.exit(1);
    }
    
  } catch (error) {
    p.cancel('Failed to check for updates');
    log.error(`Update check failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Get update information
 */
async function getUpdateInfo(): Promise<UpdateInfo> {
  const currentVersion = await getCurrentVersion();
  const latestVersion = await getLatestVersion();
  
  return {
    currentVersion,
    latestVersion,
    updateAvailable: compareVersions(currentVersion, latestVersion) < 0,
  };
}

/**
 * Get current Chain version
 */
async function getCurrentVersion(): Promise<string> {
  try {
    // Try to get version from package.json if running from source
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (await fileExists(packageJsonPath)) {
      const packageJson = JSON.parse(await readTextFile(packageJsonPath));
      if (packageJson.name === 'chain' && packageJson.version) {
        return packageJson.version;
      }
    }
    
    // Fall back to CLI version
    const version = execSync('chain --version', { encoding: 'utf8' }).trim();
    return version.replace('chain ', '');
  } catch {
    return 'unknown';
  }
}

/**
 * Get latest version from npm registry
 */
async function getLatestVersion(): Promise<string> {
  try {
    // Chain is not on npm yet, so return current version
    return await getCurrentVersion();
  } catch {
    return 'unknown';
  }
}

/**
 * Compare two version strings
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  const maxLength = Math.max(parts1.length, parts2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

/**
 * Perform the actual update
 */
async function performUpdate(): Promise<void> {
  // Check if Chain is installed globally or locally
  const isGlobal = await isGlobalInstallation();
  
  if (isGlobal) {
    // Update global installation
    try {
      execSync('npm update -g chain', { stdio: 'pipe' });
    } catch {
      // Try with bun if npm fails
      execSync('bun update -g chain', { stdio: 'pipe' });
    }
  } else {
    // Update local installation
    try {
      execSync('npm update chain', { stdio: 'pipe' });
    } catch {
      // Try with bun if npm fails
      execSync('bun update chain', { stdio: 'pipe' });
    }
  }
}

/**
 * Check if Chain is installed globally
 */
async function isGlobalInstallation(): Promise<boolean> {
  try {
    // Try to get the global package location
    const globalPath = execSync('npm list -g chain', { encoding: 'utf8', stdio: 'pipe' });
    return globalPath.includes('chain@');
  } catch {
    try {
      // Try with bun
      const globalPath = execSync('bun pm ls -g chain', { encoding: 'utf8', stdio: 'pipe' });
      return globalPath.includes('chain@');
    } catch {
      return false;
    }
  }
}
