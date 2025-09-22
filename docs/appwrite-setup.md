# Appwrite Database Setup Instructions

## Overview
The Typoria application requires an Appwrite backend with specific database collections and attributes. This guide will help you set up the database structure.

## Required Collections

### 1. Database: `typoria-db`

### 2. Collections:

#### Users Collection (`users`)
**Purpose**: Store user profile information
**Attributes**:
- `username` (String, 255 chars, required)
- `email` (Email, required) 
- `total_tests` (Integer, required, default: 0)
- `best_wpm` (Integer, required, default: 0)
- `average_accuracy` (Float, required, default: 0.0)

**Permissions**:
- Read: Any
- Create/Update/Delete: Users

#### Typing Tests Collection (`typing_tests`)
**Purpose**: Store individual typing test results
**Attributes**:
- `user_id` (String, 255 chars, required)
- `wpm` (Integer, required)
- `accuracy` (Float, required)
- `correct_words` (Integer, required)
- `incorrect_words` (Integer, required)
- `total_words` (Integer, required)
- `duration` (Integer, required)
- `language` (String, 50 chars, required) - Values: 'english', 'lisu', 'myanmar'
- `characters_typed` (Integer, required)
- `errors` (Integer, required)
- `test_date` (DateTime, required)

**Permissions**:
- Read: Any
- Create/Update/Delete: Users

#### Leaderboards Collection (`leaderboards`)
**Purpose**: Store best performances for global rankings
**Attributes**:
- `user_id` (String, 255 chars, required)
- `username` (String, 255 chars, required)
- `best_wpm` (Integer, required)
- `language` (String, 50 chars, required) - Values: 'english', 'lisu', 'myanmar'
- `duration_category` (String, 10 chars, required) - Values: '15', '30', '60', '120'

**Permissions**:
- Read: Any
- Create/Update/Delete: Users

#### User Settings Collection (`user_settings`)
**Purpose**: Store user preferences and settings
**Attributes**:
- `user_id` (String, 255 chars, required)
- `theme` (String, 20 chars, required, default: 'system')
- `preferred_language` (String, 20 chars, required, default: 'english')
- `default_test_duration` (Integer, required, default: 60)
- `show_leaderboard` (Boolean, required, default: true)

**Permissions**:
- Read/Create/Update/Delete: Users only

## Recommended Indexes

### Typing Tests Collection:
- `user_id_idx` on `user_id` (for user-specific queries)
- `test_date_idx` on `test_date` (for time-based filtering)
- `language_idx` on `language` (for language filtering)
- `wpm_idx` on `wpm` (for performance rankings)

### Leaderboards Collection:
- `best_wpm_idx` on `best_wpm` (for rankings)
- `language_duration_idx` on `language, duration_category` (for filtered leaderboards)

### User Settings Collection:
- `user_id_settings_idx` on `user_id` (for user settings lookup)

## Setup Steps

1. **Create Database**: Use Appwrite Console or API to create database with ID `typoria-db`

2. **Create Collections**: Create each collection with the specified attributes and permissions

3. **Add Indexes**: Create the recommended indexes for optimal query performance

4. **Test Integration**: Verify the TypeScript service layer works with your database structure

## Environment Variables Required

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
```

## Verification

After setup, test the following functionality:
- User authentication and profile creation
- Typing test result storage
- Leaderboard data retrieval
- User settings persistence

The application gracefully falls back to localStorage if Appwrite is not configured, so users can still use the app offline.