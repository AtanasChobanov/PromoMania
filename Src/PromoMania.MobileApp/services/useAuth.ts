import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Types
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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  validatePassword: (password: string) => string | null;
}

const API_URL = 'https://pricepal-9scz.onrender.com';
const TOKEN_KEY = '@pricepal_token';
const USER_KEY = '@pricepal_user';

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          user,
          accessToken: token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthData = async (data: AuthResponse) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Паролата трябва да е поне 8 символа';
    }
    if (password.length > 128) {
      return 'Паролата не трябва да надвишава 128 символа';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Паролата трябва да съдържа поне една главна буква';
    }
    if (!/[a-z]/.test(password)) {
      return 'Паролата трябва да съдържа поне една малка буква';
    }
    if (!/[0-9]/.test(password)) {
      return 'Паролата трябва да съдържа поне една цифра';
    }
    if (!/[!@#$%^&*()\-_=+[\]{};:'"\|,.<>/?]/.test(password)) {
      return 'Паролата трябва да съдържа поне един специален символ (!@#$%^&*()-_=+[]{};:\'"|,.<>/?)';
    }
    return null;
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const authData: AuthResponse = await response.json();
      await saveAuthData(authData);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const authData: AuthResponse = await response.json();
      await saveAuthData(authData);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      
      setAuthState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  };

  return {
    user: authState.user,
    accessToken: authState.accessToken,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    register,
    login,
    logout,
    validatePassword,
  };
};