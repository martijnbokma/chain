import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { log } from '../utils/logger.js';

export interface ContentMetadata {
  id: string; // SHA-256 of content
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
  dependencies: string[]; // IDs of dependent content
  dependents: string[]; // IDs of content that depends on this
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  syncTargets: string[]; // Editor paths where this is synced
  source: 'local' | 'external' | 'template';
  checksum: string; // For integrity verification
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
  strength: number; // 0-1, how strong the relationship is
}

/**
 * Global Content Registry for centralized content management
 */
export class ContentRegistry {
  private projectRoot: string;
  private registryPath: string;
  private metadata: Map<string, ContentMetadata> = new Map();
  private relationships: ContentRelationship[] = [];
  private loaded = false;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.registryPath = join(projectRoot, '.ai-sync', 'registry.json');
  }

  /**
   * Load registry from disk or create new one
   */
  async load(): Promise<void> {
    try {
      const data = await readFile(this.registryPath, 'utf8');
      const parsed = JSON.parse(data);
      
      this.metadata = new Map(parsed.metadata || []);
      this.relationships = parsed.relationships || [];
      this.loaded = true;
      
      log.info(`Loaded content registry with ${this.metadata.size} items`);
    } catch (error) {
      // Registry doesn't exist or is corrupted
      await this.initialize();
    }
  }

  /**
   * Initialize new registry
   */
  private async initialize(): Promise<void> {
    await mkdir(dirname(this.registryPath), { recursive: true });
    this.metadata.clear();
    this.relationships = [];
    this.loaded = true;
    await this.save();
    log.info('Initialized new content registry');
  }

  /**
   * Save registry to disk
   */
  async save(): Promise<void> {
    if (!this.loaded) return;

    const data = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      metadata: Array.from(this.metadata.entries()),
      relationships: this.relationships,
      stats: this.getStats()
    };

    await writeFile(this.registryPath, JSON.stringify(data, null, 2));
  }

  /**
   * Register or update content in the registry
   */
  async registerContent(
    content: string,
    path: string,
    type: ContentMetadata['type'],
    options: {
      category?: string;
      tags?: string[];
      source?: ContentMetadata['source'];
      quality?: Partial<ContentMetadata['quality']>;
    } = {}
  ): Promise<string> {
    await this.ensureLoaded();

    const id = this.calculateContentId(content);
    const checksum = this.calculateChecksum(content);
    const now = new Date();

    const existing = this.metadata.get(id);
    
    const metadata: ContentMetadata = {
      id,
      name: this.extractName(path),
      path,
      type,
      category: options.category || this.extractCategory(path),
      tags: options.tags || [],
      quality: {
        score: options.quality?.score || 0,
        validated: options.quality?.validated || now,
        issues: options.quality?.issues || []
      },
      dependencies: [],
      dependents: [],
      version: existing ? existing.version + 1 : 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastSync: existing?.lastSync,
      syncTargets: existing?.syncTargets || [],
      source: options.source || 'local',
      checksum
    };

    // Extract dependencies from content
    metadata.dependencies = await this.extractDependencies(content);

    this.metadata.set(id, metadata);

    // Update relationships
    await this.updateRelationships(id, metadata.dependencies);

    await this.save();
    
    log.info(`Registered content: ${metadata.name} (v${metadata.version})`);
    return id;
  }

  /**
   * Get content metadata by ID
   */
  getContent(id: string): ContentMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Get content by path
   */
  getContentByPath(path: string): ContentMetadata | undefined {
    for (const metadata of this.metadata.values()) {
      if (metadata.path === path) {
        return metadata;
      }
    }
    return undefined;
  }

  /**
   * Find content by type, category, or tags
   */
  findContent(query: {
    type?: ContentMetadata['type'];
    category?: string;
    tags?: string[];
    minQuality?: number;
  }): ContentMetadata[] {
    const results: ContentMetadata[] = [];

    for (const metadata of this.metadata.values()) {
      if (query.type && metadata.type !== query.type) continue;
      if (query.category && metadata.category !== query.category) continue;
      if (query.minQuality && metadata.quality.score < query.minQuality) continue;
      if (query.tags && !query.tags.some(tag => metadata.tags.includes(tag))) continue;
      
      results.push(metadata);
    }

    return results;
  }

  /**
   * Get content statistics
   */
  getStats(): RegistryStats {
    const items = Array.from(this.metadata.values());
    
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalQuality = 0;

    for (const item of items) {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byCategory[item.category || 'uncategorized'] = (byCategory[item.category || 'uncategorized'] || 0) + 1;
      totalQuality += item.quality.score;
    }

    return {
      totalItems: items.length,
      byType,
      byCategory,
      averageQuality: items.length > 0 ? totalQuality / items.length : 0,
      lastUpdated: new Date(),
      conflicts: this.detectConflicts().length,
      orphans: this.detectOrphans().length
    };
  }

  /**
   * Detect content conflicts (duplicate names, etc.)
   */
  detectConflicts(): Array<{ type: string; items: ContentMetadata[] }> {
    const conflicts: Array<{ type: string; items: ContentMetadata[] }> = [];
    const nameMap = new Map<string, ContentMetadata[]>();

    // Group by name
    for (const metadata of this.metadata.values()) {
      const name = metadata.name.toLowerCase();
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name)!.push(metadata);
    }

    // Find duplicates
    for (const [name, items] of nameMap) {
      if (items.length > 1) {
        conflicts.push({ type: 'duplicate_name', items });
      }
    }

    return conflicts;
  }

  /**
   * Detect orphaned content (no dependents, not referenced)
   */
  detectOrphans(): ContentMetadata[] {
    const orphans: ContentMetadata[] = [];
    
    for (const metadata of this.metadata.values()) {
      if (metadata.dependents.length === 0 && metadata.dependencies.length === 0) {
        // Check if it's referenced by relationships
        const referenced = this.relationships.some(rel => rel.to === metadata.id);
        if (!referenced) {
          orphans.push(metadata);
        }
      }
    }

    return orphans;
  }

  /**
   * Get dependency graph for content
   */
  getDependencyGraph(id: string): {
    direct: ContentMetadata[];
    indirect: ContentMetadata[];
    dependents: ContentMetadata[];
  } {
    const content = this.metadata.get(id);
    if (!content) {
      return { direct: [], indirect: [], dependents: [] };
    }

    const direct = content.dependencies
      .map(depId => this.metadata.get(depId))
      .filter(Boolean) as ContentMetadata[];

    const indirect = new Set<ContentMetadata>();
    const visited = new Set<string>();

    const collectIndirect = (depIds: string[]) => {
      for (const depId of depIds) {
        if (visited.has(depId)) continue;
        visited.add(depId);
        
        const dep = this.metadata.get(depId);
        if (dep) {
          indirect.add(dep);
          collectIndirect(dep.dependencies);
        }
      }
    };

    collectIndirect(content.dependencies);

    const dependents = content.dependents
      .map(depId => this.metadata.get(depId))
      .filter(Boolean) as ContentMetadata[];

    return {
      direct,
      indirect: Array.from(indirect),
      dependents
    };
  }

  /**
   * Update sync status for content
   */
  async updateSyncStatus(id: string, targetPath: string, success: boolean): Promise<void> {
    const metadata = this.metadata.get(id);
    if (!metadata) return;

    metadata.lastSync = new Date();
    
    if (success && !metadata.syncTargets.includes(targetPath)) {
      metadata.syncTargets.push(targetPath);
    } else if (!success) {
      metadata.syncTargets = metadata.syncTargets.filter(t => t !== targetPath);
    }

    await this.save();
  }

  /**
   * Clean up old entries and optimize registry
   */
  async optimize(): Promise<void> {
    await this.ensureLoaded();

    // Remove entries with no sync targets and not recently updated
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const toRemove: string[] = [];

    for (const [id, metadata] of this.metadata) {
      if (metadata.syncTargets.length === 0 && metadata.updatedAt < cutoff) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.metadata.delete(id);
      log.info(`Removed old content: ${id}`);
    }

    // Clean up relationships
    this.relationships = this.relationships.filter(
      rel => this.metadata.has(rel.from) && this.metadata.has(rel.to)
    );

    await this.save();
    log.info(`Registry optimized: removed ${toRemove.length} old entries`);
  }

  // Private helper methods

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.load();
    }
  }

  private calculateContentId(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  private calculateChecksum(content: string): string {
    return createHash('md5').update(content, 'utf8').digest('hex');
  }

  private extractName(path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.(md|markdown)$/, '');
  }

  private extractCategory(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 2] || 'uncategorized';
  }

  private async extractDependencies(content: string): Promise<string[]> {
    const dependencies: string[] = [];
    
    // Simple dependency extraction - look for references to other content
    const referencePatterns = [
      /@skill:([a-zA-Z0-9-_]+)/g,
      /@rule:([a-zA-Z0-9-_]+)/g,
      /@workflow:([a-zA-Z0-9-_]+)/g,
      /refer to.*?([a-zA-Z0-9-_]+)\.(md|markdown)/gi
    ];

    for (const pattern of referencePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const name = match.split(':')[1] || match.match(/([a-zA-Z0-9-_]+)\.(md|markdown)/)?.[1];
          if (name) {
            dependencies.push(name);
          }
        }
      }
    }

    return dependencies;
  }

  private async updateRelationships(contentId: string, dependencies: string[]): Promise<void> {
    // Remove old relationships from this content
    this.relationships = this.relationships.filter(rel => rel.from !== contentId);

    // Add new relationships
    for (const depName of dependencies) {
      // Find the actual content ID by name
      let depId: string | undefined;
      for (const [id, metadata] of this.metadata) {
        if (metadata.name.toLowerCase() === depName.toLowerCase()) {
          depId = id;
          break;
        }
      }

      if (depId) {
        this.relationships.push({
          from: contentId,
          to: depId,
          type: 'depends_on',
          strength: 0.8
        });

        // Update dependents
        const depMetadata = this.metadata.get(depId);
        if (depMetadata && !depMetadata.dependents.includes(contentId)) {
          depMetadata.dependents.push(contentId);
        }
      }
    }
  }
}
