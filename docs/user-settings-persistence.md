# User Settings Persistence Implementation

## Overview
This update enables authenticated users to have their settings automatically synced across devices via Appwrite database, while maintaining backward compatibility with localStorage for guest users.

## Changes Made

### 1. Enhanced User Settings Schema
- Updated `UserSettingsDocument` interface in `src/lib/appwrite.ts` to include:
  - `show_shift_label`: Boolean for keyboard shift label visibility
  - `practice_mode`: Boolean for practice mode toggle
  - `difficulty_mode`: String enum for 'chars' or 'syntaxs' difficulty
  - `color_theme`: String for selected color theme ID

### 2. Updated Site Configuration Provider
- Modified `src/components/site-config.tsx` to:
  - Load settings from Appwrite for authenticated users
  - Fall back to localStorage for guest users
  - Automatically save changes to both Appwrite and localStorage
  - Handle async operations properly with loading states

### 3. Provider Hierarchy Changes
- Moved `SiteConfigProvider` inside `AuthProvider` in `src/app/page.tsx`
- Removed from root layout to allow access to authentication context
- Provider order: `AuthProvider` → `SiteConfigProvider` → `TypingStatisticsProvider`

### 4. Settings Page Enhancements
- Added sync status indicator (Cloud/Local storage badges)
- Updated to handle async setting operations
- Improved user feedback for save operations

## Database Setup Required

Before using the enhanced features, add these attributes to your `user_settings` collection in Appwrite Console:

1. **show_shift_label** (Boolean, optional, default: false)
2. **practice_mode** (Boolean, optional, default: false)  
3. **difficulty_mode** (String, 20 chars, optional, default: 'syntaxs')
4. **color_theme** (String, 50 chars, optional, default: 'default')

Run the setup script for detailed instructions:
```bash
node scripts/update-user-settings-schema.js
```

## Behavior

### Authenticated Users
- Settings automatically sync to Appwrite database
- Changes persist across devices and browser sessions
- Graceful fallback to localStorage if database operations fail
- Visual indicator shows "Synced to Cloud" status

### Guest Users
- Settings continue to use localStorage only
- Visual indicator shows "Stored Locally" status
- Same functionality as before, no breaking changes

### Fallback Strategy
- App continues to work if Appwrite is not configured
- Database errors don't prevent setting changes
- Dual storage (database + localStorage) ensures reliability

## Testing

The implementation maintains full backward compatibility:
- Existing localStorage settings are preserved
- No breaking changes to component APIs
- Graceful degradation when authentication is unavailable

## Future Enhancements

Consider adding these settings to the database schema:
- `default_test_duration`: Configurable test duration preference
- `show_leaderboard`: Toggle leaderboard visibility
- `keyboard_sound_enabled`: Audio feedback preferences
- `auto_start_next_test`: Test flow preferences