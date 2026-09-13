import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService.js';
import { session } from '../services/session.js';
import { normalizeUser } from '../services/normalizers.js';
import { subscribeRefresh } from '../services/serviceUtils.js';
import { Button, LoadingSpinner } from '../components/common/UI.js';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const restore = useCallback(async () => {
    try {
      if (session.token()) {
        const result = await authService.me();
        setUser(normalizeUser(result.user, result.profile));
      } else setUser(null);
      setError('');
    } catch (failure) {
      if (failure.status !== 401) setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Remove records from the retired local-only implementation.
    localStorage.removeItem('interntrack.data.v1');
    localStorage.removeItem('interntrack.session');
    sessionStorage.removeItem('interntrack.session');
    restore();
    const clear = () => {
      setUser(null);
      setError('');
    };
    window.addEventListener('interntrack:unauthorized', clear);
    const unsubscribe = subscribeRefresh(restore);
    return () => {
      unsubscribe();
      window.removeEventListener('interntrack:unauthorized', clear);
    };
  }, [restore]);
  const establish = (result, remember = true) => {
    session.save(result.token, remember);
    const account = normalizeUser(result.user, result.profile);
    setUser(account);
    return account;
  };
  const login = async (values) =>
    establish(await authService.login(values), values.remember);
  const register = async (values) => establish(await authService.register(values));
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      session.clear();
      setUser(null);
    }
  };
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <main className="container section">
        <h1>We couldn’t restore your session</h1>
        <p role="alert">{error}</p>
        <Button onClick={restore}>Retry</Button>
        <Button
          variant="secondary"
          onClick={() => {
            session.clear();
            setUser(null);
            setError('');
          }}
        >
          Return to sign in
        </Button>
      </main>
    );
  return (
    <AuthContext.Provider
      value={{ user, role: user?.role, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
