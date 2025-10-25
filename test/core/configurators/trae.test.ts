import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TraeConfigurator } from '../../../src/core/configurators/trae.js';
import { FileSystemUtils } from '../../../src/utils/file-system.js';
import { TemplateManager } from '../../../src/core/templates/index.js';
import { OPENSPEC_MARKERS } from '../../../src/core/config.js';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

describe('Trae配置器', () => {
  let configurator: TraeConfigurator;
  let tempDir: string;

  beforeEach(async () => {
    configurator = new TraeConfigurator();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trae-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('应具有正确的属性', () => {
    expect(configurator.name).toBe('Trae IDE');
    expect(configurator.configFileName).toBe('.trae/rules/project_rules.md');
    expect(configurator.isAvailable).toBe(true);
  });

  it('应创建Trae配置文件', async () => {
    const openspecDir = path.join(tempDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });

    await configurator.configure(tempDir, openspecDir);

    const configPath = path.join(tempDir, '.trae/rules/project_rules.md');
    const exists = await FileSystemUtils.fileExists(configPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain(OPENSPEC_MARKERS.start);
    expect(content).toContain(OPENSPEC_MARKERS.end);
    expect(content).toContain('OpenSpec');
  });

  it('应更新现有的Trae配置文件', async () => {
    const configPath = path.join(tempDir, '.trae/rules/project_rules.md');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    
    // Create existing file with custom content
    const existingContent = `# Custom Trae Rules
Some custom content
${OPENSPEC_MARKERS.start}
Old OpenSpec content
${OPENSPEC_MARKERS.end}
More custom content`;
    
    await fs.writeFile(configPath, existingContent);

    const openspecDir = path.join(tempDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });

    await configurator.configure(tempDir, openspecDir);

    const updatedContent = await fs.readFile(configPath, 'utf-8');
    expect(updatedContent).toContain('# Custom Trae Rules');
    expect(updatedContent).toContain('Some custom content');
    expect(updatedContent).toContain('More custom content');
    expect(updatedContent).toContain(OPENSPEC_MARKERS.start);
    expect(updatedContent).toContain(OPENSPEC_MARKERS.end);
    expect(updatedContent).not.toContain('Old OpenSpec content');
  });

  it('应使用代理标准模板', async () => {
    const openspecDir = path.join(tempDir, 'openspec');
    await fs.mkdir(openspecDir, { recursive: true });

    await configurator.configure(tempDir, openspecDir);

    const configPath = path.join(tempDir, '.trae/rules/project_rules.md');
    const content = await fs.readFile(configPath, 'utf-8');
    const expectedTemplate = TemplateManager.getAgentsStandardTemplate();
    
    expect(content).toContain(expectedTemplate);
  });
});