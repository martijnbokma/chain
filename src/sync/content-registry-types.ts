/**
 * Types for the content registry
 */

export interface ContentMetadata {
  id: string;
  name: string;
  path: string;
  type: 'rule' | 'skill' | 'workflow';
  category?: string;
  tags: string[];
  quality: {
    score: number;
    validated: Date;
    issues: string[];
  };
  dependencies: string[];
  dependents: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  syncTargets: string[];
  source: 'local' | 'external' | 'template';
  checksum: string;
}

export interface RegistryStats {
  totalItems: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  averageQuality: number;
  lastUpdated: Date;
  conflicts: number;
  orphans: number;
}

export interface ContentRelationship {
  from: string;
  to: string;
  type: 'depends_on' | 'includes' | 'extends' | 'references';
  strength: number;
}
