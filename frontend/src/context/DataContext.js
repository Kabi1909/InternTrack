import { createContext, useContext, useEffect, useState } from 'react';
import { readStore } from '../services/mockStore';
const DataContext = createContext();
export function DataProvider({ children }) {
  const [data, setData] = useState(() => structuredClone(readStore()));
  useEffect(() => {
    const update = () => setData(structuredClone(readStore()));
    window.addEventListener('interntrack:change', update);
    return () => window.removeEventListener('interntrack:change', update);
  }, []);
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
export const useData = () => useContext(DataContext);
