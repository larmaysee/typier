import { LanguageCode } from "@/enums/site-config";
import { KeyboardLayout, LayoutType, LayoutVariant, KeyMapping } from "../../domain/entities/keyboard-layout";
import { IKeyboardLayoutRepository } from "../../domain/interfaces/repositories";
import { ILayoutManagerService } from "../../domain/interfaces/services";
import { CustomLayoutCreationResponseDTO } from "../dto/keyboard-layouts.dto";

export interface CreateCustomLayoutCommandDTO {
  userId: string;
  baseLayoutId: string;
  name: string;
  displayName?: string;
  description?: string;
  keyboardModifications: Array<{
    key: string;
    newOutput: string;
    modifiers?: string[];
  }>;
}

export class CustomizeLayoutUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private layoutManagerService: ILayoutManagerService
  ) { }

  async execute(command: CreateCustomLayoutCommandDTO): Promise<CustomLayoutCreationResponseDTO> {
    try {
      // 1. Validate the base layout exists
      const baseLayout = await this.layoutRepository.getLayoutById(command.baseLayoutId);
      if (!baseLayout) {
        return {
          success: false,
          errors: [{ field: 'baseLayoutId', message: `Base layout not found: ${command.baseLayoutId}` }]
        };
      }

      // 2. Validate the command
      const validationResult = this.validateCommand(command);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors
        };
      }

      // 3. Create modified key mappings
      const modifiedKeyMappings = this.createModifiedKeyMappings(
        baseLayout.keyMappings,
        command.keyboardModifications
      );

      // 4. Create the custom layout
      const customLayout: KeyboardLayout = {
        id: this.generateCustomLayoutId(command.userId, command.name),
        name: command.name,
        displayName: command.displayName || command.name,
        language: baseLayout.language,
        layoutType: baseLayout.layoutType,
        variant: LayoutVariant.EXTENDED, // Custom layouts are typically extended variants
        keyMappings: modifiedKeyMappings,
        metadata: {
          ...baseLayout.metadata,
          author: command.userId,
          description: command.description || `Custom layout based on ${baseLayout.name}`,
          version: '1.0',
          popularity: 0 // New custom layout starts with 0 popularity
        },
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 5. Validate the resulting layout
      const layoutValidation = await this.layoutManagerService.validateLayout(customLayout);
      if (!layoutValidation.isValid) {
        return {
          success: false,
          errors: layoutValidation.errors.map(error => ({ field: 'layout', message: error })),
          warnings: layoutValidation.warnings
        };
      }

      // 6. Save the custom layout
      await this.layoutRepository.saveCustomLayout(customLayout);

      // 7. Set as user's preferred layout for this language
      await this.layoutRepository.setUserPreferredLayout(
        command.userId,
        customLayout.language,
        customLayout.id
      );

      return {
        success: true,
        layoutId: customLayout.id,
        layout: customLayout,
        warnings: layoutValidation.warnings
      };

    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: `Failed to create custom layout: ${error}` }]
      };
    }
  }

  async cloneLayout(userId: string, sourceLayoutId: string, newName: string): Promise<CustomLayoutCreationResponseDTO> {
    // Clone an existing layout as a starting point for customization
    const sourceLayout = await this.layoutRepository.getLayoutById(sourceLayoutId);
    if (!sourceLayout) {
      return {
        success: false,
        errors: [{ field: 'sourceLayoutId', message: `Source layout not found: ${sourceLayoutId}` }]
      };
    }

    return this.execute({
      userId,
      baseLayoutId: sourceLayoutId,
      name: newName,
      displayName: `${newName} (Cloned from ${sourceLayout.name})`,
      description: `Cloned from ${sourceLayout.name}`,
      keyboardModifications: [] // No modifications for a simple clone
    });
  }

  async updateCustomLayout(
    userId: string,
    layoutId: string,
    modifications: CreateCustomLayoutCommandDTO['keyboardModifications']
  ): Promise<CustomLayoutCreationResponseDTO> {
    // Update an existing custom layout
    const existingLayout = await this.layoutRepository.getLayoutById(layoutId);
    if (!existingLayout) {
      return {
        success: false,
        errors: [{ field: 'layoutId', message: `Layout not found: ${layoutId}` }]
      };
    }

    if (!existingLayout.isCustom) {
      return {
        success: false,
        errors: [{ field: 'layoutId', message: 'Cannot modify non-custom layout' }]
      };
    }

    if (existingLayout.metadata.author !== userId) {
      return {
        success: false,
        errors: [{ field: 'userId', message: 'Cannot modify layout created by another user' }]
      };
    }

    // Apply modifications to existing layout
    const modifiedKeyMappings = this.createModifiedKeyMappings(
      existingLayout.keyMappings,
      modifications
    );

    const updatedLayout: KeyboardLayout = {
      ...existingLayout,
      keyMappings: modifiedKeyMappings,
      updatedAt: new Date()
    };

    // Validate the updated layout
    const layoutValidation = await this.layoutManagerService.validateLayout(updatedLayout);
    if (!layoutValidation.isValid) {
      return {
        success: false,
        errors: layoutValidation.errors.map(error => ({ field: 'layout', message: error })),
        warnings: layoutValidation.warnings
      };
    }

    // Save the updated layout
    await this.layoutRepository.saveCustomLayout(updatedLayout);

    return {
      success: true,
      layoutId: updatedLayout.id,
      layout: updatedLayout,
      warnings: layoutValidation.warnings
    };
  }

  async deleteCustomLayout(userId: string, layoutId: string): Promise<{ success: boolean; error?: string }> {
    const layout = await this.layoutRepository.getLayoutById(layoutId);
    if (!layout) {
      return { success: false, error: `Layout not found: ${layoutId}` };
    }

    if (!layout.isCustom) {
      return { success: false, error: 'Cannot delete non-custom layout' };
    }

    if (layout.metadata.author !== userId) {
      return { success: false, error: 'Cannot delete layout created by another user' };
    }

    await this.layoutRepository.deleteCustomLayout(layoutId, userId);
    return { success: true };
  }

  private validateCommand(command: CreateCustomLayoutCommandDTO): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string }> = [];

    if (!command.name || command.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Layout name is required' });
    }

    if (command.name && command.name.length > 50) {
      errors.push({ field: 'name', message: 'Layout name must be 50 characters or less' });
    }

    if (!command.userId || command.userId.trim().length === 0) {
      errors.push({ field: 'userId', message: 'User ID is required' });
    }

    if (!Array.isArray(command.keyboardModifications)) {
      errors.push({ field: 'keyboardModifications', message: 'Keyboard modifications must be an array' });
    }

    // Validate individual modifications
    command.keyboardModifications.forEach((mod, index) => {
      if (!mod.key || mod.key.trim().length === 0) {
        errors.push({ field: `keyboardModifications[${index}].key`, message: 'Key is required' });
      }

      if (!mod.newOutput || mod.newOutput.trim().length === 0) {
        errors.push({ field: `keyboardModifications[${index}].newOutput`, message: 'New output is required' });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private createModifiedKeyMappings(
    baseKeyMappings: KeyMapping[],
    modifications: CreateCustomLayoutCommandDTO['keyboardModifications']
  ): KeyMapping[] {
    // Create a copy of the base key mappings
    const modifiedMappings = [...baseKeyMappings];

    // Apply each modification
    modifications.forEach(mod => {
      const existingIndex = modifiedMappings.findIndex(mapping => mapping.key === mod.key);

      if (existingIndex !== -1) {
        // Update existing key mapping
        modifiedMappings[existingIndex] = {
          ...modifiedMappings[existingIndex],
          outputChar: mod.newOutput,
          modifiers: mod.modifiers
        };
      } else {
        // Add new key mapping
        modifiedMappings.push({
          key: mod.key,
          outputChar: mod.newOutput,
          modifiers: mod.modifiers
        });
      }
    });

    return modifiedMappings;
  }

  private generateCustomLayoutId(userId: string, layoutName: string): string {
    const sanitizedName = layoutName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = Date.now();
    return `custom_${userId}_${sanitizedName}_${timestamp}`;
  }
}