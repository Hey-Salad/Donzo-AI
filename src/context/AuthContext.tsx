import React, { 
    createContext, 
    useState, 
    useContext, 
    useEffect 
  } from 'react';
  import { 
    User as FirebaseUser, 
    UserCredential,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
  } from 'firebase/auth';
  import { auth } from '../services/firebaseConfig';
  
  // Define Monzo Account interface
  export interface MonzoAccount {
    id: string;
    description: string;
    type: string;
    balance?: number;
    currency?: string;
  }
  
  // Extend FirebaseUser with Monzo-specific details
  export interface MonzoUser extends Omit<FirebaseUser, 'refreshToken'> {
    monzoId?: string;
    accounts?: MonzoAccount[];
    accessToken?: string;
    refreshToken?: string | null;
  }
  
  // Define the shape of the authentication context
  interface AuthContextType {
    currentUser: MonzoUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<UserCredential>;
    signup: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    updateUserMonzoInfo: (accessToken: string, refreshToken: string, accounts: MonzoAccount[]) => void;
  }
  
  // Create the context with default values
  const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    isAuthenticated: false,
    loading: true,
    login: async () => {
      throw new Error('Login not implemented');
    },
    signup: async () => {
      throw new Error('Signup not implemented');
    },
    logout: async () => {},
    updateUserMonzoInfo: () => {}
  });
  
  // Authentication Provider Component
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<MonzoUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Login method
    const login = async (email: string, password: string): Promise<UserCredential> => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
      } catch (error) {
        console.error('Login error', error);
        throw error;
      }
    };
  
    // Signup method
    const signup = async (email: string, password: string): Promise<UserCredential> => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
      } catch (error) {
        console.error('Signup error', error);
        throw error;
      }
    };
  
    // Logout method
    const logout = async () => {
      try {
        // Clear Monzo data from localStorage
        localStorage.removeItem('monzoAccessToken');
        localStorage.removeItem('monzoRefreshToken');
        localStorage.removeItem('monzoUserAccounts');
        
        await signOut(auth);
        
        // Force redirect to homepage after logout
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error', error);
        throw error;
      }
    };
  
    // Method to update user with Monzo information
    const updateUserMonzoInfo = (accessToken: string, refreshToken: string, accounts: MonzoAccount[]) => {
      console.log('Updating user Monzo info:', { accessToken: accessToken.substring(0, 10) + '...', accounts: accounts.length });
      
      if (currentUser) {
        const updatedUser: MonzoUser = {
          ...currentUser,
          accessToken,
          refreshToken,
          accounts
        };
        setCurrentUser(updatedUser);
      } else {
        console.error('Cannot update Monzo info: No current user');
      }
    };
  
    // Listen for authentication state changes
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Try to get Monzo data from localStorage
          const accessToken = localStorage.getItem('monzoAccessToken') || undefined;
          const refreshToken = localStorage.getItem('monzoRefreshToken') || null;
          let accounts: MonzoAccount[] = [];
          
          try {
            const accountsJson = localStorage.getItem('monzoUserAccounts');
            if (accountsJson) {
              accounts = JSON.parse(accountsJson);
            }
          } catch (e) {
            console.error('Error parsing Monzo accounts from localStorage', e);
          }
          
          // Type assertion to include Monzo-specific properties
          setCurrentUser({
            ...user,
            monzoId: user.uid,
            accessToken,
            refreshToken,
            accounts: accounts || []
          });
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      });
  
      // Cleanup subscription
      return unsubscribe;
    }, []);
  
    // Context value
    const value = {
      currentUser,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      updateUserMonzoInfo
    };
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Custom hook to use the auth context
  export const useAuth = () => useContext(AuthContext);