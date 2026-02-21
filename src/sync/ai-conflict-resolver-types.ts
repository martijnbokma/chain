/**
 * Types for the AI conflict resolver
 */

export interface ConflictDetails {
  path: string;
  localContent: string;
  remoteContent: string;
  baseContent?: string;
  localHash: string;
  remoteHash: string;
  baseHash?: string;
  changeType: 'both-modified' | 'content-conflict' | 'structural-conflict';
}

export interface MergeResult {
  mergedContent: string;
  conflicts: string[];
  resolution: 'auto' | 'manual' | 'ai-assisted';
  confidence: number;
  explanation: string;
}

export interface ConflictResolutionOptions {
  strategy: 'auto' | 'manual' | 'ai-assisted';
  preferLocal?: boolean;
  preserveBoth?: boolean;
  interactive?: boolean;
}
