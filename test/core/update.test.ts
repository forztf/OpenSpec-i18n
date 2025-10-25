import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UpdateCommand } from '../../src/core/update.js';
import { FileSystemUtils } from '../../src/utils/file-system.js';
import { ToolRegistry } from '../../src/core/configurators/registry.js';
import { initI18n } from '../../src/core/i18n/index.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { randomUUID } from 'crypto';

describe('更新命令', () => {
  let testDir: string;
  let updateCommand: UpdateCommand;
  let prevCodexHome: string | undefined;
  let prevOpenspecLang: string | undefined;
  let prevLang: string | undefined;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `openspec-test-${randomUUID()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create openspec directory
    const openspecDir = path.join(testDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });

    updateCommand = new UpdateCommand();

    // Route Codex global directory into the test sandbox
    prevCodexHome = process.env.CODEX_HOME;
    process.env.CODEX_HOME = path.join(testDir, '.codex');

    // Save original environment variables for language control
    prevOpenspecLang = process.env.OPENSPEC_LANG;
    prevLang = process.env.LANG;

    // Force English language for consistent test results
    process.env.OPENSPEC_LANG = 'en';
    process.env.LANG = 'en';

    // Re-initialize i18n with English
    await initI18n('en');
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
    
    // Restore Codex environment
    if (prevCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = prevCodexHome;

    // Restore original language environment variables
    if (prevOpenspecLang === undefined) delete process.env.OPENSPEC_LANG;
    else process.env.OPENSPEC_LANG = prevOpenspecLang;
    
    if (prevLang === undefined) delete process.env.LANG;
    else process.env.LANG = prevLang;
  });

  it('应仅更新现有的CLAUDE.md文件', async () => {
    // Create CLAUDE.md file with initial content
    const claudePath = path.join(testDir, 'CLAUDE.md');
    const initialContent = `# Project Instructions

Some existing content here.

<!-- OPENSPEC:START -->
Old OpenSpec content
<!-- OPENSPEC:END -->

More content after.`;
    await fs.writeFile(claudePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLAUDE.md was updated
    const updatedContent = await fs.readFile(claudePath, 'utf-8');
    expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
    expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
    expect(updatedContent).toContain("@/openspec/AGENTS.md");
    expect(updatedContent).toContain('openspec update');
    expect(updatedContent).toContain('Some existing content here');
    expect(updatedContent).toContain('More content after');

    // Check console output
    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain('Updated AI tool files: CLAUDE.md');
    consoleSpy.mockRestore();
  });

  it('应刷新现有的Claude斜杠命令文件', async () => {
    const proposalPath = path.join(
      testDir,
      '.claude/commands/openspec/proposal.md'
    );
    await fs.mkdir(path.dirname(proposalPath), { recursive: true });
    const initialContent = `---
name: OpenSpec: Proposal
description: Old description
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
Old slash content
<!-- OPENSPEC:END -->`;
    await fs.writeFile(proposalPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(proposalPath, 'utf-8');
    expect(updated).toContain('name: OpenSpec: Proposal');
    expect(updated).toContain('**Guardrails**');
    expect(updated).toContain(
      'Validate with `openspec validate <id> --strict`'
    );
    expect(updated).not.toContain('Old slash content');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .claude/commands/openspec/proposal.md'
    );

    consoleSpy.mockRestore();
  });

  it('如果CLAUDE.md不存在则不应创建', async () => {
    // Ensure CLAUDE.md does not exist
    const claudePath = path.join(testDir, 'CLAUDE.md');

    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLAUDE.md was not created
    const fileExists = await FileSystemUtils.fileExists(claudePath);
    expect(fileExists).toBe(false);
  });

  it('应仅更新现有的CLINE.md文件', async () => {
    // Create CLINE.md file with initial content
    const clinePath = path.join(testDir, 'CLINE.md');
    const initialContent = `# Cline Rules

Some existing Cline rules here.

<!-- OPENSPEC:START -->
Old OpenSpec content
<!-- OPENSPEC:END -->

More rules after.`;
    await fs.writeFile(clinePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLINE.md was updated
    const updatedContent = await fs.readFile(clinePath, 'utf-8');
    expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
    expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
    expect(updatedContent).toContain("@/openspec/AGENTS.md");
    expect(updatedContent).toContain('openspec update');
    expect(updatedContent).toContain('Some existing Cline rules here');
    expect(updatedContent).toContain('More rules after');

    // Check console output
    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain('Updated AI tool files: CLINE.md');
    consoleSpy.mockRestore();
  });

  it('如果CLINE.md不存在则不应创建', async () => {
    // Ensure CLINE.md does not exist
    const clinePath = path.join(testDir, 'CLINE.md');

    // Execute update command
    await updateCommand.execute(testDir);

    // Check that CLINE.md was not created
    const fileExists = await FileSystemUtils.fileExists(clinePath);
    expect(fileExists).toBe(false);
  });

  it('应刷新现有的Cline规则文件', async () => {
    const proposalPath = path.join(
      testDir,
      '.clinerules/openspec-proposal.md'
    );
    await fs.mkdir(path.dirname(proposalPath), { recursive: true });
    const initialContent = `# OpenSpec: Proposal

Scaffold a new OpenSpec change and validate strictly.

<!-- OPENSPEC:START -->
Old slash content
<!-- OPENSPEC:END -->`;
    await fs.writeFile(proposalPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(proposalPath, 'utf-8');
    expect(updated).toContain('# OpenSpec: Proposal');
    expect(updated).toContain('**Guardrails**');
    expect(updated).toContain(
      'Validate with `openspec validate <id> --strict`'
    );
    expect(updated).not.toContain('Old slash content');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .clinerules/openspec-proposal.md'
    );

    consoleSpy.mockRestore();
  });

  it('应刷新现有的Cursor斜杠命令文件', async () => {
    const cursorPath = path.join(testDir, '.cursor/commands/openspec-apply.md');
    await fs.mkdir(path.dirname(cursorPath), { recursive: true });
    const initialContent = `---
name: /openspec-apply
id: openspec-apply
category: OpenSpec
description: Old description
---
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(cursorPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(cursorPath, 'utf-8');
    expect(updated).toContain('id: openspec-apply');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .cursor/commands/openspec-apply.md'
    );

    consoleSpy.mockRestore();
  });

  it('应刷新现有的OpenCode斜杠命令文件', async () => {
    const openCodePath = path.join(
      testDir,
      '.opencode/command/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(openCodePath), { recursive: true });
    const initialContent = `---
name: /openspec-apply
id: openspec-apply
category: OpenSpec
description: Old description
---
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(openCodePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(openCodePath, 'utf-8');
    expect(updated).toContain('id: openspec-apply');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .opencode/command/openspec-apply.md'
    );

    consoleSpy.mockRestore();
  });

  it('应刷新现有的Kilo Code工作流', async () => {
    const kilocodePath = path.join(
      testDir,
      '.kilocode/workflows/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(kilocodePath), { recursive: true });
    const initialContent = `<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(kilocodePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(kilocodePath, 'utf-8');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');
    expect(updated.startsWith('<!-- OPENSPEC:START -->')).toBe(true);

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated slash commands: .kilocode/workflows/openspec-apply.md'
    );

    consoleSpy.mockRestore();
  });

  it('应刷新现有的Windsurf工作流', async () => {
    const wsPath = path.join(
      testDir,
      '.windsurf/workflows/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(wsPath), { recursive: true });
    const initialContent = `## OpenSpec: Apply (Windsurf)
Intro
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(wsPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(wsPath, 'utf-8');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');
    expect(updated).toContain('## OpenSpec: Apply (Windsurf)');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated slash commands: .windsurf/workflows/openspec-apply.md'
    );
    consoleSpy.mockRestore();
  });

  it('应刷新现有的Codex提示', async () => {
    const codexPath = path.join(
      testDir,
      '.codex/prompts/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(codexPath), { recursive: true });
    const initialContent = `---\ndescription: Old description\nargument-hint: old-hint\n---\n\n$ARGUMENTS\n<!-- OPENSPEC:START -->\nOld body\n<!-- OPENSPEC:END -->`;
    await fs.writeFile(codexPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(codexPath, 'utf-8');
    expect(updated).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
    expect(updated).toContain('argument-hint: change-id');
    expect(updated).toContain('$ARGUMENTS');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');
    expect(updated).not.toContain('Old description');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated slash commands: .codex/prompts/openspec-apply.md'
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的Codex提示', async () => {
    const codexApply = path.join(
      testDir,
      '.codex/prompts/openspec-apply.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(codexApply), { recursive: true });
    await fs.writeFile(
      codexApply,
      '---\ndescription: Old\nargument-hint: old\n---\n\n$ARGUMENTS\n<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    await updateCommand.execute(testDir);

    const codexProposal = path.join(
      testDir,
      '.codex/prompts/openspec-proposal.md'
    );
    const codexArchive = path.join(
      testDir,
      '.codex/prompts/openspec-archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(codexProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(codexArchive)).resolves.toBe(false);
  });

  it('应刷新现有的GitHub Copilot提示', async () => {
    const ghPath = path.join(
      testDir,
      '.github/prompts/openspec-apply.prompt.md'
    );
    await fs.mkdir(path.dirname(ghPath), { recursive: true });
    const initialContent = `---
description: Implement an approved OpenSpec change and keep tasks in sync.
---

$ARGUMENTS
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(ghPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(ghPath, 'utf-8');
    expect(updated).toContain('description: Implement an approved OpenSpec change and keep tasks in sync.');
    expect(updated).toContain('$ARGUMENTS');
    expect(updated).toContain('Work through tasks sequentially');
    expect(updated).not.toContain('Old body');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated slash commands: .github/prompts/openspec-apply.prompt.md'
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的GitHub Copilot提示', async () => {
    const ghApply = path.join(
      testDir,
      '.github/prompts/openspec-apply.prompt.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(ghApply), { recursive: true });
    await fs.writeFile(
      ghApply,
      '---\ndescription: Old\n---\n\n$ARGUMENTS\n<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    await updateCommand.execute(testDir);

    const ghProposal = path.join(
      testDir,
      '.github/prompts/openspec-proposal.prompt.md'
    );
    const ghArchive = path.join(
      testDir,
      '.github/prompts/openspec-archive.prompt.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(ghProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(ghArchive)).resolves.toBe(false);
  });

  it('应刷新现有的Factory斜杠命令', async () => {
    const factoryPath = path.join(
      testDir,
      '.factory/commands/openspec-proposal.md'
    );
    await fs.mkdir(path.dirname(factoryPath), { recursive: true });
    const initialContent = `---
description: Scaffold a new OpenSpec change and validate strictly.
argument-hint: request or feature description
---

<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(factoryPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(factoryPath, 'utf-8');
    expect(updated).toContain('description: Scaffold a new OpenSpec change and validate strictly.');
    expect(updated).toContain('argument-hint: request or feature description');
    expect(
      /<!-- OPENSPEC:START -->([\s\S]*?)<!-- OPENSPEC:END -->/u.exec(updated)?.[1]
    ).toContain('$ARGUMENTS');
    expect(updated).toContain('**Guardrails**');
    expect(updated).not.toContain('Old body');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('.factory/commands/openspec-proposal.md')
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的Factory斜杠命令文件', async () => {
    const factoryApply = path.join(
      testDir,
      '.factory/commands/openspec-apply.md'
    );

    await fs.mkdir(path.dirname(factoryApply), { recursive: true });
    await fs.writeFile(
      factoryApply,
      `---
description: Old
argument-hint: old
---

<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`
    );

    await updateCommand.execute(testDir);

    const factoryProposal = path.join(
      testDir,
      '.factory/commands/openspec-proposal.md'
    );
    const factoryArchive = path.join(
      testDir,
      '.factory/commands/openspec-archive.md'
    );

    await expect(FileSystemUtils.fileExists(factoryProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(factoryArchive)).resolves.toBe(false);
  });

  it('应刷新现有的Amazon Q Developer提示', async () => {
    const aqPath = path.join(
      testDir,
      '.amazonq/prompts/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(aqPath), { recursive: true });
    const initialContent = `---
description: Implement an approved OpenSpec change and keep tasks in sync.
---

The user wants to apply the following change. Use the openspec instructions to implement the approved change.

<ChangeId>
  $ARGUMENTS
</ChangeId>
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(aqPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updatedContent = await fs.readFile(aqPath, 'utf-8');
    expect(updatedContent).toContain('**Guardrails**');
    expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
    expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
    expect(updatedContent).not.toContain('Old body');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('.amazonq/prompts/openspec-apply.md')
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的Amazon Q Developer提示', async () => {
    const aqApply = path.join(
      testDir,
      '.amazonq/prompts/openspec-apply.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(aqApply), { recursive: true });
    await fs.writeFile(
      aqApply,
      '---\ndescription: Old\n---\n\nThe user wants to apply the following change.\n\n<ChangeId>\n  $ARGUMENTS\n</ChangeId>\n<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    await updateCommand.execute(testDir);

    const aqProposal = path.join(
      testDir,
      '.amazonq/prompts/openspec-proposal.md'
    );
    const aqArchive = path.join(
      testDir,
      '.amazonq/prompts/openspec-archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(aqProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(aqArchive)).resolves.toBe(false);
  });

  it('应刷新现有的Auggie斜杠命令文件', async () => {
    const auggiePath = path.join(
      testDir,
      '.augment/commands/openspec-apply.md'
    );
    await fs.mkdir(path.dirname(auggiePath), { recursive: true });
    const initialContent = `---
description: Implement an approved OpenSpec change and keep tasks in sync.
argument-hint: change-id
---
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`;
    await fs.writeFile(auggiePath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updatedContent = await fs.readFile(auggiePath, 'utf-8');
    expect(updatedContent).toContain('**Guardrails**');
    expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
    expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
    expect(updatedContent).not.toContain('Old body');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('.augment/commands/openspec-apply.md')
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的Auggie斜杠命令文件', async () => {
    const auggieApply = path.join(
      testDir,
      '.augment/commands/openspec-apply.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(auggieApply), { recursive: true });
    await fs.writeFile(
      auggieApply,
      '---\ndescription: Old\nargument-hint: old\n---\n<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    await updateCommand.execute(testDir);

    const auggieProposal = path.join(
      testDir,
      '.augment/commands/openspec-proposal.md'
    );
    const auggieArchive = path.join(
      testDir,
      '.augment/commands/openspec-archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(auggieProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(auggieArchive)).resolves.toBe(false);
  });

  it('应刷新现有的CodeBuddy斜杠命令文件', async () => {
    const codeBuddyPath = path.join(
      testDir,
      '.codebuddy/commands/openspec/proposal.md'
    );
    await fs.mkdir(path.dirname(codeBuddyPath), { recursive: true });
    const initialContent = `---
name: OpenSpec: Proposal
description: Old description
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
Old slash content
<!-- OPENSPEC:END -->`;
    await fs.writeFile(codeBuddyPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(codeBuddyPath, 'utf-8');
    expect(updated).toContain('name: OpenSpec: Proposal');
    expect(updated).toContain('**Guardrails**');
    expect(updated).toContain(
      'Validate with `openspec validate <id> --strict`'
    );
    expect(updated).not.toContain('Old slash content');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .codebuddy/commands/openspec/proposal.md'
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的CodeBuddy斜杠命令文件', async () => {
    const codeBuddyApply = path.join(
      testDir,
      '.codebuddy/commands/openspec/apply.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(codeBuddyApply), { recursive: true });
    await fs.writeFile(
      codeBuddyApply,
      `---
name: OpenSpec: Apply
description: Old description
category: OpenSpec
tags: [openspec, apply]
---
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`
    );

    await updateCommand.execute(testDir);

    const codeBuddyProposal = path.join(
      testDir,
      '.codebuddy/commands/openspec/proposal.md'
    );
    const codeBuddyArchive = path.join(
      testDir,
      '.codebuddy/commands/openspec/archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(codeBuddyProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(codeBuddyArchive)).resolves.toBe(false);
  });

  it('应刷新现有的Crush斜杠命令文件', async () => {
    const crushPath = path.join(
      testDir,
      '.crush/commands/openspec/proposal.md'
    );
    await fs.mkdir(path.dirname(crushPath), { recursive: true });
    const initialContent = `---
name: OpenSpec: Proposal
description: Old description
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
Old slash content
<!-- OPENSPEC:END -->`;
    await fs.writeFile(crushPath, initialContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(crushPath, 'utf-8');
    expect(updated).toContain('name: OpenSpec: Proposal');
    expect(updated).toContain('**Guardrails**');
    expect(updated).toContain(
      'Validate with `openspec validate <id> --strict`'
    );
    expect(updated).not.toContain('Old slash content');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain(
      'Updated slash commands: .crush/commands/openspec/proposal.md'
    );

    consoleSpy.mockRestore();
  });

  it('更新时不应创建缺失的Crush斜杠命令文件', async () => {
    const crushApply = path.join(
      testDir,
      '.crush/commands/openspec-apply.md'
    );

    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(crushApply), { recursive: true });
    await fs.writeFile(
      crushApply,
      `---
name: OpenSpec: Apply
description: Old description
category: OpenSpec
tags: [openspec, apply]
---
<!-- OPENSPEC:START -->
Old body
<!-- OPENSPEC:END -->`
    );

    await updateCommand.execute(testDir);

    const crushProposal = path.join(
      testDir,
      '.crush/commands/openspec-proposal.md'
    );
    const crushArchive = path.join(
      testDir,
      '.crush/commands/openspec-archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(crushProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(crushArchive)).resolves.toBe(false);
  });

  it('更新时应保留标记外的Windsurf内容', async () => {
    const wsPath = path.join(
      testDir,
      '.windsurf/workflows/openspec-proposal.md'
    );
    await fs.mkdir(path.dirname(wsPath), { recursive: true });
    const initialContent = `## Custom Intro Title\nSome intro text\n<!-- OPENSPEC:START -->\nOld body\n<!-- OPENSPEC:END -->\n\nFooter stays`;
    await fs.writeFile(wsPath, initialContent);

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(wsPath, 'utf-8');
    expect(updated).toContain('## Custom Intro Title');
    expect(updated).toContain('Footer stays');
    expect(updated).not.toContain('Old body');
    expect(updated).toContain('Validate with `openspec validate <id> --strict`');
  });

  it('更新时不应创建缺失的Windsurf工作流', async () => {
    const wsApply = path.join(
      testDir,
      '.windsurf/workflows/openspec-apply.md'
    );
    // Only create apply; leave proposal and archive missing
    await fs.mkdir(path.dirname(wsApply), { recursive: true });
    await fs.writeFile(
      wsApply,
      '<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    await updateCommand.execute(testDir);

    const wsProposal = path.join(
      testDir,
      '.windsurf/workflows/openspec-proposal.md'
    );
    const wsArchive = path.join(
      testDir,
      '.windsurf/workflows/openspec-archive.md'
    );

    // Confirm they weren't created by update
    await expect(FileSystemUtils.fileExists(wsProposal)).resolves.toBe(false);
    await expect(FileSystemUtils.fileExists(wsArchive)).resolves.toBe(false);
  });

  it('应处理无AI工具文件的情况', async () => {
    // Execute update command with no AI tool files
    const consoleSpy = vi.spyOn(console, 'log');
    await updateCommand.execute(testDir);

    // Should only update OpenSpec instructions
    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    consoleSpy.mockRestore();
  });

  it('如果存在应更新多个AI工具文件', async () => {
    // TODO: When additional configurators are added (Cursor, Aider, etc.),
    // enhance this test to create multiple AI tool files and verify
    // that all existing files are updated in a single operation.
    // For now, we test with just CLAUDE.md.
    const claudePath = path.join(testDir, 'CLAUDE.md');
    await fs.mkdir(path.dirname(claudePath), { recursive: true });
    await fs.writeFile(
      claudePath,
      '<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );

    const consoleSpy = vi.spyOn(console, 'log');
    await updateCommand.execute(testDir);

    // Should report updating with new format
    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain('Updated AI tool files: CLAUDE.md');
    consoleSpy.mockRestore();
  });

  it('更新时应跳过创建缺失的斜杠命令', async () => {
    const proposalPath = path.join(
      testDir,
      '.claude/commands/openspec/proposal.md'
    );
    await fs.mkdir(path.dirname(proposalPath), { recursive: true });
    await fs.writeFile(
      proposalPath,
      `---
name: OpenSpec: Proposal
description: Existing file
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
Old content
<!-- OPENSPEC:END -->`
    );

    await updateCommand.execute(testDir);

    const applyExists = await FileSystemUtils.fileExists(
      path.join(testDir, '.claude/commands/openspec/apply.md')
    );
    const archiveExists = await FileSystemUtils.fileExists(
      path.join(testDir, '.claude/commands/openspec/archive.md')
    );

    expect(applyExists).toBe(false);
    expect(archiveExists).toBe(false);
  });

  it('不应创建新的AI工具文件', async () => {
    // Get all configurators
    const configurators = ToolRegistry.getAll();

    // Execute update command
    await updateCommand.execute(testDir);

    // Check that no new AI tool files were created
    for (const configurator of configurators) {
      const configPath = path.join(testDir, configurator.configFileName);
      const fileExists = await FileSystemUtils.fileExists(configPath);
      if (configurator.configFileName === 'AGENTS.md') {
        expect(fileExists).toBe(true);
      } else {
        expect(fileExists).toBe(false);
      }
    }
  });

  it('应更新openspec目录中的AGENTS.md', async () => {
    // Execute update command
    await updateCommand.execute(testDir);

    // Check that AGENTS.md was created/updated
    const agentsPath = path.join(testDir, 'openspec', 'AGENTS.md');
    const fileExists = await FileSystemUtils.fileExists(agentsPath);
    expect(fileExists).toBe(true);

    const content = await fs.readFile(agentsPath, 'utf-8');
    expect(content).toContain('# OpenSpec Instructions');
  });

  it('缺失时应创建带管理块的根AGENTS.md', async () => {
    await updateCommand.execute(testDir);

    const rootAgentsPath = path.join(testDir, 'AGENTS.md');
    const exists = await FileSystemUtils.fileExists(rootAgentsPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(rootAgentsPath, 'utf-8');
    expect(content).toContain('<!-- OPENSPEC:START -->');
    expect(content).toContain("@/openspec/AGENTS.md");
    expect(content).toContain('openspec update');
    expect(content).toContain('<!-- OPENSPEC:END -->');
  });

  it('应刷新根AGENTS.md并保留周围内容', async () => {
    const rootAgentsPath = path.join(testDir, 'AGENTS.md');
    const original = `# Custom intro\n\n<!-- OPENSPEC:START -->\nOld content\n<!-- OPENSPEC:END -->\n\n# Footnotes`;
    await fs.writeFile(rootAgentsPath, original);

    const consoleSpy = vi.spyOn(console, 'log');

    await updateCommand.execute(testDir);

    const updated = await fs.readFile(rootAgentsPath, 'utf-8');
    expect(updated).toContain('# Custom intro');
    expect(updated).toContain('# Footnotes');
    expect(updated).toContain("@/openspec/AGENTS.md");
    expect(updated).toContain('openspec update');
    expect(updated).not.toContain('Old content');

    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md, AGENTS.md)'
    );
    expect(logMessage).not.toContain('AGENTS.md (created)');

    consoleSpy.mockRestore();
  });

  it('如果openspec目录不存在应抛出错误', async () => {
    // Remove openspec directory
    await fs.rm(path.join(testDir, 'openspec'), {
      recursive: true,
      force: true,
    });

    // Execute update command and expect error
    await expect(updateCommand.execute(testDir)).rejects.toThrow(
      "No OpenSpec directory found. Run 'openspec init' first."
    );
  });

  it('应优雅地处理配置器错误', async () => {
    // Create CLAUDE.md file but make it read-only to cause an error
    const claudePath = path.join(testDir, 'CLAUDE.md');
    await fs.writeFile(
      claudePath,
      '<!-- OPENSPEC:START -->\nOld\n<!-- OPENSPEC:END -->'
    );
    await fs.chmod(claudePath, 0o444); // Read-only

    const consoleSpy = vi.spyOn(console, 'log');
    const errorSpy = vi.spyOn(console, 'error');
    const originalWriteFile = FileSystemUtils.writeFile.bind(FileSystemUtils);
    const writeSpy = vi
      .spyOn(FileSystemUtils, 'writeFile')
      .mockImplementation(async (filePath, content) => {
        if (filePath.endsWith('CLAUDE.md')) {
          throw new Error('EACCES: permission denied, open');
        }

        return originalWriteFile(filePath, content);
      });

    // Execute update command - should not throw
    await updateCommand.execute(testDir);

    // Should report the failure
    expect(errorSpy).toHaveBeenCalled();
    const [logMessage] = consoleSpy.mock.calls[0];
    expect(logMessage).toContain(
      'Updated OpenSpec instructions (openspec/AGENTS.md'
    );
    expect(logMessage).toContain('AGENTS.md (created)');
    expect(logMessage).toContain('Failed to update: CLAUDE.md');

    // Restore permissions for cleanup
    await fs.chmod(claudePath, 0o644);
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    writeSpy.mockRestore();
  });
});

describe('支持中文国际化的更新命令', () => {
  let testDir: string;
  let updateCommand: UpdateCommand;
  let prevCodexHome: string | undefined;
  let prevOpenspecLang: string | undefined;
  let prevLang: string | undefined;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `openspec-test-${randomUUID()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create openspec directory
    const openspecDir = path.join(testDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });

    updateCommand = new UpdateCommand();

    // Route Codex global directory into the test sandbox
    prevCodexHome = process.env.CODEX_HOME;
    process.env.CODEX_HOME = path.join(testDir, '.codex');

    // Save original environment variables for language control
    prevOpenspecLang = process.env.OPENSPEC_LANG;
    prevLang = process.env.LANG;

    // Force Chinese language for consistent test results
    process.env.OPENSPEC_LANG = 'zh';
    process.env.LANG = 'zh';

    // Re-initialize i18n with Chinese
    await initI18n('zh');
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
    
    // Restore Codex environment
    if (prevCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = prevCodexHome;

    // Restore original language environment variables
    if (prevOpenspecLang === undefined) delete process.env.OPENSPEC_LANG;
    else process.env.OPENSPEC_LANG = prevOpenspecLang;
    
    if (prevLang === undefined) delete process.env.LANG;
    else process.env.LANG = prevLang;
  });

  describe('中文本地化内容', () => {
    it('应创建包含中文内容的AGENTS.md', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Check that AGENTS.md was created with Chinese content
      const agentsPath = path.join(testDir, 'openspec', 'AGENTS.md');
      const fileExists = await FileSystemUtils.fileExists(agentsPath);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(agentsPath, 'utf-8');
      expect(content).toContain('OpenSpec 指令');
      expect(content).toContain('变更');
      expect(content).toContain('规范');
      expect(content).toContain('提案');

      consoleSpy.mockRestore();
    });

    it('应使用中文内容更新现有的CLAUDE.md', async () => {
      // Create CLAUDE.md file with initial content
      const claudePath = path.join(testDir, 'CLAUDE.md');
      const initialContent = `# Project Instructions

Some existing content here.

<!-- OPENSPEC:START -->
Old OpenSpec content
<!-- OPENSPEC:END -->

More content after.`;
      await fs.writeFile(claudePath, initialContent);

      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Check that CLAUDE.md was updated with Chinese content
      const updatedContent = await fs.readFile(claudePath, 'utf-8');
      expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
      expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
      expect(updatedContent).toContain("@/openspec/AGENTS.md");
      expect(updatedContent).toContain('openspec update');
      expect(updatedContent).toContain('Some existing content here');
      expect(updatedContent).toContain('More content after');

      consoleSpy.mockRestore();
    });

    it('应使用中文内容更新现有的CLINE.md', async () => {
      // Create CLINE.md file with initial content
      const clinePath = path.join(testDir, 'CLINE.md');
      const initialContent = `# Cline Rules

Some existing Cline rules here.

<!-- OPENSPEC:START -->
Old OpenSpec content
<!-- OPENSPEC:END -->

More rules after.`;
      await fs.writeFile(clinePath, initialContent);

      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Check that CLINE.md was updated with Chinese content
      const updatedContent = await fs.readFile(clinePath, 'utf-8');
      expect(updatedContent).toContain('<!-- OPENSPEC:START -->');
      expect(updatedContent).toContain('<!-- OPENSPEC:END -->');
      expect(updatedContent).toContain("@/openspec/AGENTS.md");
      expect(updatedContent).toContain('openspec update');
      expect(updatedContent).toContain('Some existing Cline rules here');
      expect(updatedContent).toContain('More rules after');

      consoleSpy.mockRestore();
    });

    it('应显示中文成功消息', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Check console output for Chinese messages
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('已更新 OpenSpec 指令'))).toBe(true);

      consoleSpy.mockRestore();
    });

    it('应处理缺失目录的中文错误消息', async () => {
      // Remove openspec directory
      await fs.rm(path.join(testDir, 'openspec'), {
        recursive: true,
        force: true,
      });

      // Execute update command and expect Chinese error
      await expect(updateCommand.execute(testDir)).rejects.toThrow(
        "未找到 OpenSpec 目录。请先运行 'openspec init'。"
      );
    });

    it('应创建包含中文内容的根AGENTS.md存根', async () => {
      await updateCommand.execute(testDir);

      const rootAgentsPath = path.join(testDir, 'AGENTS.md');
      const exists = await FileSystemUtils.fileExists(rootAgentsPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(rootAgentsPath, 'utf-8');
      expect(content).toContain('<!-- OPENSPEC:START -->');
      expect(content).toContain("@/openspec/AGENTS.md");
      expect(content).toContain('openspec update');
      expect(content).toContain('<!-- OPENSPEC:END -->');
    });

    it('应使用中文标记更新现有文件', async () => {
      const rootAgentsPath = path.join(testDir, 'AGENTS.md');
      const original = `# Custom intro\n\n<!-- OPENSPEC:START -->\nOld content\n<!-- OPENSPEC:END -->\n\n# Footnotes`;
      await fs.writeFile(rootAgentsPath, original);

      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      const updated = await fs.readFile(rootAgentsPath, 'utf-8');
      expect(updated).toContain('# Custom intro');
      expect(updated).toContain('# Footnotes');
      expect(updated).toContain("@/openspec/AGENTS.md");
      expect(updated).toContain('openspec update');
      expect(updated).not.toContain('Old content');

      // Check for Chinese success message
        const calls = consoleSpy.mock.calls.map(call => call[0]);
        expect(calls.some(call => call.includes('已更新 OpenSpec 指令'))).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('中文环境验证', () => {
    it('应正确初始化中文语言环境', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Verify that Chinese messages are displayed
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('已更新 OpenSpec 指令'))).toBe(true);

      consoleSpy.mockRestore();
    });

    it('应优雅地处理混合语言环境', async () => {
      // Set mixed environment
      process.env.LANG = 'en';
      process.env.OPENSPEC_LANG = 'zh';

      const consoleSpy = vi.spyOn(console, 'log');

      await updateCommand.execute(testDir);

      // Should still use Chinese based on OPENSPEC_LANG
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('已更新 OpenSpec 指令'))).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
