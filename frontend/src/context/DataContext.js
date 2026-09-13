import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { loadWorkspace } from '../services/workspaceService.js';
import { emptyWorkspace } from '../services/normalizers.js';
import { subscribeRefresh } from '../services/serviceUtils.js';
import { Button, LoadingSpinner } from '../components/common/UI.js';
const DataContext = createContext();
export function DataProvider({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const detailId = pathname.match(/^\/jobs\/([^/]+)$/)?.[1] || '';
  const identity = user?.id || 'public';
  const key = `${identity}:${detailId}`;
  const [state, setState] = useState({ key: '', data: emptyWorkspace(), error: '' });
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const version = ++sequence.current;
    try {
      const data = await loadWorkspace(
        user ? { id: identity, role: user.role } : null,
        detailId,
      );
      if (version === sequence.current) setState({ key, data, error: '' });
    } catch (error) {
      if (version === sequence.current)
        setState((previous) => ({
          key,
          data: previous.key === key ? previous.data : emptyWorkspace(),
          error: error.message,
        }));
    }
  }, [identity, user?.role, detailId, key]);
  useEffect(() => {
    reload();
    const unsubscribe = subscribeRefresh(reload);
    return () => {
      sequence.current += 1;
      unsubscribe();
    };
  }, [reload]);
  if (state.key !== key) return <LoadingSpinner />;
  if (state.error)
    return (
      <main className="container section">
        <h1>We couldn’t load your workspace</h1>
        <p role="alert">{state.error}</p>
        <Button onClick={reload}>Try again</Button>
      </main>
    );
  return (
    <DataContext.Provider value={{ ...state.data, reload }}>
      {children}
    </DataContext.Provider>
  );
}
export const useData = () => useContext(DataContext);
