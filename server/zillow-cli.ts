#!/usr/bin/env tsx

/**
 * Zillow Property Sync CLI Tool
 * 
 * Usage:
 *   npm run zillow:sync     - Sync properties from Zillow to database
 *   npm run zillow:test     - Test Zillow API connection
 *   npm run zillow:fetch    - Fetch properties without database sync
 */

import { fetchZillowProperties } from './zillow-integration';
import { storage } from './storage';

const API_KEY = process.env.ZILLOW_API_KEY || 'f55f0e551fmsh7d0f78b6fae347ep11d027jsndf2d636b16bf';

async function runCommand() {
  const command = process.argv[2];
  
  if (!API_KEY) {
    console.error('❌ Error: ZILLOW_API_KEY not configured');
    console.log('Please set the ZILLOW_API_KEY environment variable or update the default in zillow-cli.ts');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'test':
        console.log('🔍 Testing Zillow API connection...');
        const testResult = await fetchZillowProperties(API_KEY, undefined, false);
        console.log(`✅ Connection successful! Found ${testResult.properties.length} properties`);
        if (testResult.properties.length > 0) {
          console.log('\n📋 Sample property:');
          console.log(JSON.stringify(testResult.properties[0], null, 2));
        }
        break;

      case 'fetch':
        console.log('📥 Fetching properties from Zillow...');
        const fetchResult = await fetchZillowProperties(API_KEY, undefined, false);
        console.log(`✅ Retrieved ${fetchResult.properties.length} properties`);
        console.log(`💾 Data saved to: ${fetchResult.savedPath}`);
        break;

      case 'sync':
        console.log('🔄 Syncing properties from Zillow to database...');
        const syncResult = await fetchZillowProperties(API_KEY, undefined, true, storage);
        console.log(`✅ Retrieved ${syncResult.properties.length} properties from Zillow`);
        console.log(`💾 Data saved to: ${syncResult.savedPath}`);
        console.log(`🔄 Synced ${syncResult.syncedCount} new properties to database`);
        break;

      default:
        console.log('📋 Zillow Property Sync CLI');
        console.log('');
        console.log('Available commands:');
        console.log('  test   - Test Zillow API connection');
        console.log('  fetch  - Fetch properties without database sync');
        console.log('  sync   - Sync properties from Zillow to database');
        console.log('');
        console.log('Usage:');
        console.log('  tsx server/zillow-cli.ts [command]');
        break;
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Check if script is run directly (ES module equivalent)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  runCommand().catch(console.error);
}