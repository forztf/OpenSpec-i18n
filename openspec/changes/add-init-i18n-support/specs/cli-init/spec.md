# CLI Init Specification Changes

## ADDED Requirements

### Requirement: Multi-language Support

The command SHALL support multiple languages for user interface text to provide localized experience.

#### Scenario: Language Detection and Selection

- **WHEN** the command is executed
- **THEN** automatically detect the system language
- **AND** use English as default if system language is not supported
- **AND** support Chinese (zh) and English (en) languages
- **AND** display all user interface text in the selected language

#### Scenario: Localized User Interface

- **WHEN** displaying interactive prompts and messages
- **THEN** use localized text for:
  - Progress indicators and spinner messages
  - Tool selection wizard headings and instructions
  - Success and error messages
  - Navigation instructions (Space to toggle, Enter to select)
  - Confirmation prompts and review screens

#### Scenario: Resource File Structure

- **WHEN** initializing i18n support
- **THEN** load language resources from `src/core/i18n/{language}/init.json`
- **AND** use consistent key naming convention (e.g., `init.wizard.intro.title`)
- **AND** fallback to English if translation key is missing

## MODIFIED Requirements

### Requirement: Interactive Mode (Enhanced)

The command SHALL provide an interactive menu for AI tool selection with clear navigation instructions in the user's preferred language.

#### Scenario: Displaying interactive menu (Enhanced)

- **WHEN** run in fresh or extend mode
- **THEN** present a looping select menu with localized text
- **AND** display navigation instructions in the selected language
- **AND** show tool status labels ("already configured", "coming soon") in localized text
- **AND** use localized prompt copy for extend mode

### Requirement: Success Output (Enhanced)

The command SHALL provide clear, actionable next steps in the user's preferred language upon successful initialization.

#### Scenario: Displaying success message (Enhanced)

- **WHEN** initialization completes successfully
- **THEN** display success message and next steps in the selected language
- **AND** include localized prompt for explaining OpenSpec workflow