// src/LandingPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, CreditCard, Brain, Mic, Menu, X } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    const confirm = window.confirm('Would you like to create a new account? Click OK to sign up or Cancel to log in.');
    if (confirm) {
      window.location.href = '/signup';
    } else {
      window.location.href = '/login';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/donzo-logo.svg" alt="Donzo" className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl text-gray-800">Donzo</span>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 mr-4">
                Login
              </Link>
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <Link 
              to="/login" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                handleGetStarted();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Your tasks, <span className="text-blue-600">done</span>.
              </h1>
              <p className="mt-3 text-xl text-gray-500">
                Donzo combines task management with financial insights from your Monzo account.
              </p>
              <div className="mt-8">
                <button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="bg-blue-100 rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <h3 className="font-bold">Task Tracking</h3>
                    <p className="text-gray-600 text-sm">Manage your tasks efficiently</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="font-bold">Monzo Integration</h3>
                    <p className="text-gray-600 text-sm">Link with your Monzo account</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Brain className="h-8 w-8 text-purple-500 mb-2" />
                    <h3 className="font-bold">AI Powered</h3>
                    <p className="text-gray-600 text-sm">Smart insights and suggestions</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <Mic className="h-8 w-8 text-red-500 mb-2" />
                    <h3 className="font-bold">Voice Control</h3>
                    <p className="text-gray-600 text-sm">Speak to manage your tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;