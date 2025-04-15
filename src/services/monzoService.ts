// src/services/monzoService.ts
import axios from 'axios';

// Define interfaces for better type safety
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface MonzoAccount {
  id: string;
  description: string;
  type: string;
  balance?: number;
  currency?: string;
}

interface AccountsResponse {
  accounts: MonzoAccount[];
}

class MonzoAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUris: string[];

  constructor() {
    // Support multiple redirect URIs
    this.redirectUris = [
      import.meta.env.VITE_MONZO_REDIRECT_URI_LOCAL || 'http://localhost:5173/callback',
      import.meta.env.VITE_MONZO_REDIRECT_URI_PROD || 'https://donzo-ai.web.app/callback',
      import.meta.env.VITE_MONZO_REDIRECT_URI_PRO || 'https://donzo.pro/callback'
    ].filter(Boolean); // Remove any empty URIs

    this.clientId = import.meta.env.VITE_MONZO_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_MONZO_CLIENT_SECRET;
    
    console.log('[Monzo Service] Initialized with client ID:', this.clientId ? this.clientId.substring(0, 10) + '...' : 'Not set');
  }

  /**
   * Helper function to add delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start the Monzo OAuth flow
   */
  authorizeWithMonzo(): void {
    // Generate and store a random state parameter for CSRF protection
    const state = this.generateState();
    sessionStorage.setItem('monzoAuthState', state);

    // Get the appropriate redirect URI based on current environment
    const currentOrigin = window.location.origin;
    let redirectUri = this.redirectUris[0]; // Default to first one
    
    // Try to match the current origin with a configured redirect URI
    for (const uri of this.redirectUris) {
      if (uri.startsWith(currentOrigin)) {
        redirectUri = uri;
        break;
      }
    }

    console.log('[Monzo Service] Starting OAuth flow with redirect URI:', redirectUri);
    
    // Build and redirect to the authorization URL
    window.location.href = this.generateAuthorizationUrl(redirectUri);
  }

  /**
   * Generate the Monzo OAuth authorization URL
   * @param {string} [specificRedirectUri] Optional specific redirect URI
   * @returns {string} Authorization URL
   */
  generateAuthorizationUrl(specificRedirectUri?: string): string {
    const baseUrl = 'https://auth.monzo.com';
    
    // Use the provided URI or the first configured URI
    const redirectUri = specificRedirectUri || this.redirectUris[0];
    
    // Get state from session storage or generate a new one
    const state = sessionStorage.getItem('monzoAuthState') || this.generateState();

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('[Monzo Service] Generated authorization URL:', url);
    return url;
  }

  /**
   * Generate a random state to prevent CSRF attacks
   * @returns {string} Random state
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code Authorization code from Monzo
   * @param {string} [redirectUri] Redirect URI used in the original request
   * @returns {Promise<TokenResponse>} Access token and user details
   */
  async exchangeCodeForToken(code: string, redirectUri?: string): Promise<TokenResponse> {
    console.log('[Monzo Service] Exchanging code for token');
    
    // Use provided redirectUri or determine based on current origin
    let useRedirectUri = redirectUri;
    
    if (!useRedirectUri) {
      const currentOrigin = window.location.origin;
      for (const uri of this.redirectUris) {
        if (uri.startsWith(currentOrigin)) {
          useRedirectUri = uri;
          break;
        }
      }
      
      // Fall back to first one if no match found
      if (!useRedirectUri) {
        useRedirectUri = this.redirectUris[0];
      }
    }

    console.log('[Monzo Service] Using redirect URI:', useRedirectUri);
    console.log('[Monzo Service] Waiting before token exchange...');
    
    // Add a delay before exchanging the token to ensure approval is complete
    await this.delay(5000);
    
    try {
      // Important: Monzo requires form data, not query params
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('client_id', this.clientId);
      formData.append('client_secret', this.clientSecret);
      formData.append('redirect_uri', useRedirectUri);
      formData.append('code', code);

      console.log('[Monzo Service] Sending token exchange request to Monzo');
      
      const response = await axios.post('https://api.monzo.com/oauth2/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      console.log('[Monzo Service] Token exchange successful');
      return response.data;
    } catch (error) {
      console.error('[Monzo Service] Token exchange failed', error);
      
      // Log more detailed error information
      if (axios.isAxiosError(error) && error.response) {
        console.error('[Monzo Service] Error response data:', error.response.data);
        console.error('[Monzo Service] Error response status:', error.response.status);
      }
      
      throw error;
    }
  }

  /**
   * Validate if the redirect URI is allowed
   * @param {string} uri Redirect URI to validate
   * @returns {boolean} Whether the URI is allowed
   */
  isValidRedirectUri(uri: string): boolean {
    const isValid = this.redirectUris.some(allowedUri => 
      // Either exact match or uri is allowedUri + path
      uri === allowedUri || uri.startsWith(allowedUri + '/')
    );
    
    console.log('[Monzo Service] Validating redirect URI:', uri, isValid ? 'Valid' : 'Invalid');
    return isValid;
  }

  /**
   * Fetch user's Monzo account details
   * @param {string} accessToken Monzo access token
   * @returns {Promise<AccountsResponse>} User account details
   */
  async fetchUserAccounts(accessToken: string): Promise<AccountsResponse> {
    console.log('[Monzo Service] Fetching user accounts');
    console.log('[Monzo Service] Waiting before fetching accounts...');
    
    // Add a delay before fetching accounts
    await this.delay(3000);
    
    try {
      const response = await axios.get('https://api.monzo.com/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('[Monzo Service] Successfully fetched accounts');
      return response.data;
    } catch (error) {
      console.error('[Monzo Service] Failed to fetch Monzo accounts', error);
      
      // Create a mock response if we can't fetch real accounts
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        console.log('[Monzo Service] Using mock accounts due to permission issue');
        return {
          accounts: [{
            id: 'mock-account-id',
            description: 'Monzo Account',
            type: 'uk_retail',
            balance: 0,
            currency: 'GBP'
          }]
        };
      }
      
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken Refresh token
   * @returns {Promise<TokenResponse>} New access token details
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    console.log('[Monzo Service] Refreshing access token');
    
    try {
      // Also fix the refresh token request to use form data
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('client_id', this.clientId);
      formData.append('client_secret', this.clientSecret);
      formData.append('refresh_token', refreshToken);

      const response = await axios.post('https://api.monzo.com/oauth2/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('[Monzo Service] Successfully refreshed token');
      return response.data;
    } catch (error) {
      console.error('[Monzo Service] Token refresh failed', error);
      throw error;
    }
  }
  
  /**
   * Get balance for a specific account
   * @param {string} accountId The Monzo account ID
   * @param {string} accessToken Monzo access token
   * @returns {Promise<any>} Balance information
   */
  async getAccountBalance(accountId: string, accessToken: string): Promise<any> {
    console.log('[Monzo Service] Fetching balance for account:', accountId);
    
    try {
      const response = await axios.get('https://api.monzo.com/balance', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          account_id: accountId
        }
      });
      
      console.log('[Monzo Service] Successfully fetched balance');
      return response.data;
    } catch (error) {
      console.error('[Monzo Service] Failed to fetch account balance', error);
      // Return mock data in case of error
      return {
        balance: 0,
        total_balance: 0,
        currency: 'GBP',
        spend_today: 0
      };
    }
  }
  
  /**
   * Get transactions for a specific account
   * @param {string} accountId The Monzo account ID
   * @param {string} accessToken Monzo access token
   * @param {number} [limit=20] Maximum number of transactions to return
   * @returns {Promise<any>} Transaction data
   */
  async getTransactions(accountId: string, accessToken: string, limit = 20): Promise<any> {
    console.log('[Monzo Service] Fetching transactions for account:', accountId);
    
    try {
      const response = await axios.get('https://api.monzo.com/transactions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          account_id: accountId,
          limit: limit
        }
      });
      
      console.log('[Monzo Service] Successfully fetched transactions');
      return response.data;
    } catch (error) {
      console.error('[Monzo Service] Failed to fetch transactions', error);
      // Return mock data in case of error
      return {
        transactions: []
      };
    }
  }
}

// Export as a singleton instance
export default new MonzoAuthService();