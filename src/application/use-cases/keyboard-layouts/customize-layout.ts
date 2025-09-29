import { KeyboardLayout, LayoutVariant, FingerAssignment } from '@/domain/entities/keyboard-layout';
import { IKeyboardLayoutRepository } from '@/domain/interfaces/repositories';
import { ILayoutManagerService } from '@/domain/interfaces/services';
import { CreateCustomLayoutCommand } from '@/application/commands/layout.commands';
import { KeyboardLayoutDto } from '@/application/dto/keyboard-layout.dto';

export class CustomizeLayoutUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private layoutManager: ILayoutManagerService
  ) {}

  async execute(command: CreateCustomLayoutCommand): Promise<KeyboardLayoutDto> {
    const { userId, name, displayName, language, layoutType, baseLayoutId, keyMappings, metadata } = command;

    // 1. Validate user exists and has permissions
    if (!userId || userId === 'anonymous') {
      throw new Error('User must be authenticated to create custom layouts');
    }

    // 2. Validate layout name is unique for this user
    await this.validateLayoutNameUnique(userId, name);

    // 3. Get base layout if specified
    let baseLayout: KeyboardLayout | null = null;
    if (baseLayoutId) {
      baseLayout = await this.layoutRepository.findById(baseLayoutId);
      if (!baseLayout) {
        throw new Error(`Base layout not found: ${baseLayoutId}`);
      }
      
      // Validate language compatibility
      if (baseLayout.language !== language) {
        throw new Error('Base layout language must match new layout language');
      }
    }

    // 4. Create layout entity
    const customLayout: KeyboardLayout = {
      id: this.generateLayoutId(userId, name),
      name,
      displayName,
      language,
      layoutType,
      variant: LayoutVariant.CUSTOM,
      keyMappings: this.buildKeyMappings(keyMappings, baseLayout),
      metadata: {
        description: metadata.description,
        author: metadata.author,
        version: '1.0.0',
        compatibility: ['Web', 'Custom'],
        tags: ['custom', 'user-created'],
        difficulty: this.calculateLayoutDifficulty(keyMappings),
        popularity: 0
      },
      isCustom: true,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // 5. Validate the created layout
    const validationResult = await this.layoutManager.validateLayout(customLayout);
    if (!validationResult.isValid) {
      throw new Error(`Invalid layout: ${validationResult.errors.join(', ')}`);
    }

    // 6. Save the custom layout
    await this.layoutRepository.saveCustomLayout(customLayout);

    return this.mapLayoutToDto(customLayout);
  }

  private async validateLayoutNameUnique(userId: string, name: string): Promise<void> {
    const existingLayouts = await this.layoutRepository.getCustomLayouts(userId);
    const nameExists = existingLayouts.some(layout => 
      layout.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameExists) {
      throw new Error(`Layout name '${name}' already exists for this user`);
    }
  }

  private generateLayoutId(userId: string, name: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const userPrefix = userId.substring(0, 8);
    const timestamp = Date.now().toString(36);
    
    return `custom_${userPrefix}_${cleanName}_${timestamp}`;
  }

  private buildKeyMappings(customMappings: Array<{
    key: string;
    character: string;
    shiftCharacter?: string;
    altCharacter?: string;
  }>, baseLayout: KeyboardLayout | null) {
    // Start with base layout mappings if available
    const keyMappings = baseLayout ? [...baseLayout.keyMappings] : [];

    // Apply custom mappings
    for (const customMapping of customMappings) {
      const existingIndex = keyMappings.findIndex(mapping => mapping.key === customMapping.key);
      
      if (existingIndex >= 0) {
        // Update existing mapping
        keyMappings[existingIndex] = {
          ...keyMappings[existingIndex],
          character: customMapping.character,
          shiftCharacter: customMapping.shiftCharacter,
          altCharacter: customMapping.altCharacter
        };
      } else {
        // Add new mapping (need to infer position)
        keyMappings.push({
          key: customMapping.key,
          character: customMapping.character,
          shiftCharacter: customMapping.shiftCharacter,
          altCharacter: customMapping.altCharacter,
          position: this.inferKeyPosition(customMapping.key)
        });
      }
    }

    return keyMappings;
  }

  private inferKeyPosition(key: string) {
    // Basic QWERTY position mapping - in a real implementation this would be more sophisticated
    const qwertyRows = [
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ];

    for (let row = 0; row < qwertyRows.length; row++) {
      const column = qwertyRows[row].indexOf(key.toLowerCase());
      if (column >= 0) {
        return {
          row,
          column,
          finger: this.determineFingerAssignment(row, column),
          hand: (column < qwertyRows[row].length / 2 ? 'left' : 'right') as 'left' | 'right'
        };
      }
    }

    // Default position for unknown keys
    return {
      row: 0,
      column: 0,
      finger: 'index' as FingerAssignment,
      hand: 'left' as 'left' | 'right'
    };
  }

  private determineFingerAssignment(row: number, column: number): FingerAssignment {
    // Simplified finger assignment logic
    if (column <= 1) return 'pinky';
    if (column <= 3) return 'ring';
    if (column <= 4) return 'middle';
    if (column <= 6) return 'index';
    if (column <= 7) return 'index';
    if (column <= 8) return 'middle';
    if (column <= 9) return 'ring';
    return 'pinky';
  }

  private calculateLayoutDifficulty(keyMappings: Array<{
    key: string;
    character: string;
    shiftCharacter?: string;
    altCharacter?: string;
  }>): number {
    // Calculate difficulty based on character complexity and layout ergonomics
    let complexityScore = 0;
    
    for (const mapping of keyMappings) {
      const char = mapping.character;
      
      // Add complexity for non-ASCII characters
      if (char && char.charCodeAt(0) > 127) {
        complexityScore += 2;
      }
      
      // Add complexity for characters requiring modifiers
      if (mapping.shiftCharacter || mapping.altCharacter) {
        complexityScore += 1;
      }
    }

    // Normalize to 1-10 scale
    const maxScore = keyMappings.length * 3;
    return Math.min(10, Math.max(1, Math.round((complexityScore / maxScore) * 10)));
  }

  private mapLayoutToDto(layout: KeyboardLayout): KeyboardLayoutDto {
    return {
      id: layout.id,
      name: layout.name,
      displayName: layout.displayName,
      language: layout.language,
      layoutType: layout.layoutType,
      variant: layout.variant,
      isCustom: layout.isCustom,
      metadata: {
        description: layout.metadata.description,
        author: layout.metadata.author,
        version: layout.metadata.version,
        compatibility: layout.metadata.compatibility,
        tags: layout.metadata.tags,
        difficulty: layout.metadata.difficulty,
        popularity: layout.metadata.popularity
      },
      createdBy: layout.createdBy
    };
  }
}