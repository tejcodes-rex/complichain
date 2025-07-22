// === src/context/AuthContext.jsx ===

import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ username: payload.username, role: payload.role });
      } catch (err) {
        console.error("Invalid token", err);
        logout();
      }
    }
  }, []);

 
  const loginUser = async (username, password) => {
    const token = await apiLogin(username, password);
    const payload = JSON.parse(atob(token.split(".")[1]));

    setUser({ username: payload.username, role: payload.role });
    localStorage.setItem("token", token);
  };

  
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
