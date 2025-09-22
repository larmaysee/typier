#!/usr/bin/env node

/**
 * User Settings Schema Update Script
 * 
 * This script provides instructions for adding new attributes to the user_settings collection
 * to support enhanced user preferences in Typoria.
 */

const ADDITIONAL_ATTRIBUTES = [
  {
    key: 'show_shift_label',
    type: 'Boolean',
    required: false,
    default: false,
    description: 'Whether to show shift key labels on virtual keyboard'
  },
  {
    key: 'practice_mode',
    type: 'Boolean',
    required: false,
    default: false,
    description: 'Enable practice mode for focused typing sessions'
  },
  {
    key: 'difficulty_mode',
    type: 'String',
    size: 20,
    required: false,
    default: 'syntaxs',
    enum: ['chars', 'syntaxs'],
    description: 'Typing difficulty mode: characters or sentences'
  },
  {
    key: 'color_theme',
    type: 'String',
    size: 50,
    required: false,
    default: 'default',
    description: 'Selected color theme ID'
  }
];

function generateInstructions() {
  console.log('🎨 User Settings Schema Update Instructions\n');
  console.log('Add the following attributes to your user_settings collection:\n');

  ADDITIONAL_ATTRIBUTES.forEach((attr, index) => {
    console.log(`${index + 1}. ${attr.key} (${attr.type})`);
    console.log(`   - Description: ${attr.description}`);
    console.log(`   - Required: ${attr.required}`);
    if (attr.default !== undefined) {
      console.log(`   - Default: ${attr.default}`);
    }
    if (attr.size) {
      console.log(`   - Max Size: ${attr.size} characters`);
    }
    if (attr.enum) {
      console.log(`   - Allowed Values: ${attr.enum.join(', ')}`);
    }
    console.log('');
  });

  console.log('📋 Steps to Update:');
  console.log('1. Open your Appwrite Console');
  console.log('2. Navigate to Databases → typoria-db → user_settings collection');
  console.log('3. Go to the Attributes tab');
  console.log('4. Add each attribute listed above with the specified properties');
  console.log('5. Make sure all attributes are marked as optional (required: false)');
  console.log('6. Save and wait for indexing to complete\n');

  console.log('✅ After adding these attributes, authenticated users will have their');
  console.log('   preferences automatically synced across devices!');
}

generateInstructions();