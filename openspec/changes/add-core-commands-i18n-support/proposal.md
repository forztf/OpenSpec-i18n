# Add i18n Support to Core Commands

## Why

目前OpenSpec CLI工具中的`archive`、`config`、`list`、`view`命令缺乏多语言支持，所有用户消息都是硬编码的英文文本。这与项目已经实现的`init`和`update`命令的i18n支持不一致，影响了非英语用户的使用体验。

为了提供一致的多语言用户体验，需要为这些核心命令添加i18n支持，使其能够根据用户的操作系统语言自动显示中文或英文消息。

## What Changes

- **为archive命令添加i18n支持**：将所有用户消息（错误提示、确认对话、进度信息等）国际化
- **为config命令添加i18n支持**：将配置相关的消息和提示国际化  
- **为list命令添加i18n支持**：将列表显示的标题和状态信息国际化
- **为view命令添加i18n支持**：将仪表板显示的标题、标签和状态信息国际化
- **创建对应的翻译文件**：为每个命令创建英文和中文的JSON翻译文件
- **更新i18n配置**：在i18n/index.ts中添加新的命名空间支持

## Impact

- **受影响的规范**: cli-archive, cli-list, cli-view
- **受影响的代码**: 
  - `src/core/archive.ts` - 添加i18n导入和翻译调用
  - `src/core/config.ts` - 添加i18n导入和翻译调用
  - `src/core/list.ts` - 添加i18n导入和翻译调用  
  - `src/core/view.ts` - 添加i18n导入和翻译调用
  - `src/core/i18n/index.ts` - 添加新的命名空间
  - `src/core/i18n/en/` - 创建英文翻译文件
  - `src/core/i18n/zh/` - 创建中文翻译文件

**兼容性**: 无破坏性变更，现有功能保持不变，仅增加多语言支持