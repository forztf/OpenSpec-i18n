<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec">
    <picture>
      <source srcset="assets/openspec_pixel_dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="assets/openspec_pixel_light.svg" media="(prefers-color-scheme: light)">
      <img src="assets/openspec_pixel_light.svg" alt="OpenSpec logo" height="64">
    </picture>
  </a>
  
</p>
<p align="center">面向 AI 编程助手的规范驱动开发。</p>
<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a>
</p>
<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@fission-ai/openspec"><img alt="npm version" src="https://img.shields.io/npm/v/@fission-ai/openspec?style=flat-square" /></a>
  <a href="https://nodejs.org/"><img alt="node version" src="https://img.shields.io/node/v/@fission-ai/openspec?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://conventionalcommits.org"><img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?logo=discord&logoColor=white&style=flat-square" /></a>
</p>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec dashboard preview" width="90%">
</p>

<p align="center">
  关注 <a href="https://x.com/0xTab">@0xTab on X</a> 获取更新 · 加入 <a href="https://discord.gg/YctCnvvshC">OpenSpec Discord</a> 获取帮助和提问。
</p>

# OpenSpec

OpenSpec 通过规范驱动开发让人类和 AI 编程助手保持一致，确保在编写任何代码之前就对要构建的内容达成共识。**无需 API 密钥。**

## 为什么选择 OpenSpec？

AI 编程助手功能强大，但当需求存在于聊天历史中时会变得不可预测。OpenSpec 添加了一个轻量级的规范工作流，在实现之前锁定意图，为您提供确定性、可审查的输出。

主要成果：
- 人类和 AI 利益相关者在工作开始前就规范达成一致。
- 结构化的变更文件夹（提案、任务和规范更新）保持范围明确且可审计。
- 对提议、活跃或已归档内容的共享可见性。
- 与您已经使用的 AI 工具配合使用：在支持的地方使用自定义斜杠命令，在其他地方使用上下文规则。

## OpenSpec 对比概览

- **轻量级**：简单的工作流程，无需 API 密钥，最小化设置。
- **棕地优先**：在 0→1 之外表现出色。OpenSpec 将真实来源与提案分离：`openspec/specs/`（当前真实情况）和 `openspec/changes/`（提议的更新）。这使得跨功能的差异保持明确且可管理。
- **变更跟踪**：提案、任务和规范增量共存；归档将批准的更新合并回规范。
- **与 spec-kit 和 Kiro 相比**：这些工具在全新功能（0→1）方面表现出色。OpenSpec 在修改现有行为（1→n）时也表现出色，特别是当更新跨越多个规范时。

查看 [OpenSpec 对比](#openspec-对比) 中的完整对比。

## 工作原理

```
┌────────────────────┐
│ 起草变更           │
│ 提案               │
└────────┬───────────┘
         │ 与您的 AI 分享意图
         ▼
┌────────────────────┐
│ 审查与对齐         │
│ (编辑规范/任务)    │◀──── 反馈循环 ──────┐
└────────┬───────────┘                      │
         │ 批准的计划                       │
         ▼                                  │
┌────────────────────┐                      │
│ 实施任务           │──────────────────────┘
│ (AI 编写代码)      │
└────────┬───────────┘
         │ 发布变更
         ▼
┌────────────────────┐
│ 归档与更新         │
│ 规范 (源)          │
└────────────────────┘

1. 起草一个变更提案，捕获您想要的规范更新。
2. 与您的 AI 助手审查提案，直到每个人都同意。
3. 实施引用已同意规范的任务。
4. 归档变更以将批准的更新合并回真实来源规范。
```

## 开始使用

### 支持的 AI 工具

#### 原生斜杠命令
这些工具具有内置的 OpenSpec 命令。在提示时选择 OpenSpec 集成。

| 工具 | 命令 |
|------|----------|
| **Claude Code** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` |
| **CodeBuddy Code (CLI)** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` (`.codebuddy/commands/`) — 查看 [文档](https://www.codebuddy.ai/cli) |
| **Cursor** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Cline** | `.clinerules/` 目录中的规则 (`.clinerules/openspec-*.md`) |
| **Factory Droid** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.factory/commands/`) |
| **OpenCode** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Kilo Code** | `/openspec-proposal.md`, `/openspec-apply.md`, `/openspec-archive.md` (`.kilocode/workflows/`) |
| **Windsurf** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.windsurf/workflows/`) |
| **Codex** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (全局: `~/.codex/prompts`, 自动安装) |
| **GitHub Copilot** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.github/prompts/`) |
| **Amazon Q Developer** | `@openspec-proposal`, `@openspec-apply`, `@openspec-archive` (`.amazonq/prompts/`) |
| **Auggie (Augment CLI)** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.augment/commands/`) |
| **Trae AI** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.trae/rules/`) |

Kilo Code 自动发现团队工作流。将生成的文件保存在 `.kilocode/workflows/` 下，并通过命令面板使用 `/openspec-proposal.md`、`/openspec-apply.md` 或 `/openspec-archive.md` 触发它们。

#### AGENTS.md 兼容
这些工具自动从 `openspec/AGENTS.md` 读取工作流指令。如果需要提醒，请要求它们遵循 OpenSpec 工作流。了解更多关于 [AGENTS.md 约定](https://agents.md/)。

| 工具 |
|-------|
| Amp • Jules • Gemini CLI • 其他 |

### 语言配置

OpenSpec 会自动检测您的系统语言并以相应的语言显示界面。无需手动配置。

#### 支持的语言
- **英文 (en)** - 默认语言
- **中文 (zh)** - 中文支持

#### 自动语言检测
OpenSpec 会自动检测您操作系统的语言设置，并为以下内容使用相应的语言：
- CLI 输出消息和提示
- 生成的文件模板和内容
- 错误消息和验证反馈

#### 手动覆盖（可选）
如果您需要覆盖自动语言检测，可以设置环境变量：

```bash
# 覆盖为中文（可选）
export OPENSPEC_LANG=zh
# 或
export LANG=zh

# Windows (PowerShell)
$env:OPENSPEC_LANG="zh"
```

**注意：** 手动语言覆盖很少需要，因为 OpenSpec 会自动检测您的系统语言偏好。

### 安装与初始化

#### 先决条件
- **Node.js >= 20.19.0** - 使用 `node --version` 检查您的版本

#### 步骤 1：全局安装 CLI

```bash
npm install -g @fission-ai/openspec@latest
```

验证安装：
```bash
openspec --version
```

#### 步骤 2：在您的项目中初始化 OpenSpec

导航到您的项目目录：
```bash
cd my-project
```

运行初始化：
```bash
openspec init
```

**初始化过程中发生的事情：**
- 系统会提示您选择任何原生支持的 AI 工具（Claude Code、CodeBuddy、Cursor、OpenCode 等）；其他助手始终依赖共享的 `AGENTS.md` 存根
- OpenSpec 自动为您选择的工具配置斜杠命令，并始终在项目根目录写入托管的 `AGENTS.md` 交接文件
- 在您的项目中创建新的 `openspec/` 目录结构
- 从环境变量（`OPENSPEC_LANG` 或 `LANG`）检测语言设置，或您可以在设置期间指定

**设置后：**
- 主要 AI 工具可以触发 `/openspec` 工作流，无需额外配置
- 运行 `openspec list` 验证设置并查看任何活动变更
- 如果您的编码助手没有立即显示新的斜杠命令，请重启它。斜杠命令在启动时加载，因此重新启动确保它们出现

## 许可证

MIT