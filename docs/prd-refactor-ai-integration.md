# Refactoring PRD: src/sync/ai-integration.ts

> Target: src/sync/ai-integration.ts  
> Lines: 526 | Tech Debt: 3 | Impact: 3 | Risk: 4 | Complexity: 2 | Score: 12

## Executive Summary

`AIIntegration` provides AI-powered content analysis, merge, and metadata extraction. The refactor aims to improve testability by extracting types and adding unit tests. Note: AIIntegration is not currently imported elsewhere (potential dead code).

## Current State

### Responsibilities
1. analyzeContent, performAIMerge, suggestImprovements, generateSummary, extractMetadata
2. Provider routing (OpenAI, Anthropic, local)
3. Prompt building (5 prompt types)
4. Response parsing (5 parser types)
5. Fallback logic when AI fails

### Issues
- No unit tests
- Types inline
- Mock implementations for all providers (no real API calls)

## Target State

1. Extract types to `ai-integration-types.ts`
2. Add unit tests for fallbacks, parsing, mock responses
3. Preserve public API

## Success Criteria
- [ ] Types in dedicated file
- [ ] Unit tests cover analyzeContent, performAIMerge, fallbacks
- [ ] All existing tests pass
