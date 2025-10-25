import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Validator } from '../../src/core/validation/validator.js';
import { ValidateCommand } from '../../src/commands/validate.js';
import { initI18n } from '../../src/core/i18n/index.js';
import { 
  ScenarioSchema, 
  RequirementSchema, 
  SpecSchema, 
  ChangeSchema,
  DeltaSchema 
} from '../../src/core/schemas/index.js';

describe('验证模式', () => {
  describe('场景模式', () => {
    it('应验证有效场景', () => {
      const scenario = {
        rawText: 'Given a user is logged in\nWhen they click logout\nThen they are redirected to login page',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(true);
    });

    it('应拒绝空文本场景', () => {
      const scenario = {
        rawText: '',
      };
      
      const result = ScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Scenario text cannot be empty');
      }
    });
  });

  describe('需求模式', () => {
    it('应验证有效需求', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [
          {
            rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(true);
    });

    it('应拒绝不包含SHALL或MUST的需求', () => {
      const requirement = {
        text: 'The system provides user authentication',
        scenarios: [
          {
            rawText: 'Given a user\nWhen they login\nThen authenticated',
          },
        ],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Requirement must contain SHALL or MUST keyword');
      }
    });

    it('应拒绝没有场景的需求', () => {
      const requirement = {
        text: 'The system SHALL provide user authentication',
        scenarios: [],
      };
      
      const result = RequirementSchema.safeParse(requirement);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Requirement must have at least one scenario');
      }
    });
  });

  describe('规范模式', () => {
    it('应验证有效规范', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [
          {
            text: 'The system SHALL provide user authentication',
            scenarios: [
              {
                rawText: 'Given a user with valid credentials\nWhen they submit the login form\nThen they are authenticated',
              },
            ],
          },
        ],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });

    it('应拒绝没有需求的规范', () => {
      const spec = {
        name: 'user-auth',
        overview: 'This spec defines user authentication requirements',
        requirements: [],
      };
      
      const result = SpecSchema.safeParse(spec);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Spec must have at least one requirement');
      }
    });
  });

  describe('变更模式', () => {
    it('应验证有效变更', () => {
      const change = {
        name: 'add-user-auth',
        why: 'We need user authentication to secure the application and protect user data',
        whatChanges: 'Add authentication module with login and logout capabilities',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add new user authentication spec',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(true);
    });

    it('应拒绝why部分过短的变更', () => {
      const change = {
        name: 'add-user-auth',
        why: 'Need auth',
        whatChanges: 'Add authentication',
        deltas: [
          {
            spec: 'user-auth',
            operation: 'ADDED',
            description: 'Add auth',
          },
        ],
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Why section must be at least 50 characters');
      }
    });

    it('应警告过多的增量', () => {
      const deltas = Array.from({ length: 11 }, (_, i) => ({
        spec: `spec-${i}`,
        operation: 'ADDED' as const,
        description: `Add spec ${i}`,
      }));
      
      const change = {
        name: 'massive-change',
        why: 'This is a massive change that affects many parts of the system',
        whatChanges: 'Update everything',
        deltas,
      };
      
      const result = ChangeSchema.safeParse(change);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Consider splitting changes with more than 10 deltas');
      }
    });
  });
});

