import type { LoadedContent } from './content-loader.js';

const SECTION_SEP = '\n\n---\n\n';

function formatFiles(files: { name: string; content: string; relativePath: string }[]): string {
  return files
    .map((f) => `## ${f.name}\n\n${f.content}`)
    .join(SECTION_SEP);
}

export function buildFullContext(content: LoadedContent): string {
  const parts: string[] = [];

  if (content.projectContext) {
    parts.push('# Project Context\n\n' + content.projectContext);
  }

  if (content.rules.length > 0) {
    parts.push('# Rules\n\n' + formatFiles(content.rules));
  }

  if (content.skills.length > 0) {
    parts.push('# Skills\n\n' + formatFiles(content.skills));
  }

  if (content.workflows.length > 0) {
    parts.push('# Workflows\n\n' + formatFiles(content.workflows));
  }

  return parts.join(SECTION_SEP) || 'No Chain content found. Run `chain init` and add rules, skills, or workflows to .chain/';
}

export function buildRulesContent(content: LoadedContent): string {
  if (content.rules.length === 0) {
    return 'No rules found. Add rules to .chain/rules/';
  }
  return formatFiles(content.rules);
}

export function buildSkillsContent(content: LoadedContent): string {
  if (content.skills.length === 0) {
    return 'No skills found. Add skills to .chain/skills/';
  }
  return formatFiles(content.skills);
}

export function buildWorkflowsContent(content: LoadedContent): string {
  if (content.workflows.length === 0) {
    return 'No workflows found. Add workflows to .chain/workflows/';
  }
  return formatFiles(content.workflows);
}
