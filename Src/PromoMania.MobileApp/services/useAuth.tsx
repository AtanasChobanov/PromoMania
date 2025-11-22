import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// --- Types ---
interface User {
  publicId: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarding: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  finishOnboarding: () => void;
  validatePassword: (password: string) => string | null;
}

const API_URL = 'https://pricepal-9scz.onrender.com';
const TOKEN_KEY = '@pricepal_token';
const USER_KEY = '@pricepal_user';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// --- 1. The Provider (PURE DATA ONLY) ---
// This component will NOT re-render on route changes anymore.
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);

      if (token && userJson) {
        setUser(JSON.parse(userJson));
        setAccessToken(token);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (data: AuthResponse) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    setIsLoading(true);
    setIsOnboarding(false);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const authData: AuthResponse = await response.json();
      await saveAuthData(authData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setIsOnboarding(true); // Trigger onboarding flow
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setIsOnboarding(false);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const authData: AuthResponse = await response.json();
      await saveAuthData(authData);
    } catch (error) {
      setIsOnboarding(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
      setAccessToken(null);
      setIsOnboarding(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  };

  const finishOnboarding = () => {
    setIsOnboarding(false);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Паролата трябва да е поне 8 символа';
    if (!/[A-Z]/.test(password)) return 'Паролата трябва да съдържа поне една главна буква';
    if (!/[a-z]/.test(password)) return 'Паролата трябва да съдържа поне една малка буква';
    if (!/[0-9]/.test(password)) return 'Паролата трябва да съдържа поне една цифра';
    return null;
  };

  // --- MEMOIZATION (Critical for performance) ---
  const contextValue = useMemo(() => ({
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    isOnboarding,
    register,
    login,
    logout,
    finishOnboarding,
    validatePassword,
  }), [user, accessToken, isLoading, isOnboarding]); 
  // Only re-render consumers when these specific values change

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// --- 2. The Guard (NAVIGATION LOGIC ONLY) ---
// This component listens to route changes. It sits INSIDE the provider.
export function AuthGuard({ children }: PropsWithChildren) {
  const { user, isLoading, isOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(login)';
    const isOptionsPage = segments[1] === 'optionsRegister';

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/(login)');
    } else if (user) {
      if (isOnboarding) {
        // Force Onboarding
        if (!isOptionsPage) {
          router.replace('/(login)/optionsRegister');
        }
      } else {
        // Regular User -> Force Home if in auth group
        if (inAuthGroup) {
          router.replace('/(tabs)/home');
        }
      }
    }
  }, [user, segments, isLoading, isOnboarding]);

  return <>{children}</>;
}

export const useAuth = () => useContext(AuthContext);