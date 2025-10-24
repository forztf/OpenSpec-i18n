import { agentsTemplate } from './agents-template.js';
import { projectTemplate, ProjectContext } from './project-template.js';
import { claudeTemplate } from './claude-template.js';
import { clineTemplate } from './cline-template.js';
import { agentsRootStubTemplate } from './agents-root-stub.js';
import { getSlashCommandBody, SlashCommandId } from './slash-command-templates.js';
import { initI18n } from '../i18n/index.js';
import { renderAgentsTemplateFromI18n, renderProjectTemplateFromI18n, renderClaudeTemplateFromI18n, renderClineTemplateFromI18n, renderAgentsRootStubFromI18n, renderSlashFromI18n } from './i18n-renderers.js';

export interface Template {
  path: string;
  content: string | ((context: ProjectContext) => string);
}

export class TemplateManager {
  static getTemplates(context: ProjectContext = {}): Template[] {
    return [
      { path: 'AGENTS.md', content: renderAgentsTemplateFromI18n() ?? agentsTemplate },
      { path: 'project.md', content: renderProjectTemplateFromI18n() ?? projectTemplate(context) },
    ];
  }

  static getClaudeTemplate(): string {
    return renderClaudeTemplateFromI18n() ?? claudeTemplate;
  }

  static getClineTemplate(): string {
    return renderClineTemplateFromI18n() ?? clineTemplate;
  }

  static getAgentsStandardTemplate(): string {
    return renderAgentsRootStubFromI18n() ?? agentsRootStubTemplate;
  }

  static getSlashCommandBody(id: SlashCommandId): string {
    return renderSlashFromI18n(id as any) ?? getSlashCommandBody(id);
  }
}

export { ProjectContext } from './project-template.js';
export type { SlashCommandId } from './slash-command-templates.js';
