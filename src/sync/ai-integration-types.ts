/**
 * Types for AI integration
 */

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIAnalysisResult {
  quality: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  content: {
    purpose: string;
    category: string;
    tags: string[];
    complexity: 'low' | 'medium' | 'high';
    estimatedReadingTime: number;
  };
  relationships: {
    dependencies: string[];
    similar: string[];
    conflicts: string[];
  };
  improvements: {
    priority: 'low' | 'medium' | 'high';
    description: string;
    examples?: string[];
  }[];
}

export interface AIMergeResult {
  mergedContent: string;
  confidence: number;
  explanation: string;
  conflicts: string[];
  improvements: string[];
}
