import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('顶层显示命令', () => {
  const projectRoot = process.cwd();
  const testDir = path.join(projectRoot, 'test-show-command-tmp');
  const changesDir = path.join(testDir, 'openspec', 'changes');
  const specsDir = path.join(testDir, 'openspec', 'specs');
  const openspecBin = path.join(projectRoot, 'bin', 'openspec.js');


  beforeEach(async () => {
    await fs.mkdir(changesDir, { recursive: true });
    await fs.mkdir(specsDir, { recursive: true });

    const changeContent = `# Change: Demo\n\n## Why\nBecause reasons.\n\n## What Changes\n- **auth:** Add requirement\n`;
    await fs.mkdir(path.join(changesDir, 'demo'), { recursive: true });
    await fs.writeFile(path.join(changesDir, 'demo', 'proposal.md'), changeContent, 'utf-8');

    const specContent = `## Purpose\nAuth spec.\n\n## Requirements\n\n### Requirement: User Authentication\nText\n`;
    await fs.mkdir(path.join(specsDir, 'auth'), { recursive: true });
    await fs.writeFile(path.join(specsDir, 'auth', 'spec.md'), specContent, 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('无参数且非交互模式时打印提示并返回非零退出码', () => {
    const originalCwd = process.cwd();
    const originalEnv = { ...process.env };
    try {
      process.chdir(testDir);
      process.env.OPEN_SPEC_INTERACTIVE = '0';
      let err: any;
      try {
        execSync(`node ${openspecBin} show`, { encoding: 'utf-8' });
      } catch (e) { err = e; }
      expect(err).toBeDefined();
      expect(err.status).not.toBe(0);
      const stderr = err.stderr.toString();
      expect(stderr).toContain('Nothing to show.');
      expect(stderr).toContain('openspec show <item>');
      expect(stderr).toContain('openspec change show');
      expect(stderr).toContain('openspec spec show');
    } finally {
      process.chdir(originalCwd);
      process.env = originalEnv;
    }
  });

  it('自动检测变更ID并支持--json参数', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      const output = execSync(`node ${openspecBin} show demo --json`, { encoding: 'utf-8' });
      const json = JSON.parse(output);
      expect(json.id).toBe('demo');
      expect(Array.isArray(json.deltas)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('自动检测规范ID并支持仅规范标志', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      const output = execSync(`node ${openspecBin} show auth --json --requirements`, { encoding: 'utf-8' });
      const json = JSON.parse(output);
      expect(json.id).toBe('auth');
      expect(Array.isArray(json.requirements)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('处理歧义并建议使用--type参数', async () => {
    // create matching spec and change named 'foo'
    await fs.mkdir(path.join(changesDir, 'foo'), { recursive: true });
    await fs.writeFile(path.join(changesDir, 'foo', 'proposal.md'), '# Change: Foo\n\n## Why\n\n## What Changes\n', 'utf-8');
    await fs.mkdir(path.join(specsDir, 'foo'), { recursive: true });
    await fs.writeFile(path.join(specsDir, 'foo', 'spec.md'), '## Purpose\n\n## Requirements\n\n### Requirement: R\nX', 'utf-8');

    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      let err: any;
      try {
        execSync(`node ${openspecBin} show foo`, { encoding: 'utf-8' });
      } catch (e) { err = e; }
      expect(err).toBeDefined();
      expect(err.status).not.toBe(0);
      const stderr = err.stderr.toString();
      expect(stderr).toContain('Ambiguous item');
      expect(stderr).toContain('--type change|spec');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('未找到时打印最接近的匹配项', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      let err: any;
      try {
        execSync(`node ${openspecBin} show unknown-item`, { encoding: 'utf-8' });
      } catch (e) { err = e; }
      expect(err).toBeDefined();
      expect(err.status).not.toBe(0);
      const stderr = err.stderr.toString();
      expect(stderr).toContain("Unknown item 'unknown-item'");
      expect(stderr).toContain('Did you mean:');
    } finally {
      process.chdir(originalCwd);
    }
  });
});


