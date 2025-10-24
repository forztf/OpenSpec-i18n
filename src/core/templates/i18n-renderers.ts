import i18next from '../i18n/index.js';
// Fallback to direct i18next namespace load; ensureNamespace may not be exported

export function renderAgentsTemplateFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/agents-template';
  try {
    // Ensure namespace is loaded from FS backend
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const bundle: any = i18next.getResourceBundle(lng, ns);
    if (!bundle || typeof bundle !== 'object') return null;
    return renderDocCommon(bundle);
  } catch {
    return null;
  }
}

export function renderProjectTemplateFromI18n(context: { projectName?: string; description?: string; techStack?: string[] } = {}): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/project-template';
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b) return null;
    const name = context.projectName || 'Project';
    const techStack = context.techStack?.length ? context.techStack.map((t) => `- ${t}`).join('\n') : '- [List your primary technologies]';
    const desc = context.description || b.purposeDescription || '[Describe your project\'s purpose and goals]';
    const lines: string[] = [];
    lines.push(`# ${b.title ? b.title.replace('{{projectName}}', name) : `${name} Context`}`);
    lines.push('', `## ${b.purpose ?? 'Purpose'}`, desc);
    lines.push('', `## ${b.techStack ?? 'Tech Stack'}`, techStack);
    lines.push('', `## ${b.conventions ?? 'Project Conventions'}`);
    lines.push('', `### ${b.codeStyle ?? 'Code Style'}`, b.codeStyleDescription ?? '[Describe your code style preferences, formatting rules, and naming conventions]');
    lines.push('', `### ${b.architecture ?? 'Architecture Patterns'}`, b.architectureDescription ?? '[Document your architectural decisions and patterns]');
    lines.push('', `### ${b.testing ?? 'Testing Strategy'}`, b.testingDescription ?? '[Explain your testing approach and requirements]');
    lines.push('', `### ${b.git ?? 'Git Workflow'}`, b.gitDescription ?? '[Describe your branching strategy and commit conventions]');
    lines.push('', `## ${b.domain ?? 'Domain Context'}`, b.domainDescription ?? '[Add domain-specific knowledge that AI assistants need to understand]');
    lines.push('', `## ${b.constraints ?? 'Important Constraints'}`, b.constraintsDescription ?? '[List any technical, business, or regulatory constraints]');
    lines.push('', `## ${b.dependencies ?? 'External Dependencies'}`, b.dependenciesDescription ?? '[Document key external services, APIs, or systems]');
    return lines.join('\n');
  } catch {
    return null;
  }
}

function renderDocCommon(b: any): string {
  if (!b.content) return null;
  if (Array.isArray(b.content)) {
    return b.content.join('\n');
  }
  return b.content;
}

export function renderClaudeTemplateFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/claude-template';
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b) return null;
    return renderDocCommon(b);
  } catch {
    return null;
  }
}

export function renderClineTemplateFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/cline-template';
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b) return null;
    return renderDocCommon(b);
  } catch {
    return null;
  }
}

export function renderAgentsRootStubFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/agents-root-stub';
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b) return null;
    return renderDocCommon(b);
  } catch {
    return null;
  }
}

export function renderSlashFromI18n(id: 'proposal' | 'apply' | 'archive'): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/slash-command-templates';
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18next.loadNamespaces(ns);
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b || !b[id]) return null;
    const section = b[id];
    const parts = [] as string[];
    if (section.guardrails) parts.push(section.guardrails);
    if (section.steps) parts.push(section.steps);
    if (section.references) parts.push(section.references);
    return parts.join('\n\n');
  } catch {
    return null;
  }
}
