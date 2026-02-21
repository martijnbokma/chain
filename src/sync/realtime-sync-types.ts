/**
 * Types for the realtime sync engine
 */

import type { SmartSyncResult } from './smart-sync-types.js';

export interface RealtimeSyncOptions {
  sourceDir: string;
  targetDir: string;
  debounceDelay?: number;
  autoResolve?: 'source' | 'target' | 'prompt';
  enableAI?: boolean;
  batchSize?: number;
}

/** Discriminated union for SyncEvent details by event type */
export type SyncEventDetails =
  | { path: string; size?: number }
  | { previousHash?: string; newHash?: string }
  | { path: string; localHash: string; remoteHash: string; reason: string };

export interface SyncEvent {
  type: 'add' | 'update' | 'delete' | 'conflict';
  filePath: string;
  timestamp: Date;
  details?: SyncEventDetails;
}

export interface SyncCompletedEvent {
  type: 'sync';
  filePath: string;
  duration: number;
  result: SmartSyncResult;
}

export interface RealtimeSyncStats {
  filesWatched: number;
  eventsProcessed: number;
  syncsPerformed: number;
  conflictsResolved: number;
  averageSyncTime: number;
  uptime: number;
  lastSync?: Date;
}
