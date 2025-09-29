import { KeyboardLayout } from '@/domain/entities/keyboard-layout';
import { IKeyboardLayoutRepository, IUserRepository } from '@/domain/interfaces/repositories';
import { GetLayoutsQuery } from '@/application/queries/typing.queries';
import { AvailableLayoutsDto, KeyboardLayoutDto } from '@/application/dto/keyboard-layout.dto';

export class GetAvailableLayoutsUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(query: GetLayoutsQuery): Promise<AvailableLayoutsDto> {
    const { language, userId } = query;

    // 1. Get all available layouts for the language
    const allLayouts = await this.layoutRepository.getAvailableLayouts(language);

    if (allLayouts.length === 0) {
      throw new Error(`No layouts available for language: ${language}`);
    }

    // 2. Get user's preferred layout if user is provided
    let preferredLayoutId: string | null = null;
    if (userId) {
      try {
        preferredLayoutId = await this.layoutRepository.getUserPreferredLayout(userId, language);
      } catch (error) {
        // Continue without preferred layout if user not found or no preference set
        console.warn(`Could not get preferred layout for user ${userId}: ${error}`);
      }
    }

    // 3. Sort layouts: preferred first, then by popularity, then by name
    const sortedLayouts = this.sortLayoutsByPreference(allLayouts, preferredLayoutId);

    // 4. Determine default layout (first non-custom layout or first layout)
    const defaultLayoutId = this.determineDefaultLayout(sortedLayouts);

    // 5. Map to DTOs
    const layoutDtos = sortedLayouts.map(layout => this.mapLayoutToDto(layout));

    return {
      layouts: layoutDtos,
      preferredLayoutId,
      defaultLayoutId
    };
  }

  private sortLayoutsByPreference(layouts: KeyboardLayout[], preferredLayoutId: string | null): KeyboardLayout[] {
    return layouts.sort((a, b) => {
      // 1. Preferred layout first
      if (preferredLayoutId) {
        if (a.id === preferredLayoutId) return -1;
        if (b.id === preferredLayoutId) return 1;
      }

      // 2. Non-custom layouts before custom ones
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? 1 : -1;
      }

      // 3. Sort by popularity (higher first)
      if (a.metadata.popularity !== b.metadata.popularity) {
        return b.metadata.popularity - a.metadata.popularity;
      }

      // 4. Sort by difficulty (easier first)
      if (a.metadata.difficulty !== b.metadata.difficulty) {
        return a.metadata.difficulty - b.metadata.difficulty;
      }

      // 5. Sort alphabetically by display name
      return a.displayName.localeCompare(b.displayName);
    });
  }

  private determineDefaultLayout(layouts: KeyboardLayout[]): string {
    // First, try to find a non-custom layout
    const nonCustomLayout = layouts.find(layout => !layout.isCustom);
    if (nonCustomLayout) {
      return nonCustomLayout.id;
    }

    // Fall back to first layout if all are custom
    return layouts[0].id;
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