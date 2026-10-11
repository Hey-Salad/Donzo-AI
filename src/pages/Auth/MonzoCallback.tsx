import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonzoAuthService from '../../services/monzoService';
import { useAuth } from '../../context/AuthContext';

const MonzoCallback: React.FC = () => {
  // Stages of the authorization process
  type Stage = 'init' | 'waiting-for-approval' | 'attempting-exchange' | 'token-received' | 'fetching-accounts' | 'success' | 'error';
  
  const [stage, setStage] = useState<Stage>('init');
  const [errorMessage, setErrorMessage] = useState('');
  const [approvalTime, setApprovalTime] = useState(60); // 60 seconds to approve
  const [waitTime, setWaitTime] = useState(10); // 10 seconds between stages
  const [tokenData, setTokenData] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);
  const { updateUserMonzoInfo } = useAuth();
  const navigate = useNavigate();

  // Log each stage change
  useEffect(() => {
    console.log(`[Monzo Auth] Current stage: ${stage}`);
  }, [stage]);

  // Initialize the process
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      setErrorMessage('No authorization code provided');
      setStage('error');
      return;
    }

    console.log('[Monzo Auth] Authorization code received from Monzo');
    console.log('[Monzo Auth] Entering waiting period for user approval');
    setStage('waiting-for-approval');
  }, []);

  // Approval timer countdown
  useEffect(() => {
    if (stage === 'waiting-for-approval' && approvalTime > 0) {
      const timer = setTimeout(() => {
        setApprovalTime(approvalTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'waiting-for-approval' && approvalTime === 0) {
      console.log('[Monzo Auth] Approval wait time finished');
      console.log('[Monzo Auth] Proceeding to token exchange');
      setStage('attempting-exchange');
    }
  }, [approvalTime, stage]);

  // Stage transition timer
  useEffect(() => {
    if (stage === 'attempting-exchange') {
      attemptTokenExchange();
    } else if (stage === 'token-received' && waitTime > 0) {
      const timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'token-received' && waitTime === 0) {
      console.log('[Monzo Auth] Post-token wait time finished');
      console.log('[Monzo Auth] Proceeding to fetch accounts');
      setStage('fetching-accounts');
      fetchAccounts();
    }
  }, [stage, waitTime]);

  // Attempt to exchange the authorization code for a token
  const attemptTokenExchange = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const redirectUri = window.location.origin + window.location.pathname;
      
      if (!code) {
        throw new Error('No authorization code available');
      }

      console.log('[Monzo Auth] Attempting to exchange code for token...');
      console.log(`[Monzo Auth] Code: ${code.substring(0, 10)}...`);
      console.log(`[Monzo Auth] Redirect URI: ${redirectUri}`);
      
      try {
        const tokenResponse = await MonzoAuthService.exchangeCodeForToken(code, redirectUri);
        console.log('[Monzo Auth] Token exchange successful');
        
        setTokenData({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token
        });
        
        // Reset wait time for next stage
        setWaitTime(10); 
        setStage('token-received');
      } catch (error: any) {
        console.error('[Monzo Auth] Token exchange error:', error);
        
        if (error.response?.data?.error_description === 'Authorization code has been used') {
          setErrorMessage('Your authorization code has already been used. Please try connecting again.');
        } else {
          setErrorMessage(error.response?.data?.error_description || error.message || 'Failed to exchange authorization code for token');
        }
        setStage('error');
      }
    } catch (error: any) {
      console.error('[Monzo Auth] Error in token exchange process:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      setStage('error');
    }
  };

  // Fetch account information using the token
  const fetchAccounts = async () => {
    if (!tokenData) {
      setErrorMessage('No token data available');
      setStage('error');
      return;
    }

    try {
      console.log('[Monzo Auth] Fetching Monzo accounts...');
      
      // Try to fetch accounts with the token
      const accountsResponse = await MonzoAuthService.fetchUserAccounts(tokenData.access_token);
      console.log('[Monzo Auth] Successfully fetched accounts');
      
      // Store tokens and user info
      localStorage.setItem('monzoAccessToken', tokenData.access_token);
      localStorage.setItem('monzoRefreshToken', tokenData.refresh_token);
      localStorage.setItem('monzoUserAccounts', JSON.stringify(accountsResponse.accounts));

      // Update user context with Monzo info
      updateUserMonzoInfo(
        tokenData.access_token,
        tokenData.refresh_token,
        accountsResponse.accounts
      );

      console.log('[Monzo Auth] User data updated successfully');
      setStage('success');
      
      // Short delay before redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('[Monzo Auth] Error fetching accounts:', error);
      
      // Even if accounts fetch fails, still save the tokens
      localStorage.setItem('monzoAccessToken', tokenData.access_token);
      localStorage.setItem('monzoRefreshToken', tokenData.refresh_token);
      
      // Create empty accounts array 
      updateUserMonzoInfo(
        tokenData.access_token,
        tokenData.refresh_token,
        []
      );
      
      console.log('[Monzo Auth] Saved token but couldn\'t fetch accounts');
      // Still consider this a success since we got the token
      setStage('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  // Allow user to skip the waiting periods
  const handleContinue = () => {
    if (stage === 'waiting-for-approval') {
      console.log('[Monzo Auth] User manually proceeded to token exchange');
      setStage('attempting-exchange');
    } else if (stage === 'token-received') {
      console.log('[Monzo Auth] User manually proceeded to account fetching');
      setStage('fetching-accounts');
      fetchAccounts();
    }
  };

  // Render the appropriate UI based on the current stage
  const renderContent = () => {
    switch (stage) {
      case 'init':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-donzo-primary mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Initializing authentication process...</p>
          </div>
        );
        
      case 'waiting-for-approval':
        return (
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-donzo-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Waiting for Approval
            </h2>
            
            <div className="mb-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-donzo-primary bg-blue-200">
                      Time to approve
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-donzo-primary">
                      {approvalTime} seconds
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-sm bg-blue-200">
                  <div style={{ width: `${(approvalTime / 60) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-donzo-primary transition-all duration-500"></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please open your Monzo app and approve the authorization request. 
              We'll wait for your approval before proceeding.
            </p>
            
            <button 
              onClick={handleContinue}
              className="w-full bg-donzo-primary text-white py-2 px-4 rounded-sm hover:bg-donzo-secondary transition duration-200"
            >
              I've Approved in Monzo App
            </button>
          </div>
        );
        
      case 'attempting-exchange':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-donzo-primary mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Exchanging authorization code for token...</p>
            <p className="text-gray-500 mt-2">This may take a moment</p>
          </div>
        );
        
      case 'token-received':
        return (
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Token Received Successfully!
            </h2>
            
            <div className="mb-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-donzo-primary bg-blue-200">
                      Waiting before fetching accounts
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-donzo-primary">
                      {waitTime} seconds
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-sm bg-blue-200">
                  <div style={{ width: `${(waitTime / 10) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-donzo-primary transition-all duration-500"></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              We've received your authorization token. Waiting a moment before fetching your account details to ensure everything is ready.
            </p>
            
            <button 
              onClick={handleContinue}
              className="w-full bg-donzo-primary text-white py-2 px-4 rounded-sm hover:bg-donzo-secondary transition duration-200"
            >
              Continue Now
            </button>
          </div>
        );
        
      case 'fetching-accounts':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-donzo-primary mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Fetching your Monzo accounts...</p>
            <p className="text-gray-500 mt-2">This will only take a moment</p>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <p className="text-gray-500 mb-6 text-sm">
              Please make sure to approve the request promptly in your Monzo app.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-donzo-primary text-white rounded-md hover:bg-donzo-secondary"
            >
              Return to Dashboard
            </button>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-xl text-gray-600">Successfully connected to Monzo!</p>
            <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default MonzoCallback;