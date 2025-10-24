export const OPENSPEC_DIR_NAME = 'openspec';

export const OPENSPEC_MARKERS = {
  start: '<!-- OPENSPEC:START -->',
  end: '<!-- OPENSPEC:END -->'
};

export interface OpenSpecConfig {
  aiTools: string[];
}

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  successLabel?: string;
  category: 'native' | 'other';
}

export const AI_TOOLS: AIToolOption[] = [
  { name: 'Auggie (Augment CLI)', value: 'auggie', available: true, successLabel: 'Auggie', category: 'native' },
  { name: 'Claude Code', value: 'claude', available: true, successLabel: 'Claude Code', category: 'native' },
  { name: 'Cline', value: 'cline', available: true, successLabel: 'Cline', category: 'native' },
  { name: 'CodeBuddy Code (CLI)', value: 'codebuddy', available: true, successLabel: 'CodeBuddy Code', category: 'native' },
  { name: 'Crush', value: 'crush', available: true, successLabel: 'Crush', category: 'native' },
  { name: 'Cursor', value: 'cursor', available: true, successLabel: 'Cursor', category: 'native' },
  { name: 'Factory Droid', value: 'factory', available: true, successLabel: 'Factory Droid', category: 'native' },
  { name: 'OpenCode', value: 'opencode', available: true, successLabel: 'OpenCode', category: 'native' },
  { name: 'Kilo Code', value: 'kilocode', available: true, successLabel: 'Kilo Code', category: 'native' },
  { name: 'Trae IDE', value: 'trae', available: true, successLabel: 'Trae IDE', category: 'other' },
  { name: 'Windsurf', value: 'windsurf', available: true, successLabel: 'Windsurf', category: 'native' },
  { name: 'Codex', value: 'codex', available: true, successLabel: 'Codex', category: 'native' },
  { name: 'GitHub Copilot', value: 'github-copilot', available: true, successLabel: 'GitHub Copilot', category: 'native' },
  { name: 'Amazon Q Developer', value: 'amazon-q', available: true, successLabel: 'Amazon Q Developer', category: 'native' },
  { name: 'AGENTS.md (works with Amp, VS Code, …)', value: 'agents', available: true, successLabel: 'your AGENTS.md-compatible assistant', category: 'other' }
];
