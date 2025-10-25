import i18next from 'i18next';
import FSBackend from 'i18next-fs-backend';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（适配 ESM）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 操作系统语言检测函数
export function detectOSLanguage(): string {
  const envLocale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || '';
  const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale || '';
  const candidate = (envLocale || intlLocale || 'en').toLowerCase();
  const lang = candidate.split(/[._-]/)[0];
  return lang === 'zh' ? 'zh' : 'en';
}

// 初始化 i18next
const initializeI18n = async () => {
  const detectedLang = detectOSLanguage();
  
  await i18next
    .use(FSBackend)
    .init({
      // 使用检测到的语言作为默认语言
      lng: detectedLang,
      // 支持的语言
      supportedLngs: ['en', 'zh'],
      // 回退语言
      fallbackLng: 'en',
      // 资源文件路径 - 使用相对于当前文件的路径
      backend: {
        loadPath: path.join(__dirname, '{{lng}}', '{{ns}}.json'),
      },
      // 命名空间 - 包含所有必要的命名空间
      ns: [
        'init',
        'update',
        'archive',
        'list',
        'view',
        'templates/agents-template',
        'templates/project-template',
        'templates/claude-template',
        'templates/cline-template',
        'templates/agents-root-stub',
        'templates/slash-command-apply-templates',
        'templates/slash-command-archive-templates',
        'templates/slash-command-proposal-templates'
      ],
      defaultNS: 'init',
      // 关闭调试模式，避免不必要的控制台输出
      debug: false,
      // 启用同步模式，适用于单用户系统
      initAsync: false,
      // 插值选项
      interpolation: {
        escapeValue: false, // React 已经默认转义
      },
      // 加载选项
      load: 'languageOnly', // 只加载语言，不加载地区变体
    });
};

// 立即初始化
await initializeI18n();

export default i18next;

// 获取翻译文本的函数
export function t(key: string, options?: any): string {
  // 添加调试信息
  const result = i18next.t(key, options) as string;
  if (process.env.NODE_ENV === 'development' && result === key) {
    console.warn(`Translation missing for key: ${key}`);
  }
  return result;
}

// 手动设置语言的函数
export async function setLanguage(lng: string): Promise<void> {
  await i18next.changeLanguage(lng);
}

// 初始化 i18n（允许通过环境变量或参数指定语言）
export async function initI18n(preferred?: string): Promise<void> {
  const lang = preferred || process.env.OPENSPEC_LANG || detectOSLanguage();
  
  try {
    // 确保所有必要的命名空间已加载，包括模板相关的命名空间
    const namespaces = [
      'init',
      'update',
      'templates/agents-template',
      'templates/project-template',
      'templates/claude-template',
      'templates/cline-template',
      'templates/agents-root-stub',
      'templates/slash-command-apply-templates',
      'templates/slash-command-archive-templates',
      'templates/slash-command-proposal-templates'
    ];
    
    await i18next.loadNamespaces(namespaces);
    await i18next.changeLanguage(lang);
    
    // 添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`i18n initialized with language: ${lang}`);
      console.log(`Available namespaces:`, i18next.options.ns);
      console.log(`Loaded namespaces:`, namespaces);
    }
  } catch (error) {
    console.warn('Failed to initialize i18n:', error);
    // 回退到英语
    await i18next.changeLanguage('en');
  }
}
