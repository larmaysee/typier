import { LanguageCode } from "@/domain";
import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { LayoutVariant } from "@/domain/enums/keyboard-layouts";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { IKeyboardLayoutRepository } from "@/domain/interfaces/repositories";

export interface ExportLayoutCommand {
  layoutId: string;
  userId: string;
  includeMetadata?: boolean;
  format?: "json" | "xml" | "yaml";
}

export interface ImportLayoutCommand {
  layoutData: string;
  userId: string;
  format?: "json" | "xml" | "yaml";
  newName?: string;
  makePublic?: boolean;
}

export interface ExportLayoutResult {
  exportData: string;
  fileName: string;
  format: string;
  layout: KeyboardLayout;
}

export interface ImportLayoutResult {
  layout: KeyboardLayout;
  warnings: string[];
  originalLayout?: Partial<KeyboardLayout>;
}

export class ExportImportLayoutUseCase {
  constructor(private keyboardLayoutRepository: IKeyboardLayoutRepository) {}

  async exportLayout(command: ExportLayoutCommand): Promise<ExportLayoutResult> {
    const layout = await this.keyboardLayoutRepository.findById(command.layoutId);

    if (!layout) {
      throw new Error("Layout not found");
    }

    // Check if user has permission to export
    if (layout.createdBy !== command.userId && !layout.isPublic) {
      throw new Error("Permission denied: Cannot export private layout of another user");
    }

    const format = command.format || "json";
    const exportData = await this.serializeLayout(layout, format, command.includeMetadata);
    const fileName = this.generateExportFileName(layout, format);

    return {
      exportData,
      fileName,
      format,
      layout,
    };
  }

  async importLayout(command: ImportLayoutCommand): Promise<ImportLayoutResult> {
    const format = command.format || "json";
    const warnings: string[] = [];

    // Parse the layout data
    const parsedLayout = await this.parseLayoutData(command.layoutData, format);

    // Validate the parsed layout
    const validationResult = this.validateImportedLayout(parsedLayout);
    warnings.push(...validationResult.warnings);

    if (validationResult.hasErrors) {
      throw new Error(`Import validation failed: ${validationResult.errors.join(", ")}`);
    }

    // Create new layout from imported data
    const now = Date.now();
    const layoutName = command.newName || parsedLayout.name || "Imported Layout";

    const layout = KeyboardLayout.create({
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: layoutName,
      displayName: layoutName,
      language: parsedLayout.language || LanguageCode.EN,
      variant: parsedLayout.variant || LayoutVariant.US,
      keyMappings: parsedLayout.keyMappings || [],
      metadata: {
        description: `Imported layout: ${layoutName}`,
        author: command.userId,
        version: "1.0.0",
        compatibility: parsedLayout.metadata?.compatibility || ["desktop"],
        tags: [...(parsedLayout.metadata?.tags || []), "imported"],
        difficulty: parsedLayout.metadata?.difficulty || DifficultyLevel.MEDIUM,
        popularity: 0,
        dateCreated: now,
        lastModified: now,
      },
      isCustom: true,
      isPublic: command.makePublic || false,
      createdBy: command.userId,
      createdAt: now,
      updatedAt: now,
    });

    // Save the layout - use proper repository method
    await this.keyboardLayoutRepository.saveCustomLayout(layout);

    return {
      layout,
      warnings,
      originalLayout: parsedLayout,
    };
  }

