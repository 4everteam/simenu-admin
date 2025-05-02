import { useEffect, useState, useCallback } from "react";
import { isLoggedIn } from "../fetch/auth";

// Define types for better type safety
interface AuthState {
  role: string | null;
  isLoggedIn: boolean | null;
  isLoading: boolean;
  error: string | null;
}

interface UserData {
  token: string;
  user: {
    role?: string;
    [key: string]: any;
  };
}

const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    role: null,
    isLoggedIn: null,
    isLoading: true,
    error: null
  });

  // Safely parse user data with error handling
  const getUserData = useCallback((): UserData | null => {
    try {
      const userDataString = localStorage.getItem('user_data');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  // Extract error messages from various error formats
  const extractErrorMessages = useCallback((errors: any): string[] => {
    const messages: string[] = [];
    
    if (Array.isArray(errors)) {
      errors.forEach((err: { field?: string; message?: string }) => {
        if (err.message) {
          messages.push(err.message);
        }
      });
    } else if (typeof errors === 'object' && errors !== null) {
      Object.values(errors).forEach((message) => {
        if (typeof message === 'string') {
          messages.push(message);
        }
      });
    } else if (typeof errors === 'string') {
      messages.push(errors);
    }
    
    return messages;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const userData = getUserData();
        
        if (!userData) {
          if (isMounted) {
            setAuthState({
              role: 'Guest',
              isLoggedIn: false,
              isLoading: false,
              error: null
            });
          }
          return;
        }
        
        const response = await isLoggedIn();
        
        if (!isMounted) return;
        
        if (response && typeof response === 'object' && 'errors' in response) {
          const errorMessages = extractErrorMessages(response.errors);
          console.error('Authentication errors:', errorMessages);
          
          setAuthState({
            role: 'Guest',
            isLoggedIn: false,
            isLoading: false,
            error: errorMessages.join(', ')
          });
        } else if (
          response && 
          typeof response === 'object' && 
          'token' in response && 
          'isLoggedIn' in response && 
          'role' in response
        ) {
          if (response.role !== 'Admin') {
            setAuthState({
              role: 'Guest',
              isLoggedIn: false,
              isLoading: false,
              error: 'Unauthorized role'
            });
          } else {
            setAuthState({
              role: response.role,
              isLoggedIn: true,
              isLoading: false,
              error: null
            });
          }
        } else {
          setAuthState({
            role: 'Guest',
            isLoggedIn: false,
            isLoading: false,
            error: 'Invalid response format'
          });
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = `Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error(errorMessage);
        
        setAuthState({
          role: 'Guest',
          isLoggedIn: false,
          isLoading: false,
          error: errorMessage
        });
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [getUserData, extractErrorMessages]);

  return authState;
};

export default useAuth;