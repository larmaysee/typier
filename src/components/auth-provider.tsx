"use client";
import { account, TypingDatabaseService, UserDocument } from "@/lib/appwrite";
import { ID, Models } from "appwrite";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type User = {
  name: string;
  email?: string;
  id: string;
  profile?: UserDocument;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: (guestName: string) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER_KEY = "typoria_guest_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log("[AuthProvider] Checking auth status...");

      // Check if Appwrite is configured
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        console.log("[AuthProvider] Appwrite not configured, checking for guest user");
        // No Appwrite config, check for guest user
        const guestUser = localStorage.getItem(GUEST_USER_KEY);
        if (guestUser) {
          const userData = JSON.parse(guestUser);
          console.log("[AuthProvider] Found guest user:", userData.name);
          setUser(userData);
        }
        setLoading(false);
        return;
      }

      console.log("[AuthProvider] Appwrite configured, checking session...");
      // Try to get current session
      const session = await account.getSession("current");

      if (session) {
        console.log("[AuthProvider] Session found:", session.$id);
        const accountData = await account.get();
        console.log("[AuthProvider] Account data:", accountData.email);
        await loadUserProfile(accountData);
      }
    } catch (error) {
      console.log("[AuthProvider] No active session found:", error);
      // Check for guest user
      const guestUser = localStorage.getItem(GUEST_USER_KEY);
      if (guestUser) {
        const userData = JSON.parse(guestUser);
        console.log("[AuthProvider] Using guest user:", userData.name);
        setUser(userData);
      }
    } finally {
      setLoading(false);
      console.log("[AuthProvider] Auth check complete");
    }
  };

  const loadUserProfile = async (accountData: Models.User<Models.Preferences>) => {
    try {
      console.log("[AuthProvider] Loading user profile for:", accountData.email);
      // Get or create user profile in database
      let userProfile = await TypingDatabaseService.getUser(accountData.$id);

      console.log("[AuthProvider] User profile result:", userProfile);

      if (!userProfile) {
        console.log("[AuthProvider] User profile not found, creating new user...");
        // Create new user profile (OAuth login)
        userProfile = await TypingDatabaseService.createUser({
          userId: accountData.$id,
          username: accountData.name,
          email: accountData.email,
          avatarUrl: undefined,
        });
        console.log("[AuthProvider] New user created:", userProfile.username);
      } else {
        console.log("[AuthProvider] User profile found, updating last login...");
        // Update last login for existing user
        userProfile = await TypingDatabaseService.updateLastLogin(accountData.$id);
      }

      setUser({
        id: accountData.$id,
        name: accountData.name,
        email: accountData.email,
        profile: userProfile,
      });
      console.log("[AuthProvider] User profile loaded successfully");
    } catch (error) {
      console.error("[AuthProvider] Error loading user profile:", error);
      // Set user without profile
      setUser({
        id: accountData.$id,
        name: accountData.name,
        email: accountData.email,
      });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID) {
        throw new Error("Authentication service not configured");
      }

      // Create account
      const accountData = await account.create(ID.unique(), email, password, name);

      // Login after registration
      await account.createEmailPasswordSession(email, password);

      // Load user profile
      await loadUserProfile(accountData);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID) {
        throw new Error("Authentication service not configured");
      }

      // Create session
      await account.createEmailPasswordSession(email, password);

      // Get account data
      const accountData = await account.get();

      // Load user profile
      await loadUserProfile(accountData);

      // Clear any guest user data
      localStorage.removeItem(GUEST_USER_KEY);
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = (guestName: string) => {
    const guestUser: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: guestName,
    };

    // Save guest user to localStorage
    localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear guest user if exists
      localStorage.removeItem(GUEST_USER_KEY);

      // If Appwrite is configured and user is authenticated, delete session
      if (user && !user.id.startsWith("guest_") && process.env.APPWRITE_ENDPOINT && process.env.APPWRITE_PROJECT_ID) {
        try {
          await account.deleteSession("current");
        } catch {
          console.log("No active session to delete");
        }
      }

      setUser(null);
    } catch {
      console.error("Logout error");
      setError("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loginAsGuest,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
