import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('规范验证（交互行为）', () => {
  const projectRoot = process.cwd();
  const testDir = path.join(projectRoot, 'test-spec-validate-tmp');
  const specsDir = path.join(testDir, 'openspec', 'specs');
  const bin = path.join(projectRoot, 'bin', 'openspec.js');


  beforeEach(async () => {
    await fs.mkdir(specsDir, { recursive: true });
    const content = `## Purpose\nValid spec for interactive test.\n\n## Requirements\n\n### Requirement: X\nText`;
    await fs.mkdir(path.join(specsDir, 's1'), { recursive: true });
    await fs.writeFile(path.join(specsDir, 's1', 'spec.md'), content, 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('无参数且非交互模式时出错', () => {
    const originalCwd = process.cwd();
    const originalEnv = { ...process.env };
    try {
      process.chdir(testDir);
      process.env.OPEN_SPEC_INTERACTIVE = '0';
      let err: any;
      try {
        execSync(`node ${bin} spec validate`, { encoding: 'utf-8' });
      } catch (e) { err = e; }
      expect(err).toBeDefined();
      expect(err.status).not.toBe(0);
      expect(err.stderr.toString()).toContain('Missing required argument <spec-id>');
    } finally {
      process.chdir(originalCwd);
      process.env = originalEnv;
    }
  });
});


