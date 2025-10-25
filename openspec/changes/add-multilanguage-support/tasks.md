## 1. 基础架构搭建
- [x] 1.1 安装 i18next 和相关依赖 (`pnpm add i18next i18next-fs-backend`)
- [x] 1.2 配置 i18next，包括初始化、语言检测顺序和后端设置；默认支持中文（zh）与英文（en）
- [x] 1.3 按照 `design.md` 中的多语言资源组织方案创建目录结构，并在项目中约定 `openspec/i18n/{en,zh}/` 资源路径
- [x] 1.4 开发资源加载器，实现按需加载和回退机制
- [x] 1.5 实现缓存机制以提高资源加载效能

## 2. 模板系统多语言支持
- [x] 2.1 修改模板管理器(`src/core/templates/index.ts`) 以集成 i18next，实现多语言模板资源加载
- [x] 2.2 为 `agents-template` 创建中英 `json` 资源文件，并填充内容
- [x] 2.3 为 `project-template` 创建中英 `json` 资源文件，并填充内容
- [x] 2.4 为 `agents-root-stub` 创建中英 `json` 资源文件，并填充内容
- [x] 2.5 为 `slash-command-templates` 创建中英 `json` 资源文件，并填充内容
- [x] 2.6 为 `claude-template` 创建中英 `json` 资源文件，并填充内容
- [x] 2.7 为 `cline-template` 创建中英 `json` 资源文件，并填充内容

## 3. 语言检测与切换功能
- [x] 3.1 实现操作系统语言检测逻辑
- [x] 3.2 开发语言手动切换功能（例如，通过命令行参数或配置文件）

## 4. 翻译与质量保障
- [x] 4.1 对所有 `json` 资源文件进行初步机器翻译
- [x] 4.2 对机器翻译的结果进行人工校对
- [x] 4.3 邀请专家对翻译进行最终评估
- [x] 4.4 编写脚本或手动检查，确保所有翻译内容符合 `chinese_translation_checklist.md`

## 5. 项目文件与硬编码字符串更新
- [x] 5.1 更新 `openspec/project.md` 以反映多语言支持
- [x] 5.2 更新 `AGENTS.md` 与 `openspec/AGENTS.md` 以包含多语言支持说明
- [x] 5.3 识别并替换代码中的硬编码字符串，改用 i18next 进行文本替换

## 6. 国际化适配
- [x] 6.1 验证所有文件和输出均使用 UTF-8 编码