import { Query } from "appwrite";
import { LanguageCode } from "@/enums/site-config";
import { IKeyboardLayoutRepository } from "@/domain/interfaces";
import { KeyboardLayout } from "@/domain/entities";
import { RepositoryError, NotFoundError } from "@/shared/errors";
import { AppwriteDatabaseClient } from "../../persistence/appwrite/database-client";
import { 
  COLLECTIONS, 
  AppwriteKeyboardLayoutDocument 
} from "../../persistence/appwrite/collections.config";
import type { ILogger } from "@/shared/utils/logger";

export class AppwriteKeyboardLayoutRepository implements IKeyboardLayoutRepository {
  constructor(
    private client: AppwriteDatabaseClient,
    private logger: ILogger
  ) {}

  async getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]> {
    try {
      const queries = [
        Query.equal('language', language),
        Query.orderAsc('name')
      ];

      const documents = await this.client.listDocuments<AppwriteKeyboardLayoutDocument>(
        COLLECTIONS.KEYBOARD_LAYOUTS,
        queries
      );

      return documents.map(doc => this.fromAppwriteDocument(doc));
    } catch (error) {
      this.logger.error(`Failed to get available layouts for language: ${language}`, error as Error);
      throw new RepositoryError('Failed to get available layouts', error as Error);
    }
  }

  async getLayoutById(layoutId: string): Promise<KeyboardLayout | null> {
    try {
      const document = await this.client.getDocument<AppwriteKeyboardLayoutDocument>(
        COLLECTIONS.KEYBOARD_LAYOUTS,
        layoutId
      );

      return document ? this.fromAppwriteDocument(document) : null;
    } catch (error) {
      this.logger.error(`Failed to get layout: ${layoutId}`, error as Error);
      throw new RepositoryError('Failed to get layout', error as Error);
    }
  }

  async saveCustomLayout(layout: KeyboardLayout): Promise<void> {
    try {
      const document = this.toAppwriteDocument(layout);
      
      await this.client.createDocument<AppwriteKeyboardLayoutDocument>(
        COLLECTIONS.KEYBOARD_LAYOUTS,
        document,
        layout.id
      );

      this.logger.info(`Saved custom layout: ${layout.id}`);
    } catch (error) {
      this.logger.error('Failed to save custom layout', error as Error);
      throw new RepositoryError('Failed to save custom layout', error as Error);
    }
  }

  async getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null> {
    try {
      // This would typically be stored in user preferences
      // For now, we'll use a separate query or integrate with user preferences
      const queries = [
        Query.equal('created_by', userId),
        Query.equal('language', language),
        Query.equal('is_custom', true),
        Query.limit(1)
      ];

      const documents = await this.client.listDocuments<AppwriteKeyboardLayoutDocument>(
        COLLECTIONS.KEYBOARD_LAYOUTS,
        queries
      );

      return documents.length > 0 ? documents[0].$id : null;
    } catch (error) {
      this.logger.error(`Failed to get user preferred layout for ${userId}, ${language}`, error as Error);
      return null; // Return null instead of throwing to allow fallback
    }
  }

  async setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void> {
    try {
      // Verify the layout exists
      const layout = await this.getLayoutById(layoutId);
      if (!layout) {
        throw new NotFoundError(`Layout not found: ${layoutId}`);
      }

      if (layout.language !== language) {
        throw new RepositoryError(`Layout language mismatch: expected ${language}, got ${layout.language}`);
      }

      // In a full implementation, this would update user preferences
      // For now, we'll just log this operation
      this.logger.info(`Set preferred layout for user ${userId}, language ${language}: ${layoutId}`);
      
      // TODO: Integrate with user preferences system
    } catch (error) {
      this.logger.error(`Failed to set user preferred layout`, error as Error);
      throw error instanceof NotFoundError || error instanceof RepositoryError 
        ? error 
        : new RepositoryError('Failed to set user preferred layout', error as Error);
    }
  }

  async deleteCustomLayout(layoutId: string, userId: string): Promise<void> {
    try {
      // First verify the layout exists and belongs to the user
      const layout = await this.getLayoutById(layoutId);
      
      if (!layout) {
        throw new NotFoundError(`Layout not found: ${layoutId}`);
      }

      if (!layout.isCustom) {
        throw new RepositoryError('Cannot delete built-in layout');
      }

      if (layout.createdBy !== userId) {
        throw new RepositoryError('User does not have permission to delete this layout');
      }

      await this.client.deleteDocument(COLLECTIONS.KEYBOARD_LAYOUTS, layoutId);
      this.logger.info(`Deleted custom layout: ${layoutId}`);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof RepositoryError) {
        throw error;
      }
      this.logger.error(`Failed to delete custom layout: ${layoutId}`, error as Error);
      throw new RepositoryError('Failed to delete custom layout', error as Error);
    }
  }

  async getAllCustomLayouts(userId: string): Promise<KeyboardLayout[]> {
    try {
      const queries = [
        Query.equal('created_by', userId),
        Query.equal('is_custom', true),
        Query.orderAsc('name')
      ];

      const documents = await this.client.listDocuments<AppwriteKeyboardLayoutDocument>(
        COLLECTIONS.KEYBOARD_LAYOUTS,
        queries
      );

      return documents.map(doc => this.fromAppwriteDocument(doc));
    } catch (error) {
      this.logger.error(`Failed to get custom layouts for user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to get custom layouts', error as Error);
    }
  }

  private toAppwriteDocument(layout: KeyboardLayout): Omit<AppwriteKeyboardLayoutDocument, '$id' | '$createdAt' | '$updatedAt'> {
    return {
      name: layout.name,
      display_name: layout.displayName,
      language: layout.language,
      layout_type: layout.layoutType,
      variant: layout.variant,
      key_mappings: JSON.stringify(layout.keyMappings),
      metadata: JSON.stringify(layout.metadata),
      is_custom: layout.isCustom,
      created_by: layout.createdBy
    };
  }

  private fromAppwriteDocument(doc: AppwriteKeyboardLayoutDocument): KeyboardLayout {
    return {
      id: doc.$id,
      name: doc.name,
      displayName: doc.display_name,
      language: doc.language as LanguageCode,
      layoutType: doc.layout_type as any,
      variant: doc.variant as any,
      keyMappings: JSON.parse(doc.key_mappings),
      metadata: JSON.parse(doc.metadata),
      isCustom: doc.is_custom,
      createdBy: doc.created_by,
      createdAt: new Date(doc.$createdAt).getTime(),
      updatedAt: new Date(doc.$updatedAt).getTime()
    };
  }
}