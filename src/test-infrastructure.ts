/**
 * Simple test to validate infrastructure services
 */

import { LayoutManagerService } from "@/infrastructure/services/keyboard-layouts/layout-manager.service";
import { TextGeneratorService } from "@/infrastructure/services/text-generation/text-generator.service";
import { DifficultyLevel, LanguageCode, TextType } from "./domain";

export async function testInfrastructureServices() {
  console.log("🧪 Testing Infrastructure Services...\n");

  try {
    // Test Text Generation Service
    console.log("📝 Testing Text Generation Service...");
    const textService = new TextGeneratorService();

    const englishText = await textService.generate({
      language: LanguageCode.EN,
      difficulty: DifficultyLevel.MEDIUM,
      textType: TextType.WORDS,
      length: 10,
    });

    console.log("✅ English text generated:", englishText.content.substring(0, 50) + "...");
    console.log("   Word count:", englishText.metadata.wordCount);

    // Test Lisu text generation
    const lisuText = await textService.generate({
      language: LanguageCode.LI,
      difficulty: DifficultyLevel.EASY,
      textType: TextType.CHARS,
      length: 20,
    });

    console.log("✅ Lisu text generated:", lisuText.content.substring(0, 30) + "...");
    console.log("   Character count:", lisuText.metadata.characterCount);

    // Test Layout Manager Service
    console.log("\n⌨️  Testing Layout Manager Service...");
    const layoutService = new LayoutManagerService();

    const englishLayouts = await layoutService.getLayoutsForLanguage(LanguageCode.EN);
    console.log("✅ English layouts found:", englishLayouts.length);
    console.log("   Layout names:", englishLayouts.map((l) => l.name).join(", "));

    const lisuLayouts = await layoutService.getLayoutsForLanguage(LanguageCode.LI);
    console.log("✅ Lisu layouts found:", lisuLayouts.length);
    console.log("   Layout names:", lisuLayouts.map((l) => l.name).join(", "));

    const myanmarLayouts = await layoutService.getLayoutsForLanguage(LanguageCode.MY);
    console.log("✅ Myanmar layouts found:", myanmarLayouts.length);
    console.log("   Layout names:", myanmarLayouts.map((l) => l.name).join(", "));

    // Test layout validation
    const qwertyLayout = await layoutService.getLayoutById("en-qwerty-us");
    if (qwertyLayout) {
      const validation = await layoutService.validateLayout(qwertyLayout);
      console.log("✅ Layout validation result:", validation.isValid ? "Valid" : "Invalid");
    }

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

// Export for use in other files
export default testInfrastructureServices;
