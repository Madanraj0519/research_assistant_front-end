import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginPayload, RegisterPayload, user } from '../apiTypes/types';
import { loginApi, registerApi, logoutApi } from '../services/api/authApi';
import { getUser } from '../services/api/userApi';

interface AuthContextType {
    user: user | null;
    userId: number | null;
    loading: boolean;
    error: string | null;
    login: (payload: LoginPayload) => Promise<user | undefined>;
    register: (payload: RegisterPayload) => Promise<any>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<user | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch logged-in user (if token exists)
    const loadUser = useCallback(async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await getUser(Number(userId));
            setUser(response.data);
        } catch (err) {
            console.error('Error loading user:', err);
            setUser(null);
            // Clear invalid tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('ra_auth');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [loadUser]);

    const login = async (payload: LoginPayload): Promise<user | undefined> => {
        try {
            setLoading(true);
            setError(null);

            const response = await loginApi(payload);

            // Store authentication data
            localStorage.setItem('ra_auth', 'true');
            localStorage.setItem('access_token', response.data.token);
            localStorage.setItem('user_id', response.data.id.toString());

            // Set user in context
            setUser(response.data);

            return response.data;
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err?.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (payload: RegisterPayload) => {
        try {
            setLoading(true);
            setError(null);

            const data = await registerApi(payload);

            return data;
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorMessage = err?.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            const userId = localStorage.getItem('user_id');
            if (userId) {
                await logoutApi(Number(userId));
            }

            // Clear all authentication data
            localStorage.removeItem('ra_auth');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');

            // Clear user from context
            setUser(null);

            // Redirect to login
            window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err);
            setError('Logout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        userId: user?.id || null,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
