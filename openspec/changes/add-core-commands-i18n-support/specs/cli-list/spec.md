# CLI List Command i18n Support Delta

## ADDED Requirements

### Requirement: Internationalization Support

The list command SHALL support multiple languages based on the user's system locale.

#### Scenario: Language detection and initialization

- **WHEN** the list command is executed
- **THEN** detect the system locale (zh-CN, en-US, etc.)
- **AND** initialize the i18n system with appropriate language
- **AND** load the corresponding translation files

#### Scenario: Localized output headers

- **WHEN** displaying changes or specs lists
- **THEN** show headers ("Changes:", "Specs:") in the user's preferred language
- **AND** maintain consistent formatting and alignment
- **AND** preserve the same information structure

#### Scenario: Localized status messages

- **WHEN** showing status information (task counts, completion status)
- **THEN** display status text in the user's preferred language
- **AND** maintain numerical accuracy and formatting
- **AND** use appropriate status indicators

#### Scenario: Localized error messages

- **WHEN** displaying error messages or warnings
- **THEN** show error text in the user's preferred language
- **AND** provide clear guidance for error resolution
- **AND** maintain technical accuracy in translations

## Translation Files Required

- `src/core/i18n/en/list.json` - English translations
- `src/core/i18n/zh/list.json` - Chinese translations

## Implementation Notes

- Follow the same i18n pattern established in `update.ts`
- Use `initI18n()` at the start of the execute method
- Replace all hardcoded strings with `t()` function calls
- Maintain backward compatibility with existing functionality
- Preserve existing output formatting and structure