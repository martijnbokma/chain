import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from '../core/config-loader.js';
import { loadChainContent } from './content-loader.js';
import {
  buildFullContext,
  buildRulesContent,
  buildSkillsContent,
  buildWorkflowsContent,
} from './prompt-handlers.js';

const PROMPT_NAMES = {
  fullContext: 'chain_full_context',
  rules: 'chain_rules',
  skills: 'chain_skills',
  workflows: 'chain_workflows',
} as const;

export async function runMcpServer(projectRoot: string): Promise<void> {
  let config;
  try {
    config = await loadConfig(projectRoot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Chain MCP server: ${msg}\n`);
    process.exit(1);
  }

  const content = await loadChainContent(projectRoot, config);

  const server = new McpServer(
    {
      name: 'chain',
      version: '0.1.7',
    },
    {
      capabilities: {
        prompts: { listChanged: false },
      },
    },
  );

  server.registerPrompt(
    PROMPT_NAMES.fullContext,
    {
      title: 'Chain Full Context',
      description: 'Complete Chain context: project info, rules, skills, and workflows',
    },
    () => ({
      description: 'Complete Chain context for the project',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: buildFullContext(content),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    PROMPT_NAMES.rules,
    {
      title: 'Chain Rules',
      description: 'Project rules and conventions from .chain/rules/',
    },
    () => ({
      description: 'Project rules',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: buildRulesContent(content),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    PROMPT_NAMES.skills,
    {
      title: 'Chain Skills',
      description: 'AI skills and capabilities from .chain/skills/',
    },
    () => ({
      description: 'AI skills',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: buildSkillsContent(content),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    PROMPT_NAMES.workflows,
    {
      title: 'Chain Workflows',
      description: 'Development workflows from .chain/workflows/',
    },
    () => ({
      description: 'Development workflows',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: buildWorkflowsContent(content),
          },
        },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
