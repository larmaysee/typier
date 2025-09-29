import { User, UserPreferences } from "../entities";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences | null>;
  deleteUser(userId: string): Promise<void>;
}