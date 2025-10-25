import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Note: We cannot truly simulate TTY prompts in this test runner easily.
// Instead, we verify non-interactive fallback behavior and basic invocation.

describe('变更验证（交互行为）', () => {
  const projectRoot = process.cwd();
  const testDir = path.join(projectRoot, 'test-change-validate-tmp');
  const changesDir = path.join(testDir, 'openspec', 'changes');
  const bin = path.join(projectRoot, 'bin', 'openspec.js');


  beforeEach(async () => {
    await fs.mkdir(changesDir, { recursive: true });
    const content = `# Change: Demo\n\n## Why\nBecause reasons that are sufficiently long.\n\n## What Changes\n- **spec-x:** Add something`;
    await fs.mkdir(path.join(changesDir, 'demo'), { recursive: true });
    await fs.writeFile(path.join(changesDir, 'demo', 'proposal.md'), content, 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('无参数且非交互模式时打印列表提示并退出非零值', () => {
    const originalCwd = process.cwd();
    const originalEnv = { ...process.env };
    try {
      process.chdir(testDir);
      process.env.OPEN_SPEC_INTERACTIVE = '0';
      let err: any;
      try {
        execSync(`node ${bin} change validate`, { encoding: 'utf-8' });
      } catch (e) { err = e; }
      expect(err).toBeDefined();
      expect(err.status).not.toBe(0);
      expect(err.stderr.toString()).toContain('Available IDs:');
      expect(err.stderr.toString()).toContain('openspec change list');
    } finally {
      process.chdir(originalCwd);
      process.env = originalEnv;
    }
  });
});


