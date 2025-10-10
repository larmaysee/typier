/**
 * Mock implementation of IAppwriteClientService for development and testing
 */

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId?: string;
}

export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  prefs: Record<string, unknown>;
}

export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: unknown;
}

export interface IAppwriteClientService {
  initialize(config: AppwriteConfig): Promise<void>;
  getCurrentUser(): Promise<AppwriteUser | null>;
  loginWithEmail(email: string, password: string): Promise<AppwriteUser>;
  createAccount(
    email: string,
    password: string,
    name: string
  ): Promise<AppwriteUser>;
  logout(): Promise<void>;

  // Database operations
  createDocument(
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<AppwriteDocument>;
  getDocument(
    collectionId: string,
    documentId: string
  ): Promise<AppwriteDocument>;
  updateDocument(
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<AppwriteDocument>;
  deleteDocument(collectionId: string, documentId: string): Promise<void>;
  listDocuments(
    collectionId: string,
    queries?: string[]
  ): Promise<AppwriteDocument[]>;

  // Health check
  isHealthy(): Promise<boolean>;
}

export class MockAppwriteClientService implements IAppwriteClientService {
  private config: AppwriteConfig | null = null;
  private currentUser: AppwriteUser | null = null;
  private documents: Map<string, Map<string, AppwriteDocument>> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize collections
    this.documents.set("users", new Map());
    this.documents.set("typing_tests", new Map());
    this.documents.set("user_statistics", new Map());
    this.documents.set("competitions", new Map());

    // Add mock documents
    this.documents.get("users")?.set("user1", {
      $id: "user1",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      email: "test@example.com",
      username: "testuser1",
      profile: {
        displayName: "Test User 1",
        totalTests: 45,
        bestWPM: 65,
      },
    });
  }

  async initialize(config: AppwriteConfig): Promise<void> {
    this.config = config;
    this.isInitialized = true;

    // In real implementation, this would initialize Appwrite SDK
    console.log(
      `[Appwrite] Initialized with endpoint: ${config.endpoint}, project: ${config.projectId}`
    );

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async getCurrentUser(): Promise<AppwriteUser | null> {
    this.ensureInitialized();

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    return this.currentUser;
  }

  async loginWithEmail(email: string, password: string): Promise<AppwriteUser> {
    this.ensureInitialized();

    // Mock authentication - in real implementation, this would call Appwrite
    if (email === "test@example.com" && password === "password123") {
      this.currentUser = {
        $id: "user1",
        email: email,
        name: "Test User",
        emailVerification: true,
        prefs: {},
      };

      console.log(`[Appwrite] User logged in: ${email}`);
      return this.currentUser;
    }

    throw new Error("Invalid credentials");
  }

  async createAccount(
    email: string,
    password: string,
    name: string
  ): Promise<AppwriteUser> {
    this.ensureInitialized();

    // Mock account creation
    const userId = `user_${Date.now()}`;
    this.currentUser = {
      $id: userId,
      email: email,
      name: name,
      emailVerification: false,
      prefs: {},
    };

    console.log(`[Appwrite] Account created: ${email}`);
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.ensureInitialized();

    this.currentUser = null;
    console.log("[Appwrite] User logged out");
  }

  async createDocument(
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<AppwriteDocument> {
    this.ensureInitialized();

    const collection = this.getOrCreateCollection(collectionId);

    const document: AppwriteDocument = {
      $id: documentId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      ...data,
    };

    collection.set(documentId, document);
    console.log(
      `[Appwrite] Document created in ${collectionId}: ${documentId}`
    );

    return document;
  }

  async getDocument(
    collectionId: string,
    documentId: string
  ): Promise<AppwriteDocument> {
    this.ensureInitialized();

    const collection = this.documents.get(collectionId);
    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    const document = collection.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId} in ${collectionId}`);
    }

    return document;
  }

  async updateDocument(
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<AppwriteDocument> {
    this.ensureInitialized();

    const existingDocument = await this.getDocument(collectionId, documentId);

    const updatedDocument: AppwriteDocument = {
      ...existingDocument,
      ...data,
      $updatedAt: new Date().toISOString(),
    };

    const collection = this.documents.get(collectionId)!;
    collection.set(documentId, updatedDocument);

    console.log(
      `[Appwrite] Document updated in ${collectionId}: ${documentId}`
    );
    return updatedDocument;
  }

  async deleteDocument(
    collectionId: string,
    documentId: string
  ): Promise<void> {
    this.ensureInitialized();

    const collection = this.documents.get(collectionId);
    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    const deleted = collection.delete(documentId);
    if (!deleted) {
      throw new Error(`Document not found: ${documentId} in ${collectionId}`);
    }

    console.log(
      `[Appwrite] Document deleted from ${collectionId}: ${documentId}`
    );
  }

  async listDocuments(
    collectionId: string,
    queries?: string[]
  ): Promise<AppwriteDocument[]> {
    this.ensureInitialized();

    const collection = this.documents.get(collectionId);
    if (!collection) {
      return [];
    }

    let documents = Array.from(collection.values());

    // Simple query filtering for mock - in real implementation, Appwrite handles this
    if (queries) {
      documents = this.applyQueries(documents, queries);
    }

    return documents;
  }

  async isHealthy(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    // Simulate health check
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch {
      return false;
    }
  }

  // Helper methods
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "Appwrite client not initialized. Call initialize() first."
      );
    }
  }

  private getOrCreateCollection(
    collectionId: string
  ): Map<string, AppwriteDocument> {
    if (!this.documents.has(collectionId)) {
      this.documents.set(collectionId, new Map());
    }
    return this.documents.get(collectionId)!;
  }

  private applyQueries(
    documents: AppwriteDocument[],
    queries: string[]
  ): AppwriteDocument[] {
    // Simple mock query processing - real Appwrite handles complex queries
    let filtered = documents;

    for (const query of queries) {
      if (query.includes("limit(")) {
        const limitMatch = query.match(/limit\((\d+)\)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          filtered = filtered.slice(0, limit);
        }
      }

      if (query.includes("orderDesc(")) {
        const fieldMatch = query.match(/orderDesc\([\'"](.*?)[\'"]\)/);
        if (fieldMatch) {
          const field = fieldMatch[1];
          filtered = filtered.sort((a, b) => {
            if (field === "$createdAt") {
              return (
                new Date(b.$createdAt).getTime() -
                new Date(a.$createdAt).getTime()
              );
            }
            return 0;
          });
        }
      }

      // Add more query filters as needed
    }

    return filtered;
  }

  // Additional utility methods for testing
  getMockDocumentCount(collectionId: string): number {
    return this.documents.get(collectionId)?.size || 0;
  }

  clearMockData(): void {
    this.documents.clear();
    this.currentUser = null;
    this.initializeMockData();
  }
}
