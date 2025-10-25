# Tasks for Adding i18n Support to Core Commands

## Phase 1: Setup i18n Infrastructure

- [ ] **Update i18n configuration**
  - [ ] Add `archive`, `config`, `list`, `view` namespaces to `src/core/i18n/index.ts`
  - [ ] Update supported namespaces array

## Phase 2: Create Translation Files

- [ ] **Create English translation files**
  - [ ] Create `src/core/i18n/en/archive.json` with all archive command messages
  - [ ] Create `src/core/i18n/en/config.json` with all config command messages  
  - [ ] Create `src/core/i18n/en/list.json` with all list command messages
  - [ ] Create `src/core/i18n/en/view.json` with all view command messages

- [ ] **Create Chinese translation files**
  - [ ] Create `src/core/i18n/zh/archive.json` with all archive command messages
  - [ ] Create `src/core/i18n/zh/config.json` with all config command messages
  - [ ] Create `src/core/i18n/zh/list.json` with all list command messages
  - [ ] Create `src/core/i18n/zh/view.json` with all view command messages

## Phase 3: Implement i18n in Commands

- [ ] **Update archive.ts**
  - [ ] Import `initI18n` and `t` functions from i18n
  - [ ] Add `initI18n()` call at the beginning of execute method
  - [ ] Replace hardcoded error messages with `t()` calls
  - [ ] Replace console.log messages with `t()` calls
  - [ ] Replace inquirer prompts with translated messages

- [ ] **Update config.ts**
  - [ ] Import `initI18n` and `t` functions from i18n (if needed for future messages)
  - [ ] Add translation keys for AI tool descriptions and labels

- [ ] **Update list.ts**
  - [ ] Import `initI18n` and `t` functions from i18n
  - [ ] Add `initI18n()` call at the beginning of execute method
  - [ ] Replace "Changes:" and "Specs:" headers with `t()` calls
  - [ ] Replace "No active changes found." message with `t()` call
  - [ ] Replace error messages with `t()` calls

- [ ] **Update view.ts**
  - [ ] Import `initI18n` and `t` functions from i18n
  - [ ] Add `initI18n()` call at the beginning of execute method
  - [ ] Replace "OpenSpec Dashboard" title with `t()` call
  - [ ] Replace "Active Changes" and "Completed Changes" headers with `t()` calls
  - [ ] Replace "Specifications" header with `t()` call
  - [ ] Replace summary labels with `t()` calls
  - [ ] Replace error messages with `t()` calls

## Phase 4: Testing and Validation

- [ ] **Test English locale**
  - [ ] Test archive command in English environment
  - [ ] Test config command in English environment
  - [ ] Test list command in English environment
  - [ ] Test view command in English environment

- [ ] **Test Chinese locale**
  - [ ] Test archive command in Chinese environment
  - [ ] Test config command in Chinese environment
  - [ ] Test list command in Chinese environment
  - [ ] Test view command in Chinese environment

- [ ] **Build and validate**
  - [ ] Run `npm run build` to compile changes
  - [ ] Run `openspec validate` to ensure no regressions
  - [ ] Verify all commands work correctly with both locales