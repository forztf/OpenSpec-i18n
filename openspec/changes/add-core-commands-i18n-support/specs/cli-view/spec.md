# CLI View Command i18n Support Delta

## ADDED Requirements

### Requirement: Internationalization Support

The view command SHALL support multiple languages based on the user's system locale.

#### Scenario: Language detection and initialization

- **WHEN** the view command is executed
- **THEN** detect the system locale (zh-CN, en-US, etc.)
- **AND** initialize the i18n system with appropriate language
- **AND** load the corresponding translation files

#### Scenario: Localized dashboard headers

- **WHEN** displaying the OpenSpec dashboard
- **THEN** show the main title and section headers in the user's preferred language
- **AND** maintain consistent formatting and visual hierarchy
- **AND** preserve the dashboard layout and structure

#### Scenario: Localized summary metrics

- **WHEN** showing summary information (active changes, completed changes, specs)
- **THEN** display metric labels in the user's preferred language
- **AND** maintain numerical accuracy and formatting
- **AND** use appropriate status indicators and colors

#### Scenario: Localized change status

- **WHEN** displaying change information and progress
- **THEN** show status labels and descriptions in the user's preferred language
- **AND** maintain progress bar functionality and visual indicators
- **AND** preserve percentage calculations and display

#### Scenario: Localized error messages

- **WHEN** displaying error messages or warnings
- **THEN** show error text in the user's preferred language
- **AND** provide clear guidance for error resolution
- **AND** maintain technical accuracy in translations

## Translation Files Required

- `src/core/i18n/en/view.json` - English translations
- `src/core/i18n/zh/view.json` - Chinese translations

## Implementation Notes

- Follow the same i18n pattern established in `update.ts`
- Use `initI18n()` at the start of the execute method
- Replace all hardcoded strings with `t()` function calls
- Maintain backward compatibility with existing functionality
- Preserve existing dashboard formatting, colors, and visual elements
- Ensure progress bars and status indicators remain functional