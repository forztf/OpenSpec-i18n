import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { JsonConverter } from '../../../src/core/converters/json-converter.js';

describe('JSON转换器', () => {
  const testDir = path.join(process.cwd(), 'test-json-converter-tmp');
  const converter = new JsonConverter();
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('转换规范为JSON', () => {
    it('应将规范转换为JSON格式', async () => {
      const specContent = `# User Authentication Spec

## Purpose
This specification defines the requirements for user authentication.

## Requirements

### The system SHALL provide secure user authentication
Users need to be able to log in securely.

#### Scenario: Successful login
Given a user with valid credentials
When they submit the login form
Then they are authenticated`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const json = converter.convertSpecToJson(specPath);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('spec');
      expect(parsed.overview).toContain('user authentication');
      expect(parsed.requirements).toHaveLength(1);
      expect(parsed.requirements[0].scenarios).toHaveLength(1);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.format).toBe('openspec');
      expect(parsed.metadata.sourcePath).toBe(specPath);
    });

    it('应从目录结构中提取规范名称', async () => {
      const specsDir = path.join(testDir, 'specs', 'user-auth');
      await fs.mkdir(specsDir, { recursive: true });
      
      const specContent = `# User Auth

## Purpose
Auth spec overview

## Requirements

### The system SHALL authenticate users

#### Scenario: Login
Given a user
When they login
Then authenticated`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const json = converter.convertSpecToJson(specPath);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('user-auth');
    });
  });

  describe('转换变为JSON', () => {
    it('应将变更转换为JSON格式', async () => {
      const changeContent = `# Add User Authentication

## Why
We need to implement user authentication to secure the application and protect user data from unauthorized access.

## What Changes
- **user-auth:** Add new user authentication specification
- **api-endpoints:** Modify to include authentication endpoints`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const json = await converter.convertChangeToJson(changePath);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('change');
      expect(parsed.why).toContain('secure the application');
      expect(parsed.deltas).toHaveLength(2);
      expect(parsed.deltas[0].spec).toBe('user-auth');
      expect(parsed.deltas[0].operation).toBe('ADDED');
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.format).toBe('openspec-change');
      expect(parsed.metadata.sourcePath).toBe(changePath);
    });

    it('应从目录结构中提取变更名称', async () => {
      const changesDir = path.join(testDir, 'changes', 'add-auth');
      await fs.mkdir(changesDir, { recursive: true });
      
      const changeContent = `# Add Auth

## Why
We need authentication for security reasons and to protect user data properly.

## What Changes
- **auth:** Add authentication`;

      const changePath = path.join(changesDir, 'proposal.md');
      await fs.writeFile(changePath, changeContent);
      
      const json = await converter.convertChangeToJson(changePath);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('add-auth');
    });
  });

  describe('JSON格式化', () => {
    it('应生成格式正确的带缩进的JSON', async () => {
      const specContent = `# Test

## Purpose
Test overview

## Requirements

### The system SHALL test

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const json = converter.convertSpecToJson(specPath);
      
      // Check for proper indentation (2 spaces)
      expect(json).toContain('  "name"');
      expect(json).toContain('  "overview"');
      expect(json).toContain('  "requirements"');
      
      // Check it's valid JSON
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('应处理内容中的特殊字符', async () => {
      const specContent = `# Test

## Purpose
This has "quotes" and \\ backslashes and
newlines

## Requirements

### The system SHALL handle "special" characters

#### Scenario: Special chars
Given a string with "quotes"
When processing \\ backslash
Then handle correctly`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const json = converter.convertSpecToJson(specPath);
      const parsed = JSON.parse(json);
      
      expect(parsed.overview).toContain('"quotes"');
      expect(parsed.overview).toContain('\\');
      expect(parsed.requirements[0].text).toContain('"special"');
    });
  });
});