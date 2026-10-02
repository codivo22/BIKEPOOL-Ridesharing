import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bikepool_token');
    if (!token) { setLoading(false); return; }
    client.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('bikepool_token')).finally(() => setLoading(false));
  }, []);

  const signIn = ({ token, user: signedInUser }) => {
    localStorage.setItem('bikepool_token', token);
    sessionStorage.setItem('bikepool_welcome_name', signedInUser.name);
    setUser(signedInUser);
  };
  const signOut = () => { localStorage.removeItem('bikepool_token'); setUser(null); };
  const value = useMemo(() => ({ user, setUser, loading, signIn, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
