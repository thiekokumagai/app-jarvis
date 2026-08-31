import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  organizations?: Array<{
    role: string;
    organization: {
      id: string;
      name: string;
    };
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, orgName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('jarvis_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchWithAuth('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao realizar login');
    }
    localStorage.setItem('jarvis_token', data.tokens.accessToken);
    localStorage.setItem('jarvis_refresh_token', data.tokens.refreshToken);
    setUser(data.user);
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string, organizationName?: string) => {
    const res = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, organizationName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao registrar conta');
    }
    localStorage.setItem('jarvis_token', data.tokens.accessToken);
    localStorage.setItem('jarvis_refresh_token', data.tokens.refreshToken);
    setUser(data.user);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('jarvis_token');
    localStorage.removeItem('jarvis_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
