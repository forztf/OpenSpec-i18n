# 实现任务

## 1. 核心数据结构修改
- [ ] 1.1 在 `src/core/config.ts` 中的 `AIToolOption` 接口添加 `category: 'native' | 'other'` 字段
- [ ] 1.2 更新 `AI_TOOLS` 数组，为所有现有工具添加 category 字段
- [ ] 1.3 将 Trae IDE 的 category 设置为 'other'
- [ ] 1.4 将 'AGENTS.md (works with Amp, VS Code, …)' 的 category 设置为 'other'，available 设置为 true
- [ ] 1.5 将其他工具（Claude、Cursor、Cline 等）的 category 设置为 'native'

## 2. UI 逻辑更新
- [ ] 2.1 在 `src/core/init.ts` 中更新工具选择逻辑以支持按 category 分组
- [ ] 2.2 实现分组显示：先显示 'native' 工具，再显示 'other' 工具
- [ ] 2.3 为 'other' 类别添加说明文字："其他工具（使用通用 AGENTS.md 适用于 Amp、VS Code、GitHub Copilot 等）"
- [ ] 2.4 确保分组后的选择逻辑正常工作

## 3. 测试和验证
- [ ] 3.1 更新相关的单元测试以适应新的数据结构
- [ ] 3.2 测试工具选择界面的分组显示功能
- [ ] 3.3 验证 Trae IDE 和 AGENTS.md 工具在 'other' 分组中正确显示
- [ ] 3.4 运行现有测试确保无回归
- [ ] 3.5 手动测试 `openspec init` 命令的工具选择体验