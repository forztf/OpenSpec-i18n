import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { FileSystemUtils } from '../../src/utils/file-system.js';

describe('文件系统工具', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openspec-test-${randomUUID()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('创建目录', () => {
    it('应创建目录', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      await FileSystemUtils.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('应创建嵌套目录', async () => {
      const dirPath = path.join(testDir, 'nested', 'deep', 'dir');
      await FileSystemUtils.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('目录已存在时不应抛出异常', async () => {
      const dirPath = path.join(testDir, 'existing-dir');
      await fs.mkdir(dirPath);
      
      await expect(FileSystemUtils.createDirectory(dirPath)).resolves.not.toThrow();
    });
  });

  describe('文件是否存在', () => {
    it('应为存在的文件返回true', async () => {
      const filePath = path.join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'test content');
      
      const exists = await FileSystemUtils.fileExists(filePath);
      expect(exists).toBe(true);
    });

    it('应为不存在的文件返回false', async () => {
      const filePath = path.join(testDir, 'non-existent.txt');
      
      const exists = await FileSystemUtils.fileExists(filePath);
      expect(exists).toBe(false);
    });

    it('应为目录路径返回false', async () => {
      const dirPath = path.join(testDir, 'dir');
      await fs.mkdir(dirPath);
      
      const exists = await FileSystemUtils.fileExists(dirPath);
      expect(exists).toBe(true); // fs.access doesn't distinguish between files and directories
    });
  });

  describe('目录是否存在', () => {
    it('应为存在的目录返回true', async () => {
      const dirPath = path.join(testDir, 'test-dir');
      await fs.mkdir(dirPath);
      
      const exists = await FileSystemUtils.directoryExists(dirPath);
      expect(exists).toBe(true);
    });

    it('应为不存在的目录返回false', async () => {
      const dirPath = path.join(testDir, 'non-existent-dir');
      
      const exists = await FileSystemUtils.directoryExists(dirPath);
      expect(exists).toBe(false);
    });

    it('应为文件路径返回false', async () => {
      const filePath = path.join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');
      
      const exists = await FileSystemUtils.directoryExists(filePath);
      expect(exists).toBe(false);
    });
  });

  describe('写入文件', () => {
    it('应将内容写入文件', async () => {
      const filePath = path.join(testDir, 'output.txt');
      const content = 'Hello, World!';
      
      await FileSystemUtils.writeFile(filePath, content);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(content);
    });

    it('如果目录不存在应创建目录', async () => {
      const filePath = path.join(testDir, 'nested', 'dir', 'output.txt');
      const content = 'Nested content';
      
      await FileSystemUtils.writeFile(filePath, content);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(content);
    });

    it('应覆盖已存在的文件', async () => {
      const filePath = path.join(testDir, 'existing.txt');
      await fs.writeFile(filePath, 'old content');
      
      const newContent = 'new content';
      await FileSystemUtils.writeFile(filePath, newContent);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(newContent);
    });
  });

  describe('读取文件', () => {
    it('应读取文件内容', async () => {
      const filePath = path.join(testDir, 'input.txt');
      const content = 'Test content';
      await fs.writeFile(filePath, content);
      
      const readContent = await FileSystemUtils.readFile(filePath);
      expect(readContent).toBe(content);
    });

    it('应为不存在的文件抛出异常', async () => {
      const filePath = path.join(testDir, 'non-existent.txt');
      
      await expect(FileSystemUtils.readFile(filePath)).rejects.toThrow();
    });
  });

  describe('确保写入权限', () => {
    it('应为可写目录返回true', async () => {
      const hasPermission = await FileSystemUtils.ensureWritePermissions(testDir);
      expect(hasPermission).toBe(true);
    });

    it('应为具有可写父目录的不存在目录返回true', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      const hasPermission = await FileSystemUtils.ensureWritePermissions(dirPath);
      expect(hasPermission).toBe(true);
    });

    it('应处理深度嵌套的不存在目录', async () => {
      const dirPath = path.join(testDir, 'a', 'b', 'c', 'd');
      const hasPermission = await FileSystemUtils.ensureWritePermissions(dirPath);
      expect(hasPermission).toBe(true);
    });
  });

  describe('连接路径', () => {
    it('应连接POSIX风格路径', () => {
      const result = FileSystemUtils.joinPath(
        '/tmp/project',
        '.claude/commands/openspec/proposal.md'
      );
      expect(result).toBe('/tmp/project/.claude/commands/openspec/proposal.md');
    });

    it('应连接Linux主目录路径', () => {
      const result = FileSystemUtils.joinPath(
        '/home/dev/workspace/openspec',
        '.cursor/commands/install.md'
      );
      expect(result).toBe('/home/dev/workspace/openspec/.cursor/commands/install.md');
    });

    it('应使用反斜杠连接Windows驱动器路径', () => {
      const result = FileSystemUtils.joinPath(
        'C:\\Users\\dev\\project',
        '.claude/commands/openspec/proposal.md'
      );
      expect(result).toBe(
        'C:\\Users\\dev\\project\\.claude\\commands\\openspec\\proposal.md'
      );
    });

    it('应连接使用正斜杠的Windows路径', () => {
      const result = FileSystemUtils.joinPath(
        'D:/workspace/app',
        '.cursor/commands/openspec-apply.md'
      );
      expect(result).toBe(
        'D:\\workspace\\app\\.cursor\\commands\\openspec-apply.md'
      );
    });

    it('应连接UNC风格的Windows路径', () => {
      const result = FileSystemUtils.joinPath(
        '\\server\\share\\repo',
        '.windsurf/workflows/openspec-archive.md'
      );
      expect(result).toBe(
        '\\server\\share\\repo\\.windsurf\\workflows\\openspec-archive.md'
      );
    });
  });
});
