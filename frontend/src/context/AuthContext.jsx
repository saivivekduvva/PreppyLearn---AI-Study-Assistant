import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let interceptor;
        if (token) {
            // Setup interceptor to attach token
            interceptor = apiClient.interceptors.request.use(config => {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            });

            setUser({ loggedIn: true }); // simplified
        } else {
            setUser(null);
        }
        
        setIsLoading(false);

        return () => {
            if (interceptor) {
                apiClient.interceptors.request.eject(interceptor);
            }
        };
    }, [token]);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        try {
            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem('token', access_token);
            setUser({ username });
            return true;
        } catch (error) {
            console.error("Login error", error);
            throw error;
        }
    };

    const register = async (username, password) => {
        try {
            await apiClient.post('/auth/register', { username, password });
            return await login(username, password);
        } catch (error) {
            console.error("Register error", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
