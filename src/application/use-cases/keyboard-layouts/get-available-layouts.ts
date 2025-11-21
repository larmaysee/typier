import { LayoutsResponseDTO } from "@/application/dto/keyboard-layouts.dto";
import { GetAvailableLayoutsQueryDTO } from "@/application/dto/queries.dto";
import { LanguageCode, LayoutVariant } from "@/domain";
import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { IKeyboardLayoutRepository, IUserRepository } from "@/domain/interfaces/repositories";

export class GetAvailableLayoutsUseCase {
  constructor(private layoutRepository: IKeyboardLayoutRepository, private userRepository: IUserRepository) {}

  async execute(query: GetAvailableLayoutsQueryDTO): Promise<LayoutsResponseDTO> {
    const { language, userId, includeCustom = true } = query;

    // 1. Get all available layouts for the language
    const allLayouts = await this.layoutRepository.getAvailableLayouts(language);

    if (allLayouts.length === 0) {
      throw new Error(`No keyboard layouts available for language: ${language}`);
    }

    // 2. Get user's preferred layout if user is authenticated
    let preferredLayoutId: string | null = null;
    if (userId) {
      preferredLayoutId = await this.layoutRepository.getUserPreferredLayout(userId, language);
    }

    // 3. Get user-specific statistics for layouts (if available)
    const layoutStats = userId ? await this.getUserLayoutStats() : new Map();

    // 4. Process and enrich layout information
    const enrichedLayouts = allLayouts.map((layout) => {
      const userStats = layoutStats.get(layout.id);
      const isRecommended = this.isLayoutRecommended(layout, userStats);

      return {
        id: layout.id,
        name: layout.name,
        displayName: layout.displayName,
        language: layout.language,
        variant: typeof layout.variant === "string" ? layout.variant : (String(layout.variant) as LayoutVariant),
        isCustom: layout.isCustom,
        popularity: layout.metadata.popularity,
        isRecommended,
        userTestsCount: userStats?.testsCount || 0,
        userAverageWpm: userStats?.averageWpm,
        userAverageAccuracy: userStats?.averageAccuracy,
      };
    });

    // 5. Sort layouts by preference and popularity
    const sortedLayouts = this.sortLayoutsByPreference(enrichedLayouts, preferredLayoutId);

    // 6. Filter out custom layouts if not requested
    const filteredLayouts = includeCustom ? sortedLayouts : sortedLayouts.filter((layout) => !layout.isCustom);

    // 7. Determine default layout
    const defaultLayoutId = this.getDefaultLayoutForLanguage(language, allLayouts);

    // 8. Count custom layouts
    const customLayoutsCount = sortedLayouts.filter((layout) => layout.isCustom).length;

    return {
      layouts: filteredLayouts,
      preferredLayoutId,
      defaultLayoutId,
      customLayoutsCount,
    };
  }

  private async getUserLayoutStats(): Promise<
    Map<
      string,
      {
        testsCount: number;
        averageWpm: number;
        averageAccuracy: number;
      }
    >
  > {
    // In a real implementation, this would fetch user's typing test history
    // and calculate statistics per layout
    // For now, return empty map
    return new Map();
  }

  private isLayoutRecommended(
    layout: KeyboardLayout,
    userStats?: { testsCount: number; averageWpm: number; averageAccuracy: number }
  ): boolean {
    // Recommend layouts based on various criteria
    const popularityThreshold = 70;
    const isPopular = layout.metadata.popularity >= popularityThreshold;

    // If user has stats with this layout, consider their performance
    if (userStats && userStats.testsCount >= 5) {
      const hasGoodPerformance = userStats.averageWpm >= 40 && userStats.averageAccuracy >= 90;
      return hasGoodPerformance;
    }

    // For new users, recommend popular, standard layouts
    const isStandardLayout = !layout.isCustom && layout.variant === LayoutVariant.US;

    return isPopular || isStandardLayout;
  }

  private sortLayoutsByPreference(
    layouts: Array<{
      id: string;
      name: string;
      displayName: string;
      language: LanguageCode;
      variant: LayoutVariant;
      isCustom: boolean;
      popularity: number;
      isRecommended: boolean;
      userTestsCount: number;
      userAverageWpm?: number;
      userAverageAccuracy?: number;
    }>,
    preferredLayoutId: string | null
  ): Array<{
    id: string;
    name: string;
    displayName: string;
    language: LanguageCode;
    variant: LayoutVariant;
    isCustom: boolean;
    popularity: number;
    isRecommended: boolean;
    userTestsCount: number;
    userAverageWpm?: number;
    userAverageAccuracy?: number;
  }> {
    return layouts.sort((a, b) => {
      // 1. Preferred layout comes first
      if (preferredLayoutId) {
        if (a.id === preferredLayoutId) return -1;
        if (b.id === preferredLayoutId) return 1;
      }

      // 2. Recommended layouts come next
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;

      // 3. Layouts with user experience come next
      if (a.userTestsCount > 0 && b.userTestsCount === 0) return -1;
      if (a.userTestsCount === 0 && b.userTestsCount > 0) return 1;

      // 4. Sort by popularity
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity;
      }

      // 5. Alphabetical order as fallback
      return a.name.localeCompare(b.name);
    });
  }

  private getDefaultLayoutForLanguage(language: LanguageCode, layouts: KeyboardLayout[]): string {
    // Define default layouts for each language
    const defaults = {
      [LanguageCode.EN]: "qwerty_us",
      [LanguageCode.LI]: "lisu_sil_basic",
      [LanguageCode.MY]: "myanmar3",
    };

    const defaultLayoutName = defaults[language];
    const defaultLayout = layouts.find(
      (layout) => layout.id === defaultLayoutName || layout.name.toLowerCase().includes(defaultLayoutName)
    );

    return defaultLayout?.id || layouts[0]?.id || "";
  }
}
