import { AppwriteHealthStatus, IAppwriteClientService } from "@/domain/interfaces";
import { Account, Client, Databases } from "appwrite";

/**
 * Appwrite client service wrapper with error handling and health monitoring
 */
export class AppwriteClientService implements IAppwriteClientService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private healthStatus: AppwriteHealthStatus = {
    isConnected: false,
    status: "offline",
  };

  constructor() {
    this.client = new Client();
    this.initializeClient();
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  private initializeClient(): void {
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (endpoint && projectId) {
      try {
        this.client.setEndpoint(endpoint).setProject(projectId);

        this.healthStatus = {
          isConnected: true,
          status: "online",
        };
      } catch (error) {
        console.error("Failed to initialize Appwrite client:", error);
        this.healthStatus = {
          isConnected: false,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    } else {
      console.warn("Appwrite environment variables not configured");
      this.healthStatus = {
        isConnected: false,
        status: "offline",
        errorMessage: "Environment variables not configured",
      };
    }
  }

  isConfigured(): boolean {
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;
    return Boolean(endpoint && projectId);
  }

  async checkHealth(): Promise<AppwriteHealthStatus> {
    if (!this.isConfigured()) {
      return {
        isConnected: false,
        status: "offline",
        errorMessage: "Appwrite not configured",
      };
    }

    try {
      // Try to ping the account service
      await this.account.get();

      this.healthStatus = {
        isConnected: true,
        status: "online",
        lastPing: Date.now(),
      };
    } catch (error) {
      // If we get a 401 (unauthorized), the service is still reachable
      if (error instanceof Error && error.message.includes("401")) {
        this.healthStatus = {
          isConnected: true,
          status: "online",
          lastPing: Date.now(),
        };
      } else {
        this.healthStatus = {
          isConnected: false,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Health check failed",
          lastPing: Date.now(),
        };
      }
    }

    return { ...this.healthStatus };
  }

  async getCurrentSession(): Promise<unknown> {
    if (!this.isConfigured()) {
      throw new Error("Appwrite not configured");
    }

    try {
      return await this.account.get();
    } catch (error) {
      await this.handleAuthError(error);
      throw error;
    }
  }

  async handleAuthError(error: unknown): Promise<void> {
    if (error instanceof Error) {
      console.warn("Appwrite auth error:", error.message);

      // Update health status
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        this.healthStatus = {
          isConnected: true,
          status: "online",
          errorMessage: "Not authenticated",
          lastPing: Date.now(),
        };
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        this.healthStatus = {
          isConnected: false,
          status: "error",
          errorMessage: "Network error",
          lastPing: Date.now(),
        };
      }
    }
  }

  async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.warn(`Retry attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }

    // All retries failed
    await this.handleAuthError(lastError);
    throw lastError || new Error("Operation failed after retries");
  }

  getDatabaseClient(): unknown {
    if (!this.isConfigured()) {
      throw new Error("Appwrite not configured");
    }
    return this.databases;
  }

  getAccountClient(): unknown {
    if (!this.isConfigured()) {
      throw new Error("Appwrite not configured");
    }
    return this.account;
  }

  /**
   * Create a document with retry logic
   */
  async createDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>,
    permissions?: string[]
  ): Promise<unknown> {
    return this.retryOperation(async () => {
      return await this.databases.createDocument(databaseId, collectionId, documentId, data, permissions);
    });
  }

  /**
   * Get a document with retry logic
   */
  async getDocument(databaseId: string, collectionId: string, documentId: string): Promise<unknown> {
    return this.retryOperation(async () => {
      return await this.databases.getDocument(databaseId, collectionId, documentId);
    });
  }

  /**
   * Update a document with retry logic
   */
  async updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>,
    permissions?: string[]
  ): Promise<unknown> {
    return this.retryOperation(async () => {
      return await this.databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
    });
  }

  /**
   * List documents with retry logic
   */
  async listDocuments(databaseId: string, collectionId: string, queries?: string[]): Promise<unknown> {
    return this.retryOperation(async () => {
      return await this.databases.listDocuments(databaseId, collectionId, queries);
    });
  }

  /**
   * Delete a document with retry logic
   */
  async deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<unknown> {
    return this.retryOperation(async () => {
      return await this.databases.deleteDocument(databaseId, collectionId, documentId);
    });
  }

  /**
   * Get current health status
   */
  getHealthStatus(): AppwriteHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.healthStatus.isConnected && this.healthStatus.status === "online";
  }

  /**
   * Get connection status for display
   */
  getConnectionStatus(): "connected" | "disconnected" | "error" | "not-configured" {
    if (!this.isConfigured()) return "not-configured";
    if (this.healthStatus.status === "error") return "error";
    if (this.healthStatus.isConnected) return "connected";
    return "disconnected";
  }
}
