## ADDED Requirements
### Requirement: Multilingual Documentation Availability
The system SHALL provide Chinese and English versions of agent instructions and the project overview to improve accessibility for developers.

#### Scenario: Chinese AGENTS instructions available
- **WHEN** a developer requests AGENTS instructions in Chinese
- **THEN** a localized `openspec/AGENTS.zh.md` SHALL be present
- **AND** it SHALL be kept in sync with `openspec/AGENTS.md`

#### Scenario: Chinese project overview available
- **WHEN** a developer requests the project overview in Chinese
- **THEN** a localized `openspec/project.zh.md` SHALL be present
- **AND** it SHALL be kept in sync with `openspec/project.md`

#### Scenario: Language selection policy
- **WHEN** assistants communicate with developers
- **THEN** assistants default to the developer’s input language
- **AND** prefer Chinese when context is ambiguous