  private async serializeLayout(layout: KeyboardLayout, format: string, includeMetadata = true): Promise<string> {
    const exportObject: any = {
      name: layout.name,
      displayName: layout.displayName,
      language: layout.language,
      variant: layout.variant,
      keyMappings: layout.keyMappings,
      isCustom: layout.isCustom,
    };

    if (includeMetadata && layout.metadata) {
      exportObject.metadata = layout.metadata;
      exportObject.exportedAt = new Date().toISOString();
      exportObject.exportedBy = layout.createdBy;
    }

    switch (format.toLowerCase()) {
      case "json":
        return JSON.stringify(exportObject, null, 2);

      case "xml":
        return this.convertToXML(exportObject);

      case "yaml":
        return this.convertToYAML(exportObject);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async parseLayoutData(layoutData: string, format: string): Promise<Partial<KeyboardLayout>> {
    try {
      switch (format.toLowerCase()) {
        case "json":
          return JSON.parse(layoutData);

        case "xml":
          return this.parseXML(layoutData);

        case "yaml":
          return this.parseYAML(layoutData);

        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${format} data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private validateImportedLayout(layout: Partial<KeyboardLayout>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!layout.name) errors.push("Layout name is required");
    if (!layout.language) errors.push("Layout language is required");
    if (!layout.keyMappings || layout.keyMappings.length === 0) {
      errors.push("Key mappings are required");
    }

    // Validate key mappings structure
    if (layout.keyMappings) {
      layout.keyMappings.forEach((mapping, index) => {
        if (!mapping.key) {
          errors.push(`Key mapping at index ${index} is missing key value`);
        }
        if (!mapping.position) {
          errors.push(`Key mapping at index ${index} is missing position data`);
        }
      });
    }

    // Warnings for missing optional data
    if (!layout.displayName) {
      warnings.push("Display name not provided, will use layout name");
    }
    if (!layout.metadata) {
      warnings.push("No metadata found in imported layout");
    }

    return {
      hasErrors: errors.length > 0,
      errors,
      warnings,
    };
  }

  private generateExportFileName(layout: KeyboardLayout, format: string): string {
    const cleanName = layout.displayName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `${cleanName}-${timestamp}.${format}`;
  }

  private generateImportedLayoutName(
    parsedLayout: Partial<KeyboardLayout>,
    customName: string | undefined,
    userId: string
  ): string {
    const baseName = customName || parsedLayout.displayName || parsedLayout.name || "imported-layout";
    const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const timestamp = Date.now();
    return `imported-${userId}-${cleanName}-${timestamp}`;
  }

  private convertToXML(obj: any): string {
    // Simple XML conversion - in production, use a proper XML library
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<layout>\n';

    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        xml += `  <${key}>\n`;
        value.forEach((item, index) => {
          xml += `    <item index="${index}">\n`;
          if (typeof item === "object") {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              xml += `      <${itemKey}>${this.escapeXML(String(itemValue))}</${itemKey}>\n`;
            });
          } else {
            xml += `      ${this.escapeXML(String(item))}\n`;
          }
          xml += `    </item>\n`;
        });
        xml += `  </${key}>\n`;
      } else if (typeof value === "object" && value !== null) {
        xml += `  <${key}>\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          xml += `    <${subKey}>${this.escapeXML(String(subValue))}</${subKey}>\n`;
        });
        xml += `  </${key}>\n`;
      } else {
        xml += `  <${key}>${this.escapeXML(String(value))}</${key}>\n`;
      }
    });

    xml += "</layout>";
    return xml;
  }

  private convertToYAML(obj: any): string {
    // Simple YAML conversion - in production, use a proper YAML library
    const yamlLines: string[] = [];

    const convertValue = (value: any, indent = 0): string => {
      const indentStr = "  ".repeat(indent);

      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (typeof item === "object") {
              const itemLines = Object.entries(item).map(
                ([k, v]) =>
                  `${indentStr}  ${k}: ${typeof v === "object" ? "\n" + convertValue(v, indent + 2) : String(v)}`
              );
              return `${indentStr}- \n${itemLines.join("\n")}`;
            }
            return `${indentStr}- ${item}`;
          })
          .join("\n");
      } else if (typeof value === "object") {
        return Object.entries(value)
          .map(
            ([k, v]) => `${indentStr}${k}: ${typeof v === "object" ? "\n" + convertValue(v, indent + 1) : String(v)}`
          )
          .join("\n");
      }

      return String(value);
    };

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object") {
        yamlLines.push(`${key}:`);
        yamlLines.push(convertValue(value, 1));
      } else {
        yamlLines.push(`${key}: ${value}`);
      }
    });

    return yamlLines.join("\n");
  }

  private parseXML(xmlData: string): Partial<KeyboardLayout> {
    // Simple XML parsing - in production, use a proper XML parser
    throw new Error("XML import not fully implemented - use JSON format");
  }

  private parseYAML(yamlData: string): Partial<KeyboardLayout> {
    // Simple YAML parsing - in production, use a proper YAML parser
    throw new Error("YAML import not fully implemented - use JSON format");
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

interface ValidationResult {
  hasErrors: boolean;
  errors: string[];
  warnings: string[];
}
