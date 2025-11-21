/**
 * Appwrite Database Setup for Typoria
 *
 * This utility provides setup instructions and validation for the Appwrite database structure
 * required for the Typoria typing test application.
 *
 * Use the Appwrite Console or MCP tools to create the database structure.
 */

// Get database configuration from environment variables
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "typoria-db";
const COLLECTIONS = {
  USERS: process.env.APPWRITE_COLLECTION_USERS || "users",
  TYPING_TESTS: process.env.APPWRITE_COLLECTION_TYPING_TESTS || "typing_tests",
  LEADERBOARDS: process.env.APPWRITE_COLLECTION_LEADERBOARDS || "leaderboards",
  USER_SETTINGS: process.env.APPWRITE_COLLECTION_USER_SETTINGS || "user_settings",
} as const;

export interface DatabaseSetupConfig {
  database: {
    id: string;
    name: string;
  };
  collections: Array<{
    id: string;
    name: string;
    permissions: string[];
    attributes: Array<{
      key: string;
      type: "string" | "integer" | "float" | "boolean" | "datetime" | "email" | "enum";
      size?: number;
      required: boolean;
      default?: string | number | boolean;
      elements?: string[];
    }>;
    indexes: Array<{
      key: string;
      type: string;
      attributes: string[];
    }>;
  }>;
}

export const TYPORIA_DATABASE_CONFIG: DatabaseSetupConfig = {
  database: {
    id: DATABASE_ID,
    name: "Typoria Database",
  },
  collections: [
    {
      id: COLLECTIONS.USERS,
      name: "Users",
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
      attributes: [
        { key: "username", type: "string", size: 255, required: true },
        { key: "email", type: "email", required: true },
        { key: "total_tests", type: "integer", required: true, default: 0 },
        { key: "best_wpm", type: "integer", required: true, default: 0 },
        { key: "average_accuracy", type: "float", required: true, default: 0.0 },
      ],
      indexes: [],
    },
    {
      id: COLLECTIONS.TYPING_TESTS,
      name: "Typing Tests",
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
      attributes: [
        { key: "user_id", type: "string", size: 255, required: true },
        { key: "wpm", type: "integer", required: true },
        { key: "accuracy", type: "float", required: true },
        { key: "correct_words", type: "integer", required: true },
        { key: "incorrect_words", type: "integer", required: true },
        { key: "total_words", type: "integer", required: true },
        { key: "duration", type: "integer", required: true },
        { key: "language", type: "enum", elements: ["english", "lisu", "myanmar"], required: true },
        { key: "characters_typed", type: "integer", required: true },
        { key: "errors", type: "integer", required: true },
        { key: "test_date", type: "datetime", required: true },
      ],
      indexes: [
        { key: "user_id_idx", type: "key", attributes: ["user_id"] },
        { key: "test_date_idx", type: "key", attributes: ["test_date"] },
        { key: "language_idx", type: "key", attributes: ["language"] },
        { key: "wpm_idx", type: "key", attributes: ["wpm"] },
      ],
    },
    {
      id: COLLECTIONS.LEADERBOARDS,
      name: "Leaderboards",
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
      attributes: [
        { key: "user_id", type: "string", size: 255, required: true },
        { key: "username", type: "string", size: 255, required: true },
        { key: "best_wpm", type: "integer", required: true },
        { key: "language", type: "enum", elements: ["english", "lisu", "myanmar"], required: true },
        { key: "duration_category", type: "enum", elements: ["15", "30", "60", "120"], required: true },
      ],
      indexes: [
        { key: "best_wpm_idx", type: "key", attributes: ["best_wpm"] },
        { key: "language_duration_idx", type: "key", attributes: ["language", "duration_category"] },
      ],
    },
    {
      id: COLLECTIONS.USER_SETTINGS,
      name: "User Settings",
      permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
      attributes: [
        { key: "user_id", type: "string", size: 255, required: true },
        { key: "theme", type: "enum", elements: ["light", "dark", "system"], required: true, default: "system" },
        {
          key: "preferred_language",
          type: "enum",
          elements: ["english", "lisu", "myanmar"],
          required: true,
          default: "english",
        },
        { key: "default_test_duration", type: "integer", required: true, default: 60 },
        { key: "show_leaderboard", type: "boolean", required: true, default: true },
      ],
      indexes: [{ key: "user_id_settings_idx", type: "key", attributes: ["user_id"] }],
    },
  ],
};

/**
 * Get setup instructions for manual creation via Appwrite Console
 */
