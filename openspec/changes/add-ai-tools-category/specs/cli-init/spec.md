# CLI Init Specification Delta

## MODIFIED Requirements

### Requirement: AI Tool Configuration
The command SHALL configure AI coding assistants with OpenSpec instructions using a **categorized** grouped selection experience so teams can enable native integrations while always provisioning guidance for other assistants.

#### Scenario: Prompting for AI tool selection with categories
- **WHEN** run interactively
- **THEN** present a multi-select wizard that separates options into two headings based on tool categories:
  - **Natively supported providers** shows each available first-party integration with `category: 'native'` (Claude Code, Cursor, OpenCode, …) with checkboxes
  - **Other tools** shows tools with `category: 'other'` and explains that these provide universal compatibility for AGENTS-compatible assistants
- **AND** mark already configured native tools with "(already configured)" to signal that choosing them will refresh managed content
- **AND** keep disabled or unavailable providers labelled as "coming soon" so users know they cannot opt in yet
- **AND** allow confirming the selection even when no native provider is chosen because tools in the 'other' category remain enabled by default
- **AND** change the base prompt copy in extend mode to "Which natively supported AI tools would you like to add or refresh?"

## ADDED Requirements

### Requirement: AI Tool Categorization
The system SHALL categorize AI tools to distinguish between native integrations and universal compatibility tools.

#### Scenario: Defining tool categories
- **WHEN** AI tools are configured in the system
- **THEN** each tool SHALL have a `category` field with value either 'native' or 'other'
- **AND** tools with `category: 'native'` represent first-party integrations with specific configuration requirements
- **AND** tools with `category: 'other'` represent universal compatibility tools that work across multiple AI assistants

#### Scenario: Categorizing specific tools
- **WHEN** defining the AI tools array
- **THEN** 'Trae IDE' SHALL be assigned `category: 'other'`
- **AND** 'AGENTS.md (works with Amp, VS Code, …)' SHALL be assigned `category: 'other'` with `available: true`
- **AND** all other existing tools (Claude Code, Cursor, OpenCode, etc.) SHALL be assigned `category: 'native'`

### Requirement: UI Grouping by Category
The user interface SHALL group AI tools by their category to provide clear distinction between native and other tools.

#### Scenario: Displaying categorized tool groups
- **WHEN** presenting AI tool selection interface
- **THEN** group tools by category with descriptive headers:
  - "Natively supported providers" for `category: 'native'` tools
  - "Other tools" for `category: 'other'` tools
- **AND** provide explanatory text for 'other' category explaining universal compatibility
- **AND** maintain existing selection behavior within each category group

## Implementation Notes

This delta modifies the existing AI Tool Configuration requirement to support categorization while maintaining backward compatibility. The core functionality remains the same, with the addition of category-based grouping for improved user experience.

The categorization enables users to:
1. Quickly identify which tools have native, first-party support
2. Understand which tools provide universal compatibility across multiple AI assistants
3. Make informed decisions about tool selection based on their specific needs

## Affected Components

- `AIToolOption` interface: Add `category` field
- `AI_TOOLS` array: Update all entries with appropriate category values
- UI selection logic: Implement category-based grouping
- Tool configuration flow: Maintain existing behavior within category groups