import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { OPENSPEC_DIR_NAME } from './config.js';
import { ToolRegistry } from './configurators/registry.js';
import { SlashCommandRegistry } from './configurators/slash/registry.js';
import { agentsTemplate } from './templates/agents-template.js';
import { renderAgentsTemplateFromI18n } from './templates/i18n-renderers.js';
import { t, initI18n } from './i18n/index.js';

export class UpdateCommand {
  async execute(projectPath: string): Promise<void> {
    await initI18n();
    
    const resolvedProjectPath = path.resolve(projectPath);
    const openspecDirName = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(resolvedProjectPath, openspecDirName);

    // 1. Check openspec directory exists
    if (!await FileSystemUtils.directoryExists(openspecPath)) {
      throw new Error(t('update:errors.noOpenSpecDirectory'));
    }

    // 2. Update AGENTS.md (full replacement)
    const agentsPath = path.join(openspecPath, 'AGENTS.md');

    const agentsContent = renderAgentsTemplateFromI18n() ?? agentsTemplate;
    await FileSystemUtils.writeFile(agentsPath, agentsContent);

    // 3. Update existing AI tool configuration files only
    const configurators = ToolRegistry.getAll();
    const slashConfigurators = SlashCommandRegistry.getAll();
    const updatedFiles: string[] = [];
    const createdFiles: string[] = [];
    const failedFiles: string[] = [];
    const updatedSlashFiles: string[] = [];
    const failedSlashTools: string[] = [];

    for (const configurator of configurators) {
      const configFilePath = path.join(
        resolvedProjectPath,
        configurator.configFileName
      );
      const fileExists = await FileSystemUtils.fileExists(configFilePath);
      const shouldConfigure =
        fileExists || configurator.configFileName === 'AGENTS.md';

      if (!shouldConfigure) {
        continue;
      }

      try {
        if (fileExists && !await FileSystemUtils.canWriteFile(configFilePath)) {
          throw new Error(
            t('update:errors.insufficientPermissions', { fileName: configurator.configFileName })
          );
        }

        await configurator.configure(resolvedProjectPath, openspecPath);
        updatedFiles.push(configurator.configFileName);

        if (!fileExists) {
          createdFiles.push(configurator.configFileName);
        }
      } catch (error) {
        failedFiles.push(configurator.configFileName);
        console.error(
          t('update:errors.updateFailed', {
            fileName: configurator.configFileName,
            error: error instanceof Error ? error.message : String(error)
          })
        );
      }
    }

    for (const slashConfigurator of slashConfigurators) {
      if (!slashConfigurator.isAvailable) {
        continue;
      }

      try {
        const updated = await slashConfigurator.updateExisting(
          resolvedProjectPath,
          openspecPath
        );
        updatedSlashFiles.push(...updated);
      } catch (error) {
        failedSlashTools.push(slashConfigurator.toolId);
        console.error(
          t('update:errors.slashCommandUpdateFailed', {
            toolId: slashConfigurator.toolId,
            error: error instanceof Error ? error.message : String(error)
          })
        );
      }
    }

    const summaryParts: string[] = [];
    const instructionFiles: string[] = [t('update:files.openspecAgents')];

    if (updatedFiles.includes('AGENTS.md')) {
      instructionFiles.push(
        createdFiles.includes('AGENTS.md') ? t('update:files.agentsCreated') : t('update:files.agents')
      );
    }

    summaryParts.push(
      t('update:success.updatedInstructions', { files: instructionFiles.join(', ') })
    );

    const aiToolFiles = updatedFiles.filter((file) => file !== 'AGENTS.md');
    if (aiToolFiles.length > 0) {
      summaryParts.push(t('update:success.updatedAiToolFiles', { files: aiToolFiles.join(', ') }));
    }

    if (updatedSlashFiles.length > 0) {
      // Normalize to forward slashes for cross-platform log consistency
      const normalized = updatedSlashFiles.map((p) => p.replace(/\\/g, '/'));
      summaryParts.push(t('update:success.updatedSlashCommands', { files: normalized.join('\n  ') }));
    }

    const failedItems = [
      ...failedFiles,
      ...failedSlashTools.map(
        (toolId) => t('update:slashCommands.refreshLabel', { toolId })
      ),
    ];

    if (failedItems.length > 0) {
      summaryParts.push(t('update:success.failedToUpdate', { items: failedItems.join(', ') }));
    }

    console.log(summaryParts.join('\n'));

    // No additional notes
  }
}
