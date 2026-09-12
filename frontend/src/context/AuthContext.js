import { createContext, useContext, useState } from "react";
import { useData } from "./DataContext";
import { authService } from "../services/authService";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const data = useData();
  const [userId, setUserId] = useState(
    () =>
      localStorage.getItem("interntrack.session") ||
      sessionStorage.getItem("interntrack.session"),
  );
  const user = data.users.find((u) => u.id === userId) || null;
  const establish = (u, remember = true) => {
    localStorage.removeItem("interntrack.session");
    sessionStorage.removeItem("interntrack.session");
    (remember ? localStorage : sessionStorage).setItem(
      "interntrack.session",
      u.id,
    );
    setUserId(u.id);
    return u;
  };
  const login = async (values) =>
    establish(await authService.login(values), values.remember);
  const demo = async (role) => establish(await authService.demo(role));
  const register = async (values) =>
    establish(await authService.register(values));
  const logout = () => {
    localStorage.removeItem("interntrack.session");
    sessionStorage.removeItem("interntrack.session");
    setUserId(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        login,
        demo,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
