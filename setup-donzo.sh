#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project Setup Script for Donzo

# Function to print section header
print_section() {
    echo -e "\n${BLUE}### $1 ###${NC}"
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✔ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Main project setup function
setup_donzo_project() {
    print_section "Donzo Project Setup"

    # Create core project directories
    print_section "Creating Project Structure"
    mkdir -p src/{components/{layout,common,features},context,hooks,pages/{Auth,Dashboard,Tasks,Finances},services,types,utils,assets/{icons,images}}
    print_success "Project directory structure created"

    # Install dependencies
    print_section "Installing Dependencies"
    npm install \
        axios \
        react-router-dom \
        zustand \
        @heroicons/react \
        lucide-react \
        daisyui \
        @azure/identity \
        @azure/openai

    # Install dev dependencies
    npm install -D \
        @types/react \
        @types/react-dom \
        eslint-plugin-react \
        eslint-plugin-react-hooks \
        typescript

    print_success "Dependencies installed"

    # Create Tailwind configuration
    print_section "Configuring Tailwind CSS"
    cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'donzo-primary': '#0c1726',
        'donzo-secondary': '#14233c',
        'donzo-accent': '#1e90ff',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
EOL
    print_success "Tailwind configuration created"

    # Update global CSS
    print_section "Updating Global CSS"
    cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
body {
  @apply bg-gray-50 text-gray-900;
}

/* Custom utility classes */
.btn-primary {
  @apply bg-donzo-primary text-white hover:bg-donzo-secondary transition-colors;
}
EOL
    print_success "Global CSS updated"

    # Create initial TypeScript configuration for Monzo service
    print_section "Creating Monzo Service"
    cat > src/services/monzoService.ts << EOL
import axios from 'axios';

interface MonzoCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userId: string;
  accountId: string;
  accessToken: string;
}

class MonzoService {
  private credentials: MonzoCredentials;

  constructor() {
    this.credentials = {
      clientId: import.meta.env.VITE_MONZO_CLIENT_ID,
      clientSecret: import.meta.env.VITE_MONZO_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_MONZO_REDIRECT_URI,
      userId: import.meta.env.VITE_MONZO_USER_ID,
      accountId: import.meta.env.VITE_MONZO_ACCOUNT_ID,
      accessToken: import.meta.env.VITE_MONZO_ACCESS_TOKEN,
    };
  }

  async getAccounts() {
    try {
      const response = await axios.get('https://api.monzo.com/accounts', {
        headers: {
          'Authorization': \`Bearer \${this.credentials.accessToken}\`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Monzo accounts', error);
      throw error;
    }
  }

  async getTransactions(accountId: string) {
    try {
      const response = await axios.get(\`https://api.monzo.com/transactions?account_id=\${accountId}\`, {
        headers: {
          'Authorization': \`Bearer \${this.credentials.accessToken}\`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      throw error;
    }
  }
}

export default new MonzoService();
EOL
    print_success "Monzo service created"

    # Create Azure AI service
    print_section "Creating Azure AI Service"
    cat > src/services/aiService.ts << EOL
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

class AzureAIService {
  private client: OpenAIClient;

  constructor() {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY;

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(key));
  }

  async generateResponse(prompt: string) {
    try {
      const deploymentId = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
      const response = await this.client.getChatCompletions(deploymentId, [
        { role: 'user', content: prompt }
      ]);

      return response.choices[0].message?.content || '';
    } catch (error) {
      console.error('Azure AI generation failed', error);
      throw error;
    }
  }
}

export default new AzureAIService();
EOL
    print_success "Azure AI service created"

    # Create .env file template
    print_section "Creating .env file"
    cat > .env << EOL
# Monzo API Credentials
VITE_MONZO_CLIENT_ID=${MONZO_CLIENT_ID}
VITE_MONZO_CLIENT_SECRET=${MONZO_CLIENT_SECRET}
VITE_MONZO_REDIRECT_URI=${MONZO_REDIRECT_URI}
VITE_MONZO_USER_ID=${MONZO_USER_ID}
VITE_MONZO_ACCOUNT_ID=${MONZO_ACCOUNT_ID}
VITE_MONZO_ACCESS_TOKEN=${MONZO_ACCESS_TOKEN}

# Azure OpenAI Settings
VITE_AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
VITE_AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
VITE_AZURE_API_VERSION=${AZURE_API_VERSION}
VITE_AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT}
VITE_AZURE_ASSISTANT_ID=${AZURE_ASSISTANT_ID}

# Azure Speech Service Settings
VITE_AZURE_SPEECH_KEY=${AZURE_SPEECH_KEY}
VITE_AZURE_SPEECH_ENDPOINT=${AZURE_SPEECH_ENDPOINT}
VITE_AZURE_SPEECH_REGION=${AZURE_SPEECH_REGION}
EOL
    print_success ".env file created"

    # Create README
    print_section "Creating README"
    cat > README.md << EOL
# Donzo

A financial task management application built with Vite + React + TypeScript

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy .env.example to .env and fill in your credentials

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Features

- Task Management
- Monzo Banking Integration
- AI-Powered Insights
- Voice Interactions

## Environment Variables

- \`VITE_MONZO_CLIENT_ID\`: Monzo API Client ID
- \`VITE_MONZO_CLIENT_SECRET\`: Monzo API Client Secret
- \`VITE_AZURE_OPENAI_ENDPOINT\`: Azure OpenAI Endpoint
- \`VITE_AZURE_OPENAI_KEY\`: Azure OpenAI API Key
EOL
    print_success "README created"

    # Final setup messages
    echo -e "\n${GREEN}Donzo project setup complete!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Review the .env file"
    echo "2. Run 'npm run dev' to start the development server"
}

# Run the setup function
setup_donzo_project