# CLI Archive Command i18n Support Delta

## ADDED Requirements

### Requirement: Internationalization Support

The archive command SHALL support multiple languages based on the user's system locale.

#### Scenario: Language detection and initialization

- **WHEN** the archive command is executed
- **THEN** detect the system locale (zh-CN, en-US, etc.)
- **AND** initialize the i18n system with appropriate language
- **AND** load the corresponding translation files

#### Scenario: Localized user messages

- **WHEN** displaying any user-facing messages
- **THEN** use translated text from the appropriate locale file
- **AND** support both English and Chinese languages
- **AND** fall back to English if translation is missing

#### Scenario: Localized prompts and confirmations

- **WHEN** showing interactive prompts or confirmations
- **THEN** display prompts in the user's preferred language
- **AND** maintain consistent terminology across all messages
- **AND** preserve the same functionality regardless of language

#### Scenario: Localized error messages

- **WHEN** displaying error messages or warnings
- **THEN** show error text in the user's preferred language
- **AND** maintain technical accuracy in translations
- **AND** provide clear guidance for error resolution

## Translation Files Required

- `src/core/i18n/en/archive.json` - English translations
- `src/core/i18n/zh/archive.json` - Chinese translations

## Implementation Notes

- Follow the same i18n pattern established in `update.ts`
- Use `initI18n()` at the start of the execute method
- Replace all hardcoded strings with `t()` function calls
- Maintain backward compatibility with existing functionality