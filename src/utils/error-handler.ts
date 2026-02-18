import { fileExists } from './file-ops.js';

/**
 * Enhanced error messages with suggestions
 */
export class ChainError extends Error {
  constructor(
    message: string,
    public suggestions?: string[],
    public code?: string
  ) {
    super(message);
    this.name = 'ChainError';
  }
}

/**
 * Common error handlers with helpful messages
 */
export const ErrorHandlers = {
  /**
   * Handle file not found errors with suggestions
   */
  fileNotFound: (filePath: string, context?: string): ChainError => {
    const suggestions: string[] = [];
    
    // Extract filename from path
    const filename = filePath.split('/').pop() || filePath;
    
    // Common file suggestions
    if (filename.includes('chain.yaml')) {
      suggestions.push('Run `chain init` to create the configuration file');
    } else if (filename.endsWith('.md')) {
      suggestions.push('Check if the file exists in your .chain/ directory');
      suggestions.push('Run `chain sync` to generate missing files');
    } else if (filename.includes('package.json')) {
      suggestions.push('Make sure you\'re in a valid project directory');
      suggestions.push('Run `npm init` or `bun init` to create package.json');
    }
    
    // Path-specific suggestions
    if (filePath.includes('.cursor/')) {
      suggestions.push('Make sure Cursor is installed and configured');
    } else if (filePath.includes('.windsurf/')) {
      suggestions.push('Make sure Windsurf is installed and configured');
    } else if (filePath.includes('.claude/')) {
      suggestions.push('Make sure Claude Code is installed and configured');
    }
    
    const message = context 
      ? `File not found: ${filePath} (${context})`
      : `File not found: ${filePath}`;
    
    return new ChainError(message, suggestions, 'FILE_NOT_FOUND');
  },

  /**
   * Handle configuration errors with suggestions
   */
  configError: (error: string, configPath?: string): ChainError => {
    const suggestions: string[] = [
      'Check the syntax in your chain.yaml file',
      'Run `chain doctor` to diagnose configuration issues',
      'Run `chain init --force` to recreate the configuration'
    ];
    
    if (configPath) {
      suggestions.unshift(`Verify the file at: ${configPath}`);
    }
    
    return new ChainError(
      `Configuration error: ${error}`,
      suggestions,
      'CONFIG_ERROR'
    );
  },

  /**
   * Handle sync errors with suggestions
   */
  syncError: (error: string, editor?: string): ChainError => {
    const suggestions: string[] = [
      'Run `chain doctor` to diagnose sync issues',
      'Check if the target editor is installed and accessible',
      'Verify your chain.yaml configuration'
    ];
    
    if (editor) {
      suggestions.unshift(`Check ${editor} configuration and permissions`);
    }
    
    return new ChainError(
      `Sync error: ${error}`,
      suggestions,
      'SYNC_ERROR'
    );
  },

  /**
   * Handle permission errors with suggestions
   */
  permissionError: (operation: string, path?: string): ChainError => {
    const suggestions: string[] = [
      'Check file/directory permissions',
      'Try running with sudo if appropriate',
      'Make sure you have write access to the target location'
    ];
    
    if (path) {
      suggestions.unshift(`Check permissions for: ${path}`);
    }
    
    return new ChainError(
      `Permission denied: Cannot ${operation}${path ? ` ${path}` : ''}`,
      suggestions,
      'PERMISSION_ERROR'
    );
  },

  /**
   * Handle network/connectivity errors
   */
  networkError: (operation: string): ChainError => {
    return new ChainError(
      `Network error: Failed to ${operation}`,
      [
        'Check your internet connection',
        'Verify npm registry is accessible',
        'Try again in a few moments',
        'Consider using a different registry if the issue persists'
      ],
      'NETWORK_ERROR'
    );
  },

  /**
   * Handle validation errors with suggestions
   */
  validationError: (field: string, value: string, expected?: string): ChainError => {
    const suggestions: string[] = [
      'Check the value in your chain.yaml configuration',
      'Run `chain doctor` for detailed validation'
    ];
    
    if (expected) {
      suggestions.unshift(`Expected: ${expected}`);
    }
    
    return new ChainError(
      `Invalid ${field}: "${value}"${expected ? ` (expected: ${expected})` : ''}`,
      suggestions,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Format error with suggestions for display
 */
export function formatError(error: ChainError): string {
  let message = `❌ ${error.message}`;
  
  if (error.suggestions && error.suggestions.length > 0) {
    message += '\n\n💡 Suggestions:';
    error.suggestions.forEach((suggestion, index) => {
      message += `\n   ${index + 1}. ${suggestion}`;
    });
  }
  
  if (error.code) {
    message += `\n\nCode: ${error.code}`;
  }
  
  return message;
}

/**
 * Suggest similar files for "file not found" errors
 */
export async function suggestSimilarFiles(
  targetPath: string,
  searchDir: string
): Promise<string[]> {
  const suggestions: string[] = [];
  const targetName = targetPath.split('/').pop()?.toLowerCase() || '';
  
  if (!targetName) return suggestions;
  
  try {
    // This would require implementing a file search function
    // For now, return common suggestions based on patterns
    if (targetName.includes('rule')) {
      suggestions.push('rules/project-conventions.md');
      suggestions.push('rules/coding-standards.md');
    } else if (targetName.includes('skill')) {
      suggestions.push('skills/code-review.md');
      suggestions.push('skills/debug-assistant.md');
    } else if (targetName.includes('workflow')) {
      suggestions.push('workflows/create-prd.md');
      suggestions.push('workflows/generate-tasks.md');
    }
  } catch {
    // Ignore search errors
  }
  
  return suggestions;
}
