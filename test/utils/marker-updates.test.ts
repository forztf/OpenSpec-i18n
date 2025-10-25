import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileSystemUtils } from '../../src/utils/file-system.js';

describe('文件系统工具.使用标记更新文件', () => {
  let testDir: string;
  const START_MARKER = '<!-- OPENSPEC:START -->';
  const END_MARKER = '<!-- OPENSPEC:END -->';

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openspec-marker-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('新文件创建', () => {
    it('应创建带标记和内容的新文件', async () => {
      const filePath = path.join(testDir, 'new-file.md');
      const content = 'OpenSpec content';
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        content,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(`${START_MARKER}\n${content}\n${END_MARKER}`);
    });
  });

  describe('无标记的现有文件', () => {
    it('应将标记和内容前置到现有文件', async () => {
      const filePath = path.join(testDir, 'existing.md');
      const existingContent = '# Existing Content\nUser content here';
      await fs.writeFile(filePath, existingContent);
      
      const newContent = 'OpenSpec content';
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        newContent,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(
        `${START_MARKER}\n${newContent}\n${END_MARKER}\n\n${existingContent}`
      );
    });
  });

  describe('带标记的现有文件', () => {
    it('应替换标记间的内容', async () => {
      const filePath = path.join(testDir, 'with-markers.md');
      const beforeContent = '# Before\nSome content before';
      const oldManagedContent = 'Old OpenSpec content';
      const afterContent = '# After\nSome content after';
      
      const existingFile = `${beforeContent}\n${START_MARKER}\n${oldManagedContent}\n${END_MARKER}\n${afterContent}`;
      await fs.writeFile(filePath, existingFile);
      
      const newContent = 'New OpenSpec content';
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        newContent,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(
        `${beforeContent}\n${START_MARKER}\n${newContent}\n${END_MARKER}\n${afterContent}`
      );
    });

    it('应保留标记前后的内容', async () => {
      const filePath = path.join(testDir, 'preserve.md');
      const userContentBefore = '# User Content Before\nImportant user notes';
      const userContentAfter = '## User Content After\nMore user notes';
      
      const existingFile = `${userContentBefore}\n${START_MARKER}\nOld content\n${END_MARKER}\n${userContentAfter}`;
      await fs.writeFile(filePath, existingFile);
      
      const newContent = 'Updated content';
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        newContent,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toContain(userContentBefore);
      expect(result).toContain(userContentAfter);
      expect(result).toContain(newContent);
      expect(result).not.toContain('Old content');
    });

    it('应处理文件开头的标记', async () => {
      const filePath = path.join(testDir, 'markers-at-start.md');
      const afterContent = 'User content after markers';
      
      const existingFile = `${START_MARKER}\nOld content\n${END_MARKER}\n${afterContent}`;
      await fs.writeFile(filePath, existingFile);
      
      const newContent = 'New content';
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        newContent,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(`${START_MARKER}\n${newContent}\n${END_MARKER}\n${afterContent}`);
    });

    it('应处理文件末尾的标记', async () => {
      const filePath = path.join(testDir, 'markers-at-end.md');
      const beforeContent = 'User content before markers';
      
      const existingFile = `${beforeContent}\n${START_MARKER}\nOld content\n${END_MARKER}`;
      await fs.writeFile(filePath, existingFile);
      
      const newContent = 'New content';
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        newContent,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(`${beforeContent}\n${START_MARKER}\n${newContent}\n${END_MARKER}`);
    });
  });

  describe('无效标记状态', () => {
    it('仅存在开始标记时应抛出错误', async () => {
      const filePath = path.join(testDir, 'invalid-start.md');
      const existingFile = `Some content\n${START_MARKER}\nManaged content\nNo end marker`;
      await fs.writeFile(filePath, existingFile);
      
      await expect(
        FileSystemUtils.updateFileWithMarkers(
          filePath,
          'New content',
          START_MARKER,
          END_MARKER
        )
      ).rejects.toThrow(/Invalid marker state/);
    });

    it('仅存在结束标记时应抛出错误', async () => {
      const filePath = path.join(testDir, 'invalid-end.md');
      const existingFile = `Some content\nNo start marker\nManaged content\n${END_MARKER}`;
      await fs.writeFile(filePath, existingFile);
      
      await expect(
        FileSystemUtils.updateFileWithMarkers(
          filePath,
          'New content',
          START_MARKER,
          END_MARKER
        )
      ).rejects.toThrow(/Invalid marker state/);
    });
  });

  describe('幂等性', () => {
    it('使用相同内容多次调用时应产生相同结果', async () => {
      const filePath = path.join(testDir, 'idempotent.md');
      const content = 'Consistent content';
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        content,
        START_MARKER,
        END_MARKER
      );
      
      const firstResult = await fs.readFile(filePath, 'utf-8');
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        content,
        START_MARKER,
        END_MARKER
      );
      
      const secondResult = await fs.readFile(filePath, 'utf-8');
      expect(secondResult).toBe(firstResult);
    });
  });

  describe('边缘情况', () => {
    it('应处理空内容', async () => {
      const filePath = path.join(testDir, 'empty-content.md');
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        '',
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toBe(`${START_MARKER}\n\n${END_MARKER}`);
    });

    it('应处理包含特殊字符的内容', async () => {
      const filePath = path.join(testDir, 'special-chars.md');
      const content = '# Special chars: ${}[]()<>|\\`*_~';
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        content,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toContain(content);
    });

    it('应处理多行内容', async () => {
      const filePath = path.join(testDir, 'multi-line.md');
      const content = `Line 1
Line 2
Line 3

Line 5 with gap`;
      
      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        content,
        START_MARKER,
        END_MARKER
      );
      
      const result = await fs.readFile(filePath, 'utf-8');
      expect(result).toContain(content);
    });

    it('更新内容时应忽略内联标记引用', async () => {
      const filePath = path.join(testDir, 'inline-mentions.md');
      const existingFile = `Intro referencing markers like ${START_MARKER} and ${END_MARKER} inside text.

${START_MARKER}
Original content
${END_MARKER}
`;

      await fs.writeFile(filePath, existingFile);

      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        'Updated content',
        START_MARKER,
        END_MARKER
      );

      const firstResult = await fs.readFile(filePath, 'utf-8');
      expect(firstResult).toContain('Intro referencing markers like');
      expect(firstResult).toContain('Updated content');
      expect(firstResult.match(new RegExp(START_MARKER, 'g'))?.length).toBe(2);
      expect(firstResult.match(new RegExp(END_MARKER, 'g'))?.length).toBe(2);

      await FileSystemUtils.updateFileWithMarkers(
        filePath,
        'Updated content',
        START_MARKER,
        END_MARKER
      );

      const secondResult = await fs.readFile(filePath, 'utf-8');
      expect(secondResult).toBe(firstResult);
    });
  });
});
