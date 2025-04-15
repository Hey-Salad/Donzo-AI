import React, { useState } from 'react';
import { useAuth, MonzoAccount } from '../../context/AuthContext';
import { Mic, Eye, EyeOff, RefreshCw, } from 'lucide-react';
import MonzoConnectButton from '../../components/features/MonzoConnectButton';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [balanceHidden, setBalanceHidden] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasMonzoConnected = currentUser?.accounts && currentUser.accounts.length > 0;

  // Function to toggle balance visibility
  const toggleBalanceVisibility = () => {
    setBalanceHidden(!balanceHidden);
  };

  // Function to handle microphone click
  const handleMicClick = () => {
    setIsListening(true);
    setMessage("Listening... (Voice functionality would be implemented here)");
    
    // Simulate listening for 3 seconds then stop
    setTimeout(() => {
      setIsListening(false);
      setMessage("Voice command received! Processing...");
      
      // Clear message after 2 more seconds
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    }, 3000);
  };

  // Function to refresh account data
  const refreshAccountData = async () => {
    if (!currentUser?.accessToken) return;
    
    setRefreshing(true);
    try {
      // This would be replaced with actual refresh logic using your auth context
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setMessage("Account data refreshed successfully!");
      
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage("Failed to refresh account data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Format balance for display
  const formatBalance = (balance?: number, currency?: string) => {
    if (balance === undefined) return "N/A";
    return (balance / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: currency || 'GBP'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/donzo-logo.svg" 
                alt="Donzo Logo" 
                className="h-10 w-10 mr-2" 
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const div = document.createElement('div');
                    div.className = 'h-10 w-10 bg-donzo-primary rounded-full flex items-center justify-center';
                    div.innerHTML = '<span class="text-white font-bold text-xl">D</span>';
                    parent.insertBefore(div, target);
                  }
                }}
              />
              <span className="text-2xl font-bold text-donzo-primary">Donzo</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleMicClick}
                className={`p-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="Voice command"
              >
                <Mic className={`h-5 w-5 ${isListening ? 'text-white' : 'text-gray-700'}`} />
              </button>
              
              <button 
                onClick={logout}
                className="px-4 py-2 border border-donzo-primary text-donzo-primary rounded-md hover:bg-donzo-primary hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Status message */}
      {message && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-50">
          <div className="bg-blue-100 border-l-4 border-donzo-primary text-donzo-primary p-4 rounded shadow-md">
            {message}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Dashboard</h1>
        
        {currentUser ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Welcome back, {currentUser.email?.split('@')[0] || 'User'}
              </h2>
              
              {!hasMonzoConnected && (
                <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-donzo-primary">Connect Your Monzo Account</h3>
                  <p className="text-gray-600 mb-4">
                    Link your Monzo account to get real-time insights about your spending and finances.
                  </p>
                  <MonzoConnectButton />
                </div>
              )}
            </div>
            
            {/* Accounts Section - Only show if Monzo is connected */}
            {hasMonzoConnected && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Your Monzo Accounts</h2>
                    <button 
                      onClick={refreshAccountData}
                      className={`p-2 rounded-full hover:bg-gray-100 ${refreshing ? 'animate-spin' : ''}`}
                      disabled={refreshing}
                    >
                      <RefreshCw className="h-5 w-5 text-donzo-primary" />
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {currentUser.accounts?.map((account: MonzoAccount, index: number) => (
                    <div key={index} className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-lg">{account.description || 'Monzo Account'}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-donzo-primary rounded-full">
                          {account.type}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Balance</p>
                          <div className="flex items-center">
                            <p className="text-2xl font-bold text-donzo-primary">
                              {balanceHidden ? 
                                "••••••" : 
                                formatBalance(account.balance, account.currency)
                              }
                            </p>
                            <button 
                              onClick={toggleBalanceVisibility}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              {balanceHidden ? 
                                <Eye className="h-5 w-5" /> : 
                                <EyeOff className="h-5 w-5" />
                              }
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Account ID</p>
                          <p className="text-gray-700 text-sm">
                            {account.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tasks section (placeholder for future implementation) */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Tasks</h2>
              <div className="text-center py-10 text-gray-500">
                <p>You don't have any tasks yet.</p>
                <p className="mt-2">Tasks feature coming soon!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-lg text-gray-600">Please log in to view your dashboard.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-donzo-primary text-white rounded-md hover:bg-donzo-secondary"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-donzo-primary text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Donzo. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;