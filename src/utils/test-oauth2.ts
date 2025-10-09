import dotenv from 'dotenv';
import { generateRefreshToken } from './oauth2.helper';

// Load environment variables
dotenv.config();

/**
 * Test script for OAuth2 setup
 * 
 * This script demonstrates how to generate a refresh token programmatically.
 */

const runOAuth2Test = async () => {
  try {
    console.log('Gmail OAuth2 Refresh Token Generator');
    console.log('====================================');
    
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file');
      return;
    }
    
    console.log('Starting OAuth2 flow to generate refresh token...');
    console.log('Make sure your Google Cloud project is properly configured.');
    
    // Generate refresh token
    const refreshToken = await generateRefreshToken();
    
    console.log('\nSetup complete!');
    console.log('The refresh token has been generated and displayed above.');
    console.log('Update your .env file with this refresh token if you want to avoid the OAuth2 flow in the future:');
    console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}`);
    
  } catch (error) {
    console.error('Error during OAuth2 test:', error);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  runOAuth2Test();
}

export default runOAuth2Test;
