import { Client, Databases, Account, ID, Query } from "appwrite";
import { NetworkError, AuthenticationError } from "@/shared/errors";
import type { ILogger } from "@/shared/utils/logger";

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
}

export class AppwriteDatabaseClient {
  private client: Client;
  private databases: Databases;
  private account: Account;
  private config: AppwriteConfig;
  private isInitialized = false;

  constructor(
    config: AppwriteConfig,
    private logger: ILogger
  ) {
    this.config = config;
    this.client = new Client();
    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.client
        .setEndpoint(this.config.endpoint)
        .setProject(this.config.projectId);

      // Test connection
      await this.account.get();
      this.isInitialized = true;
      this.logger.info('Appwrite client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Appwrite client', error as Error);
      throw new NetworkError('Failed to connect to Appwrite', error as Error);
    }
  }

  async createDocument<T>(
    collectionId: string, 
    data: Omit<T, '$id' | '$createdAt' | '$updatedAt'>,
    documentId?: string
  ): Promise<T> {
    await this.ensureInitialized();
    
    try {
      const result = await this.databases.createDocument(
        this.config.databaseId,
        collectionId,
        documentId || ID.unique(),
        data
      );
      return result as T;
    } catch (error) {
      this.handleError('createDocument', error);
    }
  }

  async getDocument<T>(collectionId: string, documentId: string): Promise<T | null> {
    await this.ensureInitialized();
    
    try {
      const result = await this.databases.getDocument(
        this.config.databaseId,
        collectionId,
        documentId
      );
      return result as T;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      this.handleError('getDocument', error);
    }
  }

  async updateDocument<T>(
    collectionId: string,
    documentId: string,
    data: Partial<Omit<T, '$id' | '$createdAt' | '$updatedAt'>>
  ): Promise<T> {
    await this.ensureInitialized();
    
    try {
      const result = await this.databases.updateDocument(
        this.config.databaseId,
        collectionId,
        documentId,
        data
      );
      return result as T;
    } catch (error) {
      this.handleError('updateDocument', error);
    }
  }

  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await this.databases.deleteDocument(
        this.config.databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      this.handleError('deleteDocument', error);
    }
  }

  async listDocuments<T>(
    collectionId: string,
    queries?: string[],
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    await this.ensureInitialized();
    
    try {
      const queryOptions = [];
      if (queries) queryOptions.push(...queries);
      if (limit) queryOptions.push(Query.limit(limit));
      if (offset) queryOptions.push(Query.offset(offset));

      const result = await this.databases.listDocuments(
        this.config.databaseId,
        collectionId,
        queryOptions
      );
      return result.documents as T[];
    } catch (error) {
      this.handleError('listDocuments', error);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.account.get();
      return true;
    } catch {
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private handleError(operation: string, error: any): never {
    this.logger.error(`Appwrite ${operation} failed`, error);
    
    if (error.code === 401) {
      throw new AuthenticationError(`Authentication failed during ${operation}`, error);
    }
    
    throw new NetworkError(`Appwrite ${operation} failed: ${error.message}`, error);
  }
}