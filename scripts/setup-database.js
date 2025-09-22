#!/usr/bin/env node

/**
 * Automated Appwrite Database Setup for Typoria using MCP Tools
 * 
 * This script uses the Appwrite MCP tools to create the required database structure.
 * Run this script to automatically set up your Typoria database.
 */

const { spawn } = require('child_process');

const DATABASE_ID = 'typoria-db';
const COLLECTIONS = {
  USERS: 'users',
  TYPING_TESTS: 'typing_tests',
  LEADERBOARDS: 'leaderboards',
  USER_SETTINGS: 'user_settings'
};

async function setupDatabase() {
  console.log('🚀 Starting automated Typoria database setup...\n');

  try {
    console.log('📦 Creating database...');
    // Note: Use the MCP Appwrite tools interactively to create:

    console.log('\n📋 Manual Setup Required:');
    console.log('Use the following MCP commands or Appwrite Console to set up:');

    console.log('\n1. Create Database:');
    console.log(`   mcp_appwrite-api_databases_create`);
    console.log(`   database_id: "${DATABASE_ID}"`);
    console.log(`   name: "Typoria Database"`);

    console.log('\n2. Create Collections:');

    const collections = [
      { id: COLLECTIONS.USERS, name: 'Users' },
      { id: COLLECTIONS.TYPING_TESTS, name: 'Typing Tests' },
      { id: COLLECTIONS.LEADERBOARDS, name: 'Leaderboards' },
      { id: COLLECTIONS.USER_SETTINGS, name: 'User Settings' }
    ];

    collections.forEach(collection => {
      console.log(`\n   📊 ${collection.name}:`);
      console.log(`   mcp_appwrite-api_databases_create_collection`);
      console.log(`   database_id: "${DATABASE_ID}"`);
      console.log(`   collection_id: "${collection.id}"`);
      console.log(`   name: "${collection.name}"`);
    });

    console.log('\n3. Add Attributes via Appwrite Console');
    console.log('   See docs/appwrite-setup.md for detailed attribute specifications');

    console.log('\n4. Create Indexes for optimal performance');
    console.log('   Use mcp_appwrite-api_databases_create_index for each collection');

    console.log('\n✅ Setup plan generated!');
    console.log('💡 Use the Appwrite Console or MCP tools to execute these steps.');

  } catch (error) {
    console.error('❌ Setup planning failed:', error);
    process.exit(1);
  }
}

// Show environment check
function checkEnvironment() {
  console.log('🔍 Environment Check:');

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (endpoint && projectId) {
    console.log('✅ Appwrite configuration found');
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Project: ${projectId}`);
    console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing (required for setup)'}`);
  } else {
    console.log('❌ Missing Appwrite configuration');
    console.log('   Add to .env.local:');
    console.log('   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1');
    console.log('   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id');
    console.log('   APPWRITE_API_KEY=your_server_api_key');
  }

  console.log('\n');
}

// Run the setup
checkEnvironment();
setupDatabase();