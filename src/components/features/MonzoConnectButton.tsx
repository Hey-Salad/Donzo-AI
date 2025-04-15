import React from 'react';
import { CreditCard } from 'lucide-react';
import MonzoAuthService from '../../services/monzoService';

interface MonzoConnectButtonProps {
  className?: string;
}

const MonzoConnectButton: React.FC<MonzoConnectButtonProps> = ({ className }) => {
  const handleConnect = () => {
    // Show instructions before starting OAuth flow
    if (window.confirm(
      'You will be redirected to authorize Donzo with your Monzo account.\n\n' +
      '1. After authorizing, you\'ll need to approve the request in your Monzo app\n' +
      '2. Please have your Monzo app ready to approve the request\n\n' +
      'Continue to Monzo authorization?'
    )) {
      // Generate a new state parameter for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('monzoAuthState', state);
      
      // Start the Monzo OAuth flow
      MonzoAuthService.authorizeWithMonzo();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className={`flex items-center justify-center px-4 py-2 bg-donzo-primary text-white rounded-md hover:bg-donzo-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-donzo-primary ${className || ''}`}
    >
      <CreditCard className="w-5 h-5 mr-2" />
      Connect Monzo Account
    </button>
  );
};

export default MonzoConnectButton;