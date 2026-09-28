import { createContext, useContext, useState } from "react";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearAuth,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());

  const loginUser = (userData, authToken) => {
    saveToken(authToken);
    saveUser(userData);
    setTokenState(authToken);
    setUserState(userData);
  };

  const logoutUser = () => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  };

  const role = user?.role || user?.user_type || localStorage.getItem("userRole") || null;

  const isAdmin = role?.toLowerCase() === "admin";
  const isEmployee = role?.toLowerCase() === "employee";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAdmin,
        isEmployee,
        isAuthenticated: !!token,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};