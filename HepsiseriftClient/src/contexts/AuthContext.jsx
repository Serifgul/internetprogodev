import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login, register, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is valid or expired
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken && isTokenValid(storedToken)) {
          setToken(storedToken);
          const userInfo = await getCurrentUser(storedToken);
          setCurrentUser(userInfo);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await register(userData);
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    user: currentUser,
    token,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.roles?.includes('Admin'),
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};