export function getSetupInstructions(): string {
  return `
🔧 Typoria Database Setup Instructions

1. Open Appwrite Console → Databases
2. Create Database:
   ID: ${DATABASE_ID}
   Name: ${TYPORIA_DATABASE_CONFIG.database.name}

3. Create Collections with Attributes:

${TYPORIA_DATABASE_CONFIG.collections
  .map(
    (collection) => `
   📊 Collection: ${collection.name}
   ID: ${collection.id}
   Permissions: ${collection.permissions.join(", ")}
   
   Attributes:
${collection.attributes
  .map(
    (attr) =>
      `     - ${attr.key} (${attr.type}${attr.size ? `, size: ${attr.size}` : ""}${attr.required ? ", required" : ""}${
        attr.default !== undefined ? `, default: ${attr.default}` : ""
      }${attr.elements ? `, elements: [${attr.elements.join(", ")}]` : ""})`
  )
  .join("\n")}
   
   Indexes:
${collection.indexes.map((index) => `     - ${index.key}: ${index.attributes.join(", ")}`).join("\n") || "     (none)"}
`
  )
  .join("\n")}

4. Verify your .env.local file contains:
   APPWRITE_ENDPOINT=your_endpoint
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_COLLECTION_USERS=your_users_collection_id
   APPWRITE_COLLECTION_TYPING_TESTS=your_typing_tests_collection_id
   APPWRITE_COLLECTION_LEADERBOARDS=your_leaderboards_collection_id
   APPWRITE_COLLECTION_USER_SETTINGS=your_user_settings_collection_id

5. For server-side operations, also add:
   APPWRITE_API_KEY=your_server_api_key
`;
}

/**
 * Simple setup validation
 */
export function validateEnvironmentVariables(): { isValid: boolean; missing: string[]; usingDefaults: string[] } {
  const required = [
    "APPWRITE_ENDPOINT",
    "APPWRITE_PROJECT_ID",
    "APPWRITE_DATABASE_ID",
    "APPWRITE_COLLECTION_USERS",
    "APPWRITE_COLLECTION_TYPING_TESTS",
    "APPWRITE_COLLECTION_LEADERBOARDS",
    "APPWRITE_COLLECTION_USER_SETTINGS",
  ];

  const missing = required.filter((env) => !process.env[env]);

  // Check which ones are using default values
  const usingDefaults = [];
  if (!process.env.APPWRITE_DATABASE_ID) usingDefaults.push("DATABASE_ID (default: typoria-db)");
  if (!process.env.APPWRITE_COLLECTION_USERS) usingDefaults.push("COLLECTION_USERS (default: users)");
  if (!process.env.APPWRITE_COLLECTION_TYPING_TESTS)
    usingDefaults.push("COLLECTION_TYPING_TESTS (default: typing_tests)");
  if (!process.env.APPWRITE_COLLECTION_LEADERBOARDS)
    usingDefaults.push("COLLECTION_LEADERBOARDS (default: leaderboards)");
  if (!process.env.APPWRITE_COLLECTION_USER_SETTINGS)
    usingDefaults.push("COLLECTION_USER_SETTINGS (default: user_settings)");

  return {
    isValid: missing.length === 0,
    missing,
    usingDefaults,
  };
}

/**
 * Print setup status and instructions
 */
export function printSetupGuide(): void {
  console.log("🔍 Typoria Database Setup Guide\n");

  const envCheck = validateEnvironmentVariables();

  if (envCheck.isValid) {
    console.log("✅ Environment variables configured");
  } else {
    console.log("❌ Missing environment variables:");
    envCheck.missing.forEach((env) => console.log(`   ❌ ${env}`));
  }

  if (envCheck.usingDefaults.length > 0) {
    console.log("⚠️  Using default values for:");
    envCheck.usingDefaults.forEach((defaultVar) => console.log(`   ⚠️  ${defaultVar}`));
  }

  console.log(getSetupInstructions());
}

/**
 * Generate MCP commands for automated setup
 */
export function generateMCPSetupCommands(): string[] {
  const commands: string[] = [];

  // Create database
  commands.push(
    `mcp_appwrite-api_databases_create --database_id="${DATABASE_ID}" --name="${TYPORIA_DATABASE_CONFIG.database.name}"`
  );

  // Create collections and attributes
  for (const collection of TYPORIA_DATABASE_CONFIG.collections) {
    // Create collection
    commands.push(
      `mcp_appwrite-api_databases_create_collection --database_id="${DATABASE_ID}" --collection_id="${collection.id}" --name="${collection.name}"`
    );

    // Note: Attributes and indexes would need to be created separately via MCP tools
    commands.push(`# Add attributes for ${collection.name} collection manually via MCP tools`);
  }

  return commands;
}

// Export constants for use by other files
export { COLLECTIONS, DATABASE_ID };

/**
 * Helper function to get current database configuration
 */
export function getCurrentDatabaseConfig() {
  return {
    databaseId: DATABASE_ID,
    collections: COLLECTIONS,
    isConfigured: !!process.env.APPWRITE_ENDPOINT && !!process.env.APPWRITE_PROJECT_ID,
    environment: {
      endpoint: process.env.APPWRITE_ENDPOINT,
      projectId: process.env.APPWRITE_PROJECT_ID,
      databaseId: process.env.APPWRITE_DATABASE_ID || "(using default)",
      collections: {
        users: process.env.APPWRITE_COLLECTION_USERS || "(using default)",
        typingTests: process.env.APPWRITE_COLLECTION_TYPING_TESTS || "(using default)",
        leaderboards: process.env.APPWRITE_COLLECTION_LEADERBOARDS || "(using default)",
        userSettings: process.env.APPWRITE_COLLECTION_USER_SETTINGS || "(using default)",
      },
    },
  };
}
