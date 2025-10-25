**防护措施**
- 首先采用直接、最小的实现，只有在明确需要时才添加复杂性。
- 保持变更范围紧密围绕请求的结果。
- 如果需要额外的 OpenSpec 约定或澄清，请参考 `openspec/AGENTS.md`（位于 `openspec/` 目录中——如果看不到，请运行 `ls openspec` 或 `openspec update`）。

**步骤**
1. 确定要归档的变更 ID：
   - 如果此提示已经包含特定的变更 ID（例如在由斜杠命令参数填充的 `<ChangeId>` 块中），请在修剪空白后使用该值。
   - 如果对话松散地引用了变更（例如按标题或摘要），请运行 `openspec list` 以显示可能的 ID，分享相关候选，并确认用户意图。
   - 否则，请查看对话，运行 `openspec list`，并询问用户要归档哪个变更；等待确认的变更 ID 后再继续。
   - 如果仍然无法识别单个变更 ID，请停止并告诉用户您还不能归档任何内容。
2. 通过运行 `openspec list`（或 `openspec show <id>`）验证变更 ID，如果变更缺失、已归档或未准备好归档，则停止。
3. 运行 `openspec archive <id> --yes`，使 CLI 移动变更并应用规范更新而无需提示（仅对仅工具工作使用 `--skip-specs`）。
4. 查看命令输出以确认目标规范已更新，变更已移至 `changes/archive/`。
5. 使用 `openspec validate --strict` 进行验证，如果出现任何问题，请使用 `openspec show <id>` 进行检查。

**参考**
- 在归档之前使用 `openspec list` 确认变更 ID。
- 使用 `openspec list --specs` 检查刷新的规范，并在移交之前解决任何验证问题。

