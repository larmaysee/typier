/**
 * Mock implementation of IStorageService for development and testing
 */

export interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface IStorageService {
  uploadFile(
    bucketId: string,
    fileId: string,
    file: File
  ): Promise<StorageFile>;
  getFile(bucketId: string, fileId: string): Promise<StorageFile>;
  deleteFile(bucketId: string, fileId: string): Promise<void>;
  listFiles(bucketId: string): Promise<StorageFile[]>;
  getFileUrl(bucketId: string, fileId: string): Promise<string>;
}

export class MockStorageService implements IStorageService {
  private files: Map<string, Map<string, StorageFile>> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock files
    const profileBucket = new Map<string, StorageFile>();
    profileBucket.set("avatar_user1", {
      id: "avatar_user1",
      name: "profile-picture.jpg",
      mimeType: "image/jpeg",
      size: 156789,
      url: "/mock/avatars/user1.jpg",
      createdAt: new Date(),
    });

    this.files.set("profiles", profileBucket);
    this.files.set("exports", new Map());
    this.files.set("temp", new Map());
  }

  async uploadFile(
    bucketId: string,
    fileId: string,
    file: File
  ): Promise<StorageFile> {
    const bucket = this.getOrCreateBucket(bucketId);

    const storageFile: StorageFile = {
      id: fileId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/mock/${bucketId}/${fileId}`,
      createdAt: new Date(),
    };

    bucket.set(fileId, storageFile);
    console.log(`[Storage] File uploaded to ${bucketId}: ${fileId}`);

    return storageFile;
  }

  async getFile(bucketId: string, fileId: string): Promise<StorageFile> {
    const bucket = this.files.get(bucketId);
    if (!bucket) {
      throw new Error(`Bucket not found: ${bucketId}`);
    }

    const file = bucket.get(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId} in bucket ${bucketId}`);
    }

    return file;
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    const bucket = this.files.get(bucketId);
    if (!bucket) {
      throw new Error(`Bucket not found: ${bucketId}`);
    }

    const deleted = bucket.delete(fileId);
    if (!deleted) {
      throw new Error(`File not found: ${fileId} in bucket ${bucketId}`);
    }

    console.log(`[Storage] File deleted from ${bucketId}: ${fileId}`);
  }

  async listFiles(bucketId: string): Promise<StorageFile[]> {
    const bucket = this.files.get(bucketId);
    if (!bucket) {
      return [];
    }

    return Array.from(bucket.values());
  }

  async getFileUrl(bucketId: string, fileId: string): Promise<string> {
    const file = await this.getFile(bucketId, fileId);
    return file.url;
  }

  private getOrCreateBucket(bucketId: string): Map<string, StorageFile> {
    if (!this.files.has(bucketId)) {
      this.files.set(bucketId, new Map());
    }
    return this.files.get(bucketId)!;
  }
}
