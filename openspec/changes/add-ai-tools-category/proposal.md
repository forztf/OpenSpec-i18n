# 为 AI_TOOLS 数组添加 category 字段

## Why

当前的 AI_TOOLS 数组中所有工具都混合在一起显示，用户无法区分哪些工具有原生支持（专门的配置器），哪些工具使用通用的 AGENTS.md 配置。这导致用户体验不清晰，不知道选择不同工具会得到什么样的支持程度。

需要通过添加 category 字段来区分：
- **原生支持的工具** (native)：有专门配置器的工具，如 Claude、Cursor、Cline 等
- **其他工具** (other)：使用通用 AGENTS.md 的工具，如 Trae IDE、GitHub Copilot 等

## What Changes

- 在 `AIToolOption` 接口中添加 `category: 'native' | 'other'` 字段
- 更新 `AI_TOOLS` 数组，为每个工具设置适当的 category 值
- 将 Trae IDE 的 category 设置为 'other'
- 将 'AGENTS.md (works with Amp, VS Code, …)' 的 category 设置为 'other'，available 设置为 true
- 其他现有工具的 category 设置为 'native'
- 更新 UI 逻辑以支持按 category 分组显示工具

## Impact

- affected specs: `cli-init` (初始化命令的工具选择界面需要支持分组显示), `cli-update` (为保持整体一致性需要考虑，虽然不直接使用 AI_TOOLS 数组)
- affected code:
  - `src/core/config.ts` (AIToolOption 接口和 AI_TOOLS 数组)
  - `src/core/init.ts` (工具选择 UI 逻辑)
  - `src/core/update.ts` (间接影响，需要确保与新的分类体系保持一致)
  - 相关测试文件
- 向后兼容：不影响现有功能，只是改进显示方式
- 用户体验：用户可以更清楚地了解不同工具的支持程度