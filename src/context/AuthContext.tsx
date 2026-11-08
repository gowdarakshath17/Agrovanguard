import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

export interface AppAuthUser {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  getIdToken?: () => Promise<string>;
}

interface AuthContextType {
  user: User | AppAuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  setAppSession: (token: string, user: AppAuthUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  getToken: async () => null,
  setAppSession: () => {},
});

const TOKEN_KEY = 'cropsentinel_auth_token';
const USER_KEY = 'cropsentinel_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AppAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local app session first
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    // 2. Subscribe to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Clear local token if Firebase user is active
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else if (!localStorage.getItem(TOKEN_KEY)) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAppSession = (token: string, appUser: AppAuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(appUser));
    setUser(appUser);
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  const getToken = async () => {
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;
    if (user && 'getIdToken' in user && typeof (user as any).getIdToken === 'function') {
      return await (user as any).getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, getToken, setAppSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

