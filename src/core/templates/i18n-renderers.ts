import i18next from '../i18n/index.js';
// Fallback to direct i18next namespace load; ensureNamespace may not be exported

export function renderAgentsTemplateFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/agents-template';
  try {
    // 在同步模式下，命名空间已经在初始化时加载
    const bundle: any = i18next.getResourceBundle(lng, ns);
    if (!bundle || typeof bundle !== 'object') return null;
    return renderDocCommon(bundle);
  } catch {
    return null;
  }
}

export function renderProjectTemplateFromI18n(): string | null {
  const lng = i18next.language || 'en';
  const ns = 'templates/project-template';
  try {
    // 在同步模式下，命名空间已经在初始化时加载
    const bundle: any = i18next.getResourceBundle(lng, ns);
    if (!bundle || typeof bundle !== 'object') return null;
    return renderDocCommon(bundle);
  } catch {
    return null;
  }
}

function renderDocCommon(b: any): string | null {
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
    const b: any = i18next.getResourceBundle(lng, ns);
    if (!b) return null;
    return renderDocCommon(b);
  } catch {
    return null;
  }
}

export function renderSlashFromI18n(id: 'proposal' | 'apply' | 'archive'): string | null {
  const currentLanguage = i18next.language || 'en';
  const resourceBundle = i18next.getResourceBundle(currentLanguage, `templates/slash-command-${id}-templates`);
  
  if (!resourceBundle || !resourceBundle.content) {
    return null;
  }
  
  return resourceBundle.content.join('\n');
}
