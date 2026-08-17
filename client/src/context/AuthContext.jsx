import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
      setNeedsVerification(data.user ? !data.user.isVerified : false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setNeedsVerification(false);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const data = await apiLogin(credentials);
    await checkAuth();
    return data;
  }

  async function register(userData) {
    const data = await apiRegister(userData);
    return data;
  }

  async function logout() {
    const data = await apiLogout();
    setUser(null);
    setNeedsVerification(false);
    return data;
  }

  async function refreshUser() {
    await checkAuth();
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    needsVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
