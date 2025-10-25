import { afterAll, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { runCLI, cliProjectRoot } from '../helpers/run-cli.js';
import { AI_TOOLS } from '../../src/core/config.js';
import { initI18n } from '../../src/core/i18n/index.js';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const tempRoots: string[] = [];

async function prepareFixture(fixtureName: string): Promise<string> {
  const base = await fs.mkdtemp(path.join(tmpdir(), 'openspec-cli-e2e-'));
  tempRoots.push(base);
  const projectDir = path.join(base, 'project');
  await fs.mkdir(projectDir, { recursive: true });
  const fixtureDir = path.join(cliProjectRoot, 'test', 'fixtures', fixtureName);
  await fs.cp(fixtureDir, projectDir, { recursive: true });
  return projectDir;
}

afterAll(async () => {
  await Promise.all(tempRoots.map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('openspec CLI 端到端基础测试', () => {
  let prevOpenspecLang: string | undefined;
  let prevLang: string | undefined;

  beforeEach(async () => {
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
    // Restore original language environment variables
    if (prevOpenspecLang === undefined) delete process.env.OPENSPEC_LANG;
    else process.env.OPENSPEC_LANG = prevOpenspecLang;
    
    if (prevLang === undefined) delete process.env.LANG;
    else process.env.LANG = prevLang;
  });
  it('显示帮助输出', async () => {
    const result = await runCLI(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: openspec');
    expect(result.stderr).toBe('');

  });

  it('在初始化帮助中显示动态工具ID', async () => {
    const result = await runCLI(['init', '--help']);
    expect(result.exitCode).toBe(0);

    const expectedTools = AI_TOOLS.filter((tool) => tool.available)
      .map((tool) => tool.value)
      .join(', ');
    const normalizedOutput = result.stdout.replace(/\s+/g, ' ').trim();
    expect(normalizedOutput).toContain(
      `Use "all", "none", or a comma-separated list of: ${expectedTools}`
    );
  });

  it('报告包版本', async () => {
    const pkgRaw = await fs.readFile(path.join(cliProjectRoot, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    const result = await runCLI(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it('使用--all --json参数验证tmp-init示例', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', '--all', '--json'], { cwd: projectDir });
    expect(result.exitCode).toBe(0);
    const output = result.stdout.trim();
    expect(output).not.toBe('');
    const json = JSON.parse(output);
    expect(json.summary?.totals?.failed).toBe(0);
    expect(json.items.some((item: any) => item.id === 'c1' && item.type === 'change')).toBe(true);
  });

  it('对示例中的未知项目返回错误', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', 'does-not-exist'], { cwd: projectDir });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown item 'does-not-exist'");
  });

  describe('init命令非交互式选项', () => {
    it('使用--tools all选项初始化', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const codexHome = path.join(emptyProjectDir, '.codex');
      const result = await runCLI(['init', '--tools', 'all'], {
        cwd: emptyProjectDir,
        env: { CODEX_HOME: codexHome },
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Tool summary:');

      // Check that tool configurations were created
      const claudePath = path.join(emptyProjectDir, 'CLAUDE.md');
      const cursorProposal = path.join(emptyProjectDir, '.cursor/commands/openspec-proposal.md');
      expect(await fileExists(claudePath)).toBe(true);
      expect(await fileExists(cursorProposal)).toBe(true);
    });

    it('使用--tools列表选项初始化', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'claude'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Tool summary:');

      const claudePath = path.join(emptyProjectDir, 'CLAUDE.md');
      const cursorProposal = path.join(emptyProjectDir, '.cursor/commands/openspec-proposal.md');
      expect(await fileExists(claudePath)).toBe(true);
      expect(await fileExists(cursorProposal)).toBe(false); // Not selected
    });

    it('使用--tools none选项初始化', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'none'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Tool summary:');

      const claudePath = path.join(emptyProjectDir, 'CLAUDE.md');
      const cursorProposal = path.join(emptyProjectDir, '.cursor/commands/openspec-proposal.md');
      const rootAgentsPath = path.join(emptyProjectDir, 'AGENTS.md');

      expect(await fileExists(rootAgentsPath)).toBe(true);
      expect(await fileExists(claudePath)).toBe(false);
      expect(await fileExists(cursorProposal)).toBe(false);
    });

    it('对无效工具名称返回错误', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'invalid-tool'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid tool(s): invalid-tool');
      expect(result.stderr).toContain('Available values:');
    });

    it('当组合保留关键字与显式ID时返回错误', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'all,claude'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Cannot combine reserved values "all" or "none" with specific tool IDs');
    });
  });
});
