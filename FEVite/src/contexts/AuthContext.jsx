import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load user from localStorage on mount
  useEffect(() => {
    const verifyAndLoadUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken && storedUser !== "undefined") {
          // Parse stored user first
          const parsedUser = JSON.parse(storedUser);

          // Verify token với backend
          try {
            const response = await authAPI.verifyToken();

            if (response.data.success) {
              // Token valid, user còn active
              const verifiedUser = response.data.data;
              setUser(verifiedUser);
              setToken(storedToken);

              // Update localStorage với data mới nhất từ server
              localStorage.setItem("user", JSON.stringify(verifiedUser));

              console.log("✅ Token verified, user is active:", verifiedUser);
            }
          } catch (error) {
            console.error("❌ Token verification failed:", error);

            // Kiểm tra error code
            const errorCode = error.response?.data?.code;

            if (errorCode === "USER_NOT_FOUND") {
              console.warn("⚠️  User account has been deleted");
              // Clear invalid token/user
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
              setToken(null);
            } else if (errorCode === "ACCOUNT_DEACTIVATED") {
              console.warn("⚠️  User account has been deactivated");
              // Clear invalid token/user
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
              setToken(null);
            } else if (errorCode === "ROLE_MISMATCH") {
              console.warn("⚠️  User role has changed");
              // Clear invalid token/user
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
              setToken(null);
            } else {
              // Network error hoặc server down -> load từ localStorage
              console.warn(
                "⚠️  Cannot verify token (server may be down), using cached user"
              );
              setUser(parsedUser);
              setToken(storedToken);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log("🔐 Login attempt with:", credentials);
      const response = await authAPI.signin(credentials);
      console.log("✅ Login response:", response.data);

      const { token, user } = response.data; // Backend returns token and user at top level

      if (!token || !user) {
        console.error("❌ Missing token or user in response:", response.data);
        return {
          success: false,
          message: "Server response invalid",
        };
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);

      console.log("✅ Login successful, user:", user);
      return { success: true, user };
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { token, user } = response.data; // Backend returns token and user at top level

      if (!token || !user) {
        return {
          success: false,
          message: "Server response invalid",
        };
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Refresh user data from server (useful after money transactions)
  const refreshUser = async () => {
    try {
      const response = await authAPI.verifyToken();
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: "Failed to refresh user" };
    } catch (error) {
      console.error("Refresh user error:", error);
      return { success: false, message: error.response?.data?.message || "Failed to refresh user" };
    }
  };

  const isAuthenticated = !!token && !!user;
  const userRole = user?.role;

  const value = {
    user,
    token,
    isAuthenticated,
    userRole,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