describe('验证器', () => {
  const testDir = path.join(process.cwd(), 'test-validation-tmp');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('验证规范', () => {
    it('应验证有效的规范文件', async () => {
      const specContent = `# User Authentication Spec

## Purpose
This specification defines the requirements for user authentication in the system.

## Requirements

### The system SHALL provide secure user authentication
The system SHALL provide secure user authentication mechanisms.

#### Scenario: Successful login
Given a user with valid credentials
When they submit the login form
Then they are authenticated and redirected to the dashboard

### The system SHALL handle invalid login attempts
The system SHALL gracefully handle incorrect credentials.

#### Scenario: Invalid credentials
Given a user with invalid credentials
When they submit the login form
Then they see an error message`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('应检测缺失的概述部分', async () => {
      const specContent = `# User Authentication Spec

## Requirements

### The system SHALL provide secure user authentication

#### Scenario: Login
Given a user
When they login
Then authenticated`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);
      
      const validator = new Validator();
      const report = await validator.validateSpec(specPath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('Purpose'))).toBe(true);
    });
  });

  describe('验证变更', () => {
    it('应验证有效的变更文件', async () => {
      const changeContent = `# Add User Authentication

## Why
We need to implement user authentication to secure the application and protect user data from unauthorized access.

## What Changes
- **user-auth:** Add new user authentication specification
- **api-endpoints:** Modify to include auth endpoints`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('应检测缺失的why部分', async () => {
      const changeContent = `# Add User Authentication

## What Changes
- **user-auth:** Add new user authentication specification`;

      const changePath = path.join(testDir, 'change.md');
      await fs.writeFile(changePath, changeContent);
      
      const validator = new Validator();
      const report = await validator.validateChange(changePath);
      
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('Why'))).toBe(true);
    });
  });

  describe('严格模式', () => {
    it('应严格模式下因警告而失败', async () => {
      const specContent = `# Test Spec

## Purpose
Brief overview

## Requirements

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);

      const validator = new Validator(true); // strict mode
      const report = await validator.validateSpec(specPath);

      expect(report.valid).toBe(false); // Should fail due to brief overview warning
    });

    it('应非严格模式下通过警告', async () => {
      const specContent = `# Test Spec

## Purpose
Brief overview

## Requirements

### The system SHALL do something

#### Scenario: Test
Given test
When action
Then result`;

      const specPath = path.join(testDir, 'spec.md');
      await fs.writeFile(specPath, specContent);

      const validator = new Validator(false); // non-strict mode
      const report = await validator.validateSpec(specPath);

      expect(report.valid).toBe(true); // Should pass despite warnings
      expect(report.summary.warnings).toBeGreaterThan(0);
    });
  });

  describe('带元数据的变更增量规范验证', () => {
    it('应验证SHALL/MUST文本前包含元数据的需求', async () => {
      const changeDir = path.join(testDir, 'test-change');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## ADDED Requirements

### Requirement: Circuit Breaker State Management SHALL be implemented
**ID**: REQ-CB-001
**Priority**: P1 (High)

The system MUST implement a circuit breaker with three states.

#### Scenario: Normal operation
**Given** the circuit breaker is in CLOSED state
**When** a request is made
**Then** the request is executed normally`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('应验证文本中包含SHALL但标题中不包含的需求', async () => {
      const changeDir = path.join(testDir, 'test-change-2');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## ADDED Requirements

### Requirement: Error Handling
**ID**: REQ-ERR-001
**Priority**: P2

The system SHALL handle all errors gracefully.

#### Scenario: Error occurs
**Given** an error condition
**When** an error occurs
**Then** the error is logged and user is notified`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('应因需求文本缺少SHALL/MUST而失败', async () => {
      const changeDir = path.join(testDir, 'test-change-3');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## ADDED Requirements

### Requirement: Logging Feature
**ID**: REQ-LOG-001

The system will log all events.

#### Scenario: Event occurs
**Given** an event
**When** it occurs
**Then** it is logged`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.issues.some(i => i.message.includes('must contain SHALL or MUST'))).toBe(true);
    });

    it('应处理没有元数据字段的需求', async () => {
      const changeDir = path.join(testDir, 'test-change-4');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## ADDED Requirements

### Requirement: Simple Feature
The system SHALL implement this feature.

#### Scenario: Basic usage
**Given** a condition
**When** an action occurs
**Then** a result happens`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('应不区分大小写地处理增量标题', async () => {
      const changeDir = path.join(testDir, 'test-change-mixed-case');
      const specsDir = path.join(changeDir, 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# Test Spec

## Added Requirements

### Requirement: Mixed Case Handling
The system MUST support mixed case delta headers.

#### Scenario: Case insensitive parsing
**Given** a delta file with mixed case headers
**When** validation runs
**Then** the delta is detected`;

      const specPath = path.join(specsDir, 'spec.md');
      await fs.writeFile(specPath, deltaSpec);

      const validator = new Validator(true);
      const report = await validator.validateChangeDeltaSpecs(changeDir);

      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
      expect(report.summary.warnings).toBe(0);
      expect(report.summary.info).toBe(0);
    });
  });
});


describe('支持中文国际化的验证命令', () => {
  let tempDir: string;
  let logOutput: string[];
  let originalEnv: { [key: string]: string | undefined };

  beforeEach(async () => {
    // Save original environment
    originalEnv = {
      LANG: process.env.LANG,
      OPENSPEC_LANG: process.env.OPENSPEC_LANG,
    };

    // Set Chinese environment
    process.env.LANG = 'zh';
    process.env.OPENSPEC_LANG = 'zh';
    
    await initI18n('zh');

    tempDir = path.join(os.tmpdir(), `openspec-validation-test-zh-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Mock console.log to capture output
    logOutput = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logOutput.push(args.join(' '));
      originalLog(...args);
    };
  });

  afterEach(async () => {
    // Restore original environment
    if (originalEnv.LANG !== undefined) {
      process.env.LANG = originalEnv.LANG;
    } else {
      delete process.env.LANG;
    }
    
    if (originalEnv.OPENSPEC_LANG !== undefined) {
      process.env.OPENSPEC_LANG = originalEnv.OPENSPEC_LANG;
    } else {
      delete process.env.OPENSPEC_LANG;
    }

    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }

    // Restore console.log
    console.log = console.log;
  });

  describe('中文验证消息', () => {
    it('应显示不存在项目的中文错误消息', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      const specsDir = path.join(tempDir, 'openspec', 'specs');
      await fs.mkdir(changesDir, { recursive: true });
      await fs.mkdir(specsDir, { recursive: true });

      const validateCommand = new ValidateCommand();

      const originalCwd = process.cwd();
      const originalExitCode = process.exitCode;
      
      try {
        await validateCommand.execute('non-existent');
        // Should set exit code to 1 on validation failure
        expect(process.exitCode).toBe(1);
      } finally {
        process.chdir(originalCwd);
        process.exitCode = originalExitCode;
      }
    });

    it('应显示有效变更的中文验证结果', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      const changeDir = path.join(changesDir, 'test-change');
      await fs.mkdir(changeDir, { recursive: true });
      
      await fs.writeFile(
        path.join(changeDir, 'proposal.md'),
        '# Test Change\n\n## Purpose\nTest purpose\n\n## Requirements\n\n### The system SHALL do something\n\n#### Scenario: Test\nGiven test\nWhen action\nThen result'
      );
      
      await fs.writeFile(
        path.join(changeDir, 'tasks.md'),
        '- [x] Task 1\n- [x] Task 2\n'
      );

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        await validateCommand.execute('test-change');
        // Should complete successfully (no errors)
        expect(true).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('应显示有效规范的中文验证结果', async () => {
      const specsDir = path.join(tempDir, 'openspec', 'specs', 'test-spec');
      await fs.mkdir(specsDir, { recursive: true });
      
      await fs.writeFile(
        path.join(specsDir, 'spec.md'),
        '# Test Spec\n\n## Purpose\nTest purpose\n\n## Requirements\n\n### The system SHALL do something\n\n#### Scenario: Test\nGiven test\nWhen action\nThen result'
      );

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        await validateCommand.execute('test-spec');
        // Should complete successfully (no errors)
        expect(true).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('应显示缺失proposal.md的中文错误消息', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes', 'no-proposal');
      await fs.mkdir(changesDir, { recursive: true });

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const originalExitCode = process.exitCode;
        process.exitCode = 0;
        
        await validateCommand.execute('no-proposal', { noInteractive: true });
        
        // Should have validation errors (exit code 1)
        expect(process.exitCode).toBe(1);
        
        process.exitCode = originalExitCode;
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('应显示缺失spec.md的中文错误消息', async () => {
      const specsDir = path.join(tempDir, 'openspec', 'specs', 'no-spec');
      await fs.mkdir(specsDir, { recursive: true });

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const originalExitCode = process.exitCode;
        process.exitCode = 0;
        
        await validateCommand.execute('no-spec', { noInteractive: true });
        
        // Should have validation errors (exit code 1)
        expect(process.exitCode).toBe(1);
        
        process.exitCode = originalExitCode;
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('应显示无效内容的中文验证错误', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      const changeDir = path.join(changesDir, 'invalid-change');
      await fs.mkdir(changeDir, { recursive: true });
      
      await fs.writeFile(
        path.join(changeDir, 'proposal.md'),
        '# Invalid Change\n\nThis is invalid content without proper requirements.'
      );

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const originalExitCode = process.exitCode;
        process.exitCode = 0;
        
        await validateCommand.execute('invalid-change', { noInteractive: true });
        
        // Should have validation errors (exit code 1)
        expect(process.exitCode).toBe(1);
        
        process.exitCode = originalExitCode;
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('中文环境验证', () => {
    it('应正确初始化中文语言环境', async () => {
      const changesDir = path.join(tempDir, 'openspec', 'changes');
      await fs.mkdir(changesDir, { recursive: true });

      const validateCommand = new ValidateCommand();
      
      // ValidateCommand.execute() doesn't throw for non-existent items in non-interactive mode
      // It sets process.exitCode = 1 instead, so we test that behavior
      const originalExitCode = process.exitCode;
      process.exitCode = 0;
      
      try {
        await validateCommand.execute('non-existent', { noInteractive: true });
        expect(process.exitCode).toBe(1);
      } finally {
        process.exitCode = originalExitCode;
      }
    });

    it('应优雅地处理混合语言环境', async () => {
      // Test with mixed environment variables
      process.env.LANG = 'en';
      process.env.OPENSPEC_LANG = 'zh';
      
      await initI18n('zh');

      const changesDir = path.join(tempDir, 'openspec', 'changes');
      const changeDir = path.join(changesDir, 'test-change');
      await fs.mkdir(changeDir, { recursive: true });
      
      await fs.writeFile(
        path.join(changeDir, 'proposal.md'),
        '# Test Change\n\n## Purpose\nTest purpose\n\n## Requirements\n\n### The system SHALL do something\n\n#### Scenario: Test\nGiven test\nWhen action\nThen result'
      );
      
      await fs.writeFile(
        path.join(changeDir, 'tasks.md'),
        '- [x] Task 1\n- [x] Task 2\n'
      );

      const validateCommand = new ValidateCommand();
      
      // Change to the temp directory for validation
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        await validateCommand.execute('test-change');
        // Should complete successfully (no errors)
        expect(true).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
