import React, { createContext, useState, useContext } from "react";

// Create a Context to manage Auth
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app and manage global state
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(""); // Token will be stored here

  const login = (authToken) => setToken(authToken); // Set token on login
  const logout = () => setToken(""); // Clear token on logout

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
