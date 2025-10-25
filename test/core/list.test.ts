import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { ListCommand } from '../../src/core/list.js';
import { initI18n } from '../../src/core/i18n/index.js';

describe('列表命令', () => {
  let tempDir: string;
  let originalLog: typeof console.log;
  let logOutput: string[] = [];
  let prevOpenspecLang: string | undefined;
  let prevLang: string | undefined;

  beforeEach(async () => {
    // Create temp directory
    tempDir = path.join(os.tmpdir(), `openspec-list-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Save original environment variables for language control
    prevOpenspecLang = process.env.OPENSPEC_LANG;
    prevLang = process.env.LANG;

    // Force English language for consistent test results
    process.env.OPENSPEC_LANG = 'en';
    process.env.LANG = 'en';

    // Re-initialize i18n with English
    await initI18n('en');

    // Mock console.log to capture output
    originalLog = console.log;
    console.log = (...args: any[]) => {
      logOutput.push(args.join(' '));
    };
    logOutput = [];
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalLog;

    // Restore original language environment variables
    if (prevOpenspecLang === undefined) delete process.env.OPENSPEC_LANG;
    else process.env.OPENSPEC_LANG = prevOpenspecLang;
    
    if (prevLang === undefined) delete process.env.LANG;
    else process.env.LANG = prevLang;

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('执行', () => {
    it('应处理缺失的openspec/changes目录', async () => {
      const listCommand = new ListCommand();
      
      await expect(listCommand.execute(tempDir, 'changes')).rejects.toThrow(
        "No OpenSpec changes directory found. Run 'openspec init' first."
      );
    });

    it('应处理空的变更目录', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(changesDir, { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput).toEqual(['No active changes found.']);
    });

    it('应排除归档目录', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'archive'), { recursive: true });
      await fs.mkdir(path.join(changesDir, 'my-change'), { recursive: true });
      
      // Create tasks.md with some tasks
      await fs.writeFile(
        path.join(changesDir, 'my-change', 'tasks.md'),
        '- [x] Task 1\n- [ ] Task 2\n'
      );

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput).toContain('Changes:');
      expect(logOutput.some(line => line.includes('my-change'))).toBe(true);
      expect(logOutput.some(line => line.includes('archive'))).toBe(false);
    });

    it('应正确计算任务', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'test-change'), { recursive: true });
      
      await fs.writeFile(
        path.join(changesDir, 'test-change', 'tasks.md'),
        `# Tasks
- [x] Completed task 1
- [x] Completed task 2
- [ ] Incomplete task 1
- [ ] Incomplete task 2
- [ ] Incomplete task 3
Regular text that should be ignored
`
      );

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput.some(line => line.includes('2/5 tasks'))).toBe(true);
    });

    it('应为完全完成的变更显示完成状态', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'completed-change'), { recursive: true });
      
      await fs.writeFile(
        path.join(changesDir, 'completed-change', 'tasks.md'),
        '- [x] Task 1\n- [x] Task 2\n- [x] Task 3\n'
      );

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput.some(line => line.includes('✓ Complete'))).toBe(true);
    });

    it('应处理没有tasks.md的变更', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'no-tasks'), { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput.some(line => line.includes('no-tasks') && line.includes('No tasks'))).toBe(true);
    });

    it('应按字母顺序排序变更', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'zebra'), { recursive: true });
      await fs.mkdir(path.join(changesDir, 'alpha'), { recursive: true });
      await fs.mkdir(path.join(changesDir, 'middle'), { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir);

      const changeLines = logOutput.filter(line => 
        line.includes('alpha') || line.includes('middle') || line.includes('zebra')
      );
      
      expect(changeLines[0]).toContain('alpha');
      expect(changeLines[1]).toContain('middle');
      expect(changeLines[2]).toContain('zebra');
    });

    it('应处理多种状态的多个变更', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      
      // Complete change
      await fs.mkdir(path.join(changesDir, 'completed'), { recursive: true });
      await fs.writeFile(
        path.join(changesDir, 'completed', 'tasks.md'),
        '- [x] Task 1\n- [x] Task 2\n'
      );

      // Partial change
      await fs.mkdir(path.join(changesDir, 'partial'), { recursive: true });
      await fs.writeFile(
        path.join(changesDir, 'partial', 'tasks.md'),
        '- [x] Done\n- [ ] Not done\n- [ ] Also not done\n'
      );

      // No tasks
      await fs.mkdir(path.join(changesDir, 'no-tasks'), { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir);

      expect(logOutput).toContain('Changes:');
      expect(logOutput.some(line => line.includes('completed') && line.includes('✓ Complete'))).toBe(true);
      expect(logOutput.some(line => line.includes('partial') && line.includes('1/3 tasks'))).toBe(true);
      expect(logOutput.some(line => line.includes('no-tasks') && line.includes('No tasks'))).toBe(true);
    });
  });
});

describe('支持中文国际化的列表命令', () => {
  let tempDir: string;
  let originalLog: typeof console.log;
  let logOutput: string[] = [];
  let prevOpenspecLang: string | undefined;
  let prevLang: string | undefined;

  beforeEach(async () => {
    // Create temp directory
    tempDir = path.join(os.tmpdir(), `openspec-list-test-zh-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Save original environment variables for language control
    prevOpenspecLang = process.env.OPENSPEC_LANG;
    prevLang = process.env.LANG;

    // Set Chinese language for testing
    process.env.OPENSPEC_LANG = 'zh';
    process.env.LANG = 'zh';

    // Re-initialize i18n with Chinese
    await initI18n('zh');

    // Mock console.log to capture output
    originalLog = console.log;
    console.log = (...args: any[]) => {
      logOutput.push(args.join(' '));
    };
    logOutput = [];
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalLog;

    // Restore original language environment variables
    if (prevOpenspecLang === undefined) delete process.env.OPENSPEC_LANG;
    else process.env.OPENSPEC_LANG = prevOpenspecLang;
    
    if (prevLang === undefined) delete process.env.LANG;
    else process.env.LANG = prevLang;

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('中文本地化内容', () => {
    it('应显示缺失openspec/changes目录的中文错误消息', async () => {
      const listCommand = new ListCommand();
      
      await expect(listCommand.execute(tempDir, 'changes')).rejects.toThrow(
        "未找到 OpenSpec 变更目录。请先运行 'openspec init'。"
      );
    });

    it('应显示空变更目录的中文消息', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(changesDir, { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput).toEqual(['未找到活跃的变更。']);
    });

    it('应显示变更列表的中文标题', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(path.join(changesDir, 'test-change'), { recursive: true });
      
      await fs.writeFile(
        path.join(changesDir, 'test-change', 'tasks.md'),
        '- [x] Task 1\n- [ ] Task 2\n'
      );

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      expect(logOutput).toContain('变更：');
    });

    it('应显示无规范的中文消息', async () => {
      const specsDir = path.join(tempDir, 'openspec', 'specs');
      await fs.mkdir(specsDir, { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'specs');

      expect(logOutput).toEqual(['未找到规范。']);
    });

    it('应显示规范列表的中文标题', async () => {
      const specsDir = path.join(tempDir, 'openspec', 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });
      
      await fs.writeFile(
        path.join(specsDir, 'spec.md'),
        '# Test Spec\n\n## Purpose\nTest purpose\n\n## Requirements\n\n### The system SHALL do something\n\n#### Scenario: Test\nGiven test\nWhen action\nThen result'
      );

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'specs');

      expect(logOutput).toContain('规范：');
    });
  });

  describe('中文环境验证', () => {
    it('应正确初始化中文语言环境', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(changesDir, { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      // Verify Chinese message is displayed
      expect(logOutput.some(call => call.includes('未找到活跃的变更'))).toBe(true);
    });

    it('应优雅地处理混合语言环境', async () => {
      // Test with mixed environment variables
      process.env.LANG = 'en';
      process.env.OPENSPEC_LANG = 'zh';
      
      await initI18n('zh');

      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(changesDir, { recursive: true });

      const listCommand = new ListCommand();
      await listCommand.execute(tempDir, 'changes');

      // Should still display Chinese message due to OPENSPEC_LANG
      expect(logOutput.some(call => call.includes('未找到活跃的变更'))).toBe(true);
    });
  });
});