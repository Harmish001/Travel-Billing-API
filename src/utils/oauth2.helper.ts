import { google } from 'googleapis';
import readline from 'readline';

// Use localhost as the redirect URI for installed applications
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

/**
 * Create a new OAuth2 client instance
 * @returns OAuth2Client instance
 */
export const createOAuth2Client = () => {
  // Verify that we have the required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables');
  }
  
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI // Use localhost redirect URI
  );
};

/**
 * Generate authorization URL for initial OAuth2 setup
 * @param scopes The scopes to request
 * @returns Authorization URL
 */
export const generateAuthUrl = (scopes: string[] = ['https://mail.google.com/']) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get refresh token
      scope: scopes,
      prompt: 'consent', // Force to show consent screen to ensure we get a refresh token
      include_granted_scopes: true
    });
    
    return authUrl;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
};

/**
 * Get tokens (access token and refresh token) using authorization code
 * @param code The authorization code received from Google
 * @returns Access token, refresh token, and expiration information
 */
export const getTokensFromCode = async (code: string) => {
  try {
    const oauth2Client = createOAuth2Client();
    
    const tokenResponse: any = await oauth2Client.getToken(code);
    
    // Ensure we have a refresh token
    if (!tokenResponse.tokens.refresh_token) {
      throw new Error('No refresh token received. Make sure to use prompt=consent.');
    }
    
    return {
      accessToken: tokenResponse.tokens.access_token,
      refreshToken: tokenResponse.tokens.refresh_token,
      expires: tokenResponse.tokens.expiry_date
    };
  } catch (error: any) {
    console.error('Error getting tokens from code:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Generate refresh token programmatically by running the full OAuth2 flow
 * @returns Refresh token
 */
export const generateRefreshToken = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate authorization URL
      const authUrl = generateAuthUrl();
      console.log('Please visit the following URL in your browser:');
      console.log(authUrl);
      console.log('After granting permission, copy the full redirect URL and paste it below.');
      
      // Create readline interface for user input
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Prompt user for authorization code
      rl.question('Enter the full redirect URL or just the authorization code: ', async (input) => {
        try {
          if (!input) {
            throw new Error('No input provided');
          }
          
          // Extract code from URL if full URL is provided
          let code = input;
          if (input.startsWith('http')) {
            // Extract code parameter from URL
            const url = new URL(input);
            code = url.searchParams.get('code') || input;
          }
          
          if (!code) {
            throw new Error('Could not extract authorization code from input');
          }
          
          // Exchange code for tokens
          const tokens = await getTokensFromCode(code.trim());
          
          console.log('Refresh token generated successfully!');
          console.log('Please update your .env file with this refresh token:');
          console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refreshToken}`);
          
          rl.close();
          resolve(tokens.refreshToken);
        } catch (error) {
          rl.close();
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get OAuth2 access token using refresh token
 * @param refreshToken The refresh token
 * @returns Access token and expiration time
 */
export const getOAuth2Token = async (refreshToken: string) => {
  try {
    // Verify that we have a refresh token
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }
    
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const tokenResponse: any = await oauth2Client.getAccessToken();
    
    const token = tokenResponse.token;
    
    if (!token) {
      throw new Error('Failed to generate access token');
    }
    
    return {
      accessToken: token,
      expires: tokenResponse.res?.data?.expires_in ? Date.now() + (tokenResponse.res.data.expires_in * 1000) : undefined
    };
  } catch (error: any) {
    console.error('Error generating OAuth2 token:', error.message);
    throw error;
  }
};

/**
 * Refresh the OAuth2 tokens using the refresh token
 * @param refreshToken The refresh token
 * @returns New access token and refresh token (if provided)
 */
export const refreshOAuth2Tokens = async (refreshToken: string) => {
  try {
    // Verify that we have a refresh token
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }
    
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    // Refresh the tokens
    const tokenResponse: any = await oauth2Client.refreshAccessToken();
    
    return {
      accessToken: tokenResponse.credentials.access_token,
      refreshToken: tokenResponse.credentials.refresh_token || refreshToken, // Use new refresh token if provided
      expires: tokenResponse.credentials.expiry_date
    };
  } catch (error: any) {
    console.error('Error refreshing OAuth2 tokens:', error.message);
    throw error;
  }
};

export default {
  createOAuth2Client,
  generateAuthUrl,
  getTokensFromCode,
  generateRefreshToken,
  getOAuth2Token,
  refreshOAuth2Tokens
};