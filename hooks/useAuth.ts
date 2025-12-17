import { useState, useEffect, useCallback } from "react";
import { LoginPayload, RegisterPayload, user } from "../apiTypes/types"
import { loginApi, registerApi, logoutApi } from "../services/api/authApi";
import { getUser } from "../services/api/userApi";

export const useAuth = () => {
    const [user, setUser] = useState<user | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

      // Fetch logged-in user (if token exists)
  const loadUser = useCallback(async () => {
    try {
      const user = await getUser(Number(localStorage.getItem("user_id")));
      setUser(user.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) loadUser();
    else setLoading(false);
  }, [loadUser]);


  const login = async(payload: LoginPayload) => {
    try {
        setLoading(true);
        const response = await loginApi(payload);
        localStorage.setItem('ra_auth', 'true');
        localStorage.setItem("access_token", response.data.token);
        localStorage.setItem("user_id", response.data.id as any);
        setUser(response.data);
        setLoading(false);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        setError("Login failed. Please check your credentials.");
        setLoading(false);
    }
  };

   const register = async (payload: RegisterPayload) => {
    try {
        setLoading(true);
        const data = await registerApi(payload);
        setLoading(false);
        return data;
    } catch (error) {
        console.error("Registration error:", error);
        setError("Registration failed. Please try again.");
        setLoading(false);
    }
   };

    const logout = async () => {
        try {
             setLoading(true);
             const userId = localStorage.getItem("user_id");
             await logoutApi(Number(userId));
             localStorage.removeItem('ra_auth');
             localStorage.removeItem("access_token");
             localStorage.removeItem("user_id");
             setUser(null);
             window.location.href = "/";
             setLoading(false);
        } catch (error) {
            console.error("Logout error:", error);
            setError("Logout failed. Please try again.");
            setLoading(false);
        }
    };

    return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    };
};