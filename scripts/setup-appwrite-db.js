#!/usr/bin/env node

/**
 * Appwrite Database Setup Script for Typoria
 * 
 * This script creates the required database structure for the Typoria typing test app.
 * Run this script after setting up your Appwrite project to initialize the database.
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_APPWRITE_ENDPOINT
 * - NEXT_PUBLIC_APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY (Server API key with database.write permissions)
 */

const { Client, Databases, Permission, Role, ID } = require('node-appwrite');

// Configuration
const DATABASE_ID = 'typoria-db';
const COLLECTIONS = {
  USERS: 'users',
  TYPING_TESTS: 'typing_tests',
  LEADERBOARDS: 'leaderboards',
  USER_SETTINGS: 'user_settings'
};

async function setupAppwriteDatabase() {
  console.log('🚀 Starting Appwrite database setup for Typoria...\n');

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Step 1: Create Database
    console.log('📦 Creating database...');
    try {
      await databases.create(DATABASE_ID, 'Typoria Database');
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Database already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Create Users Collection
    console.log('\n👥 Creating Users collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.USERS,
        'Users',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Users collection created');

      // Add attributes to Users collection
      const userAttributes = [
        { key: 'username', type: 'string', size: 255, required: true },
        { key: 'email', type: 'email', required: true },
        { key: 'total_tests', type: 'integer', required: true, default: 0 },
        { key: 'best_wpm', type: 'integer', required: true, default: 0 },
        { key: 'average_accuracy', type: 'float', required: true, default: 0.0 }
      ];

      for (const attr of userAttributes) {
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USERS, attr.key, attr.size || 255, attr.required, attr.default);
        console.log(`  ✅ Added ${attr.key} attribute`);
      }

    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Users collection already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Create Typing Tests Collection
    console.log('\n⌨️  Creating Typing Tests collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.TYPING_TESTS,
        'Typing Tests',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Typing Tests collection created');

      // Add attributes to Typing Tests collection
      const testAttributes = [
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'wpm', type: 'integer', required: true },
        { key: 'accuracy', type: 'float', required: true },
        { key: 'correct_words', type: 'integer', required: true },
        { key: 'incorrect_words', type: 'integer', required: true },
        { key: 'total_words', type: 'integer', required: true },
        { key: 'duration', type: 'integer', required: true },
        { key: 'language', type: 'string', size: 50, required: true },
        { key: 'characters_typed', type: 'integer', required: true },
        { key: 'errors', type: 'integer', required: true },
        { key: 'test_date', type: 'datetime', required: true }
      ];

      for (const attr of testAttributes) {
        if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(DATABASE_ID, COLLECTIONS.TYPING_TESTS, attr.key, attr.required);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.TYPING_TESTS, attr.key, attr.required, attr.default);
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TYPING_TESTS, attr.key, attr.required, attr.default);
        } else {
          await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.TYPING_TESTS, attr.key, attr.size || 255, attr.required, attr.default);
        }
        console.log(`  ✅ Added ${attr.key} attribute`);
      }

    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Typing Tests collection already exists');
      } else {
        throw error;
      }
    }

    // Step 4: Create Leaderboards Collection
    console.log('\n🏆 Creating Leaderboards collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.LEADERBOARDS,
        'Leaderboards',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Leaderboards collection created');

      // Add attributes to Leaderboards collection
      const leaderboardAttributes = [
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'username', type: 'string', size: 255, required: true },
        { key: 'best_wpm', type: 'integer', required: true },
        { key: 'language', type: 'string', size: 50, required: true },
        { key: 'duration_category', type: 'string', size: 10, required: true }
      ];

      for (const attr of leaderboardAttributes) {
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.LEADERBOARDS, attr.key, attr.size || 255, attr.required);
        console.log(`  ✅ Added ${attr.key} attribute`);
      }

    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Leaderboards collection already exists');
      } else {
        throw error;
      }
    }

    // Step 5: Create User Settings Collection
    console.log('\n⚙️  Creating User Settings collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.USER_SETTINGS,
        'User Settings',
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ User Settings collection created');

      // Add attributes to User Settings collection
      const settingsAttributes = [
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'theme', type: 'string', size: 20, required: true, default: 'system' },
        { key: 'preferred_language', type: 'string', size: 20, required: true, default: 'english' },
        { key: 'default_test_duration', type: 'integer', required: true, default: 60 },
        { key: 'show_leaderboard', type: 'boolean', required: true, default: true }
      ];

      for (const attr of settingsAttributes) {
        if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.USER_SETTINGS, attr.key, attr.required, attr.default);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_SETTINGS, attr.key, attr.required, attr.default);
        } else {
          await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_SETTINGS, attr.key, attr.size || 255, attr.required, attr.default);
        }
        console.log(`  ✅ Added ${attr.key} attribute`);
      }

    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  User Settings collection already exists');
      } else {
        throw error;
      }
    }

    // Step 6: Create Indexes for better performance
    console.log('\n📊 Creating database indexes...');

    const indexes = [
      // Typing Tests indexes
      { collection: COLLECTIONS.TYPING_TESTS, key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
      { collection: COLLECTIONS.TYPING_TESTS, key: 'test_date_idx', type: 'key', attributes: ['test_date'] },
      { collection: COLLECTIONS.TYPING_TESTS, key: 'language_idx', type: 'key', attributes: ['language'] },
      { collection: COLLECTIONS.TYPING_TESTS, key: 'wpm_idx', type: 'key', attributes: ['wpm'] },

      // Leaderboards indexes
      { collection: COLLECTIONS.LEADERBOARDS, key: 'best_wpm_idx', type: 'key', attributes: ['best_wpm'] },
      { collection: COLLECTIONS.LEADERBOARDS, key: 'language_duration_idx', type: 'key', attributes: ['language', 'duration_category'] },

      // User Settings indexes
      { collection: COLLECTIONS.USER_SETTINGS, key: 'user_id_settings_idx', type: 'key', attributes: ['user_id'] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          index.collection,
          index.key,
          index.type,
          index.attributes
        );
        console.log(`  ✅ Created ${index.key} index on ${index.collection}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ️  Index ${index.key} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${index.key} index:`, error.message);
        }
      }
    }

    console.log('\n🎉 Appwrite database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Database: ${DATABASE_ID}`);
    console.log(`   Collections: ${Object.values(COLLECTIONS).length}`);
    console.log(`   - ${COLLECTIONS.USERS} (User profiles)`);
    console.log(`   - ${COLLECTIONS.TYPING_TESTS} (Test results)`);
    console.log(`   - ${COLLECTIONS.LEADERBOARDS} (Global rankings)`);
    console.log(`   - ${COLLECTIONS.USER_SETTINGS} (User preferences)`);
    console.log('\n🔧 Next steps:');
    console.log('   1. Update your .env.local with Appwrite credentials');
    console.log('   2. Test the authentication flow');
    console.log('   3. Verify data synchronization works properly');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check your environment variables');
    console.log('   2. Ensure your API key has database.write permissions');
    console.log('   3. Verify your Appwrite project is active');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupAppwriteDatabase();
}

module.exports = { setupAppwriteDatabase };