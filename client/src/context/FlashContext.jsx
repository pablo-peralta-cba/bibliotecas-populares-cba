import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setFlashHandlers } from '../api/client';

const FlashContext = createContext(null);

export function FlashProvider({ children }) {
  const [success, setSuccess] = useState([]);
  const [error, setError] = useState([]);

  const showSuccess = useCallback((message) => {
    setSuccess((prev) => [...prev, message]);
    setTimeout(() => {
      setSuccess((prev) => prev.slice(1));
    }, 5000);
  }, []);

  const showError = useCallback((message) => {
    setError((prev) => [...prev, message]);
    setTimeout(() => {
      setError((prev) => prev.slice(1));
    }, 5000);
  }, []);

  const clearFlash = useCallback(() => {
    setSuccess([]);
    setError([]);
  }, []);

  // Wire flash handlers to API client on mount
  useEffect(() => {
    setFlashHandlers({ showSuccess, showError });
  }, [showSuccess, showError]);

  const value = {
    success,
    error,
    showSuccess,
    showError,
    clearFlash,
  };

  return (
    <FlashContext.Provider value={value}>
      {children}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error('useFlash must be used within a FlashProvider');
  }
  return context;
}

export default FlashContext;
